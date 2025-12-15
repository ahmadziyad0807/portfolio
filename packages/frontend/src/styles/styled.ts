// Styled-components utilities and base components
import styled, { css, createGlobalStyle } from 'styled-components';
import { ProfileStyling } from '../types/profile';
import { 
  media, 
  animations, 
  zIndex, 
  responsiveSpacing, 
  responsiveTypography, 
  layoutUtils, 
  responsiveTransitions 
} from './theme';

// Global styles for the profile section
export const ProfileGlobalStyles = createGlobalStyle<{ theme: ProfileStyling }>`
  /* Ensure smooth scrolling and proper box-sizing */
  * {
    box-sizing: border-box;
  }

  /* Custom scrollbar for modal content */
  .profile-modal-content::-webkit-scrollbar {
    width: 6px;
  }

  .profile-modal-content::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
    border-radius: ${props => props.theme.borderRadius};
  }

  .profile-modal-content::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.textSecondary};
    border-radius: ${props => props.theme.borderRadius};
  }

  .profile-modal-content::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.text};
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
    
    /* Disable Framer Motion animations */
    [data-framer-motion] {
      transform: none !important;
      animation: none !important;
    }
  }

  /* Enhanced focus management for accessibility */
  .profile-section:focus-within {
    outline: 2px solid ${props => props.theme.colors.accent};
    outline-offset: 2px;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    * {
      border-color: currentColor !important;
    }
    
    button, [role="button"] {
      border: 2px solid !important;
    }
  }

  /* Ensure sufficient color contrast in forced colors mode */
  @media (forced-colors: active) {
    * {
      forced-color-adjust: auto;
    }
    
    .profile-card, .modal-content {
      border: 1px solid;
    }
  }

  /* Focus indicators for keyboard navigation */
  *:focus-visible {
    outline: 2px solid ${props => props.theme.colors.accent};
    outline-offset: 2px;
    border-radius: 4px;
  }

  /* Skip links styling */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: ${props => props.theme.colors.primary};
    color: white;
    padding: 8px 16px;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 600;
    z-index: 9999;
    transition: top 0.2s ease;
  }

  .skip-link:focus {
    top: 6px;
  }
`;

// Base container for the profile section with enhanced responsive design
export const ProfileContainer = styled.div<{ theme: ProfileStyling }>`
  position: relative;
  width: 100%;
  height: 25vh;
  min-height: 200px;
  max-height: 400px;
  margin-top: 4rem;
  padding: ${responsiveSpacing.containerPadding.mobile};
  background: ${props => props.theme.gradients.background};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${zIndex.base};
  transition: ${responsiveTransitions.layout};
  
  /* Mobile optimizations */
  ${media.mobileOnly} {
    min-height: 180px;
    max-height: 300px;
    margin-top: 3rem;
    padding: ${responsiveSpacing.containerPadding.mobile};
  }

  /* Mobile landscape adjustments */
  ${media.mobileLandscape} {
    height: 40vh;
    min-height: 160px;
    max-height: 250px;
    margin-top: 2rem;
  }

  /* Mobile portrait adjustments */
  ${media.mobilePortrait} {
    height: 25vh;
    min-height: 200px;
  }

  /* Tablet responsive design */
  ${media.tablet} {
    margin-top: 3rem;
    padding: ${responsiveSpacing.containerPadding.tablet};
    min-height: 220px;
    max-height: 350px;
  }

  /* Tablet landscape optimizations */
  ${media.tabletLandscape} {
    height: 30vh;
    min-height: 200px;
    max-height: 320px;
  }

  /* Desktop and larger screens */
  ${media.desktop} {
    margin-top: 4rem;
    padding: ${responsiveSpacing.containerPadding.desktop};
    min-height: 250px;
    max-height: 400px;
  }

  /* Large desktop optimizations */
  ${media.desktopLarge} {
    max-width: ${layoutUtils.containerMaxWidth.large};
    margin: 4rem auto 0 auto;
  }

  /* Orientation change handling */
  ${media.landscape} {
    transition: ${responsiveTransitions.orientation};
  }

  ${media.portrait} {
    transition: ${responsiveTransitions.orientation};
  }

  /* Touch device optimizations */
  ${media.touch} {
    /* Ensure touch targets are accessible */
    min-height: 200px;
  }

  /* Reduced motion support */
  ${media.reducedMotion} {
    transition: none;
  }
`;

// Card component with enhanced responsive design
export const Card = styled.div<{ theme: ProfileStyling; elevated?: boolean }>`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius};
  box-shadow: ${props => props.elevated ? props.theme.shadows.large : props.theme.shadows.medium};
  padding: ${responsiveSpacing.componentSpacing.mobile};
  transition: ${responsiveTransitions.layout};
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 100%;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.theme.gradients.primary};
  }

  /* Mobile-first responsive padding */
  ${media.mobile} {
    padding: ${responsiveSpacing.componentSpacing.mobile};
    border-radius: 12px;
    margin: 0 ${props => props.theme.spacing.small};
  }

  /* Mobile landscape adjustments */
  ${media.mobileLandscape} {
    padding: ${responsiveSpacing.componentSpacing.mobile};
    max-width: 90%;
  }

  /* Tablet responsive design */
  ${media.tablet} {
    padding: ${responsiveSpacing.componentSpacing.tablet};
    border-radius: 16px;
    max-width: 600px;
    margin: 0 auto;
  }

  /* Desktop and larger */
  ${media.desktop} {
    padding: ${responsiveSpacing.componentSpacing.desktop};
    border-radius: 20px;
    max-width: 700px;
  }

  /* Large desktop */
  ${media.desktopLarge} {
    max-width: 800px;
  }

  /* Hover effects for devices that support hover */
  ${media.hover} {
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${props => props.theme.shadows.large};
    }
  }

  /* Touch device optimizations */
  ${media.touch} {
    /* Remove hover effects on touch devices */
    &:hover {
      transform: none;
    }
    
    /* Add touch feedback */
    &:active {
      transform: scale(0.98);
    }
  }

  /* Reduced motion support */
  ${media.reducedMotion} {
    transition: none;
    
    &:hover {
      transform: none;
    }
  }
`;

// Button base styles
export const BaseButton = styled.button<{ 
  theme: ProfileStyling; 
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.small};
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  font-family: ${props => props.theme.typography.fontFamily};
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all ${animations.duration.normal} ${animations.easing.easeInOut};
  position: relative;
  overflow: hidden;

  /* Size variants */
  ${props => props.size === 'small' && css`
    padding: ${props.theme.spacing.small} ${props.theme.spacing.medium};
    font-size: ${props.theme.typography.fontSize.small};
    min-height: 36px;
  `}

  ${props => props.size === 'medium' && css`
    padding: ${props.theme.spacing.medium} ${props.theme.spacing.large};
    font-size: ${props.theme.typography.fontSize.medium};
    min-height: 44px;
  `}

  ${props => props.size === 'large' && css`
    padding: ${props.theme.spacing.large} ${props.theme.spacing.xlarge};
    font-size: ${props.theme.typography.fontSize.large};
    min-height: 52px;
  `}

  /* Color variants */
  ${props => props.variant === 'primary' && css`
    background: ${props.theme.gradients.primary};
    color: white;
    box-shadow: ${props.theme.shadows.small};

    &:hover {
      transform: translateY(-1px);
      box-shadow: ${props.theme.shadows.medium};
    }

    &:active {
      transform: translateY(0);
    }
  `}

  ${props => props.variant === 'secondary' && css`
    background: ${props.theme.colors.secondary};
    color: white;
    box-shadow: ${props.theme.shadows.small};

    &:hover {
      background: ${props.theme.colors.primary};
      transform: translateY(-1px);
      box-shadow: ${props.theme.shadows.medium};
    }
  `}

  ${props => props.variant === 'outline' && css`
    background: transparent;
    color: ${props.theme.colors.primary};
    border: 2px solid ${props.theme.colors.primary};

    &:hover {
      background: ${props.theme.colors.primary};
      color: white;
      transform: translateY(-1px);
    }
  `}

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Enhanced focus styles for accessibility */
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.accent};
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(8, 145, 178, 0.2);
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border: 2px solid;
    
    &:focus-visible {
      outline: 3px solid;
      outline-offset: 2px;
    }
  }

  /* Touch-friendly sizing */
  min-height: 44px;
  
  /* Ensure adequate spacing for touch targets */
  ${media.touch} {
    min-height: 48px;
  }
`;

// Enhanced responsive typography components
export const Heading = styled.h1<{ 
  theme: ProfileStyling; 
  level?: 1 | 2 | 3 | 4;
  gradient?: boolean;
  responsive?: boolean;
}>`
  font-family: ${props => props.theme.typography.headingFont || props.theme.typography.fontFamily};
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  color: ${props => props.theme.colors.text};
  transition: ${responsiveTransitions.layout};

  /* Responsive heading level 1 */
  ${props => props.level === 1 && css`
    font-size: ${responsiveTypography.headingScale.h1.mobile};
    
    ${media.tablet} {
      font-size: ${responsiveTypography.headingScale.h1.tablet};
    }
    
    ${media.desktop} {
      font-size: ${responsiveTypography.headingScale.h1.desktop};
    }
  `}

  /* Responsive heading level 2 */
  ${props => props.level === 2 && css`
    font-size: ${responsiveTypography.headingScale.h2.mobile};
    
    ${media.tablet} {
      font-size: ${responsiveTypography.headingScale.h2.tablet};
    }
    
    ${media.desktop} {
      font-size: ${responsiveTypography.headingScale.h2.desktop};
    }
  `}

  /* Responsive heading level 3 */
  ${props => props.level === 3 && css`
    font-size: ${responsiveTypography.headingScale.h3.mobile};
    font-weight: 600;
    
    ${media.tablet} {
      font-size: ${responsiveTypography.headingScale.h3.tablet};
    }
    
    ${media.desktop} {
      font-size: ${responsiveTypography.headingScale.h3.desktop};
    }
  `}

  /* Responsive heading level 4 */
  ${props => props.level === 4 && css`
    font-size: ${responsiveTypography.headingScale.h4.mobile};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    
    ${media.tablet} {
      font-size: ${responsiveTypography.headingScale.h4.tablet};
    }
    
    ${media.desktop} {
      font-size: ${responsiveTypography.headingScale.h4.desktop};
    }
  `}

  /* Gradient text effect */
  ${props => props.gradient && css`
    background: ${props.theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    
    /* Fallback for browsers that don't support background-clip */
    @supports not (-webkit-background-clip: text) {
      color: ${props.theme.colors.primary};
    }
  `}

  /* Mobile landscape adjustments */
  ${media.mobileLandscape} {
    line-height: 1.1;
  }

  /* Reduced motion support */
  ${media.reducedMotion} {
    transition: none;
  }
`;

export const Text = styled.p<{ 
  theme: ProfileStyling; 
  variant?: 'body' | 'caption' | 'subtitle' | 'large';
  color?: 'primary' | 'secondary';
  responsive?: boolean;
}>`
  font-family: ${props => props.theme.typography.fontFamily};
  line-height: 1.6;
  margin: 0;
  transition: ${responsiveTransitions.layout};

  /* Large text variant */
  ${props => props.variant === 'large' && css`
    font-size: ${responsiveTypography.bodyScale.large.mobile};
    
    ${media.tablet} {
      font-size: ${responsiveTypography.bodyScale.large.tablet};
    }
    
    ${media.desktop} {
      font-size: ${responsiveTypography.bodyScale.large.desktop};
    }
  `}

  /* Body text variant */
  ${props => props.variant === 'body' && css`
    font-size: ${responsiveTypography.bodyScale.medium.mobile};
    
    ${media.tablet} {
      font-size: ${responsiveTypography.bodyScale.medium.tablet};
    }
    
    ${media.desktop} {
      font-size: ${responsiveTypography.bodyScale.medium.desktop};
    }
  `}

  /* Subtitle variant */
  ${props => props.variant === 'subtitle' && css`
    font-size: ${responsiveTypography.bodyScale.large.mobile};
    font-weight: 500;
    
    ${media.tablet} {
      font-size: ${responsiveTypography.bodyScale.large.tablet};
    }
    
    ${media.desktop} {
      font-size: ${responsiveTypography.bodyScale.large.desktop};
    }
  `}

  /* Caption variant */
  ${props => props.variant === 'caption' && css`
    font-size: ${responsiveTypography.bodyScale.small.mobile};
    
    ${media.tablet} {
      font-size: ${responsiveTypography.bodyScale.small.tablet};
    }
    
    ${media.desktop} {
      font-size: ${responsiveTypography.bodyScale.small.desktop};
    }
  `}

  /* Color variants */
  ${props => props.color === 'primary' && css`
    color: ${props.theme.colors.text};
  `}

  ${props => props.color === 'secondary' && css`
    color: ${props.theme.colors.textSecondary};
  `}

  /* Mobile landscape adjustments */
  ${media.mobileLandscape} {
    line-height: 1.5;
  }

  /* Reduced motion support */
  ${media.reducedMotion} {
    transition: none;
  }
`;

// Enhanced responsive modal components
export const ModalOverlay = styled.div<{ theme: ProfileStyling }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: ${zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${responsiveTransitions.layout};
  
  /* Responsive padding */
  padding: ${responsiveSpacing.containerPadding.mobile};

  ${media.tablet} {
    padding: ${responsiveSpacing.containerPadding.tablet};
  }

  ${media.desktop} {
    padding: ${responsiveSpacing.containerPadding.desktop};
  }

  /* Mobile landscape adjustments */
  ${media.mobileLandscape} {
    padding: ${props => props.theme.spacing.small};
    align-items: flex-start;
    overflow-y: auto;
  }

  /* Touch device optimizations */
  ${media.touch} {
    /* Ensure modal is accessible on touch devices */
    -webkit-overflow-scrolling: touch;
  }

  /* Reduced motion support */
  ${media.reducedMotion} {
    transition: none;
  }
`;

export const ModalContent = styled.div<{ theme: ProfileStyling }>`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius};
  box-shadow: ${props => props.theme.shadows.large};
  width: 100%;
  transition: ${responsiveTransitions.layout};
  
  /* Mobile-first responsive sizing */
  max-width: 100%;
  max-height: 95vh;
  overflow-y: auto;
  
  /* Mobile landscape */
  ${media.mobileLandscape} {
    max-height: 90vh;
    margin: ${props => props.theme.spacing.small} 0;
  }

  /* Tablet responsive design */
  ${media.tablet} {
    max-width: 600px;
    max-height: 85vh;
    border-radius: 16px;
  }

  /* Desktop and larger */
  ${media.desktop} {
    max-width: 800px;
    max-height: 80vh;
    border-radius: 20px;
  }

  /* Large desktop */
  ${media.desktopLarge} {
    max-width: 900px;
  }

  /* Touch device scrolling optimization */
  ${media.touch} {
    -webkit-overflow-scrolling: touch;
    
    /* Ensure content is accessible on small screens */
    ${media.mobileOnly} {
      max-height: 90vh;
    }
  }

  /* Reduced motion support */
  ${media.reducedMotion} {
    transition: none;
  }
`;

// Responsive visibility utilities
export const ShowOnMobile = styled.div`
  display: block;
  
  ${media.tablet} {
    display: none;
  }
`;

export const HideOnMobile = styled.div`
  display: none;
  
  ${media.tablet} {
    display: block;
  }
`;

export const ShowOnTablet = styled.div`
  display: none;
  
  ${media.tablet} {
    display: block;
  }
  
  ${media.desktop} {
    display: none;
  }
`;

export const ShowOnDesktop = styled.div`
  display: none;
  
  ${media.desktop} {
    display: block;
  }
`;

// Responsive spacing utilities
export const ResponsiveSpacing = styled.div<{
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  direction?: 'top' | 'bottom' | 'left' | 'right' | 'horizontal' | 'vertical' | 'all';
}>`
  ${props => {
    const size = props.size || 'medium';
    const direction = props.direction || 'all';
    
    const getSpacing = (breakpoint: 'mobile' | 'tablet' | 'desktop') => {
      const spacingMap = {
        small: responsiveSpacing.componentSpacing,
        medium: responsiveSpacing.containerPadding,
        large: responsiveSpacing.sectionSpacing,
        xlarge: responsiveSpacing.sectionSpacing,
      };
      return spacingMap[size][breakpoint];
    };

    const getDirectionCSS = (spacing: string) => {
      switch (direction) {
        case 'top': return `margin-top: ${spacing};`;
        case 'bottom': return `margin-bottom: ${spacing};`;
        case 'left': return `margin-left: ${spacing};`;
        case 'right': return `margin-right: ${spacing};`;
        case 'horizontal': return `margin-left: ${spacing}; margin-right: ${spacing};`;
        case 'vertical': return `margin-top: ${spacing}; margin-bottom: ${spacing};`;
        case 'all': 
        default: return `margin: ${spacing};`;
      }
    };

    return css`
      ${getDirectionCSS(getSpacing('mobile'))}
      
      ${media.tablet} {
        ${getDirectionCSS(getSpacing('tablet'))}
      }
      
      ${media.desktop} {
        ${getDirectionCSS(getSpacing('desktop'))}
      }
    `;
  }}
`;

// Responsive aspect ratio container
export const AspectRatio = styled.div<{
  ratio?: '1:1' | '4:3' | '16:9' | '3:2' | '2:1';
}>`
  position: relative;
  width: 100%;
  
  ${props => {
    const ratioMap = {
      '1:1': '100%',
      '4:3': '75%',
      '16:9': '56.25%',
      '3:2': '66.67%',
      '2:1': '50%',
    };
    
    return css`
      padding-bottom: ${ratioMap[props.ratio || '1:1']};
    `;
  }}
  
  > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// Responsive image component
export const ResponsiveImage = styled.img<{
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
}>`
  width: 100%;
  height: auto;
  object-fit: ${props => props.objectFit || 'cover'};
  transition: ${responsiveTransitions.layout};
  
  /* High DPI display optimization */
  ${media.retina} {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
  
  /* Reduced motion support */
  ${media.reducedMotion} {
    transition: none;
  }
`;

// Enhanced responsive grid system
export const Grid = styled.div<{ 
  columns?: number;
  gap?: string;
  theme: ProfileStyling;
  responsive?: boolean;
}>`
  display: grid;
  width: 100%;
  transition: ${responsiveTransitions.layout};
  
  /* Mobile-first grid layout */
  grid-template-columns: 1fr;
  gap: ${props => props.gap || layoutUtils.flexGaps.medium};

  /* Responsive column adjustments */
  ${props => props.responsive && css`
    /* Mobile large */
    ${media.mobileLarge} {
      grid-template-columns: repeat(${Math.min(props.columns || 1, layoutUtils.gridColumns.mobile)}, 1fr);
    }

    /* Tablet */
    ${media.tablet} {
      grid-template-columns: repeat(${Math.min(props.columns || 1, layoutUtils.gridColumns.tablet)}, 1fr);
      gap: ${layoutUtils.flexGaps.large};
    }

    /* Desktop */
    ${media.desktop} {
      grid-template-columns: repeat(${Math.min(props.columns || 1, layoutUtils.gridColumns.desktop)}, 1fr);
      gap: ${layoutUtils.flexGaps.xlarge};
    }

    /* Large desktop */
    ${media.desktopLarge} {
      grid-template-columns: repeat(${props.columns || layoutUtils.gridColumns.large}, 1fr);
    }
  `}

  /* Non-responsive grid (uses exact columns) */
  ${props => !props.responsive && css`
    grid-template-columns: repeat(${props.columns || 1}, 1fr);
  `}

  /* Orientation adjustments */
  ${media.mobileLandscape} {
    gap: ${layoutUtils.flexGaps.small};
  }

  /* Reduced motion support */
  ${media.reducedMotion} {
    transition: none;
  }
`;

// Enhanced responsive flexbox system
export const Flex = styled.div<{
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: string;
  wrap?: boolean;
  responsive?: boolean;
  theme: ProfileStyling;
}>`
  display: flex;
  transition: ${responsiveTransitions.layout};
  
  /* Base flex properties */
  flex-direction: ${props => props.direction || 'row'};
  align-items: ${props => props.align || 'flex-start'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => props.gap || layoutUtils.flexGaps.medium};
  flex-wrap: ${props => props.wrap ? 'wrap' : 'nowrap'};

  /* Responsive behavior */
  ${props => props.responsive && css`
    /* Mobile adjustments */
    ${media.mobileOnly} {
      flex-direction: column;
      gap: ${layoutUtils.flexGaps.small};
    }

    /* Mobile landscape - maintain row direction but reduce gap */
    ${media.mobileLandscape} {
      flex-direction: ${props.direction === 'column' ? 'column' : 'row'};
      gap: ${layoutUtils.flexGaps.small};
    }

    /* Tablet - restore intended direction */
    ${media.tablet} {
      flex-direction: ${props.direction || 'row'};
      gap: ${layoutUtils.flexGaps.medium};
    }

    /* Desktop - full spacing */
    ${media.desktop} {
      gap: ${layoutUtils.flexGaps.large};
    }
  `}

  /* Touch device optimizations */
  ${media.touch} {
    /* Ensure adequate spacing for touch targets */
    gap: ${props => props.gap || layoutUtils.flexGaps.medium};
  }

  /* Reduced motion support */
  ${media.reducedMotion} {
    transition: none;
  }
`;

// Responsive container component
export const ResponsiveContainer = styled.div<{
  maxWidth?: 'mobile' | 'tablet' | 'desktop' | 'large';
  padding?: boolean;
  theme: ProfileStyling;
}>`
  width: 100%;
  margin: 0 auto;
  transition: ${responsiveTransitions.layout};
  
  /* Container max-widths */
  ${props => props.maxWidth === 'mobile' && css`
    max-width: ${layoutUtils.containerMaxWidth.mobile};
  `}
  
  ${props => props.maxWidth === 'tablet' && css`
    max-width: ${layoutUtils.containerMaxWidth.tablet};
  `}
  
  ${props => props.maxWidth === 'desktop' && css`
    max-width: ${layoutUtils.containerMaxWidth.desktop};
  `}
  
  ${props => props.maxWidth === 'large' && css`
    max-width: ${layoutUtils.containerMaxWidth.large};
  `}

  /* Responsive padding */
  ${props => props.padding && css`
    padding: 0 ${responsiveSpacing.containerPadding.mobile};

    ${media.tablet} {
      padding: 0 ${responsiveSpacing.containerPadding.tablet};
    }

    ${media.desktop} {
      padding: 0 ${responsiveSpacing.containerPadding.desktop};
    }
  `}

  /* Reduced motion support */
  ${media.reducedMotion} {
    transition: none;
  }
`;