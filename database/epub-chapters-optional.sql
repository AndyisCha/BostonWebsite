-- ============================================
-- EPUB 챕터 테이블 (선택사항)
-- ============================================
-- EPUB 파일의 챕터를 개별 관리하려면 실행
-- 실행 안 해도 EPUB 업로드는 정상 작동

-- 1. 챕터 테이블 생성
CREATE TABLE IF NOT EXISTS public.ebook_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ebook_id UUID NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    title TEXT,
    content TEXT,
    has_answers BOOLEAN DEFAULT false,
    answers JSONB DEFAULT '[]'::jsonb,
    audio_buttons JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ebook_id, chapter_number)
);

-- 2. 인덱스
CREATE INDEX IF NOT EXISTS idx_ebook_chapters_ebook_id
ON public.ebook_chapters(ebook_id);

CREATE INDEX IF NOT EXISTS idx_ebook_chapters_number
ON public.ebook_chapters(ebook_id, chapter_number);

-- 3. RLS 활성화
ALTER TABLE public.ebook_chapters ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책: 사용자는 자신의 ebook 챕터만 조회
DROP POLICY IF EXISTS "ebook_chapters_select_own" ON public.ebook_chapters;
CREATE POLICY "ebook_chapters_select_own"
ON public.ebook_chapters FOR SELECT TO authenticated
USING (ebook_id IN (SELECT id FROM public.ebooks WHERE user_id = auth.uid()));

-- 5. RLS 정책: 사용자는 자신의 ebook 챕터만 삽입
DROP POLICY IF EXISTS "ebook_chapters_insert_own" ON public.ebook_chapters;
CREATE POLICY "ebook_chapters_insert_own"
ON public.ebook_chapters FOR INSERT TO authenticated
WITH CHECK (ebook_id IN (SELECT id FROM public.ebooks WHERE user_id = auth.uid()));

-- 완료! EPUB 챕터 관리 가능
