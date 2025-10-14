// Simple test endpoint to verify Vercel Functions work
export default function handler(req, res) {
  console.log(`[TEST] ${req.method} /api/test - ${new Date().toISOString()}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Vercel API Functions are working!',
    method: req.method,
    timestamp: new Date().toISOString(),
    headers: req.headers,
    query: req.query,
    body: req.body
  });
}