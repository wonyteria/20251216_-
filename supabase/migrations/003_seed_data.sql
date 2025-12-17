-- 003_seed_data.sql
-- Initial seed data for the application

-- ============================================
-- Slides (sort_order, not display_order)
-- ============================================
INSERT INTO slides (title, "desc", img, sort_order, is_active) VALUES
('함께 부자가 되는 오프라인 커뮤니티, 임풋', '혼자 하는 재테크는 외롭습니다. 땀 흘리며 함께 성장하는 즐거움을 현장에서 경험하세요.', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1600', 1, true),
('가치관이 맞는 소중한 인연찾기', '경제관과 라이프스타일이 통하는 짝, 임풋 마인드데이트에서 만나보세요.', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1600', 2, true),
('책상 앞이 아닌 현장에서 답을 찾다', '검증된 리더와 함께 걷는 임장 크루. 살아있는 부동산 공부가 시작됩니다.', 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=1600', 3, true);

-- ============================================
-- Notifications
-- ============================================
INSERT INTO notifications (message, is_active, sort_order) VALUES
('[마감임박] 강남 청약 스터디 2자리 남았습니다!', true, 1),
('[매칭] 방금 ''30대 직장인 소개팅'' 남성 1명 신청완료', true, 2),
('[모집] 마포구 임장 크루 리더가 코스를 업데이트했습니다.', true, 3),
('[신규] ''2025 부동산 전망'' VOD가 업로드 되었습니다.', true, 4);

-- ============================================
-- Briefings (sort_order, not display_order)
-- ============================================
INSERT INTO briefings (text, highlight, sort_order, is_active) VALUES
('금리 인하 기대감: 코픽스 금리 2개월 연속 하락, 대출 숨통 트이나?', '금리 인하 기대감', 1, true),
('강남 3구: 토지거래허가구역 재지정 이슈 체크 필수.', '강남 3구', 2, true),
('임풋 Tip: 지금은 추격 매수보다 급매물 모니터링이 필요한 시점.', '임풋 Tip', 3, true);

-- ============================================
-- Category Headers (category, not category_type)
-- ============================================
INSERT INTO category_headers (category, title, description) VALUES
('networking', '스터디 & 네트워킹', '함께 공부하고 성장하는 부동산 커뮤니티.'),
('minddate', '마인드데이트', '재테크 가치관이 맞는 소중한 인연을 찾아보세요.'),
('crew', '임장 크루', '혼자서는 막막한 임장, 전문가 리더와 함께 걸어요.'),
('lecture', '재테크 강의', '검증된 전문가의 노하우를 배우는 프리미엄 클래스.');

-- ============================================
-- Category Detail Images (category, not category_type)
-- ============================================
INSERT INTO category_detail_images (category, image_url) VALUES
('networking', 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2000'),
('minddate', 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=2000'),
('crew', 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=2000'),
('lecture', 'https://images.unsplash.com/photo-1544531696-fa3693fb4b38?auto=format&fit=crop&q=80&w=2000');

-- ============================================
-- Networking Items
-- ============================================
INSERT INTO items (category_type, networking_type, title, status, event_date, location, price, img, author, views, comments, description, curriculum, current_participants, max_participants, group_photo) VALUES
('networking', 'study', '강남/서초 청약 전략 스터디 3기', 'open', '1.20(토) 14:00', '강남역 스터디룸', '30,000원', 'https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=800', '청약전문가', 1240, 42, '가점이 낮아도 도전할 수 있는 강남권 청약 전략을 공유하고 공부합니다.', ARRAY['1주차: 강남3구 분양 예정 단지 분석', '2주차: 가점제 vs 추첨제 전략', '3주차: 자금 조달 계획서 작성법', '4주차: 모의 청약 시뮬레이션'], 6, 8, NULL),
('networking', 'social', '부동산 갭투자 초보 모임 (2030)', 'open', '1.24(수) 19:30', '성수동 카페', '20,000원', 'https://images.unsplash.com/photo-1515169067750-d51a73b50ac8?w=800', '투자새내기', 854, 18, '소액으로 시작하는 지방 갭투자, 서로의 지역 분석을 공유해요.', ARRAY['자기소개 및 투자 성향 파악', '최근 관심 지역 공유', '소액 투자 성공/실패 사례 토크', '네트워킹 타임'], 12, 20, NULL),
('networking', 'study', '[마감] 경매 기초반 스터디 5기', 'closed', '1.15(금)', '교대역', '50,000원', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800', '경매왕', 2100, 156, '종료된 스터디입니다.', ARRAY[]::TEXT[], NULL, NULL, NULL),
('networking', 'social', '임장 뒷풀이 & 와인 네트워킹', 'ended', '1.27(토)', '한남동', '70,000원', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800', '임장러버', 1890, 88, '하루 종일 임장하느라 고생하셨습니다. 와인 한 잔 하며 정보 교류해요.', ARRAY['아이스브레이킹', '오늘의 임장 후기 나눔', '와인 테이스팅', '자유 네트워킹'], NULL, NULL, 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800'),
('networking', 'social', '한강 런닝 & 부동산 토크', 'ended', '지난 주말', '여의도 한강공원', '무료', 'https://images.unsplash.com/photo-1552674605-469523170d9e?w=800', '런닝맨', 920, 12, '건강도 챙기고 정보도 나누는 건전한 모임이었습니다.', ARRAY[]::TEXT[], NULL, NULL, 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800'),
('networking', 'study', '세금(양도세/취득세) 완전 정복', 'open', '2.10(토)', '강남역', '40,000원', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800', '세무통', 3300, 45, '복잡한 부동산 세금, 세무사님과 함께 뽀개봅시다.', ARRAY[]::TEXT[], 30, 40, NULL);

-- ============================================
-- Minddate Items (gender_ratio split into male/female)
-- ============================================
INSERT INTO items (category_type, minddate_type, title, status, event_date, location, price, img, author, views, comments, description, target_audience, gender_ratio_male, gender_ratio_female, matched_couples, bank_info, refund_policy) VALUES
('minddate', 'dating', '30대 직장인 부동산 가치관 매칭', 'open', '1.28(일) 14:00', '청담동 라운지', '50,000원', 'https://images.unsplash.com/photo-1563237023-b1e970526dcb?w=800', '매니저', 3200, 85, '경제관과 부동산 투자에 관심 있는 30대 남녀를 위한 프리미엄 소개팅.', ARRAY['수도권 거주 30대 미혼 남녀', '부동산 투자에 관심이 많으신 분', '안정적인 직업을 가지신 분'], 12, 10, NULL, '우리은행 1002-123-456789 (주)임풋', '행사 3일 전까지 100% 환불 가능합니다.'),
('minddate', 'dating', '1주택자 이상 미혼남녀 모임', 'open', '2.03(토) 18:00', '여의도', '60,000원', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800', '매니저', 4100, 112, '내 집 마련에 성공한 공감대를 가진 분들의 만남.', ARRAY['본인 명의 주택 1채 이상 소유자', '결혼을 전제로 진지한 만남을 원하시는 분'], 8, 8, NULL, '우리은행 1002-123-456789 (주)임풋', '행사 3일 전까지 100% 환불 가능합니다.'),
('minddate', 'dating', '전문직/대기업 재테크 소개팅', 'ended', '지난 달', '강남역', '55,000원', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800', '매니저', 5600, 210, '비슷한 수준의 경제력을 갖춘 분들의 만남.', NULL, NULL, NULL, 4, NULL, NULL),
('minddate', 'dating', '주말 임장 데이트 매칭', 'ended', '지난 주', '용산구', '30,000원', 'https://images.unsplash.com/photo-1475721027767-4d563518e5c7?w=800', '매니저', 2100, 40, '함께 걸으며 미래를 그릴 수 있는 짝을 찾았어요.', NULL, NULL, NULL, 3, NULL, NULL),
('minddate', 'dating', '와인과 함께하는 경제 토크', 'open', '2.14(수) 19:00', '한남동 와인바', '80,000원', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800', '매니저', 1800, 32, '로맨틱한 분위기 속에서 나누는 진지한 경제 이야기.', ARRAY['와인을 즐기는 2030', '재테크 대화가 통하는 이성 찾기'], 5, 4, NULL, '우리은행 1002-123-456789 (주)임풋', '행사 5일 전까지 100% 환불.');

-- ============================================
-- Crew Items (Recruit) - crew_level instead of level
-- ============================================
INSERT INTO items (category_type, crew_type, title, status, event_date, location, price, img, author, views, comments, description, leader, leader_profile, crew_level, course) VALUES
('crew', 'recruit', '마포구 아현/북아현 뉴타운 임장', 'open', '1.25(토)', '이대역 1번출구', '20,000원', 'https://images.unsplash.com/photo-1628611225249-6c0c2a5146c6?w=800', '재개발러', 1200, 45, '완성된 마포 래미안 푸르지오와 진행 중인 북아현 구역을 비교 분석합니다.', '재개발러', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', '실전', ARRAY['이대역 집결', '마포래미안푸르지오 단지 투어', '북아현 2구역 현장 답사', '북아현 3구역 노후도 체크', '아현역 해산']),
('crew', 'recruit', '잠실 엘리트(엘스/리센츠/트리지움) 투어', 'open', '1.20(일)', '잠실새내역', '30,000원', 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=800', '송파주민', 3420, 120, '송파구 대장주 아파트들의 입지, 학군, 상권을 3시간 동안 뽀갭니다.', '송파주민', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', '입문', ARRAY['잠실새내역', '잠실엘스 단지내 조경', '리센츠 상가 분석', '트리지움 학원가', '종합운동장역']),
('crew', 'recruit', '성동구 성수 전략정비구역 임장', 'open', '2.03(토)', '서울숲역', '35,000원', 'https://images.unsplash.com/photo-1513374244243-772599723528?w=800', '한강뷰', 2800, 90, '50층 한강변 아파트로 변모할 성수 전략정비구역의 1~4지구별 진행 상황 체크.', '한강뷰', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', '실전', ARRAY['서울숲역', '성수1지구', '성수2지구', '성수3,4지구', '강변북로 조망 포인트']),
('crew', 'recruit', '노량진 뉴타운 1~8구역 임장', 'open', '2.10(토)', '노량진역', '25,000원', 'https://images.unsplash.com/photo-1628882098650-70f031023719?w=800', '노량진박', 1500, 55, '서울의 중심, 노량진 뉴타운의 구역별 진행 속도와 프리미엄 분석.', '노량진박', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', '중급', ARRAY['노량진역', '1,3구역 비교', '2,4,6구역 현장', '7,8구역 언덕 코스', '장승배기역']);

-- ============================================
-- Crew Items (Reports)
-- ============================================
INSERT INTO items (category_type, crew_type, title, status, event_date, img, author, views, comments, price, purchase_count, description, leader, leader_profile, related_recruit_title, report_content, gallery) VALUES
('crew', 'report', '1기 신도시 선도지구 분당 임장기', 'ended', '12.15', 'https://images.unsplash.com/photo-1565514020176-7c30a21350a4?w=800', '분당토박이', 5600, 230, '5,000원', 1250, '재건축 선도지구 지정 후 시범단지의 매물 분위기와 호가 변화 리포트.', '분당토박이', 'https://randomuser.me/api/portraits/men/32.jpg', '분당 시범단지 긴급 임장', E'## 1. 선도지구 지정, 그 이후의 변화\n선도지구 발표 직후 분당 시범단지의 분위기는 그야말로 ''폭풍전야''였습니다.', ARRAY['https://images.unsplash.com/photo-1565514020176-7c30a21350a4?w=800', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800']),
('crew', 'report', '용산 한강맨션 재건축 현장', 'ended', '12.20', 'https://images.unsplash.com/photo-1549643276-fbc2bd87430d?w=800', '용산대장', 4200, 180, '무료', 3200, '이주가 진행 중인 한강맨션 현장 분위기와 주변 시세 분석.', '용산대장', 'https://randomuser.me/api/portraits/men/85.jpg', '용산 한강변 재건축 투어', '이주가 거의 완료된 한강맨션은 펜스가 쳐지고 적막감이 감돌았습니다.', ARRAY['https://images.unsplash.com/photo-1549643276-fbc2bd87430d?w=800']),
('crew', 'report', '광명 뉴타운 입주장 전세가 분석', 'ended', '11.10', 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800', '광명지킴이', 3100, 80, '3,000원', 450, '대규모 입주가 시작된 광명 뉴타운 전세가 흐름 분석.', '광명지킴이', 'https://randomuser.me/api/portraits/women/42.jpg', NULL, '입주장이 시작되면서 전세가가 일시적으로 흔들리고 있습니다...', ARRAY['https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800']),
('crew', 'report', '송도 국제도시 학군지 분석', 'ended', '10.05', 'https://images.unsplash.com/photo-1542361345-89e58247f2d5?w=800', '송도맘', 2500, 45, '무료', 890, '1공구 학원가와 채드윅 국제학교 주변 단지 임장기.', NULL, NULL, NULL, NULL, ARRAY['https://images.unsplash.com/photo-1542361345-89e58247f2d5?w=800']),
('crew', 'report', '동탄2신도시 GTX-A 개통 효과', 'ended', '09.28', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800', '동탄역장', 3800, 110, '5,000원', 2100, 'GTX-A 개통 직전 동탄역 롯데캐슬 등 역세권 단지 호가.', NULL, NULL, NULL, NULL, ARRAY['https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800']),
('crew', 'report', '청량리 역세권 재개발 현황', 'ended', '09.15', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800', '청량리박', 1200, 30, '3,000원', 300, '천지개벽하는 청량리역 일대 주상복합 공사 현황.', NULL, NULL, NULL, NULL, ARRAY['https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800']),
('crew', 'report', '부산 해운대 우동 임장기', 'ended', '08.30', 'https://images.unsplash.com/photo-1623565655767-463d11b5df2c?w=800', '부산갈매기', 4500, 150, '무료', 1500, '해운대 대장주 엘시티와 마린시티 시세 비교.', NULL, NULL, NULL, NULL, ARRAY['https://images.unsplash.com/photo-1623565655767-463d11b5df2c?w=800']),
('crew', 'report', '대구 수성구 학군지 분위기', 'ended', '08.15', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800', '범어동사람', 1800, 40, '3,000원', 200, '대구의 강남 범어동 학원가와 범어네거리 임장.', NULL, NULL, NULL, NULL, ARRAY['https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800']),
('crew', 'report', '대전 둔산동 크로바/목련', 'ended', '07.22', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800', '대전사랑', 2200, 60, '무료', 600, '대전의 대장 둔산동 크로바 아파트 재건축 가능성 분석.', NULL, NULL, NULL, NULL, ARRAY['https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800']),
('crew', 'report', '과천 지식정보타운 임장', 'ended', '07.05', 'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=800', '과천시민', 3100, 85, '5,000원', 900, '과천 지정타 입주 기업 현황과 신축 아파트 랜선 집들이.', NULL, NULL, NULL, NULL, ARRAY['https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=800']);

-- ============================================
-- Lecture Items
-- ============================================
INSERT INTO items (category_type, lecture_format, title, status, price, img, author, views, comments, description, teacher, teacher_profile, curriculum) VALUES
('lecture', 'VOD', '2025년 부동산 시장 대전망', 'open', '99,000원', 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800', '김박사', 12000, 450, '금리 인하 시그널과 입주 물량 데이터를 기반으로 한 2025년 시장 예측.', '김박사', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200', ARRAY['1강. 2024년 시장 리뷰 및 2025년 키워드', '2강. 금리와 유동성 분석', '3강. 서울/수도권 입주 물량 체크', '4강. 유망 투자 지역 Top 5']),
('lecture', '오프라인', '누구나 따라하는 아파트 분양권 투자', 'open', '55,000원', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', '청약의신', 8700, 312, '전매 제한 해제 지역 공략법과 마이너스 프리미엄 줍줍 전략.', '청약의신', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', ARRAY['1주차: 분양권 투자의 기본 원리', '2주차: 전매 제한 및 세금 완전 정복', '3주차: 마이너스 프리미엄 단지 분석', '4주차: 현장 답사 노하우']),
('lecture', 'VOD', '부동산 경매 권리분석 기초 A to Z', 'open', '150,000원', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800', '경매마스터', 5400, 120, '말소기준권리부터 대항력 있는 임차인 분석까지, 경매의 기초를 다집니다.', '경매마스터', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200', ARRAY['OT. 경매가 블루오션인 이유', '1강. 등기부등본 보는 법', '2강. 말소기준권리 찾기', '3강. 대항력과 우선변제권', '4강. 배당 순위']),
('lecture', '오프라인', '상가 투자로 월세 300만원 만들기', 'open', '77,000원', 'https://images.unsplash.com/photo-1449824913929-2b633c758303?w=800', '상가왕', 3200, 55, '공실 걱정 없는 우량 상권 분석법과 임차인 맞추는 노하우.', '상가왕', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', ARRAY['1강. 상권의 종류와 특징', '2강. 유동인구 분석 실전', '3강. 수익률 계산기 활용법', '4강. 임대차 계약서 작성시 주의사항']),
('lecture', 'VOD', '[마감] 2030을 위한 생애 첫 주택 마련', 'closed', '45,000원', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800', '부동산요정', 9800, 330, '대출 활용법부터 매수 타이밍 잡는 법까지, 내 집 마련의 모든 것.', '부동산요정', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200', ARRAY['1강. LTV, DSR 대출 규제 이해', '2강. 지역 선정 가이드', '3강. 임장 체크리스트', '4강. 계약 및 등기 절차']);
