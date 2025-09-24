import { useState, useEffect, useCallback } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Orientation = 'portrait' | 'landscape';

interface ScreenInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  pixelRatio: number;
}

interface UseResponsiveReturn extends ScreenInfo {
  isBreakpoint: (bp: Breakpoint) => boolean;
  isBreakpointUp: (bp: Breakpoint) => boolean;
  isBreakpointDown: (bp: Breakpoint) => boolean;
  isBreakpointBetween: (start: Breakpoint, end: Breakpoint) => boolean;
}

// Breakpoint values (matching Material-UI default breakpoints)
const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536
};

const getBreakpoint = (width: number): Breakpoint => {
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

const getOrientation = (width: number, height: number): Orientation => {
  return width > height ? 'landscape' : 'portrait';
};

const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const useResponsive = (): UseResponsiveReturn => {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1200,
        height: 800,
        breakpoint: 'lg',
        orientation: 'landscape',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        pixelRatio: 1
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getBreakpoint(width);
    const orientation = getOrientation(width, height);
    const isMobile = breakpoint === 'xs' || (breakpoint === 'sm' && isTouchDevice());
    const isTablet = breakpoint === 'sm' || breakpoint === 'md';
    const isDesktop = breakpoint === 'lg' || breakpoint === 'xl';
    const touchDevice = isTouchDevice();
    const pixelRatio = window.devicePixelRatio || 1;

    return {
      width,
      height,
      breakpoint,
      orientation,
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice: touchDevice,
      pixelRatio
    };
  });

  const updateScreenInfo = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getBreakpoint(width);
    const orientation = getOrientation(width, height);
    const isMobile = breakpoint === 'xs' || (breakpoint === 'sm' && isTouchDevice());
    const isTablet = breakpoint === 'sm' || breakpoint === 'md';
    const isDesktop = breakpoint === 'lg' || breakpoint === 'xl';
    const touchDevice = isTouchDevice();
    const pixelRatio = window.devicePixelRatio || 1;

    setScreenInfo({
      width,
      height,
      breakpoint,
      orientation,
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice: touchDevice,
      pixelRatio
    });
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScreenInfo, 100); // Debounce resize events
    };

    const handleOrientationChange = () => {
      // Add small delay for orientation change to complete
      setTimeout(updateScreenInfo, 200);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Initial update
    updateScreenInfo();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      clearTimeout(timeoutId);
    };
  }, [updateScreenInfo]);

  const isBreakpoint = useCallback((bp: Breakpoint): boolean => {
    return screenInfo.breakpoint === bp;
  }, [screenInfo.breakpoint]);

  const isBreakpointUp = useCallback((bp: Breakpoint): boolean => {
    return screenInfo.width >= breakpoints[bp];
  }, [screenInfo.width]);

  const isBreakpointDown = useCallback((bp: Breakpoint): boolean => {
    const nextBreakpoint = {
      xs: 'sm',
      sm: 'md',
      md: 'lg',
      lg: 'xl',
      xl: 'xl'
    } as const;

    const nextBp = nextBreakpoint[bp];
    return screenInfo.width < breakpoints[nextBp];
  }, [screenInfo.width]);

  const isBreakpointBetween = useCallback((start: Breakpoint, end: Breakpoint): boolean => {
    return screenInfo.width >= breakpoints[start] && screenInfo.width < breakpoints[end];
  }, [screenInfo.width]);

  return {
    ...screenInfo,
    isBreakpoint,
    isBreakpointUp,
    isBreakpointDown,
    isBreakpointBetween
  };
};

// Hook for detecting if device is mobile
export const useIsMobile = (): boolean => {
  const { isMobile } = useResponsive();
  return isMobile;
};

// Hook for detecting touch device
export const useIsTouchDevice = (): boolean => {
  const { isTouchDevice } = useResponsive();
  return isTouchDevice;
};

// Hook for getting current breakpoint
export const useBreakpoint = (): Breakpoint => {
  const { breakpoint } = useResponsive();
  return breakpoint;
};

// Hook for responsive values
export const useResponsiveValue = <T>(values: Partial<Record<Breakpoint, T>>, fallback: T): T => {
  const { breakpoint } = useResponsive();

  // Try to get value for current breakpoint, fallback to smaller breakpoints
  const breakpointOrder: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp] as T;
    }
  }

  return fallback;
};

// Hook for screen orientation
export const useOrientation = (): {
  orientation: Orientation;
  isPortrait: boolean;
  isLandscape: boolean;
} => {
  const { orientation } = useResponsive();

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  };
};

// Hook for safe area insets (for devices with notches)
export const useSafeArea = (): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);

      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0,
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0,
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0
      });
    };

    updateSafeArea();

    // Update on orientation change
    window.addEventListener('orientationchange', updateSafeArea);
    return () => window.removeEventListener('orientationchange', updateSafeArea);
  }, []);

  return safeArea;
};

// Utility function to get responsive font size
export const getResponsiveFontSize = (
  baseSize: number,
  breakpoint: Breakpoint,
  scaleFactor: number = 0.8
): number => {
  const scales = {
    xs: scaleFactor,
    sm: scaleFactor + 0.1,
    md: 1,
    lg: 1.1,
    xl: 1.2
  };

  return baseSize * scales[breakpoint];
};

// Utility function to get responsive spacing
export const getResponsiveSpacing = (
  baseSpacing: number,
  breakpoint: Breakpoint
): number => {
  const scales = {
    xs: 0.5,
    sm: 0.7,
    md: 1,
    lg: 1.2,
    xl: 1.4
  };

  return baseSpacing * scales[breakpoint];
};