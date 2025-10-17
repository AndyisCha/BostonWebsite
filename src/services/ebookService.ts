import { api, ApiResponse } from './api';
import { supabase } from '../lib/supabase';

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

export interface Answer {
  id: string;
  pageNumber: number;
  text: string;
  x: number;          // 열쇠 아이콘 X 위치 (%)
  y: number;          // 열쇠 아이콘 Y 위치 (%)
  textX?: number;     // 정답 텍스트 X 위치 (%, 없으면 x 사용)
  textY?: number;     // 정답 텍스트 Y 위치 (%, 없으면 y-10 사용)
  width?: number;
  height?: number;
  fontSize?: number;  // 텍스트 크기 (기본: 14)
  color?: string;     // 텍스트 색상 (기본: #4caf50)
  visible?: boolean;  // 정답 표시 여부 (편집 시 사용)
}

export interface AudioButton {
  id: string;
  pageNumber: number;
  audioUrl: string;
  x: number;
  y: number;
  label?: string;
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
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
    return `${baseUrl}/ebooks/cover/${coverImage}`;
  }

  // 정답 저장 (Supabase 직접 저장)
  async saveAnswers(ebookId: string, answers: Answer[]): Promise<ApiResponse<any>> {
    try {
      console.log('💾 Supabase에 직접 정답 저장:', { ebookId, answersCount: answers.length });

      const { data, error } = await supabase
        .from('pdfs')
        .update({ answers: answers })
        .eq('id', ebookId)
        .select();

      if (error) {
        console.error('❌ Supabase 저장 실패:', error);
        throw new Error(error.message);
      }

      console.log('✅ Supabase 저장 성공:', data);
      return { success: true, data };
    } catch (error: any) {
      console.error('❌ 정답 저장 에러:', error);
      throw new Error(error.message || '정답 저장에 실패했습니다.');
    }
  }

  // 정답 불러오기 (Supabase 직접 조회)
  async getAnswers(ebookId: string): Promise<ApiResponse<{ answers: Answer[] }>> {
    try {
      console.log('📖 Supabase에서 정답 불러오기:', ebookId);

      const { data, error } = await supabase
        .from('pdfs')
        .select('answers')
        .eq('id', ebookId)
        .single();

      if (error) {
        console.error('❌ Supabase 조회 실패:', error);
        throw new Error(error.message);
      }

      console.log('✅ Supabase 조회 성공:', data);
      return { success: true, data: { answers: data?.answers || [] } };
    } catch (error: any) {
      console.error('❌ 정답 불러오기 에러:', error);
      throw new Error(error.message || '정답 불러오기에 실패했습니다.');
    }
  }

  // 오디오 버튼 저장 (Supabase 직접 저장)
  async saveAudioButtons(ebookId: string, audioButtons: AudioButton[]): Promise<ApiResponse<any>> {
    try {
      console.log('💾 Supabase에 직접 오디오 버튼 저장:', { ebookId, buttonsCount: audioButtons.length });

      const { data, error } = await supabase
        .from('pdfs')
        .update({ audio_buttons: audioButtons })
        .eq('id', ebookId)
        .select();

      if (error) {
        console.error('❌ Supabase 저장 실패:', error);
        throw new Error(error.message);
      }

      console.log('✅ Supabase 저장 성공:', data);
      return { success: true, data };
    } catch (error: any) {
      console.error('❌ 오디오 버튼 저장 에러:', error);
      throw new Error(error.message || '오디오 버튼 저장에 실패했습니다.');
    }
  }

  // 오디오 버튼 불러오기 (Supabase 직접 조회)
  async getAudioButtons(ebookId: string): Promise<ApiResponse<{ audioButtons: AudioButton[] }>> {
    try {
      console.log('📖 Supabase에서 오디오 버튼 불러오기:', ebookId);

      const { data, error } = await supabase
        .from('pdfs')
        .select('audio_buttons')
        .eq('id', ebookId)
        .single();

      if (error) {
        console.error('❌ Supabase 조회 실패:', error);
        throw new Error(error.message);
      }

      console.log('✅ Supabase 조회 성공:', data);
      return { success: true, data: { audioButtons: data?.audio_buttons || [] } };
    } catch (error: any) {
      console.error('❌ 오디오 버튼 불러오기 에러:', error);
      throw new Error(error.message || '오디오 버튼 불러오기에 실패했습니다.');
    }
  }

  // 오디오 파일 업로드
  async uploadAudioFile(ebookId: string, file: File, pageNumber: number): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('audioFile', file);
      formData.append('ebookId', ebookId);
      formData.append('pageNumber', pageNumber.toString());

      return await api.post(`${this.baseURL}/${ebookId}/audio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error: any) {
      throw new Error(error.message || '오디오 파일 업로드에 실패했습니다.');
    }
  }

  // E-book 메타데이터 업데이트
  async updateMetadata(ebookId: string, metadata: any): Promise<ApiResponse<any>> {
    try {
      return await api.put(`${this.baseURL}/${ebookId}/metadata`, { metadata });
    } catch (error: any) {
      throw new Error(error.message || '메타데이터 업데이트에 실패했습니다.');
    }
  }
}

export const ebookService = new EbookApiService();