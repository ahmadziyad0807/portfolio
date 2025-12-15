import {
  validateMessage,
  validateSession,
  validateConversationContext,
  validateSessionConfig,
  validateChatbotConfig,
  validateKnowledgeEntry,
  validateChatRequest,
  isEmptyMessage,
  sanitizeMessageContent,
  ValidationError
} from './index';

import { createMessage, createSession, createKnowledgeEntry } from '../utils/index';

describe('Validation Functions', () => {
  describe('validateMessage', () => {
    it('should validate correct message objects', () => {
      const validMessage = createMessage('session-123', 'Hello world');
      expect(() => validateMessage(validMessage)).not.toThrow();
    });

    it('should reject invalid message objects', () => {
      expect(() => validateMessage(null)).toThrow(ValidationError);
      expect(() => validateMessage({})).toThrow(ValidationError);
      expect(() => validateMessage({ id: '', content: 'test' })).toThrow(ValidationError);
      expect(() => validateMessage({ id: 'test', content: '' })).toThrow(ValidationError);
      expect(() => validateMessage({ id: 'test', content: 'test', type: 'invalid' })).toThrow(ValidationError);
    });

    it('should validate message metadata', () => {
      const messageWithMetadata = {
        ...createMessage('session-123', 'Hello'),
        metadata: {
          confidence: 0.95,
          processingTime: 150,
          intent: 'greeting'
        }
      };
      expect(() => validateMessage(messageWithMetadata)).not.toThrow();

      const invalidMetadata = {
        ...createMessage('session-123', 'Hello'),
        metadata: {
          confidence: 1.5 // Invalid: > 1
        }
      };
      expect(() => validateMessage(invalidMetadata)).toThrow(ValidationError);
    });
  });

  describe('validateSession', () => {
    it('should validate correct session objects', () => {
      const validSession = createSession();
      expect(() => validateSession(validSession)).not.toThrow();
    });

    it('should reject invalid session objects', () => {
      expect(() => validateSession(null)).toThrow(ValidationError);
      expect(() => validateSession({})).toThrow(ValidationError);
      
      const invalidSession = {
        ...createSession(),
        startTime: new Date(),
        lastActivity: new Date(Date.now() - 1000) // Before start time
      };
      expect(() => validateSession(invalidSession)).toThrow(ValidationError);
    });
  });

  describe('validateConversationContext', () => {
    it('should validate correct context objects', () => {
      const validContext = {
        messages: [createMessage('session-123', 'Hello')],
        onboardingStep: 1
      };
      expect(() => validateConversationContext(validContext)).not.toThrow();
    });

    it('should reject invalid context objects', () => {
      expect(() => validateConversationContext(null)).toThrow(ValidationError);
      expect(() => validateConversationContext({ messages: 'not-array' })).toThrow(ValidationError);
      expect(() => validateConversationContext({ 
        messages: [{ invalid: 'message' }] 
      })).toThrow(ValidationError);
    });
  });

  describe('validateSessionConfig', () => {
    it('should validate correct config objects', () => {
      const validConfig = {
        maxMessages: 50,
        responseTimeout: 5000,
        voiceEnabled: true,
        language: 'en'
      };
      expect(() => validateSessionConfig(validConfig)).not.toThrow();
    });

    it('should reject invalid config objects', () => {
      expect(() => validateSessionConfig(null)).toThrow(ValidationError);
      expect(() => validateSessionConfig({ maxMessages: -1 })).toThrow(ValidationError);
      expect(() => validateSessionConfig({ 
        maxMessages: 50,
        responseTimeout: 5000,
        voiceEnabled: 'yes', // Should be boolean
        language: 'en'
      })).toThrow(ValidationError);
    });
  });

  describe('validateChatbotConfig', () => {
    it('should validate correct chatbot config objects', () => {
      const validConfig = {
        modelName: 'mistral-7b',
        maxContextLength: 4096,
        responseTimeout: 5000,
        voiceEnabled: true,
        knowledgeBase: ['faq.json', 'products.json'],
        styling: {
          primaryColor: '#007bff',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial',
          borderRadius: '8px',
          position: 'bottom-right' as const
        }
      };
      expect(() => validateChatbotConfig(validConfig)).not.toThrow();
    });

    it('should reject invalid chatbot config objects', () => {
      expect(() => validateChatbotConfig(null)).toThrow(ValidationError);
      expect(() => validateChatbotConfig({ modelName: '' })).toThrow(ValidationError);
      expect(() => validateChatbotConfig({ 
        modelName: 'test',
        maxContextLength: -1 
      })).toThrow(ValidationError);
    });
  });

  describe('validateKnowledgeEntry', () => {
    it('should validate correct knowledge entry objects', () => {
      const validEntry = createKnowledgeEntry('faq', 'What is this?', 'This is a test', ['test']);
      expect(() => validateKnowledgeEntry(validEntry)).not.toThrow();
    });

    it('should reject invalid knowledge entry objects', () => {
      expect(() => validateKnowledgeEntry(null)).toThrow(ValidationError);
      expect(() => validateKnowledgeEntry({ category: 'invalid' })).toThrow(ValidationError);
      expect(() => validateKnowledgeEntry({
        id: 'test',
        category: 'faq',
        question: '',
        answer: 'test',
        keywords: [],
        lastUpdated: new Date()
      })).toThrow(ValidationError);
    });
  });

  describe('validateChatRequest', () => {
    it('should validate correct chat request objects', () => {
      const validRequest = {
        sessionId: 'session-123',
        message: 'Hello world'
      };
      expect(() => validateChatRequest(validRequest)).not.toThrow();
    });

    it('should reject invalid chat request objects', () => {
      expect(() => validateChatRequest(null)).toThrow(ValidationError);
      expect(() => validateChatRequest({ sessionId: '' })).toThrow(ValidationError);
      expect(() => validateChatRequest({ 
        sessionId: 'test',
        message: '' 
      })).toThrow(ValidationError);
    });
  });

  describe('isEmptyMessage', () => {
    it('should correctly identify empty messages', () => {
      expect(isEmptyMessage('')).toBe(true);
      expect(isEmptyMessage('   ')).toBe(true);
      expect(isEmptyMessage('\t\n')).toBe(true);
      expect(isEmptyMessage('hello')).toBe(false);
      expect(isEmptyMessage('  hello  ')).toBe(false);
    });
  });

  describe('sanitizeMessageContent', () => {
    it('should sanitize message content correctly', () => {
      expect(sanitizeMessageContent('  hello   world  ')).toBe('hello world');
      expect(sanitizeMessageContent('hello\t\tworld')).toBe('hello world');
      expect(sanitizeMessageContent('')).toBe('');
      expect(sanitizeMessageContent(null as any)).toBe('');
    });
  });
});