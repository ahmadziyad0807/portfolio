// ContactTab - Contact information content for tab display
import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ExtendedProfileData, ProfileStyling } from '../../types/profile';
import { Heading, Text } from '../../styles/styled';
import aiTheme from '../../styles/aiTheme';
import MapComponent from '../MapComponent';

interface ContactTabProps {
  profile: ExtendedProfileData;
  styling: ProfileStyling;
}

const TabContainer = styled.div`
  padding: 2rem;
  height: 100%;
  overflow-y: auto;
  background: transparent;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ContactCard = styled.div<{ theme: ProfileStyling }>`
  background: ${aiTheme.glass.medium};
  backdrop-filter: ${aiTheme.glass.blur};
  border: 1px solid ${aiTheme.glass.light};
  border-radius: ${aiTheme.borderRadius.xl};
  padding: 1.5rem;
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
    border-color: ${aiTheme.colors.aiCyan}40;
    transform: translateY(-4px);
    box-shadow: ${aiTheme.shadows.aiGlow};
    
    &::before {
      left: 100%;
    }
  }
`;

const ContactItem = styled.div<{ theme: ProfileStyling }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${aiTheme.glass.light};
  border: 1px solid ${aiTheme.glass.border};
  border-radius: ${aiTheme.borderRadius.lg};
  margin-bottom: 1rem;
  transition: all ${aiTheme.animations.duration.normal} ${aiTheme.animations.easing.smooth};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: ${aiTheme.gradients.neural};
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    background: ${aiTheme.glass.medium};
    border-color: ${aiTheme.colors.aiCyan}30;
    transform: translateX(4px);
    
    &::before {
      transform: scaleY(1);
    }
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const LocationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

const MapButton = styled.button`
  background: ${aiTheme.gradients.neural};
  border: 1px solid ${aiTheme.colors.aiCyan}40;
  border-radius: ${aiTheme.borderRadius.md};
  padding: 0.75rem;
  color: ${aiTheme.colors.aiBlue};
  cursor: pointer;
  font-size: 1.2rem;
  transition: all ${aiTheme.animations.duration.normal} ${aiTheme.animations.easing.smooth};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: ${aiTheme.gradients.cyber};
    opacity: 0.3;
    transition: left 0.5s ease;
  }
  
  &:hover {
    background: ${aiTheme.gradients.quantum};
    border-color: ${aiTheme.colors.aiCyan}60;
    color: ${aiTheme.colors.text};
    transform: scale(1.05);
    box-shadow: ${aiTheme.shadows.glow};
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const MapPopup = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const MapContainer = styled(motion.div)`
  background: ${aiTheme.colors.background};
  border: 1px solid ${aiTheme.colors.aiCyan}40;
  border-radius: ${aiTheme.borderRadius.xl};
  padding: 1.5rem;
  max-width: 90vw;
  max-height: 90vh;
  width: 800px;
  height: 600px;
  position: relative;
  box-shadow: ${aiTheme.shadows.floating};
`;

const MapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const MapTitle = styled.h3`
  color: ${aiTheme.colors.text};
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${aiTheme.colors.textSecondary};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${aiTheme.colors.text};
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MapFrame = styled.iframe`
  width: 100%;
  height: calc(100% - 80px);
  border: none;
  border-radius: ${aiTheme.borderRadius.lg};
`;

const ContactIcon = styled.div`
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${aiTheme.gradients.neural};
  border-radius: ${aiTheme.borderRadius.lg};
  flex-shrink: 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: ${aiTheme.gradients.quantum};
    border-radius: ${aiTheme.borderRadius.lg};
    z-index: -1;
    opacity: 0.6;
  }
`;

const ContactLink = styled.a<{ theme: ProfileStyling }>`
  color: ${aiTheme.colors.aiBlue};
  text-decoration: none;
  font-weight: 500;
  transition: all ${aiTheme.animations.duration.fast} ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: ${aiTheme.gradients.neural};
    transition: width 0.3s ease;
  }
  
  &:hover {
    color: ${aiTheme.colors.text};
    text-shadow: 0 0 8px ${aiTheme.colors.aiCyan}50;
    
    &::after {
      width: 100%;
    }
  }
`;

const SectionTitle = styled(Heading)<{ theme: ProfileStyling }>`
  color: ${aiTheme.colors.text};
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  
  &::before {
    content: '';
    width: 4px;
    height: 1.2rem;
    background: ${aiTheme.gradients.neural};
    border-radius: 2px;
  }
`;

const ContactTab: React.FC<ContactTabProps> = ({ profile, styling }) => {
  const [showMap, setShowMap] = useState(false);
  const hasContactInfo = profile.contact?.email || profile.contact?.phone || profile.contact?.location;
  const hasSocialInfo = profile.social?.website || profile.social?.linkedin || profile.social?.github;

  const handleMapClick = () => {
    setShowMap(true);
  };

  const handleCloseMap = () => {
    setShowMap(false);
  };

  if (!hasContactInfo && !hasSocialInfo) {
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
          No contact information available
        </div>
      </TabContainer>
    );
  }

  return (
    <TabContainer>
      <Heading level={2} theme={styling} style={{ 
        marginBottom: '2rem', 
        color: aiTheme.colors.text,
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        Contact Information
      </Heading>
      
      <ContactGrid>
        {/* Contact Information */}
        {hasContactInfo && (
          <ContactCard theme={styling}>
            <SectionTitle level={3} theme={styling}>
              📞 Contact Details
            </SectionTitle>
            
            {profile.contact?.email && (
              <ContactItem theme={styling}>
                <ContactIcon>📧</ContactIcon>
                <div>
                  <Text variant="caption" theme={styling} style={{ 
                    color: '#94A3B8',
                    fontSize: '0.8rem',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    Email
                  </Text>
                  <ContactLink 
                    href={`mailto:${profile.contact.email}`}
                    theme={styling}
                  >
                    {profile.contact.email}
                  </ContactLink>
                </div>
              </ContactItem>
            )}
            
            {profile.contact?.phone && (
              <ContactItem theme={styling}>
                <ContactIcon>📱</ContactIcon>
                <div>
                  <Text variant="caption" theme={styling} style={{ 
                    color: aiTheme.colors.textSecondary,
                    fontSize: '0.8rem',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    Phone
                  </Text>
                  <ContactLink 
                    href={`tel:${profile.contact.phone}`}
                    theme={styling}
                  >
                    {profile.contact.phone}
                  </ContactLink>
                </div>
              </ContactItem>
            )}
            
            {profile.contact?.location && (
              <ContactItem theme={styling}>
                <ContactIcon>📍</ContactIcon>
                <LocationContainer>
                  <div style={{ flex: 1 }}>
                    <Text variant="caption" theme={styling} style={{ 
                      color: aiTheme.colors.textSecondary,
                      fontSize: '0.8rem',
                      display: 'block',
                      marginBottom: '0.25rem'
                    }}>
                      Location
                    </Text>
                    <Text variant="body" theme={styling} style={{ 
                      color: aiTheme.colors.text,
                      fontWeight: '500'
                    }}>
                      {profile.contact.location}
                    </Text>
                  </div>
                  <MapButton
                    onClick={handleMapClick}
                    title="View on Google Maps"
                    aria-label="View location on Google Maps"
                  >
                    🗺️
                  </MapButton>
                </LocationContainer>
              </ContactItem>
            )}
          </ContactCard>
        )}

        {/* Social Links */}
        {hasSocialInfo && (
          <ContactCard theme={styling}>
            <SectionTitle level={3} theme={styling}>
              🌐 Social Links
            </SectionTitle>
            
            {profile.social?.website && (
              <ContactItem theme={styling}>
                <ContactIcon>🌐</ContactIcon>
                <div>
                  <Text variant="caption" theme={styling} style={{ 
                    color: aiTheme.colors.textSecondary,
                    fontSize: '0.8rem',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    Website
                  </Text>
                  <ContactLink
                    href={profile.social.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    theme={styling}
                  >
                    Visit Website 🔗
                  </ContactLink>
                </div>
              </ContactItem>
            )}
            
            {profile.social?.linkedin && (
              <ContactItem theme={styling}>
                <ContactIcon>💼</ContactIcon>
                <div>
                  <Text variant="caption" theme={styling} style={{ 
                    color: aiTheme.colors.textSecondary,
                    fontSize: '0.8rem',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    LinkedIn
                  </Text>
                  <ContactLink
                    href={profile.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    theme={styling}
                  >
                    View LinkedIn Profile 🔗
                  </ContactLink>
                </div>
              </ContactItem>
            )}
            
            {profile.social?.github && (
              <ContactItem theme={styling}>
                <ContactIcon>🔗</ContactIcon>
                <div>
                  <Text variant="caption" theme={styling} style={{ 
                    color: aiTheme.colors.textSecondary,
                    fontSize: '0.8rem',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    GitHub
                  </Text>
                  <ContactLink
                    href={profile.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    theme={styling}
                  >
                    View GitHub Profile 🔗
                  </ContactLink>
                </div>
              </ContactItem>
            )}
          </ContactCard>
        )}
      </ContactGrid>

      {/* Google Maps Component */}
      <AnimatePresence>
        <MapComponent
          location={profile.contact?.location || 'Charlotte, NC, USA'}
          isVisible={showMap}
          onClose={handleCloseMap}
        />
      </AnimatePresence>
    </TabContainer>
  );
};

export default ContactTab;