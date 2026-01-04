// ChatBotWidget - Floating chat bot widget positioned at bottom right
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@intelligenai/shared';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { generateId } from '../utils/helpers';
import { useSpeech } from './VoiceInterface';
import { useTheme } from '../contexts/ThemeContext';

interface ChatBotWidgetProps {
  onChatOpen?: () => void;
  welcomeMessage?: string;
}

const WidgetContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  
  @media (max-width: 768px) {
    bottom: 1rem;
    right: 1rem;
  }
`;

const ChatButton = styled(motion.button)<{ $theme: any }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$theme.gradients.neural};
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: ${props => props.$theme.shadows.aiGlow};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${props => props.$theme.animations.duration.normal} ${props => props.$theme.animations.easing.smooth};
  position: relative;
  
  /* AI Neural pulse animation */
  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border-radius: 50%;
    background: ${props => props.$theme.gradients.quantum};
    opacity: 0.4;
    animation: ai-pulse 2s infinite;
    z-index: -1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;
    border-radius: 50%;
    background: ${props => props.$theme.gradients.cyber};
    opacity: 0.2;
    animation: ai-pulse 2s infinite 0.5s;
    z-index: -2;
  }
  
  @keyframes ai-pulse {
    0% {
      transform: scale(1);
      opacity: 0.4;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.1;
    }
    100% {
      transform: scale(1);
      opacity: 0.4;
    }
  }
  
  &:hover {
    transform: scale(1.15);
    box-shadow: ${props => props.$theme.shadows.aiGlow};
    
    &::before, &::after {
      animation-play-state: paused;
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
`;

const ChatPanel = styled(motion.div)<{ $theme: any }>`
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 400px;
  height: 600px;
  background: ${props => props.$theme.colors.background};
  backdrop-filter: ${props => props.$theme.glass.blur};
  border: 1px solid ${props => props.$theme.colors.aiCyan}30;
  border-radius: ${props => props.$theme.borderRadius.xl};
  box-shadow: ${props => props.$theme.shadows.floating};
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => props.$theme.gradients.neural};
  }
  
  @media (max-width: 768px) {
    width: calc(100vw - 2rem);
    height: 500px;
    right: -1rem;
    bottom: 70px;
  }
  
  @media (max-width: 480px) {
    width: calc(100vw - 1rem);
    height: 450px;
    right: -0.5rem;
  }
`;

const ChatHeader = styled.div<{ $theme: any }>`
  padding: 1rem 1.5rem;
  background: ${props => props.$theme.glass.light};
  border-bottom: 1px solid ${props => props.$theme.glass.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const ChatTitle = styled.h3<{ $theme: any }>`
  margin: 0;
  color: ${props => props.$theme.colors.text};
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button<{ $theme: any }>`
  background: none;
  border: none;
  color: ${props => props.$theme.colors.textSecondary};
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.$theme.colors.text};
    background: ${props => props.$theme.glass.light};
  }
`;

const ChatContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const ChatBotWidget: React.FC<ChatBotWidgetProps> = ({ onChatOpen, welcomeMessage }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { speak } = useSpeech();

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      onChatOpen?.();
    }
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  // Initialize session when widget opens
  useEffect(() => {
    const initSession = async () => {
      if (isOpen && !sessionId) {
        try {
          const response = await fetch('http://localhost:3001/api/chat/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'user-1' })
          });
          const result = await response.json();
          if (result.success) {
            setSessionId(result.data.sessionId);
          }
        } catch (error) {
          console.error('Failed to initialize chat session:', error);
        }
      }
    };

    initSession();

    // Add welcome message when widget first opens
    if (isOpen && messages.length === 0) {
      const defaultWelcome = "Hello! I'm here to help you with any questions about Ahmad Ziyad's profile, skills, or experience. How can I assist you today?";
      const welcomeMsg: Message = {
        id: generateId(),
        sessionId: sessionId || 'temp',
        content: welcomeMessage || defaultWelcome,
        type: 'assistant',
        timestamp: new Date(),
        metadata: {
          intent: 'welcome',
          confidence: 1.0
        }
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, messages.length, sessionId, welcomeMessage]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      sessionId,
      content: content.trim(),
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call the real API
      const response = await fetch('http://localhost:3001/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: content.trim()
        })
      });

      const result = await response.json();

      if (result.success && result.data.message) {
        const assistantMessage: Message = {
          ...result.data.message,
          timestamp: new Date(result.data.message.timestamp)
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Speak the response if voice is enabled
        speak(assistantMessage.content);
      } else {
        throw new Error(result.error || 'Failed to get response from AI');
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: generateId(),
        sessionId,
        content: "I'm sorry, I encountered an error processing your message. Please try again.",
        type: 'assistant',
        timestamp: new Date(),
        metadata: {
          intent: 'error',
          confidence: 1.0
        }
      };
      setMessages(prev => [...prev, errorMessage]);

      // Speak error message if voice is enabled
      speak(errorMessage.content);

      setIsLoading(false);
    }
  };

  return (
    <WidgetContainer>
      <AnimatePresence>
        {isOpen && (
          <ChatPanel
            $theme={theme}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <ChatHeader $theme={theme}>
              <ChatTitle $theme={theme}>
                💬 AI Assistant
              </ChatTitle>
              <CloseButton $theme={theme} onClick={handleCloseChat} aria-label="Close chat">
                ✕
              </CloseButton>
            </ChatHeader>
            <ChatContent>
              <MessageList
                messages={messages}
                isLoading={isLoading}
                primaryColor={theme.colors.aiBlue}
              />
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={isLoading}
                primaryColor={theme.colors.aiBlue}
                placeholder="Type your message..."
                voiceEnabled={false}
              />
            </ChatContent>
          </ChatPanel>
        )}
      </AnimatePresence>

      <ChatButton
        $theme={theme}
        onClick={handleToggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        title={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? '✕' : '💬'}
      </ChatButton>
    </WidgetContainer>
  );
};

export default ChatBotWidget;