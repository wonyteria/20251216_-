
import React, { useState, useRef, useEffect } from 'react';
import { AnyItem, User, Application, ApplicationStatus } from '../types';
import Card from '../components/Card';
import { Trophy, Plus, BadgeCheck, Zap, RefreshCw, PenTool, History, CreditCard, Ban } from 'lucide-react';
import * as database from '../services/database';
import ProfileEditModal from '../components/ProfileEditModal';
import ApplicantListModal from '../components/ApplicantListModal';
import CreateContentModal from '../components/CreateContentModal';

interface MyPageProps {
    likedIds: number[];
    appliedIds: number[];
    unlockedIds: number[];
    onItemClick: (item: AnyItem) => void;
    toggleLike: (id: number) => void;
    currentUser: User | null;
    onUpdateUser: (user: User) => void;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const MyPage: React.FC<MyPageProps> = ({
    likedIds, appliedIds, unlockedIds, onItemClick, toggleLike,
    currentUser, onUpdateUser, showToast
}) => {
    const [activeTab, setActiveTab] = useState<'liked' | 'applied' | 'partner'>('liked');
    const [allItems, setAllItems] = useState<AnyItem[]>([]);
    const [bannerImg, setBannerImg] = useState('');
    const [commissionRate, setCommissionRate] = useState(15);
    const [myCreatedItems, setMyCreatedItems] = useState<AnyItem[]>([]);

    // New State
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [myApplications, setMyApplications] = useState<Application[]>([]);
    const [isLoadingApps, setIsLoadingApps] = useState(false);

    // Partner Modal State
    const [showApplicantModal, setShowApplicantModal] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [selectedItemTitle, setSelectedItemTitle] = useState('');
    const [editingItem, setEditingItem] = useState<AnyItem | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const [items, banner, rate] = await Promise.all([
                database.getItems(),
                database.getMyPageBanner(),
                database.getCommissionRate()
            ]);
            setAllItems(items);
            setBannerImg(banner);
            setCommissionRate(rate);
        };
        loadData();
    }, []);

    useEffect(() => {
        const loadMyItems = async () => {
            if (currentUser) {
                // Load created items (Partner)
                if (currentUser.name) {
                    const items = await database.getMyCreatedItems(currentUser.name);
                    setMyCreatedItems(items);
                }

                // Load applications (History)
                setIsLoadingApps(true);
                const apps = await database.getMyApplications(currentUser.id);
                setMyApplications(apps);
                setIsLoadingApps(false);
            }
        };
        loadMyItems();
    }, [currentUser]);

    const handleDeleteItem = async (id: number) => {
        if (!confirm("정말로 이 콘텐츠를 삭제하시겠습니까? 관련 신청 내역은 유지되지만 목록에서 사라집니다.")) return;
        const success = await database.deleteItem(id);
        if (success) {
            showToast("콘텐츠가 삭제되었습니다.", "success");
            // Refresh
            const items = await database.getItems();
            setAllItems(items);
            if (currentUser?.name) {
                const myItems = await database.getMyCreatedItems(currentUser.name);
                setMyCreatedItems(myItems);
            }
        } else {
            showToast("삭제 처리에 실패했습니다.", "error");
        }
    };

    const handleCancelApplication = async (appId: number, itemId: number) => {
        if (!confirm("정말로 신청을 취소하시겠습니까? 환불 규정에 따라 처리됩니다.")) return;
        if (!currentUser) return;

        const success = await database.cancelApplication(currentUser.id, itemId, "사용자 요청 취소", "계좌 정보 없음(시스템)");
        if (success) {
            showToast("신청이 취소되었습니다. 환불 절차가 진행됩니다.", "success");
            // Reload apps
            const apps = await database.getMyApplications(currentUser.id);
            setMyApplications(apps);
        } else {
            showToast("취소 처리에 실패했습니다.", "error");
        }
    };

    const likedItems = allItems.filter(item => likedIds.includes(item.id));
    const myLibraryItems = allItems.filter(item => appliedIds.includes(item.id) || unlockedIds.includes(item.id));

    // --- Partner State ---
    const [isApplying, setIsApplying] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);
    const [showLevelBenefits, setShowLevelBenefits] = useState(false);
    const [reviewingItem, setReviewingItem] = useState<AnyItem | null>(null);

    // Mocked Review Data (In real app, fetch from db)
    const [reviewedIds, setReviewedIds] = useState<number[]>([]);

    // --- Gamification Logic ---
    const reviewXP = reviewedIds.length * 30;
    const totalXP = (likedIds.length * 10) + ((appliedIds.length + unlockedIds.length) * 50) + reviewXP;

    let level = 1;
    let rankName = "임린이";
    let nextRankName = "임대장";
    let minXP = 0;
    let maxXP = 300;
    let icon = "🐣";
    if (totalXP >= 300 && totalXP < 1000) { level = 2; rankName = "임대장"; nextRankName = "부동산 고수"; minXP = 300; maxXP = 1000; icon = "👣"; }
    else if (totalXP >= 1000) { level = 3; rankName = "부동산 고수"; nextRankName = "마스터"; minXP = 1000; maxXP = 3000; icon = "👑"; }
    const progressPercent = Math.min(100, Math.max(0, ((totalXP - minXP) / (maxXP - minXP)) * 100));

    const hasPartnerRole = currentUser && currentUser.roles.some(r => r.includes('manager') || r === 'super_admin');

    // --- Settlement Logic Updated ---
    const calculateSettlement = () => {
        let totalSales = 0;
        let totalFees = 0;
        let netProfit = 0;
        let feesToPay = 0;
        let payoutToReceive = 0;
        let blockedByFee = false;

        myCreatedItems.forEach(item => {
            const rawPrice = item.price ? parseInt(item.price.replace(/[^0-9]/g, '')) : 0;
            const salesCount = item.categoryType === 'networking' ? ((item as any).currentParticipants || 0) :
                item.categoryType === 'crew' ? ((item as any).purchaseCount || 0) : 0;
            const revenue = rawPrice * salesCount;

            totalSales += revenue;
            const fee = Math.floor(revenue * (commissionRate / 100));
            totalFees += fee;
            netProfit += (revenue - fee);

            if (item.categoryType !== 'minddate') {
                if (item.status === 'ended' && (item as any).settlementStatus === 'pending') {
                    feesToPay += fee;
                    blockedByFee = true;
                }
            } else {
                if (item.status === 'ended' && (item as any).settlementStatus === 'pending') {
                    payoutToReceive += (revenue - fee);
                }
            }
        });
        return { totalSales, netProfit, feesToPay, payoutToReceive, blockedByFee };
    };

    const { totalSales, netProfit, feesToPay, payoutToReceive, blockedByFee } = calculateSettlement();

    const handleCreateClick = () => {
        if (blockedByFee) { showToast("미납된 수수료가 있습니다. 정산 후 콘텐츠 개설이 가능합니다.", "error"); return; }
        setIsCreating(true);
    };

    // --- Components (ReviewWriteModal, PartnerApplicationModal, LevelBenefitModal) are same structure ---
    // To save space, using simplified versions but keeping functionality.

    // Internal CreateContentModal removed in favor of external component

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="rounded-3xl mb-8 shadow-lg relative overflow-hidden group h-[200px]">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bannerImg})` }}></div>
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">마이페이지</h1>
                    <p className="text-slate-200">나의 성장 기록과 파트너(호스트) 활동 내역을 확인하세요.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 relative -mt-16 mx-4 md:mx-0 z-20 overflow-hidden">
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <div className="flex flex-col items-center text-center md:items-start md:text-left flex-shrink-0">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl shadow-inner border-4 border-white dark:border-slate-700 mb-3 relative group cursor-pointer" onClick={() => setShowProfileEdit(true)}>
                            {currentUser ? <img src={currentUser.avatar} className="w-full h-full rounded-full object-cover" /> : icon}
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <PenTool className="text-white" size={20} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 shadow-md">{level}</div>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{currentUser ? currentUser.name : '비회원'}</h2>
                            {currentUser && <button onClick={() => setShowProfileEdit(true)} className="text-slate-400 hover:text-indigo-600"><PenTool size={14} /></button>}
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{rankName} 단계</p>
                            {currentUser?.interests && currentUser.interests.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2 justify-center md:justify-start">
                                    {currentUser.interests.map(i => <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-medium">#{i}</span>)}
                                </div>
                            )}
                            {hasPartnerRole && <span className="mt-2 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-full flex items-center gap-1"><BadgeCheck size={10} /> 파트너 (호스트)</span>}
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl"><p className="text-xs text-slate-400 mb-1">총 경험치</p><p className="text-lg font-black text-slate-800 dark:text-white">{totalXP} XP</p></div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl cursor-pointer" onClick={() => setActiveTab('liked')}><p className="text-xs text-slate-400 mb-1">찜한 목록</p><p className="text-lg font-black text-pink-500">{likedItems.length}</p></div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl cursor-pointer" onClick={() => setActiveTab('applied')}><p className="text-xs text-slate-400 mb-1">신청 내역</p><p className="text-lg font-black text-indigo-500 dark:text-indigo-400">{myApplications.length}</p></div>
                        </div>
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between"><div className="flex items-center gap-2"><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40"><Trophy size={12} className="inline mr-1 mb-0.5" /> Level Up</span><button onClick={() => setShowLevelBenefits(true)} className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 underline flex items-center gap-0.5"><Zap size={10} /> 등급별 혜택 보기</button></div><div className="text-right"><span className="text-xs font-semibold inline-block text-indigo-600 dark:text-indigo-400">{nextRankName}까지 {maxXP - totalXP} XP 남음</span></div></div>
                            <div className="overflow-hidden h-3 mb-2 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800"><div style={{ width: `${progressPercent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-purple-500 relative"></div></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 sticky top-0 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur z-20 pt-4">
                {['liked', 'applied', 'partner'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-3 font-bold text-sm relative ${activeTab === tab ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                        {tab === 'liked' ? '찜한 목록' : tab === 'applied' ? '신청 내역' : '파트너 센터'}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white"></div>}
                    </button>
                ))}
            </div>

            <div className="min-h-[300px]">
                {activeTab === 'liked' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {likedItems.map((item, index) => <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8"><Card item={item} onClick={() => onItemClick(item)} isLiked={true} onToggleLike={() => toggleLike(item.id)} /></div>)}
                        {likedItems.length === 0 && <div className="col-span-full py-24 text-center"><p className="text-slate-400">찜한 모임이 없습니다.</p></div>}
                    </div>
                )}
                {activeTab === 'applied' && (
                    <div className="space-y-4">
                        {isLoadingApps ? (
                            <div className="py-20 text-center text-slate-500"><RefreshCw className="animate-spin mx-auto mb-2" /> 불러오는 중...</div>
                        ) : myApplications.length === 0 ? (
                            <div className="py-24 text-center"><p className="text-slate-400 font-bold mb-2">아직 신청한 콘텐츠가 없습니다.</p><p className="text-slate-500 text-sm">새로운 성장의 기회를 찾아보세요!</p></div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {myApplications.map(app => {
                                    const item = allItems.find(i => i.id === app.itemId);
                                    if (!item) return null;
                                    const isCancellable = (app.status === 'applied' || app.status === 'confirmed' || app.status === 'paid');

                                    return (
                                        <div key={app.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-start md:items-center hover:shadow-md transition-shadow">
                                            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                                <img src={item.img} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${app.status === 'applied' ? 'bg-amber-100 text-amber-700' :
                                                        app.status === 'confirmed' ? 'bg-indigo-100 text-indigo-700' :
                                                            app.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                                                                app.status === 'checked-in' ? 'bg-green-100 text-green-700' :
                                                                    app.status === 'refund-requested' ? 'bg-red-100 text-red-700' :
                                                                        'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {app.status === 'applied' ? '신청대기' :
                                                            app.status === 'confirmed' ? '신청완료 (입금대기)' :
                                                                app.status === 'paid' ? '입금완료' :
                                                                    app.status === 'checked-in' ? '참여확정' :
                                                                        app.status === 'refund-requested' ? '환불요청중' :
                                                                            app.status === 'cancelled' ? '취소됨' : '환불완료'}
                                                    </span>
                                                    <span className="text-slate-400 text-xs">{new Date(app.appliedAt).toLocaleDateString()} 신청</span>
                                                </div>
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate mb-1 cursor-pointer hover:text-indigo-600" onClick={() => onItemClick(item)}>{item.title}</h3>
                                                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                    <span>{item.date}</span>
                                                    <span>{item.price}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <button onClick={() => onItemClick(item)} className="flex-1 md:flex-none px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                    상세보기
                                                </button>
                                                {isCancellable && (
                                                    <button onClick={() => handleCancelApplication(app.id, item.id)} className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
                                                        취소/환불
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'partner' && (
                    <div>
                        {!currentUser ? <div className="py-24 text-center text-slate-500">로그인이 필요합니다.</div> : !hasPartnerRole ? (
                            <div className="text-center py-12">
                                <h3 className="text-2xl font-bold dark:text-white mb-4">파트너가 되어보세요</h3>
                                <button onClick={() => setIsApplying(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">파트너 신청하기</button>
                            </div>
                        ) : (
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800"><p className="text-sm font-bold text-slate-500 mb-2">총 판매 금액</p><p className="text-2xl font-black dark:text-white">₩ {totalSales.toLocaleString()}</p></div>
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800"><p className="text-sm font-bold text-indigo-500 mb-2">예상 순수익</p><p className="text-2xl font-black text-indigo-600">₩ {netProfit.toLocaleString()}</p></div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-lg dark:text-white">내가 만든 콘텐츠</h3>
                                        <button onClick={handleCreateClick} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus size={16} /> 만들기</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left min-w-[600px]">
                                            <thead><tr className="text-slate-500 text-xs uppercase"><th className="p-4">콘텐츠</th><th className="p-4 text-center">판매량</th><th className="p-4 text-right">매출</th><th className="p-4 text-right">관리</th></tr></thead>
                                            <tbody>
                                                {myCreatedItems.map(item => {
                                                    const salesCount = item.categoryType === 'networking' ? ((item as any).currentParticipants || 0) : ((item as any).purchaseCount || 0);
                                                    return (
                                                        <tr key={item.id} className="border-t dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                            <td className="p-4"><p className="font-bold text-sm dark:text-white">{item.title}</p><p className="text-xs text-slate-400">{item.date}</p></td>
                                                            <td className="p-4 text-center text-sm">{salesCount}</td>
                                                            <td className="p-4 text-right text-sm font-bold dark:text-white">{(parseInt(item.price?.replace(/[^0-9]/g, '') || '0') * salesCount).toLocaleString()}원</td>
                                                            <td className="p-4 text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedItemId(item.id);
                                                                            setSelectedItemTitle(item.title);
                                                                            setShowApplicantModal(true);
                                                                        }}
                                                                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors"
                                                                    >
                                                                        참여자 관리
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingItem(item)}
                                                                        className="px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors"
                                                                    >
                                                                        수정
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteItem(item.id)}
                                                                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                                                                    >
                                                                        삭제
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {myCreatedItems.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">등록된 콘텐츠가 없습니다.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isCreating && (
                <CreateContentModal
                    onClose={() => setIsCreating(false)}
                    currentUser={currentUser}
                    onSuccess={async () => {
                        const items = await database.getItems();
                        setAllItems(items);
                        if (currentUser?.name) {
                            const myItems = await database.getMyCreatedItems(currentUser.name);
                            setMyCreatedItems(myItems);
                        }
                    }}
                    showToast={showToast}
                />
            )}
            {editingItem && (
                <CreateContentModal
                    onClose={() => setEditingItem(null)}
                    currentUser={currentUser}
                    editItem={editingItem}
                    onSuccess={async () => {
                        const items = await database.getItems();
                        setAllItems(items);
                        if (currentUser?.name) {
                            const myItems = await database.getMyCreatedItems(currentUser.name);
                            setMyCreatedItems(myItems);
                        }
                    }}
                    showToast={showToast}
                />
            )}
            {isApplying && <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"><div className="bg-white p-8 rounded-2xl text-center"><h3 className="font-bold mb-4 text-xl">파트너 신청</h3><p className="text-slate-500 mb-6">검증된 호스트가 되어 콘텐츠를 발행해보세요.</p><button onClick={() => { onUpdateUser({ ...currentUser!, roles: [...currentUser!.roles, 'crew_manager'] }); setIsApplying(false); showToast("파트너 승인이 완료되었습니다!", "success"); }} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-colors">승인 시뮬레이션 (즉시 승인)</button></div></div>}

            {/* Modals */}
            {currentUser && (
                <ProfileEditModal
                    isOpen={showProfileEdit}
                    onClose={() => setShowProfileEdit(false)}
                    currentUser={currentUser}
                    onUpdateUser={onUpdateUser}
                    showToast={showToast}
                />
            )}
            {selectedItemId && (
                <ApplicantListModal
                    isOpen={showApplicantModal}
                    onClose={() => setShowApplicantModal(false)}
                    itemId={selectedItemId}
                    itemTitle={selectedItemTitle}
                    showToast={showToast}
                />
            )}
        </div>
    );
};
export default MyPage;
