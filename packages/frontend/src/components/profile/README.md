# Profile Section Components

This directory contains the personal profile section components for the chatbot application.

## Structure

```
profile/
├── index.ts                    # Main exports
├── ProfileSection.tsx          # Main container component
├── ProfileCard.tsx            # Content container component
├── ProfileImage.tsx           # Image display component
├── ProfileContent.tsx         # Text content component
├── ActionButton.tsx           # Interactive button component
├── ProfileModal.tsx           # Extended information modal
├── ProfileSection.test.tsx    # Component tests
├── types.test.ts             # Type validation tests
└── README.md                 # This file
```

## Data Models

### Core Types
- `ProfileData` - Basic profile information
- `ExtendedProfileData` - Comprehensive profile with experience, skills, projects
- `ProfileStyling` - Theme and styling configuration

### Component Props
- `ProfileSectionProps` - Main container props
- `ProfileCardProps` - Card component props
- `ProfileImageProps` - Image component props
- `ProfileContentProps` - Content component props
- `ActionButtonProps` - Button component props
- `ProfileModalProps` - Modal component props

## Styling System

The profile section uses a modern design system with:
- **Styled Components** for CSS-in-JS styling
- **Responsive breakpoints** for mobile-first design
- **Modern gradients and shadows** for visual appeal
- **Typography hierarchy** for content organization
- **Animation support** with Framer Motion
- **Accessibility features** built-in

## Sample Data

Sample profile data is available in `../../data/sampleProfile.ts` for development and testing.

## Usage

```tsx
import { ProfileSection } from './components/profile';
import { sampleProfileData } from './data/sampleProfile';
import { defaultTheme } from './styles/theme';

function App() {
  return (
    <ProfileSection 
      profile={sampleProfileData}
      styling={defaultTheme}
      onModalOpen={() => console.log('Modal opened')}
      onModalClose={() => console.log('Modal closed')}
    />
  );
}
```

## Development Status

✅ **Task 1 Complete**: Component structure and data models set up
- TypeScript interfaces created
- Component directory structure established
- Base styled-components configuration ready
- Sample data and theme configuration available

🔄 **Next Tasks**: Individual component implementations (Tasks 2-17)

## Requirements Addressed

- **Requirement 1.2**: Profile information display structure
- **Requirement 4.1**: Modern design system foundation
- **Requirement 4.2**: Typography hierarchy setup