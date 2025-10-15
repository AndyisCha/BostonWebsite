/**
 * 보스턴어학원 간격(Spacing) 토큰
 *
 * 규칙:
 * - 4px 기반 스케일 (4, 8, 12, 16, 24, 32, 48, 64...)
 * - rem 단위 사용 (접근성 고려)
 * - 일관된 간격으로 시각적 리듬 생성
 */

// ========================================
// 1. Spacing Scale (rem 기반, 16px = 1rem)
// ========================================

export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  2: '0.5rem',      // 8px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  48: '12rem',      // 192px
  56: '14rem',      // 224px
  64: '16rem',      // 256px
} as const;

// ========================================
// 2. Component-specific Spacing
// ========================================

export const componentSpacing = {
  // 버튼 패딩
  button: {
    small: {
      paddingX: spacing[3],     // 12px
      paddingY: spacing[1],     // 4px
    },
    medium: {
      paddingX: spacing[4],     // 16px
      paddingY: spacing[2],     // 8px
    },
    large: {
      paddingX: spacing[6],     // 24px
      paddingY: spacing[3],     // 12px
    },
  },

  // 카드 패딩
  card: {
    small: spacing[3],          // 12px
    medium: spacing[4],         // 16px
    large: spacing[6],          // 24px
  },

  // 입력 필드 패딩
  input: {
    paddingX: spacing[3],       // 12px
    paddingY: spacing[2],       // 8px
  },

  // 모달/다이얼로그 패딩
  modal: {
    padding: spacing[6],        // 24px
    gap: spacing[4],            // 16px
  },

  // 섹션 간격
  section: {
    gap: spacing[8],            // 32px
    marginBottom: spacing[12],  // 48px
  },

  // 그리드 간격
  grid: {
    small: spacing[2],          // 8px
    medium: spacing[4],         // 16px
    large: spacing[6],          // 24px
  },
} as const;

// ========================================
// 3. Layout Spacing
// ========================================

export const layoutSpacing = {
  // 페이지 컨테이너 패딩
  container: {
    mobile: spacing[4],         // 16px
    tablet: spacing[6],         // 24px
    desktop: spacing[8],        // 32px
  },

  // 사이드바 너비
  sidebar: {
    collapsed: spacing[16],     // 64px
    expanded: '240px',          // 고정 너비
  },

  // 헤더 높이
  header: {
    mobile: spacing[14],        // 56px
    desktop: spacing[16],       // 64px
  },

  // 푸터 높이
  footer: {
    height: spacing[20],        // 80px
  },
} as const;

// ========================================
// 4. Border Radius
// ========================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',     // 2px
  base: '0.25rem',    // 4px
  md: '0.375rem',     // 6px
  lg: '0.5rem',       // 8px
  xl: '0.75rem',      // 12px
  '2xl': '1rem',      // 16px
  '3xl': '1.5rem',    // 24px
  full: '9999px',     // 완전한 원형
} as const;

// ========================================
// 5. Z-Index Layers
// ========================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  notification: 1700,
} as const;

// ========================================
// 6. 타입 정의
// ========================================

export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ZIndexKey = keyof typeof zIndex;
