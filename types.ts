
export type CategoryType = 'networking' | 'minddate' | 'crew' | 'lecture';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar: string;
    roles: string[]; // 'super_admin', 'crew_manager', 'networking_manager', 'minddate_manager', 'lecture_manager'
    joinDate: string;
}

export interface Review {
  user: string;
  text: string;
  rating: number;
  date?: string;
  avatar?: string; // Optional user avatar
}

export interface BriefingItem {
  id: number;
  text: string;
  highlight: string;
}

export interface CategoryHeaderInfo {
  title: string;
  description: string;
}

export interface BaseItem {
  id: number;
  title: string;
  img: string;
  author: string;
  views: number;
  comments: number;
  desc: string;
  date?: string;
  price?: string | null;
  loc?: string;
  status: 'open' | 'closed' | 'ended'; // open: 모집중, closed: 마감, ended: 종료(후기/결과)
  reviews?: Review[];
  hostBankInfo?: string; // Host's bank account for direct transfers
  kakaoChatUrl?: string; // New: Kakao Open Chat URL for inquiries
  hostDescription?: string; // New: Host self-introduction text
  hostIntroImage?: string; // New: Host self-introduction image
}

export interface NetworkingItem extends BaseItem {
  categoryType: 'networking';
  type: 'study' | 'social';
  curriculum?: string[];
  currentParticipants?: number;
  maxParticipants?: number;
  groupPhoto?: string; // For ended items
}

export interface MatchingItem extends BaseItem {
  categoryType: 'minddate';
  type: 'dating' | 'friends';
  target?: string[];
  genderRatio?: { male: number; female: number }; // Percentage or Count
  matchedCouples?: number; // For ended items
  bankInfo?: string;
  refundPolicy?: string;
}

export interface CrewItem extends BaseItem {
  categoryType: 'crew';
  type: 'recruit' | 'report';
  leader?: string;
  leaderProfile?: string; // Image URL
  level?: '입문' | '중급' | '실전';
  course?: string[];
  // Report specific
  gallery?: string[]; 
  reportContent?: string; // Detailed report text
  relatedRecruitTitle?: string; // Which recruit this report belongs to
  purchaseCount?: number; // New: To track popularity
}

export interface LectureItem extends BaseItem {
  categoryType: 'lecture';
  format: 'VOD' | '오프라인';
  teacher: string;
  teacherProfile?: string;
  curriculum?: string[];
}

export type AnyItem = NetworkingItem | MatchingItem | CrewItem | LectureItem;

export interface Slide {
  title: string;
  desc: string;
  img: string;
}

export interface BadgeConfig {
  label: string;
  value: string;
}
