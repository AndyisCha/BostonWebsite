-- ============================================
-- EPUB 지원 마이그레이션 (간단 버전)
-- ============================================
-- Supabase Dashboard → SQL Editor에서 복사 붙여넣기 후 실행

-- 1. 메타데이터 필드 추가
ALTER TABLE public.ebooks
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. 메타데이터 인덱스
CREATE INDEX IF NOT EXISTS idx_ebooks_metadata
ON public.ebooks USING gin (metadata);

-- 3. MIME 타입 검증 함수
CREATE OR REPLACE FUNCTION validate_ebook_mime_type()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.mime_type NOT IN ('application/pdf', 'application/epub+zip') THEN
        RAISE EXCEPTION 'Invalid MIME type. Only PDF and EPUB allowed.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 검증 트리거 연결
DROP TRIGGER IF EXISTS validate_ebooks_mime_type ON public.ebooks;
CREATE TRIGGER validate_ebooks_mime_type
BEFORE INSERT OR UPDATE ON public.ebooks
FOR EACH ROW
EXECUTE FUNCTION validate_ebook_mime_type();

-- 완료! 이제 PDF와 EPUB 업로드 가능
