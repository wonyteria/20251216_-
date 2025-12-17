
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import Modal from './components/Modal';
import Toast from './components/Toast';
import LoginModal from './components/LoginModal';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import { AnyItem, User } from './types';
import { ArrowUp } from 'lucide-react';
import { getCurrentUser, signOut, onAuthStateChange } from './services/auth';
import * as database from './services/database';

const App: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<AnyItem | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Global State from Supabase ---
  const [items, setItems] = useState<AnyItem[]>([]);
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);
  const [globalData, setGlobalData] = useState<{
    slides: any[];
    notifications: string[];
    headers: Record<string, any>;
    detailImages: Record<string, string>;
    tagline: string;
    briefing: any[];
  }>({
    slides: [],
    notifications: [],
    headers: {},
    detailImages: {},
    tagline: '나와 같은 방향을 걷는 사람들을 만나는 곳, 임풋',
    briefing: []
  });

  // --- Theme State ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // --- Load data from Supabase ---
  const loadData = async () => {
    try {
      const [itemsData, globalDataResult] = await Promise.all([
        database.getItems(),
        database.loadGlobalData()
      ]);

      setItems(itemsData);
      setGlobalData(globalDataResult);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // --- Load user interactions from Supabase ---
  const loadUserInteractions = async (userId: string) => {
    try {
      const [likes, applies, unlocks] = await Promise.all([
        database.getUserLikes(userId),
        database.getUserApplies(userId),
        database.getUserUnlocks(userId)
      ]);
      setLikedIds(likes);
      setAppliedIds(applies);
      setUnlockedIds(unlocks);
    } catch (error) {
      console.error('Error loading user interactions:', error);
    }
  };

  // --- Initialize ---
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      try {
        // Load global data from Supabase
        await loadData();

        // Load User from Supabase Auth
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
          await loadUserInteractions(user.id);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }

      setIsLoading(false);
    };

    init();

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserInteractions(user.id);
      } else {
        setLikedIds([]);
        setAppliedIds([]);
        setUnlockedIds([]);
      }
    });

    // Refresh data every 30 seconds (less aggressive than before)
    const interval = setInterval(loadData, 30000);

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => setToast({ message, type });
  const closeToast = () => setToast(null);

  const handleItemClick = (item: AnyItem) => setSelectedItem(item);
  const closeItemModal = () => setSelectedItem(null);

  // --- User Actions ---
  const calculateLevel = () => {
      const totalXP = (likedIds.length * 10) + ((appliedIds.length + unlockedIds.length) * 50);
      return totalXP >= 1000 ? 3 : totalXP >= 300 ? 2 : 1;
  };
  const getRankName = (lv: number) => lv === 3 ? "부동산 고수" : lv === 2 ? "임대장" : "임린이";

  const toggleLike = async (id: number) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      showToast("로그인이 필요한 서비스입니다.", "error");
      return;
    }

    try {
      const newLikes = await database.toggleLike(currentUser.id, id);
      setLikedIds(newLikes);
      showToast(
        newLikes.includes(id) ? "관심 목록 추가! (+10 XP)" : "관심 목록에서 삭제되었습니다.",
        newLikes.includes(id) ? "success" : "info"
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      showToast("오류가 발생했습니다.", "error");
    }
  };

  const handleApply = async (id: number) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      showToast("로그인이 필요한 서비스입니다.", "error");
      return;
    }

    try {
      const success = await database.applyItem(currentUser.id, id);
      if (success) {
        setAppliedIds(prev => [...prev, id]);
        showToast("신청 완료! 경험치가 상승했습니다 (+50 XP)", "success");
      } else {
        showToast("이미 신청한 항목입니다.", "info");
      }
    } catch (error) {
      console.error('Error applying:', error);
      showToast("오류가 발생했습니다.", "error");
    }
  };

  const handleUnlock = async (id: number) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      showToast("로그인이 필요한 서비스입니다.", "error");
      return;
    }

    try {
      const success = await database.unlockReport(currentUser.id, id);
      if (success) {
        setUnlockedIds(prev => [...prev, id]);
        showToast("리포트 잠금 해제! (+50 XP)", "success");
      } else {
        showToast("이미 잠금 해제한 리포트입니다.", "info");
      }
    } catch (error) {
      console.error('Error unlocking:', error);
      showToast("오류가 발생했습니다.", "error");
    }
  };

  const handleLoginSuccess = async () => {
    const user = await getCurrentUser();
    if (user) {
      setCurrentUser(user);
      await loadUserInteractions(user.id);
      showToast(`${user.name}님, 환영합니다!`, "success");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      setLikedIds([]);
      setAppliedIds([]);
      setUnlockedIds([]);
      showToast("로그아웃 되었습니다.", "info");
    } catch (error) {
      showToast("로그아웃 실패", "error");
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      await database.updateUserProfile(updatedUser.id, updatedUser);
      setCurrentUser(updatedUser);
      showToast("프로필이 업데이트되었습니다.", "success");
    } catch (error) {
      console.error('Error updating user:', error);
      showToast("프로필 업데이트 실패", "error");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white dark:text-slate-900 font-bold text-xl">임</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      <Routes>
        <Route path="/admin" element={
            <AdminPage showToast={showToast} />
        } />
        <Route path="*" element={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-300">
              <div className="hidden lg:block">
                  <Sidebar onLoginClick={() => setIsLoginOpen(true)} currentUser={currentUser} showToast={showToast} isDarkMode={isDarkMode} toggleTheme={toggleTheme} onLogout={handleLogout} userLevel={calculateLevel()} userRank={getRankName(calculateLevel())} />
              </div>
              <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden">
                <main className="flex-1 p-4 md:p-6 lg:p-10 pb-24 lg:pb-10 relative">
                    <div className="lg:hidden flex items-center justify-between mb-6 pt-2">
                        <div className="flex items-center gap-2"><div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center"><span className="text-white dark:text-slate-900 font-extrabold text-sm">임</span></div><span className="font-extrabold text-xl text-slate-900 dark:text-white">임풋</span></div>
                        <div className="flex items-center gap-3">
                            <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{isDarkMode ? '☀️' : '🌙'}</button>
                            {currentUser ? ( <div className="flex items-center gap-2" onClick={handleLogout}><img src={currentUser.avatar} className="w-8 h-8 rounded-full border border-slate-200" alt="profile"/></div> ) : ( <button onClick={() => setIsLoginOpen(true)} className="text-sm font-bold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">로그인</button> )}
                        </div>
                    </div>
                    <Routes>
                        <Route path="/" element={<Home onItemClick={handleItemClick} likedIds={likedIds} toggleLike={toggleLike} slides={globalData.slides} notifications={globalData.notifications} brandTagline={globalData.tagline} dailyBriefing={globalData.briefing} />} />
                        <Route path="/networking" element={<CategoryPage categoryType="networking" items={items.filter(i=>i.categoryType==='networking')} headerInfo={globalData.headers.networking} detailImage={globalData.detailImages.networking} badges={[{label: "전체", value: "all"}, {label: "모집중", value: "open"}, {label: "종료됨", value: "ended"}]} onItemClick={handleItemClick} likedIds={likedIds} toggleLike={toggleLike} />} />
                        <Route path="/minddate" element={<CategoryPage categoryType="minddate" items={items.filter(i=>i.categoryType==='minddate')} headerInfo={globalData.headers.minddate} detailImage={globalData.detailImages.minddate} badges={[{label: "전체", value: "all"}, {label: "모집중", value: "open"}, {label: "종료됨", value: "ended"}]} onItemClick={handleItemClick} likedIds={likedIds} toggleLike={toggleLike} />} />
                        <Route path="/crew" element={<CategoryPage categoryType="crew" items={items.filter(i=>i.categoryType==='crew')} headerInfo={globalData.headers.crew} detailImage={globalData.detailImages.crew} badges={[{label: "크루 모집", value: "recruit"}, {label: "임장 리포트", value: "report"}]} onItemClick={handleItemClick} likedIds={likedIds} toggleLike={toggleLike} />} />
                        <Route path="/lecture" element={<CategoryPage categoryType="lecture" items={items.filter(i=>i.categoryType==='lecture')} headerInfo={globalData.headers.lecture} detailImage={globalData.detailImages.lecture} badges={[{label: "전체", value: "all"}, {label: "온라인(VOD)", value: "VOD"}, {label: "오프라인", value: "오프라인"}]} onItemClick={handleItemClick} likedIds={likedIds} toggleLike={toggleLike} />} />
                        <Route path="/mypage" element={<MyPage likedIds={likedIds} appliedIds={appliedIds} unlockedIds={unlockedIds} onItemClick={handleItemClick} toggleLike={toggleLike} currentUser={currentUser} onUpdateUser={handleUpdateUser} showToast={showToast} />} />
                    </Routes>
                </main>
                <Footer />
              </div>
              <BottomNav />
              {showScrollTop && ( <button onClick={scrollToTop} className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-50 p-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-full shadow-xl hover:bg-slate-700 dark:hover:bg-indigo-500 transition-all hover:scale-110 active:scale-90 animate-in fade-in zoom-in duration-300"> <ArrowUp size={24} /> </button> )}
              {selectedItem && ( <Modal item={selectedItem} onClose={closeItemModal} isLiked={likedIds.includes(selectedItem.id)} toggleLike={() => toggleLike(selectedItem.id)} isApplied={appliedIds.includes(selectedItem.id)} isUnlocked={unlockedIds.includes(selectedItem.id)} onApply={handleApply} onUnlock={handleUnlock} showToast={showToast} /> )}
              <LoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onSuccess={handleLoginSuccess}
                showToast={showToast}
              />
            </div>
        } />
      </Routes>
    </HashRouter>
  );
};
export default App;
