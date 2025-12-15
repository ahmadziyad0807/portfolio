import { ContextManager } from './contextManager';
import { Message, ConversationContext } from '@intelligenai/shared';

describe('ContextManager', () => {
  let contextManager: ContextManager;
  const sessionId = 'test-session-123';

  beforeEach(() => {
    contextManager = new ContextManager({
      maxMessages: 10,
      maxTokens: 1000,
      compressionThreshold: 5,
      retentionHours: 1
    });
  });

  describe('context creation and retrieval', () => {
    it('should return null for non-existent session', () => {
      const context = contextManager.getContext('non-existent');
      expect(context).toBeNull();
    });

    it('should create and update context with new message', () => {
      const message: Message = {
        id: 'msg-1',
        sessionId,
        content: 'Hello, world!',
        type: 'user',
        timestamp: new Date(),
        metadata: {
          intent: 'greeting'
        }
      };

      const context = contextManager.updateContext(sessionId, message);
      
      expect(context).toBeDefined();
      expect(context.messages).toHaveLength(1);
      expect(context.messages[0]).toEqual(message);
      expect(context.currentIntent).toBe('greeting');
    });

    it('should retrieve existing context', () => {
      const message: Message = {
        id: 'msg-1',
        sessionId,
        content: 'Hello, world!',
        type: 'user',
        timestamp: new Date()
      };

      contextManager.updateContext(sessionId, message);
      const context = contextManager.getContext(sessionId);
      
      expect(context).toBeDefined();
      expect(context!.messages).toHaveLength(1);
    });
  });

  describe('context optimization', () => {
    it('should optimize context when message limit is exceeded', () => {
      // Add messages beyond the maxMessages limit (10) to trigger optimization
      for (let i = 0; i < 12; i++) {
        const message: Message = {
          id: `msg-${i}`,
          sessionId,
          content: `Message ${i}`,
          type: i % 2 === 0 ? 'user' : 'assistant',
          timestamp: new Date()
        };
        contextManager.updateContext(sessionId, message);
      }

      const context = contextManager.getContext(sessionId);
      expect(context).toBeDefined();
      // Should have optimized to keep only maxMessages (10) + summary
      expect(context!.messages.length).toBeLessThanOrEqual(11); // 10 recent + 1 summary
    });
  });

  describe('user preferences', () => {
    it('should update user preferences', () => {
      const message: Message = {
        id: 'msg-1',
        sessionId,
        content: 'Hello',
        type: 'user',
        timestamp: new Date()
      };

      contextManager.updateContext(sessionId, message);
      contextManager.updateUserPreferences(sessionId, {
        preferredResponseLength: 'detailed',
        voiceEnabled: true
      });

      const context = contextManager.getContext(sessionId);
      expect(context!.userPreferences?.preferredResponseLength).toBe('detailed');
      expect(context!.userPreferences?.voiceEnabled).toBe(true);
    });
  });

  describe('onboarding and troubleshooting', () => {
    it('should update onboarding step', () => {
      const message: Message = {
        id: 'msg-1',
        sessionId,
        content: 'Hello',
        type: 'user',
        timestamp: new Date()
      };

      contextManager.updateContext(sessionId, message);
      contextManager.updateOnboardingStep(sessionId, 3);

      const context = contextManager.getContext(sessionId);
      expect(context!.onboardingStep).toBe(3);
    });

    it('should update troubleshooting state', () => {
      const message: Message = {
        id: 'msg-1',
        sessionId,
        content: 'Hello',
        type: 'user',
        timestamp: new Date()
      };

      contextManager.updateContext(sessionId, message);
      contextManager.updateTroubleshootingState(sessionId, {
        currentIssue: 'Login problem',
        attemptedSolutions: ['Clear cache', 'Reset password'],
        escalationLevel: 1
      });

      const context = contextManager.getContext(sessionId);
      expect(context!.troubleshootingState?.currentIssue).toBe('Login problem');
      expect(context!.troubleshootingState?.attemptedSolutions).toHaveLength(2);
      expect(context!.troubleshootingState?.escalationLevel).toBe(1);
    });
  });

  describe('context cleanup', () => {
    it('should clear specific context', () => {
      const message: Message = {
        id: 'msg-1',
        sessionId,
        content: 'Hello',
        type: 'user',
        timestamp: new Date()
      };

      contextManager.updateContext(sessionId, message);
      expect(contextManager.getContext(sessionId)).toBeDefined();

      contextManager.clearContext(sessionId);
      expect(contextManager.getContext(sessionId)).toBeNull();
    });

    it('should provide memory statistics', () => {
      const message: Message = {
        id: 'msg-1',
        sessionId,
        content: 'Hello',
        type: 'user',
        timestamp: new Date()
      };

      contextManager.updateContext(sessionId, message);
      const stats = contextManager.getMemoryStats();

      expect(stats.totalSessions).toBe(1);
      expect(stats.totalMessages).toBe(1);
      expect(stats.averageMessagesPerSession).toBe(1);
      expect(stats.memoryUsageEstimate).toBeDefined();
    });
  });

  describe('context summary', () => {
    it('should generate context summary', () => {
      const messages: Message[] = [
        {
          id: 'msg-1',
          sessionId,
          content: 'Hello',
          type: 'user',
          timestamp: new Date(Date.now() - 60000),
          metadata: { intent: 'greeting' }
        },
        {
          id: 'msg-2',
          sessionId,
          content: 'Hi there!',
          type: 'assistant',
          timestamp: new Date()
        }
      ];

      messages.forEach(msg => contextManager.updateContext(sessionId, msg));
      const summary = contextManager.getContextSummary(sessionId);

      expect(summary).toBeDefined();
      expect(summary!.messageCount).toBe(2);
      expect(summary!.keyTopics).toContain('greeting');
      expect(summary!.summary).toContain('1 question');
      expect(summary!.summary).toContain('1 response');
    });

    it('should return null summary for non-existent session', () => {
      const summary = contextManager.getContextSummary('non-existent');
      expect(summary).toBeNull();
    });
  });
});
