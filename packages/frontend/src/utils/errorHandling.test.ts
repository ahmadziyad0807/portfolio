// Tests for error handling utilities
import {
  validateProfileData,
  validateExtendedProfileData,
  validateProfileStyling,
  getSafeViewportDimensions,
  createProfileError,
  ProfileErrorType,
} from './errorHandling';
import { ProfileStyling } from '../types/profile';
import { defaultTheme } from '../styles/theme';

describe('Error Handling Utilities', () => {
  describe('validateProfileData', () => {
    it('validates complete profile data successfully', () => {
      const validProfile = {
        id: 'test-1',
        name: 'John Doe',
        title: 'Developer',
        description: 'A great developer',
        image: {
          src: 'https://example.com/image.jpg',
          alt: 'John Doe',
        },
      };

      const result = validateProfileData(validProfile);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitizedData.name).toBe('John Doe');
    });

    it('handles missing required fields with fallbacks', () => {
      const incompleteProfile = {
        id: 'test-2',
      };

      const result = validateProfileData(incompleteProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.sanitizedData.name).toBe('Unknown User');
      expect(result.sanitizedData.title).toBe('Professional');
      expect(result.sanitizedData.description).toBe('No description available.');
    });

    it('sanitizes and validates email addresses', () => {
      const profileWithInvalidEmail = {
        id: 'test-3',
        name: 'Jane Doe',
        title: 'Designer',
        description: 'A great designer',
        image: { src: 'test.jpg', alt: 'Jane' },
        contact: {
          email: 'invalid-email',
        },
      };

      const result = validateProfileData(profileWithInvalidEmail);
      
      expect(result.errors).toContain('Invalid email format');
      expect(result.sanitizedData.contact?.email).toBeUndefined();
    });

    it('validates social media URLs', () => {
      const profileWithInvalidURL = {
        id: 'test-4',
        name: 'Bob Smith',
        title: 'Manager',
        description: 'A great manager',
        image: { src: 'test.jpg', alt: 'Bob' },
        social: {
          linkedin: 'not-a-url',
        },
      };

      const result = validateProfileData(profileWithInvalidURL);
      
      expect(result.errors).toContain('Invalid LinkedIn URL format');
      expect(result.sanitizedData.social?.linkedin).toBeUndefined();
    });
  });

  describe('validateExtendedProfileData', () => {
    it('validates extended profile data with arrays', () => {
      const extendedProfile = {
        id: 'test-5',
        name: 'Alice Johnson',
        title: 'Senior Developer',
        description: 'Experienced developer',
        image: { src: 'alice.jpg', alt: 'Alice' },
        experience: [
          {
            id: 'exp-1',
            company: 'Tech Corp',
            position: 'Developer',
            duration: '2020-2023',
            description: 'Built great software',
          },
        ],
        skills: [
          {
            category: 'Frontend',
            skills: ['React', 'TypeScript'],
            proficiency: 'advanced' as const,
          },
        ],
        projects: [],
        education: [],
        achievements: [],
      };

      const result = validateExtendedProfileData(extendedProfile);
      
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData.experience).toHaveLength(1);
      expect(result.sanitizedData.skills).toHaveLength(1);
      expect(result.sanitizedData.skills[0].proficiency).toBe('advanced');
    });

    it('handles invalid proficiency levels with fallbacks', () => {
      const profileWithInvalidProficiency = {
        id: 'test-6',
        name: 'Charlie Brown',
        title: 'Developer',
        description: 'Learning developer',
        image: { src: 'charlie.jpg', alt: 'Charlie' },
        experience: [],
        skills: [
          {
            category: 'Backend',
            skills: ['Node.js'],
            proficiency: 'invalid-level' as any,
          },
        ],
        projects: [],
        education: [],
        achievements: [],
      };

      const result = validateExtendedProfileData(profileWithInvalidProficiency);
      
      expect(result.sanitizedData.skills[0].proficiency).toBe('intermediate');
    });
  });

  describe('validateProfileStyling', () => {
    it('returns default theme for invalid styling', () => {
      const invalidStyling = null as any;
      
      const result = validateProfileStyling(invalidStyling);
      
      expect(result).toEqual(defaultTheme);
    });

    it('fills missing properties with defaults', () => {
      const partialStyling = {
        colors: {
          primary: '#custom-primary',
        },
      } as Partial<ProfileStyling>;
      
      const result = validateProfileStyling(partialStyling);
      
      expect(result.colors.primary).toBe('#custom-primary');
      expect(result.colors.secondary).toBe(defaultTheme.colors.secondary);
      expect(result.typography).toEqual(defaultTheme.typography);
    });
  });

  describe('getSafeViewportDimensions', () => {
    it('returns safe fallback dimensions', () => {
      const dimensions = getSafeViewportDimensions();
      
      expect(dimensions.width).toBeGreaterThan(0);
      expect(dimensions.height).toBeGreaterThan(0);
      expect(typeof dimensions.width).toBe('number');
      expect(typeof dimensions.height).toBe('number');
    });
  });

  describe('createProfileError', () => {
    it('creates error with proper structure', () => {
      const error = createProfileError(
        ProfileErrorType.IMAGE_LOAD_ERROR,
        'Test error message',
        { testContext: 'value' }
      );
      
      expect(error.type).toBe(ProfileErrorType.IMAGE_LOAD_ERROR);
      expect(error.message).toBe('Test error message');
      expect(error.context).toEqual({ testContext: 'value' });
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('creates error without context', () => {
      const error = createProfileError(
        ProfileErrorType.DATA_VALIDATION_ERROR,
        'Validation failed'
      );
      
      expect(error.type).toBe(ProfileErrorType.DATA_VALIDATION_ERROR);
      expect(error.message).toBe('Validation failed');
      expect(error.context).toBeUndefined();
    });
  });
});