-- ============================================
-- Supabase PDF E-book 보안 정책
-- ============================================
-- 목적: 사용자별 폴더 분리 + RLS로 PDF 접근 제한
-- 버킷: ebooks
-- 경로 구조: {user_id}/{uuid}-{filename}.pdf

-- ============================================
-- 1. Ebooks 메타데이터 테이블
-- ============================================

-- 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS public.ebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    object_path TEXT NOT NULL UNIQUE, -- Storage 경로 (user_id/uuid-filename.pdf)
    file_name TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    mime_type TEXT DEFAULT 'application/pdf',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_ebooks_user_id ON public.ebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_ebooks_status ON public.ebooks(status);
CREATE INDEX IF NOT EXISTS idx_ebooks_created_at ON public.ebooks(created_at DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 ebook만 조회 가능
DROP POLICY IF EXISTS "ebooks_select_own" ON public.ebooks;
CREATE POLICY "ebooks_select_own"
ON public.ebooks
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS 정책: 사용자는 자신의 ebook만 삽입 가능
DROP POLICY IF EXISTS "ebooks_insert_own" ON public.ebooks;
CREATE POLICY "ebooks_insert_own"
ON public.ebooks
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- RLS 정책: 사용자는 자신의 ebook만 업데이트 가능
DROP POLICY IF EXISTS "ebooks_update_own" ON public.ebooks;
CREATE POLICY "ebooks_update_own"
ON public.ebooks
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS 정책: 사용자는 자신의 ebook만 삭제 가능
DROP POLICY IF EXISTS "ebooks_delete_own" ON public.ebooks;
CREATE POLICY "ebooks_delete_own"
ON public.ebooks
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 2. Ebook 보기 로그 테이블 (옵션)
-- ============================================

CREATE TABLE IF NOT EXISTS public.ebook_view_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    object_path TEXT NOT NULL,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_ebook_view_logs_user_id ON public.ebook_view_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ebook_view_logs_viewed_at ON public.ebook_view_logs(viewed_at DESC);

-- RLS 활성화
ALTER TABLE public.ebook_view_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 로그만 조회 가능
DROP POLICY IF EXISTS "ebook_view_logs_select_own" ON public.ebook_view_logs;
CREATE POLICY "ebook_view_logs_select_own"
ON public.ebook_view_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS 정책: 사용자는 자신의 로그만 삽입 가능
DROP POLICY IF EXISTS "ebook_view_logs_insert_own" ON public.ebook_view_logs;
CREATE POLICY "ebook_view_logs_insert_own"
ON public.ebook_view_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================
-- 3. Storage 보안 정책 (ebooks 버킷)
-- ============================================

-- 참고: Supabase Dashboard에서 Storage > Policies에서 설정
-- 또는 아래 SQL을 실행 (storage.objects 테이블에 대한 정책)

-- Storage 정책: 사용자는 자신의 폴더만 조회 가능 (SELECT)
DROP POLICY IF EXISTS "users_can_read_own_files" ON storage.objects;
CREATE POLICY "users_can_read_own_files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'ebooks'
    AND split_part(name, '/', 1) = auth.uid()::text
);

-- Storage 정책: 사용자는 자신의 폴더만 업로드 가능 (INSERT)
DROP POLICY IF EXISTS "users_can_upload_own_files" ON storage.objects;
CREATE POLICY "users_can_upload_own_files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'ebooks'
    AND split_part(name, '/', 1) = auth.uid()::text
);

-- Storage 정책: 사용자는 자신의 파일만 삭제 가능 (DELETE)
DROP POLICY IF EXISTS "users_can_delete_own_files" ON storage.objects;
CREATE POLICY "users_can_delete_own_files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'ebooks'
    AND split_part(name, '/', 1) = auth.uid()::text
);

-- ============================================
-- 4. 함수: updated_at 자동 업데이트
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 연결
DROP TRIGGER IF EXISTS update_ebooks_updated_at ON public.ebooks;
CREATE TRIGGER update_ebooks_updated_at
BEFORE UPDATE ON public.ebooks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. 버킷 생성 (Supabase Dashboard 또는 API)
-- ============================================

-- 참고: 아래는 Storage API를 통해 실행해야 함
-- Supabase Dashboard > Storage > New bucket
-- 버킷명: ebooks
-- Public: false (비공개)
-- File size limit: 100MB
-- Allowed MIME types: application/pdf

-- ============================================
-- 완료!
-- ============================================

-- 테스트:
-- 1. 인증된 사용자로 로그인
-- 2. ebooks 테이블에 INSERT 시도 (자신의 user_id만 가능)
-- 3. Storage에 파일 업로드 시도 (자신의 폴더만 가능)
-- 4. 다른 사용자의 파일 접근 시도 (차단되어야 함)
