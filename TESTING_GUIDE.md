# 🧪 PDF E-book 시스템 테스트 가이드

## 📋 사전 준비 체크리스트

### 1. 패키지 설치 확인
```bash
# 프론트엔드
npm list pdfjs-dist
# → pdfjs-dist@5.4.296 확인

# 서버
cd server && npm list @supabase/supabase-js
# → @supabase/supabase-js@2.57.4 확인
```

### 2. 파일 존재 확인
- [x] `public/pdf.worker.min.mjs` ✅
- [x] `server/.env` (SUPABASE_URL, SERVICE_ROLE_KEY 포함) ✅
- [x] `.env` (VITE_API_URL) ✅
- [x] `server/dist/controllers/pdfController.js` ✅
- [x] `server/dist/routes/pdfRoutes.js` ✅
- [x] `server/dist/middleware/authDummy.js` ✅

### 3. Supabase 설정 확인
- [ ] Storage 버킷 `ebooks` 생성 (비공개)
- [ ] `ebooks` 테이블 생성
- [ ] `ebook_view_logs` 테이블 생성
- [ ] RLS 정책 4개 (ebooks 테이블)
- [ ] Storage 정책 3개 (ebooks 버킷)

---

## 🚀 서버 실행

### 터미널 1: 백엔드 서버
```bash
cd server
npm run dev
```

**예상 출력:**
```
🔍 Environment check:
- PORT: 3005
- NODE_ENV: development
🚀 Server running on port 3005
✅ Server is ready to accept connections
```

**확인:**
```bash
curl http://localhost:3005/health
```

**응답:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-15T...",
  "uptime": 5,
  "port": 3005
}
```

---

## 🎨 프론트엔드 실행

### 터미널 2: 프론트엔드
```bash
npm run dev
```

**예상 출력:**
```
VITE v5.x ready in xxx ms
➜  Local:   http://localhost:3000/
```

**브라우저 열기:**
```
http://localhost:3000
```

---

## 🧪 테스트 시나리오

### 테스트 1: API 연결 확인

#### 1.1 Health Check
```bash
curl http://localhost:3005/health
```

**기대 결과:** 200 OK + JSON 응답

#### 1.2 PDF 라우트 확인
```bash
curl -X GET http://localhost:3005/api/v1/pdf/list \
  -H "Content-Type: application/json"
```

**기대 결과:**
```json
{
  "pdfs": [],
  "count": 0
}
```

---

### 테스트 2: 업로드 서명 URL 요청

```bash
curl -X POST http://localhost:3005/api/v1/pdf/uploads/sign \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.pdf",
    "size": 1024000,
    "mime": "application/pdf"
  }'
```

**기대 결과:**
```json
{
  "uploadUrl": "https://...supabase.co/storage/v1/object/upload/sign/ebooks/...",
  "objectPath": "test-user-123/uuid-test.pdf",
  "token": "...",
  "fileId": "uuid",
  "expiresIn": 3600
}
```

**로그 확인 (서버):**
```
⚠️ [AUTH DUMMY] 기본 테스트 사용자 사용: test-user-123
📤 업로드 URL 요청: userId=test-user-123, fileName=test.pdf, size=1024000
✅ 업로드 URL 생성 완료: objectPath=test-user-123/uuid-test.pdf
```

---

### 테스트 3: 프론트엔드 업로드 테스트

#### 3.1 테스트 페이지 추가

`src/App.tsx`에 라우트 추가:
```tsx
import { PdfTestPage } from './pages/PdfTestPage';

// 라우터 설정에 추가
<Route path="/pdf-test" element={<PdfTestPage />} />
```

또는 임시로 App.tsx를 교체:
```tsx
import { PdfTestPage } from './pages/PdfTestPage';

function App() {
  return <PdfTestPage />;
}

export default App;
```

#### 3.2 페이지 접속
```
http://localhost:3000/pdf-test
```

또는 루트:
```
http://localhost:3000/
```

#### 3.3 업로드 테스트
1. **PDF 파일 선택**
   - 테스트용 PDF 파일 준비 (< 100MB)
   - "파일 선택" 클릭

2. **파일 정보 확인**
   - 파일명, 크기, 타입 표시 확인

3. **업로드 실행**
   - "업로드" 버튼 클릭
   - 진행률 표시 확인 (0% → 100%)

4. **결과 확인**
   - 성공 메시지 확인
   - Object Path 표시 확인
   - "바로 보기" 버튼 표시 확인

**브라우저 콘솔 로그:**
```
📤 서명 업로드 URL 요청: fileName=test.pdf, size=1024000
✅ 서명 업로드 URL 수신: objectPath=test-user-123/uuid-test.pdf
📤 파일 업로드 시작: size=1024000
✅ 파일 업로드 완료
📋 업로드 완료 처리: objectPath=test-user-123/uuid-test.pdf
✅ 업로드 완료 확인: status=ready
✅ 업로드 성공: test-user-123/uuid-test.pdf
```

---

### 테스트 4: PDF 뷰어 테스트

#### 4.1 뷰어 열기
- 업로드 완료 후 "바로 보기" 버튼 클릭
- 또는 "내 PDF 목록" 탭에서 "보기" 클릭

#### 4.2 뷰어 기능 확인
1. **로딩 표시**
   - "PDF 로딩 중..." 메시지 확인

2. **PDF 렌더링**
   - 첫 페이지 표시 확인
   - 이미지가 깨끗하게 렌더링되는지 확인

3. **워터마크 확인**
   - 대각선으로 반투명 텍스트 표시 확인
   - 텍스트: "User: test@example.com | 2025-10-15T..."

4. **페이지 이동**
   - "다음" 버튼 → 2페이지 이동
   - "이전" 버튼 → 1페이지 복귀
   - 페이지 카운터 확인 (1 / 총페이지)

5. **확대/축소**
   - "확대 +" 버튼 → PDF 크기 증가
   - "축소 -" 버튼 → PDF 크기 감소
   - 비율 표시 확인 (100%, 125%, 150%, ...)

**브라우저 콘솔 로그:**
```
👁️ 보기 URL 요청: objectPath=test-user-123/uuid-test.pdf
✅ 보기 URL 수신: https://...supabase.co/...?token=..., 만료: 2025-10-15T14:30:00Z
PDF 로드 시작: test-user-123/uuid-test.pdf
보기 URL 수신: https://... 만료: 2025-10-15T14:30:00Z
PDF 로드 완료: 10 페이지
페이지 1 렌더링 중...
페이지 1 렌더링 완료
```

---

### 테스트 5: 보안 테스트

#### 5.1 다른 사용자 파일 접근 시도

**시나리오:**
1. 사용자 A로 업로드: `test-user-123/uuid-file.pdf`
2. 브라우저 개발자 도구에서 사용자 ID 변경:
   ```javascript
   // API 요청 헤더에 X-User-Id 추가
   fetch('http://localhost:3005/api/v1/pdf/view-url', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'X-User-Id': 'different-user-456'
     },
     body: JSON.stringify({
       objectPath: 'test-user-123/uuid-file.pdf'
     })
   })
   ```

**기대 결과:** 403 Forbidden
```json
{
  "error": "접근 권한이 없습니다."
}
```

#### 5.2 URL 만료 테스트
1. 보기 URL 발급
2. 브라우저 개발자 도구에서 URL 복사
3. 1시간 후 (또는 Supabase에서 수동으로 만료 시간 조작)
4. 동일 URL로 접근

**기대 결과:** 403 Forbidden 또는 만료 에러

---

### 테스트 6: 에러 처리

#### 6.1 파일 크기 초과
- 100MB 초과 파일 업로드 시도

**기대 결과:**
```
⚠️ 파일 크기는 100MB를 초과할 수 없습니다.
```

#### 6.2 잘못된 파일 형식
- PNG, DOCX 등 비-PDF 파일 업로드 시도

**기대 결과:**
```
⚠️ PDF 파일만 업로드 가능합니다.
```

#### 6.3 존재하지 않는 파일 보기
```bash
curl -X POST http://localhost:3005/api/v1/pdf/view-url \
  -H "Content-Type: application/json" \
  -d '{"objectPath": "test-user-123/nonexistent.pdf"}'
```

**기대 결과:** 404 Not Found
```json
{
  "error": "파일을 찾을 수 없습니다."
}
```

---

## 📊 Supabase 데이터 확인

### ebooks 테이블
1. Supabase Dashboard → **Table Editor** → `ebooks`
2. 업로드된 파일의 메타데이터 확인:
   - `id`: UUID
   - `user_id`: test-user-123
   - `object_path`: test-user-123/uuid-filename.pdf
   - `file_name`: test.pdf
   - `size_bytes`: 1024000
   - `status`: ready
   - `created_at`, `updated_at`: 타임스탬프

### Storage 버킷
1. Supabase Dashboard → **Storage** → `ebooks`
2. 폴더 구조 확인:
   ```
   ebooks/
   └── test-user-123/
       └── uuid-test.pdf
   ```

### ebook_view_logs 테이블
1. Table Editor → `ebook_view_logs`
2. 보기 이벤트 로그 확인:
   - `user_id`: test-user-123
   - `object_path`: test-user-123/uuid-test.pdf
   - `viewed_at`: 타임스탬프
   - `expires_at`: viewed_at + 1시간

---

## 🐛 문제 해결

### 1. "Failed to load PDF" 에러
**원인:** Supabase Storage 정책 미설정 또는 잘못된 objectPath

**해결:**
```sql
-- SQL Editor에서 실행
SELECT * FROM storage.objects WHERE bucket_id = 'ebooks';
-- 파일이 Storage에 존재하는지 확인

-- 정책 확인
SELECT * FROM storage.policies WHERE bucket_name = 'ebooks';
```

### 2. "Worker not found" 에러
**원인:** PDF.js Worker 파일 누락

**해결:**
```bash
# Worker 파일 확인
ls -la public/pdf.worker.min.mjs

# 없으면 복사
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

### 3. CORS 에러
**원인:** 서버 CORS 설정 문제

**해결:**
```bash
# server/.env 확인
cat server/.env | grep CORS_ORIGINS

# 프론트엔드 도메인 추가
CORS_ORIGINS=http://localhost:3000,http://localhost:3005
```

### 4. "401 Unauthorized" 에러
**원인:** 인증 미들웨어 미적용

**해결:**
- `pdfRoutes.ts`에서 `authenticateDummy` 미들웨어 확인
- 서버 재시작

---

## ✅ 최종 체크리스트

### 설정
- [ ] pdfjs-dist 설치 완료
- [ ] PDF Worker 파일 복사 완료
- [ ] 서버 .env 설정 완료
- [ ] 프론트 .env 설정 완료
- [ ] Supabase 버킷 생성 완료
- [ ] Supabase SQL 실행 완료

### 빌드
- [ ] 서버 빌드 성공 (`npm run build`)
- [ ] 프론트 빌드 성공 (`npm run build`)
- [ ] TypeScript 에러 없음

### 실행
- [ ] 서버 실행 성공 (포트 3005)
- [ ] 프론트 실행 성공 (포트 3000)
- [ ] Health check 응답 확인

### 기능 테스트
- [ ] PDF 업로드 성공
- [ ] 진행률 표시 확인
- [ ] Supabase Storage에 파일 저장 확인
- [ ] DB에 메타데이터 저장 확인
- [ ] PDF 뷰어 로딩 성공
- [ ] 워터마크 표시 확인
- [ ] 페이지 이동 작동 확인
- [ ] 확대/축소 작동 확인

### 보안 테스트
- [ ] 다른 사용자 파일 접근 차단 확인
- [ ] 파일 크기 제한 확인
- [ ] 파일 형식 검증 확인
- [ ] RLS 정책 작동 확인

---

## 🎉 테스트 완료!

모든 테스트를 통과했다면 시스템이 정상 작동하고 있습니다.

**다음 단계:**
1. 실제 인증 시스템 통합 (JWT, Supabase Auth)
2. 프로덕션 환경 배포 (Railway + Vercel)
3. 모니터링 및 로깅 설정
4. 성능 최적화 (캐싱, CDN 등)

**질문이나 문제가 있으면:**
- GitHub Issues
- SETUP_GUIDE.md 참조
- PDF_EBOOK_GUIDE.md 참조
