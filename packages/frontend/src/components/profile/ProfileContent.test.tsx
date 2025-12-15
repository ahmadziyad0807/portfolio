// ProfileContent component tests
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import ProfileContent from './ProfileContent';
import { defaultTheme } from '../../styles/theme';
import { TypographyStyling } from '../../types/profile';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useInView: () => true,
  useAnimation: () => ({
    start: jest.fn(),
  }),
}));

const mockStyling: TypographyStyling = {
  fontFamily: defaultTheme.typography.fontFamily,
  headingFont: defaultTheme.typography.headingFont,
  fontSize: defaultTheme.typography.fontSize,
  colors: {
    text: defaultTheme.colors.text,
    textSecondary: defaultTheme.colors.textSecondary,
  },
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={defaultTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('ProfileContent', () => {
  const defaultProps = {
    name: 'John Doe',
    title: 'Software Engineer',
    description: 'A passionate developer with experience in React and TypeScript.',
    styling: mockStyling,
  };

  it('renders name, title, and description correctly', () => {
    renderWithTheme(<ProfileContent {...defaultProps} />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('John Doe');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Software Engineer');
    expect(screen.getByText('A passionate developer with experience in React and TypeScript.')).toBeInTheDocument();
  });

  it('shows expand button for long descriptions', () => {
    const longDescription = 'This is a very long description that should trigger the expand functionality. '.repeat(10);
    
    renderWithTheme(
      <ProfileContent 
        {...defaultProps} 
        description={longDescription}
      />
    );
    
    expect(screen.getByText('Read More')).toBeInTheDocument();
  });

  it('expands and collapses description when expand button is clicked', () => {
    const longDescription = 'This is a very long description that should trigger the expand functionality. '.repeat(10);
    
    renderWithTheme(
      <ProfileContent 
        {...defaultProps} 
        description={longDescription}
      />
    );
    
    const expandButton = screen.getByText('Read More');
    fireEvent.click(expandButton);
    
    expect(screen.getByText('Show Less')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Show Less'));
    expect(screen.getByText('Read More')).toBeInTheDocument();
  });

  it('does not show expand button for short descriptions', () => {
    renderWithTheme(<ProfileContent {...defaultProps} />);
    
    expect(screen.queryByText('Read More')).not.toBeInTheDocument();
    expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const longDescription = 'This is a very long description that should trigger the expand functionality. '.repeat(10);
    
    renderWithTheme(
      <ProfileContent 
        {...defaultProps} 
        description={longDescription}
      />
    );
    
    const expandButton = screen.getByText('Read More');
    expect(expandButton).toHaveAttribute('aria-label', 'Show more');
    
    fireEvent.click(expandButton);
    
    const collapseButton = screen.getByText('Show Less');
    expect(collapseButton).toHaveAttribute('aria-label', 'Show less');
  });

  it('handles keyboard navigation for expand functionality', () => {
    const longDescription = 'This is a very long description that should trigger the expand functionality. '.repeat(10);
    
    renderWithTheme(
      <ProfileContent 
        {...defaultProps} 
        description={longDescription}
      />
    );
    
    // Find the text element that has keyboard navigation (the paragraph with role="button")
    const textElement = screen.getByRole('button', { name: /Click to expand/ });
    fireEvent.keyDown(textElement, { key: 'Enter' });
    
    expect(screen.getByText('Show Less')).toBeInTheDocument();
  });
});