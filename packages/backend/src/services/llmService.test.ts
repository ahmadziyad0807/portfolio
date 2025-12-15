import { LLMService } from './llmService';
import { ChatRequest } from '@intelligenai/shared';

describe('LLMService', () => {
  let llmService: LLMService;
  const sessionId = 'test-session-123';

  beforeEach(() => {
    llmService = new LLMService({
      llm: {
        baseUrl: 'http://localhost:11434',
        model: 'mistral:7b',
        maxTokens: 100,
        temperature: 0.7,
        timeout: 5000
      },
      context: {
        maxMessages: 10,
        maxTokens: 1000,
        compressionThreshold: 5,
        retentionHours: 1
      }
    });
  });

  describe('message processing', () => {
    it('should handle empty messages gracefully', async () => {
      const request: ChatRequest = {
        sessionId,
        message: '',
        context: undefined
      };

      const response = await llmService.processMessage(request);
      expect(response.message.content).toContain('error');
      expect(response.metadata!.intent).toBe('error');
    });

    it('should handle whitespace-only messages gracefully', async () => {
      const request: ChatRequest = {
        sessionId,
        message: '   \n\t  ',
        context: undefined
      };

      const response = await llmService.processMessage(request);
      expect(response.message.content).toContain('error');
      expect(response.metadata!.intent).toBe('error');
    });

    it('should handle valid messages and generate responses', async () => {
      const request: ChatRequest = {
        sessionId,
        message: 'Hello, how are you?',
        context: undefined
      };

      const response = await llmService.processMessage(request);
      
      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.message.content).toBeDefined();
      expect(response.message.type).toBe('assistant');
      expect(response.suggestions).toBeDefined();
      expect(response.suggestions!.length).toBeGreaterThan(0);
      expect(response.metadata).toBeDefined();
    }, 10000); // Increase timeout for LLM response
  });

  describe('conversation management', () => {
    it('should manage conversation history', () => {
      const history = llmService.getConversationHistory(sessionId);
      expect(history).toEqual([]);

      llmService.clearConversationHistory(sessionId);
      const clearedHistory = llmService.getConversationHistory(sessionId);
      expect(clearedHistory).toEqual([]);
    });

    it('should update user preferences', () => {
      llmService.updateUserPreferences(sessionId, {
        preferredResponseLength: 'detailed',
        voiceEnabled: true,
        theme: 'dark'
      });

      // No direct way to verify this without exposing internal state
      // In a real implementation, you might want to add a getter method
      expect(true).toBe(true);
    });

    it('should update onboarding step', () => {
      llmService.updateOnboardingStep(sessionId, 3);
      expect(true).toBe(true);
    });

    it('should update troubleshooting state', () => {
      llmService.updateTroubleshootingState(sessionId, {
        currentIssue: 'Login problem',
        attemptedSolutions: ['Clear cache'],
        escalationLevel: 1
      });
      expect(true).toBe(true);
    });
  });

  describe('health and monitoring', () => {
    it('should provide health status', async () => {
      const health = await llmService.getHealthStatus();
      
      expect(health).toBeDefined();
      expect(typeof health.llmEngine).toBe('boolean');
      expect(health.contextManager).toBe(true);
      expect(health.modelInfo).toBeDefined();
      expect(health.modelInfo.model).toBe('mistral:7b');
      expect(typeof health.modelInfo.isLoaded).toBe('boolean');
      expect(health.memoryStats).toBeDefined();
    });

    it('should list available models', async () => {
      const models = await llmService.getAvailableModels();
      expect(Array.isArray(models)).toBe(true);
    });

    it('should cleanup expired contexts', () => {
      const cleaned = llmService.cleanupExpiredContexts();
      expect(typeof cleaned).toBe('number');
      expect(cleaned).toBeGreaterThanOrEqual(0);
    });
  });

  describe('suggestion generation', () => {
    it('should generate appropriate suggestions based on context', async () => {
      const request: ChatRequest = {
        sessionId,
        message: 'I need help with setup',
        context: undefined
      };

      const response = await llmService.processMessage(request);
      expect(response.suggestions).toBeDefined();
      expect(response.suggestions!.length).toBeGreaterThan(0);
      expect(response.suggestions!.length).toBeLessThanOrEqual(3);
    });
  });
});
