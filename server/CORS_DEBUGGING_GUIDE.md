# CORS 디버깅 완벽 가이드

## 4. 단계별 디버깅 방법

### 4-1. 브라우저 Network 탭에서 확인

#### Step 1: 개발자 도구 열기
1. F12 또는 우클릭 → 검사
2. **Network** 탭 선택
3. "Preserve log" 체크 (페이지 새로고침해도 로그 유지)
4. 필터에서 "Fetch/XHR" 선택

#### Step 2: OPTIONS Preflight 요청 확인

회원가입 시도 → Network 탭에서 두 개의 요청 확인:

```
1️⃣ OPTIONS 요청 (Preflight)
   Status: 204 No Content 또는 200 OK

   클릭 → Headers 탭 → Response Headers 확인:
   ✅ Access-Control-Allow-Origin: https://boston-website-3r0f...vercel.app
   ✅ Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   ✅ Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
   ✅ Access-Control-Allow-Credentials: true
```

**만약 OPTIONS가 실패하면:**
- CORS 미들웨어가 제대로 설정되지 않음
- `app.options('*', cors(corsOptions))` 확인

#### Step 3: POST 실제 요청 확인

```
2️⃣ POST 요청
   Status: 201 Created (성공) 또는 400/401/500 (에러)

   클릭 → Headers 탭 → Response Headers 확인:
   ✅ Access-Control-Allow-Origin: https://boston-website-3r0f...vercel.app
   ✅ Access-Control-Allow-Credentials: true
```

**⚠️ 만약 POST 응답에 위 헤더가 없으면:**
- Error handler가 CORS 헤더를 포함하지 않음
- 404 handler가 CORS 헤더를 포함하지 않음
- Rate limiter 등이 CORS 헤더 없이 응답

#### Step 4: Console 에러 메시지 분석

```javascript
// 패턴 1: Preflight 실패
"Response to preflight request doesn't pass access control check"
→ OPTIONS 요청의 Response Headers 확인

// 패턴 2: Origin 불일치
"Access-Control-Allow-Origin' header has a value 'X' that is not equal to 'Y'"
→ 서버가 잘못된 origin을 반환하고 있음

// 패턴 3: Credentials 문제
"The value of the 'Access-Control-Allow-Credentials' header in the response is ''
which must be 'true' when the request's credentials mode is 'include'"
→ credentials: true 설정 확인
```

### 4-2. curl로 테스트 (명령어)

#### 테스트 1: OPTIONS Preflight

```bash
curl -X OPTIONS \
  https://boston-english-server.railway.app/api/v1/auth/register \
  -H "Origin: https://boston-website-3r0fuod3z-andys-projects-5ab12bfb.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v
```

**성공 시 응답:**
```
< HTTP/1.1 204 No Content
< Access-Control-Allow-Origin: https://boston-website-3r0fuod3z-andys...vercel.app
< Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
< Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
< Access-Control-Allow-Credentials: true
```

#### 테스트 2: POST 실제 요청

```bash
curl -X POST \
  https://boston-english-server.railway.app/api/v1/auth/register \
  -H "Origin: https://boston-website-3r0fuod3z-andys-projects-5ab12bfb.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","firstName":"Test"}' \
  -v
```

**성공 시 응답 헤더에 반드시 포함:**
```
< Access-Control-Allow-Origin: https://boston-website-3r0fuod3z-andys...vercel.app
< Access-Control-Allow-Credentials: true
```

#### 테스트 3: 에러 케이스 (잘못된 데이터)

```bash
curl -X POST \
  https://boston-english-server.railway.app/api/v1/auth/register \
  -H "Origin: https://boston-website-3r0fuod3z-andys-projects-5ab12bfb.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -v
```

**⚠️ 주의: 400 에러를 반환해도 CORS 헤더는 반드시 포함되어야 함!**
```
< HTTP/1.1 400 Bad Request
< Access-Control-Allow-Origin: https://boston-website-3r0fuod3z-andys...vercel.app  ← 있어야 함!
< Access-Control-Allow-Credentials: true  ← 있어야 함!
```

### 4-3. Postman으로 테스트

#### Step 1: OPTIONS Preflight 수동 테스트

1. **새 요청 만들기**
2. Method: `OPTIONS`
3. URL: `https://boston-english-server.railway.app/api/v1/auth/register`
4. Headers 추가:
   ```
   Origin: https://boston-website-3r0fuod3z-andys-projects-5ab12bfb.vercel.app
   Access-Control-Request-Method: POST
   Access-Control-Request-Headers: Content-Type, Authorization
   ```
5. **Send** 클릭
6. Response Headers 확인:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Credentials`

#### Step 2: POST 요청 테스트

1. Method: `POST`
2. URL: `https://boston-english-server.railway.app/api/v1/auth/register`
3. Headers:
   ```
   Origin: https://boston-website-3r0fuod3z-andys-projects-5ab12bfb.vercel.app
   Content-Type: application/json
   ```
4. Body → raw → JSON:
   ```json
   {
     "email": "test@test.com",
     "password": "test123",
     "firstName": "Test"
   }
   ```
5. **Send** 클릭
6. Response Headers에서 CORS 헤더 확인

### 4-4. Railway 서버 로그 확인

#### Railway 대시보드에서:

1. **boston-english-server** 서비스 클릭
2. **Deployments** → 최신 배포 클릭
3. **Logs** 탭에서 다음 메시지 확인:

```
✅ 정상 로그:
🔒 CORS allowlist: https://boston-website-omega.vercel.app, http://localhost:3000
✅ CORS: Allowed Vercel preview domain https://boston-website-3r0fuod3z-...vercel.app
[CORS-SET] Access-Control-Allow-Origin: https://boston-website-3r0fuod3z-...vercel.app

❌ 문제 로그:
⚠️  CORS: Blocked origin https://...
```

### 4-5. 체크리스트

#### ✅ 서버 측 확인사항

- [ ] `app.use(cors(corsOptions))` 가 모든 라우트보다 먼저 실행됨
- [ ] `app.options('*', cors(corsOptions))` 가 설정됨
- [ ] Error handler에 CORS 헤더 추가됨
- [ ] 404 handler에 CORS 헤더 추가됨
- [ ] Rate limiter handler에 CORS 헤더 추가됨
- [ ] `corsOptions.credentials = true` 설정됨
- [ ] Origin 동적 체크 함수가 올바름
- [ ] Railway 환경변수 `CORS_ORIGINS` 설정됨

#### ✅ 클라이언트 측 확인사항

- [ ] `withCredentials: true` 설정 (axios/fetch)
- [ ] 요청 URL이 정확함 (https, 포트 등)
- [ ] Content-Type 헤더가 올바름
- [ ] Authorization 헤더 형식이 올바름

#### ✅ 배포 확인사항

- [ ] Vercel 환경변수 `VITE_API_BASE_URL` 설정됨
- [ ] Railway 환경변수 `CORS_ORIGINS` 설정됨
- [ ] Railway 재배포 완료
- [ ] Vercel 재배포 완료
- [ ] 브라우저 캐시 클리어 (Ctrl + Shift + Delete)

## 일반적인 실수와 해결책

### 실수 1: CORS 미들웨어가 라우트 뒤에 있음
```javascript
// ❌
app.use('/api', routes);
app.use(cors());

// ✅
app.use(cors());
app.use('/api', routes);
```

### 실수 2: credentials 옵션 불일치
```javascript
// 서버
corsOptions: { credentials: true }

// 클라이언트
axios.post(url, data, {
  withCredentials: true  // ← 반드시 같이 설정!
});
```

### 실수 3: Origin에 trailing slash
```javascript
// 환경변수
CORS_ORIGINS=https://myapp.vercel.app/  // ❌ 끝에 /

// 올바른 설정
CORS_ORIGINS=https://myapp.vercel.app   // ✅
```

### 실수 4: Helmet이 CORS 헤더 덮어쓰기
```javascript
// ✅ 올바른 순서
app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
```
