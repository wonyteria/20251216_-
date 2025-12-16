
import { networkingList, matchingList, crewList, lectureList, slides as defaultSlides } from '../constants';
import { AnyItem, User, Slide, BriefingItem, CategoryHeaderInfo } from '../types';

// Storage Keys
const KEYS = {
  USERS: 'imfoot_users',
  ITEMS: 'imfoot_items',
  SLIDES: 'imfoot_slides',
  NOTIS: 'imfoot_notifications',
  BRIEFING: 'imfoot_briefing',
  HEADERS: 'imfoot_headers',
  BANNER: 'imfoot_mypage_banner',
  DETAIL_IMGS: 'imfoot_detail_images',
  TAGLINE: 'imfoot_tagline',
  COMMISSION: 'imfoot_commission',
  REVIEWS: 'imfoot_reviews', // { itemId: number, reviews: Review[] }
  TRANSACTIONS: 'imfoot_transactions', // { userId, itemId, amount, type, status, date }
};

// Default Data Initialization
const initializeData = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(KEYS.ITEMS)) {
    const allItems = [...networkingList, ...matchingList, ...crewList, ...lectureList];
    localStorage.setItem(KEYS.ITEMS, JSON.stringify(allItems));
  }
  if (!localStorage.getItem(KEYS.SLIDES)) {
    localStorage.setItem(KEYS.SLIDES, JSON.stringify(defaultSlides));
  }
  if (!localStorage.getItem(KEYS.NOTIS)) {
    localStorage.setItem(KEYS.NOTIS, JSON.stringify([
      "🔥 [마감임박] 강남 청약 스터디 2자리 남았습니다!",
      "💘 [매칭] 방금 '30대 직장인 소개팅' 남성 1명 신청완료",
      "👟 [모집] 마포구 임장 크루 리더가 코스를 업데이트했습니다.",
      "🎓 [신규] '2025 부동산 전망' VOD가 업로드 되었습니다."
    ]));
  }
  if (!localStorage.getItem(KEYS.BRIEFING)) {
    localStorage.setItem(KEYS.BRIEFING, JSON.stringify([
       { id: 1, text: "금리 인하 기대감: 코픽스 금리 2개월 연속 하락, 대출 숨통 트이나?", highlight: "금리 인하 기대감" },
       { id: 2, text: "강남 3구: 토지거래허가구역 재지정 이슈 체크 필수.", highlight: "강남 3구" },
       { id: 3, text: "임풋 Tip: 지금은 추격 매수보다 급매물 모니터링이 필요한 시점.", highlight: "임풋 Tip" }
    ]));
  }
  if (!localStorage.getItem(KEYS.HEADERS)) {
    localStorage.setItem(KEYS.HEADERS, JSON.stringify({
      networking: { title: "📚 스터디 & 네트워킹", description: "함께 공부하고 성장하는 부동산 커뮤니티." },
      minddate: { title: "💘 마인드데이트", description: "재테크 가치관이 맞는 소중한 인연을 찾아보세요." },
      crew: { title: "🏃 임장 크루", description: "혼자서는 막막한 임장, 전문가 리더와 함께 걸어요." },
      lecture: { title: "🎓 재테크 강의", description: "검증된 전문가의 노하우를 배우는 프리미엄 클래스." }
    }));
  }
};

// Helper for LocalStorage
const get = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : fallback;
};

const set = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

// --- Mock Database API ---
export const db = {
  init: initializeData,

  // Users
  getUsers: (): User[] => get(KEYS.USERS, []),
  updateUser: (updatedUser: User) => {
    const users = get<User[]>(KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === updatedUser.id);
    if (idx >= 0) users[idx] = updatedUser;
    else users.push(updatedUser);
    set(KEYS.USERS, users);
    
    // If updating current logged in user
    const currentUser = get<User | null>('imfoot_user', null);
    if (currentUser && currentUser.id === updatedUser.id) {
        set('imfoot_user', updatedUser);
    }
  },

  // Items (Products)
  getItems: (): AnyItem[] => get(KEYS.ITEMS, []),
  updateItem: (updatedItem: AnyItem) => {
    const items = get<AnyItem[]>(KEYS.ITEMS, []);
    const idx = items.findIndex(i => i.id === updatedItem.id);
    if (idx >= 0) items[idx] = updatedItem;
    else items.unshift(updatedItem); // Add new item to top
    set(KEYS.ITEMS, items);
  },
  
  // Interactions
  toggleLike: (userId: number, itemId: number) => {
    const key = `likes_${userId}`;
    const likes = get<number[]>(key, []);
    const newLikes = likes.includes(itemId) ? likes.filter(id => id !== itemId) : [...likes, itemId];
    set(key, newLikes);
    return newLikes;
  },
  
  applyItem: (userId: number, itemId: number) => {
    const key = `applies_${userId}`;
    const applies = get<number[]>(key, []);
    if (!applies.includes(itemId)) {
        set(key, [...applies, itemId]);
        
        // Update Item Sales Count
        const items = get<AnyItem[]>(KEYS.ITEMS, []);
        const itemIdx = items.findIndex(i => i.id === itemId);
        if(itemIdx >= 0) {
            const item = items[itemIdx] as any;
            if(item.categoryType === 'networking') item.currentParticipants = (item.currentParticipants || 0) + 1;
            else if(item.categoryType === 'crew') item.purchaseCount = (item.purchaseCount || 0) + 1;
            items[itemIdx] = item;
            set(KEYS.ITEMS, items);
        }
        return true;
    }
    return false;
  },

  unlockReport: (userId: number, itemId: number) => {
    const key = `unlocks_${userId}`;
    const unlocks = get<number[]>(key, []);
    if (!unlocks.includes(itemId)) {
        set(key, [...unlocks, itemId]);
        return true;
    }
    return false;
  },

  // Configuration
  getSlides: (): Slide[] => get(KEYS.SLIDES, defaultSlides),
  setSlides: (slides: Slide[]) => set(KEYS.SLIDES, slides),

  getNotifications: (): string[] => get(KEYS.NOTIS, []),
  setNotifications: (notis: string[]) => set(KEYS.NOTIS, notis),

  getBriefing: (): BriefingItem[] => get(KEYS.BRIEFING, []),
  setBriefing: (briefing: BriefingItem[]) => set(KEYS.BRIEFING, briefing),

  getCategoryHeaders: () => get(KEYS.HEADERS, {}),
  setCategoryHeaders: (headers: any) => set(KEYS.HEADERS, headers),

  getCommissionRate: () => get(KEYS.COMMISSION, 15),
  setCommissionRate: (rate: number) => set(KEYS.COMMISSION, rate),

  getMyPageBanner: () => get(KEYS.BANNER, "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&q=80&w=1600"),
  setMyPageBanner: (url: string) => set(KEYS.BANNER, url),

  getDetailImages: () => get(KEYS.DETAIL_IMGS, {
    networking: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2000",
    minddate: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=2000",
    crew: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=2000",
    lecture: "https://images.unsplash.com/photo-1544531696-fa3693fb4b38?auto=format&fit=crop&q=80&w=2000"
  }),
  setDetailImages: (imgs: any) => set(KEYS.DETAIL_IMGS, imgs),

  getTagline: () => get(KEYS.TAGLINE, "나와 같은 방향을 걷는 사람들을 만나는 곳, 임풋"),
  setTagline: (txt: string) => set(KEYS.TAGLINE, txt),

  // Transactions (Settlement)
  getMyCreatedItems: (userEmail: string) => {
      // In a real app, this would filter by author ID. 
      // Here we filter items where author name matches or if user is admin we might show all.
      // For demo, we just return the global items filtered by the user's name logic or specific demo logic
      const allItems = get<AnyItem[]>(KEYS.ITEMS, []);
      // Filter items created by this user
      return allItems.filter(i => (i as any).hostEmail === userEmail || i.author === userEmail || (i.id > 900)); // 900+ are manually added demo items
  }
};
