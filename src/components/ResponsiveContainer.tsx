import React, { ReactNode, CSSProperties } from 'react';
import { Box, Container, useTheme } from '@mui/material';
import { useResponsive, Breakpoint } from '../hooks/useResponsive';

interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: Breakpoint | false;
  padding?: number | string;
  margin?: number | string;
  fullHeight?: boolean;
  safeArea?: boolean;
  className?: string;
  style?: CSSProperties;
  mobileFirst?: boolean;
  breakpointStyles?: Partial<Record<Breakpoint, CSSProperties>>;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'lg',
  padding,
  margin,
  fullHeight = false,
  safeArea = false,
  className,
  style,
  mobileFirst = true,
  breakpointStyles = {}
}) => {
  const theme = useTheme();
  const {
    breakpoint,
    isMobile,
    isTablet,
    width,
    height,
    orientation
  } = useResponsive();

  // Calculate responsive padding
  const getResponsivePadding = () => {
    if (padding !== undefined) {
      if (typeof padding === 'number') {
        const scales = {
          xs: 0.5,
          sm: 0.7,
          md: 1,
          lg: 1.2,
          xl: 1.4
        };
        return padding * scales[breakpoint];
      }
      return padding;
    }

    // Default responsive padding
    const defaultPadding = {
      xs: theme.spacing(2),
      sm: theme.spacing(3),
      md: theme.spacing(4),
      lg: theme.spacing(5),
      xl: theme.spacing(6)
    };

    return defaultPadding[breakpoint];
  };

  // Calculate responsive margin
  const getResponsiveMargin = () => {
    if (margin !== undefined) {
      if (typeof margin === 'number') {
        const scales = {
          xs: 0.5,
          sm: 0.7,
          md: 1,
          lg: 1.2,
          xl: 1.4
        };
        return margin * scales[breakpoint];
      }
      return margin;
    }

    return 0;
  };

  // Safe area insets for devices with notches
  const getSafeAreaInsets = () => {
    if (!safeArea) return {};

    return {
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)'
    };
  };

  // Get breakpoint-specific styles
  const getCurrentBreakpointStyles = (): CSSProperties => {
    const breakpointOrder: Breakpoint[] = mobileFirst
      ? ['xs', 'sm', 'md', 'lg', 'xl']
      : ['xl', 'lg', 'md', 'sm', 'xs'];

    const currentIndex = breakpointOrder.indexOf(breakpoint);
    let mergedStyles: CSSProperties = {};

    if (mobileFirst) {
      // Mobile-first: apply styles from xs up to current breakpoint
      for (let i = 0; i <= currentIndex; i++) {
        const bp = breakpointOrder[i];
        if (breakpointStyles[bp]) {
          mergedStyles = { ...mergedStyles, ...breakpointStyles[bp] };
        }
      }
    } else {
      // Desktop-first: apply styles from xl down to current breakpoint
      for (let i = 0; i <= currentIndex; i++) {
        const bp = breakpointOrder[i];
        if (breakpointStyles[bp]) {
          mergedStyles = { ...mergedStyles, ...breakpointStyles[bp] };
        }
      }
    }

    return mergedStyles;
  };

  // Combined styles
  const containerStyles: CSSProperties = {
    padding: getResponsivePadding(),
    margin: getResponsiveMargin(),
    ...(fullHeight && { minHeight: '100vh' }),
    ...getSafeAreaInsets(),
    ...style,
    ...getCurrentBreakpointStyles(),
    // Add responsive font size
    fontSize: `clamp(0.875rem, ${width / 100}px, 1.125rem)`,
    // Responsive line height
    lineHeight: isMobile ? 1.4 : 1.6
  };

  // Add orientation-specific styles
  if (orientation === 'landscape' && (isMobile || isTablet)) {
    containerStyles.padding = theme.spacing(1, 3);
  }

  return (
    <Container
      maxWidth={maxWidth}
      className={`responsive-container ${className || ''}`}
      sx={{
        ...containerStyles,
        // Add smooth transitions
        transition: theme.transitions.create(['padding', 'margin'], {
          duration: theme.transitions.duration.short,
          easing: theme.transitions.easing.easeInOut,
        }),
        // Ensure proper box-sizing
        boxSizing: 'border-box',
        // Handle text selection on touch devices
        ...(isMobile && {
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          // But allow text selection in specific areas
          '& .selectable-text': {
            WebkitUserSelect: 'text',
            userSelect: 'text'
          }
        })
      }}
    >
      {children}
    </Container>
  );
};

// Responsive Grid Component
interface ResponsiveGridProps {
  children: ReactNode;
  columns?: Partial<Record<Breakpoint, number>>;
  gap?: number | string;
  minItemWidth?: number | string;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 2,
  minItemWidth,
  className
}) => {
  const { breakpoint } = useResponsive();
  const theme = useTheme();

  // Get current column count
  const getCurrentColumns = (): number => {
    const breakpointOrder: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = breakpointOrder.indexOf(breakpoint);

    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (columns[bp] !== undefined) {
        return columns[bp] as number;
      }
    }

    return 1;
  };

  const cols = getCurrentColumns();

  const gridStyles: CSSProperties = {
    display: 'grid',
    gap: typeof gap === 'number' ? theme.spacing(gap) : gap,
    ...(minItemWidth
      ? {
          gridTemplateColumns: `repeat(auto-fill, minmax(${typeof minItemWidth === 'number' ? `${minItemWidth}px` : minItemWidth}, 1fr))`
        }
      : {
          gridTemplateColumns: `repeat(${cols}, 1fr)`
        })
  };

  return (
    <Box
      className={`responsive-grid ${className || ''}`}
      sx={gridStyles}
    >
      {children}
    </Box>
  );
};

// Responsive Text Component
interface ResponsiveTextProps {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption';
  className?: string;
  breakpointSizes?: Partial<Record<Breakpoint, string | number>>;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = 'body1',
  className,
  breakpointSizes
}) => {
  const { breakpoint } = useResponsive();
  const theme = useTheme();

  // Get responsive font size
  const getResponsiveFontSize = (): string => {
    if (breakpointSizes) {
      const breakpointOrder: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'xs'];
      const currentIndex = breakpointOrder.indexOf(breakpoint);

      for (let i = currentIndex; i < breakpointOrder.length; i++) {
        const bp = breakpointOrder[i];
        if (breakpointSizes[bp] !== undefined) {
          const size = breakpointSizes[bp];
          return typeof size === 'number' ? `${size}rem` : size as string;
        }
      }
    }

    // Default responsive scaling
    const baseSize = theme.typography[variant].fontSize;
    const scales = {
      xs: 0.8,
      sm: 0.9,
      md: 1,
      lg: 1.1,
      xl: 1.2
    };

    if (typeof baseSize === 'string') {
      const numericSize = parseFloat(baseSize);
      return `${numericSize * scales[breakpoint]}rem`;
    }

    return String(baseSize);
  };

  return (
    <Box
      component="span"
      className={`responsive-text ${className || ''}`}
      sx={{
        fontSize: getResponsiveFontSize(),
        lineHeight: {
          xs: 1.4,
          sm: 1.5,
          md: 1.6
        },
        // Ensure good readability on all devices
        fontWeight: {
          xs: 400,
          md: theme.typography[variant].fontWeight
        }
      }}
    >
      {children}
    </Box>
  );
};

export default ResponsiveContainer;