/**
 * 보스턴어학원 그림자(Shadow) 토큰
 *
 * 규칙:
 * - Elevation 1-4로 깊이 구분
 * - 자연스러운 그림자 (Y축 offset > X축)
 * - 다크모드 대응
 */

// ========================================
// 1. Shadow Definitions (Light Mode)
// ========================================

export const lightShadows = {
  // 그림자 없음
  none: 'none',

  // Elevation 1 - 작은 카드, 버튼 호버
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',

  // Elevation 2 - 기본 카드
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',

  // Elevation 3 - 드롭다운, 팝오버
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',

  // Elevation 4 - 모달, 다이얼로그
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',

  // Elevation 5 - 플로팅 액션 버튼, 드로어
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

  // Elevation 6 - 최상단 요소
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Inner shadow - 인셋 효과
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Outline - 포커스 링
  outline: '0 0 0 3px rgba(46, 44, 115, 0.5)', // Primary color with 50% opacity
} as const;

// ========================================
// 2. Shadow Definitions (Dark Mode)
// ========================================

export const darkShadows = {
  // 다크모드에서는 그림자를 더 강하게
  none: 'none',

  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',

  base: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.24)',

  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.24)',

  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',

  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.16)',

  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',

  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.24)',

  outline: '0 0 0 3px rgba(155, 151, 193, 0.5)', // Light primary for dark mode
} as const;

// ========================================
// 3. Component-specific Shadows
// ========================================

export const componentShadows = {
  // 버튼
  button: {
    default: lightShadows.sm,
    hover: lightShadows.base,
    active: lightShadows.none,
  },

  // 카드
  card: {
    default: lightShadows.base,
    hover: lightShadows.md,
  },

  // 모달
  modal: {
    default: lightShadows.xl,
  },

  // 드롭다운
  dropdown: {
    default: lightShadows.lg,
  },

  // 툴팁
  tooltip: {
    default: lightShadows.md,
  },

  // 플로팅 액션 버튼
  fab: {
    default: lightShadows.lg,
    hover: lightShadows.xl,
  },
} as const;

// ========================================
// 4. MUI Shadows Array (24 레벨)
// ========================================

/**
 * MUI가 요구하는 24단계 그림자 배열
 * elevation prop에서 0-24 사용
 */
export function createMuiShadows(mode: 'light' | 'dark'): string[] {
  const shadows = mode === 'light' ? lightShadows : darkShadows;

  return [
    'none',
    shadows.sm,
    shadows.base,
    shadows.md,
    shadows.md,
    shadows.lg,
    shadows.lg,
    shadows.xl,
    shadows.xl,
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
    shadows['2xl'],
  ];
}

// ========================================
// 5. 타입 정의
// ========================================

export type ShadowKey = keyof typeof lightShadows;
export type ComponentShadowKey = keyof typeof componentShadows;
