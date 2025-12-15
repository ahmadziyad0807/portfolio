// Custom hook for responsive layout management
import { useState, useEffect } from 'react';
import { breakpoints } from '../styles/theme';
import { 
  createProfileError, 
  ProfileErrorType, 
  getSafeViewportDimensions 
} from '../utils/errorHandling';

export interface ResponsiveLayoutState {
  isMobile: boolean;
  isMobileLarge: boolean;
  isTablet: boolean;
  isTabletLarge: boolean;
  isDesktop: boolean;
  isDesktopLarge: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
}

export const useResponsiveLayout = (): ResponsiveLayoutState => {
  const [layoutState, setLayoutState] = useState<ResponsiveLayoutState>(() => {
    try {
      // Initialize with current viewport state
      const safeDimensions = getSafeViewportDimensions();
      const width = typeof window !== 'undefined' ? window.innerWidth : safeDimensions.width;
      const height = typeof window !== 'undefined' ? window.innerHeight : safeDimensions.height;
      const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
      
      // Validate breakpoint values
      const tabletBreakpoint = parseInt(breakpoints.tablet) || 768;
      const desktopBreakpoint = parseInt(breakpoints.desktop) || 1024;
      const mobileLargeBreakpoint = parseInt(breakpoints.mobileLarge) || 480;
      const tabletLargeBreakpoint = parseInt(breakpoints.tabletLarge) || 900;
      const desktopLargeBreakpoint = parseInt(breakpoints.desktopLarge) || 1440;
      
      return {
        isMobile: width < tabletBreakpoint,
        isMobileLarge: width >= mobileLargeBreakpoint && width < tabletBreakpoint,
        isTablet: width >= tabletBreakpoint && width < desktopBreakpoint,
        isTabletLarge: width >= tabletLargeBreakpoint && width < desktopBreakpoint,
        isDesktop: width >= desktopBreakpoint,
        isDesktopLarge: width >= desktopLargeBreakpoint,
        isLandscape: width > height,
        isPortrait: width <= height,
        viewportWidth: width,
        viewportHeight: height,
        devicePixelRatio: dpr,
      };
    } catch (error) {
      createProfileError(
        ProfileErrorType.RESPONSIVE_LAYOUT_ERROR,
        `Failed to initialize responsive layout: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { breakpoints }
      );
      
      // Return safe fallback state
      return {
        isMobile: false,
        isMobileLarge: false,
        isTablet: false,
        isTabletLarge: false,
        isDesktop: true,
        isDesktopLarge: false,
        isLandscape: true,
        isPortrait: false,
        viewportWidth: 1024,
        viewportHeight: 768,
        devicePixelRatio: 1,
      };
    }
  });

  useEffect(() => {
    const updateLayoutState = () => {
      try {
        const safeDimensions = getSafeViewportDimensions();
        const width = window.innerWidth || safeDimensions.width;
        const height = window.innerHeight || safeDimensions.height;
        const dpr = window.devicePixelRatio || 1;

        // Validate dimensions
        if (width <= 0 || height <= 0) {
          throw new Error(`Invalid viewport dimensions: ${width}x${height}`);
        }

        // Validate breakpoint values with fallbacks
        const tabletBreakpoint = parseInt(breakpoints.tablet) || 768;
        const desktopBreakpoint = parseInt(breakpoints.desktop) || 1024;
        const mobileLargeBreakpoint = parseInt(breakpoints.mobileLarge) || 480;
        const tabletLargeBreakpoint = parseInt(breakpoints.tabletLarge) || 900;
        const desktopLargeBreakpoint = parseInt(breakpoints.desktopLarge) || 1440;

        setLayoutState({
          isMobile: width < tabletBreakpoint,
          isMobileLarge: width >= mobileLargeBreakpoint && width < tabletBreakpoint,
          isTablet: width >= tabletBreakpoint && width < desktopBreakpoint,
          isTabletLarge: width >= tabletLargeBreakpoint && width < desktopBreakpoint,
          isDesktop: width >= desktopBreakpoint,
          isDesktopLarge: width >= desktopLargeBreakpoint,
          isLandscape: width > height,
          isPortrait: width <= height,
          viewportWidth: width,
          viewportHeight: height,
          devicePixelRatio: dpr,
        });
      } catch (error) {
        createProfileError(
          ProfileErrorType.RESPONSIVE_LAYOUT_ERROR,
          `Failed to update layout state: ${error instanceof Error ? error.message : 'Unknown error'}`,
          { currentState: layoutState }
        );
        
        // Don't update state on error - keep current state
      }
    };

    const handleOrientationChange = () => {
      // Handle orientation change with a delay to ensure viewport is updated
      setTimeout(updateLayoutState, 100);
    };

    // Debounced resize handler for performance
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateLayoutState, 150);
    };

    try {
      // Event listeners
      window.addEventListener('resize', debouncedResize);
      window.addEventListener('orientationchange', handleOrientationChange);
      
      // Modern browsers support screen.orientation
      if (window.screen?.orientation) {
        window.screen.orientation.addEventListener('change', handleOrientationChange);
      }
    } catch (error) {
      createProfileError(
        ProfileErrorType.RESPONSIVE_LAYOUT_ERROR,
        'Failed to set up responsive event listeners',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }

    return () => {
      try {
        window.removeEventListener('resize', debouncedResize);
        window.removeEventListener('orientationchange', handleOrientationChange);
        
        if (window.screen?.orientation) {
          window.screen.orientation.removeEventListener('change', handleOrientationChange);
        }
        
        clearTimeout(timeoutId);
      } catch (error) {
        // Silent cleanup error - don't propagate
        console.warn('useResponsiveLayout cleanup error:', error);
      }
    };
  }, []);

  return layoutState;
};

// Utility hook for responsive values
export const useResponsiveValue = <T>(values: {
  mobile?: T;
  mobileLarge?: T;
  tablet?: T;
  tabletLarge?: T;
  desktop?: T;
  desktopLarge?: T;
  default: T;
}): T => {
  const layout = useResponsiveLayout();

  if (layout.isDesktopLarge && values.desktopLarge !== undefined) {
    return values.desktopLarge;
  }
  if (layout.isDesktop && values.desktop !== undefined) {
    return values.desktop;
  }
  if (layout.isTabletLarge && values.tabletLarge !== undefined) {
    return values.tabletLarge;
  }
  if (layout.isTablet && values.tablet !== undefined) {
    return values.tablet;
  }
  if (layout.isMobileLarge && values.mobileLarge !== undefined) {
    return values.mobileLarge;
  }
  if (layout.isMobile && values.mobile !== undefined) {
    return values.mobile;
  }

  return values.default;
};

// Hook for responsive spacing
export const useResponsiveSpacing = (
  size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium'
) => {
  return useResponsiveValue({
    mobile: size === 'small' ? '0.5rem' : size === 'medium' ? '1rem' : size === 'large' ? '1.5rem' : '2rem',
    tablet: size === 'small' ? '0.75rem' : size === 'medium' ? '1.5rem' : size === 'large' ? '2rem' : '2.5rem',
    desktop: size === 'small' ? '1rem' : size === 'medium' ? '2rem' : size === 'large' ? '3rem' : '4rem',
    default: '1rem',
  });
};

// Hook for responsive font sizes
export const useResponsiveFontSize = (
  variant: 'small' | 'medium' | 'large' | 'xlarge' = 'medium'
) => {
  return useResponsiveValue({
    mobile: variant === 'small' ? '0.875rem' : variant === 'medium' ? '1rem' : variant === 'large' ? '1.25rem' : '1.75rem',
    tablet: variant === 'small' ? '0.875rem' : variant === 'medium' ? '1.125rem' : variant === 'large' ? '1.5rem' : '2.25rem',
    desktop: variant === 'small' ? '0.9375rem' : variant === 'medium' ? '1.125rem' : variant === 'large' ? '1.75rem' : '2.75rem',
    default: '1rem',
  });
};