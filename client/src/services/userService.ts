import { api, ApiResponse } from './api';

// 사용자 관리 관련 타입 정의
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'BRANCH_ADMIN' | 'COUNTRY_MASTER' | 'SUPER_MASTER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  level?: string;
  academy?: string;
  branchId?: string;
  countryId?: string;
  phone?: string;
  birthDate?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'TEACHER' | 'PARENT';
  phone?: string;
  birthDate?: string;
  academyCode?: string;
  branchId?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  level?: string;
  phone?: string;
  birthDate?: string;
  academyCode?: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  academy?: string;
  level?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStats {
  total: number;
  students: number;
  teachers: number;
  parents: number;
  admins: number;
  active: number;
  inactive: number;
  thisWeekNew: number;
}

export interface BulkActionRequest {
  userIds: string[];
  action: 'activate' | 'deactivate' | 'suspend' | 'delete';
  reason?: string;
}

// UserService 클래스
export class UserService {
  // 사용자 목록 조회 (필터링, 페이지네이션 포함)
  static async getUsers(filters?: UserFilters): Promise<ApiResponse<UserListResponse>> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        if (filters.search) params.append('search', filters.search);
        if (filters.role) params.append('role', filters.role);
        if (filters.status) params.append('status', filters.status);
        if (filters.academy) params.append('academy', filters.academy);
        if (filters.level) params.append('level', filters.level);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      }

      const queryString = params.toString();
      const url = `/users${queryString ? `?${queryString}` : ''}`;

      return await api.get(url);
    } catch (error: any) {
      throw new Error(error.message || '사용자 목록을 불러올 수 없습니다.');
    }
  }

  // 특정 사용자 조회
  static async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      return await api.get(`/users/${userId}`);
    } catch (error: any) {
      throw new Error(error.message || '사용자 정보를 불러올 수 없습니다.');
    }
  }

  // 사용자 생성
  static async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    try {
      return await api.post('/users', userData);
    } catch (error: any) {
      throw new Error(error.message || '사용자 생성에 실패했습니다.');
    }
  }

  // 사용자 정보 수정
  static async updateUser(userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    try {
      return await api.put(`/users/${userId}`, userData);
    } catch (error: any) {
      throw new Error(error.message || '사용자 정보 수정에 실패했습니다.');
    }
  }

  // 사용자 삭제
  static async deleteUser(userId: string): Promise<ApiResponse<any>> {
    try {
      return await api.delete(`/users/${userId}`);
    } catch (error: any) {
      throw new Error(error.message || '사용자 삭제에 실패했습니다.');
    }
  }

  // 사용자 상태 변경 (활성화/비활성화/정지)
  static async updateUserStatus(
    userId: string,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    reason?: string
  ): Promise<ApiResponse<User>> {
    try {
      return await api.patch(`/users/${userId}/status`, { status, reason });
    } catch (error: any) {
      throw new Error(error.message || '사용자 상태 변경에 실패했습니다.');
    }
  }

  // 일괄 작업 (여러 사용자 동시 처리)
  static async bulkUserAction(actionData: BulkActionRequest): Promise<ApiResponse<{ success: number; failed: string[] }>> {
    try {
      return await api.post('/users/bulk-action', actionData);
    } catch (error: any) {
      throw new Error(error.message || '일괄 작업에 실패했습니다.');
    }
  }

  // 사용자 통계 조회
  static async getUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      return await api.get('/users/stats');
    } catch (error: any) {
      throw new Error(error.message || '사용자 통계를 불러올 수 없습니다.');
    }
  }

  // 사용자 비밀번호 재설정 (관리자용)
  static async resetUserPassword(userId: string, newPassword?: string): Promise<ApiResponse<{ temporaryPassword?: string }>> {
    try {
      return await api.post(`/users/${userId}/reset-password`, { newPassword });
    } catch (error: any) {
      throw new Error(error.message || '비밀번호 재설정에 실패했습니다.');
    }
  }

  // 사용자 권한 조회
  static async getUserPermissions(userId: string): Promise<ApiResponse<string[]>> {
    try {
      return await api.get(`/users/${userId}/permissions`);
    } catch (error: any) {
      throw new Error(error.message || '사용자 권한을 불러올 수 없습니다.');
    }
  }

  // 사용자 권한 수정
  static async updateUserPermissions(userId: string, permissions: string[]): Promise<ApiResponse<any>> {
    try {
      return await api.put(`/users/${userId}/permissions`, { permissions });
    } catch (error: any) {
      throw new Error(error.message || '사용자 권한 수정에 실패했습니다.');
    }
  }

  // 사용자 활동 로그 조회
  static async getUserActivityLog(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{
    activities: Array<{
      id: string;
      action: string;
      description: string;
      ip: string;
      userAgent: string;
      createdAt: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      return await api.get(`/users/${userId}/activity-log?page=${page}&limit=${limit}`);
    } catch (error: any) {
      throw new Error(error.message || '활동 로그를 불러올 수 없습니다.');
    }
  }

  // E-book 접근 권한 부여/회수
  static async updateEbookAccess(
    userId: string,
    ebookId: string,
    hasAccess: boolean,
    expiresAt?: string
  ): Promise<ApiResponse<any>> {
    try {
      return await api.post(`/users/${userId}/ebook-access`, {
        ebookId,
        hasAccess,
        expiresAt
      });
    } catch (error: any) {
      throw new Error(error.message || 'E-book 접근 권한 설정에 실패했습니다.');
    }
  }

  // 사용자의 E-book 접근 권한 조회
  static async getUserEbookAccess(userId: string): Promise<ApiResponse<Array<{
    ebookId: string;
    ebookTitle: string;
    hasAccess: boolean;
    grantedAt: string;
    expiresAt?: string;
  }>>> {
    try {
      return await api.get(`/users/${userId}/ebook-access`);
    } catch (error: any) {
      throw new Error(error.message || 'E-book 접근 권한을 불러올 수 없습니다.');
    }
  }

  // 사용자 프로필 이미지 업로드
  static async uploadProfileImage(userId: string, imageFile: File): Promise<ApiResponse<{ imageUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      return await api.post(`/users/${userId}/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error: any) {
      throw new Error(error.message || '프로필 이미지 업로드에 실패했습니다.');
    }
  }

  // 사용자 데이터 내보내기 (GDPR 준수)
  static async exportUserData(userId: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      return await api.post(`/users/${userId}/export-data`);
    } catch (error: any) {
      throw new Error(error.message || '사용자 데이터 내보내기에 실패했습니다.');
    }
  }

  // 이메일 중복 확인
  static async checkEmailExists(email: string): Promise<ApiResponse<{ exists: boolean }>> {
    try {
      return await api.get(`/users/check-email?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      throw new Error(error.message || '이메일 중복 확인에 실패했습니다.');
    }
  }

  // 아카데미/지점별 사용자 목록 조회
  static async getUsersByBranch(branchId: string, filters?: UserFilters): Promise<ApiResponse<UserListResponse>> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        if (filters.search) params.append('search', filters.search);
        if (filters.role) params.append('role', filters.role);
        if (filters.status) params.append('status', filters.status);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
      }

      const queryString = params.toString();
      const url = `/users/branch/${branchId}${queryString ? `?${queryString}` : ''}`;

      return await api.get(url);
    } catch (error: any) {
      throw new Error(error.message || '지점별 사용자 목록을 불러올 수 없습니다.');
    }
  }
}

export default UserService;