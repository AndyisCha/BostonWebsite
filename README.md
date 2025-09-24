# Boston English Learning Platform

보스턴 영어 학습 플랫폼은 CEFR 기반 레벨 테스트와 E-book 기능을 제공하는 종합 교육 관리 시스템입니다.

## 🌟 주요 기능

### 1. CEFR 레벨 테스트
- 21단계 세분화된 레벨 시스템 (A1-1 ~ C2-3)
- 적응형 알고리즘:
  - 정답 2연속 → 레벨업
  - 오답 2연속 → 레벨다운
  - 오답 3연속 → 시험종료
  - 정답 4연속 → 2단계 레벨업
- 총 50문제 제한
- 실시간 결과 분석 및 저장

### 2. E-book 기능
- EPUB 파일 업로드 및 렌더링
- Canvas 기반 그리기 도구:
  - 펜, 색연필, 지우개
  - 색상 및 두께 조절
  - 실행 취소/다시 실행
- 정답 토글 시스템
- 사용자별 그림 저장/불러오기

### 3. 다층 권한 시스템
- **Super Master**: 글로벌 시스템 관리
- **Country Master**: 국가별 지점 관리
- **Branch Admin**: 지점 내 사용자 및 콘텐츠 관리
- **Teacher**: 학생 성적 관리 및 과제 부여
- **Parent**: 자녀 학습 현황 조회
- **Student**: 테스트 응시 및 E-book 학습

## 🏗️ 기술 스택

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + Role-based Access Control
- **File Upload**: Multer + EPUB parsing

### Frontend
- **Framework**: React + TypeScript
- **UI Library**: Material-UI
- **State Management**: React Query + Context API
- **Canvas**: Fabric.js
- **E-book Rendering**: epub.js
- **Build Tool**: Vite

### DevOps
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (프록시 및 정적 파일 서빙)
- **Development**: Hot reload 지원

## 🚀 설치 및 실행

### 필수 요구사항
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (선택사항)

### 1. Docker를 사용한 실행 (권장)

```bash
# 저장소 클론
git clone <repository-url>
cd boston-english-platform

# 환경 변수 설정
cp server/.env.example server/.env

# Docker Compose로 전체 스택 실행
docker-compose up -d

# 데이터베이스 마이그레이션
docker-compose exec server npx prisma migrate deploy
```

### 2. 개발 모드로 실행

```bash
# 의존성 설치
npm run install:all

# 데이터베이스 설정
cd server
cp .env.example .env
# .env 파일에서 DATABASE_URL 설정
npx prisma migrate dev
npx prisma generate

# 개발 서버 시작 (server + client 동시 실행)
npm run dev
```

### 3. 개별 실행

```bash
# 서버 실행
cd server
npm run dev

# 클라이언트 실행 (새 터미널)
cd client
npm run dev
```

## 📋 환경 설정

### 서버 환경 변수 (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/boston_english_db"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
PORT=3001

# 이메일 설정
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# 파일 업로드
MAX_FILE_SIZE=50MB
UPLOAD_PATH="./uploads"

# CORS
CORS_ORIGIN="http://localhost:3000"
```

### 클라이언트 환경 변수 (.env)
```env
REACT_APP_API_URL=http://localhost:3001
```

## 📊 데이터베이스 스키마

주요 테이블:
- `User`: 사용자 정보 및 권한
- `Country`: 국가 정보
- `Branch`: 지점 정보
- `LevelTest`: 레벨 테스트 세션
- `Question`: 테스트 문제
- `TestAnswer`: 테스트 답안
- `Ebook`: E-book 정보
- `EbookPage`: E-book 페이지
- `Drawing`: 사용자 그림 데이터
- `AuditLog`: 감사 로그

## 🎯 주요 API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `GET /api/auth/profile` - 프로필 조회
- `POST /api/auth/impersonate` - 대행접속

### 레벨 테스트
- `POST /api/level-tests/start` - 테스트 시작
- `POST /api/level-tests/:testId/answer` - 답안 제출
- `GET /api/level-tests/:testId/result` - 결과 조회

### E-book
- `POST /api/ebooks/upload` - E-book 업로드
- `GET /api/ebooks/user/:userId` - 사용자 E-book 목록
- `POST /api/ebooks/:ebookId/content` - E-book 콘텐츠 접근
- `POST /api/ebooks/drawing/:pageId` - 그림 저장

## 🔒 보안 기능

- JWT 기반 인증
- Role-based Access Control (RBAC)
- Rate limiting
- CORS 설정
- Helmet.js 보안 헤더
- SQL Injection 방지 (Prisma ORM)
- XSS 방지
- 감사 로그 시스템

## 📱 반응형 디자인

- 모바일 퍼스트 디자인
- Material-UI 컴포넌트
- 터치 친화적 Canvas 인터페이스
- 다양한 화면 크기 지원

## 🧪 테스트

```bash
# 서버 테스트
cd server
npm test

# 클라이언트 테스트
cd client
npm test

# E2E 테스트 (추후 구현)
npm run test:e2e
```

## 📈 모니터링 및 로깅

- Health check 엔드포인트 (`/health`)
- 상세한 감사 로그
- 에러 추적 및 로깅
- 성능 모니터링 (추후 구현)

## 🚢 배포

### 프로덕션 배포
1. 환경 변수 설정 (프로덕션용 시크릿 키 등)
2. Docker 이미지 빌드
3. SSL 인증서 설정
4. Nginx 설정
5. 데이터베이스 마이그레이션

### AWS/GCP 배포 (예시)
```bash
# Docker 이미지 빌드 및 푸시
docker build -t boston-english-server ./server
docker build -t boston-english-client ./client

# 클라우드 배포 (상세 가이드는 별도 문서 참조)
```

## 🤝 기여하기

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다.

## 📞 지원

- 이슈 리포트: GitHub Issues
- 이메일: support@boston-english.com
- 문서: [Wiki](링크)

---

**Boston English Platform** - 영어 교육의 혁신을 위한 올인원 솔루션