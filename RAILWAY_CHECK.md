# Railway CORS 문제 체크리스트

## 🚨 현재 문제
Railway에서 `Access-Control-Allow-Origin: https://railway.com`을 반환하고 있음

## ✅ 즉시 확인할 사항

### 1. Railway 환경 변수 확인
Railway Dashboard → boston-english-server → Settings → Variables

**삭제해야 할 변수:**
- `RAILWAY_STATIC_CORS_ENABLED` (있다면 삭제)
- `RAILWAY_CORS_ALLOW_ORIGIN` (있다면 삭제)
- 기타 `CORS_`로 시작하는 Railway 전용 변수

**유지할 변수:**
- `CORS_ORIGINS=https://boston-website-omega.vercel.app,http://localhost:3000`

### 2. Railway 서비스 설정 확인
Railway Dashboard → boston-english-server → Settings

**Networking 섹션:**
- Public Networking이 활성화되어 있는지 확인
- Custom Domain이 없는지 확인 (있으면 CORS 설정이 복잡해짐)

**Build 섹션:**
- Custom Build Command가 없는지 확인
- 있다면 기본값으로 되돌리기

### 3. Railway가 Proxy를 사용하는지 확인
만약 Railway가 reverse proxy를 통해 서비스를 제공한다면,
proxy가 CORS 헤더를 설정하고 있을 수 있음

**해결책:**
- Railway 로그에서 `X-Forwarded-For` 헤더 확인
- 실제 요청이 어디서 오는지 추적

### 4. Dockerfile 또는 nixpacks 설정 확인
`server/nixpacks.toml` 파일에 CORS 관련 환경 변수가 하드코딩되어 있는지 확인

## 🔧 배포 후 테스트 방법

### curl로 직접 테스트:
```bash
curl -X OPTIONS \
  https://boston-english-server.railway.app/api/v1/auth/register \
  -H "Origin: https://boston-website-omega.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v 2>&1 | grep -i "access-control"
```

**기대 결과:**
```
< Access-Control-Allow-Origin: https://boston-website-omega.vercel.app
< Access-Control-Allow-Credentials: true
< Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

**만약 여전히 `https://railway.com`이 나온다면:**
Railway가 강제로 CORS 헤더를 설정하고 있는 것 → Railway 지원팀 문의 필요

## 📝 Railway 로그 확인
배포 후 Railway 로그에서 다음 메시지 찾기:

```
🛡️ FORCED CORS middleware installed
✅ FORCED CORS: Set headers for https://boston-website-omega.vercel.app
🔧 FORCED CORS: Handling OPTIONS preflight for /api/v1/auth/register
```

이 메시지가 보이면 서버 코드는 정상 작동 중

## 🆘 최후의 수단

만약 Railway가 계속 CORS를 override한다면:

### Option A: Railway Private Network 사용
- Vercel에서 Railway private network로 연결
- 하지만 이건 복잡하고 비용이 들 수 있음

### Option B: 다른 호스팅으로 이동
- Render.com
- Fly.io
- Heroku
- 이들은 CORS override 문제가 없음

### Option C: Railway 지원 티켓
Railway가 예상치 못한 CORS 동작을 하고 있다면 버그일 수 있음
→ Railway Discord 또는 Support에 문의
