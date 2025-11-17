# Express CORS 완벽 설정 가이드

## 1. 올바른 다중 Origin 처리

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// CORS_ORIGINS 환경변수에서 여러 origin 읽기
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// Fallback
if (allowedOrigins.length === 0) {
  allowedOrigins.push('http://localhost:3000', 'https://myapp.vercel.app');
}

// 동적 Origin 체크 (*.vercel.app 와일드카드 포함)
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Postman, server-to-server
  if (allowedOrigins.includes(origin)) return true;

  // *.vercel.app 모든 도메인 허용
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.vercel.app')) {
      console.log(`✅ Allowed Vercel preview: ${origin}`);
      return true;
    }
  } catch (e) {
    // Invalid URL
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      // ⭐ cb(null, true)를 호출하면 cors 미들웨어가
      // Access-Control-Allow-Origin: <요청한 origin> 으로 설정
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // 쿠키/인증 정보 허용
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // Preflight 캐시 24시간
};

// ⭐ 중요: CORS는 가장 먼저 적용!
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight 전역 처리

// 나머지 미들웨어
app.use(express.json());
// ... 기타 미들웨어

// 라우트
app.post('/api/auth/register', (req, res) => {
  // ... 로직
});

// ⭐⭐⭐ 핵심: Error handler에 CORS 헤더 추가!
app.use((error, req, res, next) => {
  // Error handler에서도 CORS 헤더 설정
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  console.error('Error:', error.message);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error'
  });
});

app.listen(3001, () => console.log('Server running on port 3001'));
```

## 2. OPTIONS 통과, POST 실패 패턴들

### 패턴 1: Error Handler에 CORS 헤더 없음 ⭐ (가장 흔한 원인)

```javascript
// ❌ 잘못된 예
app.use((error, req, res, next) => {
  // CORS 헤더 없이 에러 응답
  res.status(400).json({ error: error.message });
});

// ✅ 올바른 예
app.use((error, req, res, next) => {
  // CORS 헤더 포함
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.status(400).json({ error: error.message });
});
```

### 패턴 2: 특정 라우트에만 CORS 미적용

```javascript
// ❌ 잘못된 예
app.use(cors(corsOptions)); // 전역 CORS

// 하지만 특정 라우터는 CORS 전에 마운트
const adminRouter = express.Router();
adminRouter.post('/secret', handler);
app.use('/admin', adminRouter); // ← CORS보다 위에 있으면 적용 안됨!

// ✅ 올바른 예
app.use(cors(corsOptions)); // 먼저 CORS
app.use('/admin', adminRouter); // 그 다음 라우터
```

### 패턴 3: Rate Limiter가 CORS 헤더 없이 차단

```javascript
// ❌ 잘못된 예
const limiter = rateLimit({
  max: 5,
  message: 'Too many requests', // ← CORS 헤더 없는 응답
});
app.use(limiter); // CORS 전에 적용

// ✅ 올바른 예
app.use(cors(corsOptions)); // 먼저 CORS
const limiter = rateLimit({
  max: 5,
  handler: (req, res) => {
    // Rate limit 초과 시에도 CORS 헤더 포함
    const origin = req.headers.origin;
    if (origin && isOriginAllowed(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    res.status(429).json({ error: 'Too many requests' });
  }
});
app.use(limiter);
```

### 패턴 4: 커스텀 인증 미들웨어에서 CORS 헤더 누락

```javascript
// ❌ 잘못된 예
const authMiddleware = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' }); // CORS 헤더 없음
  }
  next();
};

// ✅ 올바른 예
const authMiddleware = (req, res, next) => {
  if (!req.headers.authorization) {
    const origin = req.headers.origin;
    if (origin && isOriginAllowed(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
```

## 3. 완벽한 Express 서버 구조

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// 1️⃣ CORS 설정 (가장 먼저!)
const corsOptions = {
  origin: (origin, callback) => {
    // ... origin 체크 로직
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 2️⃣ 보안 미들웨어
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 3️⃣ Rate limiting (CORS 헤더 포함)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res) => {
    const origin = req.headers.origin;
    if (origin && isOriginAllowed(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    res.status(429).json({ error: 'Too many requests' });
  }
});
app.use(limiter);

// 4️⃣ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5️⃣ 라우트
app.post('/api/auth/register', async (req, res, next) => {
  try {
    // ... 로직
    res.json({ success: true });
  } catch (error) {
    next(error); // Error handler로 전달
  }
});

// 6️⃣ 404 Handler (CORS 포함)
app.use((req, res) => {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  res.status(404).json({ error: 'Not found' });
});

// 7️⃣ Error Handler (CORS 포함!) ⭐⭐⭐
app.use((error, req, res, next) => {
  // ⭐ 모든 에러 응답에 CORS 헤더 추가
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  console.error('Error:', error);

  const statusCode = error.status || error.statusCode || 500;
  res.status(statusCode).json({
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

app.listen(3001);
```
