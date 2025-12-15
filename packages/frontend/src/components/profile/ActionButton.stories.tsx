import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ActionButton from './ActionButton';

const meta: Meta<typeof ActionButton> = {
  title: 'Profile/ActionButton',
  component: ActionButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# ActionButton Component

An interactive button component with modern design and comprehensive accessibility features.

## Features

- **Modern Design**: Gradient backgrounds, shadows, and smooth transitions
- **Interactive Effects**: Ripple animations, hover effects, and visual feedback
- **Accessibility**: Full keyboard navigation, ARIA labels, and screen reader support
- **Loading States**: Built-in loading spinner and disabled state handling
- **Touch Friendly**: Optimized touch targets for mobile devices
- **Variants**: Multiple visual styles (primary, secondary, outline)
- **Sizes**: Small, medium, and large size options

## Accessibility

- Keyboard navigation (Enter and Space key support)
- Focus indicators with high contrast support
- ARIA labels and states
- Screen reader announcements
- Touch-friendly minimum target sizes
- Reduced motion support

## Performance

- Optimized animations with reduced motion support
- Efficient ripple effect management
- Smooth transitions with hardware acceleration
        `,
      },
    },
  },
  argTypes: {
    text: {
      description: 'Button text content',
      control: { type: 'text' },
    },
    onClick: {
      description: 'Click event handler',
      action: 'clicked',
    },
    variant: {
      description: 'Visual style variant',
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline'],
    },
    size: {
      description: 'Size variant',
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    loading: {
      description: 'Loading state',
      control: { type: 'boolean' },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ActionButton>;

// Default story
export const Default: Story = {
  args: {
    text: 'Know More About Me',
    onClick: action('button-clicked'),
    variant: 'primary',
    size: 'medium',
    loading: false,
  },
};

// Primary variant
export const Primary: Story = {
  args: {
    text: 'Primary Button',
    onClick: action('primary-clicked'),
    variant: 'primary',
    size: 'medium',
    loading: false,
  },
};

// Secondary variant
export const Secondary: Story = {
  args: {
    text: 'Secondary Button',
    onClick: action('secondary-clicked'),
    variant: 'secondary',
    size: 'medium',
    loading: false,
  },
};

// Outline variant
export const Outline: Story = {
  args: {
    text: 'Outline Button',
    onClick: action('outline-clicked'),
    variant: 'outline',
    size: 'medium',
    loading: false,
  },
};

// Small size
export const Small: Story = {
  args: {
    text: 'Small Button',
    onClick: action('small-clicked'),
    variant: 'primary',
    size: 'small',
    loading: false,
  },
};

// Large size
export const Large: Story = {
  args: {
    text: 'Large Button',
    onClick: action('large-clicked'),
    variant: 'primary',
    size: 'large',
    loading: false,
  },
};

// Loading state
export const Loading: Story = {
  args: {
    text: 'Loading...',
    onClick: action('loading-clicked'),
    variant: 'primary',
    size: 'medium',
    loading: true,
  },
};

// Loading secondary
export const LoadingSecondary: Story = {
  args: {
    text: 'Processing',
    onClick: action('loading-secondary-clicked'),
    variant: 'secondary',
    size: 'medium',
    loading: true,
  },
};

// All variants comparison
export const VariantComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <ActionButton
        text="Primary"
        onClick={action('primary-variant-clicked')}
        variant="primary"
        size="medium"
      />
      <ActionButton
        text="Secondary"
        onClick={action('secondary-variant-clicked')}
        variant="secondary"
        size="medium"
      />
      <ActionButton
        text="Outline"
        onClick={action('outline-variant-clicked')}
        variant="outline"
        size="medium"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available button variants side by side.',
      },
    },
  },
};

// All sizes comparison
export const SizeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <ActionButton
        text="Small"
        onClick={action('small-size-clicked')}
        variant="primary"
        size="small"
      />
      <ActionButton
        text="Medium"
        onClick={action('medium-size-clicked')}
        variant="primary"
        size="medium"
      />
      <ActionButton
        text="Large"
        onClick={action('large-size-clicked')}
        variant="primary"
        size="large"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available button sizes side by side.',
      },
    },
  },
};

// Interactive states
export const InteractiveStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <ActionButton
        text="Normal"
        onClick={action('normal-clicked')}
        variant="primary"
        size="medium"
      />
      <ActionButton
        text="Loading"
        onClick={action('loading-clicked')}
        variant="primary"
        size="medium"
        loading={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of different interactive states including normal and loading.',
      },
    },
  },
};

// Mobile viewport
export const Mobile: Story = {
  args: {
    text: 'Mobile Button',
    onClick: action('mobile-clicked'),
    variant: 'primary',
    size: 'medium',
    loading: false,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Button optimized for mobile viewport with touch-friendly sizing.',
      },
    },
  },
};

// Long text handling
export const LongText: Story = {
  args: {
    text: 'This is a very long button text that should handle gracefully',
    onClick: action('long-text-clicked'),
    variant: 'primary',
    size: 'medium',
    loading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how the button handles longer text content.',
      },
    },
  },
};

// Accessibility focused
export const AccessibilityFocused: Story = {
  args: {
    text: 'Accessible Button',
    onClick: action('accessible-clicked'),
    variant: 'primary',
    size: 'medium',
    loading: false,
  },
  parameters: {
    docs: {
      description: {
        story: `
This story highlights accessibility features:

- Keyboard navigation (Tab, Enter, Space)
- Focus indicators with high contrast
- ARIA labels and states
- Screen reader compatibility
- Touch-friendly sizing
- Reduced motion support

Test with:
- Tab navigation
- Enter and Space keys
- Screen readers
- High contrast mode
        `,
      },
    },
  },
};

// Ripple effect demonstration
export const RippleEffect: Story = {
  args: {
    text: 'Click for Ripple',
    onClick: action('ripple-clicked'),
    variant: 'primary',
    size: 'large',
    loading: false,
  },
  parameters: {
    docs: {
      description: {
        story: `
Click this button to see the ripple effect animation.
The ripple effect respects the user's reduced motion preferences.
        `,
      },
    },
  },
};