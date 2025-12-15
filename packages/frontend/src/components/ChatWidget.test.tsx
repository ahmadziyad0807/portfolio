import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWidget from './ChatWidget';

// Mock scrollIntoView for JSDOM
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true,
});

describe('ChatWidget', () => {
  it('renders the chat toggle button', () => {
    render(<ChatWidget />);
    const toggleButton = screen.getByLabelText(/Open chat/i);
    expect(toggleButton).toBeInTheDocument();
  });

  it('opens the chat widget when toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);
    
    const toggleButton = screen.getByLabelText(/Open chat/i);
    
    await act(async () => {
      await user.click(toggleButton);
    });
    
    expect(screen.getByText(/Chat Assistant/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Close chat/i)).toBeInTheDocument();
  });

  it('displays welcome message when opened', async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);
    
    const toggleButton = screen.getByLabelText(/Open chat/i);
    
    await act(async () => {
      await user.click(toggleButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome!/i)).toBeInTheDocument();
    });
  });

  it('allows sending a message', async () => {
    const user = userEvent.setup();
    const mockOnMessage = jest.fn();
    render(<ChatWidget onMessage={mockOnMessage} />);
    
    // Open the chat
    const toggleButton = screen.getByLabelText(/Open chat/i);
    await act(async () => {
      await user.click(toggleButton);
    });
    
    // Wait for the input to be available
    await waitFor(() => {
      expect(screen.getByLabelText(/Type your message/i)).toBeInTheDocument();
    });
    
    // Type and send a message
    const input = screen.getByLabelText(/Type your message/i);
    await act(async () => {
      await user.type(input, 'Hello, chatbot!');
    });
    
    const sendButton = screen.getByLabelText(/Send message/i);
    await act(async () => {
      await user.click(sendButton);
    });
    
    expect(mockOnMessage).toHaveBeenCalledWith('Hello, chatbot!');
  });

  it('prevents sending empty messages', async () => {
    const user = userEvent.setup();
    const mockOnMessage = jest.fn();
    render(<ChatWidget onMessage={mockOnMessage} />);
    
    // Open the chat
    const toggleButton = screen.getByLabelText(/Open chat/i);
    await act(async () => {
      await user.click(toggleButton);
    });
    
    // Wait for the input to be available
    await waitFor(() => {
      expect(screen.getByLabelText(/Type your message/i)).toBeInTheDocument();
    });
    
    // Try to send an empty message
    const sendButton = screen.getByLabelText(/Send message/i);
    await act(async () => {
      await user.click(sendButton);
    });
    
    expect(mockOnMessage).not.toHaveBeenCalled();
  });

  it('applies custom styling configuration', () => {
    const customConfig = {
      styling: {
        primaryColor: '#ff0000',
        backgroundColor: '#f0f0f0',
        fontFamily: 'Arial, sans-serif',
        borderRadius: '12px',
        position: 'top-left' as const
      }
    };
    
    render(<ChatWidget config={customConfig} />);
    
    const widget = screen.getByRole('complementary');
    expect(widget).toBeInTheDocument();
    // The styling is applied via styled-components, so we can't easily test the computed styles
    // but we can verify the component renders without errors
  });

  it('handles configuration changes', () => {
    const mockOnConfigChange = jest.fn();
    const { rerender } = render(<ChatWidget onConfigChange={mockOnConfigChange} />);
    
    const newConfig = {
      voiceEnabled: true,
      styling: {
        primaryColor: '#00ff00',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        borderRadius: '8px',
        position: 'bottom-right' as const
      }
    };
    
    rerender(<ChatWidget config={newConfig} onConfigChange={mockOnConfigChange} />);
    
    // Component should render without errors with new config
    expect(screen.getByLabelText(/Open chat/i)).toBeInTheDocument();
  });
});