
import React from 'react';
import { MapPin, Eye, Users, Heart, Lock, Unlock, Crown } from 'lucide-react';
import Badge from './Badge';
import { AnyItem, CrewItem, LectureItem, MatchingItem, NetworkingItem } from '../types';

interface CardProps {
  item: AnyItem;
  onClick: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
}

const Card: React.FC<CardProps> = ({ item, onClick, isLiked, onToggleLike }) => {
  const isEnded = item.status === 'ended' || item.status === 'closed';

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike();
  };

  const LikeButton = () => (
    <button 
        onClick={handleLike}
        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10 ${isLiked ? 'bg-pink-50 text-pink-500' : 'bg-black/20 text-white hover:bg-black/30'}`}
    >
        <Heart size={18} className={isLiked ? 'fill-pink-500' : ''} />
    </button>
  );

  // --- 1. MindDate Card Style ---
  if (item.categoryType === 'minddate') {
    const matchItem = item as MatchingItem;
    return (
        <div 
          onClick={onClick}
          className={`group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full relative ${isEnded ? '' : 'hover:-translate-y-1'}`}
        >
          <div className="relative h-64 overflow-hidden">
            <img 
              src={item.img} 
              alt={item.title} 
              className={`w-full h-full object-cover transition-transform duration-700 ${isEnded ? 'grayscale-[0.8] brightness-50' : 'group-hover:scale-105'}`}
            />
            {!isEnded && <LikeButton />}
            {isEnded ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center animate-in fade-in">
                    <Heart className="w-12 h-12 text-pink-500 fill-pink-500 mb-2 drop-shadow-lg" />
                    <span className="text-2xl font-black drop-shadow-md">
                        {matchItem.matchedCouples ? `${matchItem.matchedCouples}커플 탄생!` : '매칭 종료'}
                    </span>
                    <span className="text-sm opacity-90 mt-1">다음 기회를 노려보세요</span>
                </div>
            ) : (
                <div className="absolute top-3 left-3 flex gap-1">
                    <Badge variant="pink">{item.type === 'dating' ? '소개팅' : '친구'}</Badge>
                    <span className="bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full flex items-center border border-white/10">
                        {item.loc}
                    </span>
                </div>
            )}
          </div>
          <div className="p-5 flex flex-col flex-grow relative">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 leading-snug">{item.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{item.desc}</p>
            <div className="mt-auto flex items-center justify-between">
                <span className="text-pink-600 font-bold">{item.price}</span>
                <button className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${isEnded ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 group-hover:bg-pink-100 dark:group-hover:bg-pink-900/50'}`}>
                    {isEnded ? '종료됨' : '신청하기'}
                </button>
            </div>
          </div>
        </div>
    );
  }

  // --- 2. Crew Card Style ---
  if (item.categoryType === 'crew') {
    const crewItem = item as CrewItem;
    const isReport = crewItem.type === 'report';
    
    // REPORT STYLE
    if (isReport) {
        const isBest = (crewItem.purchaseCount || 0) >= 1000;
        const isFree = crewItem.price === '무료' || !crewItem.price;

        return (
            <div onClick={onClick} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg cursor-pointer relative flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                <div className="relative h-48 overflow-hidden">
                    <img src={item.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <LikeButton />
                    
                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex gap-1">
                        <span className="bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-slate-700">리포트</span>
                        {isBest && <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1"><Crown size={10} className="fill-yellow-900"/> BEST</span>}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="flex justify-between items-end">
                             <span className="text-xs font-medium opacity-90">{item.date}</span>
                             <div className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${isFree ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'}`}>
                                 {isFree ? <Unlock size={10} /> : <Lock size={10} />}
                                 {isFree ? 'FREE' : item.price}
                             </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                        {crewItem.leaderProfile ? (
                            <img src={crewItem.leaderProfile} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                        )}
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.author}</span>
                        <div className="ml-auto flex gap-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-0.5"><Eye size={10}/> {item.views > 999 ? (item.views/1000).toFixed(1) + 'k' : item.views}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // RECRUIT STYLE
    return (
        <div onClick={onClick} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all cursor-pointer relative hover:-translate-y-1">
            <div className="relative h-56">
                <img src={item.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                <LikeButton />
                
                {!isEnded && (
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                         <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">모집중</span>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 w-full p-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md ${crewItem.level === '실전' ? 'bg-red-500/80' : 'bg-emerald-500/80'}`}>{crewItem.level}</span>
                        <span className="text-xs font-medium opacity-90">{item.loc}</span>
                    </div>
                    <h3 className="font-bold text-lg leading-tight drop-shadow-md">{item.title}</h3>
                </div>
            </div>
            <div className="p-4 flex items-center justify-between bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3">
                    <img src={crewItem.leaderProfile || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover" />
                    <div>
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">LEADER</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{crewItem.leader}</p>
                    </div>
                </div>
                <div className="text-right">
                     <p className="text-xs text-slate-500 dark:text-slate-400">{item.date}</p>
                     <p className="text-emerald-600 dark:text-emerald-400 font-bold">{item.price}</p>
                </div>
            </div>
        </div>
    );
  }

  // --- 3. Lecture Card Style ---
  if (item.categoryType === 'lecture') {
    const lectureItem = item as LectureItem;
    return (
        <div onClick={onClick} className="group cursor-pointer">
            <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-all">
                <img src={item.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                {!isEnded && <LikeButton />}
                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    {lectureItem.format}
                </div>
                <div className="absolute top-2 left-2">
                    <Badge variant="purple">{item.author}</Badge>
                </div>
            </div>
            <div className="flex gap-3">
                <img src={lectureItem.teacherProfile || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full object-cover mt-1 bg-slate-100 dark:bg-slate-800" />
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white leading-snug mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 line-clamp-1">{item.desc}</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{item.price}</p>
                </div>
            </div>
        </div>
    );
  }

  // --- 4. Networking Card Style ---
  const netItem = item as NetworkingItem;
  return (
    <div 
      onClick={onClick}
      className={`group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full relative ${isEnded ? 'opacity-90' : 'hover:-translate-y-1'}`}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={isEnded && netItem.groupPhoto ? netItem.groupPhoto : item.img} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <LikeButton />
        <div className="absolute top-3 left-3">
           <Badge variant={netItem.type === 'study' ? 'primary' : 'warning'}>{netItem.type === 'study' ? '스터디' : '친목'}</Badge>
        </div>
        {isEnded && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                 <div className="text-center text-white">
                    <Users className="mx-auto mb-1 w-8 h-8" />
                    <span className="font-bold">활동 종료</span>
                 </div>
            </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 line-clamp-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {item.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
            <MapPin size={14} />
            <span className="truncate">{item.loc || '지역무관'}</span>
            <span className="mx-1">•</span>
            <span>{item.date || '상시'}</span>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
            {item.desc}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className={`font-bold ${item.price ? 'text-slate-900 dark:text-slate-100' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {item.price || '무료'}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
            <Users size={12} /> {netItem.currentParticipants || 0}/{netItem.maxParticipants || 0}명
            </span>
        </div>
      </div>
    </div>
  );
};

export default Card;
