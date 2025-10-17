import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API 기본 설정
// 프로덕션에서는 Vercel 프록시 사용, 로컬에서는 직접 연결
const getBaseUrl = (): string => {
  // 프로덕션 환경 (Vercel)
  if (import.meta.env.PROD && window.location.hostname.includes('vercel.app')) {
    return '/api/proxy';
  }
  // 환경 변수가 설정되어 있으면 사용
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // 기본값: 로컬 개발 환경
  return 'http://localhost:3001/api/v1';
};

const API_BASE_URL = getBaseUrl();

// 디버깅: 사용 중인 API URL 로그
console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🌐 Environment:', import.meta.env.MODE);
console.log('🌐 Hostname:', window.location.hostname);

// Enhanced error interface
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
  timestamp: Date;
}

// Request tracking
interface RequestMetadata {
  startTime: number;
  retryCount: number;
}

// Cache interface
interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

// Enhanced Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request cache
const requestCache = new Map<string, CacheItem>();

// Utility functions
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const getCacheKey = (url: string, params?: any): string => {
  return `${url}_${JSON.stringify(params || {})}`;
};

const getFromCache = (key: string): any | null => {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  requestCache.delete(key);
  return null;
};

const setCache = (key: string, data: any, ttl: number = 300000): void => {
  requestCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
};

// Enhanced 요청 인터셉터 - 토큰 자동 추가 및 메타데이터
apiClient.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request metadata for tracking
    config.metadata = {
      startTime: Date.now(),
      retryCount: config.metadata?.retryCount || 0
    } as RequestMetadata;

    return config;
  },
  (error) => {
    return Promise.reject(handleError(error));
  }
);

// Enhanced 응답 인터셉터 - 고급 에러 처리 및 재시도 로직
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as any;
    const endTime = Date.now();
    const startTime = config.metadata?.startTime;

    if (startTime) {
      console.log(`🚀 API ${config.method?.toUpperCase()} ${config.url} completed in ${endTime - startTime}ms`);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle token expiration with refresh attempt
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await refreshToken();
        const token = localStorage.getItem('auth_token');
        if (token && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(handleError(refreshError));
      }
    }

    // Retry logic for network errors and 5xx errors
    const shouldRetry = (
      !error.response ||
      (error.response.status >= 500 && error.response.status < 600)
    );

    if (shouldRetry && originalRequest.metadata?.retryCount < 3) {
      originalRequest.metadata.retryCount += 1;

      const retryDelay = Math.min(1000 * Math.pow(2, originalRequest.metadata.retryCount), 10000);
      console.log(`🔄 Retrying request (${originalRequest.metadata.retryCount}/3) in ${retryDelay}ms`);

      await delay(retryDelay);
      return apiClient(originalRequest);
    }

    return Promise.reject(handleError(error));
  }
);

// Token refresh function
const refreshToken = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken
    });

    localStorage.setItem('auth_token', response.data.data.token);
    if (response.data.data.refreshToken) {
      localStorage.setItem('refresh_token', response.data.data.refreshToken);
    }
  } catch (error) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    throw error;
  }
};

// Logout function
const logout = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
  requestCache.clear();

  // Dispatch custom event for components to listen
  window.dispatchEvent(new CustomEvent('auth-logout'));

  // Redirect to login if not already there
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Enhanced error handler
const handleError = (error: any): ApiError => {
  const apiError: ApiError = {
    message: 'An unexpected error occurred',
    status: 0,
    timestamp: new Date()
  };

  if (error.response) {
    // Server responded with error status
    apiError.message = error.response.data?.message || `Server error: ${error.response.status}`;
    apiError.status = error.response.status;
    apiError.code = error.response.data?.code;
    apiError.details = error.response.data?.details;
  } else if (error.request) {
    // Request made but no response
    apiError.message = 'Network error - please check your connection';
    apiError.code = 'NETWORK_ERROR';
  } else {
    // Something else happened
    apiError.message = error.message || 'Request setup error';
    apiError.code = 'REQUEST_ERROR';
  }

  // Log error for debugging (remove in production)
  console.error('🚨 API Error:', apiError);

  return apiError;
};

// 공통 API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Enhanced 공통 API 메서드들 with caching and better error handling
export const api = {
  // Enhanced GET 요청 with caching
  get: async <T = any>(
    url: string,
    params?: any,
    options: {
      useCache?: boolean;
      cacheTtl?: number;
      config?: AxiosRequestConfig;
    } = {}
  ): Promise<ApiResponse<T>> => {
    const { useCache = false, cacheTtl = 300000, config } = options;

    // Check cache first
    if (useCache) {
      const cacheKey = getCacheKey(url, params);
      const cached = getFromCache(cacheKey);
      if (cached) {
        console.log(`💾 Cache hit for ${url}`);
        return cached;
      }
    }

    try {
      const response = await apiClient.get(url, { ...config, params });
      const result = response.data;

      // Cache successful responses
      if (useCache && response.status === 200) {
        const cacheKey = getCacheKey(url, params);
        setCache(cacheKey, result, cacheTtl);
      }

      return result;
    } catch (error: any) {
      throw error; // Let interceptor handle the error
    }
  },

  // Enhanced POST 요청
  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.post(url, data, config);

      // Clear related cache on successful POST
      if (response.status < 300) {
        api.clearCache(url);
      }

      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Enhanced PUT 요청
  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.put(url, data, config);

      // Clear related cache on successful PUT
      if (response.status < 300) {
        api.clearCache(url);
      }

      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Enhanced DELETE 요청
  delete: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.delete(url, config);

      // Clear related cache on successful DELETE
      if (response.status < 300) {
        api.clearCache(url);
      }

      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Enhanced PATCH 요청
  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.patch(url, data, config);

      // Clear related cache on successful PATCH
      if (response.status < 300) {
        api.clearCache(url);
      }

      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // File upload with progress tracking
  uploadFile: async (
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, JSON.stringify(value));
      });
    }

    try {
      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
        timeout: 300000 // 5 minutes for file uploads
      });

      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Cache management
  clearCache: (urlPattern?: string): void => {
    if (urlPattern) {
      const keysToDelete = Array.from(requestCache.keys())
        .filter(key => key.includes(urlPattern));
      keysToDelete.forEach(key => requestCache.delete(key));
      console.log(`🗑️ Cleared ${keysToDelete.length} cache entries for pattern: ${urlPattern}`);
    } else {
      requestCache.clear();
      console.log('🗑️ Cleared all cache entries');
    }
  },

  // Get cache stats
  getCacheStats: (): { size: number; keys: string[] } => {
    return {
      size: requestCache.size,
      keys: Array.from(requestCache.keys())
    };
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: Date }> => {
    try {
      const response = await api.get('/health', {}, { useCache: false });
      return {
        status: 'healthy',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date()
      };
    }
  }
};

export default apiClient;