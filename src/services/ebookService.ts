import { api, ApiResponse } from './api';

// E-book 관련 타입 정의
export interface Ebook {
  id: string;
  title: string;
  author: string;
  description?: string;
  level: string;
  coverImage?: string;
  pageCount?: number;
  categories: string[];
  language: string;
  country: string;
  isLocked: boolean;
  isNew: boolean;
  isHot: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface EbookPage {
  id: string;
  pageNumber: number;
  content: string;
  hasAnswers: boolean;
  answers?: Array<{
    id: string;
    answer: string;
    explanation?: string;
  }>;
}

export interface EbookWithPages extends Ebook {
  pages: EbookPage[];
}

export interface EbookSearchParams {
  query?: string;
  levels?: string[];
  languages?: string[];
  countries?: string[];
  categories?: string[];
  sort?: 'latest' | 'title-asc' | 'level-low' | 'level-high';
  page?: number;
  limit?: number;
}

export interface EbookListResponse {
  ebooks: Ebook[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DrawingData {
  id: string;
  userId: string;
  pageId: string;
  canvasData: string;
  createdAt: string;
  updatedAt: string;
}

class EbookApiService {
  private baseURL = '/ebooks';

  // 사용자의 E-book 목록 조회
  async getUserEbooks(userId: string): Promise<ApiResponse<Ebook[]>> {
    try {
      return await api.get(`${this.baseURL}/user/${userId}`);
    } catch (error: any) {
      throw new Error(error.message || 'E-book 목록을 불러올 수 없습니다.');
    }
  }

  // E-book 검색 및 필터링
  async searchEbooks(params: EbookSearchParams): Promise<ApiResponse<EbookListResponse>> {
    try {
      const searchParams = new URLSearchParams();

      if (params.query) searchParams.append('query', params.query);
      if (params.levels?.length) searchParams.append('level', params.levels.join(','));
      if (params.languages?.length) searchParams.append('language', params.languages.join(','));
      if (params.countries?.length) searchParams.append('country', params.countries.join(','));
      if (params.categories?.length) searchParams.append('category', params.categories.join(','));
      if (params.sort) searchParams.append('sort', params.sort);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());

      return await api.get(`${this.baseURL}/search?${searchParams.toString()}`);
    } catch (error: any) {
      throw new Error(error.message || 'E-book 검색에 실패했습니다.');
    }
  }

  // E-book 콘텐츠 접근
  async getEbookContent(ebookId: string, userId: string): Promise<ApiResponse<EbookWithPages>> {
    try {
      return await api.post(`${this.baseURL}/${ebookId}/content`, { userId });
    } catch (error: any) {
      throw new Error(error.message || 'E-book 콘텐츠를 불러올 수 없습니다.');
    }
  }

  // E-book 미리보기
  async getEbookPreview(ebookId: string): Promise<ApiResponse<any>> {
    try {
      return await api.get(`${this.baseURL}/${ebookId}/preview`);
    } catch (error: any) {
      throw new Error(error.message || 'E-book 미리보기를 불러올 수 없습니다.');
    }
  }

  // 그림 저장
  async saveDrawing(pageId: string, userId: string, canvasData: string): Promise<ApiResponse<DrawingData>> {
    try {
      return await api.post(`${this.baseURL}/drawing/${pageId}`, {
        userId,
        canvasData
      });
    } catch (error: any) {
      throw new Error(error.message || '그림 저장에 실패했습니다.');
    }
  }

  // 그림 불러오기
  async getDrawing(pageId: string, userId: string): Promise<ApiResponse<DrawingData | null>> {
    try {
      return await api.get(`${this.baseURL}/drawing/${pageId}?userId=${userId}`);
    } catch (error: any) {
      throw new Error(error.message || '그림을 불러올 수 없습니다.');
    }
  }

  // 정답 토글
  async toggleAnswer(pageId: string, answerId: string): Promise<ApiResponse<{ answer: string; explanation?: string }>> {
    try {
      return await api.post(`${this.baseURL}/answer/${pageId}`, { answerId });
    } catch (error: any) {
      throw new Error(error.message || '정답을 불러올 수 없습니다.');
    }
  }

  // 관리자용 - 모든 E-book 조회
  async getAllEbooks(level?: string): Promise<ApiResponse<Ebook[]>> {
    try {
      const params = level ? `?level=${level}` : '';
      return await api.get(`${this.baseURL}/all${params}`);
    } catch (error: any) {
      throw new Error(error.message || 'E-book 목록을 불러올 수 없습니다.');
    }
  }

  // 관리자용 - E-book 업로드
  async uploadEbook(formData: FormData): Promise<ApiResponse<Ebook>> {
    try {
      // FormData는 별도 처리 필요
      return await api.post(`${this.baseURL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error: any) {
      throw new Error(error.message || 'E-book 업로드에 실패했습니다.');
    }
  }

  // 관리자용 - 접근 권한 부여
  async grantAccess(
    userId: string,
    ebookId: string,
    branchId: string,
    hasAccess: boolean,
    expiresAt?: Date
  ): Promise<ApiResponse<any>> {
    try {
      return await api.post(`${this.baseURL}/grant-access`, {
        userId,
        ebookId,
        branchId,
        hasAccess,
        expiresAt
      });
    } catch (error: any) {
      throw new Error(error.message || '접근 권한 설정에 실패했습니다.');
    }
  }

  // 관리자용 - E-book 상태 업데이트 (NEW/HOT 배지)
  async updateEbookStatus(ebookId: string, isNew?: boolean, isHot?: boolean): Promise<ApiResponse<Ebook>> {
    try {
      return await api.patch(`${this.baseURL}/${ebookId}/status`, {
        isNew,
        isHot
      });
    } catch (error: any) {
      throw new Error(error.message || 'E-book 상태 업데이트에 실패했습니다.');
    }
  }

  // E-book 커버 이미지 URL 생성
  getCoverImageUrl(coverImage: string): string {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    return `${baseUrl}/ebooks/cover/${coverImage}`;
  }
}

export const ebookService = new EbookApiService();