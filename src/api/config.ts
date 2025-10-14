// API 설정 중앙 관리

export const API_CONFIG = {
  // 프록시 사용 (일반 API 요청 - 4MB 이하)
  PROXY_URL: import.meta.env.VITE_API_URL || '/api/proxy',

  // 직접 호출 (파일 업로드 - 대용량)
  DIRECT_URL: 'https://boston-english-server.railway.app/api/v1',

  // 파일 업로드 크기 제한 (Vercel 프록시)
  MAX_PROXY_SIZE: 4 * 1024 * 1024, // 4MB
};

/**
 * 요청 타입에 따라 적절한 API URL 반환
 * @param isFileUpload - 파일 업로드 여부
 * @param fileSize - 파일 크기 (bytes)
 * @returns API Base URL
 */
export function getApiUrl(isFileUpload = false, fileSize = 0): string {
  // 파일 업로드이거나 4MB 이상인 경우 Railway 직접 호출
  if (isFileUpload || fileSize > API_CONFIG.MAX_PROXY_SIZE) {
    console.log('📤 Using direct Railway API for large file/upload');
    return API_CONFIG.DIRECT_URL;
  }

  // 일반 요청은 Vercel 프록시 사용
  console.log('🔄 Using Vercel proxy API');
  return API_CONFIG.PROXY_URL;
}

/**
 * API 요청 헬퍼 함수
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  isFileUpload = false
): Promise<T> {
  const baseUrl = getApiUrl(isFileUpload);
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  // FormData가 아닌 경우에만 Content-Type 설정
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
