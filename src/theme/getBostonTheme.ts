/**
 * 보스턴어학원 MUI Theme Adapter
 *
 * 순수 토큰(tokens/)을 MUI 테마 객체로 변환
 * 다크/라이트 모드 지원
 */

import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import {
  lightModeColors,
  darkModeColors,
  ColorMode,
} from './tokens/colors';
import {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  typographyVariants,
} from './tokens/typography';
import { spacing, borderRadius, zIndex } from './tokens/spacing';
import { createMuiShadows } from './tokens/shadows';
import { transitions, reducedMotion } from './tokens/animations';

/**
 * 보스턴어학원 테마 생성
 * @param mode 'light' | 'dark'
 * @returns MUI Theme 객체
 */
export function getBostonTheme(mode: ColorMode = 'light'): Theme {
  const colors = mode === 'light' ? lightModeColors : darkModeColors;

  const themeOptions: ThemeOptions = {
    // ========================================
    // 1. Palette (색상)
    // ========================================
    palette: {
      mode,
      primary: {
        main: colors.primary.main,
        light: colors.primary.light,
        dark: colors.primary.dark,
        contrastText: colors.primary.contrastText,
      },
      secondary: {
        main: colors.secondary.main,
        light: colors.secondary.light,
        dark: colors.secondary.dark,
        contrastText: colors.secondary.contrastText,
      },
      error: {
        main: colors.error.main,
        light: colors.error.light,
        dark: colors.error.dark,
        contrastText: colors.error.contrastText,
      },
      warning: {
        main: colors.warning.main,
        light: colors.warning.light,
        dark: colors.warning.dark,
        contrastText: colors.warning.contrastText,
      },
      info: {
        main: colors.info.main,
        light: colors.info.light,
        dark: colors.info.dark,
        contrastText: colors.info.contrastText,
      },
      success: {
        main: colors.success.main,
        light: colors.success.light,
        dark: colors.success.dark,
        contrastText: colors.success.contrastText,
      },
      background: {
        default: colors.background.default,
        paper: colors.background.paper,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
        disabled: colors.text.disabled,
      },
      divider: colors.divider,
      action: {
        active: colors.action.active,
        hover: colors.action.hover,
        selected: colors.action.selected,
        disabled: colors.action.disabled,
        disabledBackground: colors.action.disabledBackground,
        focus: colors.action.focus,
      },
    },

    // ========================================
    // 2. Typography (타이포그래피)
    // ========================================
    typography: {
      fontFamily: fontFamilies.primary,

      // 폰트 크기
      fontSize: 16, // base font size

      // 제목
      h1: {
        ...typographyVariants.h1,
      },
      h2: {
        ...typographyVariants.h2,
      },
      h3: {
        ...typographyVariants.h3,
      },
      h4: {
        ...typographyVariants.h4,
      },
      h5: {
        ...typographyVariants.h5,
      },
      h6: {
        ...typographyVariants.h6,
      },

      // 본문
      body1: {
        ...typographyVariants.body1,
      },
      body2: {
        ...typographyVariants.body2,
      },

      // 기타
      button: {
        ...typographyVariants.button,
      },
      caption: {
        ...typographyVariants.caption,
      },
      overline: {
        ...typographyVariants.overline,
      },
      subtitle1: {
        ...typographyVariants.subtitle1,
      },
      subtitle2: {
        ...typographyVariants.subtitle2,
      },
    },

    // ========================================
    // 3. Spacing (간격)
    // ========================================
    spacing: (factor: number) => {
      // MUI는 spacing(1) = 8px를 기본으로 사용
      // 우리는 4px 기반이므로 factor * 4px
      const spacingValue = factor * 4;
      return `${spacingValue}px`;
    },

    // ========================================
    // 4. Shadows (그림자)
    // ========================================
    shadows: createMuiShadows(mode) as any,

    // ========================================
    // 5. Shape (모서리)
    // ========================================
    shape: {
      borderRadius: parseInt(borderRadius.lg), // 8px
    },

    // ========================================
    // 6. Z-Index
    // ========================================
    zIndex: {
      mobileStepper: 1000,
      speedDial: 1050,
      appBar: 1100,
      drawer: 1200,
      modal: zIndex.modal,
      snackbar: 1400,
      tooltip: zIndex.tooltip,
    },

    // ========================================
    // 7. Breakpoints (반응형)
    // ========================================
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },

    // ========================================
    // 8. Transitions (애니메이션)
    // ========================================
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },

    // ========================================
    // 9. Component Overrides
    // ========================================
    components: {
      // Button
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none', // 한글 대문자 변환 방지
            borderRadius: borderRadius.lg,
            fontWeight: fontWeights.medium,
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          },
          containedPrimary: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgba(46, 44, 115, 0.2)',
            },
          },
        },
      },

      // Card
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.xl,
            border: mode === 'light' ? `1px solid ${colors.border.light}` : undefined,
          },
        },
      },

      // Paper
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.lg,
          },
          elevation1: {
            boxShadow: mode === 'light'
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
          },
        },
      },

      // TextField
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: borderRadius.lg,
              transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.border.medium,
                },
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary.main,
                  borderWidth: '2px',
                },
              },
            },
          },
        },
      },

      // Chip
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.full,
            fontWeight: fontWeights.medium,
          },
        },
      },

      // Dialog
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: borderRadius['2xl'],
          },
        },
      },

      // AppBar
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light'
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
          },
        },
      },

      // Drawer
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            borderRight: mode === 'light' ? `1px solid ${colors.divider}` : undefined,
          },
        },
      },

      // List Item Button
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.lg,
            margin: `${spacing[1]} ${spacing[2]}`,
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: colors.action.hover,
            },
            '&.Mui-selected': {
              backgroundColor: colors.action.selected,
              '&:hover': {
                backgroundColor: colors.action.selected,
              },
            },
          },
        },
      },

      // Tooltip
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: borderRadius.md,
            fontSize: fontSizes.sm,
            backgroundColor: mode === 'light' ? colors.text.primary : colors.background.elevated,
            color: mode === 'light' ? '#FFFFFF' : colors.text.primary,
          },
        },
      },

      // Badge
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontWeight: fontWeights.semibold,
          },
        },
      },

      // Link
      MuiLink: {
        styleOverrides: {
          root: {
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
        },
      },

      // CssBaseline (전역 리셋)
      MuiCssBaseline: {
        styleOverrides: `
          ${reducedMotion.reduce}

          * {
            transition-property: background-color, color, border-color, box-shadow;
            transition-duration: 300ms;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          }

          body {
            transition: ${transitions.theme};
          }

          body::-webkit-scrollbar {
            width: 8px;
          }

          body::-webkit-scrollbar-track {
            background-color: ${colors.background.default};
          }

          body::-webkit-scrollbar-thumb {
            background-color: ${colors.border.medium};
            border-radius: ${borderRadius.full};
          }

          body::-webkit-scrollbar-thumb:hover {
            background-color: ${colors.border.dark};
          }

          *:focus-visible {
            outline: 2px solid ${colors.primary.main};
            outline-offset: 2px;
          }

          ::selection {
            background-color: ${colors.primary.light};
            color: ${colors.text.primary};
          }
        `,
      },
    },
  };

  return createTheme(themeOptions);
}

// ========================================
// 편의 함수
// ========================================

/**
 * 라이트 모드 테마
 */
export function getLightTheme(): Theme {
  return getBostonTheme('light');
}

/**
 * 다크 모드 테마
 */
export function getDarkTheme(): Theme {
  return getBostonTheme('dark');
}
