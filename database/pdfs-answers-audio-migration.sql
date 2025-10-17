-- ============================================
-- PDFs 테이블에 정답 및 오디오 기능 추가
-- ============================================

-- 1. pdfs 테이블에 answers와 audio_buttons 컬럼 추가
ALTER TABLE public.pdfs
ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS audio_buttons JSONB DEFAULT '[]'::jsonb;

-- 2. 인덱스 추가 (JSONB 검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_pdfs_answers ON public.pdfs USING GIN (answers);
CREATE INDEX IF NOT EXISTS idx_pdfs_audio_buttons ON public.pdfs USING GIN (audio_buttons);

-- 3. 코멘트 추가
COMMENT ON COLUMN public.pdfs.answers IS 'PDF 페이지별 정답 데이터 (JSONB 배열)';
COMMENT ON COLUMN public.pdfs.audio_buttons IS 'PDF 페이지별 오디오 버튼 데이터 (JSONB 배열)';

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
--     "textX": 50,
--     "textY": 40,
--     "fontSize": 16,
--     "color": "#4caf50",
--     "visible": false
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
  AND table_name = 'pdfs'
  AND column_name IN ('answers', 'audio_buttons')
ORDER BY ordinal_position;
