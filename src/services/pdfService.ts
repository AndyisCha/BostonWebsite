/**
 * PDF 업로드/보기 API 서비스
 * Supabase Storage를 직접 사용하여 PDF 업로드 및 보기 URL을 관리합니다.
 */

import { supabase } from '../lib/supabase';

// API 베이스 URL (환경변수에서 가져오기)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

// 인증 토큰 가져오기 (실제 프로젝트에 맞게 수정)
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

// API 요청 헤더 생성
function getHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

// 응답 처리 헬퍼
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * 서명된 업로드 URL 요청
 * @param fileName 파일명
 * @param size 파일 크기 (bytes)
 * @param mime MIME 타입 (기본: application/pdf)
 */
export async function requestSignedUploadUrl(
  fileName: string,
  size: number,
  mime: string = 'application/pdf'
): Promise<{
  uploadUrl: string;
  objectPath: string;
  token: string;
  fileId: string;
  expiresIn: number;
}> {
  console.log(`📤 서명 업로드 URL 요청: fileName=${fileName}, size=${size}`);

  const response = await fetch(`${API_BASE_URL}${API_PREFIX}/pdf/uploads/sign`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ fileName, size, mime }),
  });

  const data = await handleResponse<{
    uploadUrl: string;
    objectPath: string;
    token: string;
    fileId: string;
    expiresIn: number;
  }>(response);

  console.log(`✅ 서명 업로드 URL 수신: objectPath=${data.objectPath}`);
  return data;
}

/**
 * 파일을 서명된 URL로 직접 업로드 (PUT 요청)
 * @param uploadUrl 서명된 업로드 URL
 * @param file 업로드할 파일
 * @param onProgress 진행률 콜백 (0~100)
 */
export async function uploadFileToSignedUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  console.log(`📤 파일 업로드 시작: size=${file.size}`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 진행률 추적
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          onProgress(percentComplete);
        }
      });
    }

    // 완료 처리
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log(`✅ 파일 업로드 완료`);
        resolve();
      } else {
        console.error(`❌ 파일 업로드 실패: ${xhr.status}`);
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    // 에러 처리
    xhr.addEventListener('error', () => {
      console.error(`❌ 파일 업로드 네트워크 에러`);
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      console.warn(`⚠️ 파일 업로드 취소됨`);
      reject(new Error('Upload aborted'));
    });

    // PUT 요청 (Supabase Storage 요구사항)
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type || 'application/pdf');
    xhr.send(file);
  });
}

/**
 * 업로드 완료 알림 (메타데이터 업데이트)
 * @param objectPath 객체 경로
 */
export async function completeUpload(objectPath: string): Promise<{
  success: boolean;
  objectPath: string;
  status: string;
}> {
  console.log(`📋 업로드 완료 처리: objectPath=${objectPath}`);

  const response = await fetch(`${API_BASE_URL}${API_PREFIX}/pdf/uploads/complete`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ objectPath }),
  });

  const data = await handleResponse<{
    success: boolean;
    objectPath: string;
    status: string;
  }>(response);

  console.log(`✅ 업로드 완료 확인: status=${data.status}`);
  return data;
}

/**
 * Supabase Storage에서 보기용 URL 직접 생성 (1시간 만료)
 * @param objectPath 객체 경로
 */
export async function requestViewUrl(objectPath: string): Promise<{
  url: string;
  expiresAt: string;
  expiresIn: number;
}> {
  console.log(`👁️ Supabase Storage에서 보기 URL 생성: objectPath=${objectPath}`);

  // Supabase Storage에서 서명된 URL 생성 (1시간 = 3600초)
  const { data, error } = await supabase.storage
    .from('ebook-files')
    .createSignedUrl(objectPath, 3600);

  if (error || !data) {
    console.error('❌ 서명 URL 생성 실패:', error);
    throw new Error(`서명 URL 생성 실패: ${error?.message || '알 수 없는 오류'}`);
  }

  const expiresIn = 3600;
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  console.log(`✅ 보기 URL 생성 완료: expiresAt=${expiresAt}`);

  return {
    url: data.signedUrl,
    expiresAt,
    expiresIn
  };
}

/**
 * Supabase에서 사용자의 PDF 목록 직접 조회
 */
export async function listUserPdfs(): Promise<{
  pdfs: Array<{
    id: string;
    user_id: string;
    object_path: string;
    file_name: string;
    size_bytes: number;
    mime_type: string;
    status: string;
    created_at: string;
    updated_at: string;
  }>;
  count: number;
}> {
  console.log(`📋 Supabase에서 PDF 목록 조회`);

  // 사용자 정보 가져오기 (localStorage에서)
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('로그인이 필요합니다.');
  }

  const user = JSON.parse(userStr);

  // pdfs 테이블에서 사용자의 PDF 목록 조회
  const { data, error, count } = await supabase
    .from('pdfs')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ PDF 목록 조회 실패:', error);
    throw new Error(`PDF 목록 조회 실패: ${error.message}`);
  }

  console.log(`✅ PDF 목록 수신: count=${count}`);

  return {
    pdfs: data || [],
    count: count || 0
  };
}

/**
 * Supabase Storage에 직접 업로드 (새 방식)
 * 1. Supabase Storage에 파일 업로드
 * 2. pdfs 테이블에 레코드 생성
 */
export async function uploadPdf(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{
  objectPath: string;
  fileId: string;
}> {
  console.log(`🚀 Supabase 직접 업로드 시작: ${file.name}`);

  // 사용자 정보 가져오기 (localStorage에서)
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('로그인이 필요합니다.');
  }

  const user = JSON.parse(userStr);
  const userId = user.id;
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const objectPath = `uploads/${userId}/${timestamp}-${safeFileName}`;

  console.log(`📤 파일 업로드 중: ${objectPath}`);

  // 1. Supabase Storage에 업로드
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('ebook-files')
    .upload(objectPath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('❌ Supabase Storage 업로드 실패:', uploadError);
    throw new Error(`파일 업로드 실패: ${uploadError.message}`);
  }

  console.log('✅ Supabase Storage 업로드 완료');

  // 진행률 업데이트 (Storage 업로드 완료 = 80%)
  if (onProgress) {
    onProgress(80);
  }

  // 2. pdfs 테이블에 레코드 생성
  const { data: pdfRecord, error: dbError } = await supabase
    .from('pdfs')
    .insert({
      user_id: userId,
      object_path: objectPath,
      file_name: file.name,
      size_bytes: file.size,
      mime_type: file.type,
      status: 'ready'
    })
    .select()
    .single();

  if (dbError) {
    console.error('❌ 데이터베이스 레코드 생성 실패:', dbError);
    // 업로드된 파일 삭제 시도
    await supabase.storage.from('ebook-files').remove([objectPath]);
    throw new Error(`데이터베이스 저장 실패: ${dbError.message}`);
  }

  console.log(`✅ PDF 업로드 완료: fileId=${pdfRecord.id}`);

  // 진행률 완료 (100%)
  if (onProgress) {
    onProgress(100);
  }

  return {
    objectPath,
    fileId: pdfRecord.id
  };
}
