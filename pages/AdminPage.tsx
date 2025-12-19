
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Map, Edit3, Shield, Palette, Wallet,
  Lightbulb, Sparkles, Loader2, Menu, X, Plus, Trash2,
  Save, Check, ExternalLink, Image as ImageIcon,
  Bell, Settings, User as UserIcon, ChevronRight, Upload, Home, MessageSquare, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnyItem, User, Slide, BriefingItem, NotificationItem, CategoryType, Review } from '../types';
import { GoogleGenAI } from "@google/genai";
import * as database from '../services/database';
import { supabaseGet } from '../services/supabase';
import { adminUpload } from '../services/storage';
import AdminItemEditModal from '../components/AdminItemEditModal';

const AdminPage = ({ showToast, currentUser }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void, currentUser: User | null }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<AnyItem[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [notis, setNotis] = useState<NotificationItem[]>([]);
  const [briefing, setBriefing] = useState<BriefingItem[]>([]);
  const [headers, setHeaders] = useState<any>({});
  const [detailImages, setDetailImages] = useState<any>({});
  const [tagline, setTagline] = useState('');
  const [commission, setCommission] = useState(15);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [allReviews, setAllReviews] = useState<Review[]>([]);

  // Modal states
  const [editingItem, setEditingItem] = useState<AnyItem | null>(null);
  const [contentFilter, setContentFilter] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        usersData, itemsData, slidesData, notisData,
        briefingData, headersData, detailImagesData,
        commissionData, taglineData, reviewsData
      ] = await Promise.all([
        database.getUsers(),
        database.getItems(),
        database.getSlides(),
        database.getNotifications(),
        database.getBriefings(),
        database.getCategoryHeaders(),
        database.getDetailImages(),
        database.getCommissionRate(),
        database.getTagline(),
        supabaseGet<any>('reviews', 'order=created_at.desc')
      ]);
      setUsers(usersData);
      setItems(itemsData);
      setSlides(slidesData);
      setNotis(notisData);
      setBriefing(briefingData);
      setHeaders(headersData);
      setDetailImages(detailImagesData);
      setCommission(commissionData);
      setTagline(taglineData);
      setAllReviews(reviewsData.map((d: any) => ({
        id: d.id,
        itemId: d.item_id,
        userId: d.user_id,
        user: d.user,
        text: d.text,
        rating: Number(d.rating),
        date: d.date,
        avatar: d.avatar,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      })));

    } catch (error) {
      console.error('Error loading admin data:', error);
      showToast('데이터 로딩 실패', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Handlers ---
  const handleSaveItem = async (item: AnyItem) => {
    const success = await database.updateItem(item.id, item);
    if (success) {
      showToast("콘텐츠가 저장되었습니다.", "success");
      loadData();
    } else {
      showToast("저장 실패", "error");
    }
  };

  const handleUpdateUserRoles = async (userId: string, currentRoles: string[], newRole: string) => {
    let updatedRoles = [...currentRoles];
    if (updatedRoles.includes(newRole)) {
      updatedRoles = updatedRoles.filter(r => r !== newRole);
    } else {
      updatedRoles.push(newRole);
    }

    const success = await database.updateUserRoles(userId, updatedRoles);
    if (success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: updatedRoles } : u));
      showToast("권한이 업데이트되었습니다.", "success");
    } else {
      showToast("권한 업데이트 실패", "error");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`[경고] ${userName} 회원을 강제 탈퇴시키겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;

    const success = await database.deleteUser(userId);
    if (success) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast("회원이 탈퇴 처리되었습니다.", "info");
    } else {
      showToast("탈퇴 처리 실패", "error");
    }
  };

  const handleSaveSlide = async (slide: Slide) => {
    const success = await database.updateSlide(slide.id, slide);
    if (success) {
      showToast("슬라이드가 저장되었습니다.", "success");
      loadData();
    }
  };

  const handleDeleteSlide = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const success = await database.deleteSlide(id);
    if (success) {
      showToast("삭제되었습니다.", "info");
      loadData();
    }
  };

  const handleCreateSlide = async () => {
    const success = await database.createSlide({
      title: "새 슬라이드",
      desc: "설명",
      img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format",
      sortOrder: slides.length + 1,
      isActive: true
    });
    if (success) loadData();
  };

  const handleSaveNoti = async (noti: NotificationItem) => {
    const success = await database.updateNotification(noti.id, noti);
    if (success) {
      showToast("공지사항이 저장되었습니다.", "success");
      loadData();
    }
  };

  const handleCreateNoti = async () => {
    const success = await database.createNotification({
      message: "새 공지사항",
      isActive: true,
      sortOrder: notis.length + 1
    });
    if (success) loadData();
  };

  const handleSaveCategoryDesign = async (cat: string, title: string, desc: string, img: string) => {
    const [hRes, iRes] = await Promise.all([
      database.updateCategoryHeader(cat, title, desc),
      database.updateCategoryDetailImage(cat, img)
    ]);
    if (hRes && iRes) {
      showToast(`${cat} 디자인 저장 완료`, "success");
      loadData();
    }
  };

  const handlePageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'slide' | 'category' | 'setting', id?: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fieldId = id ? `${type}_${id}` : type;
    setUploadingField(fieldId);

    const url = await adminUpload(file);
    if (url) {
      if (type === 'slide') {
        setSlides(prev => prev.map(s => s.id === id ? { ...s, img: url } : s));
      } else if (type === 'category') {
        const cat = id;
        const header = headers[cat] || { title: '', description: '' };
        await handleSaveCategoryDesign(cat, header.title, header.description, url);
      } else if (type === 'setting') {
        const settingKey = id;
        await database.setSetting(settingKey, url);
        showToast("이미지가 업로드 및 저장되었습니다.", "success");
        loadData();
      }
    }
    setUploadingField(null);
  };

  const handleSaveTagline = async () => {
    const success = await database.setSetting('tagline', tagline);
    if (success) showToast("슬로건 저장 완료", "success");
  };

  const handleAI = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: "대한민국 부동산 최신 뉴스 3개를 '키워드: 내용' 형식으로 한줄 요약해줘.",
      });
      const text = response.text || "";
      const lines = text.split('\n').filter(l => l.includes(':')).slice(0, 3);
      const newBriefing = lines.map((l, i) => ({ id: Date.now() + i, highlight: l.split(':')[0].trim(), text: l }));
      await database.setBriefings(newBriefing);
      setBriefing(newBriefing);
      showToast("AI 뉴스 요약 완료!", "success");
    } catch (e) {
      console.error('AI Error:', e);
      showToast("AI 요청 실패 (API Key 확인 필요)", "error");
    }
  };

  const menu = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'users', label: '유저/권한 관리', icon: UserIcon },
    { id: 'content', label: '콘텐츠 관리', icon: Map },
    { id: 'design', label: '홈/디자인 관리', icon: Palette },
    { id: 'reviews', label: '리뷰 관리', icon: MessageSquare },
    { id: 'ai', label: 'AI 인사이트', icon: Lightbulb },
    { id: 'settlement', label: '정산/설정', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mb-4 text-indigo-600" size={48} />
          <p className="text-slate-500 font-medium">관리 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 text-white h-screen fixed z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 pb-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-black">임</div>
          <span className="font-black text-xl tracking-tight">임풋 ADMIN</span>
        </div>
        <div className="px-6 mb-8 text-xs text-slate-500 uppercase tracking-widest font-bold">Platform Management</div>
        <nav className="px-4 space-y-1">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-4 bg-slate-800 text-indigo-400 hover:bg-slate-700 transition-all font-bold text-sm">
            <Home size={18} /> 홈페이지로 이동
          </button>
          {menu.map(m => (
            <button key={m.id} onClick={() => { setActiveTab(m.id); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === m.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <m.icon size={18} /> {m.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-10 min-h-screen">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight">{menu.find(m => m.id === activeTab)?.label}</h1>
            <p className="text-slate-500 mt-1">{menu.find(m => m.id === activeTab)?.label} 작업을 진행합니다.</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 bg-white rounded-lg border shadow-sm"><Menu /></button>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4"><UserIcon size={20} /></div>
                <p className="text-slate-500 text-sm font-medium">누적 회원 수</p>
                <h3 className="text-2xl font-black mt-1">{users.length} 명</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4"><Map size={20} /></div>
                <p className="text-slate-500 text-sm font-medium">활성 콘텐츠</p>
                <h3 className="text-2xl font-black mt-1">{items.length} 개</h3>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden p-8">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b">
                <tr>
                  <th className="p-4">유저 정보</th>
                  <th className="p-4">이메일</th>
                  <th className="p-4">권한 설정</th>
                  <th className="p-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="p-4 font-bold text-sm">{u.name}</td>
                    <td className="p-4 text-sm text-slate-500">{u.email}</td>
                    <td className="p-4 flex flex-wrap gap-1">
                      {['super_admin', 'crew_manager', 'lecture_manager'].map(role => (
                        <button key={role} onClick={() => handleUpdateUserRoles(u.id, u.roles || [], role)} className={`px-2 py-1 text-[10px] font-bold rounded-full border ${u.roles?.includes(role) ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                          {role.replace('_', ' ')}
                        </button>
                      ))}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDeleteUser(u.id, u.name)} className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black">등록 콘텐츠 목록</h3>
              <div className="flex gap-2">
                {['all', 'networking', 'minddate', 'crew', 'lecture'].map(c => (
                  <button key={c} onClick={() => setContentFilter(c)} className={`px-3 py-1.5 border rounded-xl text-xs font-bold uppercase ${contentFilter === c ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`}>{c}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {items.filter(i => contentFilter === 'all' || i.categoryType === contentFilter).map(i => (
                <div key={i.id} className="bg-white p-6 rounded-3xl border shadow-sm flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <img src={i.img} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <p className="text-[10px] text-indigo-600 font-black uppercase">{i.categoryType}</p>
                      <h4 className="font-black text-lg">{i.title}</h4>
                      <p className="text-xs text-slate-400">{i.author} • {i.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={async () => { if (confirm("삭제하시겠습니까?")) { await database.deleteItem(i.id); loadData(); } }} className="px-4 py-2 bg-rose-50 text-rose-600 font-bold rounded-xl text-xs">삭제</button>
                    <button onClick={() => setEditingItem(i)} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs">편집</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-12 pb-20">
            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">메인 비주얼 슬라이더</h3>
                <button onClick={handleCreateSlide} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs">+ 추가</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {slides.map(s => (
                  <div key={s.id} className="bg-white rounded-3xl border shadow-sm overflow-hidden p-6 space-y-4">
                    <img src={s.img} className="w-full h-32 object-cover rounded-xl" />
                    <input value={s.title} onChange={e => setSlides(prev => prev.map(sl => sl.id === s.id ? { ...sl, title: e.target.value } : sl))} className="w-full font-bold border-none bg-slate-50 rounded-xl p-3" />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveSlide(s)} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-xs">저장</button>
                      <button onClick={() => handleDeleteSlide(s.id)} className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black mb-6">공지사항 관리</h3>
              <div className="bg-white rounded-3xl border shadow-sm divide-y">
                {notis.map(n => (
                  <div key={n.id} className="p-6 flex items-center gap-4">
                    <input value={n.message} onChange={e => setNotis(prev => prev.map(no => no.id === n.id ? { ...no, message: e.target.value } : no))} className="flex-1 bg-slate-50 rounded-xl p-3 border-none font-bold text-sm" />
                    <button onClick={() => handleSaveNoti(n)} className="px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs">SAVE</button>
                    <button onClick={async () => { if (confirm("삭제?")) { await database.deleteNotification(n.id); loadData(); } }} className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Trash2 size={18} /></button>
                  </div>
                ))}
                <button onClick={handleCreateNoti} className="w-full py-4 text-indigo-600 font-bold text-sm hover:bg-slate-50 transition-all">+ 공지 추가</button>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black mb-6">카테고리 디자인</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {['networking', 'minddate', 'crew', 'lecture'].map(cat => {
                  const header = headers[cat] || { title: '', description: '' };
                  const img = detailImages[cat] || '';
                  return (
                    <div key={cat} className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
                      <h4 className="font-black uppercase text-indigo-600 text-xs">{cat}</h4>
                      <input defaultValue={header.title} onBlur={e => handleSaveCategoryDesign(cat, e.target.value, header.description, img)} className="w-full bg-slate-50 rounded-xl p-3 border-none font-bold" placeholder="Title" />
                      <textarea defaultValue={header.description} onBlur={e => handleSaveCategoryDesign(cat, header.title, e.target.value, img)} className="w-full bg-slate-50 rounded-xl p-3 border-none h-20 text-sm" placeholder="Description" />
                      <div className="flex gap-2">
                        <input value={img} className="flex-1 bg-slate-50 rounded-xl p-3 text-[10px] font-bold text-slate-400 border-none" readOnly />
                        <label className="p-3 bg-indigo-600 text-white rounded-xl cursor-pointer">
                          <Upload size={18} />
                          <input type="file" className="hidden" onChange={e => handlePageFileUpload(e, 'category', cat)} />
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl border shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black">리뷰 관리</h3>
                <p className="text-xs text-slate-400 font-medium tracking-tight">멤버들이 남긴 후기를 관리합니다. (24시간 무관 관리자 수정 가능)</p>
              </div>
              <button
                onClick={async () => {
                  if (!currentUser) return;
                  try {
                    const success = await database.seedDummyReviews(currentUser.id);
                    if (success) {
                      showToast("더미 리뷰 데이터가 생성되었습니다. (아이템 상태가 '종료'로 변경되었습니다)", "success");
                      loadData();
                    } else {
                      showToast("아이템이 하나도 없어 리뷰를 생성할 수 없습니다.", "error");
                    }
                  } catch (err: any) {
                    showToast(err.message || "데이터 생성 실패", "error");
                  }
                }}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs"
              >
                더미 리뷰 생성
              </button>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b">
                <tr>
                  <th className="p-4">콘텐츠</th>
                  <th className="p-4">유저</th>
                  <th className="p-4">내용</th>
                  <th className="p-4">평점</th>
                  <th className="p-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allReviews.map(r => {
                  const item = items.find(i => i.id === r.itemId);
                  return (
                    <tr key={r.id}>
                      <td className="p-4 font-bold text-xs">{item?.title || 'Unknown'}</td>
                      <td className="p-4 text-xs">{r.user}</td>
                      <td className="p-4 text-xs text-slate-500 line-clamp-1 max-w-[200px]">{r.text}</td>
                      <td className="p-4 text-amber-500 font-black">★ {r.rating}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={async () => {
                          const t = prompt("리뷰 수정 (관리자 권한)", r.text);
                          if (t) { await database.updateReview(r.id, { text: t }, true); loadData(); }
                        }} className="text-indigo-600 font-bold hover:underline">Edit</button>
                        <button onClick={async () => {
                          if (confirm("삭제?")) { await database.deleteReview(r.id); loadData(); }
                        }} className="text-rose-600 font-bold hover:underline">Del</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="bg-white rounded-3xl border shadow-sm p-10 mt-10">
            <div className="flex justify-between items-center mb-10 pb-10 border-b">
              <h3 className="text-2xl font-black flex items-center gap-2">AI 인사이트 <Sparkles className="text-amber-400" /></h3>
              <button onClick={handleAI} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">자동 생성 시작</button>
            </div>
            <div className="space-y-4">
              {briefing.map(b => (
                <div key={b.id} className="p-6 bg-slate-50 rounded-2xl border flex gap-4 items-start">
                  <span className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-black rounded">{b.highlight}</span>
                  <p className="text-sm font-bold">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settlement' && (
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-3xl border shadow-sm flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black">플랫폼 정산 설정</h3>
                <p className="text-sm text-slate-500">전체 수수료율 설정 및 예상 정산액을 확인합니다.</p>
              </div>
              <div className="bg-slate-900 text-white px-6 py-4 rounded-3xl flex items-center gap-4">
                <input type="number" value={commission} onChange={e => { setCommission(Number(e.target.value)); database.setCommissionRate(Number(e.target.value)); }} className="w-12 bg-transparent border-none text-xl font-black p-0 text-center" />
                <span className="text-indigo-400 font-black">%</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {editingItem && (
        <AdminItemEditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={async (updated) => {
            await handleSaveItem(updated);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminPage;
