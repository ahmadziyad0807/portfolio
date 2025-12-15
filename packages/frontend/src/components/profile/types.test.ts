// Test to verify all types and exports are working correctly
import {
  ProfileSection,
  ProfileCard,
  ProfileImage,
  ProfileContent,
  ActionButton,
  ProfileModal,
  ProfileData,
  ExtendedProfileData,
  ProfileStyling,
} from './index';

import { defaultTheme } from '../../styles/theme';
import { sampleProfileData, sampleExtendedProfileData } from '../../data/sampleProfile';

describe('Profile Types and Exports', () => {
  it('should export all components', () => {
    expect(ProfileSection).toBeDefined();
    expect(ProfileCard).toBeDefined();
    expect(ProfileImage).toBeDefined();
    expect(ProfileContent).toBeDefined();
    expect(ActionButton).toBeDefined();
    expect(ProfileModal).toBeDefined();
  });

  it('should have valid sample data that matches ProfileData interface', () => {
    // This test will fail at compile time if the interfaces don't match
    const profile: ProfileData = sampleProfileData;
    expect(profile.id).toBeDefined();
    expect(profile.name).toBeDefined();
    expect(profile.title).toBeDefined();
    expect(profile.description).toBeDefined();
    expect(profile.image).toBeDefined();
  });

  it('should have valid extended sample data that matches ExtendedProfileData interface', () => {
    // This test will fail at compile time if the interfaces don't match
    const extendedProfile: ExtendedProfileData = sampleExtendedProfileData;
    expect(extendedProfile.experience).toBeDefined();
    expect(extendedProfile.skills).toBeDefined();
    expect(extendedProfile.projects).toBeDefined();
    expect(extendedProfile.education).toBeDefined();
    expect(extendedProfile.achievements).toBeDefined();
  });

  it('should have valid theme that matches ProfileStyling interface', () => {
    // This test will fail at compile time if the interfaces don't match
    const theme: ProfileStyling = defaultTheme;
    expect(theme.colors).toBeDefined();
    expect(theme.gradients).toBeDefined();
    expect(theme.typography).toBeDefined();
    expect(theme.spacing).toBeDefined();
    expect(theme.borderRadius).toBeDefined();
    expect(theme.shadows).toBeDefined();
  });
});