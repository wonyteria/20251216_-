
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Map, Heart, GraduationCap, Settings, LogOut, TrendingUp, DollarSign, Activity, Search, Edit3, Save, X, Image as ImageIcon, Shield, CheckCircle2, AlertCircle, Trash2, Palette, Type, Wallet, Lightbulb, Sparkles, Loader2, Menu, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnyItem, User, Slide, CrewItem, NetworkingItem, MatchingItem, BriefingItem, CategoryHeaderInfo } from '../types';
import Badge from '../components/Badge';
import { GoogleGenAI } from "@google/genai";
import { db } from '../services/mockDb';

const AdminPage = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<AnyItem[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [notis, setNotis] = useState<string[]>([]);
  const [briefing, setBriefing] = useState<BriefingItem[]>([]);
  const [headers, setHeaders] = useState<any>({});
  const [commission, setCommission] = useState(15);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initial Load
    setUsers(db.getUsers());
    setItems(db.getItems());
    setSlides(db.getSlides());
    setNotis(db.getNotifications());
    setBriefing(db.getBriefing());
    setHeaders(db.getCategoryHeaders());
    setCommission(db.getCommissionRate());
  }, []);

  // Handlers for DB Updates
  const handleSaveItem = (item: AnyItem) => {
      db.updateItem(item);
      setItems(db.getItems());
      showToast("콘텐츠가 저장되었습니다.", "success");
  };

  const handleSaveUser = (user: User) => {
      db.updateUser(user);
      setUsers(db.getUsers());
      showToast("유저 권한이 수정되었습니다.", "success");
  };

  const handleAI = async () => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "대한민국 부동산 최신 뉴스 3개를 '키워드: 내용' 형식으로 한줄 요약해줘.",
        });
        const text = response.text || "";
        const lines = text.split('\n').filter(l => l.includes(':')).slice(0, 3);
        const newBriefing = lines.map((l, i) => ({ id: Date.now()+i, highlight: l.split(':')[0], text: l }));
        db.setBriefing(newBriefing);
        setBriefing(newBriefing);
        showToast("AI 뉴스 요약 완료!", "success");
    } catch(e) { showToast("AI 요청 실패 (API Key 확인 필요)", "error"); }
  };

  const menu = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'permissions', label: '권한 관리', icon: Shield },
    { id: 'settlement', label: '정산 관리', icon: Wallet },
    { id: 'home_settings', label: '홈/디자인 관리', icon: Palette },
    { id: 'briefing', label: 'AI 인사이트', icon: Lightbulb },
    { id: 'content', label: '콘텐츠 관리', icon: Map },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      <aside className={`w-64 bg-slate-900 text-white h-screen fixed z-50 transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 font-bold text-xl">임풋 Admin</div>
        <nav className="px-4 space-y-1">
            {menu.map(m => (
                <button key={m.id} onClick={() => {setActiveTab(m.id); setIsMobileMenuOpen(false);}} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium ${activeTab===m.id ? 'bg-indigo-600' : 'text-slate-400 hover:text-white'}`}>
                    <m.icon size={18}/> {m.label}
                </button>
            ))}
        </nav>
      </aside>
      
      <main className="flex-1 md:ml-64 p-8">
        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden mb-4"><Menu/></button>
        
        {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border shadow-sm"><p className="text-slate-500 text-sm">총 회원</p><h3 className="text-2xl font-black">{users.length}명</h3></div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm"><p className="text-slate-500 text-sm">총 콘텐츠</p><h3 className="text-2xl font-black">{items.length}개</h3></div>
            </div>
        )}

        {activeTab === 'permissions' && (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead><tr className="bg-slate-50 text-xs uppercase text-slate-500"><th className="p-4">유저</th><th className="p-4">권한</th><th className="p-4 text-right">관리</th></tr></thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="border-t">
                                <td className="p-4 font-bold">{u.name}</td>
                                <td className="p-4 flex gap-1">{u.roles.map(r => <span key={r} className="bg-slate-100 px-2 py-1 text-xs rounded">{r}</span>)}</td>
                                <td className="p-4 text-right"><button onClick={() => {
                                    const role = prompt("추가할 권한 (super_admin, crew_manager 등):");
                                    if(role) handleSaveUser({...u, roles: [...u.roles, role]});
                                }} className="text-indigo-600 text-xs font-bold">권한 추가</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === 'settlement' && (
            <div className="bg-white rounded-2xl border shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold">정산 관리</h3>
                    <div className="flex items-center gap-2">수수료율: <input type="number" value={commission} onChange={(e) => {setCommission(Number(e.target.value)); db.setCommissionRate(Number(e.target.value));}} className="w-16 border rounded p-1"/>%</div>
                </div>
                <div className="space-y-2">
                    {items.map(i => {
                        const price = parseInt(i.price?.replace(/[^0-9]/g, '')||'0');
                        const sales = (i as any).currentParticipants || (i as any).purchaseCount || 0;
                        const revenue = price * sales;
                        const fee = Math.floor(revenue * (commission/100));
                        if(revenue === 0) return null;
                        return (
                            <div key={i.id} className="flex justify-between p-4 bg-slate-50 rounded-xl">
                                <div><p className="font-bold text-sm">{i.title}</p><p className="text-xs text-slate-500">매출: {revenue.toLocaleString()}원</p></div>
                                <div className="text-right"><p className="font-bold text-sm text-indigo-600">수수료: {fee.toLocaleString()}원</p></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {activeTab === 'briefing' && (
             <div className="bg-white rounded-2xl border shadow-sm p-6">
                 <div className="flex justify-between mb-4"><h3 className="font-bold">AI 인사이트 관리</h3><button onClick={handleAI} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex gap-2"><Sparkles size={16}/> AI 생성</button></div>
                 <div className="space-y-2">{briefing.map(b => <div key={b.id} className="p-3 bg-slate-50 rounded border text-sm"><span className="font-bold text-indigo-600">{b.highlight}:</span> {b.text}</div>)}</div>
             </div>
        )}
        
        {activeTab === 'content' && (
            <div className="space-y-4">
                {items.map(i => (
                    <div key={i.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <img src={i.img} className="w-12 h-12 rounded bg-slate-200 object-cover"/>
                            <div><p className="font-bold text-sm">{i.title}</p><span className="text-xs bg-slate-100 px-2 rounded">{i.categoryType}</span></div>
                        </div>
                        <button onClick={() => {
                            const newTitle = prompt("수정할 제목:", i.title);
                            if(newTitle) handleSaveItem({...i, title: newTitle});
                        }} className="text-slate-400 hover:text-indigo-600"><Edit3 size={18}/></button>
                    </div>
                ))}
            </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
