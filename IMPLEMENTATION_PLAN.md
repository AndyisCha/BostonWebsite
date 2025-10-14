# E-book 파일 업로드 구현 계획

## 문제 상황
- Railway 리버스 프록시가 CORS OPTIONS 요청을 가로채서 `https://railway.com`으로 응답
- OPTIONS 요청이 Express 서버에 도달하지 못함 (로그 확인 완료)
- Express CORS 설정은 올바르게 되어 있으나 Railway 인프라 레벨에서 차단됨

## 해결 방안: 프론트엔드에서 Supabase Storage 직접 업로드

### 아키텍처
```
[Before]
브라우저 → Railway API → Supabase Storage
         ❌ CORS 차단

[After]
브라우저 → Supabase Storage (파일)
       → Railway API (메타데이터만)
```

### 구현 단계

#### 1단계: Supabase Storage 버킷 설정 확인
- [ ] Supabase Dashboard → Storage
- [ ] `ebooks` 버킷 존재 확인
- [ ] RLS 정책 설정 (인증된 사용자만 업로드 가능)

```sql
-- RLS 정책 예시
CREATE POLICY "Authenticated users can upload ebooks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ebooks');

CREATE POLICY "Public can view ebooks"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ebooks');
```

#### 2단계: 프론트엔드 환경 변수 추가
파일: `.env.local` (Vercel에도 추가 필요)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 3단계: 프론트엔드 코드 수정

**파일: `src/components/admin/EbookManagement.tsx`**

```typescript
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const handleUpload = async () => {
  try {
    setUploading(true);
    setUploadProgress(0);

    // 1. 파일명 생성
    const fileExt = uploadForm.file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `books/${fileName}`;

    // 2. Supabase Storage에 직접 업로드
    console.log('📤 Uploading to Supabase Storage...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ebooks')
      .upload(filePath, uploadForm.file, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          const percentage = (progress.loaded / progress.total) * 100;
          setUploadProgress(Math.round(percentage));
        }
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // 3. Public URL 가져오기
    const { data: urlData } = supabase.storage
      .from('ebooks')
      .getPublicUrl(filePath);

    console.log('✅ File uploaded:', urlData.publicUrl);

    // 4. 메타데이터를 API로 전송 (Railway API 사용)
    console.log('📝 Saving metadata to database...');
    const response = await fetch(`${getApiUrl()}/ebooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        title: uploadForm.title,
        author: uploadForm.author,
        level: uploadForm.level,
        file_path: filePath,
        file_url: urlData.publicUrl,
        file_name: uploadForm.file.name,
        file_size: uploadForm.file.size,
        mime_type: uploadForm.file.type
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save metadata');
    }

    const result = await response.json();
    console.log('✅ E-book uploaded successfully:', result);

    setSnackbar({
      open: true,
      message: 'E-book uploaded successfully!',
      severity: 'success'
    });

    // 폼 리셋
    setUploadForm({ title: '', author: '', level: 'A1', file: null });
    setUploadProgress(0);

    // 목록 새로고침
    fetchEbooks();

  } catch (error) {
    console.error('❌ Upload error:', error);
    setSnackbar({
      open: true,
      message: error.message || 'Upload failed',
      severity: 'error'
    });
  } finally {
    setUploading(false);
  }
};
```

#### 4단계: 백엔드 API 수정

**파일: `server/src/routes/ebookRoutes.ts`**

기존 파일 업로드 엔드포인트 대신 메타데이터만 받는 엔드포인트로 수정:

```typescript
// Before: Multer로 파일 받음
router.post('/', upload.single('file'), ebookController.uploadEbook);

// After: JSON으로 메타데이터만 받음
router.post('/', ebookController.createEbook);
```

**파일: `server/src/controllers/ebookController.ts`**

```typescript
export const createEbook = async (req: Request, res: Response) => {
  try {
    const {
      title,
      author,
      level,
      file_path,   // Supabase에서 받은 경로
      file_url,    // Public URL
      file_name,
      file_size,
      mime_type
    } = req.body;

    // 인증 확인
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 검증
    if (!title || !author || !level || !file_path || !file_url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // DB에 메타데이터 저장
    const { data, error } = await supabaseAdmin
      .from('ebooks')
      .insert({
        title,
        author,
        level,
        file_path,
        file_url,
        file_name,
        file_size,
        mime_type,
        uploaded_by: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      message: 'E-book created successfully',
      ebook: data
    });

  } catch (error) {
    console.error('Create ebook error:', error);
    res.status(500).json({
      error: 'Failed to create ebook',
      details: error.message
    });
  }
};
```

#### 5단계: Vercel 환경 변수 추가
- [ ] Vercel Dashboard → Project Settings → Environment Variables
- [ ] `VITE_SUPABASE_URL` 추가
- [ ] `VITE_SUPABASE_ANON_KEY` 추가
- [ ] Redeploy

#### 6단계: 테스트

**테스트 체크리스트:**
- [ ] 파일 선택 시 진행률 표시 확인
- [ ] 업로드 성공 메시지 확인
- [ ] Supabase Storage에 파일 저장 확인
- [ ] DB에 메타데이터 저장 확인
- [ ] E-book 목록에 표시 확인
- [ ] 다운로드 기능 동작 확인
- [ ] 에러 처리 확인 (네트워크 오류, 권한 오류 등)

### 보안 고려사항

1. **Supabase RLS 정책 필수**
   - 인증된 사용자만 업로드 가능하도록 설정
   - Public 읽기 권한은 필요에 따라 설정

2. **프론트엔드 검증**
   - 파일 타입 검증 (.epub만 허용)
   - 파일 크기 제한 (예: 100MB)
   - 필수 필드 검증

3. **백엔드 재검증**
   - 메타데이터 저장 시 사용자 권한 확인
   - 파일 경로 검증 (경로 조작 방지)
   - XSS 방지를 위한 입력 sanitization

### 장점 요약
✅ Railway CORS 문제 완전 우회
✅ Vercel 4.5MB 제한 우회
✅ 더 빠른 업로드 속도
✅ 서버 부하 감소
✅ 진행률 표시 가능
✅ Supabase의 CDN 활용

### 예상 작업 시간
- Supabase 설정: 10분
- 프론트엔드 수정: 30분
- 백엔드 수정: 20분
- 테스트: 20분
- **총 예상: 1시간 30분**

### 참고 자료
- Supabase Storage 문서: https://supabase.com/docs/guides/storage
- Supabase RLS 가이드: https://supabase.com/docs/guides/auth/row-level-security
- @supabase/supabase-js 문서: https://supabase.com/docs/reference/javascript/storage

---

## 대안 (필요 시)

### 대안 1: Railway Custom Domain
- Custom domain 설정 시 Railway 프록시 동작이 달라질 수 있음
- 시도해볼 가치는 있으나 보장되지 않음

### 대안 2: 다른 호스팅 플랫폼
- Render.com
- Fly.io
- AWS ECS
- 하지만 직접 업로드 방식이 더 효율적

---

**작성일**: 2025-10-14
**상태**: 구현 대기 중
**우선순위**: 높음
