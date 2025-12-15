// Basic test to verify ProfileSection component structure
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileSection from './ProfileSection';
import { sampleProfileData } from '../../data/sampleProfile';
import { defaultTheme } from '../../styles/theme';

describe('ProfileSection', () => {
  it('renders with sample profile data', () => {
    render(
      <ProfileSection 
        profile={sampleProfileData} 
        styling={defaultTheme}
      />
    );
    
    const profileSection = screen.getByTestId('profile-section');
    expect(profileSection).toBeInTheDocument();
    expect(screen.getByText(/Alex Johnson/)).toBeInTheDocument();
  });

  it('opens modal when "Know More About Me" button is clicked', () => {
    render(
      <ProfileSection 
        profile={sampleProfileData} 
        styling={defaultTheme}
      />
    );
    
    const button = screen.getByText(/Know More About Me/);
    fireEvent.click(button);
    
    // Check if modal is displayed with the actual ProfileModal content
    expect(screen.getByText(/About Alex Johnson/)).toBeInTheDocument();
    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
  });

  it('closes modal when backdrop is clicked', async () => {
    render(
      <ProfileSection 
        profile={sampleProfileData} 
        styling={defaultTheme}
      />
    );
    
    // Open modal
    const button = screen.getByText(/Know More About Me/);
    fireEvent.click(button);
    
    // Close modal by clicking backdrop
    const backdrop = screen.getByTestId('modal-overlay');
    fireEvent.click(backdrop);
    
    // Wait for modal to close (animation)
    await waitFor(() => {
      expect(screen.queryByText(/About Alex Johnson/)).not.toBeInTheDocument();
    });
  });

  it('calls onModalOpen and onModalClose callbacks', () => {
    const onModalOpen = jest.fn();
    const onModalClose = jest.fn();
    
    render(
      <ProfileSection 
        profile={sampleProfileData} 
        styling={defaultTheme}
        onModalOpen={onModalOpen}
        onModalClose={onModalClose}
      />
    );
    
    // Open modal
    const button = screen.getByText(/Know More About Me/);
    fireEvent.click(button);
    expect(onModalOpen).toHaveBeenCalledTimes(1);
    
    // Close modal using the close button
    const closeButton = screen.getByTestId('modal-close-button');
    fireEvent.click(closeButton);
    expect(onModalClose).toHaveBeenCalledTimes(1);
  });
});