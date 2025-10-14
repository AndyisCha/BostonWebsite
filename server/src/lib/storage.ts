import { supabase, supabaseAdmin } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export interface UploadOptions {
  bucket: string;
  folder?: string;
  fileName?: string;
  upsert?: boolean;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
  publicUrl: string;
  bucket: string;
  path: string;
  uploadedAt: Date;
}

export class StorageService {
  // 파일 업로드
  static async uploadFile(
    file: Express.Multer.File | Buffer,
    options: UploadOptions
  ): Promise<FileMetadata> {
    const { bucket, folder = '', fileName, upsert = false } = options;

    // 파일 이름 생성
    const fileId = uuidv4();
    const originalName = typeof file === 'object' && 'originalname' in file ? file.originalname : fileName || 'file';
    const extension = path.extname(originalName);
    const finalFileName = fileName || `${fileId}${extension}`;
    const filePath = folder ? `${folder}/${finalFileName}` : finalFileName;

    // 파일 데이터 준비
    const fileData = typeof file === 'object' && 'buffer' in file ? file.buffer : file as Buffer;
    const mimeType = typeof file === 'object' && 'mimetype' in file ? file.mimetype : 'application/octet-stream';
    const size = typeof file === 'object' && 'size' in file ? file.size : (fileData as Buffer).length;

    // Supabase Storage에 업로드
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, fileData as any, {
        contentType: mimeType,
        upsert
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Public URL 생성
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      id: fileId,
      name: finalFileName,
      size,
      mimeType,
      url: data.path,
      publicUrl: publicUrlData.publicUrl,
      bucket,
      path: filePath,
      uploadedAt: new Date()
    };
  }

  // 파일 다운로드
  static async downloadFile(bucket: string, filePath: string): Promise<Blob> {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .download(filePath);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    return data;
  }

  // 파일 삭제
  static async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // 파일 목록 조회
  static async listFiles(bucket: string, folder?: string, limit = 100): Promise<any[]> {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .list(folder, {
        limit,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    return data || [];
  }

  // E-book 특화 업로드
  static async uploadEbook(file: Express.Multer.File): Promise<FileMetadata> {
    return this.uploadFile(file, {
      bucket: 'ebooks',
      folder: 'books',
      upsert: false
    });
  }

  // 커버 이미지 업로드
  static async uploadCover(file: Express.Multer.File): Promise<FileMetadata> {
    return this.uploadFile(file, {
      bucket: 'ebooks',
      folder: 'covers',
      upsert: false
    });
  }

  // 오디오 파일 업로드
  static async uploadAudio(file: Express.Multer.File): Promise<FileMetadata> {
    return this.uploadFile(file, {
      bucket: 'media',
      folder: 'audio',
      upsert: false
    });
  }

  // 이미지 파일 업로드
  static async uploadImage(file: Express.Multer.File): Promise<FileMetadata> {
    return this.uploadFile(file, {
      bucket: 'media',
      folder: 'images',
      upsert: false
    });
  }

  // 버켓 생성
  static async createBucket(bucketName: string, isPublic = true): Promise<void> {
    const { error } = await supabaseAdmin.storage.createBucket(bucketName, {
      public: isPublic,
      allowedMimeTypes: undefined,
      fileSizeLimit: undefined
    });

    if (error && !error.message.includes('already exists')) {
      throw new Error(`Failed to create bucket: ${error.message}`);
    }
  }

  // 초기 버켓 설정
  static async initializeBuckets(): Promise<void> {
    const buckets = [
      { name: 'ebooks', public: true },
      { name: 'media', public: true },
      { name: 'uploads', public: true },
      { name: 'temp', public: false }
    ];

    for (const bucket of buckets) {
      await this.createBucket(bucket.name, bucket.public);
    }
  }
}