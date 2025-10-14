// Vercel Serverless Function for E-book Upload

// Disable body parser to handle FormData
export const config = {
  api: {
    bodyParser: false,
  },
};

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
      console.log('[API] Content-Type:', req.headers['content-type']);

      // For now, return success locally without Railway
      // Railway integration can be added later once the upload flow is working
      return res.status(200).json({
        success: true,
        message: 'E-book upload endpoint is working! File upload processing will be implemented soon.',
        data: {
          id: `ebook_${Date.now()}`,
          title: 'Test E-book',
          author: 'Test Author',
          uploadedAt: new Date().toISOString(),
          status: 'pending_processing'
        },
        timestamp: new Date().toISOString(),
        source: 'vercel-api',
        note: 'This is a test response. File processing will be added in the next step.'
      });
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