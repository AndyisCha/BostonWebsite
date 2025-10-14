import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import multer from 'multer';
import winston from 'winston';

// Supabase configuration
import { supabaseAdmin } from './lib/supabase.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import levelTestRoutes from './routes/levelTestRoutes.js';
import ebookRoutes from './routes/ebookRoutes.js';
import uploadRoutes from './routes/upload.js';
import courseRoutes from './routes/courseRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';

// Load environment variables
dotenv.config();

// Validate critical environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('⚠️  Server will continue but may have limited functionality');
}

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    ...(process.env.NODE_ENV !== 'production' ? [new winston.transports.Console({
      format: winston.format.simple()
    })] : [])
  ]
});

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

console.log(`🔍 Environment check:`);
console.log(`- PORT: ${PORT}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- Available ports: ${JSON.stringify(Object.keys(process.env).filter(key => key.includes('PORT')))}`);
console.log(`- Railway environment: ${process.env.RAILWAY_ENVIRONMENT || 'not detected'}`);
console.log(`- Current working directory: ${process.cwd()}`);
console.log(`- Available environment vars: ${Object.keys(process.env).length}`);

// CORS configuration - MUST be before helmet()
const corsOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3006',
  'https://boston-website-omega.vercel.app'
];

console.log(`🔒 CORS origins configured: ${corsOrigins.join(', ')}`);

// Manual CORS headers - MUST be first to override Railway
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Check if origin is allowed
  if (origin && corsOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`✅ CORS: Allowed origin ${origin}`);
  } else if (!origin) {
    // No origin header (server-to-server, Postman, etc.)
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    console.warn(`⚠️  CORS: Blocked origin ${origin}`);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
  res.setHeader('Access-Control-Max-Age', '600');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log(`🔍 OPTIONS request for ${req.path} from ${origin}`);
    return res.status(204).end();
  }

  next();
});

// Enable CORS with explicit configuration (backup)
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Security middleware - AFTER CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression middleware
app.use(compression());

// Cookie parser
app.use(cookieParser());

// Rate limiting configuration from environment
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 900
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
});

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Body parsing middleware
app.use(express.json({
  limit: process.env.MAX_FILE_SIZE || '100mb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: process.env.MAX_FILE_SIZE || '100mb'
}));

// Health check endpoint - simplified for Railway
app.get('/health', (req, res) => {
  try {
    console.log('🩺 Health check requested');
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      port: PORT
    });
    console.log('✅ Health check responded successfully');
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(503).json({
      status: 'ERROR',
      error: 'Health check failed'
    });
  }
});

// Simple root health check as backup
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint requested');
  res.status(200).json({
    message: 'Boston English Platform API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// API Routes with versioning
const apiRouter = express.Router();

// Mount versioned routes
apiRouter.use('/auth', authLimiter, authRoutes);
apiRouter.use('/level-tests', levelTestRoutes);
apiRouter.use('/ebooks', ebookRoutes);
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/courses', courseRoutes);
apiRouter.use('/courses/:courseId/lessons', lessonRoutes);


// Mount API router with prefix

app.use(process.env.API_PREFIX || '/api/v1', apiRouter);

// Static file serving for uploaded content
app.use('/uploads', express.static(process.env.UPLOAD_PATH || 'uploads'));

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Global error handler:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Supabase/PostgreSQL errors
  if (error.code && (error.code.startsWith('23') || error.code.startsWith('42'))) {
    return res.status(400).json({
      error: 'Database constraint error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Invalid data provided'
    });
  }

  // Multer errors
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        maxSize: process.env.MAX_FILE_SIZE || '100MB'
      });
    }
    return res.status(400).json({ error: 'File upload error' });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Validation errors
  if (error.name === 'ValidationError' || error.details) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details || error.message
    });
  }

  // Default error
  const statusCode = error.status || error.statusCode || 500;
  res.status(statusCode).json({
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Start server
console.log('🔧 Starting server...');
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 PORT: ${PORT}`);
console.log(`📊 Health check path: /health`);

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    corsOrigins: corsOrigins,
    apiPrefix: process.env.API_PREFIX || '/api/v1',
    timestamp: new Date().toISOString()
  });

  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS origins: ${corsOrigins.join(', ')}`);
  console.log(`📡 API prefix: ${process.env.API_PREFIX || '/api/v1'}`);
  console.log(`📝 Logs: ${process.env.LOG_LEVEL || 'info'} level`);
  console.log(`✅ Server is ready to accept connections`);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}, gracefully shutting down...`);

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force close after timeout
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;