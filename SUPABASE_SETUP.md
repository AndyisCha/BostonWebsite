# Supabase 설정 가이드 (단계별)

## 📌 개요
이 가이드는 PDF e-book 시스템을 위한 Supabase 설정을 단계별로 안내합니다.

---

## 1️⃣ Storage 버킷 생성

### 단계:
1. [Supabase Dashboard](https://supabase.com/dashboard) 로그인
2. 프로젝트 선택: `wpdzbhhzbtadoqojsilm`
3. 좌측 메뉴 **Storage** 클릭
4. **New bucket** 버튼 클릭

### 버킷 설정:
```
Name: ebooks
Public: OFF (비활성화 - 중요!)
File size limit: 104857600 (100MB)
Allowed MIME types: application/pdf
```

### 확인:
- Storage 페이지에 `ebooks` 버킷이 표시되어야 함
- 🔒 비공개(Private) 아이콘 확인

---

## 2️⃣ SQL 정책 실행

### 단계:
1. Supabase Dashboard → **SQL Editor**
2. **New query** 클릭
3. 아래 SQL 전체 복사 & 붙여넣기
4. **Run** 버튼 클릭 (Ctrl/Cmd + Enter)

### SQL 코드:

```sql
-- ============================================
-- 1. Ebooks 메타데이터 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS public.ebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    object_path TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    mime_type TEXT DEFAULT 'application/pdf',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ebooks_user_id ON public.ebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_ebooks_status ON public.ebooks(status);
CREATE INDEX IF NOT EXISTS idx_ebooks_created_at ON public.ebooks(created_at DESC);

-- RLS 활성화
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

-- RLS 정책
DROP POLICY IF EXISTS "ebooks_select_own" ON public.ebooks;
CREATE POLICY "ebooks_select_own"
ON public.ebooks FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "ebooks_insert_own" ON public.ebooks;
CREATE POLICY "ebooks_insert_own"
ON public.ebooks FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "ebooks_update_own" ON public.ebooks;
CREATE POLICY "ebooks_update_own"
ON public.ebooks FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "ebooks_delete_own" ON public.ebooks;
CREATE POLICY "ebooks_delete_own"
ON public.ebooks FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 2. Ebook 보기 로그 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS public.ebook_view_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    object_path TEXT NOT NULL,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ebook_view_logs_user_id ON public.ebook_view_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ebook_view_logs_viewed_at ON public.ebook_view_logs(viewed_at DESC);

ALTER TABLE public.ebook_view_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ebook_view_logs_select_own" ON public.ebook_view_logs;
CREATE POLICY "ebook_view_logs_select_own"
ON public.ebook_view_logs FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "ebook_view_logs_insert_own" ON public.ebook_view_logs;
CREATE POLICY "ebook_view_logs_insert_own"
ON public.ebook_view_logs FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================
-- 3. Storage 보안 정책
-- ============================================

DROP POLICY IF EXISTS "users_can_read_own_files" ON storage.objects;
CREATE POLICY "users_can_read_own_files"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'ebooks'
    AND split_part(name, '/', 1) = auth.uid()::text
);

DROP POLICY IF EXISTS "users_can_upload_own_files" ON storage.objects;
CREATE POLICY "users_can_upload_own_files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'ebooks'
    AND split_part(name, '/', 1) = auth.uid()::text
);

DROP POLICY IF EXISTS "users_can_delete_own_files" ON storage.objects;
CREATE POLICY "users_can_delete_own_files"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'ebooks'
    AND split_part(name, '/', 1) = auth.uid()::text
);

-- ============================================
-- 4. 자동 업데이트 트리거
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ebooks_updated_at ON public.ebooks;
CREATE TRIGGER update_ebooks_updated_at
BEFORE UPDATE ON public.ebooks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 실행 결과 확인:
- ✅ "Success. No rows returned" 메시지
- 또는 테이블/정책이 생성되었다는 메시지

---

## 3️⃣ 테이블 확인

### 단계:
1. Supabase Dashboard → **Table Editor**
2. 좌측 목록에서 확인:
   - ✅ `ebooks` 테이블
   - ✅ `ebook_view_logs` 테이블

### ebooks 테이블 구조:
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 기본 키 |
| user_id | UUID | 사용자 ID (auth.users 참조) |
| object_path | TEXT | Storage 경로 (user_id/uuid-filename.pdf) |
| file_name | TEXT | 원본 파일명 |
| size_bytes | BIGINT | 파일 크기 (bytes) |
| mime_type | TEXT | MIME 타입 (application/pdf) |
| status | TEXT | 상태 (pending/ready/failed) |
| created_at | TIMESTAMPTZ | 생성 시간 |
| updated_at | TIMESTAMPTZ | 수정 시간 |

---

## 4️⃣ RLS 정책 확인

### 단계:
1. Table Editor → `ebooks` 테이블 선택
2. 우측 상단 **⚙️ Settings** 클릭
3. **Policies** 탭 선택

### 확인할 정책 (4개):
- ✅ `ebooks_select_own` (SELECT)
- ✅ `ebooks_insert_own` (INSERT)
- ✅ `ebooks_update_own` (UPDATE)
- ✅ `ebooks_delete_own` (DELETE)

### Storage 정책 확인:
1. Storage → `ebooks` 버킷 클릭
2. **Policies** 탭 선택
3. 확인할 정책 (3개):
   - ✅ `users_can_read_own_files`
   - ✅ `users_can_upload_own_files`
   - ✅ `users_can_delete_own_files`

---

## 5️⃣ 테스트 사용자 생성 (선택)

### 방법 1: Email/Password
1. Authentication → Users → **Add user**
2. Email: `test@example.com`
3. Password: `test123456`
4. Auto Confirm User: **ON**

### 방법 2: SQL로 생성
```sql
-- 테스트 사용자 생성
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'test@example.com',
    crypt('test123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
);
```

---

## 6️⃣ 환경변수 재확인

### server/.env
```env
SUPABASE_URL=https://wpdzbhhzbtadoqojsilm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_ANON_KEY=eyJhbGci...
```

### 확인:
```bash
cd server
node -e "require('dotenv').config(); console.log('URL:', !!process.env.SUPABASE_URL, 'KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)"
```

출력: `URL: true KEY: true`

---

## 7️⃣ 연결 테스트

### 서버에서 테스트:
```bash
cd server
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
supabase.from('ebooks').select('count').then(r => console.log('연결 성공:', r));
"
```

예상 출력:
```
연결 성공: { data: null, error: null, count: 0, status: 200, statusText: 'OK' }
```

---

## 8️⃣ 문제 해결

### "relation does not exist" 에러
→ SQL 실행이 안 됨. SQL Editor에서 다시 실행

### "RLS policy violation" 에러
→ RLS 정책 확인. 사용자 ID가 auth.uid()와 일치하는지 확인

### "bucket does not exist" 에러
→ Storage에서 `ebooks` 버킷 생성 확인

### "permission denied for schema storage" 에러
→ Service Role Key 사용 확인 (Anon Key 아님)

---

## ✅ 완료 체크리스트

- [ ] Storage 버킷 `ebooks` 생성 (비공개)
- [ ] SQL 코드 실행 완료
- [ ] `ebooks` 테이블 확인
- [ ] `ebook_view_logs` 테이블 확인
- [ ] RLS 정책 4개 확인 (ebooks)
- [ ] Storage 정책 3개 확인 (ebooks bucket)
- [ ] 환경변수 확인 (SUPABASE_URL, SERVICE_ROLE_KEY)
- [ ] 연결 테스트 성공

---

## 🎉 완료!

이제 서버를 실행하고 PDF 업로드/보기를 테스트할 수 있습니다.

**다음 단계:**
```bash
# 터미널 1: 서버
cd server
npm run dev

# 터미널 2: 프론트
npm run dev
```

테스트 페이지: http://localhost:3000
