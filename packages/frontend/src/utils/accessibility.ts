// Accessibility utilities and helpers for the profile section
import { useEffect, useRef, useState } from 'react';

// WCAG AA color contrast ratios
export const CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
} as const;

// Touch target minimum sizes (WCAG 2.1 AA)
export const TOUCH_TARGET_SIZES = {
  MINIMUM: 44, // 44px minimum for touch targets
  RECOMMENDED: 48, // 48px recommended for better usability
} as const;

// Keyboard navigation keys
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;

// ARIA live region politeness levels
export const ARIA_LIVE = {
  OFF: 'off',
  POLITE: 'polite',
  ASSERTIVE: 'assertive',
} as const;

/**
 * Calculate color contrast ratio between two colors
 * @param color1 - First color (hex format)
 * @param color2 - Second color (hex format)
 * @returns Contrast ratio (1-21)
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Remove # if present
    const hex = color.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Calculate relative luminance
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG contrast requirements
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param level - WCAG level ('AA' | 'AAA')
 * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns Whether the combination meets requirements
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = calculateContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return ratio >= (isLargeText ? CONTRAST_RATIOS.AAA_LARGE : CONTRAST_RATIOS.AAA_NORMAL);
  }
  
  return ratio >= (isLargeText ? CONTRAST_RATIOS.AA_LARGE : CONTRAST_RATIOS.AA_NORMAL);
}

/**
 * Generate accessible color palette with proper contrast ratios
 * @param baseColor - Base color to generate palette from
 * @param backgroundColor - Background color to test against
 * @returns Object with accessible color variations
 */
export function generateAccessiblePalette(baseColor: string, backgroundColor: string = '#FFFFFF') {
  const darkenColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const lightenColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Find accessible variations
  let accessiblePrimary = baseColor;
  let accessibleSecondary = baseColor;
  
  // Darken until we meet AA contrast
  for (let i = 0; i < 100; i += 10) {
    const darkened = darkenColor(baseColor, i);
    if (meetsContrastRequirement(darkened, backgroundColor, 'AA', false)) {
      accessiblePrimary = darkened;
      break;
    }
  }
  
  // Create secondary color with lighter contrast for large text
  for (let i = 0; i < 80; i += 10) {
    const darkened = darkenColor(baseColor, i);
    if (meetsContrastRequirement(darkened, backgroundColor, 'AA', true)) {
      accessibleSecondary = darkened;
      break;
    }
  }

  return {
    primary: accessiblePrimary,
    secondary: accessibleSecondary,
    light: lightenColor(baseColor, 40),
    dark: darkenColor(baseColor, 60),
  };
}

/**
 * Hook for managing focus trap within a container
 * @param isActive - Whether the focus trap should be active
 * @returns Ref to attach to the container element
 */
export function useFocusTrap<T extends HTMLElement>(isActive: boolean) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== KEYBOARD_KEYS.TAB) return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element when trap becomes active
    firstElement?.focus();

    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for managing keyboard navigation
 * @param onEnter - Callback for Enter key
 * @param onSpace - Callback for Space key
 * @param onEscape - Callback for Escape key
 * @returns Event handler for keydown events
 */
export function useKeyboardNavigation(
  onEnter?: () => void,
  onSpace?: () => void,
  onEscape?: () => void
) {
  return (event: React.KeyboardEvent) => {
    switch (event.key) {
      case KEYBOARD_KEYS.ENTER:
        event.preventDefault();
        onEnter?.();
        break;
      case KEYBOARD_KEYS.SPACE:
        event.preventDefault();
        onSpace?.();
        break;
      case KEYBOARD_KEYS.ESCAPE:
        event.preventDefault();
        onEscape?.();
        break;
    }
  };
}

/**
 * Hook for managing reduced motion preferences
 * @returns Whether user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if we're in a test environment or if matchMedia is not available
    if (typeof window === 'undefined' || !window.matchMedia || process.env.NODE_ENV === 'test') {
      setPrefersReducedMotion(false);
      return;
    }

    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (event: MediaQueryListEvent) => {
        setPrefersReducedMotion(event.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } catch (error) {
      // Fallback for environments where matchMedia is not supported
      console.warn('matchMedia not supported, defaulting to no reduced motion preference');
      setPrefersReducedMotion(false);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook for managing screen reader announcements
 * @returns Function to announce messages to screen readers
 */
export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(''); // Clear first to ensure re-announcement
    setTimeout(() => {
      setAnnouncement(message);
    }, 100);
  };

  return { announcement, announce };
}

/**
 * Generate unique ID for accessibility attributes
 * @param prefix - Prefix for the ID
 * @returns Unique ID string
 */
export function generateAccessibleId(prefix: string = 'a11y'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if element is visible to screen readers
 * @param element - Element to check
 * @returns Whether element is accessible to screen readers
 */
export function isAccessibleToScreenReaders(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  
  return !(
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0' ||
    element.hasAttribute('aria-hidden') ||
    element.getAttribute('aria-hidden') === 'true'
  );
}

/**
 * Get accessible name for an element
 * @param element - Element to get name for
 * @returns Accessible name string
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label first
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) return labelElement.textContent || '';
  }

  // Check associated label
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
    const id = element.getAttribute('id');
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent || '';
    }
  }

  // Fall back to text content
  return element.textContent || '';
}

/**
 * Validate accessibility of a color theme
 * @param theme - Color theme object
 * @returns Validation results with suggestions
 */
export function validateColorAccessibility(theme: {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textSecondary: string;
  };
}) {
  const results = {
    isValid: true,
    issues: [] as string[],
    suggestions: [] as string[],
  };

  // Check primary text contrast
  const primaryTextContrast = calculateContrastRatio(theme.colors.text, theme.colors.background);
  if (primaryTextContrast < CONTRAST_RATIOS.AA_NORMAL) {
    results.isValid = false;
    results.issues.push(`Primary text contrast ratio (${primaryTextContrast.toFixed(2)}) does not meet WCAG AA standards (${CONTRAST_RATIOS.AA_NORMAL})`);
    results.suggestions.push('Darken the text color or lighten the background color');
  }

  // Check secondary text contrast
  const secondaryTextContrast = calculateContrastRatio(theme.colors.textSecondary, theme.colors.background);
  if (secondaryTextContrast < CONTRAST_RATIOS.AA_LARGE) {
    results.isValid = false;
    results.issues.push(`Secondary text contrast ratio (${secondaryTextContrast.toFixed(2)}) does not meet WCAG AA standards for large text (${CONTRAST_RATIOS.AA_LARGE})`);
    results.suggestions.push('Darken the secondary text color');
  }

  // Check primary color contrast
  const primaryColorContrast = calculateContrastRatio(theme.colors.primary, theme.colors.background);
  if (primaryColorContrast < CONTRAST_RATIOS.AA_NORMAL) {
    results.issues.push(`Primary color contrast ratio (${primaryColorContrast.toFixed(2)}) may not be sufficient for text elements`);
    results.suggestions.push('Consider using a darker shade of the primary color for text elements');
  }

  return results;
}

/**
 * Create accessible focus styles
 * @param accentColor - Accent color for focus indicators
 * @returns CSS-in-JS object for focus styles
 */
export function createAccessibleFocusStyles(accentColor: string) {
  return {
    outline: `2px solid ${accentColor}`,
    outlineOffset: '2px',
    borderRadius: '4px',
  };
}

/**
 * Touch-friendly sizing utilities
 */
export const touchFriendly = {
  minTouchTarget: `${TOUCH_TARGET_SIZES.MINIMUM}px`,
  recommendedTouchTarget: `${TOUCH_TARGET_SIZES.RECOMMENDED}px`,
  
  // Ensure element meets minimum touch target size
  ensureMinimumSize: (width?: number, height?: number) => ({
    minWidth: `${Math.max(width || TOUCH_TARGET_SIZES.MINIMUM, TOUCH_TARGET_SIZES.MINIMUM)}px`,
    minHeight: `${Math.max(height || TOUCH_TARGET_SIZES.MINIMUM, TOUCH_TARGET_SIZES.MINIMUM)}px`,
  }),
};

/**
 * Screen reader only styles (visually hidden but accessible)
 */
export const srOnly = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden' as const,
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  border: '0',
};