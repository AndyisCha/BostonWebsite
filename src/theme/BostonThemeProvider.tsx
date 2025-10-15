/**
 * BostonThemeProvider
 *
 * 보스턴어학원 테마 시스템의 통합 Provider
 *
 * 기능:
 * - 다크/라이트 모드 Context 제공
 * - MUI ThemeProvider와 통합
 * - useColorScheme 훅 내장
 */

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { getBostonTheme } from './getBostonTheme';
import { useColorScheme } from './hooks/useColorScheme';
import { ColorMode } from './tokens/colors';
import { injectCSSVariables } from './cssVariables';

// ========================================
// Context 정의
// ========================================

interface ThemeContextValue {
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

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ========================================
// Provider 컴포넌트
// ========================================

interface BostonThemeProviderProps {
  children: React.ReactNode;

  /** 초기 테마 모드 (선택사항, 기본값은 시스템 설정) */
  defaultMode?: ColorMode;
}

export const BostonThemeProvider: React.FC<BostonThemeProviderProps> = ({
  children,
  defaultMode,
}) => {
  // useColorScheme 훅 사용
  const colorScheme = useColorScheme();

  // MUI 테마 생성 (mode에 따라 동적으로)
  const theme = useMemo(() => {
    return getBostonTheme(colorScheme.mode);
  }, [colorScheme.mode]);

  // CSS 변수 주입 (테마 변경 시)
  useEffect(() => {
    injectCSSVariables(colorScheme.mode);
  }, [colorScheme.mode]);

  // Context value
  const contextValue: ThemeContextValue = {
    mode: colorScheme.mode,
    setMode: colorScheme.setMode,
    toggleMode: colorScheme.toggleMode,
    resetToSystem: colorScheme.resetToSystem,
    systemPrefersDark: colorScheme.systemPrefersDark,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// ========================================
// Hook: useTheme (Context 접근)
// ========================================

/**
 * 보스턴 테마 Context 사용 훅
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { mode, toggleMode } = useBostonTheme();
 *
 *   return (
 *     <Button onClick={toggleMode}>
 *       {mode === 'light' ? '🌙 다크모드' : '☀️ 라이트모드'}
 *     </Button>
 *   );
 * }
 * ```
 */
export function useBostonTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useBostonTheme must be used within BostonThemeProvider');
  }

  return context;
}

// ========================================
// 편의 컴포넌트: ThemeToggleButton
// ========================================

import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

interface ThemeToggleButtonProps {
  /** 버튼 크기 */
  size?: 'small' | 'medium' | 'large';

  /** 추가 className */
  className?: string;
}

/**
 * 테마 전환 버튼 컴포넌트
 *
 * @example
 * ```tsx
 * <ThemeToggleButton size="small" />
 * ```
 */
export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  size = 'medium',
  className,
}) => {
  const { mode, toggleMode } = useBostonTheme();

  return (
    <Tooltip title={mode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}>
      <IconButton
        onClick={toggleMode}
        color="inherit"
        size={size}
        className={className}
        aria-label={mode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
      >
        {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
};
