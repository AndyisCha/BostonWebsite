/**
 * 보스턴어학원 색상 토큰 (Design Tokens)
 *
 * 규칙:
 * - 이 파일은 순수 색상 값만 포함 (HEX/RGB)
 * - Semantic naming 사용 (용도 기반)
 * - 라이트/다크 모드 대응
 * - 컴포넌트는 이 토큰만 참조 (인라인 색상 금지)
 */

// ========================================
// 1. 브랜드 색상 (Brand Colors)
// ========================================

export const brandColors = {
  // 제공된 보스턴어학원 색상 팔레트
  lavenderMist: '#C8C5D9',    // 연한 라벤더 - 부드럽고 접근하기 쉬운
  deepIndigo: '#2E2C73',       // 진한 남색 - 신뢰감, 전문성
  slatePurple: '#504F73',      // 중간톤 회색-보라 - 중립적, 현대적
  midnightBlue: '#252859',     // 매우 진한 남색 - 권위, 안정감
  softWhite: '#F2F2F2',        // 거의 흰색 - 깔끔한 배경
} as const;

// ========================================
// 2. Semantic Colors (Light Mode)
// ========================================

export const lightModeColors = {
  // Primary (주요 액션, 브랜드 정체성)
  primary: {
    main: brandColors.deepIndigo,       // #2E2C73 - 버튼, 링크
    light: brandColors.lavenderMist,    // #C8C5D9 - 호버 배경
    dark: brandColors.midnightBlue,     // #252859 - 액티브 상태
    contrastText: '#FFFFFF',            // 흰색 텍스트
  },

  // Secondary (보조 액션)
  secondary: {
    main: brandColors.slatePurple,      // #504F73
    light: '#7A7899',                   // 밝게 조정
    dark: '#3A3952',                    // 어둡게 조정
    contrastText: '#FFFFFF',
  },

  // Background (배경)
  background: {
    default: '#FFFFFF',                 // 메인 배경
    paper: brandColors.softWhite,       // #F2F2F2 - 카드, 모달
    elevated: '#FFFFFF',                // 떠있는 요소
    subtle: '#FAFAFA',                  // 미세한 구분
  },

  // Surface (표면 - 카드, 패널)
  surface: {
    primary: brandColors.softWhite,     // #F2F2F2
    secondary: '#FAFAFA',
    tertiary: '#FFFFFF',
    hover: brandColors.lavenderMist,    // #C8C5D9 - 호버 시
    active: '#E0DDE8',                  // 액티브 시
  },

  // Text (텍스트)
  text: {
    primary: '#1A1A1A',                 // 주요 텍스트 (검정에 가까움)
    secondary: brandColors.slatePurple, // #504F73 - 보조 텍스트
    tertiary: '#757575',                // 덜 중요한 텍스트
    disabled: '#BDBDBD',                // 비활성화
    hint: '#9E9E9E',                    // 힌트/플레이스홀더
    contrast: '#FFFFFF',                // 다크 배경 위 텍스트
  },

  // Semantic (의미 기반)
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
    surface: '#E8F5E9',                 // 배경에 쓸 연한 버전
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
    surface: '#FFF3E0',
    contrastText: '#000000',
  },
  error: {
    main: '#F44336',
    light: '#E57373',
    dark: '#D32F2F',
    surface: '#FFEBEE',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    surface: '#E3F2FD',
    contrastText: '#FFFFFF',
  },

  // Accent (강조 - NEW, HOT 뱃지 등)
  accent: {
    new: '#4CAF50',                     // 초록 - NEW 뱃지
    hot: '#FF5722',                     // 주황-빨강 - HOT 뱃지
    featured: '#FFD700',                // 금색 - FEATURED
  },

  // Border (경계선)
  border: {
    default: '#E0E0E0',
    light: '#F5F5F5',
    medium: '#BDBDBD',
    dark: brandColors.slatePurple,      // #504F73
    focus: brandColors.deepIndigo,      // #2E2C73 - 포커스 시
  },

  // Divider (구분선)
  divider: '#E0E0E0',

  // Action (인터랙션 상태)
  action: {
    active: brandColors.deepIndigo,     // #2E2C73
    hover: 'rgba(46, 44, 115, 0.08)',   // 8% 투명도
    selected: 'rgba(46, 44, 115, 0.12)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    focus: 'rgba(46, 44, 115, 0.16)',
  },
} as const;

// ========================================
// 3. Semantic Colors (Dark Mode)
// ========================================

export const darkModeColors = {
  // Primary
  primary: {
    main: '#9B97C1',                    // 밝게 조정된 라벤더
    light: brandColors.lavenderMist,    // #C8C5D9
    dark: '#7871A8',
    contrastText: '#000000',            // 다크모드에서는 검정 텍스트
  },

  // Secondary
  secondary: {
    main: '#8B89A8',                    // 밝게 조정된 slate
    light: '#A5A3BD',
    dark: '#6C6A85',
    contrastText: '#000000',
  },

  // Background
  background: {
    default: '#121212',                 // 표준 다크모드 배경
    paper: '#1E1E1E',                   // 카드 배경
    elevated: '#2C2C2C',                // 떠있는 요소 (더 밝음)
    subtle: '#1A1A1A',
  },

  // Surface
  surface: {
    primary: '#1E1E1E',
    secondary: '#2C2C2C',
    tertiary: '#383838',
    hover: 'rgba(155, 151, 193, 0.12)', // Primary + 투명도
    active: 'rgba(155, 151, 193, 0.24)',
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#8A8A8A',
    disabled: '#616161',
    hint: '#757575',
    contrast: '#000000',
  },

  // Semantic (Dark mode에서 약간 desaturate)
  success: {
    main: '#66BB6A',
    light: '#81C784',
    dark: '#4CAF50',
    surface: 'rgba(76, 175, 80, 0.16)',
    contrastText: '#000000',
  },
  warning: {
    main: '#FFA726',
    light: '#FFB74D',
    dark: '#FF9800',
    surface: 'rgba(255, 152, 0, 0.16)',
    contrastText: '#000000',
  },
  error: {
    main: '#EF5350',
    light: '#E57373',
    dark: '#F44336',
    surface: 'rgba(244, 67, 54, 0.16)',
    contrastText: '#000000',
  },
  info: {
    main: '#42A5F5',
    light: '#64B5F6',
    dark: '#2196F3',
    surface: 'rgba(33, 150, 243, 0.16)',
    contrastText: '#000000',
  },

  // Accent
  accent: {
    new: '#66BB6A',
    hot: '#FF6F60',
    featured: '#FFD54F',
  },

  // Border
  border: {
    default: '#3A3A3A',
    light: '#2C2C2C',
    medium: '#525252',
    dark: '#8B89A8',
    focus: '#9B97C1',
  },

  // Divider
  divider: '#3A3A3A',

  // Action
  action: {
    active: '#9B97C1',
    hover: 'rgba(155, 151, 193, 0.12)',
    selected: 'rgba(155, 151, 193, 0.20)',
    disabled: 'rgba(255, 255, 255, 0.30)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
    focus: 'rgba(155, 151, 193, 0.24)',
  },
} as const;

// ========================================
// 4. CEFR Level Colors (E-book 레벨)
// ========================================

export const cefrLevelColors = {
  // A1 - 초급 (초록 계열)
  A1: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
    surface: '#E8F5E9',
  },
  // A2 - 초급 상 (연두)
  A2: {
    main: '#8BC34A',
    light: '#AED581',
    dark: '#689F38',
    surface: '#F1F8E9',
  },
  // A3 - 준중급 (라임)
  A3: {
    main: '#CDDC39',
    light: '#DCE775',
    dark: '#AFB42B',
    surface: '#F9FBE7',
  },
  // B1 - 중급 (노랑)
  B1: {
    main: '#FFEB3B',
    light: '#FFF176',
    dark: '#FBC02D',
    surface: '#FFFDE7',
  },
  // B2 - 중급 상 (주황)
  B2: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
    surface: '#FFF3E0',
  },
  // C1 - 고급 (진한 주황)
  C1: {
    main: '#FF5722',
    light: '#FF7043',
    dark: '#E64A19',
    surface: '#FBE9E7',
  },
  // C2 - 최고급 (빨강)
  C2: {
    main: '#F44336',
    light: '#E57373',
    dark: '#D32F2F',
    surface: '#FFEBEE',
  },
} as const;

// ========================================
// 5. 유틸리티 함수
// ========================================

/**
 * 투명도를 추가한 색상 반환
 * @param color HEX 색상 (#RRGGBB)
 * @param alpha 투명도 (0-1)
 */
export function withAlpha(color: string, alpha: number): string {
  // HEX를 RGB로 변환
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 색상 대비 계산 (WCAG 기준)
 * @param foreground 전경색
 * @param background 배경색
 * @returns 대비 비율
 */
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// ========================================
// 6. 타입 정의
// ========================================

export type ColorMode = 'light' | 'dark';
export type ColorPalette = typeof lightModeColors;
export type CEFRLevel = keyof typeof cefrLevelColors;
