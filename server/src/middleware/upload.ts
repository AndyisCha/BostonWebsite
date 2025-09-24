import multer from 'multer';
import { Request } from 'express';

// 메모리 스토리지 사용 (Supabase로 직접 업로드)
const storage = multer.memoryStorage();

// 파일 필터 함수
const createFileFilter = (allowedTypes: string[]) => {
  return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
  };
};

// 기본 파일 업로드 설정
export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600') // 100MB 기본값
  }
});

// E-book 파일 업로드 (PDF, EPUB)
export const uploadEbook = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600') // 100MB
  },
  fileFilter: createFileFilter([
    'application/pdf',
    'application/epub+zip',
    'application/zip'
  ])
});

// 이미지 파일 업로드
export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: createFileFilter([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ])
});

// 오디오 파일 업로드
export const uploadAudio = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: createFileFilter([
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/m4a'
  ])
});

// 다중 파일 업로드 설정
export const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'),
    files: 10 // 최대 10개 파일
  }
});

// 에러 핸들러
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        maxSize: process.env.MAX_FILE_SIZE || '100MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        maxFiles: 10
      });
    }
    return res.status(400).json({
      error: 'File upload error',
      message: error.message
    });
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message
    });
  }

  next(error);
};