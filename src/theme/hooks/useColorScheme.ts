/**
 * useColorScheme Hook
 *
 * 다크/라이트 모드 관리 훅
 *
 * 기능:
 * - localStorage 영속성
 * - prefers-color-scheme 시스템 설정 감지
 * - 테마 전환 함수
 * - FOUC (Flash of Unstyled Content) 방지
 */

import { useState, useEffect, useCallback } from 'react';
import { ColorMode } from '../tokens/colors';

const STORAGE_KEY = 'boston-theme-mode';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

interface UseColorSchemeReturn {
  /** 현재 테마 모드 */
  mode: ColorMode;

  /** 테마 모드 설정 */
  setMode: (mode: ColorMode) => void;

  /** 라이트/다크 토글 */
  toggleMode: () => void;

  /** 시스템 설정으로 리셋 */
  resetToSystem: () => void;

  /** 시스템이 다크모드인지 여부 */
  systemPrefersDark: boolean;
}

/**
 * 저장된 테마 모드 불러오기
 */
function getStoredMode(): ColorMode | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return null;
  } catch (error) {
    console.warn('localStorage 접근 실패:', error);
    return null;
  }
}

/**
 * 테마 모드 저장
 */
function storeMode(mode: ColorMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch (error) {
    console.warn('localStorage 저장 실패:', error);
  }
}

/**
 * 시스템 테마 설정 감지
 */
function getSystemMode(): ColorMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const mediaQuery = window.matchMedia(MEDIA_QUERY);
    return mediaQuery.matches ? 'dark' : 'light';
  } catch (error) {
    console.warn('미디어 쿼리 접근 실패:', error);
    return 'light';
  }
}

/**
 * 초기 모드 결정
 * 1순위: localStorage
 * 2순위: 시스템 설정
 * 3순위: light (기본값)
 */
function getInitialMode(): ColorMode {
  const stored = getStoredMode();
  if (stored) {
    return stored;
  }
  return getSystemMode();
}

/**
 * HTML 속성 업데이트 (FOUC 방지용)
 */
function updateHtmlAttribute(mode: ColorMode): void {
  if (typeof document === 'undefined') return;

  // data-theme 속성 설정
  document.documentElement.setAttribute('data-theme', mode);

  // class도 설정 (CSS에서 사용 가능)
  if (mode === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }
}

/**
 * 컬러 스킴 관리 훅
 */
export function useColorScheme(): UseColorSchemeReturn {
  // 초기 모드 설정
  const [mode, setModeState] = useState<ColorMode>(() => getInitialMode());
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => getSystemMode() === 'dark');

  /**
   * 모드 변경 핸들러
   */
  const setMode = useCallback((newMode: ColorMode) => {
    setModeState(newMode);
    storeMode(newMode);
    updateHtmlAttribute(newMode);
  }, []);

  /**
   * 토글 핸들러
   */
  const toggleMode = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : 'light');
  }, [mode, setMode]);

  /**
   * 시스템 설정으로 리셋
   */
  const resetToSystem = useCallback(() => {
    const systemMode = getSystemMode();
    setMode(systemMode);
  }, [setMode]);

  /**
   * 초기 HTML 속성 설정 (FOUC 방지)
   */
  useEffect(() => {
    updateHtmlAttribute(mode);
  }, [mode]);

  /**
   * 시스템 테마 변경 감지
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const mediaQuery = window.matchMedia(MEDIA_QUERY);

      const handler = (e: MediaQueryListEvent) => {
        const newSystemPreference = e.matches ? 'dark' : 'light';
        setSystemPrefersDark(e.matches);

        // 사용자가 명시적으로 설정하지 않았다면 시스템 설정 따르기
        const storedMode = getStoredMode();
        if (!storedMode) {
          setMode(newSystemPreference);
        }
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }
      // Legacy browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handler);
        return () => mediaQuery.removeListener(handler);
      }
    } catch (error) {
      console.warn('미디어 쿼리 리스너 등록 실패:', error);
    }
  }, [setMode]);

  return {
    mode,
    setMode,
    toggleMode,
    resetToSystem,
    systemPrefersDark,
  };
}

/**
 * FOUC 방지를 위한 인라인 스크립트
 *
 * index.html의 <head>에 추가:
 *
 * <script>
 *   (function() {
 *     const stored = localStorage.getItem('boston-theme-mode');
 *     const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
 *     const mode = stored || (systemPrefersDark ? 'dark' : 'light');
 *     document.documentElement.setAttribute('data-theme', mode);
 *     document.documentElement.classList.add(mode);
 *   })();
 * </script>
 */
export const FOUC_PREVENTION_SCRIPT = `
(function() {
  try {
    const stored = localStorage.getItem('boston-theme-mode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const mode = stored || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.classList.add(mode);
  } catch (e) {
    // Fallback to light mode
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.add('light');
  }
})();
`.trim();
