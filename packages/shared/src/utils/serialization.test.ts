import {
  serializeMessage,
  deserializeMessage,
  serializeSession,
  deserializeSession,
  serializeConversationContext,
  deserializeConversationContext,
  serializeChatbotConfig,
  deserializeChatbotConfig,
  serializeKnowledgeEntry,
  deserializeKnowledgeEntry,
  serializeChatRequest,
  deserializeChatRequest,
  serializeAPIResponse,
  deserializeAPIResponse,
  serializeMessages,
  deserializeMessages,
  serializeKnowledgeEntries,
  deserializeKnowledgeEntries,
  safeSerialize,
  safeDeserialize,
  SerializationError
} from './serialization';

import { createMessage, createSession, createKnowledgeEntry } from './index';

describe('Serialization Functions', () => {
  describe('Message serialization', () => {
    it('should serialize and deserialize messages correctly', () => {
      const originalMessage = createMessage('session-123', 'Hello world', 'user');
      const serialized = serializeMessage(originalMessage);
      const deserialized = deserializeMessage(serialized);
      
      expect(deserialized.id).toBe(originalMessage.id);
      expect(deserialized.sessionId).toBe(originalMessage.sessionId);
      expect(deserialized.content).toBe(originalMessage.content);
      expect(deserialized.type).toBe(originalMessage.type);
      expect(deserialized.timestamp.getTime()).toBe(originalMessage.timestamp.getTime());
    });

    it('should handle message metadata during serialization', () => {
      const messageWithMetadata = {
        ...createMessage('session-123', 'Hello'),
        metadata: {
          confidence: 0.95,
          processingTime: 150,
          intent: 'greeting'
        }
      };
      
      const serialized = serializeMessage(messageWithMetadata);
      const deserialized = deserializeMessage(serialized);
      
      expect(deserialized.metadata).toEqual(messageWithMetadata.metadata);
    });

    it('should throw SerializationError for invalid JSON', () => {
      expect(() => deserializeMessage('invalid json')).toThrow(SerializationError);
    });
  });

  describe('Session serialization', () => {
    it('should serialize and deserialize sessions correctly', () => {
      const originalSession = createSession('user-123', { maxMessages: 100 });
      originalSession.context.messages.push(createMessage(originalSession.id, 'Hello'));
      
      const serialized = serializeSession(originalSession);
      const deserialized = deserializeSession(serialized);
      
      expect(deserialized.id).toBe(originalSession.id);
      expect(deserialized.userId).toBe(originalSession.userId);
      expect(deserialized.startTime.getTime()).toBe(originalSession.startTime.getTime());
      expect(deserialized.lastActivity.getTime()).toBe(originalSession.lastActivity.getTime());
      expect(deserialized.configuration.maxMessages).toBe(100);
      expect(deserialized.context.messages).toHaveLength(1);
    });
  });

  describe('Conversation context serialization', () => {
    it('should serialize and deserialize conversation context correctly', () => {
      const originalContext = {
        messages: [
          createMessage('session-123', 'Hello'),
          createMessage('session-123', 'Hi there', 'assistant')
        ],
        currentIntent: 'greeting',
        onboardingStep: 1
      };
      
      const serialized = serializeConversationContext(originalContext);
      const deserialized = deserializeConversationContext(serialized);
      
      expect(deserialized.messages).toHaveLength(2);
      expect(deserialized.currentIntent).toBe('greeting');
      expect(deserialized.onboardingStep).toBe(1);
      expect(deserialized.messages[0].timestamp.getTime()).toBe(originalContext.messages[0].timestamp.getTime());
    });
  });

  describe('Chatbot config serialization', () => {
    it('should serialize and deserialize chatbot config correctly', () => {
      const originalConfig = {
        modelName: 'mistral-7b',
        maxContextLength: 4096,
        responseTimeout: 5000,
        voiceEnabled: true,
        knowledgeBase: ['faq.json'],
        styling: {
          primaryColor: '#007bff',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial',
          borderRadius: '8px',
          position: 'bottom-right' as const
        }
      };
      
      const serialized = serializeChatbotConfig(originalConfig);
      const deserialized = deserializeChatbotConfig(serialized);
      
      expect(deserialized).toEqual(originalConfig);
    });
  });

  describe('Knowledge entry serialization', () => {
    it('should serialize and deserialize knowledge entries correctly', () => {
      const originalEntry = createKnowledgeEntry(
        'faq',
        'What is this?',
        'This is a test',
        ['test', 'faq']
      );
      
      const serialized = serializeKnowledgeEntry(originalEntry);
      const deserialized = deserializeKnowledgeEntry(serialized);
      
      expect(deserialized.id).toBe(originalEntry.id);
      expect(deserialized.category).toBe(originalEntry.category);
      expect(deserialized.question).toBe(originalEntry.question);
      expect(deserialized.answer).toBe(originalEntry.answer);
      expect(deserialized.keywords).toEqual(originalEntry.keywords);
      expect(deserialized.lastUpdated.getTime()).toBe(originalEntry.lastUpdated.getTime());
    });
  });

  describe('Chat request serialization', () => {
    it('should serialize and deserialize chat requests correctly', () => {
      const originalRequest = {
        sessionId: 'session-123',
        message: 'Hello world',
        context: {
          messages: [createMessage('session-123', 'Previous message')],
          currentIntent: 'greeting'
        }
      };
      
      const serialized = serializeChatRequest(originalRequest);
      const deserialized = deserializeChatRequest(serialized);
      
      expect(deserialized.sessionId).toBe(originalRequest.sessionId);
      expect(deserialized.message).toBe(originalRequest.message);
      expect(deserialized.context?.currentIntent).toBe(originalRequest.context.currentIntent);
      expect(deserialized.context?.messages).toHaveLength(1);
    });

    it('should handle chat requests without context', () => {
      const originalRequest = {
        sessionId: 'session-123',
        message: 'Hello world'
      };
      
      const serialized = serializeChatRequest(originalRequest);
      const deserialized = deserializeChatRequest(serialized);
      
      expect(deserialized.sessionId).toBe(originalRequest.sessionId);
      expect(deserialized.message).toBe(originalRequest.message);
      expect(deserialized.context).toBeUndefined();
    });
  });

  describe('API response serialization', () => {
    it('should serialize and deserialize API responses correctly', () => {
      const originalResponse = {
        success: true,
        data: { message: 'Hello' },
        timestamp: new Date()
      };
      
      const serialized = serializeAPIResponse(originalResponse);
      const deserialized = deserializeAPIResponse(serialized);
      
      expect(deserialized.success).toBe(originalResponse.success);
      expect(deserialized.data).toEqual(originalResponse.data);
      expect(deserialized.timestamp.getTime()).toBe(originalResponse.timestamp.getTime());
    });
  });

  describe('Batch operations', () => {
    it('should serialize and deserialize message arrays correctly', () => {
      const originalMessages = [
        createMessage('session-123', 'Hello'),
        createMessage('session-123', 'World', 'assistant')
      ];
      
      const serialized = serializeMessages(originalMessages);
      const deserialized = deserializeMessages(serialized);
      
      expect(deserialized).toHaveLength(2);
      expect(deserialized[0].content).toBe('Hello');
      expect(deserialized[1].content).toBe('World');
      expect(deserialized[1].type).toBe('assistant');
    });

    it('should serialize and deserialize knowledge entry arrays correctly', () => {
      const originalEntries = [
        createKnowledgeEntry('faq', 'Question 1', 'Answer 1'),
        createKnowledgeEntry('product', 'Question 2', 'Answer 2')
      ];
      
      const serialized = serializeKnowledgeEntries(originalEntries);
      const deserialized = deserializeKnowledgeEntries(serialized);
      
      expect(deserialized).toHaveLength(2);
      expect(deserialized[0].category).toBe('faq');
      expect(deserialized[1].category).toBe('product');
    });

    it('should throw error for non-array input in batch operations', () => {
      expect(() => deserializeMessages('{"not": "array"}')).toThrow(SerializationError);
      expect(() => deserializeKnowledgeEntries('{"not": "array"}')).toThrow(SerializationError);
    });
  });

  describe('Safe serialization utilities', () => {
    it('should return null for failed serialization', () => {
      const circularObj: any = { circular: {} };
      circularObj.circular.self = circularObj;
      
      const safeResult = safeSerialize(circularObj, JSON.stringify);
      expect(safeResult).toBeNull();
    });

    it('should return null for failed deserialization', () => {
      const result = safeDeserialize('invalid json', JSON.parse);
      expect(result).toBeNull();
    });

    it('should return successful results when operations succeed', () => {
      const data = { test: 'value' };
      const serialized = safeSerialize(data, JSON.stringify);
      expect(serialized).toBe('{"test":"value"}');
      
      const deserialized = safeDeserialize(serialized!, JSON.parse);
      expect(deserialized).toEqual(data);
    });
  });
});