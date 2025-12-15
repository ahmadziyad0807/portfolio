import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the main title', () => {
    render(<App />);
    const titleElement = screen.getByText(/LLM Chatbot Demo/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders the chat widget foundation content', () => {
    render(<App />);
    const foundationElement = screen.getByText(/Chat Widget Foundation/i);
    expect(foundationElement).toBeInTheDocument();
  });

  it('renders the configuration section', () => {
    render(<App />);
    const configElement = screen.getByText(/Widget Configuration/i);
    expect(configElement).toBeInTheDocument();
  });

  it('renders the chat widget', () => {
    render(<App />);
    const chatButton = screen.getByLabelText(/Open chat/i);
    expect(chatButton).toBeInTheDocument();
  });
});