// Error handling utilities for profile section components
import React from 'react';
import { ProfileData, ExtendedProfileData, ProfileStyling } from '../types/profile';
import { defaultTheme } from '../styles/theme';

// Error types for profile section
export enum ProfileErrorType {
  IMAGE_LOAD_ERROR = 'IMAGE_LOAD_ERROR',
  DATA_VALIDATION_ERROR = 'DATA_VALIDATION_ERROR',
  MODAL_INTERACTION_ERROR = 'MODAL_INTERACTION_ERROR',
  RESPONSIVE_LAYOUT_ERROR = 'RESPONSIVE_LAYOUT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ProfileError {
  type: ProfileErrorType;
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
}

// Error logging utility
export const logProfileError = (error: ProfileError): void => {
  console.error('[ProfileSection Error]', {
    type: error.type,
    message: error.message,
    context: error.context,
    timestamp: error.timestamp.toISOString(),
  });

  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: sendToErrorTrackingService(error);
  }
};

// Create error utility
export const createProfileError = (
  type: ProfileErrorType,
  message: string,
  context?: Record<string, any>
): ProfileError => {
  const error: ProfileError = {
    type,
    message,
    context,
    timestamp: new Date(),
  };
  
  logProfileError(error);
  return error;
};

// Data validation utilities
export const validateProfileData = (profile: Partial<ProfileData>): {
  isValid: boolean;
  errors: string[];
  sanitizedData: ProfileData;
} => {
  const errors: string[] = [];
  
  // Create sanitized data with defaults
  const sanitizedData: ProfileData = {
    id: profile.id || `profile-${Date.now()}`,
    name: '',
    title: '',
    description: '',
    image: {
      src: '',
      alt: '',
    },
    contact: {},
    social: {},
  };

  // Validate required fields
  if (!profile.name || typeof profile.name !== 'string' || profile.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
    sanitizedData.name = 'Unknown User';
  } else {
    sanitizedData.name = profile.name.trim();
  }

  if (!profile.title || typeof profile.title !== 'string' || profile.title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
    sanitizedData.title = 'Professional';
  } else {
    sanitizedData.title = profile.title.trim();
  }

  if (!profile.description || typeof profile.description !== 'string' || profile.description.trim().length === 0) {
    errors.push('Description is required and must be a non-empty string');
    sanitizedData.description = 'No description available.';
  } else {
    sanitizedData.description = profile.description.trim();
  }

  // Validate image data
  if (!profile.image || !profile.image.src || typeof profile.image.src !== 'string') {
    errors.push('Image source is required and must be a valid string');
    sanitizedData.image = {
      src: '/default-avatar.png', // Fallback image
      alt: `${sanitizedData.name} profile picture`,
    };
  } else {
    sanitizedData.image = {
      src: profile.image.src.trim(),
      alt: profile.image.alt || `${sanitizedData.name} profile picture`,
      width: profile.image.width,
      height: profile.image.height,
    };
  }

  // Validate optional contact information
  if (profile.contact) {
    sanitizedData.contact = {};
    
    if (profile.contact.email && typeof profile.contact.email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(profile.contact.email)) {
        sanitizedData.contact.email = profile.contact.email.trim();
      } else {
        errors.push('Invalid email format');
      }
    }
    
    if (profile.contact.phone && typeof profile.contact.phone === 'string') {
      sanitizedData.contact.phone = profile.contact.phone.trim();
    }
    
    if (profile.contact.location && typeof profile.contact.location === 'string') {
      sanitizedData.contact.location = profile.contact.location.trim();
    }
  }

  // Validate optional social links
  if (profile.social) {
    sanitizedData.social = {};
    
    const urlRegex = /^https?:\/\/.+/;
    
    if (profile.social.linkedin && typeof profile.social.linkedin === 'string') {
      if (urlRegex.test(profile.social.linkedin)) {
        sanitizedData.social.linkedin = profile.social.linkedin.trim();
      } else {
        errors.push('Invalid LinkedIn URL format');
      }
    }
    
    if (profile.social.github && typeof profile.social.github === 'string') {
      if (urlRegex.test(profile.social.github)) {
        sanitizedData.social.github = profile.social.github.trim();
      } else {
        errors.push('Invalid GitHub URL format');
      }
    }
    
    if (profile.social.twitter && typeof profile.social.twitter === 'string') {
      if (urlRegex.test(profile.social.twitter)) {
        sanitizedData.social.twitter = profile.social.twitter.trim();
      } else {
        errors.push('Invalid Twitter URL format');
      }
    }
    
    if (profile.social.website && typeof profile.social.website === 'string') {
      if (urlRegex.test(profile.social.website)) {
        sanitizedData.social.website = profile.social.website.trim();
      } else {
        errors.push('Invalid website URL format');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData,
  };
};

// Extended profile data validation
export const validateExtendedProfileData = (profile: Partial<ExtendedProfileData>): {
  isValid: boolean;
  errors: string[];
  sanitizedData: ExtendedProfileData;
} => {
  const baseValidation = validateProfileData(profile);
  const errors = [...baseValidation.errors];
  
  const sanitizedData: ExtendedProfileData = {
    ...baseValidation.sanitizedData,
    experience: [],
    skills: [],
    projects: [],
    education: [],
    achievements: [],
  };

  // Validate experience array
  if (profile.experience && Array.isArray(profile.experience)) {
    sanitizedData.experience = profile.experience
      .filter(exp => exp && typeof exp === 'object')
      .map((exp, index) => ({
        id: exp.id || `exp-${index}`,
        company: exp.company || 'Unknown Company',
        position: exp.position || 'Unknown Position',
        duration: exp.duration || 'Unknown Duration',
        description: exp.description || 'No description available.',
        technologies: Array.isArray(exp.technologies) ? exp.technologies.filter(tech => typeof tech === 'string') : [],
      }));
  }

  // Validate skills array
  if (profile.skills && Array.isArray(profile.skills)) {
    sanitizedData.skills = profile.skills
      .filter(skill => skill && typeof skill === 'object')
      .map((skill, index) => ({
        category: skill.category || `Category ${index + 1}`,
        skills: Array.isArray(skill.skills) ? skill.skills.filter(s => typeof s === 'string') : [],
        proficiency: (skill.proficiency && ['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.proficiency)) 
          ? skill.proficiency 
          : 'intermediate',
      }));
  }

  // Validate projects array
  if (profile.projects && Array.isArray(profile.projects)) {
    sanitizedData.projects = profile.projects
      .filter(project => project && typeof project === 'object')
      .map((project, index) => ({
        id: project.id || `proj-${index}`,
        name: project.name || `Project ${index + 1}`,
        description: project.description || 'No description available.',
        technologies: Array.isArray(project.technologies) ? project.technologies.filter(tech => typeof tech === 'string') : [],
        link: project.link && typeof project.link === 'string' ? project.link : undefined,
        image: project.image && typeof project.image === 'string' ? project.image : undefined,
      }));
  }

  // Validate education array
  if (profile.education && Array.isArray(profile.education)) {
    sanitizedData.education = profile.education
      .filter(edu => edu && typeof edu === 'object')
      .map((edu, index) => ({
        id: edu.id || `edu-${index}`,
        institution: edu.institution || 'Unknown Institution',
        degree: edu.degree || 'Unknown Degree',
        field: edu.field || 'Unknown Field',
        duration: edu.duration || 'Unknown Duration',
        description: edu.description || undefined,
      }));
  }

  // Validate achievements array
  if (profile.achievements && Array.isArray(profile.achievements)) {
    sanitizedData.achievements = profile.achievements
      .filter(achievement => achievement && typeof achievement === 'object')
      .map((achievement, index) => ({
        id: achievement.id || `ach-${index}`,
        title: achievement.title || `Achievement ${index + 1}`,
        description: achievement.description || 'No description available.',
        date: achievement.date || 'Unknown Date',
        category: achievement.category || undefined,
      }));
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData,
  };
};

// Styling validation with fallbacks
export const validateProfileStyling = (styling?: Partial<ProfileStyling>): ProfileStyling => {
  if (!styling || typeof styling !== 'object') {
    return defaultTheme;
  }

  return {
    colors: {
      primary: styling.colors?.primary || defaultTheme.colors.primary,
      secondary: styling.colors?.secondary || defaultTheme.colors.secondary,
      accent: styling.colors?.accent || defaultTheme.colors.accent,
      background: styling.colors?.background || defaultTheme.colors.background,
      text: styling.colors?.text || defaultTheme.colors.text,
      textSecondary: styling.colors?.textSecondary || defaultTheme.colors.textSecondary,
    },
    gradients: {
      primary: styling.gradients?.primary || defaultTheme.gradients.primary,
      secondary: styling.gradients?.secondary || defaultTheme.gradients.secondary,
      background: styling.gradients?.background || defaultTheme.gradients.background,
    },
    typography: {
      fontFamily: styling.typography?.fontFamily || defaultTheme.typography.fontFamily,
      headingFont: styling.typography?.headingFont || defaultTheme.typography.headingFont,
      fontSize: {
        small: styling.typography?.fontSize?.small || defaultTheme.typography.fontSize.small,
        medium: styling.typography?.fontSize?.medium || defaultTheme.typography.fontSize.medium,
        large: styling.typography?.fontSize?.large || defaultTheme.typography.fontSize.large,
        xlarge: styling.typography?.fontSize?.xlarge || defaultTheme.typography.fontSize.xlarge,
      },
    },
    spacing: {
      small: styling.spacing?.small || defaultTheme.spacing.small,
      medium: styling.spacing?.medium || defaultTheme.spacing.medium,
      large: styling.spacing?.large || defaultTheme.spacing.large,
      xlarge: styling.spacing?.xlarge || defaultTheme.spacing.xlarge,
    },
    borderRadius: styling.borderRadius || defaultTheme.borderRadius,
    shadows: {
      small: styling.shadows?.small || defaultTheme.shadows.small,
      medium: styling.shadows?.medium || defaultTheme.shadows.medium,
      large: styling.shadows?.large || defaultTheme.shadows.large,
    },
  };
};

// Image loading error handling
export const handleImageError = (
  src: string,
  onError?: (error: ProfileError) => void
): string => {
  const error = createProfileError(
    ProfileErrorType.IMAGE_LOAD_ERROR,
    `Failed to load image: ${src}`,
    { originalSrc: src }
  );
  
  onError?.(error);
  
  // Return fallback image URL
  return '/default-avatar.png';
};

// Modal interaction error recovery
export const handleModalError = (
  error: Error,
  onError?: (error: ProfileError) => void
): void => {
  const profileError = createProfileError(
    ProfileErrorType.MODAL_INTERACTION_ERROR,
    `Modal interaction failed: ${error.message}`,
    { originalError: error.message, stack: error.stack }
  );
  
  onError?.(profileError);
};

// Responsive layout error handling
export const handleResponsiveLayoutError = (
  error: Error,
  fallbackDimensions: { width: number; height: number },
  onError?: (error: ProfileError) => void
): { width: number; height: number } => {
  const profileError = createProfileError(
    ProfileErrorType.RESPONSIVE_LAYOUT_ERROR,
    `Responsive layout calculation failed: ${error.message}`,
    { originalError: error.message, fallbackDimensions }
  );
  
  onError?.(profileError);
  
  return fallbackDimensions;
};

// Safe viewport dimensions getter
export const getSafeViewportDimensions = (): { width: number; height: number } => {
  try {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 }; // SSR fallback
    }
    
    return {
      width: window.innerWidth || document.documentElement.clientWidth || 1024,
      height: window.innerHeight || document.documentElement.clientHeight || 768,
    };
  } catch (error) {
    createProfileError(
      ProfileErrorType.RESPONSIVE_LAYOUT_ERROR,
      'Failed to get viewport dimensions',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
    
    return { width: 1024, height: 768 };
  }
};

// Network error handling for external resources
export const handleNetworkError = (
  url: string,
  error: Error,
  onError?: (error: ProfileError) => void
): void => {
  const profileError = createProfileError(
    ProfileErrorType.NETWORK_ERROR,
    `Network request failed for: ${url}`,
    { url, originalError: error.message }
  );
  
  onError?.(profileError);
};

// Generic error boundary utility
export const withErrorBoundary = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  fallbackComponent?: React.ComponentType<{ error: ProfileError }>
) => {
  return (props: T) => {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      const profileError = createProfileError(
        ProfileErrorType.UNKNOWN_ERROR,
        `Component render failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { componentName: Component.name || 'Unknown', props }
      );
      
      if (fallbackComponent) {
        return React.createElement(fallbackComponent, { error: profileError });
      }
      
      return React.createElement('div', {
        style: { 
          padding: '1rem', 
          background: '#fee2e2', 
          color: '#dc2626', 
          borderRadius: '0.5rem',
          border: '1px solid #fecaca'
        }
      }, 'Something went wrong. Please try again.');
    }
  };
};