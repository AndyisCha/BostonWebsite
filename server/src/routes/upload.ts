import express from 'express';
import { uploadImage, uploadEbook, uploadAudio, handleUploadError } from '../middleware/upload';
import { StorageService } from '../lib/storage';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// E-book 파일 업로드
router.post('/ebook', authenticate, uploadEbook.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileMetadata = await StorageService.uploadEbook(req.file);

    res.json({
      success: true,
      message: 'E-book uploaded successfully',
      data: fileMetadata
    });
  } catch (error) {
    console.error('E-book upload error:', error);
    res.status(500).json({ error: 'Failed to upload e-book' });
  }
});

// 커버 이미지 업로드
router.post('/cover', authenticate, uploadImage.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileMetadata = await StorageService.uploadCover(req.file);

    res.json({
      success: true,
      message: 'Cover image uploaded successfully',
      data: fileMetadata
    });
  } catch (error) {
    console.error('Cover upload error:', error);
    res.status(500).json({ error: 'Failed to upload cover image' });
  }
});

// 이미지 업로드
router.post('/image', authenticate, uploadImage.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileMetadata = await StorageService.uploadImage(req.file);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: fileMetadata
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// 오디오 파일 업로드
router.post('/audio', authenticate, uploadAudio.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileMetadata = await StorageService.uploadAudio(req.file);

    res.json({
      success: true,
      message: 'Audio uploaded successfully',
      data: fileMetadata
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    res.status(500).json({ error: 'Failed to upload audio' });
  }
});

// 파일 삭제
router.delete('/:bucket/:path(*)', authenticate, async (req, res) => {
  try {
    const { bucket, path } = req.params;

    await StorageService.deleteFile(bucket, path);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// 파일 목록 조회
router.get('/:bucket/list', authenticate, async (req, res) => {
  try {
    const { bucket } = req.params;
    const { folder, limit } = req.query;

    const files = await StorageService.listFiles(
      bucket,
      folder as string,
      parseInt(limit as string) || 100
    );

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('File list error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// 버켓 초기화 (임시로 인증 제거)
router.post('/init-buckets', async (req, res) => {
  try {
    await StorageService.initializeBuckets();

    res.json({
      success: true,
      message: 'Storage buckets initialized successfully'
    });
  } catch (error) {
    console.error('Bucket initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize buckets' });
  }
});

// 에러 핸들러
router.use(handleUploadError);

export default router;