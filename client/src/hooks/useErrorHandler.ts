import { useState, useCallback } from 'react';
import { ApiError } from '../services/api';

interface ErrorState {
  error: ApiError | null;
  isError: boolean;
  errorId: string | null;
}

interface UseErrorHandlerReturn {
  error: ApiError | null;
  isError: boolean;
  errorId: string | null;
  showError: (error: ApiError | Error | string) => void;
  clearError: () => void;
  retryLastAction: () => void;
  isRetrying: boolean;
}

export const useErrorHandler = (
  onRetry?: () => Promise<void> | void
): UseErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorId: null
  });

  const [isRetrying, setIsRetrying] = useState(false);
  const [lastAction, setLastAction] = useState<(() => Promise<void> | void) | null>(null);

  const showError = useCallback((error: ApiError | Error | string) => {
    let apiError: ApiError;

    if (typeof error === 'string') {
      apiError = {
        message: error,
        status: 0,
        timestamp: new Date()
      };
    } else if (error instanceof Error) {
      apiError = {
        message: error.message,
        status: 0,
        code: error.name,
        timestamp: new Date()
      };
    } else {
      apiError = error;
    }

    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    setErrorState({
      error: apiError,
      isError: true,
      errorId
    });

    // Log error for debugging
    console.error('Error handled by useErrorHandler:', apiError);

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      sendErrorToMonitoring(apiError, errorId);
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorId: null
    });
  }, []);

  const retryLastAction = useCallback(async () => {
    if (onRetry || lastAction) {
      setIsRetrying(true);
      try {
        if (onRetry) {
          await onRetry();
        } else if (lastAction) {
          await lastAction();
        }
        clearError();
      } catch (error: any) {
        showError(error);
      } finally {
        setIsRetrying(false);
      }
    }
  }, [onRetry, lastAction, clearError, showError]);

  // Helper function to wrap async actions with error handling
  const wrapAsyncAction = useCallback(
    (action: () => Promise<void>) => {
      setLastAction(() => action);
      return async () => {
        try {
          clearError();
          await action();
        } catch (error: any) {
          showError(error);
          throw error; // Re-throw for component-level handling if needed
        }
      };
    },
    [clearError, showError]
  );

  return {
    error: errorState.error,
    isError: errorState.isError,
    errorId: errorState.errorId,
    showError,
    clearError,
    retryLastAction,
    isRetrying
  };
};

// Helper function to send errors to monitoring service
const sendErrorToMonitoring = (error: ApiError, errorId: string) => {
  // Example implementation - replace with your monitoring service
  const errorData = {
    id: errorId,
    message: error.message,
    status: error.status,
    code: error.code,
    details: error.details,
    timestamp: error.timestamp,
    url: window.location.href,
    userAgent: navigator.userAgent,
    userId: localStorage.getItem('userId') // if available
  };

  // In a real application, send this to your monitoring service
  // fetch('/api/errors/report', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(errorData)
  // });

  console.log('Error reported to monitoring:', errorData);
};

// Error types for better categorization
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  CLIENT: 'CLIENT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
} as const;

// Helper function to categorize errors
export const categorizeError = (error: ApiError): keyof typeof ErrorTypes => {
  if (error.code === 'NETWORK_ERROR' || error.status === 0) {
    return 'NETWORK';
  }
  if (error.status === 401 || error.status === 403) {
    return 'AUTH';
  }
  if (error.status >= 400 && error.status < 500) {
    return 'VALIDATION';
  }
  if (error.status >= 500) {
    return 'SERVER';
  }
  return 'UNKNOWN';
};

// Helper function to get user-friendly error messages
export const getFriendlyErrorMessage = (error: ApiError): string => {
  const category = categorizeError(error);

  switch (category) {
    case 'NETWORK':
      return '인터넷 연결을 확인하고 다시 시도해주세요.';
    case 'AUTH':
      return '로그인이 필요하거나 권한이 없습니다.';
    case 'VALIDATION':
      return '입력 정보를 확인해주세요.';
    case 'SERVER':
      return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    default:
      return error.message || '알 수 없는 오류가 발생했습니다.';
  }
};