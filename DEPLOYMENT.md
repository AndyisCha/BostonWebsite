# 보스턴 영어 플랫폼 배포 가이드

## 개요
이 프로젝트는 Vercel (프론트엔드) + Railway (백엔드) + Supabase (데이터베이스) 구조로 배포됩니다.

## 배포 아키텍처
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Vercel    │    │   Railway   │    │  Supabase   │
│ (Frontend)  │───▶│  (Backend)  │───▶│ (Database)  │
│   Client    │    │   Server    │    │   Storage   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 사전 준비사항

### 1. Supabase 설정
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 다음 정보 확인:
   - Project URL
   - anon public key
   - service_role secret key
3. Storage 버킷 생성:
   - `ebooks` (public)
   - `media` (public)
   - `uploads` (public)

### 2. 필요한 계정
- [Vercel](https://vercel.com) 계정
- [Railway](https://railway.app) 계정
- GitHub 계정 (코드 저장소)

## 백엔드 배포 (Railway)

### 1. 저장소 연결
1. Railway 대시보드에서 "New Project" 클릭
2. GitHub 저장소의 `server` 폴더 연결
3. "Deploy from GitHub repo" 선택

### 2. 환경변수 설정
Railway 대시보드의 Variables 탭에서 다음 환경변수 설정:

```env
NODE_ENV=production
PORT=3003
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key-at-least-64-characters-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=104857600
UPLOAD_PATH=uploads/
LOG_LEVEL=info
API_VERSION=v1
API_PREFIX=/api/v1
```

### 3. 배포 확인
- Railway에서 자동 배포 완료 후 도메인 URL 확인
- `https://your-backend.railway.app/health` 엔드포인트로 헬스체크

## 프론트엔드 배포 (Vercel)

### 1. 저장소 연결
1. Vercel 대시보드에서 "New Project" 클릭
2. GitHub 저장소 import
3. Root Directory를 `client`로 설정

### 2. 빌드 설정
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3. 환경변수 설정
Vercel 대시보드의 Environment Variables에서 설정:

```env
VITE_NODE_ENV=production
VITE_API_URL=https://your-backend.railway.app/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 배포 확인
- Vercel에서 자동 배포 완료 후 도메인 URL 확인
- 프론트엔드에서 백엔드 API 연동 확인

## 배포 후 확인사항

### 1. 기능 테스트
- [ ] 사용자 회원가입/로그인
- [ ] E-book 업로드 및 조회
- [ ] MP3 오디오 재생
- [ ] 관리자 기능
- [ ] 레벨 테스트

### 2. 성능 확인
- [ ] 페이지 로드 속도
- [ ] API 응답 시간
- [ ] 파일 업로드/다운로드

### 3. 보안 확인
- [ ] HTTPS 연결
- [ ] CORS 설정
- [ ] JWT 토큰 검증
- [ ] Rate Limiting

## 도메인 설정 (선택사항)

### Vercel 커스텀 도메인
1. Vercel 프로젝트 설정 → Domains
2. 커스텀 도메인 추가
3. DNS 설정 (A 레코드 또는 CNAME)

### Railway 커스텀 도메인
1. Railway 프로젝트 설정 → Domain
2. 커스텀 도메인 추가
3. DNS 설정

## 모니터링 설정

### Vercel Analytics
- Vercel 대시보드에서 Analytics 활성화
- 사용자 트래픽 및 성능 모니터링

### Railway Observability
- Railway 대시보드에서 로그 및 메트릭 확인
- 서버 리소스 사용량 모니터링

## 트러블슈팅

### 일반적인 문제

#### 1. CORS 에러
- Railway 환경변수에서 `CORS_ORIGIN` 확인
- Vercel 도메인이 정확히 설정되었는지 확인

#### 2. API 연결 실패
- 프론트엔드의 `VITE_API_URL` 확인
- Railway 백엔드 도메인이 정확한지 확인

#### 3. 파일 업로드 실패
- Supabase Storage 버킷 권한 확인
- Railway 환경변수 `MAX_FILE_SIZE` 확인

#### 4. 데이터베이스 연결 실패
- Supabase 프로젝트 상태 확인
- 환경변수 `SUPABASE_URL` 및 키 확인

### 로그 확인
- **Vercel**: Functions 탭에서 로그 확인
- **Railway**: 프로젝트 대시보드에서 실시간 로그 확인
- **Supabase**: 대시보드에서 데이터베이스 로그 확인

## 업데이트 및 유지보수

### 코드 업데이트
1. GitHub에 코드 푸시
2. Railway/Vercel에서 자동 재배포
3. 배포 완료 후 기능 테스트

### 데이터베이스 마이그레이션
1. Supabase 대시보드에서 SQL 스크립트 실행
2. 또는 Prisma migrate 사용 (설정된 경우)

### 환경변수 업데이트
1. Railway/Vercel 대시보드에서 환경변수 수정
2. 애플리케이션 재시작 (필요시)

## 보안 권장사항

### 프로덕션 설정
- [ ] JWT_SECRET은 64자 이상의 강력한 비밀키 사용
- [ ] Rate Limiting 적절히 설정
- [ ] Supabase RLS (Row Level Security) 정책 설정
- [ ] 정기적인 의존성 업데이트

### 모니터링
- [ ] 에러 로그 정기 확인
- [ ] 비정상적인 트래픽 패턴 모니터링
- [ ] 데이터베이스 백업 정기 실행

이 가이드를 따라 배포하면 안정적인 프로덕션 환경을 구축할 수 있습니다.