// ContactTab - Contact information content for tab display
import React from 'react';
import styled from 'styled-components';
import { ExtendedProfileData, ProfileStyling } from '../../types/profile';
import { Heading, Text } from '../../styles/styled';

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
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ContactItem = styled.div<{ theme: ProfileStyling }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ContactIcon = styled.div`
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(96, 165, 250, 0.2);
  border-radius: 8px;
  flex-shrink: 0;
`;

const ContactLink = styled.a<{ theme: ProfileStyling }>`
  color: #60A5FA;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    color: #93C5FD;
    text-decoration: underline;
  }
`;

const SectionTitle = styled(Heading)<{ theme: ProfileStyling }>`
  color: #E2E8F0;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '';
    width: 3px;
    height: 1.2rem;
    background: linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%);
    border-radius: 2px;
  }
`;

const ContactTab: React.FC<ContactTabProps> = ({ profile, styling }) => {
  const hasContactInfo = profile.contact?.email || profile.contact?.phone || profile.contact?.location;
  const hasSocialInfo = profile.social?.website || profile.social?.linkedin || profile.social?.github;

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
        color: '#E2E8F0',
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
                    color: '#94A3B8',
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
                <div>
                  <Text variant="caption" theme={styling} style={{ 
                    color: '#94A3B8',
                    fontSize: '0.8rem',
                    display: 'block',
                    marginBottom: '0.25rem'
                  }}>
                    Location
                  </Text>
                  <Text variant="body" theme={styling} style={{ 
                    color: '#E2E8F0',
                    fontWeight: '500'
                  }}>
                    {profile.contact.location}
                  </Text>
                </div>
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
                    color: '#94A3B8',
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
                    color: '#94A3B8',
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
                    color: '#94A3B8',
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
    </TabContainer>
  );
};

export default ContactTab;