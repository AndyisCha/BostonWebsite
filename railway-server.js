const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Railway minimal server starting...');
console.log(`📍 PORT: ${PORT}`);
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`📂 Working directory: ${process.cwd()}`);
console.log(`📁 Directory contents:`, require('fs').readdirSync('.').join(', '));

// Basic middleware
app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🩺 Health check requested at', new Date().toISOString());
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    port: PORT,
    message: 'Railway server is healthy'
  });
  console.log('✅ Health check response sent successfully');
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint requested');
  res.status(200).json({
    message: 'Boston English Platform - Railway Test Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health'
    }
  });
});

// Catch all other routes
app.use('*', (req, res) => {
  console.log(`❓ Unknown route requested: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Railway server listening on port ${PORT}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🎯 Server ready to accept connections`);
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