// CertificationsTab - Certifications content for tab display
import React from 'react';
import styled from 'styled-components';
import { ExtendedProfileData, ProfileStyling } from '../../types/profile';
import { Heading, Text } from '../../styles/styled';
import aiTheme from '../../styles/aiTheme';

interface CertificationsTabProps {
  profile: ExtendedProfileData;
  styling: ProfileStyling;
}

const TabContainer = styled.div`
  padding: 2rem;
  height: 100%;
  overflow-y: auto;
  background: transparent;
`;

const CertificationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  @media (min-width: 1400px) {
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  }
`;

const CertificationCard = styled.div<{ theme: ProfileStyling }>`
  background: ${aiTheme.glass.medium};
  backdrop-filter: ${aiTheme.glass.blur};
  border: 1px solid ${aiTheme.glass.light};
  border-radius: ${aiTheme.borderRadius.lg};
  padding: 1.5rem;
  transition: all ${aiTheme.animations.duration.normal} ${aiTheme.animations.easing.smooth};
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${aiTheme.gradients.neural};
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    background: ${aiTheme.glass.heavy};
    border-color: ${aiTheme.colors.aiCyan}40;
    transform: translateY(-4px);
    box-shadow: ${aiTheme.shadows.aiGlow};
    
    &::before {
      transform: scaleY(1);
    }
  }
`;

const CertificationLogo = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.75rem;
  flex-shrink: 0;
`;

const LogoFallback = styled.div`
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94A3B8;
  font-size: 3rem;
  flex-shrink: 0;
`;

const CertificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const CertificationLink = styled.a<{ theme: ProfileStyling }>`
  color: #60A5FA;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: #93C5FD;
    text-decoration: underline;
  }
`;

const DateBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.5rem;
`;

const CertificationsTab: React.FC<CertificationsTabProps> = ({ profile, styling }) => {
  if (!profile.certifications || profile.certifications.length === 0) {
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
          No certifications information available
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
        Certifications
      </Heading>

      <CertificationsGrid>
        {profile.certifications.map((cert) => (
          <CertificationCard key={cert.id} theme={styling}>
            {cert.logo ? (
              <CertificationLogo
                src={cert.logo}
                alt={`${cert.issuer} logo`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : (
              <LogoFallback>
                🏆
              </LogoFallback>
            )}
            <LogoFallback style={{ display: 'none' }}>
              🏆
            </LogoFallback>

            <CertificationContent>
              <Heading level={3} theme={styling} style={{
                color: '#E2E8F0',
                fontSize: '1rem',
                marginBottom: '0.25rem',
                lineHeight: '1.3'
              }}>
                {cert.link ? (
                  <CertificationLink
                    href={cert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    theme={styling}
                  >
                    {cert.name}
                    <span>🔗</span>
                  </CertificationLink>
                ) : (
                  cert.name
                )}
              </Heading>
              <Text variant="subtitle" theme={styling} style={{
                color: '#94A3B8',
                fontSize: '0.95rem'
              }}>
                {cert.issuer}
              </Text>
              <DateBadge>
                {cert.date}
              </DateBadge>
            </CertificationContent>
          </CertificationCard>
        ))}
      </CertificationsGrid>
    </TabContainer>
  );
};

export default CertificationsTab;