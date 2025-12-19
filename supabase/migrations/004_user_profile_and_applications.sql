-- =====================================================
-- 004_user_profile_and_applications.sql
-- =====================================================
-- 1. users 테이블 컬럼 확장
-- =====================================================
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS birthdate TEXT,
ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.users.phone IS '휴대폰 번호';
COMMENT ON COLUMN public.users.birthdate IS '생년월일 (6자리)';
COMMENT ON COLUMN public.users.interests IS '관심 키워드 배열';
COMMENT ON COLUMN public.users.is_profile_complete IS '필수 프로필 정보 입력 완료 여부';

-- =====================================================
-- 2. applications 테이블 생성
-- =====================================================
CREATE TABLE IF NOT EXISTS public.applications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    
    -- 신청 상태: applied(신청), paid(입금완료), checked-in(참여확정), refund-requested(환불요청), refund-completed(환불완료), cancelled(취소)
    status TEXT NOT NULL DEFAULT 'applied' 
    CHECK (status IN ('applied', 'paid', 'checked-in', 'refund-requested', 'refund-completed', 'cancelled')),
    
    refund_account TEXT, -- 환불받을 계좌 정보
    refund_reason TEXT,  -- 취소/환불 사유
    
    user_name TEXT,  -- 신청 시점의 사용자 이름 (기록용)
    user_phone TEXT, -- 신청 시점의 사용자 연락처 (기록용)
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- 한 사용자가 같은 모임에 중복 신청하는 것 방지
    UNIQUE(user_id, item_id)
);

COMMENT ON TABLE public.applications IS '모임 신청 및 결제 상태 내역';

-- =====================================================
-- 3. RLS (Row Level Security) 설정
-- =====================================================
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 조회: 본인의 신청 내역 또는 해당 아이템의 호스트(작성자), 또는 슈퍼어드민
CREATE POLICY "applications_select_policy" ON public.applications
    FOR SELECT USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.items 
            WHERE items.id = applications.item_id AND items.author_id = auth.uid()
        )
        OR (SELECT roles FROM public.users WHERE id = auth.uid()) @> ARRAY['super_admin'::text]
    );

-- 생성: 인증된 사용자 본인만
CREATE POLICY "applications_insert_policy" ON public.applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 수정: 본인(취소 등) 또는 호스트(입금확인, 참여체크 등), 또는 슈퍼어드민
CREATE POLICY "applications_update_policy" ON public.applications
    FOR UPDATE USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.items 
            WHERE items.id = applications.item_id AND items.author_id = auth.uid()
        )
        OR (SELECT roles FROM public.users WHERE id = auth.uid()) @> ARRAY['super_admin'::text]
    );

-- =====================================================
-- 4. 트리거 및 유틸리티
-- =====================================================

-- updated_at 자동 업데이트
CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON public.applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 참여자 수 합계 로직 (기존 items 테이블의 current_participants 등 업데이트)
CREATE OR REPLACE FUNCTION handle_application_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- 새로운 신청이 들어왔을 때
    IF (TG_OP = 'INSERT') THEN
        IF NEW.status = 'applied' OR NEW.status = 'paid' THEN
            UPDATE public.items 
            SET current_participants = COALESCE(current_participants, 0) + 1
            WHERE id = NEW.item_id AND category_type = 'networking';
            
            UPDATE public.items 
            SET purchase_count = COALESCE(purchase_count, 0) + 1
            WHERE id = NEW.item_id AND category_type = 'crew';
        END IF;
    
    -- 상태가 변경되었을 때 (취소 등)
    ELSIF (TG_OP = 'UPDATE') THEN
        -- 취소되거나 환불될 때 참가자 수 감소 (기존에 참가자로 집계되었던 경우)
        IF (NEW.status IN ('cancelled', 'refund-completed')) AND (OLD.status NOT IN ('cancelled', 'refund-completed')) THEN
            UPDATE public.items 
            SET current_participants = GREATEST(COALESCE(current_participants, 0) - 1, 0)
            WHERE id = NEW.item_id AND category_type = 'networking';
        END IF;

        -- 다시 복구될 때 (환불요청에서 다시 입금완료 등으로 변경될 때 등 특수 케이스 대응 가능)
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기존에 유사한 트리거가 있다면 중복될 수 있으므로 주의 (user_applies 관련 트리거와 충돌 확인 필요)
-- 여기서는 새 application 테이블용 트리거를 생성합니다.
CREATE TRIGGER on_application_change
    AFTER INSERT OR UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION handle_application_changes();
