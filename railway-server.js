const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3001;

console.log('🚀 Railway Node.js HTTP server starting...');
console.log(`📍 PORT: ${PORT}`);
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`📂 Working directory: ${process.cwd()}`);

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  console.log(`📨 ${method} ${path} - ${new Date().toISOString()}`);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint
  if (path === '/health') {
    console.log('🩺 Health check requested');
    const healthResponse = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      port: PORT,
      message: 'Railway Node.js server is healthy',
      method: method,
      path: path
    };
    res.writeHead(200);
    res.end(JSON.stringify(healthResponse, null, 2));
    console.log('✅ Health check response sent successfully');
    return;
  }

  // Root endpoint
  if (path === '/') {
    console.log('🏠 Root endpoint requested');
    const rootResponse = {
      message: 'Boston English Platform - Railway Node.js Server',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health'
      },
      server: 'Node.js HTTP (no dependencies)',
      port: PORT
    };
    res.writeHead(200);
    res.end(JSON.stringify(rootResponse, null, 2));
    return;
  }

  // 404 for all other routes
  console.log(`❓ Unknown route: ${method} ${path}`);
  const notFoundResponse = {
    error: 'Route not found',
    method: method,
    path: path,
    timestamp: new Date().toISOString(),
    availableRoutes: ['/', '/health']
  };
  res.writeHead(404);
  res.end(JSON.stringify(notFoundResponse, null, 2));
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Railway Node.js server listening on port ${PORT}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🏠 Root endpoint: http://0.0.0.0:${PORT}/`);
  console.log(`🎯 Server ready to accept connections`);
});

// Error handling
server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});