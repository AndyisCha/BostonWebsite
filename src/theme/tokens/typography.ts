/**
 * 보스턴어학원 타이포그래피 토큰
 *
 * 규칙:
 * - 한글: Pretendard (우선) or Noto Sans KR (대체)
 * - 영문: Inter (우선) or Roboto (대체)
 * - 폰트 크기: rem 기반 (16px = 1rem)
 * - Line height: 가독성을 위해 1.5-1.7
 */

// ========================================
// 1. Font Families
// ========================================

export const fontFamilies = {
  // 한글 + 영문 (일반 텍스트)
  primary: [
    'Pretendard',
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'Roboto',
    '"Noto Sans KR"',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),

  // 숫자/코드 (고정폭)
  monospace: [
    '"JetBrains Mono"',
    '"Fira Code"',
    'Consolas',
    'Monaco',
    '"Courier New"',
    'monospace',
  ].join(','),

  // 제목 (강조용, 선택사항)
  heading: [
    'Pretendard',
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'sans-serif',
  ].join(','),
} as const;

// ========================================
// 2. Font Sizes (Type Scale)
// ========================================

export const fontSizes = {
  // xs (Extra Small) - 캡션, 주석
  xs: '0.75rem',    // 12px

  // sm (Small) - 작은 텍스트, 보조 정보
  sm: '0.875rem',   // 14px

  // base (Base) - 본문 기본
  base: '1rem',     // 16px

  // md (Medium) - 강조 본문
  md: '1.125rem',   // 18px

  // lg (Large) - 소제목
  lg: '1.25rem',    // 20px

  // xl (Extra Large) - 제목
  xl: '1.5rem',     // 24px

  // 2xl - 큰 제목
  '2xl': '2rem',    // 32px

  // 3xl - 페이지 타이틀
  '3xl': '2.5rem',  // 40px

  // 4xl - 히어로 제목
  '4xl': '3rem',    // 48px
} as const;

// ========================================
// 3. Font Weights
// ========================================

export const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

// ========================================
// 4. Line Heights
// ========================================

export const lineHeights = {
  // Tight - 제목용 (줄간격 좁음)
  tight: 1.25,

  // Normal - 기본 (본문)
  normal: 1.5,

  // Relaxed - 여유있게 (긴 문단)
  relaxed: 1.7,

  // Loose - 매우 여유있게 (가독성 중시)
  loose: 2,
} as const;

// ========================================
// 5. Letter Spacing
// ========================================

export const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// ========================================
// 6. Typography Variants (Preset Combinations)
// ========================================

export const typographyVariants = {
  // 제목 (Headings)
  h1: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  },
  h2: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  },
  h3: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.normal,
  },
  h4: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  h5: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  h6: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.wide,
  },

  // 본문 (Body)
  body1: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacings.normal,
  },
  body2: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },

  // 버튼
  button: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.wide,
    textTransform: 'none' as const, // 대문자 변환 안함 (한글 고려)
  },

  // 캡션
  caption: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },

  // 오버라인 (작은 라벨)
  overline: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.wider,
    textTransform: 'uppercase' as const,
  },

  // 서브타이틀
  subtitle1: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  subtitle2: {
    fontFamily: fontFamilies.primary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
} as const;

// ========================================
// 7. Font Loading (웹폰트)
// ========================================

export const fontFaces = `
  /* Pretendard - 한글 전용 경량 폰트 */
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');

  /* Inter - 영문 전용 */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  /* Noto Sans KR - 한글 대체 폰트 */
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

  /* JetBrains Mono - 코드/숫자용 */
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
`;

// ========================================
// 8. 타입 정의
// ========================================

export type FontFamily = keyof typeof fontFamilies;
export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;
export type LineHeight = keyof typeof lineHeights;
export type LetterSpacing = keyof typeof letterSpacings;
export type TypographyVariant = keyof typeof typographyVariants;
