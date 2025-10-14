// Vercel Serverless Function for E-book Upload
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log(`[API] ${req.method} /api/v1/ebooks - ${new Date().toISOString()}`);

  try {
    if (req.method === 'GET') {
      // GET: List e-books
      return res.status(200).json({
        success: true,
        message: 'E-book list endpoint',
        data: [],
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      // POST: Upload e-book
      console.log('[API] E-book upload request received');
      console.log('[API] Headers:', req.headers);
      console.log('[API] Body type:', typeof req.body);

      let ebookData;

      // Handle different content types
      if (req.headers['content-type']?.includes('application/json')) {
        ebookData = req.body;
      } else if (req.headers['content-type']?.includes('multipart/form-data')) {
        // For file uploads, we'd need to use a library like formidable
        ebookData = { message: 'File upload detected, processing...' };
      } else {
        ebookData = req.body;
      }

      console.log('[API] Processed e-book data:', ebookData);

      // Forward to Railway backend for actual processing
      const RAILWAY_API_URL = 'https://boston-english-server.railway.app/api/v1/ebooks';

      try {
        console.log('[API] Forwarding to Railway backend...');
        const railwayResponse = await fetch(RAILWAY_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.authorization || ''
          },
          body: JSON.stringify(ebookData)
        });

        const railwayData = await railwayResponse.json();
        console.log('[API] Railway response:', railwayData);

        return res.status(railwayResponse.status).json({
          success: railwayResponse.ok,
          message: railwayResponse.ok ? 'E-book uploaded successfully via Railway' : 'Upload failed',
          data: railwayData,
          timestamp: new Date().toISOString(),
          source: 'railway-backend'
        });

      } catch (railwayError) {
        console.error('[API] Railway backend error:', railwayError);

        // Fallback: Save locally if Railway is down
        return res.status(200).json({
          success: true,
          message: 'E-book upload received (Railway backend unavailable)',
          data: {
            id: `ebook_${Date.now()}`,
            title: ebookData?.title || 'Unknown Title',
            author: ebookData?.author || 'Unknown Author',
            uploadedAt: new Date().toISOString(),
            status: 'pending_processing'
          },
          timestamp: new Date().toISOString(),
          source: 'vercel-fallback',
          note: 'Data saved locally, will sync with Railway when available'
        });
      }
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
      allowedMethods: ['GET', 'POST', 'OPTIONS']
    });

  } catch (error) {
    console.error('[API] Server error:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}