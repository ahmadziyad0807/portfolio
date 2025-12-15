// ProfileSection - Main container for profile information
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { motion } from 'framer-motion';
import { ProfileData, ExtendedProfileData, ProfileStyling, ProfileSectionProps } from '../../types/profile';
import {
  validateProfileData,
  validateExtendedProfileData,
  createProfileError,
  ProfileErrorType,
  ProfileError,
  validateProfileStyling,
  handleResponsiveLayoutError,
  getSafeViewportDimensions
} from '../../utils/errorHandling';
import {
  usePrefersReducedMotion,
  useScreenReaderAnnouncement,
  createAccessibleFocusStyles,
  generateAccessibleId,
  validateColorAccessibility,
  KEYBOARD_KEYS
} from '../../utils/accessibility';
import { ProfileContainer, ProfileGlobalStyles } from '../../styles/styled';
import { defaultTheme } from '../../styles/theme';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import ProfileCard from './ProfileCard';
import ExpandableSection from './ExpandableSection';
import ProfileModal from './ProfileModal';
import {
  globalCSSManager
} from '../../utils/cssOptimization';
import {
  initializePerformanceMonitoring
} from '../../utils/performanceMonitoring';

// ... (keep styled components)
const ContentWrapper = styled.div<{ theme: ProfileStyling }>`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0;
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const UnifiedCard = styled(motion.div) <{ theme: ProfileStyling }>`
  max-width: 1200px;
  width: 100%;
  background: transparent;
  overflow: visible;
  position: relative;
  display: flex;
  flex-direction: column;
  border: none;
  box-shadow: none;
`;

// ... (previous styled components)



const ProfileSection: React.FC<ProfileSectionProps> = ({
  profile,
  styling = defaultTheme,
  onModalOpen,
  onModalClose,
  className,
  testId = 'profile-section'
}) => {
  // State for extended profile data (mocked for now, would come from API)
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfileData | null>(null);

  const [sectionError, setSectionError] = useState<ProfileError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModalSection, setActiveModalSection] = useState<string | null>(null);
  const [validatedProfile, setValidatedProfile] = useState(profile);
  const [validatedStyling, setValidatedStyling] = useState(styling);
  const [isInitialized, setIsInitialized] = useState(false);

  // ... (keep existing hooks)
  // Accessibility hooks
  const prefersReducedMotion = usePrefersReducedMotion();
  const { announcement, announce } = useScreenReaderAnnouncement();
  const sectionRef = useRef<HTMLDivElement>(null);
  const skipLinkRef = useRef<HTMLAnchorElement>(null);
  const [accessibilityId] = useState(() => generateAccessibleId('profile-section'));
  const [headingId] = useState(() => generateAccessibleId('profile-heading'));
  const [descriptionId] = useState(() => generateAccessibleId('profile-description'));

  // Performance monitoring refs
  const performanceCleanupRef = useRef<(() => void) | null>(null);

  // Use responsive layout hook for enhanced responsive behavior
  const layout = useResponsiveLayout();

  // ... (keep existing useEffects for validation and data loading)
  // Validate and sanitize props on mount and when they change
  useEffect(() => {
    try {
      // Validate profile data
      const profileValidation = validateProfileData(profile);
      if (!profileValidation.isValid) {
        const error = createProfileError(
          ProfileErrorType.DATA_VALIDATION_ERROR,
          'Profile data validation failed',
          { errors: profileValidation.errors, originalProfile: profile }
        );
        setSectionError(error);
        announce('Profile data validation failed. Using fallback information.', 'assertive');
      }
      setValidatedProfile(profileValidation.sanitizedData);

      // Validate styling and accessibility
      const validStyling = validateProfileStyling(styling);
      setValidatedStyling(validStyling);

      // Validate color accessibility
      const colorValidation = validateColorAccessibility(validStyling);
      if (!colorValidation.isValid) {
        console.warn('Profile section color accessibility issues:', colorValidation.issues);
      }

      setIsInitialized(true);
      announce(`Profile section loaded for ${profileValidation.sanitizedData.name}`, 'polite');

      // Initialize performance optimizations
      if (!performanceCleanupRef.current) {
        performanceCleanupRef.current = initializePerformanceMonitoring();
      }

      // Initialize CSS optimizations
      globalCSSManager.initialize().catch(error => {
        console.warn('CSS optimization initialization failed:', error);
      });

      setIsInitialized(true);
    } catch (error) {
      // Error handling...
      console.error(error);
    }
  }, [profile, styling, announce]);

  // Load extended profile data
  useEffect(() => {
    const loadExtendedProfile = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        // In a real app, this would fetch data based on profile.id
        const mockExtendedData: ExtendedProfileData = {
          ...profile,
          experience: [
            {
              id: '1',
              company: 'Tech Innovators Inc.',
              position: 'Senior AI Engineer',
              duration: '2020 - Present',
              description: 'Leading development of generative AI solutions.',
              technologies: ['Python', 'TensorFlow', 'React', 'Node.js']
            },
            {
              id: '2',
              company: 'Data Solutions Ltd.',
              position: 'Machine Learning Specialist',
              duration: '2018 - 2020',
              description: 'Implemented predictive models for financial sector.',
              technologies: ['Python', 'Scikit-learn', 'AWS', 'Docker']
            }
          ],
          skills: [
            { category: 'AI & ML', skills: ['Generative AI', 'NLP', 'Computer Vision'], proficiency: 'expert' },
            { category: 'Frontend', skills: ['React', 'TypeScript', 'Styled Components'], proficiency: 'advanced' },
            { category: 'Backend', skills: ['Node.js', 'Python', 'PostgreSQL'], proficiency: 'advanced' }
          ],
          projects: [
            {
              id: '1',
              name: 'IntelGenAI',
              description: 'A modular generative AI platform with agent capabilities.',
              technologies: ['React', 'Node.js', 'LangChain'],
              link: 'https://github.com/intelgenai/platform',
              image: 'https://placehold.co/600x400'
            }
          ],
          contact: {
            email: 'hello@intelgenai.dev',
            location: 'San Francisco, CA'
          },
          social: {
            github: 'https://github.com/intelgenai',
            linkedin: 'https://linkedin.com/company/intelgenai'
          },
          education: [],
          achievements: [],
          certifications: [
            {
              id: '1',
              name: 'TensorFlow Developer Certificate',
              issuer: 'Google',
              date: '2023',
              link: 'https://www.credential.net/',
              logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Tensorflow_logo.svg'
            },
            {
              id: '2',
              name: 'AWS Certified Machine Learning - Specialty',
              issuer: 'Amazon Web Services',
              date: '2022',
              link: 'https://aws.amazon.com/certification/certified-machine-learning-specialty/',
              logo: 'https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Machine-Learning-Specialty_badge.634f8a2b53e3c83748956877908077759d57a976.png'
            }
          ]
        };

        const validation = validateExtendedProfileData(mockExtendedData);
        if (!validation.isValid) {
          console.warn('Invalid extended profile data', validation.errors);
        }

        setExtendedProfile(validation.sanitizedData);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };

    loadExtendedProfile();
  }, [profile]);

  // ... (keep rest of methods)
  const handleSectionClick = (section: string) => {
    setActiveModalSection(section);
    announce(`Opening ${section} details`, 'polite');
    onModalOpen?.();
  };

  const handleCloseModal = () => {
    setActiveModalSection(null);
    announce('Closing profile details', 'polite');
    onModalClose?.();
  };

  return (
    <ThemeProvider theme={validatedStyling}>
      <div
        ref={sectionRef}
        style={{
          height: 'auto',
          minHeight: 'auto',
          overflow: 'visible',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none'
        }}
        id={accessibilityId}
        data-testid={testId}
        role="banner"
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
      >
        <ContentWrapper theme={validatedStyling}>
          <UnifiedCard
            theme={validatedStyling}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div id="profile-content">
              {/* Main Profile Card */}
              <ProfileCard
                profile={validatedProfile}
                styling={validatedStyling}
                headingId={headingId}
                descriptionId={descriptionId}
              />

              {/* Expandable Section (More About Me cards) */}
              {!isLoading && extendedProfile && (
                <ExpandableSection
                  onSectionClick={handleSectionClick}
                  profile={extendedProfile}
                  styling={validatedStyling}
                />
              )}
            </div>
          </UnifiedCard>
        </ContentWrapper>

        {/* Detail Modal */}
        {!isLoading && extendedProfile && (
          <ProfileModal
            isOpen={!!activeModalSection}
            onClose={handleCloseModal}
            profile={extendedProfile}
            styling={validatedStyling}
            visibleSection={activeModalSection}
          />
        )}
      </div>
    </ThemeProvider>
  );
};

export default ProfileSection;