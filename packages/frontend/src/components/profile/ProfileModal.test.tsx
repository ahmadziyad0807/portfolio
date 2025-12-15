// Basic test to verify ProfileModal component functionality
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileModal from './ProfileModal';
import { sampleExtendedProfileData } from '../../data/sampleProfile';
import { defaultTheme } from '../../styles/theme';

describe('ProfileModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    profile: sampleExtendedProfileData,
    styling: defaultTheme,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal content when open', () => {
    render(<ProfileModal {...defaultProps} />);
    
    expect(screen.getByText(/About Alex Johnson/)).toBeInTheDocument();
    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ProfileModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText(/About Alex Johnson/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
  });

  it('displays contact information', () => {
    render(<ProfileModal {...defaultProps} />);
    
    expect(screen.getByText(/Contact Information/)).toBeInTheDocument();
    expect(screen.getByText(/alex.johnson@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/San Francisco, CA/)).toBeInTheDocument();
  });

  it('displays professional experience', () => {
    render(<ProfileModal {...defaultProps} />);
    
    expect(screen.getByText(/Professional Experience/)).toBeInTheDocument();
    expect(screen.getByText(/Senior Full-Stack Developer/)).toBeInTheDocument();
    expect(screen.getByText(/TechCorp Inc./)).toBeInTheDocument();
  });

  it('displays skills and technologies', () => {
    render(<ProfileModal {...defaultProps} />);
    
    expect(screen.getByText(/Skills & Technologies/)).toBeInTheDocument();
    expect(screen.getAllByText(/Frontend/)).toHaveLength(2); // One in experience, one in skills
    expect(screen.getAllByText(/React/)).toHaveLength(4); // Multiple instances across experience and skills
  });

  it('displays featured projects', () => {
    render(<ProfileModal {...defaultProps} />);
    
    expect(screen.getByText(/Featured Projects/)).toBeInTheDocument();
    expect(screen.getByText(/E-commerce Platform/)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<ProfileModal {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByTestId('modal-close-button');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    render(<ProfileModal {...defaultProps} onClose={onClose} />);
    
    const backdrop = screen.getByTestId('modal-overlay');
    fireEvent.click(backdrop);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when modal content is clicked', () => {
    const onClose = jest.fn();
    render(<ProfileModal {...defaultProps} onClose={onClose} />);
    
    const modalContent = screen.getByTestId('modal-content');
    fireEvent.click(modalContent);
    
    expect(onClose).not.toHaveBeenCalled();
  });
});