/**
 * 보스턴어학원 테마 시스템
 *
 * 모든 테마 관련 exports를 통합
 */

// Theme adapter
export { getBostonTheme, getLightTheme, getDarkTheme } from './getBostonTheme';

// Provider & Hooks
export {
  BostonThemeProvider,
  useBostonTheme,
  ThemeToggleButton,
} from './BostonThemeProvider';
export { useColorScheme, FOUC_PREVENTION_SCRIPT } from './hooks/useColorScheme';

// CSS Variables
export { generateCSSVariables, injectCSSVariables } from './cssVariables';

// Tokens
export * from './tokens/colors';
export * from './tokens/typography';
export * from './tokens/spacing';
export * from './tokens/shadows';
export * from './tokens/animations';
