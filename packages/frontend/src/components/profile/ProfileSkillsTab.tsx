// ProfileSkillsTab - Combined Profile and Skills content for tab display with dynamic theming
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ProfileData, ExtendedProfileData, ProfileStyling } from '../../types/profile';
import { Heading, Text } from '../../styles/styled';
import { media } from '../../styles/theme';
import { useTheme } from '../../contexts/ThemeContext';
import ProfileImage from './ProfileImage';

interface ProfileSkillsTabProps {
  profile: ProfileData;
  extendedProfile: ExtendedProfileData | null;
  styling: ProfileStyling;
}

const TabContainer = styled.div`
  padding: 2rem;
  height: 100%;
  overflow-y: auto;
  background: transparent;
`;

const ProfileSection = styled(motion.div)<{ $theme: any }>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: ${props => props.$theme.glass.medium};
  backdrop-filter: ${props => props.$theme.glass.blur};
  border: 1px solid ${props => props.$theme.glass.light};
  border-radius: ${props => props.$theme.borderRadius.xl};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: ${props => props.$theme.gradients.neural};
    opacity: 0.1;
    transform: skewX(-25deg);
    transition: left 0.7s ease;
  }
  
  &:hover::before {
    left: 100%;
  }

  ${media.mobile} {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const ImageContainer = styled.div<{ $theme: any }>`
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  background: ${props => props.$theme.gradients.neural};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.$theme.shadows.aiGlow};
  position: relative;
  transition: all ${props => props.$theme.animations.duration.normal} ${props => props.$theme.animations.easing.smooth};
  
  /* AI Neural ring effect */
  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    background: ${props => props.$theme.gradients.quantum};
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

  &:hover {
    transform: scale(1.05);
  }

  ${media.mobile} {
    width: 100px;
    height: 100px;
  }
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  font-weight: bold;

  ${media.mobile} {
    font-size: 2rem;
  }
`;

const ProfileContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  
  ${media.mobile} {
    text-align: center;
  }
`;

const ProfileDescription = styled(Text)<{ $theme: any }>`
  color: ${props => props.$theme.colors.text};
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
  text-shadow: 0 0 10px ${props => props.$theme.colors.aiCyan}20;

  ${media.mobile} {
    font-size: 1rem;
  }
`;

const Divider = styled.div<{ $theme: any }>`
  width: 60px;
  height: 2px;
  background: ${props => props.$theme.gradients.neural};
  margin-top: 1rem;
  border-radius: 1px;
  
  ${media.mobile} {
    margin: 1rem auto 0;
  }
`;

const SkillsSection = styled.div`
  margin-top: 2rem;
`;

const SkillsTitle = styled(Heading)<{ $theme: any }>`
  color: ${props => props.$theme.colors.text};
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: left;
  
  ${media.mobile} {
    font-size: 1.3rem;
    text-align: center;
  }
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.5rem;
  
  ${media.mobile} {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  @media (min-width: 1400px) {
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  }
`;

const SkillCategory = styled(motion.div)<{ $theme: any }>`
  background: ${props => props.$theme.glass.medium};
  backdrop-filter: ${props => props.$theme.glass.blur};
  border: 1px solid ${props => props.$theme.glass.light};
  border-radius: ${props => props.$theme.borderRadius.lg};
  padding: 1.5rem;
  transition: all ${props => props.$theme.animations.duration.normal} ${props => props.$theme.animations.easing.smooth};
  position: relative;
  overflow: visible;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.$theme.gradients.neural};
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    background: ${props => props.$theme.glass.heavy};
    border-color: ${props => props.$theme.colors.aiCyan}40;
    transform: translateY(-4px);
    box-shadow: ${props => props.$theme.shadows.aiGlow};
    z-index: 10;
    
    &::before {
      transform: scaleY(1);
    }
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CategoryTitle = styled.h3<{ $theme: any }>`
  color: ${props => props.$theme.colors.text};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
`;

const ProficiencyBadge = styled.span<{ level: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    const level = props.level.toLowerCase();
    switch (level) {
      case 'expert':
        return `
          background: rgba(34, 197, 94, 0.2);
          color: #22C55E;
          border: 1px solid rgba(34, 197, 94, 0.3);
        `;
      case 'advanced':
        return `
          background: rgba(59, 130, 246, 0.2);
          color: #3B82F6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        `;
      case 'intermediate':
        return `
          background: rgba(245, 158, 11, 0.2);
          color: #F59E0B;
          border: 1px solid rgba(245, 158, 11, 0.3);
        `;
      default:
        return `
          background: rgba(156, 163, 175, 0.2);
          color: #9CA3AF;
          border: 1px solid rgba(156, 163, 175, 0.3);
        `;
    }
  }}
`;

const SkillsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex: 1;
  align-content: flex-start;
`;

const SkillTag = styled.span<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.1);
  color: ${props => props.$theme.colors.textSecondary};
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
  line-height: 1.2;
  text-align: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: ${props => props.$theme.colors.text};
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const TooltipContainer = styled(motion.div)<{ $theme: any }>`
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.$theme.colors.background};
  backdrop-filter: ${props => props.$theme.glass.blur};
  border: 1px solid ${props => props.$theme.colors.aiCyan}40;
  border-radius: ${props => props.$theme.borderRadius.lg};
  padding: 1rem 1.25rem;
  max-width: 350px;
  width: max-content;
  box-shadow: ${props => props.$theme.shadows.floating};
  z-index: 1000;
  pointer-events: auto;
  
  /* Ensure tooltip stays within viewport */
  @media (max-width: 768px) {
    left: 10px;
    right: 10px;
    transform: none;
    width: auto;
    max-width: none;
  }
  
  &::before {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid ${props => props.$theme.colors.aiCyan}40;
    
    @media (max-width: 768px) {
      left: 20px;
      transform: none;
    }
  }
  
  ${media.mobile} {
    max-width: 280px;
    padding: 0.875rem 1rem;
    font-size: 0.85rem;
  }
`;

const TooltipHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  min-height: 20px;
`;

const CloseButton = styled.button<{ $theme: any }>`
  background: none;
  border: none;
  color: ${props => props.$theme.colors.textSecondary};
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
  border-radius: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    color: ${props => props.$theme.colors.text};
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const TooltipText = styled.p<{ $theme: any }>`
  color: ${props => props.$theme.colors.text};
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
  text-align: left;
  
  ${media.mobile} {
    font-size: 0.8rem;
  }
`;

const ProfileSkillsTab: React.FC<ProfileSkillsTabProps> = ({ profile, extendedProfile, styling }) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [closedTooltips, setClosedTooltips] = useState<Set<string>>(new Set());

  // Extract first letter of name for placeholder
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle close button click
  const handleCloseTooltip = (category: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent any parent click handlers
    setClosedTooltips(prev => {
      const newSet = new Set(prev);
      newSet.add(category);
      return newSet;
    });
  };

  // Check if tooltip should be shown (hovered and not closed)
  const shouldShowTooltip = (category: string) => {
    return hoveredCategory === category && !closedTooltips.has(category);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  return (
    <TabContainer ref={containerRef}>
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        {/* Profile Section */}
        <ProfileSection variants={itemVariants} $theme={theme}>
          <ImageContainer $theme={theme}>
            {profile.image?.src ? (
              <ProfileImage
                src={profile.image.src}
                alt={profile.image.alt}
                size="large"
                shape="circle"
              />
            ) : (
              <PlaceholderImage>
                {getInitials(profile.name)}
              </PlaceholderImage>
            )}
          </ImageContainer>

          <ProfileContent>
            <ProfileDescription theme={styling} $theme={theme}>
              {profile.description}
            </ProfileDescription>
            <Divider $theme={theme} />
          </ProfileContent>
        </ProfileSection>

        {/* Skills Section */}
        <SkillsSection>
          <SkillsTitle level={2} theme={styling} $theme={theme}>
            Skills & Technologies
          </SkillsTitle>

          {extendedProfile?.skills ? (
            <SkillsGrid>
              {extendedProfile.skills.map((skillCategory) => (
                <SkillCategory
                  key={skillCategory.category}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  onMouseEnter={() => setHoveredCategory(skillCategory.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  $theme={theme}
                >
                  <CategoryHeader>
                    <CategoryTitle $theme={theme}>{skillCategory.category}</CategoryTitle>
                    <ProficiencyBadge level={skillCategory.proficiency || 'intermediate'}>
                      {skillCategory.proficiency || 'intermediate'}
                    </ProficiencyBadge>
                  </CategoryHeader>
                  
                  <SkillsList>
                    {skillCategory.skills.map((skill, skillIndex) => (
                      <SkillTag key={skillIndex} $theme={theme}>
                        {skill}
                      </SkillTag>
                    ))}
                  </SkillsList>

                  {/* Tooltip - Show on hover unless closed */}
                  <AnimatePresence>
                    {shouldShowTooltip(skillCategory.category) && skillCategory.description && (
                      <TooltipContainer
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        $theme={theme}
                      >
                        <TooltipHeader>
                          <CloseButton
                            onClick={(e) => handleCloseTooltip(skillCategory.category, e)}
                            aria-label="Close tooltip"
                            title="Close tooltip"
                            $theme={theme}
                          >
                            ✕
                          </CloseButton>
                        </TooltipHeader>
                        <TooltipText $theme={theme}>
                          {skillCategory.description}
                        </TooltipText>
                      </TooltipContainer>
                    )}
                  </AnimatePresence>
                </SkillCategory>
              ))}
            </SkillsGrid>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: theme.colors.textSecondary,
              fontSize: '1.1rem'
            }}>
              Loading skills information...
            </div>
          )}
        </SkillsSection>
      </motion.div>
    </TabContainer>
  );
};

export default ProfileSkillsTab;