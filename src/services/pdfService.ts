/**
 * PDF 업로드/보기 API 서비스
 * 서버와 통신하여 PDF 업로드 및 보기 URL을 관리합니다.
 */

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
 * 보기용 서명 URL 요청 (1시간 만료)
 * @param objectPath 객체 경로
 */
export async function requestViewUrl(objectPath: string): Promise<{
  url: string;
  expiresAt: string;
  expiresIn: number;
}> {
  console.log(`👁️ 보기 URL 요청: objectPath=${objectPath}`);

  const response = await fetch(`${API_BASE_URL}${API_PREFIX}/pdf/view-url`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ objectPath }),
  });

  const data = await handleResponse<{
    url: string;
    expiresAt: string;
    expiresIn: number;
  }>(response);

  console.log(`✅ 보기 URL 수신: expiresAt=${data.expiresAt}`);
  return data;
}

/**
 * 사용자의 PDF 목록 조회
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
  console.log(`📋 PDF 목록 조회`);

  const response = await fetch(`${API_BASE_URL}${API_PREFIX}/pdf/list`, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await handleResponse<{
    pdfs: Array<any>;
    count: number;
  }>(response);

  console.log(`✅ PDF 목록 수신: count=${data.count}`);
  return data;
}

/**
 * 전체 업로드 프로세스 (헬퍼 함수)
 * 1. 서명 URL 요청
 * 2. 파일 업로드
 * 3. 완료 처리
 */
export async function uploadPdf(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{
  objectPath: string;
  fileId: string;
}> {
  console.log(`🚀 PDF 업로드 프로세스 시작: ${file.name}`);

  // 1. 서명 URL 요청
  const { uploadUrl, objectPath, fileId } = await requestSignedUploadUrl(
    file.name,
    file.size,
    file.type
  );

  // 2. 파일 업로드
  await uploadFileToSignedUrl(uploadUrl, file, onProgress);

  // 3. 완료 처리
  await completeUpload(objectPath);

  console.log(`✅ PDF 업로드 프로세스 완료: objectPath=${objectPath}`);

  return { objectPath, fileId };
}
