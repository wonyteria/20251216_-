
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Map, Edit3, Shield, Palette, Wallet,
  Lightbulb, Sparkles, Loader2, Menu, X, Plus, Trash2,
  Save, Check, ExternalLink, Image as ImageIcon,
  Bell, Settings, User as UserIcon, ChevronRight, Upload, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnyItem, User, Slide, BriefingItem, NotificationItem, CategoryType } from '../types';
import { GoogleGenAI } from "@google/genai";
import * as database from '../services/database';
import { adminUpload } from '../services/storage';
import AdminItemEditModal from '../components/AdminItemEditModal';

const AdminPage = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
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

  // Modal states
  const [editingItem, setEditingItem] = useState<AnyItem | null>(null);
  const [contentFilter, setContentFilter] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        usersData, itemsData, slidesData, notisData,
        briefingData, headersData, detailImagesData,
        commissionData, taglineData
      ] = await Promise.all([
        database.getUsers(),
        database.getItems(),
        database.getSlides(),
        database.getNotifications(),
        database.getBriefings(),
        database.getCategoryHeaders(),
        database.getDetailImages(),
        database.getCommissionRate(),
        database.getTagline()
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
      showToast("탈퇴 처리 실패 (권한이 없거나 오류가 발생했습니다.)", "error");
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
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-4 bg-slate-800 text-indigo-400 hover:bg-slate-700 transition-all font-bold text-sm"
          >
            <Home size={18} /> 홈페이지로 이동
          </button>
          {menu.map(m => (
            <button
              key={m.id}
              onClick={() => { setActiveTab(m.id); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === m.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <m.icon size={18} /> {m.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-8 left-0 w-full px-8">
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5">
            <p className="text-[10px] text-slate-500 mb-1">Signed in as</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold">Main Admin</span>
            </div>
          </div>
        </div>
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

        {/* Tabs Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 tracking-tight">
              <div className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4"><UserIcon size={20} /></div>
                <p className="text-slate-500 text-sm font-medium">누적 회원 수</p>
                <h3 className="text-3xl font-black mt-1">{users.length} <span className="text-sm font-normal text-slate-400">명</span></h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4"><Map size={20} /></div>
                <p className="text-slate-500 text-sm font-medium">활성 콘텐츠</p>
                <h3 className="text-3xl font-black mt-1">{items.length} <span className="text-sm font-normal text-slate-400">개</span></h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4"><Check size={20} /></div>
                <p className="text-slate-500 text-sm font-medium">완료된 이벤트</p>
                <h3 className="text-3xl font-black mt-1">{items.filter(i => i.status === 'ended').length} <span className="text-sm font-normal text-slate-400">건</span></h3>
              </div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 mb-4"><Bell size={20} /></div>
                <p className="text-slate-500 text-sm font-medium">누적 등록 공지</p>
                <h3 className="text-3xl font-black mt-1">{notis.length} <span className="text-sm font-normal text-slate-400">개</span></h3>
              </div>
            </div>

            <div className="bg-white rounded-3xl border shadow-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">최근 등록된 콘텐츠</h3>
                <button onClick={() => setActiveTab('content')} className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline">전체보기 <Plus size={14} /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b">
                    <tr>
                      <th className="pb-4 px-2">콘텐츠명</th>
                      <th className="pb-4 px-2">카테고리</th>
                      <th className="pb-4 px-2">호스트</th>
                      <th className="pb-4 px-2 text-right">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.slice(0, 5).map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-2 font-bold text-sm tracking-tight">{item.title}</td>
                        <td className="py-4 px-2"><span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase">{item.categoryType}</span></td>
                        <td className="py-4 px-2 text-sm text-slate-500">{item.author}</td>
                        <td className="py-4 px-2 text-right">
                          <span className={`text-[10px] font-black px-2 py-1 rounded-full ${item.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {item.status === 'open' ? '모집중' : '마감'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black">회원 및 권한 관리</h3>
              <div className="text-xs text-slate-400 font-medium">관리자 권한을 부여하거나 회수할 수 있습니다.</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 rounded-l-2xl">유저 정보</th>
                    <th className="p-4">이메일</th>
                    <th className="p-4">가입일</th>
                    <th className="p-4">권한 설정</th>
                    <th className="p-4 rounded-r-2xl">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} className="w-10 h-10 rounded-full border shadow-inner" alt={u.name} />
                          <span className="font-bold text-sm">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500 font-medium">{u.email}</td>
                      <td className="p-4 text-sm text-slate-400 font-medium">{new Date(u.joinDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {['super_admin', 'networking_manager', 'minddate_manager', 'crew_manager', 'lecture_manager'].map(role => (
                            <button
                              key={role}
                              onClick={() => handleUpdateUserRoles(u.id, u.roles || [], role)}
                              className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all border ${(u.roles || []).includes(role)
                                ? 'bg-indigo-600 text-white border-transparent'
                                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                                }`}
                            >
                              {role.replace('_', ' ').toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="강제 탈퇴"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black">등록 콘텐츠 목록</h3>
              <div className="flex gap-2">
                {['all', 'networking', 'minddate', 'crew', 'lecture'].map(c => (
                  <button
                    key={c}
                    onClick={() => setContentFilter(c)}
                    className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all uppercase tracking-tight ${contentFilter === c ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {items
                .filter(i => contentFilter === 'all' || i.categoryType === contentFilter)
                .map(i => (
                  <div key={i.id} className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-6">
                      <img src={i.img} className="w-20 h-20 rounded-2xl bg-slate-200 object-cover shadow-inner" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-lg">{i.categoryType}</span>
                          <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-50 rounded-lg">ID: {i.id}</span>
                        </div>
                        <h4 className="font-black text-lg tracking-tight leading-tight mb-1">{i.title}</h4>
                        <div className="flex gap-4 text-xs font-medium text-slate-400">
                          <span>호스트: <b className="text-slate-700">{i.author}</b></span>
                          <span>모집일: <b className="text-slate-700">{i.date}</b></span>
                          <span>판매: <b className="text-indigo-600">{(i as any).currentParticipants || (i as any).purchaseCount || 0} 명</b></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={async () => {
                          if (!confirm("이 콘텐츠를 삭제하시겠습니까? (이전 신청 내역도 모두 삭제됩니다.)")) return;
                          const success = await database.deleteItem(i.id);
                          if (success) loadData();
                        }}
                        className="px-6 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl text-xs font-bold transition-colors"
                      >
                        삭제
                      </button>
                      <button
                        onClick={() => setEditingItem(i)}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-colors"
                      >
                        <Edit3 size={16} /> 상세 편집
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-12 pb-20">
            {/* Visual Settings */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">메인 홈 비주얼 슬라이더</h3>
                <button onClick={handleCreateSlide} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"><Plus size={16} /> 슬라이드 추가</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {slides.map(s => (
                  <div key={s.id} className="bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col group">
                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                      <img src={s.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={s.title} />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => handleDeleteSlide(s.id)} className="p-2 bg-white/90 backdrop-blur rounded-xl text-rose-600 shadow-sm border border-rose-100 hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white shadow-sm border ${s.isActive ? 'text-indigo-600 border-indigo-100' : 'text-slate-400 border-slate-100'}`}>
                          {s.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <input value={s.title} onChange={e => setSlides(prev => prev.map(sl => sl.id === s.id ? { ...sl, title: e.target.value } : sl))} className="w-full font-black text-lg border-none focus:ring-0 p-0 placeholder:text-slate-300" placeholder="슬라이드 제목" />
                      <textarea value={s.desc} onChange={e => setSlides(prev => prev.map(sl => sl.id === s.id ? { ...sl, desc: e.target.value } : sl))} className="w-full text-sm text-slate-500 font-medium border-none focus:ring-0 p-0 bg-transparent resize-none h-12" placeholder="간단한 설명..." />
                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex-1 flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 group/input">
                          <ImageIcon size={14} className="text-slate-300 mr-2" />
                          <input value={s.img} onChange={e => setSlides(prev => prev.map(sl => sl.id === s.id ? { ...sl, img: e.target.value } : sl))} className="flex-1 text-[10px] font-bold text-slate-400 border-none bg-transparent focus:ring-0 p-0" placeholder="Image URL" />
                          <label className="p-1 hover:bg-slate-200 rounded cursor-pointer transition-colors">
                            {uploadingField === `slide_${s.id}` ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                            <input type="file" className="hidden" accept="image/*" onChange={e => handlePageFileUpload(e, 'slide', s.id)} />
                          </label>
                        </div>
                        <input type="number" value={s.sortOrder} onChange={e => setSlides(prev => prev.map(sl => sl.id === s.id ? { ...sl, sortOrder: parseInt(e.target.value) } : sl))} className="w-12 text-center bg-slate-50 border-slate-100 rounded-xl text-xs font-bold focus:ring-indigo-500 focus:border-indigo-500" />
                        <button onClick={() => handleSaveSlide(s)} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/10"><Check size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Notifications */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">홈 상단 공지/알림롤</h3>
                <button onClick={handleCreateNoti} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl text-xs font-bold hover:bg-black transition-colors shadow-xl shadow-black/10"><Plus size={16} /> 알림 추가</button>
              </div>
              <div className="bg-white rounded-3xl border shadow-sm divide-y">
                {notis.map(n => (
                  <div key={n.id} className="p-6 flex items-center gap-6">
                    <div className="flex-1 flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                      <Bell size={18} className="text-slate-300" />
                      <input value={n.message} onChange={e => setNotis(prev => prev.map(no => no.id === n.id ? { ...no, message: e.target.value } : no))} className="flex-1 bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 p-0" placeholder="공지 메시지를 입력하세요..." />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400">순서</span>
                        <input type="number" value={n.sortOrder} onChange={e => setNotis(prev => prev.map(no => no.id === n.id ? { ...no, sortOrder: parseInt(e.target.value) } : no))} className="w-8 bg-transparent border-none text-center text-xs font-black p-0" />
                      </div>
                      <button onClick={() => handleSaveNoti({ ...n, isActive: !n.isActive })} className={`p-3 rounded-xl border transition-all ${n.isActive ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-300 border-slate-200'}`}>
                        {n.isActive ? <Check size={18} /> : <X size={18} />}
                      </button>
                      <button onClick={async () => { if (confirm("삭제하시겠습니까?")) { await database.deleteNotification(n.id); loadData(); } }} className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                      <button onClick={() => handleSaveNoti(n)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/10">SAVE</button>
                    </div>
                  </div>
                ))}
                {notis.length === 0 && <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No active notifications</div>}
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Tagline Settings */}
            <section className="bg-white p-8 rounded-3xl border shadow-sm">
              <h3 className="text-xl font-black mb-6">플랫폼 메인 슬로건</h3>
              <div className="flex gap-4">
                <div className="flex-1 flex items-center bg-indigo-50/50 px-6 py-4 rounded-2xl border border-indigo-100 focus-within:bg-white focus-within:border-indigo-600 transition-all">
                  <Sparkles size={20} className="text-indigo-400 mr-4" />
                  <input value={tagline} onChange={e => setTagline(e.target.value)} className="flex-1 bg-transparent border-none font-black text-slate-800 placeholder:text-indigo-200 focus:ring-0 p-0" placeholder="헤드라인 카피를 입력하세요..." />
                </div>
                <button onClick={handleSaveTagline} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black tracking-tight hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">저장</button>
              </div>
            </section>

            {/* Category Designs */}
            <section>
              <h3 className="text-xl font-black mb-6">카테고리별 디자인 관리</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {['networking', 'minddate', 'crew', 'lecture'].map(cat => {
                  const header = headers[cat] || { title: '', description: '' };
                  const img = detailImages[cat] || '';
                  return (
                    <div key={cat} className="bg-white p-6 rounded-3xl border shadow-sm space-y-4 border-t-8 border-t-slate-900 border-x-0 border-b-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest bg-indigo-50 px-3 py-1 rounded-full">{cat} Category</span>
                        <button
                          onClick={() => {
                            setContentFilter(cat);
                            setActiveTab('content');
                          }}
                          className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
                        >
                          아이템 관리 <ChevronRight size={10} />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Title</p>
                          <input defaultValue={header.title} onBlur={e => handleSaveCategoryDesign(cat, e.target.value, header.description, img)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Description</p>
                          <textarea defaultValue={header.description} onBlur={e => handleSaveCategoryDesign(cat, header.title, e.target.value, img)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium text-slate-500 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all h-20 resize-none" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Detail Hero Image</p>
                          <div className="flex gap-2">
                            <div className="flex-1 flex items-center bg-slate-50 border-none rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:bg-white transition-all">
                              <input value={img} onChange={e => {/* handle local change if needed */ }} onBlur={e => handleSaveCategoryDesign(cat, header.title, header.description, e.target.value)} className="flex-1 bg-transparent border-none text-[10px] font-bold text-indigo-400 focus:ring-0 p-0" />
                              <label className="p-2 hover:bg-indigo-100 rounded-xl cursor-pointer text-indigo-600 transition-colors">
                                {uploadingField === `category_${cat}` ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                <input type="file" className="hidden" accept="image/*" onChange={e => handlePageFileUpload(e, 'category', cat)} />
                              </label>
                            </div>
                            {img && <a href={img} target="_blank" rel="noreferrer" className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-colors"><ExternalLink size={20} /></a>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="bg-white rounded-3xl border shadow-sm p-10 max-w-4xl mx-auto mt-10 shadow-indigo-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 border-b pb-10">
              <div>
                <h3 className="text-3xl font-black mb-2 flex items-center gap-3">AI 인사이트 <Sparkles className="text-amber-400 animate-pulse" size={32} /></h3>
                <p className="text-slate-500 font-medium leading-relaxed">Gemini AI를 활용해 매일 새로운 부동산 시장 동향과 인사이트를 자동으로 생성합니다.<br />생성된 정보는 메인 홈 '데일리 브리핑' 섹션에 노출됩니다.</p>
              </div>
              <button onClick={handleAI} className="whitespace-nowrap bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black tracking-tight flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 group">
                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" /> 인사이트 자동 생성
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-1 bg-indigo-600 rounded-full"></div>
                <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Generated Briefing Items</span>
              </div>
              {briefing.map(b => (
                <div key={b.id} className="relative p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-indigo-300 hover:bg-white transition-all duration-300">
                  <span className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg shadow-md tracking-tight">{b.highlight}</span>
                  <div className="flex gap-4 items-start pt-2">
                    <div className="w-2 h-2 mt-2 bg-indigo-600 rounded-full"></div>
                    <p className="text-slate-700 font-bold leading-relaxed">{b.text.includes(':') ? b.text.split(':')[1].trim() : b.text}</p>
                  </div>
                </div>
              ))}
              {briefing.length === 0 && <div className="text-center py-20 text-slate-300 font-bold tracking-widest flex flex-col items-center gap-4"><Lightbulb size={48} className="text-slate-100" /> NO CONTENT GENERATED</div>}
            </div>
          </div>
        )}

        {activeTab === 'settlement' && (
          <div className="space-y-8 max-w-5xl mx-auto">
            {/* Commission Setting */}
            <section className="bg-white rounded-3xl border shadow-sm p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-slate-100">
              <div>
                <h3 className="text-2xl font-black mb-2 flex items-center gap-3">플랫폼 수수료율 <Wallet size={24} className="text-indigo-600" /></h3>
                <p className="text-slate-500 font-medium">콘텐츠 판매 시 플랫폼이 수취할 기본 수수료율을 설정합니다.</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-900 px-6 py-4 rounded-3xl shadow-xl">
                <input
                  type="number"
                  value={commission}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setCommission(v);
                    database.setCommissionRate(v);
                  }}
                  className="w-20 bg-transparent border-none text-white text-3xl font-black focus:ring-0 p-0 text-center"
                />
                <span className="text-indigo-400 text-2xl font-black">%</span>
              </div>
            </section>

            {/* Revenue Overview */}
            <section className="bg-white rounded-3xl border shadow-sm p-10 shadow-indigo-50/50">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">콘텐츠별 예상 정산 금액 <Check size={20} className="text-emerald-500" /></h3>
              <div className="grid grid-cols-1 gap-4">
                {items.filter(i => ((i as any).currentParticipants || (i as any).purchaseCount || 0) > 0).map(i => {
                  const price = parseInt(i.price?.replace(/[^0-9]/g, '') || '0');
                  const sales = (i as any).currentParticipants || (i as any).purchaseCount || 0;
                  const revenue = price * sales;
                  const fee = Math.floor(revenue * (commission / 100));
                  const settlement = revenue - fee;

                  return (
                    <div key={i.id} className="flex flex-col md:flex-row justify-between items-center p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all group">
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 font-black text-xl border shadow-inner group-hover:text-indigo-600 transition-colors">{i.title.charAt(0)}</div>
                        <div>
                          <p className="font-black text-slate-800 tracking-tight">{i.title}</p>
                          <div className="flex gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>SALES: <b className="text-slate-600">{sales}</b></span>
                            <span className="text-indigo-300">|</span>
                            <span>TOTAL: <b className="text-slate-600">{revenue.toLocaleString()}원</b></span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-10 text-right">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission</p>
                          <p className="font-bold text-sm text-rose-500">-{fee.toLocaleString()}원</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Final Payout</p>
                          <p className="font-black text-lg text-indigo-600">{settlement.toLocaleString()}원</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {items.every(i => !((i as any).currentParticipants || (i as any).purchaseCount || 0)) && (
                  <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No active revenue data</div>
                )}
              </div>
            </section>

            {/* Advanced Settings */}
            <section className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl shadow-indigo-900/40">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Settings size={20} className="text-indigo-400" /> 시스템 고급 설정</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">마이페이지 배너 이미지</label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center bg-white/5 border-none rounded-2xl px-6 py-4 transition-all">
                      <input
                        placeholder="Enter image URL..."
                        className="flex-1 bg-transparent border-none font-bold text-indigo-300 focus:ring-0 p-0 placeholder:text-white/10"
                        onBlur={async (e) => {
                          if (e.target.value) {
                            await database.setSetting('mypage_banner', e.target.value);
                            showToast("배너 이미지 저장 완료", "success");
                          }
                        }}
                      />
                      <label className="p-2 hover:bg-white/10 rounded-xl cursor-pointer text-indigo-400 transition-colors ml-2">
                        {uploadingField === 'setting_mypage_banner' ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                        <input type="file" className="hidden" accept="image/*" onChange={e => handlePageFileUpload(e, 'setting', 'mypage_banner')} />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">시스템 상태</label>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                      <span className="text-xs font-bold text-slate-400">Database Connection</span>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    </div>
                    <div className="flex-1 bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                      <span className="text-xs font-bold text-slate-400">AI Engine</span>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Modals */}
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
