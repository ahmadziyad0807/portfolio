// SkillsTab - Skills and technologies content for tab display
import React from 'react';
import styled from 'styled-components';
import { ExtendedProfileData, ProfileStyling } from '../../types/profile';
import { Heading } from '../../styles/styled';
import aiTheme from '../../styles/aiTheme';

interface SkillsTabProps {
  profile: ExtendedProfileData;
  styling: ProfileStyling;
}

const TabContainer = styled.div`
  padding: 2rem;
  height: 100%;
  overflow-y: auto;
  background: transparent;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const SkillCategory = styled.div<{ theme: ProfileStyling }>`
  background: ${aiTheme.glass.medium};
  backdrop-filter: ${aiTheme.glass.blur};
  border: 1px solid ${aiTheme.glass.light};
  border-radius: ${aiTheme.borderRadius.lg};
  padding: 1.5rem;
  transition: all ${aiTheme.animations.duration.normal} ${aiTheme.animations.easing.smooth};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${aiTheme.gradients.neural};
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    background: ${aiTheme.glass.heavy};
    border-color: ${aiTheme.colors.aiBlue}40;
    transform: translateY(-4px);
    box-shadow: ${aiTheme.shadows.glow};
    
    &::before {
      transform: scaleX(1);
    }
  }
`;

const SkillTag = styled.span<{ theme: ProfileStyling; proficiency?: string }>`
  display: inline-block;
  padding: 0.5rem 1rem;
  margin: 4px 6px 4px 0;
  background: ${props => {
    switch (props.proficiency) {
      case 'expert': return `${aiTheme.colors.aiBlue}20`;
      case 'advanced': return `${aiTheme.colors.aiPurple}20`;
      case 'intermediate': return `${aiTheme.colors.aiGreen}20`;
      default: return `${aiTheme.colors.textMuted}20`;
    }
  }};
  color: ${props => {
    switch (props.proficiency) {
      case 'expert': return aiTheme.colors.aiBlue;
      case 'advanced': return aiTheme.colors.aiPurple;
      case 'intermediate': return aiTheme.colors.aiGreen;
      default: return aiTheme.colors.textMuted;
    }
  }};
  border-radius: ${aiTheme.borderRadius.md};
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid ${props => {
    switch (props.proficiency) {
      case 'expert': return `${aiTheme.colors.aiBlue}40`;
      case 'advanced': return `${aiTheme.colors.aiPurple}40`;
      case 'intermediate': return `${aiTheme.colors.aiGreen}40`;
      default: return `${aiTheme.colors.textMuted}40`;
    }
  }};
  transition: all ${aiTheme.animations.duration.fast} ${aiTheme.animations.easing.smooth};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: ${props => {
      switch (props.proficiency) {
        case 'expert': return aiTheme.gradients.primary;
        case 'advanced': return aiTheme.gradients.secondary;
        case 'intermediate': return aiTheme.gradients.neural;
        default: return aiTheme.gradients.cyber;
      }
    }};
    opacity: 0.3;
    transition: left 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => {
      switch (props.proficiency) {
        case 'expert': return `0 4px 12px ${aiTheme.colors.aiBlue}30`;
        case 'advanced': return `0 4px 12px ${aiTheme.colors.aiPurple}30`;
        case 'intermediate': return `0 4px 12px ${aiTheme.colors.aiGreen}30`;
        default: return `0 4px 12px ${aiTheme.colors.textMuted}30`;
      }
    }};
    
    &::before {
      left: 100%;
    }
  }
`;

const ProficiencyBadge = styled.span<{ proficiency?: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  margin-left: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 6px;
  background: ${props => {
    switch (props.proficiency) {
      case 'expert': return 'rgba(239, 68, 68, 0.2)';
      case 'advanced': return 'rgba(245, 158, 11, 0.2)';
      case 'intermediate': return 'rgba(34, 197, 94, 0.2)';
      default: return 'rgba(156, 163, 175, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.proficiency) {
      case 'expert': return '#EF4444';
      case 'advanced': return '#F59E0B';
      case 'intermediate': return '#22C55E';
      default: return '#9CA3AF';
    }
  }};
`;

const SkillsTab: React.FC<SkillsTabProps> = ({ profile, styling }) => {
  if (!profile.skills || profile.skills.length === 0) {
    return (
      <TabContainer>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#94A3B8',
          fontSize: '1.1rem'
        }}>
          No skills information available
        </div>
      </TabContainer>
    );
  }

  return (
    <TabContainer>
      <Heading level={2} theme={styling} style={{ 
        marginBottom: '2rem', 
        color: '#E2E8F0',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        Skills & Technologies
      </Heading>
      
      <SkillsGrid>
        {profile.skills.map((skillCategory, index) => (
          <SkillCategory key={index} theme={styling}>
            <Heading level={3} theme={styling} style={{ 
              color: '#E2E8F0',
              fontSize: '1.2rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              {skillCategory.category}
              {skillCategory.proficiency && (
                <ProficiencyBadge proficiency={skillCategory.proficiency}>
                  {skillCategory.proficiency}
                </ProficiencyBadge>
              )}
            </Heading>
            <div>
              {skillCategory.skills.map((skill, skillIndex) => (
                <SkillTag
                  key={skillIndex}
                  theme={styling}
                  proficiency={skillCategory.proficiency}
                >
                  {skill}
                </SkillTag>
              ))}
            </div>
          </SkillCategory>
        ))}
      </SkillsGrid>
    </TabContainer>
  );
};

export default SkillsTab;