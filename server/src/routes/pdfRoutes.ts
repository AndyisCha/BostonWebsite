import express from 'express';
import {
  createSignedUploadUrl,
  completeUpload,
  createViewUrl,
  listUserPdfs
} from '../controllers/pdfController.js';
import { authenticateDummy } from '../middleware/authDummy.js';

const router = express.Router();

/**
 * PDF 업로드/보기 관련 라우트
 *
 * 개발 환경: authenticateDummy 사용 (테스트용)
 * 프로덕션: authenticate 미들웨어로 교체 필요
 */

// POST /api/pdf/uploads/sign - 서명된 업로드 URL 발급
router.post('/uploads/sign', authenticateDummy, createSignedUploadUrl);

// POST /api/pdf/uploads/complete - 업로드 완료 처리
router.post('/uploads/complete', authenticateDummy, completeUpload);

// POST /api/pdf/view-url - 보기용 서명 URL 발급 (1시간 만료)
router.post('/view-url', authenticateDummy, createViewUrl);

// GET /api/pdf/list - 사용자의 PDF 목록 조회
router.get('/list', authenticateDummy, listUserPdfs);

export default router;
