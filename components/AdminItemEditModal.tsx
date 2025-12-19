
import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Plus, Trash2, Calendar, MapPin, User, DollarSign, MessageSquare, Info, Upload, Loader2, Settings } from 'lucide-react';
import { AnyItem, NetworkingItem, MatchingItem, CrewItem, LectureItem } from '../types';
import { adminUpload } from '../services/storage';

interface AdminItemEditModalProps {
    item: AnyItem | null;
    onClose: () => void;
    onSave: (updatedItem: AnyItem) => Promise<void>;
}

const AdminItemEditModal: React.FC<AdminItemEditModalProps> = ({ item, onClose, onSave }) => {
    const [editedItem, setEditedItem] = useState<AnyItem | null>(null);
    const [activeSubTab, setActiveSubTab] = useState<'basic' | 'category' | 'host'>('basic');
    const [isUploading, setIsUploading] = useState<string | null>(null);

    useEffect(() => {
        if (item) {
            setEditedItem({ ...item });
        }
    }, [item]);

    if (!editedItem) return null;

    const handleChange = (field: keyof AnyItem | string, value: any) => {
        setEditedItem((prev) => {
            if (!prev) return null;
            return { ...prev, [field]: value } as AnyItem;
        });
    };

    const handleListChange = (field: string, index: number, value: string) => {
        setEditedItem((prev: any) => {
            const newList = [...(prev[field] || [])];
            newList[index] = value;
            return { ...prev, [field]: newList };
        });
    };

    const addListItem = (field: string) => {
        setEditedItem((prev: any) => ({
            ...prev,
            [field]: [...(prev[field] || []), '']
        }));
    };

    const removeListItem = (field: string, index: number) => {
        setEditedItem((prev: any) => ({
            ...prev,
            [field]: prev[field].filter((_: any, i: number) => i !== index)
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(field);
        const url = await adminUpload(file);
        if (url) {
            handleChange(field, url);
        }
        setIsUploading(null);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase tracking-tight">{editedItem.categoryType}</span>
                            <span className="text-[10px] font-bold text-slate-400">ID: {editedItem.id}</span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">콘텐츠 상세 편집</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={24} /></button>
                </div>

                {/* Sub Tabs */}
                <div className="flex px-8 border-b bg-white">
                    {[
                        { id: 'basic', label: '기본 정보', icon: Info },
                        { id: 'category', label: '특화 필드', icon: Settings },
                        { id: 'host', label: '호스트 정보', icon: User },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${activeSubTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
                    {activeSubTab === 'basic' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">콘텐츠 제목</label>
                                <input value={editedItem.title} onChange={e => handleChange('title', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">노출 가격 (문자열)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input value={editedItem.price || ''} onChange={e => handleChange('price', e.target.value)} placeholder="예: 25,000원" className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all" />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">상세 설명</label>
                                <textarea value={editedItem.desc} onChange={e => handleChange('desc', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-600 transition-all h-32 resize-none" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">대표 이미지</label>
                                <div className="flex gap-4">
                                    <div className="relative w-24 h-24 rounded-2xl bg-slate-100 border overflow-hidden group">
                                        <img src={editedItem.img} className="w-full h-full object-cover shadow-inner" />
                                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            {isUploading === 'img' ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" size={20} />}
                                            <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'img')} />
                                        </label>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input value={editedItem.img} onChange={e => handleChange('img', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-[10px] font-bold text-indigo-400 focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="이미지 URL 직접 입력" />
                                        <p className="text-[10px] text-slate-400 font-medium">* 클릭하여 직접 업로드하거나 URL을 수정하세요.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">진행 장소/지역</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input value={editedItem.loc || ''} onChange={e => handleChange('loc', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600 transition-all" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">진행 일시</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input value={editedItem.date || ''} onChange={e => handleChange('date', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600 transition-all" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">현재 상태</label>
                                <select value={editedItem.status} onChange={e => handleChange('status', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all appearance-none cursor-pointer text-center">
                                    <option value="open">모집 중 (OPEN)</option>
                                    <option value="closed">모집 마감 (CLOSED)</option>
                                    <option value="ended">진행 종료/후기 (ENDED)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'category' && (
                        <div className="space-y-8">
                            {editedItem.categoryType === 'networking' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">유형</label>
                                        <select value={(editedItem as NetworkingItem).type} onChange={e => handleChange('type', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600">
                                            <option value="study">스터디</option>
                                            <option value="social">사교/네트워킹</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">참여 인원 ({((editedItem as NetworkingItem).currentParticipants || 0)} / {(editedItem as NetworkingItem).maxParticipants})</label>
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="현재" value={(editedItem as NetworkingItem).currentParticipants} onChange={e => handleChange('currentParticipants', parseInt(e.target.value))} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-center" />
                                            <input type="number" placeholder="최대" value={(editedItem as NetworkingItem).maxParticipants} onChange={e => handleChange('maxParticipants', parseInt(e.target.value))} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-center" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">종료 시 등록 사진 (Group Photo)</label>
                                        <div className="flex gap-4">
                                            <div className="relative w-24 h-24 rounded-2xl bg-slate-100 border overflow-hidden group">
                                                {(editedItem as NetworkingItem).groupPhoto ? (
                                                    <img src={(editedItem as NetworkingItem).groupPhoto} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={24} /></div>
                                                )}
                                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    {isUploading === 'groupPhoto' ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" size={20} />}
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'groupPhoto')} />
                                                </label>
                                            </div>
                                            <input value={(editedItem as NetworkingItem).groupPhoto || ''} onChange={e => handleChange('groupPhoto', e.target.value)} className="flex-1 bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-bold text-indigo-400 focus:ring-2 focus:ring-indigo-600 transition-all font-mono" placeholder="이미지 URL 직접 입력" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">커리큘럼 (배열)</label>
                                        <div className="space-y-2">
                                            {((editedItem as NetworkingItem).curriculum || []).map((item, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input value={item} onChange={e => handleListChange('curriculum', idx, e.target.value)} className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm font-medium text-slate-700" />
                                                    <button onClick={() => removeListItem('curriculum', idx)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                            <button onClick={() => addListItem('curriculum')} className="flex items-center gap-2 text-indigo-600 text-xs font-black px-4 py-2 hover:bg-indigo-50 rounded-xl transition-all active:scale-95"><Plus size={14} /> 단계 추가</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {editedItem.categoryType === 'minddate' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">성비 설정 (남/여 %)</label>
                                        <div className="flex gap-2 items-center">
                                            <span className="text-xs font-bold text-blue-500">M</span>
                                            <input type="number" value={(editedItem as MatchingItem).genderRatio?.male} onChange={e => handleChange('genderRatio', { ...(editedItem as MatchingItem).genderRatio, male: parseInt(e.target.value) })} className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-center font-bold" />
                                            <span className="text-xs font-bold text-pink-500">F</span>
                                            <input type="number" value={(editedItem as MatchingItem).genderRatio?.female} onChange={e => handleChange('genderRatio', { ...(editedItem as MatchingItem).genderRatio, female: parseInt(e.target.value) })} className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-center font-bold" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">매칭 대상/조건</label>
                                        <div className="space-y-2">
                                            {((editedItem as MatchingItem).target || []).map((t, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input value={t} onChange={e => handleListChange('target', idx, e.target.value)} className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm font-medium" placeholder="예: 25~34세 미혼 남녀" />
                                                    <button onClick={() => removeListItem('target', idx)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                            <button onClick={() => addListItem('target')} className="flex items-center gap-2 text-indigo-600 text-xs font-black px-4 py-2 hover:bg-indigo-50 rounded-xl transition-all"><Plus size={14} /> 조건 추가</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {editedItem.categoryType === 'crew' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">난이도(Level)</label>
                                            <select value={(editedItem as CrewItem).level} onChange={e => handleChange('level', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600">
                                                <option value="입문">입문 - 이제 막 시작하신 분</option>
                                                <option value="중급">중급 - 투자를 앞두고 계신 분</option>
                                                <option value="실전">실전 - 포트폴리오 정리가 필요하신 분</option>
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">리더 프로필 이미지</label>
                                            <div className="flex gap-4">
                                                <div className="relative w-20 h-20 rounded-2xl bg-slate-100 border overflow-hidden group">
                                                    {(editedItem as CrewItem).leaderProfile ? (
                                                        <img src={(editedItem as CrewItem).leaderProfile} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={24} /></div>
                                                    )}
                                                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                        {isUploading === 'leaderProfile' ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" size={18} />}
                                                        <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'leaderProfile')} />
                                                    </label>
                                                </div>
                                                <input value={(editedItem as CrewItem).leaderProfile || ''} onChange={e => handleChange('leaderProfile', e.target.value)} className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-[10px] font-bold text-indigo-400 focus:ring-2 focus:ring-indigo-600 transition-all font-mono" placeholder="이미지 URL 직접 입력" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">크루 코스(동선)</label>
                                            <div className="space-y-2">
                                                {((editedItem as CrewItem).course || []).map((c, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <input value={c} onChange={e => handleListChange('course', idx, e.target.value)} className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm font-medium" placeholder="장소명" />
                                                        <button onClick={() => removeListItem('course', idx)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                                    </div>
                                                ))}
                                                <button onClick={() => addListItem('course')} className="flex items-center gap-2 text-indigo-600 text-xs font-black px-4 py-2 hover:bg-indigo-50 rounded-xl transition-all"><Plus size={14} /> 장소 추가</button>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">장소/코스 사진 갤러리 (배열)</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {((editedItem as CrewItem).gallery || []).map((img, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-xl bg-slate-100 border overflow-hidden group">
                                                        <img src={img} className="w-full h-full object-cover" />
                                                        <button onClick={() => removeListItem('gallery', idx)} className="absolute top-1 right-1 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                                                    </div>
                                                ))}
                                                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-500 transition-all cursor-pointer">
                                                    {isUploading === 'gallery' ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">Photo</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={async e => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        setIsUploading('gallery');
                                                        const url = await adminUpload(file);
                                                        if (url) {
                                                            const currentGallery = (editedItem as CrewItem).gallery || [];
                                                            handleChange('gallery', [...currentGallery, url]);
                                                        }
                                                        setIsUploading(null);
                                                    }} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    {(editedItem as CrewItem).type === 'report' && (
                                        <div className="md:col-span-2 space-y-4 pt-4">
                                            <div className="p-6 bg-slate-900 rounded-[2rem] text-white space-y-6">
                                                <h4 className="text-indigo-400 font-black text-sm uppercase tracking-widest flex items-center gap-2"><ImageIcon size={16} /> 리포트 상세 내용 (Premium)</h4>
                                                <textarea
                                                    value={(editedItem as CrewItem).reportContent}
                                                    onChange={e => handleChange('reportContent', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-slate-300 h-64 focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 transition-all outline-none scrollbar-hide"
                                                    placeholder="리포트 전체 텍스트를 입력하세요. 마크다운 형식을 지원합니다."
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {editedItem.categoryType === 'lecture' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">강사 성함</label>
                                        <input value={(editedItem as LectureItem).teacher || ''} onChange={e => handleChange('teacher', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">강사 프로필 이미지</label>
                                        <div className="flex gap-4">
                                            <div className="relative w-24 h-24 rounded-2xl bg-slate-100 border overflow-hidden group">
                                                {(editedItem as LectureItem).teacherProfile ? (
                                                    <img src={(editedItem as LectureItem).teacherProfile} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={24} /></div>
                                                )}
                                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    {isUploading === 'teacherProfile' ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" size={18} />}
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'teacherProfile')} />
                                                </label>
                                            </div>
                                            <input value={(editedItem as LectureItem).teacherProfile || ''} onChange={e => handleChange('teacherProfile', e.target.value)} className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-[10px] font-bold text-indigo-400 focus:ring-2 focus:ring-indigo-600 transition-all font-mono" placeholder="이미지 URL 직접 입력" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">강의 커리큘럼 (배열)</label>
                                        <div className="space-y-2">
                                            {((editedItem as LectureItem).curriculum || []).map((item, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input value={item} onChange={e => handleListChange('curriculum', idx, e.target.value)} className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm font-medium" />
                                                    <button onClick={() => removeListItem('curriculum', idx)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                            <button onClick={() => addListItem('curriculum')} className="flex items-center gap-2 text-indigo-600 text-xs font-black px-4 py-2 hover:bg-indigo-50 rounded-xl transition-all active:scale-95"><Plus size={14} /> 단계 추가</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSubTab === 'host' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">호스트 성함/별칭</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input value={editedItem.author} onChange={e => handleChange('author', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">호스트 프로필/소개 이미지</label>
                                <div className="flex gap-4">
                                    <div className="relative w-20 h-20 rounded-2xl bg-slate-100 border overflow-hidden group">
                                        {editedItem.hostIntroImage ? (
                                            <img src={editedItem.hostIntroImage} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={24} /></div>
                                        )}
                                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            {isUploading === 'hostIntroImage' ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" size={18} />}
                                            <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'hostIntroImage')} />
                                        </label>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input value={editedItem.hostIntroImage || ''} onChange={e => handleChange('hostIntroImage', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-[10px] font-bold text-indigo-400 focus:ring-2 focus:ring-indigo-600 transition-all font-mono" placeholder="이미지 URL 직접 입력" />
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">호스트 한줄 소개</label>
                                <textarea value={editedItem.hostDescription || ''} onChange={e => handleChange('hostDescription', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-600 transition-all h-24 resize-none" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">호스트 계좌 정보 (정산용)</label>
                                <input value={editedItem.hostBankInfo || ''} onChange={e => handleChange('hostBankInfo', e.target.value)} placeholder="예: 신한은행 110-000-000000 (홍길동)" className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">카카오톡 문의 URL</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input value={editedItem.kakaoChatUrl || ''} onChange={e => handleChange('kakaoChatUrl', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600 transition-all" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t flex justify-between items-center bg-slate-50/50">
                    <button onClick={onClose} className="px-8 py-4 text-slate-500 font-bold hover:text-slate-900 transition-colors">취소</button>
                    <button
                        onClick={() => onSave(editedItem)}
                        className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Save size={20} /> 변경사항 저장하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminItemEditModal;
