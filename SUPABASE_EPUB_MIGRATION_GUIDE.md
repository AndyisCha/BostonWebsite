# 📘 Supabase EPUB 지원 마이그레이션 가이드

## 🎯 목적
PDF 전용 시스템을 **PDF + EPUB 지원**으로 확장

---

## ✅ 필수 수정사항

### 1. Storage 버킷 설정 업데이트

**Supabase Dashboard → Storage → ebooks 버킷 → Settings**

**변경 전:**
```
Allowed MIME types: application/pdf
```

**변경 후:**
```
Allowed MIME types: application/pdf, application/epub+zip
```

또는 비워두기 (모든 파일 허용, 서버에서 검증)

---

### 2. 기본 마이그레이션 SQL 실행

**Supabase Dashboard → SQL Editor → New Query**

```sql
-- EPUB 메타데이터 필드 추가
ALTER TABLE public.ebooks
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 메타데이터 인덱스
CREATE INDEX IF NOT EXISTS idx_ebooks_metadata_type
ON public.ebooks USING gin (metadata);

-- MIME 타입 검증 함수
CREATE OR REPLACE FUNCTION validate_ebook_mime_type()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.mime_type NOT IN ('application/pdf', 'application/epub+zip') THEN
        RAISE EXCEPTION 'Invalid MIME type. Only PDF and EPUB are allowed.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 연결
DROP TRIGGER IF EXISTS validate_ebooks_mime_type ON public.ebooks;
CREATE TRIGGER validate_ebooks_mime_type
BEFORE INSERT OR UPDATE ON public.ebooks
FOR EACH ROW
EXECUTE FUNCTION validate_ebook_mime_type();
```

**실행:** `Run` 버튼 클릭

---

## 🔧 선택 사항 (EPUB 고급 기능)

### 옵션 A: EPUB 챕터 테이블

EPUB 파일의 각 챕터를 별도로 관리하려면:

```sql
-- database/supabase-epub-migration.sql 파일의
-- "4. EPUB 챕터 테이블" 섹션 실행
```

**장점:**
- 챕터별 그리기 저장
- 챕터별 정답 관리
- 챕터별 오디오 버튼

**단점:**
- 복잡도 증가
- 초기 파싱 시간 필요

---

### 옵션 B: EPUB 파싱 큐

백그라운드에서 EPUB 파일을 파싱하려면:

```sql
-- database/supabase-epub-migration.sql 파일의
-- "5. EPUB 파싱 작업 큐" 섹션 실행
```

**사용 시나리오:**
1. 사용자가 EPUB 업로드
2. `ebook_parse_queue`에 작업 추가
3. 백그라운드 워커가 EPUB 파싱
4. 챕터 추출 후 `ebook_chapters` 테이블에 저장

---

## 📊 현재 테이블 구조

### ebooks 테이블 (수정 후)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| user_id | TEXT | 사용자 ID |
| object_path | TEXT | Storage 경로 |
| file_name | TEXT | 파일명 |
| size_bytes | BIGINT | 파일 크기 |
| **mime_type** | TEXT | 'application/pdf' 또는 'application/epub+zip' |
| status | TEXT | 'pending', 'ready', 'failed' |
| **metadata** | JSONB | EPUB 메타데이터 (NEW) |
| created_at | TIMESTAMPTZ | 생성 시간 |
| updated_at | TIMESTAMPTZ | 수정 시간 |

### metadata 구조 예시

```json
{
  "type": "epub",
  "version": "3.0",
  "chapters": 15,
  "hasAnswers": true,
  "audioButtons": [
    {
      "chapterIndex": 3,
      "position": { "x": 50, "y": 30 },
      "audioUrl": "..."
    }
  ],
  "isbn": "978-1234567890",
  "publisher": "Boston English Academy"
}
```

---

## 🧪 테스트 계획

### 1. EPUB 업로드 테스트

```bash
# 프론트엔드 실행
npm run dev

# 브라우저에서
http://localhost:3000/pdf-test

# EPUB 파일 선택 → 업로드
# ✅ 예상: 업로드 성공, Storage에 저장
```

### 2. DB 확인

**Supabase Dashboard → Table Editor → ebooks**

```sql
SELECT
  file_name,
  mime_type,
  metadata,
  status
FROM public.ebooks
WHERE mime_type = 'application/epub+zip'
ORDER BY created_at DESC;
```

**예상 결과:**
```
file_name          | mime_type              | metadata              | status
-------------------|------------------------|-----------------------|-------
sample.epub        | application/epub+zip   | {"type": "epub"}      | ready
```

### 3. Storage 확인

**Supabase Dashboard → Storage → ebooks**

```
ebooks/
└── test-user-123/
    ├── uuid-file.pdf
    └── uuid-file.epub  ← 새로 업로드된 EPUB
```

---

## 🚀 실행 순서

### 필수 단계

1. **Storage 버킷 설정 변경**
   - Supabase Dashboard → Storage → ebooks → Settings
   - Allowed MIME types에 `application/epub+zip` 추가

2. **SQL 마이그레이션 실행**
   ```bash
   # Supabase Dashboard → SQL Editor
   # database/supabase-epub-migration.sql의
   # "1. EPUB 메타데이터 필드 추가" 섹션 실행
   ```

3. **서버 재시작**
   ```bash
   cd server
   npm start
   ```

4. **테스트**
   - EPUB 파일 업로드
   - DB에 저장 확인
   - Storage에 파일 확인

### 선택 단계 (EPUB 뷰어 구현 시)

5. **epub.js 라이브러리 설치**
   ```bash
   npm install epubjs
   ```

6. **EPUB 챕터 테이블 생성**
   ```sql
   -- database/supabase-epub-migration.sql의
   -- "4. EPUB 챕터 테이블" 섹션 실행
   ```

7. **EPUB 파서 구현**
   - `server/src/services/epubParser.ts` 생성
   - EPUB 파일을 읽어서 챕터 추출
   - `ebook_chapters` 테이블에 저장

---

## ⚠️ 주의사항

### 1. 기존 PDF 데이터 영향 없음
- 기존 PDF 파일은 그대로 유지
- 새 `metadata` 필드는 기본값 `{}`로 설정

### 2. RLS 정책 자동 적용
- EPUB 파일도 PDF와 동일한 보안 정책 적용
- 사용자는 자신의 파일만 접근 가능

### 3. MIME 타입 검증
- 서버: `pdfController.ts`에서 검증
- DB: 트리거로 이중 검증
- 클라이언트: `PdfUploader.tsx`에서 사전 검증

---

## 📋 체크리스트

- [ ] Supabase Storage 버킷 MIME 타입 변경
- [ ] SQL 마이그레이션 실행 (metadata 필드 추가)
- [ ] SQL 마이그레이션 실행 (MIME 검증 트리거)
- [ ] 서버 빌드 및 재시작
- [ ] EPUB 파일 업로드 테스트
- [ ] DB에 데이터 저장 확인
- [ ] Storage에 파일 저장 확인

**선택 사항:**
- [ ] EPUB 챕터 테이블 생성
- [ ] EPUB 파싱 큐 생성
- [ ] epub.js 라이브러리 설치
- [ ] EPUB 뷰어 통합

---

## 🔗 관련 파일

| 파일 | 역할 |
|------|------|
| `database/supabase-epub-migration.sql` | 전체 마이그레이션 SQL |
| `server/src/controllers/pdfController.ts` | EPUB 업로드 처리 (수정됨) |
| `src/components/PdfUploader.tsx` | EPUB 업로드 UI (수정됨) |
| `src/components/EbookViewer.tsx` | E-book 뷰어 (Canvas 기능 포함) |

---

## 💡 다음 단계

현재 상태: **EPUB 업로드 완료** ✅

다음 작업:
1. **EPUB 뷰어 구현** - epub.js로 EPUB 파일 렌더링
2. **Canvas 통합** - EbookViewer의 그리기 기능을 EPUB에도 적용
3. **정답 기능** - EPUB 챕터별 정답 보기/숨기기

진행할까요?
