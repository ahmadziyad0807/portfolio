// Test file for accessibility utilities
import {
  calculateContrastRatio,
  meetsContrastRequirement,
  generateAccessiblePalette,
  validateColorAccessibility,
  generateAccessibleId,
  touchFriendly,
  CONTRAST_RATIOS,
  TOUCH_TARGET_SIZES,
} from './accessibility';

describe('Accessibility Utilities', () => {
  describe('Color Contrast', () => {
    it('calculates contrast ratio correctly', () => {
      // Test high contrast (black on white)
      const highContrast = calculateContrastRatio('#000000', '#FFFFFF');
      expect(highContrast).toBeCloseTo(21, 1);

      // Test low contrast (light gray on white)
      const lowContrast = calculateContrastRatio('#F0F0F0', '#FFFFFF');
      expect(lowContrast).toBeLessThan(2);

      // Test medium contrast
      const mediumContrast = calculateContrastRatio('#666666', '#FFFFFF');
      expect(mediumContrast).toBeGreaterThan(4);
    });

    it('validates WCAG AA compliance', () => {
      // Should pass AA for normal text
      expect(meetsContrastRequirement('#000000', '#FFFFFF', 'AA', false)).toBe(true);
      expect(meetsContrastRequirement('#666666', '#FFFFFF', 'AA', false)).toBe(true);
      
      // Should fail AA for normal text
      expect(meetsContrastRequirement('#CCCCCC', '#FFFFFF', 'AA', false)).toBe(false);
      
      // Should pass AA for large text with lower contrast
      expect(meetsContrastRequirement('#777777', '#FFFFFF', 'AA', true)).toBe(true);
    });

    it('generates accessible color palette', () => {
      const palette = generateAccessiblePalette('#3B82F6', '#FFFFFF');
      
      expect(palette).toHaveProperty('primary');
      expect(palette).toHaveProperty('secondary');
      expect(palette).toHaveProperty('light');
      expect(palette).toHaveProperty('dark');
      
      // Primary should meet AA contrast
      expect(meetsContrastRequirement(palette.primary, '#FFFFFF', 'AA', false)).toBe(true);
    });

    it('validates theme color accessibility', () => {
      const goodTheme = {
        colors: {
          primary: '#2563EB',
          secondary: '#7C3AED',
          accent: '#0891B2',
          background: '#FFFFFF',
          text: '#111827',
          textSecondary: '#4B5563',
        },
      };

      const validation = validateColorAccessibility(goodTheme);
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);

      const badTheme = {
        colors: {
          primary: '#3B82F6',
          secondary: '#8B5CF6',
          accent: '#06B6D4',
          background: '#FFFFFF',
          text: '#CCCCCC', // Too light
          textSecondary: '#E5E7EB', // Too light
        },
      };

      const badValidation = validateColorAccessibility(badTheme);
      expect(badValidation.isValid).toBe(false);
      expect(badValidation.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Touch Targets', () => {
    it('provides correct touch target sizes', () => {
      expect(TOUCH_TARGET_SIZES.MINIMUM).toBe(44);
      expect(TOUCH_TARGET_SIZES.RECOMMENDED).toBe(48);
    });

    it('ensures minimum touch target size', () => {
      const sizing = touchFriendly.ensureMinimumSize(30, 30);
      expect(sizing.minWidth).toBe('44px');
      expect(sizing.minHeight).toBe('44px');

      const largeSizing = touchFriendly.ensureMinimumSize(60, 60);
      expect(largeSizing.minWidth).toBe('60px');
      expect(largeSizing.minHeight).toBe('60px');
    });
  });

  describe('ID Generation', () => {
    it('generates unique accessible IDs', () => {
      const id1 = generateAccessibleId('test');
      const id2 = generateAccessibleId('test');
      
      expect(id1).toMatch(/^test-[a-z0-9]+$/);
      expect(id2).toMatch(/^test-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('uses default prefix when none provided', () => {
      const id = generateAccessibleId();
      expect(id).toMatch(/^a11y-[a-z0-9]+$/);
    });
  });

  describe('Constants', () => {
    it('provides correct WCAG contrast ratios', () => {
      expect(CONTRAST_RATIOS.AA_NORMAL).toBe(4.5);
      expect(CONTRAST_RATIOS.AA_LARGE).toBe(3);
      expect(CONTRAST_RATIOS.AAA_NORMAL).toBe(7);
      expect(CONTRAST_RATIOS.AAA_LARGE).toBe(4.5);
    });
  });
});