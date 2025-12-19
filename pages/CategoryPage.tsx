
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { AnyItem, CategoryType, BadgeConfig, CrewItem, CategoryHeaderInfo, User } from '../types';
import { Quote, Star, SearchX, ChevronDown, ChevronUp, BookOpen, Plus } from 'lucide-react';
import CreateContentModal from '../components/CreateContentModal';
import ReviewWriteModal from '../components/ReviewWriteModal';
import * as database from '../services/database';
import { Review } from '../types';

interface CategoryPageProps {
  categoryType: CategoryType;
  items: AnyItem[];
  badges: BadgeConfig[];
  headerInfo: CategoryHeaderInfo; // New prop for dynamic text
  onItemClick: (item: AnyItem) => void;
  likedIds: number[];
  toggleLike: (id: number) => void;
  appliedIds?: number[];
  appStatuses?: Record<number, string>;
  detailImage?: string;
  currentUser: User | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  // bannerImg prop is removed as per request to focus on text header
}

const CategoryPage: React.FC<CategoryPageProps> = ({
  categoryType,
  items,
  badges,
  headerInfo,
  onItemClick,
  likedIds,
  toggleLike,
  appliedIds,
  appStatuses,
  detailImage,
  currentUser,
  showToast
}) => {
  const [filter, setFilter] = useState('all');
  const [filteredItems, setFilteredItems] = useState<AnyItem[]>(items);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [categoryReviews, setCategoryReviews] = useState<Review[]>([]);
  const [reviewableCount, setReviewableCount] = useState(0);

  useEffect(() => {
    const loadReviews = async () => {
      const reviews = await database.getReviewsByCategory(categoryType);
      setCategoryReviews(reviews);
    };
    loadReviews();

    if (currentUser) {
      database.getReviewableItems(currentUser.id).then(items => {
        setReviewableCount(items.length);
      });
    }
  }, [categoryType, currentUser]);

  // Check if user can create content in this category
  const canCreate = currentUser?.roles?.some(r => r === 'super_admin' || r === `${categoryType}_manager`);

  // Dynamic Header derived from props
  const { title, description } = headerInfo;

  let reviewTitle = "생생한 참여 후기";
  if (categoryType === 'minddate') {
    reviewTitle = "💘 설레는 만남 후기";
  } else if (categoryType === 'crew') {
    reviewTitle = "👟 임장 크루 찐 후기";
  } else if (categoryType === 'networking') {
    reviewTitle = "📚 멤버들의 성장 후기";
  } else if (categoryType === 'lecture') {
    reviewTitle = "🎓 수강생 리얼 후기";
  }

  useEffect(() => {
    if (categoryType === 'crew') {
      setFilter('recruit');
    } else {
      setFilter('all');
    }
  }, [categoryType]);

  useEffect(() => {
    let result = [...items];

    if (filter !== 'all') {
      if (categoryType === 'lecture') {
        result = result.filter((i: any) => i.format === filter);
      } else {
        result = result.filter((i: any) => i.type === filter);
      }
    }

    if (categoryType === 'crew' && filter === 'report') {
      result.sort((a, b) => {
        const countA = (a as CrewItem).purchaseCount || 0;
        const countB = (b as CrewItem).purchaseCount || 0;
        return countB - countA;
      });
    }

    setFilteredItems(result);
  }, [filter, items, categoryType]);

  const reviewedItems = items.filter(i => i.reviews && i.reviews.length > 0);

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Minimal Header (Dynamic Text) */}
      <div className="pt-4 pb-6 px-1">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{title}</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">{description}</p>
      </div>

      {/* Detail Image Preview (Peek) - Fixed for Long Images */}
      {detailImage && (
        <div className="relative mb-8 group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div
            className={`relative w-full bg-slate-50 dark:bg-slate-900 transition-all duration-700 ease-in-out ${isDetailExpanded
              ? 'max-h-[75vh] overflow-y-auto custom-scrollbar'
              : 'max-h-60 md:max-h-96 overflow-hidden'
              }`}
          >
            <img
              src={detailImage}
              alt={`${title} 상세 가이드`}
              className="w-full h-auto object-top"
            />

            {/* Gradient Overlay for Collapsed State */}
            {!isDetailExpanded && (
              <div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-slate-900 flex flex-col justify-end items-center pb-6 cursor-pointer"
                onClick={() => setIsDetailExpanded(true)}
              >
                <button className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-bold shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:scale-105 transition-transform text-slate-900 dark:text-white animate-bounce-slow">
                  <BookOpen size={16} className="text-indigo-500" /> 이용 가이드 펼쳐보기 <ChevronDown size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Fold Button for Expanded State */}
          {isDetailExpanded && (
            <div className="text-center py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-10 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button onClick={() => setIsDetailExpanded(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-bold flex items-center justify-center gap-1 mx-auto px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <ChevronUp size={16} /> 가이드 접기
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sticky Tabs */}
      <div className="flex items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur z-20 pt-4 -mx-4 px-4 md:mx-0 md:px-0 transition-colors duration-300">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 flex-1">
          {badges.map((badge) => (
            <button
              key={badge.value}
              onClick={() => setFilter(badge.value)}
              className={`px-6 py-3 rounded-t-lg text-sm font-bold transition-all relative top-[1px] whitespace-nowrap ${filter === badge.value
                ? `text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-950`
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                }`}
            >
              {badge.label}
            </button>
          ))}
        </div>
        {canCreate && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 mb-2 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-200 dark:shadow-none hover:bg-indigo-500 transition-all text-xs md:text-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">콘텐츠 만들기</span>
            <span className="sm:hidden">만들기</span>
          </button>
        )}
        {currentUser && reviewableCount > 0 && (
          <button
            onClick={() => setIsWritingReview(true)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 mb-2 bg-amber-500 text-white rounded-xl font-bold shadow-md shadow-amber-200 dark:shadow-none hover:bg-amber-400 transition-all text-xs md:text-sm"
          >
            <Star size={16} />
            <span className="hidden sm:inline">후기 작성하기</span>
            <span className="sm:hidden">후기</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{reviewableCount}</span>
          </button>
        )}
      </div>

      {/* Grid Content */}
      {filteredItems.length > 0 ? (
        <div className={`grid gap-6 ${categoryType === 'lecture' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
          {filteredItems.map((item, index) => (
            <div key={item.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 50}ms` }}>
              <Card
                item={item}
                onClick={() => onItemClick(item)}
                isLiked={likedIds.includes(item.id)}
                onToggleLike={() => toggleLike(item.id)}
                isApplied={appliedIds?.includes(item.id)}
                applicationStatus={appStatuses?.[item.id] as any}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
            <SearchX size={32} />
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-bold text-lg mb-1">해당하는 콘텐츠가 없습니다.</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm">다른 필터를 선택하거나 나중에 다시 확인해주세요.</p>
        </div>
      )}

      {/* Review Section */}
      <div className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-end mb-8 px-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{reviewTitle}</h2>
            <p className="text-sm text-slate-400 mt-1">멤버들이 직접 남긴 솔직한 경험담</p>
          </div>
          {currentUser && reviewableCount > 0 && (
            <button
              onClick={() => setIsWritingReview(true)}
              className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              + 나도 후기 쓰기
            </button>
          )}
        </div>

        {categoryReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryReviews.slice(0, 6).map((review, idx) => (
              <div
                key={review.id}
                className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative hover:translate-y-[-4px] transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards group"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <Quote className="absolute top-6 right-8 text-slate-50 dark:text-slate-800/30 fill-slate-50 dark:fill-slate-800/30 w-12 h-12 transition-colors group-hover:text-indigo-50 dark:group-hover:text-indigo-900/10 group-hover:fill-indigo-50 dark:group-hover:fill-indigo-900/10" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
                    <img src={review.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user}`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white text-sm">{review.user}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={`${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-700'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-4 font-medium italic">
                  "{review.text}"
                </p>
                <div className="mt-6 flex justify-between items-center pt-6 border-t border-slate-50 dark:border-slate-800/50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{review.date}</p>
                  <div className="flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-tighter cursor-pointer hover:underline" onClick={() => onItemClick({ id: review.itemId } as any)}>
                    View Product <Plus size={10} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-sm">
              <Star size={32} />
            </div>
            <p className="font-bold text-slate-800 dark:text-slate-200">아직 등록된 후기가 없습니다.</p>
            <p className="text-sm text-slate-400 mt-1">첫 번째 리뷰의 주인공이 되어보세요!</p>
          </div>
        )}
      </div>

      {isCreating && (
        <CreateContentModal
          onClose={() => setIsCreating(false)}
          currentUser={currentUser}
          defaultCategory={categoryType === 'crew' ? 'crew' : categoryType as any}
          onSuccess={async () => {
            // Trigger global refresh
            if (currentUser) {
              const reviewable = await database.getReviewableItems(currentUser.id);
              setReviewableCount(reviewable.length);
            }
          }}
          showToast={showToast}
        />
      )}

      {isWritingReview && (
        <ReviewWriteModal
          onClose={() => setIsWritingReview(false)}
          currentUser={currentUser}
          onSuccess={async () => {
            const reviews = await database.getReviewsByCategory(categoryType);
            console.log("Fetched reviews:", reviews); // Added for debugging
            setCategoryReviews(reviews);
            const reviewable = await database.getReviewableItems(currentUser!.id);
            setReviewableCount(reviewable.length);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default CategoryPage;
