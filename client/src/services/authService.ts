import { api, ApiResponse } from './api';

// 인증 관련 타입 정의
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'BRANCH_ADMIN' | 'COUNTRY_MASTER' | 'SUPER_MASTER';
  level?: string;
  academy?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  academyCode: string;
  role: 'STUDENT' | 'TEACHER' | 'PARENT';
  birthDate?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

// AuthService 클래스
export class AuthService {
  // 로그인
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response: ApiResponse<LoginResponse> = await api.post('/auth/login', credentials);

      if (response.success) {
        // 토큰과 사용자 정보를 로컬 스토리지에 저장
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));

        if (response.data.refreshToken) {
          localStorage.setItem('refresh_token', response.data.refreshToken);
        }

        return response.data;
      } else {
        throw new Error(response.message || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('로그인 실패:', error);
      throw new Error(error.message || '로그인 중 오류가 발생했습니다.');
    }
  }

  // 회원가입
  static async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    try {
      const response: ApiResponse<User> = await api.post('/auth/register', userData);
      return response;
    } catch (error: any) {
      console.error('회원가입 실패:', error);
      throw new Error(error.message || '회원가입 중 오류가 발생했습니다.');
    }
  }

  // 로그아웃
  static async logout(): Promise<void> {
    try {
      // 서버에 로그아웃 요청 (선택사항)
      await api.post('/auth/logout');
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
    } finally {
      // 로컬 스토리지 정리
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }
  }

  // 토큰 갱신
  static async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('리프레시 토큰이 없습니다.');
      }

      const response: ApiResponse<{ token: string }> = await api.post('/auth/refresh', {
        refreshToken
      });

      if (response.success) {
        localStorage.setItem('auth_token', response.data.token);
        return response.data.token;
      } else {
        throw new Error('토큰 갱신에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('토큰 갱신 실패:', error);
      this.logout(); // 갱신 실패 시 로그아웃
      throw error;
    }
  }

  // 사용자 정보 조회
  static async getCurrentUser(): Promise<User> {
    try {
      const response: ApiResponse<User> = await api.get('/auth/me');

      if (response.success) {
        // 최신 사용자 정보로 로컬 스토리지 업데이트
        localStorage.setItem('user_data', JSON.stringify(response.data));
        return response.data;
      } else {
        throw new Error(response.message || '사용자 정보를 가져올 수 없습니다.');
      }
    } catch (error: any) {
      console.error('사용자 정보 조회 실패:', error);
      throw error;
    }
  }

  // 비밀번호 재설정 요청
  static async requestPasswordReset(email: string): Promise<ApiResponse<any>> {
    try {
      const response: ApiResponse<any> = await api.post('/auth/password-reset', { email });
      return response;
    } catch (error: any) {
      console.error('비밀번호 재설정 요청 실패:', error);
      throw new Error(error.message || '비밀번호 재설정 요청 중 오류가 발생했습니다.');
    }
  }

  // 비밀번호 재설정 확인
  static async confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<ApiResponse<any>> {
    try {
      const response: ApiResponse<any> = await api.post('/auth/password-reset/confirm', data);
      return response;
    } catch (error: any) {
      console.error('비밀번호 재설정 실패:', error);
      throw new Error(error.message || '비밀번호 재설정 중 오류가 발생했습니다.');
    }
  }

  // 아카데미 코드 검증
  static async verifyAcademyCode(code: string): Promise<ApiResponse<{ academy: string; isValid: boolean }>> {
    try {
      const response: ApiResponse<{ academy: string; isValid: boolean }> = await api.post('/auth/verify-academy', { code });
      return response;
    } catch (error: any) {
      console.error('아카데미 코드 검증 실패:', error);
      throw new Error(error.message || '아카데미 코드 검증 중 오류가 발생했습니다.');
    }
  }

  // 토큰 유효성 검사
  static isTokenValid(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    try {
      // JWT 토큰 디코딩 (간단한 만료 시간 체크)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  // 로컬 스토리지에서 사용자 정보 가져오기
  static getCurrentUserFromStorage(): User | null {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('저장된 사용자 정보를 파싱할 수 없습니다:', error);
      return null;
    }
  }

  // 토큰 가져오기
  static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export default AuthService;