import { Router } from 'express';
import { authenticate, requireContentCreator, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth';
import multer from 'multer';

const router = Router();

// File upload configuration for ebooks
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB for ebooks
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/epub+zip' ||
        file.mimetype === 'application/pdf' ||
        file.originalname.endsWith('.epub') ||
        file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only EPUB and PDF files are allowed'));
    }
  }
});

// Audio upload configuration
const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB for audio files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') ||
        file.originalname.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Public endpoints (browsing ebooks)
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    res.json({
      message: 'Get ebooks list endpoint - to be implemented',
      query: req.query,
      user: req.user ? { id: req.user.id, role: req.user.role } : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get ebooks' });
  }
});

router.get('/:ebookId', optionalAuth, async (req: AuthRequest, res) => {
  try {
    res.json({
      message: 'Get ebook details endpoint - to be implemented',
      ebookId: req.params.ebookId,
      user: req.user ? { id: req.user.id, role: req.user.role } : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get ebook details' });
  }
});

// Protected endpoints (require authentication)
router.use(authenticate);

// Get ebook content (for reading)
router.get('/:ebookId/content', async (req: AuthRequest, res) => {
  try {
    res.json({
      message: 'Get ebook content endpoint - to be implemented',
      ebookId: req.params.ebookId,
      userId: req.user?.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get ebook content' });
  }
});

// Track reading progress
router.post('/:ebookId/progress', async (req: AuthRequest, res) => {
  try {
    res.json({
      message: 'Update reading progress endpoint - to be implemented',
      ebookId: req.params.ebookId,
      userId: req.user?.id,
      body: req.body
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reading progress' });
  }
});

// Get user's reading progress
router.get('/:ebookId/progress', async (req: AuthRequest, res) => {
  try {
    res.json({
      message: 'Get reading progress endpoint - to be implemented',
      ebookId: req.params.ebookId,
      userId: req.user?.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get reading progress' });
  }
});

// Content creator endpoints
router.post('/', requireContentCreator(), upload.single('ebookFile'), async (req: AuthRequest, res) => {
  try {
    res.json({
      message: 'Upload ebook endpoint - to be implemented',
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null,
      body: req.body,
      uploadedBy: req.user?.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload ebook' });
  }
});

router.put('/:ebookId', requireContentCreator(), async (req: AuthRequest, res) => {
  try {
    res.json({
      message: 'Update ebook endpoint - to be implemented',
      ebookId: req.params.ebookId,
      body: req.body,
      updatedBy: req.user?.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ebook' });
  }
});

router.delete('/:ebookId', requireContentCreator(), async (req: AuthRequest, res) => {
  try {
    res.json({
      message: 'Delete ebook endpoint - to be implemented',
      ebookId: req.params.ebookId,
      deletedBy: req.user?.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ebook' });
  }
});

// Audio endpoints
router.get('/:ebookId/audio', async (req: AuthRequest, res) => {
  try {
    res.json({
      message: 'Get audio buttons endpoint - to be implemented',
      ebookId: req.params.ebookId,
      userId: req.user?.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get audio buttons' });
  }
});

router.get('/audio/:audioId', async (req: AuthRequest, res) => {
  try {
    res.json({
      message: 'Stream audio file endpoint - to be implemented',
      audioId: req.params.audioId,
      userId: req.user?.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stream audio file' });
  }
});

// Content creator audio endpoints
router.post('/:ebookId/audio', requireContentCreator(), audioUpload.single('audioFile'), async (req: AuthRequest, res) => {
  try {
    res.json({
      message: 'Upload audio endpoint - to be implemented',
      ebookId: req.params.ebookId,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null,
      body: req.body,
      uploadedBy: req.user?.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload audio' });
  }
});

router.put('/:ebookId/audio', requireContentCreator(), async (req: AuthRequest, res) => {
  try {
    res.json({
      message: 'Save audio buttons endpoint - to be implemented',
      ebookId: req.params.ebookId,
      body: req.body,
      updatedBy: req.user?.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save audio buttons' });
  }
});

router.delete('/audio/:audioId', requireContentCreator(), async (req: AuthRequest, res) => {
  try {
    res.json({
      message: 'Delete audio endpoint - to be implemented',
      audioId: req.params.audioId,
      deletedBy: req.user?.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete audio' });
  }
});

// Admin endpoints
router.get('/admin/all', requireAdmin(), async (req: AuthRequest, res) => {
  try {
    res.json({
      message: 'Get all ebooks (admin) endpoint - to be implemented',
      query: req.query,
      adminId: req.user?.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get all ebooks' });
  }
});

export default router;