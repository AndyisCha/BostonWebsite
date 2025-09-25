const express = require('express');
const app = express();

const PORT = process.env.PORT || 3001;

console.log('🚀 Starting simple server...');
console.log(`📍 PORT: ${PORT}`);
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

app.get('/health', (req, res) => {
  console.log('✅ Health check requested');
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get('/', (req, res) => {
  console.log('🏠 Root requested');
  res.json({ message: 'Simple server running', status: 'OK' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Simple server listening on port ${PORT}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
});