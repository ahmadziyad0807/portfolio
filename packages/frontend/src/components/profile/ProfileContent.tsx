// ProfileContent - Typography-focused content component with animations
import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, useAnimation, Variants } from 'framer-motion';
import styled from 'styled-components';
import { ProfileContentProps } from '../../types/profile';
import { media } from '../../styles/theme';

// Styled components for the content layout
const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  min-width: 0; /* Allows text truncation */

  ${media.tablet} {
    gap: 1.5rem;
  }
`;

const NameContainer = styled.div`
  position: relative;
  overflow: hidden;
`;

const TitleContainer = styled.div`
  position: relative;
  overflow: hidden;
`;

const DescriptionContainer = styled.div`
  position: relative;
  overflow: hidden;
`;

const StyledHeading = styled.h1.withConfig({
  shouldForwardProp: (prop) => !['gradient'].includes(prop),
})<{ gradient?: boolean }>`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  font-size: 1.875rem; /* 30px */
  color: ${props => props.gradient ? 'transparent' : '#1F2937'};
  
  ${props => props.gradient && `
    background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `}

  ${media.tablet} {
    font-size: 2.25rem; /* 36px */
  }
  
  ${media.desktop} {
    font-size: 2.5rem; /* 40px */
  }
`;

const StyledSubtitle = styled.p`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 1.25rem; /* 20px */
  font-weight: 500;
  line-height: 1.6;
  margin: 0;
  color: #6B7280;

  ${media.tablet} {
    font-size: 1.5rem; /* 24px */
  }
`;

const StyledText = styled.p.withConfig({
  shouldForwardProp: (prop) => !['isExpanded', 'maxLines'].includes(prop),
})<{ 
  isExpanded: boolean; 
  maxLines?: number;
}>`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 1rem; /* 16px */
  line-height: 1.6;
  margin: 0;
  color: #1F2937;
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.isExpanded ? 'unset' : (props.maxLines || 3)};
  -webkit-box-orient: vertical;
  overflow: ${props => props.isExpanded ? 'visible' : 'hidden'};
  text-overflow: ellipsis;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: ${props => props.maxLines && props.children && typeof props.children === 'string' && props.children.length > 150 ? 'pointer' : 'default'};
  
  &:hover {
    color: ${props => props.maxLines && props.children && typeof props.children === 'string' && props.children.length > 150 ? '#3B82F6' : 'inherit'};
  }
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: #3B82F6;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  transition: color 300ms cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    color: #8B5CF6;
  }

  &:focus-visible {
    outline: 2px solid #06B6D4;
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

// Animation variants for staggered text reveal
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const textVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
    },
  },
};

const ProfileContent: React.FC<ProfileContentProps> = ({ 
  name, 
  title, 
  description,
  styling 
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [shouldShowExpandButton, setShouldShowExpandButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const controls = useAnimation();

  // Check if description needs truncation
  useEffect(() => {
    if (description && description.length > 150) {
      setShouldShowExpandButton(true);
    }
  }, [description]);

  // Trigger animations when component comes into view
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const handleDescriptionToggle = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  // Handle keyboard navigation for description expansion
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDescriptionToggle();
    }
  };

  return (
    <ContentContainer 
      ref={containerRef}
      data-testid="profile-content"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Name with gradient effect and animation */}
        <NameContainer>
          <motion.div variants={textVariants}>
            <StyledHeading 
              gradient 
              role="heading"
              aria-level={1}
            >
              {name}
            </StyledHeading>
          </motion.div>
        </NameContainer>

        {/* Professional title */}
        <TitleContainer>
          <motion.div variants={textVariants}>
            <StyledSubtitle 
              role="heading"
              aria-level={2}
            >
              {title}
            </StyledSubtitle>
          </motion.div>
        </TitleContainer>

        {/* Description with truncation handling */}
        <DescriptionContainer>
          <motion.div variants={textVariants}>
            <StyledText
              isExpanded={isDescriptionExpanded}
              maxLines={3}
              onClick={shouldShowExpandButton ? handleDescriptionToggle : undefined}
              onKeyDown={shouldShowExpandButton ? handleKeyDown : undefined}
              tabIndex={shouldShowExpandButton ? 0 : -1}
              role={shouldShowExpandButton ? "button" : undefined}
              aria-expanded={shouldShowExpandButton ? isDescriptionExpanded : undefined}
              aria-label={shouldShowExpandButton ? 
                `${description} ${isDescriptionExpanded ? 'Click to collapse' : 'Click to expand'}` : 
                description
              }
            >
              {description}
            </StyledText>
            
            {shouldShowExpandButton && (
              <ExpandButton
                onClick={handleDescriptionToggle}
                aria-label={isDescriptionExpanded ? 'Show less' : 'Show more'}
              >
                {isDescriptionExpanded ? 'Show Less' : 'Read More'}
              </ExpandButton>
            )}
          </motion.div>
        </DescriptionContainer>
      </motion.div>
    </ContentContainer>
  );
};

export default ProfileContent;