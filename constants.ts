

import { AnyItem, Slide, NetworkingItem, MatchingItem, CrewItem, LectureItem } from './types';

export const slides: Slide[] = [
  {
    title: "함께 부자가 되는 오프라인 커뮤니티, 임풋",
    desc: "혼자 하는 재테크는 외롭습니다. 땀 흘리며 함께 성장하는 즐거움을 현장에서 경험하세요.",
    img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1600",
  },
  {
    title: "가치관이 맞는 소중한 인연찾기",
    desc: "경제관과 라이프스타일이 통하는 짝, 임풋 마인드데이트에서 만나보세요.",
    img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1600",
  },
  {
    title: "책상 앞이 아닌 현장에서 답을 찾다",
    desc: "검증된 리더와 함께 걷는 임장 크루. 살아있는 부동산 공부가 시작됩니다.",
    img: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=1600",
  }
];

export const networkingList: NetworkingItem[] = [
  { 
    id: 1, categoryType: 'networking', type: "study", title: "강남/서초 청약 전략 스터디 3기", status: 'open', date: "1.20(토) 14:00", loc: "강남역 스터디룸", price: "30,000원", img: "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=800", author: "청약전문가", views: 1240, comments: 42, 
    desc: "가점이 낮아도 도전할 수 있는 강남권 청약 전략을 공유하고 공부합니다.",
    curriculum: ["1주차: 강남3구 분양 예정 단지 분석", "2주차: 가점제 vs 추첨제 전략", "3주차: 자금 조달 계획서 작성법", "4주차: 모의 청약 시뮬레이션"],
    currentParticipants: 6, maxParticipants: 8
  },
  { 
    id: 2, categoryType: 'networking', type: "social", title: "부동산 갭투자 초보 모임 (2030)", status: 'open', date: "1.24(수) 19:30", loc: "성수동 카페", price: "20,000원", img: "https://images.unsplash.com/photo-1515169067750-d51a73b50ac8?w=800", author: "투자새내기", views: 854, comments: 18, 
    desc: "소액으로 시작하는 지방 갭투자, 서로의 지역 분석을 공유해요.",
    curriculum: ["자기소개 및 투자 성향 파악", "최근 관심 지역 공유", "소액 투자 성공/실패 사례 토크", "네트워킹 타임"],
    currentParticipants: 12, maxParticipants: 20
  },
  { 
    id: 3, categoryType: 'networking', type: "study", title: "[마감] 경매 기초반 스터디 5기", status: 'closed', date: "1.15(금)", loc: "교대역", price: "50,000원", img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800", author: "경매왕", views: 2100, comments: 156, 
    desc: "종료된 스터디입니다.",
    curriculum: []
  },
  { 
    id: 4, categoryType: 'networking', type: "social", title: "임장 뒷풀이 & 와인 네트워킹", status: 'ended', date: "1.27(토)", loc: "한남동", price: "70,000원", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800", author: "임장러버", views: 1890, comments: 88, 
    desc: "하루 종일 임장하느라 고생하셨습니다. 와인 한 잔 하며 정보 교류해요.",
    groupPhoto: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
    curriculum: ["아이스브레이킹", "오늘의 임장 후기 나눔", "와인 테이스팅", "자유 네트워킹"],
    reviews: [
        { user: "와인러버", text: "임장 후에 마시는 와인이 이렇게 맛있는 줄 몰랐어요. 다양한 직군 분들과 이야기해서 좋았습니다.", rating: 5, date: "2024.01.28" },
        { user: "부린이", text: "처음이라 어색할 줄 알았는데 다들 너무 친절하게 알려주셔서 감사했습니다!", rating: 4.5, date: "2024.01.28" }
    ]
  },
  { 
    id: 5, categoryType: 'networking', type: "social", title: "한강 런닝 & 부동산 토크", status: 'ended', date: "지난 주말", loc: "여의도 한강공원", price: "무료", img: "https://images.unsplash.com/photo-1552674605-469523170d9e?w=800", author: "런닝맨", views: 920, comments: 12, 
    desc: "건강도 챙기고 정보도 나누는 건전한 모임이었습니다.",
    groupPhoto: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800",
    reviews: [
        { user: "건강최고", text: "상쾌하게 뛰고 맥주 한잔하면서 듣는 여의도 재건축 썰이 흥미진진했어요.", rating: 5, date: "2024.01.21" }
    ]
  },
  { 
    id: 6, categoryType: 'networking', type: "study", title: "세금(양도세/취득세) 완전 정복", status: 'open', date: "2.10(토)", loc: "강남역", price: "40,000원", img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800", author: "세무통", views: 3300, comments: 45, 
    desc: "복잡한 부동산 세금, 세무사님과 함께 뽀개봅시다.",
    currentParticipants: 30, maxParticipants: 40
  }
];

export const matchingList: MatchingItem[] = [
  { 
    id: 101, categoryType: 'minddate', type: "dating", title: "30대 직장인 부동산 가치관 매칭", status: 'open', date: "1.28(일) 14:00", loc: "청담동 라운지", price: "50,000원", img: "https://images.unsplash.com/photo-1563237023-b1e970526dcb?w=800", author: "매니저", views: 3200, comments: 85, 
    desc: "경제관과 부동산 투자에 관심 있는 30대 남녀를 위한 프리미엄 소개팅.",
    target: ["수도권 거주 30대 미혼 남녀", "부동산 투자에 관심이 많으신 분", "안정적인 직업을 가지신 분"],
    genderRatio: { male: 12, female: 10 },
    bankInfo: "우리은행 1002-123-456789 (주)임풋",
    refundPolicy: "행사 3일 전까지 100% 환불 가능합니다."
  },
  { 
    id: 102, categoryType: 'minddate', type: "dating", title: "1주택자 이상 미혼남녀 모임", status: 'open', date: "2.03(토) 18:00", loc: "여의도", price: "60,000원", img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800", author: "매니저", views: 4100, comments: 112, 
    desc: "내 집 마련에 성공한 공감대를 가진 분들의 만남.",
    target: ["본인 명의 주택 1채 이상 소유자", "결혼을 전제로 진지한 만남을 원하시는 분"],
    genderRatio: { male: 8, female: 8 },
    bankInfo: "우리은행 1002-123-456789 (주)임풋",
    refundPolicy: "행사 3일 전까지 100% 환불 가능합니다."
  },
  { 
    id: 103, categoryType: 'minddate', type: "dating", title: "전문직/대기업 재테크 소개팅", status: 'ended', date: "지난 달", loc: "강남역", price: "55,000원", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800", author: "매니저", views: 5600, comments: 210, 
    desc: "비슷한 수준의 경제력을 갖춘 분들의 만남.",
    matchedCouples: 4,
    reviews: [
      { user: "김OO", text: "대화가 너무 잘 통해서 시간 가는 줄 몰랐어요!", rating: 5, date: "2023.12.15" },
      { user: "이OO", text: "검증된 분들이라 안심하고 만날 수 있었습니다.", rating: 5, date: "2023.12.15" }
    ]
  },
  { 
    id: 104, categoryType: 'minddate', type: "dating", title: "주말 임장 데이트 매칭", status: 'ended', date: "지난 주", loc: "용산구", price: "30,000원", img: "https://images.unsplash.com/photo-1475721027767-4d563518e5c7?w=800", author: "매니저", views: 2100, comments: 40, 
    desc: "함께 걸으며 미래를 그릴 수 있는 짝을 찾았어요.",
    matchedCouples: 3,
    reviews: [
        { user: "박OO", text: "임장도 하고 데이트도 하고 일석이조! 끝나고 먹은 저녁도 맛있었습니다.", rating: 4.5, date: "2024.01.07" }
    ]
  },
  { 
    id: 105, categoryType: 'minddate', type: "dating", title: "와인과 함께하는 경제 토크", status: 'open', date: "2.14(수) 19:00", loc: "한남동 와인바", price: "80,000원", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800", author: "매니저", views: 1800, comments: 32, 
    desc: "로맨틱한 분위기 속에서 나누는 진지한 경제 이야기.",
    target: ["와인을 즐기는 2030", "재테크 대화가 통하는 이성 찾기"],
    genderRatio: { male: 5, female: 4 },
    bankInfo: "우리은행 1002-123-456789 (주)임풋",
    refundPolicy: "행사 5일 전까지 100% 환불."
  }
];

export const crewList: CrewItem[] = [
  // Recruit Items
  { 
    id: 11, categoryType: 'crew', type: "recruit", title: "마포구 아현/북아현 뉴타운 임장", status: 'open', leader: "재개발러", leaderProfile: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200", level: "실전", loc: "이대역 1번출구", date: "1.25(토)", img: "https://images.unsplash.com/photo-1628611225249-6c0c2a5146c6?w=800", author: "재개발러", views: 1200, comments: 45, price: "20,000원",
    desc: "완성된 마포 래미안 푸르지오와 진행 중인 북아현 구역을 비교 분석합니다.",
    course: ["이대역 집결", "마포래미안푸르지오 단지 투어", "북아현 2구역 현장 답사", "북아현 3구역 노후도 체크", "아현역 해산"]
  },
  { 
    id: 12, categoryType: 'crew', type: "recruit", title: "잠실 엘리트(엘스/리센츠/트리지움) 투어", status: 'open', leader: "송파주민", leaderProfile: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200", level: "입문", loc: "잠실새내역", date: "1.20(일)", img: "https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=800", author: "송파주민", views: 3420, comments: 120, price: "30,000원",
    desc: "송파구 대장주 아파트들의 입지, 학군, 상권을 3시간 동안 뽀갭니다.",
    course: ["잠실새내역", "잠실엘스 단지내 조경", "리센츠 상가 분석", "트리지움 학원가", "종합운동장역"]
  },
  { 
    id: 14, categoryType: 'crew', type: "recruit", title: "성동구 성수 전략정비구역 임장", status: 'open', leader: "한강뷰", leaderProfile: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200", level: "실전", loc: "서울숲역", date: "2.03(토)", img: "https://images.unsplash.com/photo-1513374244243-772599723528?w=800", author: "한강뷰", views: 2800, comments: 90, price: "35,000원",
    desc: "50층 한강변 아파트로 변모할 성수 전략정비구역의 1~4지구별 진행 상황 체크.",
    course: ["서울숲역", "성수1지구", "성수2지구", "성수3,4지구", "강변북로 조망 포인트"]
  },
  { 
    id: 16, categoryType: 'crew', type: "recruit", title: "노량진 뉴타운 1~8구역 임장", status: 'open', leader: "노량진박", leaderProfile: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", level: "중급", loc: "노량진역", date: "2.10(토)", img: "https://images.unsplash.com/photo-1628882098650-70f031023719?w=800", author: "노량진박", views: 1500, comments: 55, price: "25,000원",
    desc: "서울의 중심, 노량진 뉴타운의 구역별 진행 속도와 프리미엄 분석.",
    course: ["노량진역", "1,3구역 비교", "2,4,6구역 현장", "7,8구역 언덕 코스", "장승배기역"]
  },
  
  // Report Items - Updated for Paid/Free Logic & Purchase Counts
  { 
    id: 201, categoryType: 'crew', type: "report", status: 'ended', title: "1기 신도시 선도지구 분당 임장기", date: "12.15", 
    img: "https://images.unsplash.com/photo-1565514020176-7c30a21350a4?w=800", author: "분당토박이", leader: "분당토박이", leaderProfile: "https://randomuser.me/api/portraits/men/32.jpg",
    views: 5600, comments: 230, price: "5,000원", purchaseCount: 1250,
    desc: "재건축 선도지구 지정 후 시범단지의 매물 분위기와 호가 변화 리포트.", 
    relatedRecruitTitle: "분당 시범단지 긴급 임장", 
    reportContent: `
## 1. 선도지구 지정, 그 이후의 변화
선도지구 발표 직후 분당 시범단지의 분위기는 그야말로 '폭풍전야'였습니다. 삼성한신과 우성 아파트 매물은 자취를 감췄고, 호가는 일주일 새 1억 원 이상 상승했습니다.

## 2. 현장 소장님 인터뷰
"지금은 팔려는 사람보다 사려는 사람이 3배는 많아요. 대기자 명단만 한 페이지입니다." (서현동 A 부동산)
현장 부동산 소장님 인터뷰 결과, 당분간 매도자 우위 시장이 지속될 것으로 보입니다. 특히 역세권 소형 평수의 투자 문의가 빗발치고 있습니다.

## 3. 리더의 투자 인사이트
지금 진입해도 늦지 않았을까요? 저는 '아직 기회는 있다'고 봅니다. 다만, 추격 매수보다는 급매물이 나오는 타이밍을 노려야 합니다. 특히 통합 재건축 동의율이 높은 단지를 주목하세요. 상세한 단지별 동의율 데이터는 아래 표를 참고해주세요.
    `,
    gallery: ["https://images.unsplash.com/photo-1565514020176-7c30a21350a4?w=800", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"],
    reviews: [
        { user: "판교직장인", text: "리더님의 꼼꼼한 설명 덕분에 분당의 미래가 그려졌습니다. 5천원이 아깝지 않은 퀄리티네요.", rating: 5, date: "2023.12.16" },
        { user: "투자초보", text: "무료로 풀린 정보와 차원이 다릅니다. 재건축 분담금 시뮬레이션이 인상 깊었어요.", rating: 4, date: "2023.12.16" }
    ]
  },
  { 
    id: 202, categoryType: 'crew', type: "report", status: 'ended', title: "용산 한강맨션 재건축 현장", date: "12.20", 
    img: "https://images.unsplash.com/photo-1549643276-fbc2bd87430d?w=800", author: "용산대장", leader: "용산대장", leaderProfile: "https://randomuser.me/api/portraits/men/85.jpg",
    views: 4200, comments: 180, price: "무료", purchaseCount: 3200,
    desc: "이주가 진행 중인 한강맨션 현장 분위기와 주변 시세 분석.", 
    relatedRecruitTitle: "용산 한강변 재건축 투어",
    reportContent: "이주가 거의 완료된 한강맨션은 펜스가 쳐지고 적막감이 감돌았습니다. 하지만 그 적막감 속에 미래의 랜드마크가 보였습니다. 주변 래미안 첼리투스와 비교했을 때, 향후 시세는 평당 1.5억을 상회할 것으로 예상됩니다. 강변북로 지하화 이슈와 맞물려 용산의 가치는 더욱 상승할 것입니다. 이 리포트는 무료로 공개합니다. 누구나 용산의 꿈을 꾸셨으면 좋겠습니다.",
    gallery: ["https://images.unsplash.com/photo-1549643276-fbc2bd87430d?w=800"],
    reviews: [
        { user: "강북투자자", text: "무료라니 믿기지 않네요. 용산의 웅장함이 느껴집니다.", rating: 5, date: "2023.12.21" }
    ]
  },
  { 
    id: 203, categoryType: 'crew', type: "report", status: 'ended', title: "광명 뉴타운 입주장 전세가 분석", date: "11.10", 
    img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800", author: "광명지킴이", leader: "광명지킴이", leaderProfile: "https://randomuser.me/api/portraits/women/42.jpg",
    views: 3100, comments: 80, price: "3,000원", purchaseCount: 450,
    desc: "대규모 입주가 시작된 광명 뉴타운 전세가 흐름 분석.", gallery: ["https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800"],
    reportContent: "입주장이 시작되면서 전세가가 일시적으로 흔들리고 있습니다..."
  },
  { id: 204, categoryType: 'crew', type: "report", status: 'ended', title: "송도 국제도시 학군지 분석", date: "10.05", img: "https://images.unsplash.com/photo-1542361345-89e58247f2d5?w=800", author: "송도맘", views: 2500, comments: 45, price: "무료", purchaseCount: 890, desc: "1공구 학원가와 채드윅 국제학교 주변 단지 임장기.", gallery: ["https://images.unsplash.com/photo-1542361345-89e58247f2d5?w=800"] },
  { id: 205, categoryType: 'crew', type: "report", status: 'ended', title: "동탄2신도시 GTX-A 개통 효과", date: "09.28", img: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800", author: "동탄역장", views: 3800, comments: 110, price: "5,000원", purchaseCount: 2100, desc: "GTX-A 개통 직전 동탄역 롯데캐슬 등 역세권 단지 호가.", gallery: ["https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800"] },
  { id: 206, categoryType: 'crew', type: "report", status: 'ended', title: "청량리 역세권 재개발 현황", date: "09.15", img: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800", author: "청량리박", views: 1200, comments: 30, price: "3,000원", purchaseCount: 300, desc: "천지개벽하는 청량리역 일대 주상복합 공사 현황.", gallery: ["https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800"] },
  { id: 207, categoryType: 'crew', type: "report", status: 'ended', title: "부산 해운대 우동 임장기", date: "08.30", img: "https://images.unsplash.com/photo-1623565655767-463d11b5df2c?w=800", author: "부산갈매기", views: 4500, comments: 150, price: "무료", purchaseCount: 1500, desc: "해운대 대장주 엘시티와 마린시티 시세 비교.", gallery: ["https://images.unsplash.com/photo-1623565655767-463d11b5df2c?w=800"] },
  { id: 208, categoryType: 'crew', type: "report", status: 'ended', title: "대구 수성구 학군지 분위기", date: "08.15", img: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800", author: "범어동사람", views: 1800, comments: 40, price: "3,000원", purchaseCount: 200, desc: "대구의 강남 범어동 학원가와 범어네거리 임장.", gallery: ["https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800"] },
  { id: 209, categoryType: 'crew', type: "report", status: 'ended', title: "대전 둔산동 크로바/목련", date: "07.22", img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800", author: "대전사랑", views: 2200, comments: 60, price: "무료", purchaseCount: 600, desc: "대전의 대장 둔산동 크로바 아파트 재건축 가능성 분석.", gallery: ["https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800"] },
  { id: 210, categoryType: 'crew', type: "report", status: 'ended', title: "과천 지식정보타운 임장", date: "07.05", img: "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=800", author: "과천시민", views: 3100, comments: 85, price: "5,000원", purchaseCount: 900, desc: "과천 지정타 입주 기업 현황과 신축 아파트 랜선 집들이.", gallery: ["https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=800"] }
];

export const lectureList: LectureItem[] = [
  { 
    id: 21, categoryType: 'lecture', status: 'open', title: "2025년 부동산 시장 대전망", teacher: "김박사", teacherProfile: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200", format: "VOD", price: "99,000원", img: "https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800", author: "김박사", views: 12000, comments: 450, 
    desc: "금리 인하 시그널과 입주 물량 데이터를 기반으로 한 2025년 시장 예측.",
    curriculum: ["1강. 2024년 시장 리뷰 및 2025년 키워드", "2강. 금리와 유동성 분석", "3강. 서울/수도권 입주 물량 체크", "4강. 유망 투자 지역 Top 5"]
  },
  { 
    id: 22, categoryType: 'lecture', status: 'open', title: "누구나 따라하는 아파트 분양권 투자", teacher: "청약의신", teacherProfile: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200", format: "오프라인", price: "55,000원", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800", author: "청약의신", views: 8700, comments: 312, 
    desc: "전매 제한 해제 지역 공략법과 마이너스 프리미엄 줍줍 전략.",
    curriculum: ["1주차: 분양권 투자의 기본 원리", "2주차: 전매 제한 및 세금 완전 정복", "3주차: 마이너스 프리미엄 단지 분석", "4주차: 현장 답사 노하우"]
  },
  { 
    id: 23, categoryType: 'lecture', status: 'open', title: "부동산 경매 권리분석 기초 A to Z", teacher: "경매마스터", teacherProfile: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200", format: "VOD", price: "150,000원", img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800", author: "경매마스터", views: 5400, comments: 120, 
    desc: "말소기준권리부터 대항력 있는 임차인 분석까지, 경매의 기초를 다집니다.",
    curriculum: ["OT. 경매가 블루오션인 이유", "1강. 등기부등본 보는 법", "2강. 말소기준권리 찾기", "3강. 대항력과 우선변제권", "4강. 배당 순위"]
  },
  {
    id: 24, categoryType: 'lecture', status: 'open', title: "상가 투자로 월세 300만원 만들기", teacher: "상가왕", teacherProfile: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200", format: "오프라인", price: "77,000원", img: "https://images.unsplash.com/photo-1449824913929-2b633c758303?w=800", author: "상가왕", views: 3200, comments: 55,
    desc: "공실 걱정 없는 우량 상권 분석법과 임차인 맞추는 노하우.",
    curriculum: ["1강. 상권의 종류와 특징", "2강. 유동인구 분석 실전", "3강. 수익률 계산기 활용법", "4강. 임대차 계약서 작성시 주의사항"]
  },
  {
    id: 25, categoryType: 'lecture', status: 'closed', title: "[마감] 2030을 위한 생애 첫 주택 마련", teacher: "부동산요정", teacherProfile: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200", format: "VOD", price: "45,000원", img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800", author: "부동산요정", views: 9800, comments: 330,
    desc: "대출 활용법부터 매수 타이밍 잡는 법까지, 내 집 마련의 모든 것.",
    curriculum: ["1강. LTV, DSR 대출 규제 이해", "2강. 지역 선정 가이드", "3강. 임장 체크리스트", "4강. 계약 및 등기 절차"],
    reviews: [
        { user: "갓생살기", text: "부동산 1도 몰랐는데 이 강의 듣고 용기내서 등기 쳤습니다!", rating: 5, date: "2023.11.20" },
        { user: "신혼부부", text: "신혼집 구하는 데 큰 도움이 되었어요. 감사합니다.", rating: 5, date: "2023.11.18" }
    ]
  }
];