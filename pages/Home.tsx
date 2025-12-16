
import React, { useState, useEffect } from 'react';
import HeroSlider from '../components/HeroSlider';
import Card from '../components/Card';
import { networkingList, matchingList, crewList, lectureList } from '../constants';
import { ChevronRight, Heart, Users, Map, Bell, Quote, Star, ArrowUpRight, TrendingUp, TrendingDown, Lock, Unlock, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnyItem, Review, Slide, BriefingItem } from '../types';

interface HomeProps {
  onItemClick: (item: AnyItem) => void;
  likedIds: number[];
  toggleLike: (id: number) => void;
  slides: Slide[];
  notifications: string[];
  brandTagline: string;
  dailyBriefing: BriefingItem[];
}

const SectionHeader: React.FC<{ title: string; link: string }> = ({ title, link }) => (
  <div className="flex items-center justify-between mb-4 mt-2">
    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
    <Link to={link} className="text-sm font-medium text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center transition-colors">
      더보기 <ChevronRight size={16} />
    </Link>
  </div>
);

const DailyPulse: React.FC<{ briefing: BriefingItem[] }> = ({ briefing }) => {
    const [voted, setVoted] = useState<'up' | 'down' | null>(null);
    const [stats, setStats] = useState({ up: 65, down: 35 }); // Mock initial stats
    const [showBriefing, setShowBriefing] = useState(false);

    const handleVote = (type: 'up' | 'down') => {
        if (voted) return;
        setVoted(type);
        // Simulate stat change
        if (type === 'up') setStats({ up: 66, down: 34 });
        else setStats({ up: 64, down: 36 });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            {/* 1. Daily Sentiment Vote (Exclusive Data) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md mb-2 inline-block">Daily Exclusive</span>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">오늘의 부동산 심리 지표 <span className="text-slate-400 font-normal text-sm ml-1">(Imput Index)</span></h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">지금 시장 분위기, 어떻게 보고 계신가요?</p>
                    </div>
                    {!voted && <div className="animate-bounce-slow text-xs font-bold text-pink-500 bg-pink-50 dark:bg-pink-900/20 px-3 py-1 rounded-full">투표하고 결과 보기</div>}
                </div>

                {!voted ? (
                    <div className="flex gap-4 mt-6">
                        <button 
                            onClick={() => handleVote('up')}
                            className="flex-1 py-8 rounded-xl border-2 border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-300 transition-all group flex flex-col items-center justify-center gap-2"
                        >
                            <TrendingUp size={32} className="text-red-500 group-hover:scale-110 transition-transform"/>
                            <span className="font-bold text-red-600 dark:text-red-400 text-lg">상승 / 매수 우위 🔥</span>
                        </button>
                        <button 
                            onClick={() => handleVote('down')}
                            className="flex-1 py-8 rounded-xl border-2 border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 transition-all group flex flex-col items-center justify-center gap-2"
                        >
                            <TrendingDown size={32} className="text-blue-500 group-hover:scale-110 transition-transform"/>
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">하락 / 관망세 ❄️</span>
                        </button>
                    </div>
                ) : (
                    <div className="mt-6 animate-in fade-in zoom-in duration-300">
                         <div className="flex justify-between items-end mb-2">
                             <span className="text-red-500 font-black text-3xl">{stats.up}%</span>
                             <span className="text-sm font-bold text-slate-400 mb-1">참여자 1,240명</span>
                             <span className="text-blue-500 font-black text-3xl">{stats.down}%</span>
                         </div>
                         <div className="h-6 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex relative">
                             <div style={{ width: `${stats.up}%` }} className="h-full bg-gradient-to-r from-orange-500 to-red-500 relative">
                                 {voted === 'up' && <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-ping"></div>}
                             </div>
                             <div style={{ width: `${stats.down}%` }} className="h-full bg-gradient-to-l from-cyan-500 to-blue-500 relative">
                                 {voted === 'down' && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-ping"></div>}
                             </div>
                             {/* Center Line */}
                             <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50 z-10"></div>
                         </div>
                         <div className="flex justify-between text-xs font-bold mt-2">
                             <span className="text-red-600 dark:text-red-400">상승 우세</span>
                             <span className="text-blue-600 dark:text-blue-400">하락 우세</span>
                         </div>
                         <p className="text-center text-sm text-slate-500 mt-4 bg-slate-50 dark:bg-slate-800 py-2 rounded-lg">
                             {voted === 'up' ? '📈 상승장에 한 표를 던지셨네요!' : '📉 보수적인 관점으로 투표하셨군요.'} <span className="font-bold text-indigo-600">+5 XP 획득!</span>
                         </p>
                    </div>
                )}
            </div>

            {/* 2. Daily Insight Briefing (Content Hook) */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-indigo-900 dark:to-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Lightbulb size={100} className="text-yellow-300" />
                </div>
                
                <div>
                    <h3 className="font-bold text-lg text-yellow-300 mb-4 flex items-center gap-2">
                        <Lightbulb size={20}/> 오늘의 숏-인사이트
                    </h3>
                    
                    {showBriefing ? (
                         <div className="space-y-3 animate-in fade-in slide-in-from-right duration-300">
                             {briefing.length > 0 ? (
                                 briefing.map((item, index) => (
                                    <div key={item.id} className="flex gap-2 items-start">
                                        <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0"/>
                                        <p className="text-sm text-slate-200 leading-snug">
                                            <span className="font-bold text-white">{item.highlight}:</span> {item.text.replace(item.highlight + ':', '').trim()}
                                        </p>
                                    </div>
                                 ))
                             ) : (
                                 <p className="text-sm text-slate-400">오늘의 요약 정보가 아직 업데이트되지 않았습니다.</p>
                             )}
                         </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-center opacity-80">
                            <Lock size={32} className="mb-2 text-slate-400"/>
                            <p className="text-sm text-slate-300">오늘의 부동산 요약 정보를<br/>확인하시겠습니까?</p>
                        </div>
                    )}
                </div>

                {!showBriefing && (
                    <button 
                        onClick={() => setShowBriefing(true)}
                        className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                        <Unlock size={16} /> 인사이트 잠금해제 (무료)
                    </button>
                )}
                
                {showBriefing && (
                    <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-400 text-center">
                        매일 아침 9시 업데이트 됩니다.
                    </div>
                )}
            </div>
        </div>
    );
}

const Home: React.FC<HomeProps> = ({ onItemClick, likedIds, toggleLike, slides, notifications, brandTagline, dailyBriefing }) => {
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    if (notifications.length === 0) return;
    const timer = setInterval(() => {
        setTickerIndex(prev => (prev + 1) % notifications.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [notifications.length]);

  const allItems = [...networkingList, ...matchingList, ...crewList, ...lectureList];
  const allReviews: {review: Review, itemTitle: string, type: string}[] = [];
  allItems.forEach(item => {
      if(item.reviews) {
          item.reviews.forEach(r => {
              allReviews.push({
                  review: r,
                  itemTitle: item.title,
                  type: item.categoryType
              });
          });
      }
  });
  const displayReviews = allReviews.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      
        {/* Live Ticker */}
        {notifications.length > 0 && (
            <div className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-2.5 rounded-full mb-6 flex items-center gap-3 shadow-lg mx-1 overflow-hidden">
                <span className="bg-pink-500 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse flex-shrink-0">LIVE</span>
                <div className="flex-1 overflow-hidden relative h-5">
                    <p className="text-sm font-medium truncate absolute w-full transition-all duration-500" key={tickerIndex}>
                        {notifications[tickerIndex]}
                    </p>
                </div>
                <Bell size={14} className="text-slate-400" />
            </div>
        )}

        <HeroSlider slides={slides} />

        {/* Exclusive Daily Content (Hook) */}
        <DailyPulse briefing={dailyBriefing} />

        {/* Brand Tagline */}
        <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <h2 className="text-lg md:text-2xl font-medium text-slate-700 dark:text-slate-300 tracking-tight leading-relaxed font-serif italic">
                {brandTagline}
            </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <Link to="/minddate" className="group flex items-center gap-5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-pink-100 dark:hover:border-pink-900 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-150 fill-mode-backwards">
                <div className="w-12 h-12 rounded-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform duration-300 border border-pink-100 dark:border-pink-900/30">
                    <Heart size={22} className="fill-pink-500" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-0.5 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">가치관 매칭</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">경제관이 통하는 소중한 인연</p>
                </div>
                <ArrowUpRight className="ml-auto text-slate-300 dark:text-slate-600 group-hover:text-pink-400 transition-colors" size={20} />
            </Link>

            <Link to="/crew" className="group flex items-center gap-5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-100 dark:hover:border-emerald-900 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-300 fill-mode-backwards">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300 border border-emerald-100 dark:border-emerald-900/30">
                    <Map size={22} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">임장 크루</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">전문가와 함께 걷는 현장</p>
                </div>
                <ArrowUpRight className="ml-auto text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" size={20} />
            </Link>

            <Link to="/networking" className="group flex items-center gap-5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-500 fill-mode-backwards">
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 border border-indigo-100 dark:border-indigo-900/30">
                    <Users size={22} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">스터디 모임</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">함께 성장하는 오프라인 네트워킹</p>
                </div>
                <ArrowUpRight className="ml-auto text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" size={20} />
            </Link>
        </div>

        <div className="space-y-16">
            <section>
            <SectionHeader title="💘 마인드데이트" link="/minddate" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {matchingList.slice(0, 4).map((item, index) => (
                    <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 100}ms` }}>
                        <Card item={item} onClick={() => onItemClick(item)} isLiked={likedIds.includes(item.id)} onToggleLike={() => toggleLike(item.id)} />
                    </div>
                    ))}
            </div>
            </section>

            <section>
            <SectionHeader title="🔥 핫한 임장 크루" link="/crew" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {crewList.filter(i => i.type === 'recruit').slice(0, 4).map((item, index) => (
                <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 100}ms` }}>
                    <Card item={item} onClick={() => onItemClick(item)} isLiked={likedIds.includes(item.id)} onToggleLike={() => toggleLike(item.id)} />
                </div>
                ))}
            </div>
            </section>

            <section>
            <SectionHeader title="📖 베스트 임장 리포트" link="/crew" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {crewList.filter(i => i.type === 'report').slice(0, 4).map((item, index) => (
                <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 100}ms` }}>
                    <Card item={item} onClick={() => onItemClick(item)} isLiked={likedIds.includes(item.id)} onToggleLike={() => toggleLike(item.id)} />
                </div>
                ))}
            </div>
            </section>

            <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <SectionHeader title="📚 스터디 & 네트워킹" link="/networking" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {networkingList.slice(0, 2).map((item, index) => (
                        <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 100}ms` }}>
                            <Card item={item} onClick={() => onItemClick(item)} isLiked={likedIds.includes(item.id)} onToggleLike={() => toggleLike(item.id)} />
                        </div>
                        ))}
                    </div>
                </div>
                <div>
                    <SectionHeader title="🎓 재테크 강의" link="/lecture" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {lectureList.slice(0, 2).map((item, index) => (
                        <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 100}ms` }}>
                            <Card item={item} onClick={() => onItemClick(item)} isLiked={likedIds.includes(item.id)} onToggleLike={() => toggleLike(item.id)} />
                        </div>
                        ))}
                    </div>
                </div>
            </div>
            </section>

            {/* Real Reviews Section */}
            <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white text-center mb-8">
                    임풋 멤버들의 <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 rounded-lg">찐 후기</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayReviews.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${idx * 100}ms` }}>
                            <Quote className="absolute top-4 right-4 text-slate-100 dark:text-slate-800 fill-slate-100 dark:fill-slate-800 w-10 h-10" />
                            <div className="flex items-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} className={`${i < item.review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-700'}`} />
                                ))}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">"{item.review.text}"</p>
                            <div className="flex items-center gap-3 border-t border-slate-50 dark:border-slate-800 pt-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                                    {item.review.user.charAt(0)}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.review.user}</p>
                                    <p className="text-xs text-slate-400 truncate">{item.itemTitle}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-8">
                    <button className="text-slate-500 dark:text-slate-400 font-bold text-sm hover:text-slate-800 dark:hover:text-slate-200 underline underline-offset-4">후기 더보기</button>
                </div>
            </section>
        </div>
    </div>
  );
};

export default Home;
