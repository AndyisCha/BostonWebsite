import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ebookService } from '../services/ebookService';
import { Ebook, EbookSearchParams } from '../types/ebook';
import { useAuth } from '../contexts/AuthContext';

// 사용자 E-book 목록 조회
export function useUserEbooks(userId?: string) {
  const { user } = useAuth();
  const actualUserId = userId || user?.id;

  return useQuery(
    ['userEbooks', actualUserId],
    () => ebookService.getUserEbooks(actualUserId!),
    {
      enabled: !!actualUserId,
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분
      retry: 2
    }
  );
}

// E-book 검색
export function useEbookSearch(params: EbookSearchParams) {
  return useQuery(
    ['ebookSearch', params],
    () => ebookService.searchEbooks(params),
    {
      enabled: Object.values(params).some(value =>
        Array.isArray(value) ? value.length > 0 : !!value
      ),
      staleTime: 2 * 60 * 1000, // 2분
      keepPreviousData: true
    }
  );
}

// E-book 콘텐츠 접근
export function useEbookContent(ebookId?: string) {
  const { user } = useAuth();

  return useQuery(
    ['ebookContent', ebookId, user?.id],
    () => ebookService.getEbookContent(ebookId!, user!.id),
    {
      enabled: !!(ebookId && user?.id),
      staleTime: 10 * 60 * 1000, // 10분
      retry: 1
    }
  );
}

// 그림 저장 mutation
export function useDrawingMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation(
    ({ pageId, canvasData }: { pageId: string; canvasData: any }) =>
      ebookService.saveDrawing(pageId, user!.id, canvasData),
    {
      onSuccess: (data, variables) => {
        // 캐시 업데이트
        queryClient.setQueryData(['drawing', variables.pageId, user?.id], data);
      },
      onError: (error) => {
        console.error('Failed to save drawing:', error);
      }
    }
  );
}

// 그림 불러오기
export function useDrawing(pageId?: string) {
  const { user } = useAuth();

  return useQuery(
    ['drawing', pageId, user?.id],
    () => ebookService.getDrawing(pageId!, user!.id),
    {
      enabled: !!(pageId && user?.id),
      staleTime: Infinity, // 그림은 변경되지 않으므로 무한 캐시
      retry: 1
    }
  );
}

// 관리자용 - 모든 E-book 조회
export function useAllEbooks(level?: string) {
  const { hasRole } = useAuth();

  return useQuery(
    ['allEbooks', level],
    () => ebookService.getAllEbooks(level),
    {
      enabled: hasRole(['SUPER_MASTER', 'COUNTRY_MASTER', 'BRANCH_ADMIN']),
      staleTime: 5 * 60 * 1000
    }
  );
}

// E-book 상태 관리 훅
export function useEbookLibrary() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 에러 핸들링
  const handleError = (error: any) => {
    console.error('Ebook library error:', error);

    if (error.response?.status === 403) {
      setError('이 E-book에 접근할 권한이 없습니다.');
    } else if (error.response?.status === 404) {
      setError('E-book을 찾을 수 없습니다.');
    } else if (error.response?.status >= 500) {
      setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      setError('알 수 없는 오류가 발생했습니다.');
    }
  };

  // 재시도
  const retry = () => {
    setError(null);
    setIsLoading(true);
    // 실제 재시도 로직은 상위 컴포넌트에서 처리
    setTimeout(() => setIsLoading(false), 1000);
  };

  return {
    isLoading,
    error,
    setIsLoading,
    setError,
    handleError,
    retry
  };
}

// E-book 액션 훅
export function useEbookActions() {
  const { user } = useAuth();

  const openEbook = async (ebook: Ebook) => {
    if (ebook.isLocked) {
      throw new Error('이 E-book에 접근할 권한이 없습니다.');
    }

    try {
      const content = await ebookService.getEbookContent(ebook.id, user!.id);
      return content;
    } catch (error) {
      throw error;
    }
  };

  const previewEbook = async (ebookId: string) => {
    try {
      const preview = await ebookService.getEbookPreview(ebookId);
      return preview;
    } catch (error) {
      throw error;
    }
  };

  const toggleAnswer = async (pageId: string, answerId: string) => {
    try {
      const answer = await ebookService.toggleAnswer(pageId, answerId);
      return answer;
    } catch (error) {
      throw error;
    }
  };

  return {
    openEbook,
    previewEbook,
    toggleAnswer
  };
}