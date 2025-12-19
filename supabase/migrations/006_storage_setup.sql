-- =====================================================
-- 006_storage_setup.sql
-- Supabase Storage 설정 (assets 버킷 생성 및 정책 설정)
-- =====================================================

-- 1. 'assets' 버킷 생성 (이미 존재하면 무시)
-- 주의: 이 SQL은 Supabase Dashboard의 SQL Editor에서 'storage' 스키마 권한으로 실행되어야 합니다.
-- 만약 아래 쿼리가 실패한다면, Supabase Dashboard > Storage 메뉴에서 
-- 직접 'assets'라는 이름의 버킷을 생성하고 'Public'으로 설정해주세요.

INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 스토리지 정책 설정 (RLS)
-- 누구나 조회 가능
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'assets' );

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated Users Can Upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'assets' 
    AND auth.role() = 'authenticated'
);

-- 본인 또는 관리자만 삭제 가능
CREATE POLICY "Admin or Owner Can Delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'assets'
    AND (
        auth.uid() = owner
        OR (SELECT roles FROM public.users WHERE id = auth.uid()) @> ARRAY['super_admin'::text]
    )
);
