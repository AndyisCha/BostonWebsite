-- ============================================
-- E-book 정답 및 오디오 기능 추가
-- ============================================

-- 1. ebooks 테이블에 answers와 audio_buttons 컬럼 추가
ALTER TABLE public.ebooks
ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS audio_buttons JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS total_pages INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. 인덱스 추가 (JSONB 검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_ebooks_answers ON public.ebooks USING GIN (answers);
CREATE INDEX IF NOT EXISTS idx_ebooks_audio_buttons ON public.ebooks USING GIN (audio_buttons);

-- 3. 코멘트 추가
COMMENT ON COLUMN public.ebooks.answers IS 'E-book 페이지별 정답 데이터 (JSONB 배열)';
COMMENT ON COLUMN public.ebooks.audio_buttons IS 'E-book 페이지별 오디오 버튼 데이터 (JSONB 배열)';
COMMENT ON COLUMN public.ebooks.total_pages IS 'E-book 총 페이지 수';
COMMENT ON COLUMN public.ebooks.metadata IS '추가 메타데이터 (제목, 저자, 레벨, 카테고리 등)';

-- ============================================
-- 데이터 구조 예시
-- ============================================

-- answers 구조:
-- [
--   {
--     "id": "answer-1234567890",
--     "pageNumber": 1,
--     "text": "정답 텍스트",
--     "x": 50,
--     "y": 30,
--     "width": 200,
--     "height": 40
--   }
-- ]

-- audio_buttons 구조:
-- [
--   {
--     "id": "audio-1234567890",
--     "pageNumber": 1,
--     "audioUrl": "https://supabase.co/storage/...",
--     "x": 80,
--     "y": 20,
--     "label": "🔊 재생"
--   }
-- ]

-- metadata 구조:
-- {
--   "title": "기초 영문법",
--   "author": "홍길동",
--   "level": "A1_1",
--   "description": "초급 학습자를 위한 기초 영문법",
--   "category": ["문법", "기초"],
--   "tags": ["초급", "기초문법"],
--   "language": "ko"
-- }

-- ============================================
-- 확인 쿼리
-- ============================================

-- 컬럼 확인
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ebooks'
  AND column_name IN ('answers', 'audio_buttons', 'total_pages', 'metadata')
ORDER BY ordinal_position;
