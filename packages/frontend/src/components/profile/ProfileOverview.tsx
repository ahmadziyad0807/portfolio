// ProfileOverview - Simplified profile overview for the main profile tab
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { ProfileData, ProfileStyling } from '../../types/profile';
import { Heading, Text } from '../../styles/styled';
import { media, animations } from '../../styles/theme';
import aiTheme from '../../styles/aiTheme';
import ProfileImage from './ProfileImage';

interface ProfileOverviewProps {
  profile: ProfileData;
  styling: ProfileStyling;
}

const OverviewContainer = styled.div`
  padding: 2rem;
  height: 100%;
  overflow-y: auto;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ProfileCard = styled(motion.div)<{ theme: ProfileStyling }>`
  width: 100%;
  max-width: 800px;
  background: ${aiTheme.glass.medium};
  backdrop-filter: ${aiTheme.glass.blur};
  border: 1px solid ${aiTheme.glass.light};
  border-radius: ${aiTheme.borderRadius.xl};
  padding: 3rem;
  text-align: center;
  transition: all ${aiTheme.animations.duration.normal} ${aiTheme.animations.easing.smooth};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: ${aiTheme.gradients.neural};
    opacity: 0.1;
    transform: skewX(-25deg);
    transition: left 0.7s ease;
  }
  
  &:hover {
    background: ${aiTheme.glass.heavy};
    border-color: ${aiTheme.colors.aiBlue}40;
    transform: translateY(-8px);
    box-shadow: ${aiTheme.shadows.aiGlow};
    
    &::before {
      left: 100%;
    }
  }

  ${media.mobile} {
    padding: 2rem;
    margin: 1rem;
  }
`;

const ImageContainer = styled.div<{ theme: ProfileStyling }>`
  width: 150px;
  height: 150px;
  margin: 0 auto 2rem;
  border-radius: 50%;
  overflow: hidden;
  background: ${aiTheme.gradients.neural};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${aiTheme.shadows.aiGlow};
  position: relative;
  transition: all ${aiTheme.animations.duration.normal} ${aiTheme.animations.easing.smooth};
  
  /* AI Neural ring effect */
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;
    background: ${aiTheme.gradients.quantum};
    border-radius: 50%;
    z-index: -1;
    animation: pulse-ring 2s infinite;
  }
  
  @keyframes pulse-ring {
    0%, 100% {
      transform: scale(1);
      opacity: 0.7;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.9;
    }
  }

  .profile-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform ${animations.duration.normal} ${animations.easing.easeInOut};
  }

  /* Hover effects for devices that support hover */
  ${media.hover} {
    &:hover {
      transform: scale(1.05);
      
      .profile-image {
        transform: scale(1.1) rotate(5deg);
      }
    }
  }

  /* Touch device optimizations */
  ${media.touch} {
    &:hover {
      transform: none;
      
      .profile-image {
        transform: none;
      }
    }
    
    &:active {
      transform: scale(0.95);
    }
  }

  /* Reduced motion support */
  ${media.reducedMotion} {
    transition: none;
    
    .profile-image {
      transition: none;
    }
    
    &:hover {
      transform: none;
      
      .profile-image {
        transform: none;
      }
    }
  }

  ${media.mobile} {
    width: 120px;
    height: 120px;
  }
`;

const NameHeading = styled(Heading)<{ theme: ProfileStyling }>`
  background: linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%);
  background-size: 100% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  transition: all ${animations.duration.normal} ${animations.easing.easeInOut};

  ${media.mobile} {
    font-size: 2rem;
  }

  ${media.tablet} {
    font-size: 2.2rem;
  }
`;

const TitleText = styled(Text)<{ theme: ProfileStyling }>`
  color: #94A3B8;
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 1.5rem;

  ${media.mobile} {
    font-size: 1rem;
  }
`;

const DescriptionText = styled(Text)<{ theme: ProfileStyling }>`
  color: ${aiTheme.colors.text};
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
  text-shadow: 0 0 10px ${aiTheme.colors.aiCyan}20;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 2px;
    background: ${aiTheme.gradients.neural};
    border-radius: 1px;
  }

  ${media.mobile} {
    font-size: 1rem;
  }
`;

const PlaceholderImage = styled.div<{ theme: ProfileStyling }>`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  font-weight: bold;

  ${media.mobile} {
    font-size: 2.5rem;
  }
`;

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ profile, styling }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  // Extract first letter of name for placeholder
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Animation variants for staggered content reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  const imageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      rotate: -10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
    },
  };

  return (
    <OverviewContainer>
      <ProfileCard
        ref={cardRef}
        theme={styling}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        {/* Profile Image with entrance animation */}
        <motion.div variants={imageVariants}>
          <ImageContainer theme={styling}>
            {profile.image?.src ? (
              <ProfileImage
                src={profile.image.src}
                alt={profile.image.alt}
                size="large"
                shape="circle"
              />
            ) : (
              <PlaceholderImage theme={styling}>
                {getInitials(profile.name)}
              </PlaceholderImage>
            )}
          </ImageContainer>
        </motion.div>

        {/* Profile Content with staggered animations */}
        <motion.div variants={itemVariants}>
          <DescriptionText theme={styling}>
            {profile.description}
          </DescriptionText>
        </motion.div>
      </ProfileCard>
    </OverviewContainer>
  );
};

export default ProfileOverview;