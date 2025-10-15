# 📘 EPUB 지원 설정 가이드 (간단 버전)

## 🚀 실행 순서

### 1️⃣ Supabase Storage 설정
**Supabase Dashboard → Storage → ebooks 버킷 → Settings (톱니바퀴 아이콘)**

```
Allowed MIME types에 추가:
application/epub+zip
```

또는 비워두기 (서버에서 검증)

---

### 2️⃣ SQL 실행 (필수)
**Supabase Dashboard → SQL Editor → New Query**

**복사:** `database/epub-migration-simple.sql` 전체 내용

**붙여넣기 → Run 버튼 클릭**

**결과:**
```
Success. No rows returned
```

---

### 3️⃣ 서버 재시작 (이미 실행 중이면 생략)
```bash
cd server
npm start
```

---

### 4️⃣ 테스트
```bash
# 프론트엔드 실행
npm run dev

# 브라우저 열기
http://localhost:3000/pdf-test
```

**EPUB 파일 선택 → 업로드 → 성공!** ✅

---

## 📋 확인 방법

### Supabase Table Editor
**Table Editor → ebooks 테이블**

```sql
SELECT file_name, mime_type, metadata, status
FROM public.ebooks
ORDER BY created_at DESC;
```

**예상 결과:**
| file_name | mime_type | metadata | status |
|-----------|-----------|----------|--------|
| sample.epub | application/epub+zip | {} | ready |
| test.pdf | application/pdf | {} | ready |

---

## 🔧 선택사항 (EPUB 뷰어 구현 시)

**EPUB 챕터 테이블 생성:**
```bash
database/epub-chapters-optional.sql 실행
```

**언제 필요한가?**
- EPUB 챕터별 그리기 저장
- 챕터별 정답 관리
- 챕터별 오디오 버튼

**지금 안 해도 됨** - EPUB 업로드는 이미 작동합니다!

---

## ✅ 완료된 작업

- [x] 서버: EPUB 업로드 지원 (pdfController.ts)
- [x] 프론트: EPUB 업로드 UI (PdfUploader.tsx)
- [x] DB: metadata 필드 추가 (위 SQL)
- [x] EbookViewer: 펜/지우개/정답 기능

## 🔜 다음 단계 (선택)

1. epub.js 설치
2. EPUB 파서 구현
3. EPUB 뷰어와 Canvas 통합

---

## 💡 핵심 파일

| 파일 | 용도 |
|------|------|
| **database/epub-migration-simple.sql** | 필수 실행 (30초) |
| database/epub-chapters-optional.sql | 선택 실행 (EPUB 뷰어 시) |
| server/src/controllers/pdfController.ts | EPUB 업로드 처리 |
| src/components/PdfUploader.tsx | EPUB 업로드 UI |
| src/components/EbookViewer.tsx | 펜/지우개/정답 기능 |
