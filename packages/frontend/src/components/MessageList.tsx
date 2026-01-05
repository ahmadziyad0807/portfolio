import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Message } from '../types/chat';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import { useTheme } from '../contexts/ThemeContext';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  primaryColor: string;
}

const MessageContainer = styled.div<{ $theme: any }>`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.$theme.glass.light};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.$theme.colors.textMuted};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.$theme.colors.textSecondary};
  }
`;

const EmptyState = styled.div<{ $theme: any }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  color: ${props => props.$theme.colors.textSecondary};
  padding: 20px;
  
  .icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.$theme.colors.text};
  }
  
  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
  }
`;

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  primaryColor
}) => {
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && messagesEndRef.current.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages, isLoading]);

  // Filter out welcome messages for display logic
  const displayMessages = messages.filter(msg =>
    !(msg.metadata?.intent === 'welcome' && messages.length === 1)
  );

  if (displayMessages.length === 0 && !isLoading) {
    return (
      <MessageContainer ref={containerRef} $theme={theme}>
        <EmptyState $theme={theme}>
          <div className="icon">💬</div>
          <h3>Start a conversation</h3>
          <p>Send a message to begin chatting with the assistant.</p>
        </EmptyState>
      </MessageContainer>
    );
  }

  return (
    <MessageContainer ref={containerRef} role="log" aria-label="Chat messages" $theme={theme}>
      {displayMessages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          primaryColor={primaryColor}
        />
      ))}

      {isLoading && (
        <TypingIndicator primaryColor={primaryColor} />
      )}

      <div ref={messagesEndRef} />
    </MessageContainer>
  );
};

export default MessageList;