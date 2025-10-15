/**
 * CSS 변수 생성기
 *
 * 디자인 토큰을 CSS 변수(:root)로 변환
 * CSS 파일에서도 토큰 사용 가능
 */

import { lightModeColors, darkModeColors, ColorMode } from './tokens/colors';
import { spacing, borderRadius } from './tokens/spacing';
import { duration, easing } from './tokens/animations';

/**
 * CSS 변수 생성 (ライト/ダークモード別)
 */
export function generateCSSVariables(mode: ColorMode): string {
  const colors = mode === 'light' ? lightModeColors : darkModeColors;

  return `
    /* ========================================
       Color Variables
       ======================================== */
    --color-primary-main: ${colors.primary.main};
    --color-primary-light: ${colors.primary.light};
    --color-primary-dark: ${colors.primary.dark};
    --color-primary-contrast: ${colors.primary.contrastText};

    --color-secondary-main: ${colors.secondary.main};
    --color-secondary-light: ${colors.secondary.light};
    --color-secondary-dark: ${colors.secondary.dark};

    --color-background-default: ${colors.background.default};
    --color-background-paper: ${colors.background.paper};
    --color-background-elevated: ${colors.background.elevated};
    --color-background-subtle: ${colors.background.subtle};

    --color-surface-primary: ${colors.surface.primary};
    --color-surface-secondary: ${colors.surface.secondary};
    --color-surface-hover: ${colors.surface.hover};
    --color-surface-active: ${colors.surface.active};

    --color-text-primary: ${colors.text.primary};
    --color-text-secondary: ${colors.text.secondary};
    --color-text-tertiary: ${colors.text.tertiary};
    --color-text-disabled: ${colors.text.disabled};
    --color-text-hint: ${colors.text.hint};

    --color-success-main: ${colors.success.main};
    --color-success-surface: ${colors.success.surface};
    --color-warning-main: ${colors.warning.main};
    --color-warning-surface: ${colors.warning.surface};
    --color-error-main: ${colors.error.main};
    --color-error-surface: ${colors.error.surface};
    --color-info-main: ${colors.info.main};
    --color-info-surface: ${colors.info.surface};

    --color-border-default: ${colors.border.default};
    --color-border-light: ${colors.border.light};
    --color-border-medium: ${colors.border.medium};
    --color-border-dark: ${colors.border.dark};
    --color-border-focus: ${colors.border.focus};

    --color-divider: ${colors.divider};

    /* Action colors */
    --color-action-active: ${colors.action.active};
    --color-action-hover: ${colors.action.hover};
    --color-action-selected: ${colors.action.selected};
    --color-action-disabled: ${colors.action.disabled};

    /* ========================================
       Spacing Variables
       ======================================== */
    --spacing-1: ${spacing[1]};
    --spacing-2: ${spacing[2]};
    --spacing-3: ${spacing[3]};
    --spacing-4: ${spacing[4]};
    --spacing-5: ${spacing[5]};
    --spacing-6: ${spacing[6]};
    --spacing-8: ${spacing[8]};
    --spacing-12: ${spacing[12]};
    --spacing-16: ${spacing[16]};

    /* ========================================
       Border Radius Variables
       ======================================== */
    --radius-sm: ${borderRadius.sm};
    --radius-base: ${borderRadius.base};
    --radius-md: ${borderRadius.md};
    --radius-lg: ${borderRadius.lg};
    --radius-xl: ${borderRadius.xl};
    --radius-2xl: ${borderRadius['2xl']};
    --radius-full: ${borderRadius.full};

    /* ========================================
       Animation Variables
       ======================================== */
    --duration-fast: ${duration.fast};
    --duration-normal: ${duration.normal};
    --duration-slow: ${duration.slow};

    --easing-standard: ${easing.standard};
    --easing-ease-out: ${easing.easeOut};
    --easing-ease-in-out: ${easing.easeInOut};
  `.trim();
}

/**
 * CSS 변수를 DOM에 주입
 */
export function injectCSSVariables(mode: ColorMode): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const variables = generateCSSVariables(mode);

  // CSS 변수를 :root에 설정
  const lines = variables.split('\n').filter(line => line.trim());
  lines.forEach(line => {
    const match = line.match(/--([^:]+):\s*(.+);/);
    if (match) {
      const [, name, value] = match;
      root.style.setProperty(`--${name.trim()}`, value.trim());
    }
  });
}
