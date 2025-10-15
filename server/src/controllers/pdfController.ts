import { Request, Response } from 'express';
import { StorageService } from '../lib/storage.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// 파일명 sanitize 함수
function sanitizeFileName(fileName: string): string {
  // 위험한 문자 제거 및 안전한 파일명 생성
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

// 권한 검사 함수 (사용자가 특정 파일에 접근 가능한지)
async function canAccessFile(userId: string, objectPath: string): Promise<boolean> {
  try {
    // objectPath 형식: userId/uuid-filename.pdf
    // 첫 번째 폴더가 userId와 일치하는지 확인
    const pathParts = objectPath.split('/');
    if (pathParts.length < 2) return false;

    const fileOwnerId = pathParts[0];
    return fileOwnerId === userId;
  } catch (e) {
    console.error('권한 검사 오류:', e);
    return false;
  }
}

// 파일 확장자 검증 (PDF 또는 EPUB)
function isValidEbookExtension(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return ext === '.pdf' || ext === '.epub';
}

// 파일 크기 검증 (기본 100MB)
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '104857600'); // 100MB

/**
 * POST /api/pdf/uploads/sign
 * 서명된 업로드 URL 발급
 */
export async function createSignedUploadUrl(req: Request, res: Response) {
  try {
    const { fileName, size, mime } = req.body;

    // 임시: 인증 사용자 ID (실제로는 req.user.id 사용)
    // const userId = (req as any).user?.id || 'test-user-123';
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    // 입력 검증
    if (!fileName || !size) {
      return res.status(400).json({
        error: '필수 필드 누락',
        required: ['fileName', 'size']
      });
    }

    // 파일 확장자 검증
    if (!isValidEbookExtension(fileName)) {
      return res.status(400).json({
        error: 'PDF 또는 EPUB 파일만 업로드 가능합니다.',
        allowedExtensions: ['.pdf', '.epub']
      });
    }

    // 파일 크기 검증
    if (size > MAX_FILE_SIZE) {
      return res.status(400).json({
        error: '파일 크기 초과',
        maxSize: MAX_FILE_SIZE,
        providedSize: size
      });
    }

    // 안전한 파일명 생성
    const safeFileName = sanitizeFileName(fileName);
    const fileId = uuidv4();
    const extension = path.extname(safeFileName);
    const objectPath = `${userId}/${fileId}${extension}`;

    console.log(`📤 업로드 URL 요청: userId=${userId}, fileName=${fileName}, size=${size}, objectPath=${objectPath}`);

    // Supabase Storage에서 서명된 업로드 URL 생성
    const { uploadUrl, token } = await StorageService.createSignedUploadUrl(
      'ebooks',
      objectPath,
      3600 // 1시간 유효
    );

    // 메타데이터를 DB에 저장 (상태: pending)
    const { error: dbError } = await supabaseAdmin
      .from('ebooks')
      .insert({
        id: fileId,
        user_id: userId,
        object_path: objectPath,
        file_name: safeFileName,
        size_bytes: size,
        mime_type: mime || 'application/pdf',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('DB 메타데이터 저장 실패:', dbError);
      // DB 저장 실패해도 업로드 URL은 반환 (나중에 수동 복구 가능)
    }

    console.log(`✅ 업로드 URL 생성 완료: objectPath=${objectPath}`);

    res.status(200).json({
      uploadUrl,
      objectPath,
      token,
      fileId,
      expiresIn: 3600
    });

  } catch (error: any) {
    console.error('❌ 업로드 URL 생성 실패:', error);
    res.status(500).json({
      error: '업로드 URL 생성 실패',
      message: error.message
    });
  }
}

/**
 * POST /api/pdf/uploads/complete
 * 업로드 완료 후 메타데이터 업데이트
 */
export async function completeUpload(req: Request, res: Response) {
  try {
    const { objectPath } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    if (!objectPath) {
      return res.status(400).json({ error: 'objectPath 필수' });
    }

    // 권한 검사
    if (!(await canAccessFile(userId, objectPath))) {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    console.log(`📋 업로드 완료 처리: userId=${userId}, objectPath=${objectPath}`);

    // Storage에 파일이 실제로 존재하는지 확인
    const exists = await StorageService.fileExists('ebooks', objectPath);
    if (!exists) {
      return res.status(404).json({ error: '파일이 Storage에 존재하지 않습니다.' });
    }

    // 파일 메타데이터 조회
    const metadata = await StorageService.getFileMetadata('ebooks', objectPath);

    // DB 상태 업데이트: pending → ready
    const { error: updateError } = await supabaseAdmin
      .from('ebooks')
      .update({
        status: 'ready',
        size_bytes: metadata.metadata?.size || 0,
        updated_at: new Date().toISOString()
      })
      .eq('object_path', objectPath)
      .eq('user_id', userId);

    if (updateError) {
      console.error('DB 업데이트 실패:', updateError);
      return res.status(500).json({
        error: 'DB 업데이트 실패',
        message: updateError.message
      });
    }

    console.log(`✅ 업로드 완료: objectPath=${objectPath}`);

    res.status(200).json({
      success: true,
      objectPath,
      status: 'ready'
    });

  } catch (error: any) {
    console.error('❌ 업로드 완료 처리 실패:', error);
    res.status(500).json({
      error: '업로드 완료 처리 실패',
      message: error.message
    });
  }
}

/**
 * POST /api/pdf/view-url
 * 보기용 서명 URL 발급 (1시간 만료, 다운로드 X)
 */
export async function createViewUrl(req: Request, res: Response) {
  try {
    const { objectPath } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    if (!objectPath) {
      return res.status(400).json({ error: 'objectPath 필수' });
    }

    // 권한 검사
    if (!(await canAccessFile(userId, objectPath))) {
      console.warn(`⚠️ 권한 없음: userId=${userId}, objectPath=${objectPath}`);
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    console.log(`👁️ 보기 URL 요청: userId=${userId}, objectPath=${objectPath}`);

    // 파일 존재 확인
    const exists = await StorageService.fileExists('ebooks', objectPath);
    if (!exists) {
      return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
    }

    // 서명 URL 생성 (1시간 만료, 다운로드 비활성화)
    const { url, expiresAt } = await StorageService.createSignedUrl(
      'ebooks',
      objectPath,
      3600, // 1시간
      false // 다운로드 비활성화
    );

    // 로깅: 보기 이벤트 기록
    try {
      await supabaseAdmin
        .from('ebook_view_logs')
        .insert({
          user_id: userId,
          object_path: objectPath,
          viewed_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        });
    } catch (logError) {
      console.warn('로그 저장 실패 (무시):', logError);
    }

    console.log(`✅ 보기 URL 생성 완료: objectPath=${objectPath}, expiresAt=${expiresAt.toISOString()}`);

    res.status(200).json({
      url,
      expiresAt: expiresAt.toISOString(),
      expiresIn: 3600
    });

  } catch (error: any) {
    console.error('❌ 보기 URL 생성 실패:', error);
    res.status(500).json({
      error: '보기 URL 생성 실패',
      message: error.message
    });
  }
}

/**
 * GET /api/pdf/list
 * 사용자의 PDF 목록 조회
 */
export async function listUserPdfs(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const { data, error } = await supabaseAdmin
      .from('ebooks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ready')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      pdfs: data || [],
      count: data?.length || 0
    });

  } catch (error: any) {
    console.error('❌ PDF 목록 조회 실패:', error);
    res.status(500).json({
      error: 'PDF 목록 조회 실패',
      message: error.message
    });
  }
}
