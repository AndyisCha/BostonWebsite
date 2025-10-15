# PDF E-book 업로드/보기 시스템 설정 가이드

## 📋 목차
1. [환경 변수 설정](#1-환경-변수-설정)
2. [패키지 설치](#2-패키지-설치)
3. [Supabase 설정](#3-supabase-설정)
4. [PDF.js Worker 설정](#4-pdfjs-worker-설정)
5. [개발 서버 실행](#5-개발-서버-실행)
6. [배포](#6-배포)
7. [테스트](#7-테스트)

---

## 1. 환경 변수 설정

### 서버 환경변수 (`server/.env`)

```env
# 환경 설정
NODE_ENV=production
PORT=3001

# Supabase 설정
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS 설정 (쉼표로 구분)
CORS_ORIGINS=http://localhost:3000,https://your-domain.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 파일 업로드 설정 (최대 100MB)
MAX_FILE_SIZE=104857600
UPLOAD_PATH=uploads/

# API 설정
API_PREFIX=/api/v1

# 로깅
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### 프론트엔드 환경변수 (`.env`)

```env
# API 서버 URL
VITE_API_URL=http://localhost:3001
VITE_API_PREFIX=/api/v1

# 또는 배포 환경
# VITE_API_URL=https://your-railway-app.railway.app
```

---

## 2. 패키지 설치

### 서버 패키지 설치

```bash
cd server
npm install
```

**이미 설치된 패키지:**
- `@supabase/supabase-js`: Supabase 클라이언트
- `express`: 웹 서버
- `uuid`: UUID 생성
- `dotenv`: 환경변수 관리
- 기타 (cors, helmet, compression 등)

**추가 필요 없음** - 기존 `package.json`에 모두 포함됨

### 프론트엔드 패키지 설치

```bash
cd ../  # 프로젝트 루트로 이동
npm install pdfjs-dist
```

**설치할 패키지:**
```bash
npm install pdfjs-dist
```

**이미 설치된 패키지:**
- `react`, `react-dom`: React 기본
- `axios`: HTTP 클라이언트 (pdfService에서는 fetch 사용)
- `vite`: 빌드 도구

**package.json에 추가:**
```json
{
  "dependencies": {
    "pdfjs-dist": "^3.11.174"
  }
}
```

---

## 3. Supabase 설정

### 3.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com) 로그인
2. 새 프로젝트 생성
3. 프로젝트 URL 및 API 키 복사

### 3.2 Storage 버킷 생성
1. Supabase Dashboard → **Storage**
2. **New bucket** 클릭
3. 버킷 설정:
   - Name: `ebooks`
   - Public: **OFF** (비공개)
   - File size limit: `104857600` (100MB)
   - Allowed MIME types: `application/pdf`

### 3.3 SQL 정책 실행
1. Supabase Dashboard → **SQL Editor**
2. `database/supabase-pdf-security.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기 후 **Run** 실행

**실행 내용:**
- `ebooks` 테이블 생성 (메타데이터)
- `ebook_view_logs` 테이블 생성 (로그)
- RLS 정책 설정 (사용자별 접근 제한)
- Storage 정책 설정 (폴더별 접근 제한)

### 3.4 인증 설정 (선택)
- 이미 Auth가 설정되어 있다면 **Skip**
- 새로 설정하려면:
  1. Supabase Dashboard → **Authentication**
  2. Email/Password 또는 OAuth 활성화
  3. 테스트 사용자 생성

---

## 4. PDF.js Worker 설정

### 4.1 Worker 파일 복사
PDF.js는 Web Worker를 사용하므로 `pdf.worker.min.js` 파일이 필요합니다.

**방법 1: CDN 사용 (권장)**
`src/components/PdfViewer.tsx`에서 이미 설정됨:
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
```

Worker 파일을 `public/` 폴더에 복사:
```bash
cp node_modules/pdfjs-dist/build/pdf.worker.min.js public/
```

**방법 2: Unpkg CDN 사용**
`PdfViewer.tsx`에서 변경:
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
```

### 4.2 타입 정의 (TypeScript)
`pdfjs-dist`는 타입이 포함되어 있으므로 별도 설치 불필요.

---

## 5. 개발 서버 실행

### 5.1 서버 실행
```bash
cd server
npm run dev
```

**포트:** `3001` (기본값)
**확인:** http://localhost:3001/health

### 5.2 프론트엔드 실행
```bash
cd ../  # 프로젝트 루트
npm run dev
```

**포트:** `3000` (기본값)
**확인:** http://localhost:3000

### 5.3 동시 실행 (옵션)
루트 `package.json`에 추가:
```json
{
  "scripts": {
    "dev:server": "cd server && npm run dev",
    "dev:client": "npm run dev",
    "dev:all": "concurrently \"npm run dev:server\" \"npm run dev:client\""
  }
}
```

설치:
```bash
npm install -D concurrently
```

실행:
```bash
npm run dev:all
```

---

## 6. 배포

### 6.1 서버 배포 (Railway)
1. [Railway](https://railway.app) 로그인
2. **New Project** → GitHub 저장소 연결
3. **Add Service** → `server/` 디렉토리 선택
4. **Environment Variables** 설정:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `JWT_SECRET`
   - `CORS_ORIGINS` (Vercel 도메인 포함)
   - `NODE_ENV=production`
5. **Deploy** 클릭

**배포 확인:**
```
https://your-app.railway.app/health
```

### 6.2 프론트엔드 배포 (Vercel)
1. [Vercel](https://vercel.com) 로그인
2. **New Project** → GitHub 저장소 연결
3. **Environment Variables** 설정:
   ```
   VITE_API_URL=https://your-app.railway.app
   VITE_API_PREFIX=/api/v1
   ```
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Deploy** 클릭

**배포 확인:**
```
https://your-domain.vercel.app
```

### 6.3 CORS 설정 업데이트
서버 `.env` 또는 Railway 환경변수:
```env
CORS_ORIGINS=https://your-domain.vercel.app,https://your-preview-*.vercel.app
```

---

## 7. 테스트

### 7.1 업로드 테스트

**컴포넌트 사용 예시:**
```tsx
import { PdfUploader } from './components/PdfUploader';

function App() {
  const handleUploadSuccess = (objectPath: string, fileId: string) => {
    console.log('업로드 성공:', objectPath, fileId);
    // objectPath를 state나 DB에 저장
  };

  return (
    <PdfUploader
      onUploadSuccess={handleUploadSuccess}
      onUploadError={(error) => alert(error.message)}
      maxSizeMB={100}
    />
  );
}
```

**테스트 시나리오:**
1. PDF 파일 선택
2. "업로드" 버튼 클릭
3. 진행률 확인 (0% → 100%)
4. 성공 메시지 확인
5. Supabase Storage에서 파일 확인
6. `ebooks` 테이블에서 메타데이터 확인

### 7.2 보기 테스트

**컴포넌트 사용 예시:**
```tsx
import { PdfViewer } from './components/PdfViewer';

function ViewPage() {
  const objectPath = 'user-id/uuid-filename.pdf'; // DB에서 조회

  return (
    <PdfViewer
      objectPath={objectPath}
      userEmail="user@example.com"
      onError={(error) => console.error('뷰어 에러:', error)}
    />
  );
}
```

**테스트 시나리오:**
1. 업로드된 PDF의 `objectPath` 사용
2. 뷰어 로딩 확인
3. PDF 페이지 렌더링 확인
4. 워터마크 표시 확인 (대각선 텍스트)
5. 페이지 이동 테스트 (이전/다음)
6. 확대/축소 테스트

### 7.3 보안 테스트

**RLS 테스트:**
1. 사용자 A로 로그인
2. 사용자 A가 PDF 업로드
3. 사용자 B로 로그인
4. 사용자 A의 PDF 접근 시도 → **차단되어야 함**

**서명 URL 만료 테스트:**
1. PDF 보기 URL 요청
2. 1시간 후 동일 URL 재사용 → **만료 에러 발생**
3. 새 URL 요청 → **정상 작동**

### 7.4 에러 테스트

**파일 크기 초과:**
```
✅ 100MB 초과 파일 업로드 → "파일 크기 초과" 에러
```

**잘못된 파일 형식:**
```
✅ PNG, DOCX 등 업로드 → "PDF만 가능" 에러
```

**권한 없음:**
```
✅ 다른 사용자 파일 접근 → "접근 권한 없음" 에러
```

---

## 8. 문제 해결

### 8.1 CORS 에러
**증상:** `Access-Control-Allow-Origin` 에러

**해결:**
1. 서버 `.env`에 프론트엔드 도메인 추가:
   ```env
   CORS_ORIGINS=http://localhost:3000,https://your-domain.vercel.app
   ```
2. Railway 환경변수 업데이트
3. 서버 재시작

### 8.2 PDF Worker 에러
**증상:** `Setting up fake worker failed` 또는 `Worker not found`

**해결:**
1. `public/pdf.worker.min.js` 파일 존재 확인
2. 브라우저 콘솔에서 `/pdf.worker.min.js` 접근 가능 확인
3. CDN 방식으로 변경 (위 4.1 참조)

### 8.3 Supabase 인증 에러
**증상:** `401 Unauthorized` 또는 `Missing token`

**해결:**
1. `localStorage.getItem('token')` 존재 확인
2. JWT 토큰 유효성 확인
3. 서버 `JWT_SECRET` 일치 확인

### 8.4 파일 업로드 실패
**증상:** `Failed to upload file` 또는 `403 Forbidden`

**해결:**
1. Supabase Storage 정책 확인 (SQL 재실행)
2. 버킷 `ebooks` 존재 확인
3. `user_id` 폴더 경로 형식 확인 (`{user_id}/{uuid}-{filename}.pdf`)

---

## 9. 추가 개선사항

### 9.1 진행률 개선
XHR 대신 Fetch API + ReadableStream 사용:
```typescript
// pdfService.ts에서 구현 가능
const response = await fetch(uploadUrl, { method: 'PUT', body: file });
const reader = response.body?.getReader();
// ... stream 읽기 및 진행률 계산
```

### 9.2 캐싱
보기 URL을 1시간 동안 캐싱:
```typescript
const cachedUrl = sessionStorage.getItem(`pdf-${objectPath}`);
if (cachedUrl && !isExpired(cachedUrl)) {
  return cachedUrl;
}
```

### 9.3 다중 페이지 렌더링
현재는 1페이지씩 렌더링하지만, 전체 페이지 미리보기 추가:
```typescript
const thumbnails = await Promise.all(
  Array.from({ length: numPages }, (_, i) => renderThumbnail(i + 1))
);
```

---

## 10. 연락처 및 지원

**문제 발생 시:**
1. GitHub Issues 등록
2. 로그 파일 확인 (`server/logs/`)
3. Supabase Dashboard에서 에러 로그 확인

**참고 문서:**
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [Railway Deployment Guide](https://docs.railway.app/)
- [Vercel Deployment Guide](https://vercel.com/docs)
