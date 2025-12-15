import type { Meta, StoryObj } from '@storybook/react';
import ProfileImage from './ProfileImage';

const meta: Meta<typeof ProfileImage> = {
  title: 'Profile/ProfileImage',
  component: ProfileImage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# ProfileImage Component

An optimized image display component with lazy loading, fallback handling, and accessibility features.

## Features

- **Lazy Loading**: Images load only when they enter the viewport
- **Optimization**: Automatic image optimization with WebP support and responsive sizing
- **Fallback Handling**: Graceful degradation with retry mechanism and fallback icons
- **Accessibility**: Proper ARIA labels, focus management, and screen reader support
- **Responsive**: Multiple size variants that adapt to different screen sizes
- **Shape Variants**: Circle, rounded, and square display options

## Performance

- Intersection Observer for lazy loading
- Automatic format optimization (WebP with JPEG fallback)
- Responsive image sizing with srcSet
- Progressive loading with skeleton states
- Error recovery with exponential backoff

## Accessibility

- Proper alt text handling
- Keyboard navigation support
- High contrast mode compatibility
- Screen reader announcements
- Focus indicators
        `,
      },
    },
  },
  argTypes: {
    src: {
      description: 'Image source URL',
      control: { type: 'text' },
    },
    alt: {
      description: 'Alternative text for accessibility',
      control: { type: 'text' },
    },
    size: {
      description: 'Size variant of the image',
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    shape: {
      description: 'Shape variant of the image',
      control: { type: 'select' },
      options: ['circle', 'rounded', 'square'],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProfileImage>;

// Default story
export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    alt: 'Professional headshot',
    size: 'medium',
    shape: 'rounded',
  },
};

// Circle shape
export const Circle: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    alt: 'Professional headshot - circle',
    size: 'medium',
    shape: 'circle',
  },
};

// Square shape
export const Square: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    alt: 'Professional headshot - square',
    size: 'medium',
    shape: 'square',
  },
};

// Small size
export const Small: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    alt: 'Small profile image',
    size: 'small',
    shape: 'circle',
  },
};

// Large size
export const Large: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    alt: 'Large profile image',
    size: 'large',
    shape: 'rounded',
  },
};

// Error state (broken image)
export const ErrorState: Story = {
  args: {
    src: 'https://invalid-url-that-will-fail.com/image.jpg',
    alt: 'Image that fails to load',
    size: 'medium',
    shape: 'circle',
  },
  parameters: {
    docs: {
      description: {
        story: `
This story demonstrates the error handling behavior when an image fails to load.
The component will show a fallback user icon and handle the error gracefully.
        `,
      },
    },
  },
};

// Loading state simulation
export const LoadingState: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&delay=3000',
    alt: 'Slow loading image',
    size: 'medium',
    shape: 'rounded',
  },
  parameters: {
    docs: {
      description: {
        story: `
This story simulates a slow-loading image to demonstrate the loading state
with shimmer animation effect.
        `,
      },
    },
  },
};

// All sizes comparison
export const SizeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <ProfileImage
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
          alt="Small size"
          size="small"
          shape="circle"
        />
        <p style={{ marginTop: '8px', fontSize: '14px' }}>Small</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <ProfileImage
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
          alt="Medium size"
          size="medium"
          shape="circle"
        />
        <p style={{ marginTop: '8px', fontSize: '14px' }}>Medium</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <ProfileImage
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
          alt="Large size"
          size="large"
          shape="circle"
        />
        <p style={{ marginTop: '8px', fontSize: '14px' }}>Large</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available size variants side by side.',
      },
    },
  },
};

// All shapes comparison
export const ShapeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <ProfileImage
          src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
          alt="Circle shape"
          size="medium"
          shape="circle"
        />
        <p style={{ marginTop: '8px', fontSize: '14px' }}>Circle</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <ProfileImage
          src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
          alt="Rounded shape"
          size="medium"
          shape="rounded"
        />
        <p style={{ marginTop: '8px', fontSize: '14px' }}>Rounded</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <ProfileImage
          src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
          alt="Square shape"
          size="medium"
          shape="square"
        />
        <p style={{ marginTop: '8px', fontSize: '14px' }}>Square</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available shape variants side by side.',
      },
    },
  },
};

// Mobile viewport
export const Mobile: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    alt: 'Mobile profile image',
    size: 'medium',
    shape: 'circle',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};

// Accessibility focused
export const AccessibilityFocused: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    alt: 'Professional headshot of Alex Johnson, Senior Full-Stack Developer',
    size: 'medium',
    shape: 'circle',
  },
  parameters: {
    docs: {
      description: {
        story: `
This story demonstrates accessibility features:

- Descriptive alt text
- Keyboard navigation (tab to focus)
- Screen reader compatibility
- High contrast support
- Focus indicators

Test with keyboard navigation and screen readers.
        `,
      },
    },
  },
};