# PDF E-book 업로드 및 보기 시스템

## 🎯 개요

사용자가 PDF e-book을 안전하게 업로드하고, Canvas 기반 뷰어로만 볼 수 있도록 제한하는 시스템입니다.

### 주요 특징
- ✅ **서명 URL 방식**: 클라이언트가 Supabase Storage에 직접 업로드
- ✅ **1시간 만료**: 보기 URL은 1시간 후 자동 만료
- ✅ **워터마크**: Canvas에 사용자 정보 표시 (유출 방지)
- ✅ **사용자별 폴더**: RLS로 다른 사용자 파일 접근 차단
- ✅ **진행률 표시**: 업로드 진행률 실시간 표시
- ✅ **보안**: 직접 URL 노출 없이 서명 URL로만 접근

---

## 📁 파일 구조

```
프로젝트/
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── pdfController.ts       # PDF 업로드/보기 컨트롤러
│   │   ├── routes/
│   │   │   └── pdfRoutes.ts          # PDF 라우트
│   │   ├── lib/
│   │   │   ├── supabase.ts           # Supabase 클라이언트
│   │   │   └── storage.ts            # Storage 서비스 (서명 URL 메서드 추가)
│   │   └── index.ts                   # Express 서버 (라우트 마운트)
│   └── .env                           # 서버 환경변수
├── src/
│   ├── components/
│   │   ├── PdfUploader.tsx           # PDF 업로드 컴포넌트
│   │   └── PdfViewer.tsx             # PDF 뷰어 (pdf.js + 워터마크)
│   └── services/
│       └── pdfService.ts              # PDF API 서비스
├── database/
│   └── supabase-pdf-security.sql     # Supabase SQL 정책
├── public/
│   └── pdf.worker.min.js              # PDF.js Worker (복사 필요)
├── SETUP_GUIDE.md                     # 설정 가이드
└── PDF_EBOOK_GUIDE.md                 # 이 파일
```

---

## 🚀 빠른 시작

### 1. 패키지 설치
```bash
# 서버
cd server
npm install

# 프론트엔드
cd ..
npm install pdfjs-dist
```

### 2. 환경 변수 설정
```bash
# server/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
CORS_ORIGINS=http://localhost:3000

# .env
VITE_API_URL=http://localhost:3001
VITE_API_PREFIX=/api/v1
```

### 3. Supabase 설정
```bash
# Supabase Dashboard에서 실행
1. Storage 버킷 생성: "ebooks" (비공개)
2. SQL Editor에서 실행: database/supabase-pdf-security.sql
```

### 4. PDF Worker 복사
```bash
cp node_modules/pdfjs-dist/build/pdf.worker.min.js public/
```

### 5. 서버 실행
```bash
cd server && npm run dev
```

### 6. 프론트엔드 실행
```bash
npm run dev
```

---

## 💻 사용 예제

### 업로드 컴포넌트

```tsx
import React, { useState } from 'react';
import { PdfUploader } from './components/PdfUploader';

function UploadPage() {
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);

  const handleUploadSuccess = (objectPath: string, fileId: string) => {
    console.log('업로드 완료:', objectPath);
    setUploadedPath(objectPath);

    // DB에 저장 또는 상태 관리
    // saveToDatabase(objectPath, fileId);
  };

  const handleUploadError = (error: Error) => {
    alert(`업로드 실패: ${error.message}`);
  };

  return (
    <div>
      <h1>PDF 업로드</h1>
      <PdfUploader
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        maxSizeMB={100}
      />

      {uploadedPath && (
        <div>
          <p>업로드 완료: {uploadedPath}</p>
          <a href={`/view/${encodeURIComponent(uploadedPath)}`}>
            PDF 보기
          </a>
        </div>
      )}
    </div>
  );
}
```

### 뷰어 컴포넌트

```tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { PdfViewer } from './components/PdfViewer';

function ViewPage() {
  const { objectPath } = useParams<{ objectPath: string }>();
  const userEmail = 'user@example.com'; // 실제로는 Context에서 가져오기

  if (!objectPath) {
    return <div>잘못된 경로입니다.</div>;
  }

  return (
    <div>
      <h1>PDF 보기</h1>
      <PdfViewer
        objectPath={decodeURIComponent(objectPath)}
        userEmail={userEmail}
        onError={(error) => {
          console.error('뷰어 에러:', error);
          alert(`PDF 로드 실패: ${error.message}`);
        }}
      />
    </div>
  );
}
```

### PDF 목록 조회

```tsx
import React, { useEffect, useState } from 'react';
import { listUserPdfs } from './services/pdfService';

function MyPdfsPage() {
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPdfs() {
      try {
        const { pdfs: userPdfs } = await listUserPdfs();
        setPdfs(userPdfs);
      } catch (error) {
        console.error('PDF 목록 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPdfs();
  }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      <h1>내 PDF 목록</h1>
      {pdfs.length === 0 ? (
        <p>업로드된 PDF가 없습니다.</p>
      ) : (
        <ul>
          {pdfs.map((pdf) => (
            <li key={pdf.id}>
              <a href={`/view/${encodeURIComponent(pdf.object_path)}`}>
                {pdf.file_name}
              </a>
              <span> ({(pdf.size_bytes / 1024 / 1024).toFixed(2)} MB)</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 🔌 API 엔드포인트

### 1. 서명 업로드 URL 발급
**POST** `/api/v1/pdf/uploads/sign`

**요청:**
```json
{
  "fileName": "my-ebook.pdf",
  "size": 5242880,
  "mime": "application/pdf"
}
```

**응답:**
```json
{
  "uploadUrl": "https://...signed-url...",
  "objectPath": "user-id/uuid-my-ebook.pdf",
  "token": "upload-token",
  "fileId": "uuid",
  "expiresIn": 3600
}
```

### 2. 파일 업로드 (Supabase Storage)
**PUT** `{uploadUrl}`

**헤더:**
```
Content-Type: application/pdf
```

**바디:** 파일 바이너리

### 3. 업로드 완료
**POST** `/api/v1/pdf/uploads/complete`

**요청:**
```json
{
  "objectPath": "user-id/uuid-my-ebook.pdf"
}
```

**응답:**
```json
{
  "success": true,
  "objectPath": "user-id/uuid-my-ebook.pdf",
  "status": "ready"
}
```

### 4. 보기 URL 발급
**POST** `/api/v1/pdf/view-url`

**요청:**
```json
{
  "objectPath": "user-id/uuid-my-ebook.pdf"
}
```

**응답:**
```json
{
  "url": "https://...signed-view-url...",
  "expiresAt": "2025-10-15T14:30:00Z",
  "expiresIn": 3600
}
```

### 5. PDF 목록 조회
**GET** `/api/v1/pdf/list`

**응답:**
```json
{
  "pdfs": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "object_path": "user-id/uuid-file.pdf",
      "file_name": "my-ebook.pdf",
      "size_bytes": 5242880,
      "status": "ready",
      "created_at": "2025-10-15T12:00:00Z"
    }
  ],
  "count": 1
}
```

---

## 🔒 보안 정책

### Storage 정책 (Supabase)
```sql
-- 사용자는 자신의 폴더만 읽기 가능
CREATE POLICY "users_can_read_own_files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ebooks'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- 사용자는 자신의 폴더만 업로드 가능
CREATE POLICY "users_can_upload_own_files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ebooks'
  AND split_part(name, '/', 1) = auth.uid()::text
);
```

### 서버 권한 검사
```typescript
// server/src/controllers/pdfController.ts
async function canAccessFile(userId: string, objectPath: string): Promise<boolean> {
  // objectPath 형식: userId/uuid-filename.pdf
  const pathParts = objectPath.split('/');
  if (pathParts.length < 2) return false;

  const fileOwnerId = pathParts[0];
  return fileOwnerId === userId;
}
```

---

## 🎨 워터마크 커스터마이징

### 워터마크 텍스트 변경
```tsx
<PdfViewer
  objectPath={objectPath}
  watermarkText="Confidential - Do Not Share"
  userEmail={userEmail}
/>
```

### 워터마크 스타일 변경
`src/components/PdfViewer.tsx`의 `drawWatermark` 함수 수정:

```typescript
const drawWatermark = (ctx: CanvasRenderingContext2D, text: string) => {
  const { width, height } = ctx.canvas;
  ctx.save();

  // 투명도 조정 (0.15 → 0.25)
  ctx.globalAlpha = 0.25;

  // 색상 변경
  ctx.fillStyle = '#FF0000'; // 빨간색

  // 폰트 크기 변경
  ctx.font = '32px Arial';

  // 회전 각도 변경
  ctx.rotate(-Math.PI / 4); // -45도

  ctx.fillText(text, 0, 0);
  ctx.restore();
};
```

---

## 🧪 테스트 시나리오

### 업로드 테스트
```bash
1. PDF 파일 선택 (10MB)
2. "업로드" 버튼 클릭
3. 진행률 확인: 0% → 50% → 100%
4. 성공 메시지 확인
5. Supabase Storage 확인: ebooks/user-id/uuid-file.pdf
6. DB 확인: ebooks 테이블에 메타데이터 존재
```

### 보기 테스트
```bash
1. objectPath로 뷰어 열기
2. 로딩 메시지 확인
3. PDF 첫 페이지 렌더링
4. 워터마크 표시 확인
5. "다음" 버튼 → 2페이지 렌더링
6. 확대/축소 테스트
```

### 보안 테스트
```bash
1. 사용자 A 로그인 → PDF 업로드
2. 사용자 B 로그인 → 사용자 A의 objectPath로 접근 시도
3. 결과: "접근 권한 없음" 에러 (403)
```

### 만료 테스트
```bash
1. 보기 URL 발급
2. 브라우저 개발자 도구에서 URL 복사
3. 1시간 후 동일 URL로 접근
4. 결과: 만료 에러 또는 403
5. 새 URL 요청 → 정상 작동
```

---

## ⚡ 성능 최적화

### 1. 캐싱 추가
```typescript
// sessionStorage에 1시간 캐싱
const cacheKey = `pdf-url-${objectPath}`;
const cached = sessionStorage.getItem(cacheKey);
if (cached) {
  const { url, expiresAt } = JSON.parse(cached);
  if (new Date(expiresAt) > new Date()) {
    return url;
  }
}
```

### 2. 압축 업로드
```typescript
// 대용량 파일의 경우 압축 후 업로드
import pako from 'pako';
const compressed = pako.gzip(fileBuffer);
```

### 3. 다중 페이지 미리로드
```typescript
// 현재 페이지 +1, +2 페이지 미리 렌더링
const preloadPages = [currentPage + 1, currentPage + 2];
preloadPages.forEach(pageNum => {
  if (pageNum <= numPages) {
    renderPageToOffscreenCanvas(pageNum);
  }
});
```

---

## 🐛 문제 해결

### "Failed to load PDF"
- Supabase Storage 정책 확인
- 서명 URL 만료 확인 (1시간)
- CORS 설정 확인

### "Worker not found"
- `public/pdf.worker.min.js` 파일 존재 확인
- CDN 방식으로 변경

### "Access denied"
- `req.user.id` 설정 확인 (인증 미들웨어)
- objectPath 형식 확인 (`{userId}/{filename}`)

### "Upload failed"
- 파일 크기 확인 (100MB 이하)
- MIME 타입 확인 (`application/pdf`)
- Supabase Storage 용량 확인

---

## 📚 참고 자료

- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [PDF.js 문서](https://mozilla.github.io/pdf.js/)
- [Canvas API 문서](https://developer.mozilla.org/ko/docs/Web/API/Canvas_API)

---

## 📝 라이선스

이 코드는 프로젝트의 일부로 제공되며, 프로젝트 라이선스를 따릅니다.
