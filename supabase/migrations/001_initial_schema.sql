-- =====================================================
-- 임풋(임foot) Supabase 데이터베이스 스키마
-- =====================================================
-- 부동산 커뮤니티 플랫폼: 네트워킹, 마인드데이트, 임장크루, 강의
-- Supabase Auth 연동 + 백엔드 없이 RLS로 보안 처리
-- =====================================================

-- =====================================================
-- 1. ENUM 타입 정의
-- =====================================================

CREATE TYPE category_type AS ENUM ('networking', 'minddate', 'crew', 'lecture');
CREATE TYPE item_status AS ENUM ('open', 'closed', 'ended');
CREATE TYPE networking_type AS ENUM ('study', 'social');
CREATE TYPE minddate_type AS ENUM ('dating', 'friends');
CREATE TYPE crew_type AS ENUM ('recruit', 'report');
CREATE TYPE lecture_format AS ENUM ('VOD', '오프라인');
CREATE TYPE crew_level AS ENUM ('입문', '중급', '실전');
CREATE TYPE transaction_type AS ENUM ('payment', 'refund');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- =====================================================
-- 2. 사용자 테이블 (Supabase Auth 연동)
-- =====================================================

CREATE TABLE users (
    -- auth.users.id와 동일한 UUID 사용
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    roles TEXT[] DEFAULT '{}', -- 'super_admin', 'crew_manager', 'networking_manager', 'minddate_manager', 'lecture_manager'
    join_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE users IS '사용자 정보 (auth.users와 1:1 매핑)';
COMMENT ON COLUMN users.id IS 'auth.users.id와 동일';
COMMENT ON COLUMN users.roles IS '역할 배열: super_admin, crew_manager, networking_manager, minddate_manager, lecture_manager (관리자만 수정 가능)';

-- =====================================================
-- 3. Auth 연동: 회원가입 시 public.users 자동 생성
-- =====================================================

-- auth.users INSERT 시 public.users에 자동 생성하는 함수
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER -- 관리자 권한으로 실행
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- auth.users에 트리거 설정
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- auth.users 삭제 시 public.users도 삭제 (CASCADE로 자동 처리되지만 명시적 트리거)
CREATE OR REPLACE FUNCTION handle_user_delete()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_deleted
    BEFORE DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_user_delete();

-- =====================================================
-- 4. 아이템 테이블 (모든 콘텐츠 통합)
-- =====================================================

CREATE TABLE items (
    id BIGSERIAL PRIMARY KEY,

    -- 공통 필드 (BaseItem)
    category_type category_type NOT NULL,
    title TEXT NOT NULL,
    img TEXT,
    author TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    views INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    description TEXT,
    event_date TEXT,
    price TEXT,
    location TEXT,
    status item_status DEFAULT 'open',
    host_bank_info TEXT,
    kakao_chat_url TEXT,
    host_description TEXT,
    host_intro_image TEXT,

    -- 네트워킹 전용 필드
    networking_type networking_type,
    curriculum TEXT[],
    current_participants INTEGER DEFAULT 0,
    max_participants INTEGER,
    group_photo TEXT,

    -- 마인드데이트 전용 필드
    minddate_type minddate_type,
    target_audience TEXT[],
    gender_ratio_male INTEGER,
    gender_ratio_female INTEGER,
    matched_couples INTEGER,
    bank_info TEXT,
    refund_policy TEXT,

    -- 크루 전용 필드
    crew_type crew_type,
    leader TEXT,
    leader_profile TEXT,
    crew_level crew_level,
    course TEXT[],
    gallery TEXT[],
    report_content TEXT,
    related_recruit_title TEXT,
    purchase_count INTEGER DEFAULT 0,

    -- 강의 전용 필드
    lecture_format lecture_format,
    teacher TEXT,
    teacher_profile TEXT,

    -- 메타데이터
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE items IS '모든 콘텐츠 아이템 (네트워킹, 마인드데이트, 크루, 강의)';

-- =====================================================
-- 5. 리뷰 테이블
-- =====================================================

CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "user" TEXT NOT NULL,
    avatar TEXT,
    text TEXT NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE reviews IS '아이템 리뷰/후기';

-- =====================================================
-- 6. 사용자 상호작용 테이블
-- =====================================================

CREATE TABLE user_likes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

CREATE TABLE user_applies (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'approved', 'rejected', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

CREATE TABLE user_unlocks (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- =====================================================
-- 7. 거래 기록 테이블
-- =====================================================

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id BIGINT REFERENCES items(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    transaction_type transaction_type NOT NULL,
    status transaction_status DEFAULT 'pending',
    payment_method TEXT,
    payment_key TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE transactions IS '결제/환불 거래 기록';

-- =====================================================
-- 8. 콘텐츠 관리 테이블 (관리자용)
-- =====================================================

CREATE TABLE slides (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    "desc" TEXT,
    img TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE briefings (
    id BIGSERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    highlight TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE category_headers (
    id BIGSERIAL PRIMARY KEY,
    category category_type UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE category_detail_images (
    id BIGSERIAL PRIMARY KEY,
    category category_type UNIQUE NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE settings (
    id BIGSERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    value_type TEXT DEFAULT 'string' CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 설정값
INSERT INTO settings (key, value, value_type, description) VALUES
    ('tagline', '나와 같은 방향을 걷는 사람들을 만나는 곳, 임풋', 'string', '플랫폼 슬로건'),
    ('commission_rate', '15', 'number', '수수료율 (%)'),
    ('mypage_banner', 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&q=80&w=1600', 'string', '마이페이지 배너 이미지 URL');

-- =====================================================
-- 9. 인덱스 생성
-- =====================================================

CREATE INDEX idx_items_category_type ON items(category_type);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_author_id ON items(author_id);
CREATE INDEX idx_items_created_at ON items(created_at DESC);
CREATE INDEX idx_items_category_status ON items(category_type, status);

CREATE INDEX idx_reviews_item_id ON reviews(item_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

CREATE INDEX idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX idx_user_likes_item_id ON user_likes(item_id);
CREATE INDEX idx_user_applies_user_id ON user_applies(user_id);
CREATE INDEX idx_user_applies_item_id ON user_applies(item_id);
CREATE INDEX idx_user_unlocks_user_id ON user_unlocks(user_id);
CREATE INDEX idx_user_unlocks_item_id ON user_unlocks(item_id);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_item_id ON transactions(item_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- =====================================================
-- 10. 트리거: updated_at 자동 업데이트
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_applies_updated_at BEFORE UPDATE ON user_applies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_briefings_updated_at BEFORE UPDATE ON briefings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_category_headers_updated_at BEFORE UPDATE ON category_headers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_category_detail_images_updated_at BEFORE UPDATE ON category_detail_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. 아이템 신청 시 참가자 수 자동 증가 트리거
-- =====================================================

CREATE OR REPLACE FUNCTION handle_item_apply()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 신청 추가 시
    IF TG_OP = 'INSERT' THEN
        UPDATE items
        SET current_participants = COALESCE(current_participants, 0) + 1
        WHERE id = NEW.item_id AND category_type = 'networking';

        UPDATE items
        SET purchase_count = COALESCE(purchase_count, 0) + 1
        WHERE id = NEW.item_id AND category_type = 'crew';
    END IF;

    -- 신청 취소 시 (status가 cancelled로 변경될 때)
    IF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        UPDATE items
        SET current_participants = GREATEST(COALESCE(current_participants, 0) - 1, 0)
        WHERE id = NEW.item_id AND category_type = 'networking';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_apply
    AFTER INSERT OR UPDATE ON user_applies
    FOR EACH ROW EXECUTE FUNCTION handle_item_apply();

-- 리포트 잠금해제 시 purchase_count 증가
CREATE OR REPLACE FUNCTION handle_report_unlock()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE items
    SET purchase_count = COALESCE(purchase_count, 0) + 1
    WHERE id = NEW.item_id AND category_type = 'crew' AND crew_type = 'report';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_report_unlock
    AFTER INSERT ON user_unlocks
    FOR EACH ROW EXECUTE FUNCTION handle_report_unlock();
