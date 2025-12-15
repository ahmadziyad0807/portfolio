import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ProfileCard from './ProfileCard';
import {
  sampleProfiles,
  profileStylings
} from '../../data/sampleProfile';

const meta: Meta<typeof ProfileCard> = {
  title: 'Profile/ProfileCard',
  component: ProfileCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# ProfileCard Component

A modern card component that displays profile information with gradient backgrounds and responsive layout.

## Features

- **Modern Design**: Gradient borders, shadows, and smooth transitions
- **Responsive Layout**: CSS Grid with mobile-first approach
- **Interactive Effects**: Hover animations and visual feedback
- **Typography Hierarchy**: Clear visual hierarchy with gradient text
- **Image Optimization**: Responsive image sizing with fallbacks

## Layout Behavior

- **Mobile**: Single column, stacked layout with centered alignment
- **Tablet**: Two-column layout with image and content side-by-side
- **Desktop**: Optimized spacing and enhanced visual effects

## Accessibility

- Proper semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- High contrast color compliance
        `,
      },
    },
  },
  argTypes: {
    profile: {
      description: 'Profile data to display in the card',
      control: { type: 'object' },
    },
    styling: {
      description: 'Styling configuration for the card',
      control: { type: 'object' },
    },
    onActionClick: {
      description: 'Callback fired when action button is clicked',
      action: 'action clicked',
    },
    headingId: {
      description: 'ID for the heading element (accessibility)',
      control: { type: 'text' },
    },
    descriptionId: {
      description: 'ID for the description element (accessibility)',
      control: { type: 'text' },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProfileCard>;

// Default story
export const Default: Story = {
  args: {
    profile: sampleProfiles.developer.basic,
    styling: profileStylings.default,
    onActionClick: action('action-clicked'),
    headingId: 'profile-heading',
    descriptionId: 'profile-description',
  },
};

// Designer profile (Using developer profile as fallback)
export const Designer: Story = {
  args: {
    profile: sampleProfiles.developer.basic,
    styling: profileStylings.default,
    onActionClick: action('action-clicked'),
    headingId: 'designer-heading',
    descriptionId: 'designer-description',
  },
};

// Dark theme
export const DarkTheme: Story = {
  args: {
    profile: sampleProfiles.developer.basic,
    styling: profileStylings.dark,
    onActionClick: action('action-clicked'),
    headingId: 'dark-heading',
    descriptionId: 'dark-description',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// Minimal profile (Using developer profile as fallback)
export const MinimalProfile: Story = {
  args: {
    profile: sampleProfiles.developer.basic,
    styling: profileStylings.default,
    onActionClick: action('action-clicked'),
    headingId: 'minimal-heading',
    descriptionId: 'minimal-description',
  },
};

// Long content (Using developer as fallback)
export const LongContent: Story = {
  args: {
    profile: sampleProfiles.developer.basic,
    styling: profileStylings.default,
    onActionClick: action('action-clicked'),
    headingId: 'long-heading',
    descriptionId: 'long-description',
  },
};

// Mobile viewport
export const Mobile: Story = {
  args: {
    profile: sampleProfiles.developer.basic,
    styling: profileStylings.default,
    onActionClick: action('action-clicked'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};

// Tablet viewport
export const Tablet: Story = {
  args: {
    profile: sampleProfiles.developer.basic,
    styling: profileStylings.default,
    onActionClick: action('action-clicked'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

// Desktop large viewport
export const DesktopLarge: Story = {
  args: {
    profile: sampleProfiles.developer.basic,
    styling: profileStylings.default,
    onActionClick: action('action-clicked'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktopLarge',
    },
  },
};

// Without image (fallback state)
export const WithoutImage: Story = {
  args: {
    profile: {
      ...sampleProfiles.developer.basic,
      image: { src: '', alt: 'No image available' },
    },
    styling: profileStylings.default,
    onActionClick: action('action-clicked'),
  },
};

// Custom colors
export const CustomColors: Story = {
  args: {
    profile: sampleProfiles.developer.basic,
    styling: {
      ...profileStylings.default,
      colors: {
        ...profileStylings.default.colors,
        primary: '#7C3AED', // Violet-600
        secondary: '#EC4899', // Pink-500
        accent: '#F59E0B', // Amber-500
      },
      gradients: {
        primary: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
        secondary: 'linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)',
        background: 'linear-gradient(135deg, #FAF5FF 0%, #FDF2F8 100%)',
      },
    },
    onActionClick: action('action-clicked'),
  },
};

// Hover state demonstration
export const HoverEffects: Story = {
  args: {
    profile: sampleProfiles.developer.basic,
    styling: profileStylings.default,
    onActionClick: action('action-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: `
This story demonstrates the hover effects of the ProfileCard component:

- Card elevation and scale transform
- Image zoom effect
- Button animation
- Gradient text effects
- Shadow enhancements

Hover over the card to see the interactive effects in action.
      `,
      },
    },
  },
};

// Accessibility focused
export const AccessibilityFocused: Story = {
  args: {
    profile: sampleProfiles.developer.basic,
    styling: profileStylings.default,
    onActionClick: action('action-clicked'),
    headingId: 'accessible-heading',
    descriptionId: 'accessible-description',
  },
  parameters: {
    docs: {
      description: {
        story: `
This story highlights accessibility features:

- Semantic HTML structure
- Proper heading hierarchy
- ARIA labels and IDs
- Keyboard navigation
- High contrast colors
- Focus indicators

Test with keyboard navigation and screen readers.
      `,
      },
    },
  },
};