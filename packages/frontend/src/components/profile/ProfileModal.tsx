// ProfileModal - Extended information display component with comprehensive accessibility
import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileModalProps, ExtendedProfileData, ProfileStyling } from '../../types/profile';
import {
  ModalOverlay,
  ModalContent,
  Heading,
  Text,
  BaseButton,
  Grid,
  Flex
} from '../../styles/styled';
import styled from 'styled-components';
import {
  createProfileError,
  ProfileErrorType,
  handleModalError,
  validateExtendedProfileData,
  ProfileError
} from '../../utils/errorHandling';
import {
  useFocusTrap,
  useKeyboardNavigation,
  usePrefersReducedMotion,
  useScreenReaderAnnouncement,
  generateAccessibleId,
  KEYBOARD_KEYS,
  createAccessibleFocusStyles,
  touchFriendly
} from '../../utils/accessibility';

// Modal-specific styled components
const ModalHeader = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.large};
  border-bottom: 1px solid ${props => props.theme.colors.textSecondary}20;
  position: sticky;
  top: 0;
  background: ${props => props.theme.colors.background};
  z-index: 10;
`;

const ModalBody = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.large};
  max-height: calc(90vh - 120px);
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
    border-radius: ${props => props.theme.borderRadius};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.textSecondary};
    border-radius: ${props => props.theme.borderRadius};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.text};
  }
`;

const Section = styled.section<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.xlarge};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.large};
  padding-bottom: ${props => props.theme.spacing.medium};
  border-bottom: 2px solid ${props => props.theme.colors.primary}20;
`;

const ExperienceCard = styled.div<{ theme: any }>`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.textSecondary}20;
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.large};
  margin-bottom: ${props => props.theme.spacing.medium};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary}40;
    box-shadow: ${props => props.theme.shadows.small};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SkillTag = styled.span<{ theme: any; proficiency?: string }>`
  display: inline-block;
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  margin: 2px 4px 2px 0;
  background: ${props => {
    switch (props.proficiency) {
      case 'expert': return props.theme.colors.primary + '20';
      case 'advanced': return props.theme.colors.secondary + '20';
      case 'intermediate': return props.theme.colors.accent + '20';
      default: return props.theme.colors.textSecondary + '20';
    }
  }};
  color: ${props => {
    switch (props.proficiency) {
      case 'expert': return props.theme.colors.primary;
      case 'advanced': return props.theme.colors.secondary;
      case 'intermediate': return props.theme.colors.accent;
      default: return props.theme.colors.text;
    }
  }};
  border-radius: ${props => props.theme.borderRadius};
  font-size: ${props => props.theme.typography.fontSize.small};
  font-weight: 500;
`;

const ProjectCard = styled.div<{ theme: any }>`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.textSecondary}20;
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.large};
  margin-bottom: ${props => props.theme.spacing.medium};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary}40;
    box-shadow: ${props => props.theme.shadows.medium};
    transform: translateY(-2px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ProjectImage = styled.img<{ theme: any }>`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: ${props => props.theme.borderRadius};
  margin-bottom: ${props => props.theme.spacing.medium};
`;

const ContactInfo = styled.div<{ theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.medium};
`;

const ContactItem = styled.div<{ theme: any }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.small};
  padding: ${props => props.theme.spacing.medium};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.textSecondary}20;
  border-radius: ${props => props.theme.borderRadius};
`;

const CloseButton = styled(BaseButton) <{ theme: any }>`
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border: none;
  padding: ${props => props.theme.spacing.small};
  min-height: ${touchFriendly.minTouchTarget};
  min-width: ${touchFriendly.minTouchTarget};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => props.theme.colors.textSecondary}10;
    color: ${props => props.theme.colors.text};
    transform: none;
  }

  &:focus-visible {
    ${props => createAccessibleFocusStyles(props.theme.colors.accent)};
    background: ${props => props.theme.colors.textSecondary}20;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border: 2px solid currentColor;
    
    &:focus-visible {
      outline: 3px solid;
      outline-offset: 2px;
    }
  }
`;

const ErrorContainer = styled.div<{ theme: any }>`
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.large};
  margin: ${props => props.theme.spacing.medium} 0;
  color: #dc2626;
`;

const LoadingContainer = styled.div<{ theme: any }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xlarge};
  color: ${props => props.theme.colors.textSecondary};
`;

const LoadingSpinner = styled.div<{ theme: any }>`
  width: 32px;
  height: 32px;
  border: 3px solid ${props => props.theme.colors.textSecondary}20;
  border-top: 3px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: ${props => props.theme.spacing.medium};
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SafeImage = styled.img<{ theme: any }>`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: ${props => props.theme.borderRadius};
  margin-bottom: ${props => props.theme.spacing.medium};
  
  &[data-error="true"] {
    display: none;
  }
`;

const ImageFallback = styled.div<{ theme: any }>`
  width: 100%;
  height: 150px;
  background: ${props => props.theme.colors.textSecondary}10;
  border-radius: ${props => props.theme.borderRadius};
  margin-bottom: ${props => props.theme.spacing.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.small};
`;

// Safe image component with error handling
const SafeProjectImage: React.FC<{ src?: string; alt: string; theme: any }> = ({ src, alt, theme }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setHasError(false);
    setIsLoading(false);
  };

  if (!src || hasError) {
    return (
      <ImageFallback theme={theme}>
        📷 Image not available
      </ImageFallback>
    );
  }

  return (
    <>
      {isLoading && (
        <ImageFallback theme={theme}>
          Loading image...
        </ImageFallback>
      )}
      <SafeImage
        src={src}
        alt={alt}
        theme={theme}
        onError={handleImageError}
        onLoad={handleImageLoad}
        data-error={hasError}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </>
  );
};



const ProfileModal: React.FC<ProfileModalProps & { visibleSection?: string | null }> = ({
  isOpen,
  onClose,
  profile,
  styling,
  visibleSection
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [modalError, setModalError] = useState<ProfileError | null>(null);
  const [validatedProfile, setValidatedProfile] = useState<ExtendedProfileData | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Accessibility state and hooks
  const [modalTitleId] = useState(() => generateAccessibleId('modal-title'));
  const [modalDescId] = useState(() => generateAccessibleId('modal-desc'));
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { announcement, announce } = useScreenReaderAnnouncement();

  // Animation variants (respecting reduced motion preferences)
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.95,
      y: prefersReducedMotion ? 0 : 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0
    },
    exit: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.95,
      y: prefersReducedMotion ? 0 : 20
    }
  };

  // Validate and sanitize profile data when modal opens
  useEffect(() => {
    if (isOpen && profile) {
      try {
        setIsDataLoading(true);
        announce('Loading detailed profile information...', 'polite');

        const validation = validateExtendedProfileData(profile);

        if (!validation.isValid) {
          const error = createProfileError(
            ProfileErrorType.DATA_VALIDATION_ERROR,
            'Profile data validation failed',
            { errors: validation.errors, originalProfile: profile }
          );
          setModalError(error);
          announce('Error loading profile data. Some information may be incomplete.', 'assertive');
        }

        setValidatedProfile(validation.sanitizedData);
        setIsDataLoading(false);

        if (validation.isValid) {
          announce(`Profile details loaded for ${validation.sanitizedData.name}`, 'polite');
        }
      } catch (error) {
        const profileError = createProfileError(
          ProfileErrorType.DATA_VALIDATION_ERROR,
          `Failed to process profile data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          { originalProfile: profile }
        );
        setModalError(profileError);
        setIsDataLoading(false);
        announce('Failed to load profile details due to an error.', 'assertive');
      }
    }
  }, [isOpen, profile, announce]);

  // Enhanced keyboard and focus management with comprehensive accessibility
  useEffect(() => {
    if (isOpen) {
      try {
        // Focus the modal container for screen readers
        setTimeout(() => {
          try {
            focusTrapRef.current?.focus();
          } catch (error) {
            createProfileError(
              ProfileErrorType.MODAL_INTERACTION_ERROR,
              'Failed to focus modal',
              { error: error instanceof Error ? error.message : 'Unknown error' }
            );
          }
        }, 100);

        // Prevent body scroll and hide background content from screen readers
        document.body.style.overflow = 'hidden';

        // Set aria-hidden on background content
        const mainContent = document.querySelector('main, #root > div:not([role="dialog"])');
        if (mainContent) {
          mainContent.setAttribute('aria-hidden', 'true');
        }

        announce('Modal dialog opened. Use Escape key to close.', 'polite');
      } catch (error) {
        handleModalError(error instanceof Error ? error : new Error('Modal setup failed'), (err) => {
          setModalError(err);
        });
      }
    } else {
      document.body.style.overflow = 'unset';

      // Remove aria-hidden from background content
      const mainContent = document.querySelector('main, #root > div:not([role="dialog"])');
      if (mainContent) {
        mainContent.removeAttribute('aria-hidden');
      }
    }

    return () => {
      try {
        document.body.style.overflow = 'unset';

        // Ensure aria-hidden is removed on cleanup
        const mainContent = document.querySelector('main, #root > div:not([role="dialog"])');
        if (mainContent) {
          mainContent.removeAttribute('aria-hidden');
        }
      } catch (error) {
        // Silent cleanup error - don't propagate
        console.warn('Modal cleanup error:', error);
      }
    };
  }, [isOpen, focusTrapRef, announce]);

  // Enhanced backdrop click handling with error recovery
  const handleBackdropClick = (event: React.MouseEvent) => {
    try {
      if (event.target === event.currentTarget) {
        announce('Modal closed by clicking outside.', 'polite');
        onClose();
      }
    } catch (error) {
      handleModalError(error instanceof Error ? error : new Error('Backdrop click failed'), (err) => {
        setModalError(err);
      });

      // Force close modal as fallback
      onClose();
    }
  };

  // Safe close handler with error recovery and accessibility
  const handleSafeClose = () => {
    try {
      announce('Modal closed.', 'polite');
      onClose();
    } catch (error) {
      handleModalError(error instanceof Error ? error : new Error('Modal close failed'), (err) => {
        setModalError(err);
      });

      // Force close by removing modal from DOM
      setModalError(null);
      setValidatedProfile(null);
    }
  };

  // Keyboard navigation for modal
  const handleModalKeyDown = useKeyboardNavigation(
    undefined, // No Enter handler for modal container
    undefined, // No Space handler for modal container
    handleSafeClose // Escape key closes modal
  );

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
        >
          <ModalOverlay
            theme={styling}
            onClick={handleBackdropClick}
            onKeyDown={handleModalKeyDown}
            data-testid="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            aria-describedby={modalDescId}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={prefersReducedMotion ?
                { duration: 0.1 } :
                {
                  type: "spring",
                  damping: 25,
                  stiffness: 300
                }
              }
            >
              <ModalContent
                theme={styling}
                ref={focusTrapRef}
                tabIndex={-1}
                data-testid="modal-content"
                onClick={(e) => e.stopPropagation()}
                role="document"
              >
                {/* Modal Header */}
                <ModalHeader theme={styling}>
                  <Heading level={2} theme={styling} id={modalTitleId}>
                    About {validatedProfile?.name || 'Profile'}
                  </Heading>
                  <CloseButton
                    theme={styling}
                    onClick={handleSafeClose}
                    aria-label={`Close profile details for ${validatedProfile?.name || 'profile'}`}
                    data-testid="modal-close-button"
                    title="Close modal (Escape key)"
                  >
                    <span aria-hidden="true">✕</span>
                    <span style={{
                      position: 'absolute',
                      left: '-10000px',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden'
                    }}>
                      Close
                    </span>
                  </CloseButton>
                </ModalHeader>

                {/* Modal Body */}
                <ModalBody
                  theme={styling}
                  className="profile-modal-content"
                  id={modalDescId}
                  role="main"
                  aria-label="Profile details content"
                >
                  {/* Error Display */}
                  {modalError && (
                    <ErrorContainer theme={styling}>
                      <Heading level={4} theme={styling} style={{ color: '#dc2626', marginBottom: '0.5rem' }}>
                        Something went wrong
                      </Heading>
                      <Text variant="body" theme={styling} style={{ color: '#dc2626' }}>
                        {modalError.message}
                      </Text>
                      <BaseButton
                        theme={styling}
                        onClick={() => setModalError(null)}
                        variant="outline"
                        size="small"
                        style={{ marginTop: '1rem', borderColor: '#dc2626', color: '#dc2626' }}
                      >
                        Dismiss
                      </BaseButton>
                    </ErrorContainer>
                  )}

                  {/* Loading State */}
                  {isDataLoading && (
                    <LoadingContainer theme={styling}>
                      <LoadingSpinner theme={styling} />
                      <Text variant="body" theme={styling}>Loading profile information...</Text>
                    </LoadingContainer>
                  )}

                  {/* Profile Content */}
                  {!isDataLoading && validatedProfile && (
                    <>
                      {/* Contact Information */}
                      {(validatedProfile.contact || validatedProfile.social) && (!visibleSection || visibleSection === 'contact') && (
                        <Section theme={styling}>
                          <SectionHeader theme={styling}>
                            <Heading level={3} theme={styling}>Contact Information</Heading>
                          </SectionHeader>
                          <ContactInfo theme={styling}>
                            {validatedProfile.contact?.email && (
                              <ContactItem theme={styling}>
                                <Text variant="body" theme={styling}>📧</Text>
                                <Text variant="body" theme={styling}>{validatedProfile.contact.email}</Text>
                              </ContactItem>
                            )}
                            {validatedProfile.contact?.phone && (
                              <ContactItem theme={styling}>
                                <Text variant="body" theme={styling}>📱</Text>
                                <Text variant="body" theme={styling}>{validatedProfile.contact.phone}</Text>
                              </ContactItem>
                            )}
                            {validatedProfile.contact?.location && (
                              <ContactItem theme={styling}>
                                <Text variant="body" theme={styling}>📍</Text>
                                <Text variant="body" theme={styling}>{validatedProfile.contact.location}</Text>
                              </ContactItem>
                            )}
                            {validatedProfile.social?.website && (
                              <ContactItem theme={styling}>
                                <Text variant="body" theme={styling}>🌐</Text>
                                <a
                                  href={validatedProfile.social.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: styling.colors.primary, textDecoration: 'none' }}
                                >
                                  Website
                                </a>
                              </ContactItem>
                            )}
                            {validatedProfile.social?.linkedin && (
                              <ContactItem theme={styling}>
                                <Text variant="body" theme={styling}>💼</Text>
                                <a
                                  href={validatedProfile.social.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: styling.colors.primary, textDecoration: 'none' }}
                                >
                                  LinkedIn
                                </a>
                              </ContactItem>
                            )}
                            {validatedProfile.social?.github && (
                              <ContactItem theme={styling}>
                                <Text variant="body" theme={styling}>🔗</Text>
                                <a
                                  href={validatedProfile.social.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: styling.colors.primary, textDecoration: 'none' }}
                                >
                                  GitHub
                                </a>
                              </ContactItem>
                            )}
                          </ContactInfo>
                        </Section>
                      )}

                      {/* Experience Section */}
                      {validatedProfile.experience && validatedProfile.experience.length > 0 && (!visibleSection || visibleSection === 'experience') && (
                        <Section theme={styling}>
                          <SectionHeader theme={styling}>
                            <Heading level={3} theme={styling}>Professional Experience</Heading>
                          </SectionHeader>
                          {validatedProfile.experience.map((exp) => (
                            <ExperienceCard key={exp.id} theme={styling}>
                              <Flex direction="column" gap={styling.spacing.small} theme={styling}>
                                <Heading level={4} theme={styling}>{exp.position}</Heading>
                                <Text variant="subtitle" color="primary" theme={styling}>
                                  {exp.company} • {exp.duration}
                                </Text>
                                <Text variant="body" color="secondary" theme={styling}>
                                  {exp.description}
                                </Text>
                                {exp.technologies && exp.technologies.length > 0 && (
                                  <div style={{ marginTop: styling.spacing.medium }}>
                                    <Text variant="caption" color="secondary" theme={styling} style={{ marginBottom: styling.spacing.small, display: 'block' }}>
                                      Technologies:
                                    </Text>
                                    <div>
                                      {exp.technologies.map((tech, index) => (
                                        <SkillTag key={index} theme={styling}>
                                          {tech}
                                        </SkillTag>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </Flex>
                            </ExperienceCard>
                          ))}
                        </Section>
                      )}

                      {/* Skills Section */}
                      {validatedProfile.skills && validatedProfile.skills.length > 0 && (!visibleSection || visibleSection === 'skills') && (
                        <Section theme={styling}>
                          <SectionHeader theme={styling}>
                            <Heading level={3} theme={styling}>Skills & Technologies</Heading>
                          </SectionHeader>
                          <Grid columns={2} gap={styling.spacing.large} theme={styling}>
                            {validatedProfile.skills.map((skillCategory, index) => (
                              <div key={index}>
                                <Heading level={4} theme={styling} style={{ marginBottom: styling.spacing.medium }}>
                                  {skillCategory.category}
                                  {skillCategory.proficiency && (
                                    <Text
                                      variant="caption"
                                      color="secondary"
                                      theme={styling}
                                      style={{ marginLeft: styling.spacing.small, textTransform: 'capitalize' }}
                                    >
                                      ({skillCategory.proficiency})
                                    </Text>
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
                              </div>
                            ))}
                          </Grid>
                        </Section>
                      )}

                      {/* Certifications Section */}
                      {validatedProfile.certifications && validatedProfile.certifications.length > 0 && (!visibleSection || visibleSection === 'certifications') && (
                        <Section theme={styling}>
                          <SectionHeader theme={styling}>
                            <Heading level={3} theme={styling}>Certifications</Heading>
                          </SectionHeader>
                          <Grid columns={1} gap={styling.spacing.medium} theme={styling}>
                            {validatedProfile.certifications.map((cert) => (
                              <ExperienceCard key={cert.id} theme={styling} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {cert.logo && (
                                  <img
                                    src={cert.logo}
                                    alt={`${cert.issuer} logo`}
                                    style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                                  />
                                )}
                                <div style={{ flex: 1 }}>
                                  <Heading level={4} theme={styling}>
                                    {cert.link ? (
                                      <a href={cert.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                        {cert.name} 🔗
                                      </a>
                                    ) : (
                                      cert.name
                                    )}
                                  </Heading>
                                  <Text variant="subtitle" color="secondary" theme={styling}>
                                    {cert.issuer} • {cert.date}
                                  </Text>
                                </div>
                              </ExperienceCard>
                            ))}
                          </Grid>
                        </Section>
                      )}

                      {/* Projects Section */}
                      {validatedProfile.projects && validatedProfile.projects.length > 0 && (!visibleSection || visibleSection === 'projects') && (
                        <Section theme={styling}>
                          <SectionHeader theme={styling}>
                            <Heading level={3} theme={styling}>Featured Projects</Heading>
                          </SectionHeader>
                          <Grid columns={1} gap={styling.spacing.large} theme={styling}>
                            {validatedProfile.projects.map((project) => (
                              <ProjectCard key={project.id} theme={styling}>
                                <SafeProjectImage
                                  src={project.image}
                                  alt={`${project.name} screenshot`}
                                  theme={styling}
                                />
                                <Flex direction="column" gap={styling.spacing.small} theme={styling}>
                                  <Flex justify="space-between" align="center" theme={styling}>
                                    <Heading level={4} theme={styling}>{project.name}</Heading>
                                    {project.link && (
                                      <BaseButton
                                        as="a"
                                        href={project.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="outline"
                                        size="small"
                                        theme={styling}
                                      >
                                        View Project
                                      </BaseButton>
                                    )}
                                  </Flex>
                                  <Text variant="body" color="secondary" theme={styling}>
                                    {project.description}
                                  </Text>
                                  <div style={{ marginTop: styling.spacing.medium }}>
                                    <Text variant="caption" color="secondary" theme={styling} style={{ marginBottom: styling.spacing.small, display: 'block' }}>
                                      Technologies:
                                    </Text>
                                    <div>
                                      {project.technologies.map((tech, index) => (
                                        <SkillTag key={index} theme={styling}>
                                          {tech}
                                        </SkillTag>
                                      ))}
                                    </div>
                                  </div>
                                </Flex>
                              </ProjectCard>
                            ))}
                          </Grid>
                        </Section>
                      )}

                      {/* Education Section */}
                      {validatedProfile.education && validatedProfile.education.length > 0 && (
                        <Section theme={styling}>
                          <SectionHeader theme={styling}>
                            <Heading level={3} theme={styling}>Education</Heading>
                          </SectionHeader>
                          {validatedProfile.education.map((edu) => (
                            <ExperienceCard key={edu.id} theme={styling}>
                              <Flex direction="column" gap={styling.spacing.small} theme={styling}>
                                <Heading level={4} theme={styling}>
                                  {edu.degree} in {edu.field}
                                </Heading>
                                <Text variant="subtitle" color="primary" theme={styling}>
                                  {edu.institution} • {edu.duration}
                                </Text>
                                {edu.description && (
                                  <Text variant="body" color="secondary" theme={styling}>
                                    {edu.description}
                                  </Text>
                                )}
                              </Flex>
                            </ExperienceCard>
                          ))}
                        </Section>
                      )}

                      {/* Achievements Section */}
                      {validatedProfile.achievements && validatedProfile.achievements.length > 0 && (
                        <Section theme={styling}>
                          <SectionHeader theme={styling}>
                            <Heading level={3} theme={styling}>Achievements & Certifications</Heading>
                          </SectionHeader>
                          <Grid columns={1} gap={styling.spacing.medium} theme={styling}>
                            {validatedProfile.achievements.map((achievement) => (
                              <ExperienceCard key={achievement.id} theme={styling}>
                                <Flex direction="column" gap={styling.spacing.small} theme={styling}>
                                  <Flex justify="space-between" align="flex-start" theme={styling}>
                                    <Heading level={4} theme={styling}>{achievement.title}</Heading>
                                    <Text variant="caption" color="secondary" theme={styling}>
                                      {achievement.date}
                                    </Text>
                                  </Flex>
                                  <Text variant="body" color="secondary" theme={styling}>
                                    {achievement.description}
                                  </Text>
                                  {achievement.category && (
                                    <SkillTag theme={styling} proficiency="intermediate">
                                      {achievement.category}
                                    </SkillTag>
                                  )}
                                </Flex>
                              </ExperienceCard>
                            ))}
                          </Grid>
                        </Section>
                      )}
                    </>
                  )}

                  {/* Screen reader announcement area */}
                  <div
                    aria-live="polite"
                    aria-atomic="true"
                    style={{
                      position: 'absolute',
                      left: '-10000px',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden',
                    }}
                  >
                    {announcement}
                  </div>
                </ModalBody>
              </ModalContent>
            </motion.div>
          </ModalOverlay>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ProfileModal;