-- =====================================================
-- 005_update_application_statuses.sql
-- =====================================================

-- 1. applications 테이블의 status 제약조건 업데이트
ALTER TABLE public.applications 
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('applied', 'confirmed', 'paid', 'checked-in', 'refund-requested', 'refund-completed', 'cancelled'));

COMMENT ON COLUMN public.applications.status IS '신청 상태: applied(신청대기), confirmed(신청완료/승인), paid(입금완료), checked-in(참여확정), refund-requested(환불요청), refund-completed(환불완료), cancelled(취소)';

-- 2. user_notifications 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_notifications_select_policy" ON public.user_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_notifications_update_policy" ON public.user_notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_notifications_insert_policy" ON public.user_notifications
    FOR INSERT WITH CHECK (true); -- Usually created by system/trigger or other users (hosts), but for simplicity...

COMMENT ON TABLE public.user_notifications IS '유저 개인별 알림 내역';
