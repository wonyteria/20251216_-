
import React, { useState, useRef, useEffect } from 'react';
import { AnyItem, User } from '../types';
import Card from '../components/Card';
import { Trophy, Heart, FolderOpen, Briefcase, DollarSign, Wallet, CheckCircle2, Plus, MapPin, X, ArrowRight, UserPlus, FileText, BadgeCheck, Image as ImageIcon, Trash2, PlusCircle, AlertTriangle, MessageCircle, AlertCircle, Lock, Smile, Star, CreditCard, Zap } from 'lucide-react';
import { db } from '../services/mockDb';

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

  useEffect(() => {
    setAllItems(db.getItems());
    setBannerImg(db.getMyPageBanner());
    setCommissionRate(db.getCommissionRate());
  }, []);

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
  const myCreatedItems = currentUser ? db.getMyCreatedItems(currentUser.email) : [];
  
  const calculateSettlement = () => {
      let totalSales = 0;
      let totalFees = 0;
      let netProfit = 0;
      let feesToPay = 0;
      let payoutToReceive = 0;
      let blockedByFee = false;

      myCreatedItems.forEach(item => {
          const rawPrice = item.price ? parseInt(item.price.replace(/[^0-9]/g, '')) : 0;
          const salesCount = item.categoryType === 'networking' ? (item.currentParticipants || 0) : 
                             item.categoryType === 'crew' ? (item.purchaseCount || 0) : 0;
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

  const CreateContentModal = () => {
      const [category, setCategory] = useState<'crew' | 'networking' | 'lecture' | 'minddate'>('crew');
      const [title, setTitle] = useState('');
      const [desc, setDesc] = useState('');
      const [imgPreview, setImgPreview] = useState<string>('');
      const [priceRaw, setPriceRaw] = useState('');
      const [selectedDate, setSelectedDate] = useState('');
      const [selectedTime, setSelectedTime] = useState('');
      const [loc, setLoc] = useState('[라임스퀘어] 서울특별시 강남구 역삼로5길 5 지하1층');
      const [dynamicList, setDynamicList] = useState<string[]>(['']);
      const fileInputRef = useRef<HTMLInputElement>(null);

      const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setImgPreview(reader.result as string);
              reader.readAsDataURL(file);
          }
      };

      const handleSubmit = () => {
          if(!title || !priceRaw || !selectedDate) { showToast("필수 정보를 입력해주세요.", "error"); return; }
          const newItem: any = {
              id: Date.now(),
              categoryType: category,
              title, desc, img: imgPreview || "https://images.unsplash.com/photo-1557683316-973673baf926?w=800",
              status: 'open',
              date: `${selectedDate} ${selectedTime}`,
              price: `${Number(priceRaw).toLocaleString()}원`,
              loc,
              author: currentUser?.name || '익명',
              hostEmail: currentUser?.email,
              level: '입문', type: category === 'networking' ? 'study' : 'recruit'
          };
          db.updateItem(newItem);
          setAllItems(db.getItems()); // Refresh
          showToast("콘텐츠가 성공적으로 등록되었습니다!", "success");
          setIsCreating(false);
      };

      return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCreating(false)}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
                <h3 className="text-xl font-bold dark:text-white mb-4">콘텐츠 만들기</h3>
                <div className="space-y-4">
                    <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700">
                        <option value="crew">임장 크루</option>
                        <option value="networking">네트워킹</option>
                        <option value="lecture">강의</option>
                    </select>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                    <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="설명" className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                    <input type="number" value={priceRaw} onChange={(e) => setPriceRaw(e.target.value)} placeholder="가격(원)" className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                    <div className="flex gap-2">
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                        <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                    </div>
                    <div className="border-2 border-dashed p-4 text-center cursor-pointer dark:border-slate-700" onClick={() => fileInputRef.current?.click()}>
                        {imgPreview ? <img src={imgPreview} className="h-32 mx-auto object-cover"/> : <span className="text-slate-500">이미지 업로드</span>}
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} />
                    </div>
                    <button onClick={handleSubmit} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">등록하기</button>
                </div>
            </div>
        </div>
      );
  };

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
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl shadow-inner border-4 border-white dark:border-slate-700 mb-3 relative">
                    {currentUser ? <img src={currentUser.avatar} className="w-full h-full rounded-full" /> : icon}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 shadow-md">{level}</div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{currentUser ? currentUser.name : '비회원'}</h2>
                <div className="flex flex-col items-center md:items-start">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{rankName} 단계</p>
                    {hasPartnerRole && <span className="mt-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-full flex items-center gap-1"><BadgeCheck size={10}/> 파트너(호스트)</span>}
                </div>
            </div>
            <div className="flex-1 w-full">
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl"><p className="text-xs text-slate-400 mb-1">총 경험치</p><p className="text-lg font-black text-slate-800 dark:text-white">{totalXP} XP</p></div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl cursor-pointer" onClick={() => setActiveTab('liked')}><p className="text-xs text-slate-400 mb-1">찜한 목록</p><p className="text-lg font-black text-pink-500">{likedItems.length}</p></div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl cursor-pointer" onClick={() => setActiveTab('applied')}><p className="text-xs text-slate-400 mb-1">내 서재</p><p className="text-lg font-black text-indigo-500 dark:text-indigo-400">{myLibraryItems.length}</p></div>
                </div>
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between"><div className="flex items-center gap-2"><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40"><Trophy size={12} className="inline mr-1 mb-0.5"/> Level Up</span><button onClick={() => setShowLevelBenefits(true)} className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 underline flex items-center gap-0.5"><Zap size={10}/> 등급별 혜택 보기</button></div><div className="text-right"><span className="text-xs font-semibold inline-block text-indigo-600 dark:text-indigo-400">{nextRankName}까지 {maxXP - totalXP} XP 남음</span></div></div>
                    <div className="overflow-hidden h-3 mb-2 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800"><div style={{ width: `${progressPercent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-purple-500 relative"></div></div>
                </div>
            </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 sticky top-0 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur z-20 pt-4">
        {['liked', 'applied', 'partner'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-3 font-bold text-sm relative ${activeTab === tab ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                {tab === 'liked' ? '찜한 목록' : tab === 'applied' ? '내 서재' : '파트너 센터'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {myLibraryItems.map((item, index) => <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8"><Card item={item} onClick={() => onItemClick(item)} isLiked={likedIds.includes(item.id)} onToggleLike={() => toggleLike(item.id)} /></div>)}
                {myLibraryItems.length === 0 && <div className="col-span-full py-24 text-center"><p className="text-slate-400">내 서재가 비어있습니다.</p></div>}
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
                                <button onClick={handleCreateClick} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Plus size={16}/> 만들기</button>
                            </div>
                            <table className="w-full text-left">
                                <thead><tr className="text-slate-500 text-xs uppercase"><th className="p-4">콘텐츠</th><th className="p-4 text-right">매출</th></tr></thead>
                                <tbody>
                                    {myCreatedItems.map(item => {
                                        const salesCount = item.categoryType === 'networking' ? ((item as any).currentParticipants || 0) : ((item as any).purchaseCount || 0);
                                        return (
                                            <tr key={item.id} className="border-t dark:border-slate-800">
                                                <td className="p-4"><p className="font-bold text-sm dark:text-white">{item.title}</p></td>
                                                <td className="p-4 text-right text-sm font-bold dark:text-white">{(parseInt(item.price?.replace(/[^0-9]/g, '')||'0') * salesCount).toLocaleString()}원</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                     </div>
                 )}
            </div>
        )}
      </div>

      {isCreating && <CreateContentModal />}
      {isApplying && <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"><div className="bg-white p-8 rounded-2xl"><h3 className="font-bold mb-4">파트너 신청</h3><button onClick={() => {onUpdateUser({...currentUser!, roles: [...currentUser!.roles, 'crew_manager']}); setIsApplying(false); showToast("승인되었습니다!", "success");}} className="bg-indigo-600 text-white px-6 py-2 rounded">승인 시뮬레이션</button></div></div>}
    </div>
  );
};
export default MyPage;
