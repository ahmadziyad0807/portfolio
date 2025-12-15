import { ConversationFlowManager } from './conversationFlowManager';
import { sessionService } from './sessionService';
import { conversationService } from './conversationService';
import { Session, TroubleshootingState } from '@intelligenai/shared';

// Mock the dependencies
jest.mock('./sessionService');
jest.mock('./conversationService');
jest.mock('./knowledgeBaseService');
jest.mock('../utils/logger');

const mockSessionService = sessionService as jest.Mocked<typeof sessionService>;
const mockConversationService = conversationService as jest.Mocked<typeof conversationService>;

describe('ConversationFlowManager', () => {
  let flowManager: ConversationFlowManager;
  let mockSession: Session;

  beforeEach(() => {
    flowManager = new ConversationFlowManager();
    
    // Create a mock session
    mockSession = {
      id: 'test-session-id',
      startTime: new Date(),
      lastActivity: new Date(),
      context: {
        messages: [],
        currentIntent: undefined,
        userPreferences: {
          preferredResponseLength: 'medium',
          voiceEnabled: false,
          theme: 'auto'
        }
      },
      configuration: {
        maxMessages: 50,
        responseTimeout: 5000,
        voiceEnabled: false,
        language: 'en'
      }
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('preserveConversationHistory', () => {
    it('should preserve conversation history when under threshold', async () => {
      const messages = Array.from({ length: 30 }, (_, i) => ({
        id: `msg-${i}`,
        sessionId: 'test-session-id',
        content: `Message ${i}`,
        type: 'user' as const,
        timestamp: new Date()
      }));

      mockConversationService.getConversationHistory.mockReturnValue(messages);

      const result = await flowManager.preserveConversationHistory('test-session-id');

      expect(result).toBe(true);
      expect(mockSessionService.updateSessionContext).not.toHaveBeenCalled();
    });

    it('should optimize memory when over threshold', async () => {
      const messages = Array.from({ length: 60 }, (_, i) => ({
        id: `msg-${i}`,
        sessionId: 'test-session-id',
        content: `Message ${i}`,
        type: i % 2 === 0 ? 'user' as const : 'assistant' as const,
        timestamp: new Date(),
        metadata: i < 5 ? { intent: 'onboarding' } : undefined
      }));

      mockConversationService.getConversationHistory.mockReturnValue(messages);
      mockSessionService.updateSessionContext.mockReturnValue(true);

      const result = await flowManager.preserveConversationHistory('test-session-id');

      expect(result).toBe(true);
      expect(mockSessionService.updateSessionContext).toHaveBeenCalledWith(
        'test-session-id',
        expect.objectContaining({
          messages: expect.any(Array)
        })
      );
    });

    it('should handle errors gracefully', async () => {
      mockConversationService.getConversationHistory.mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await flowManager.preserveConversationHistory('test-session-id');

      expect(result).toBe(false);
    });
  });

  describe('initializeOnboardingFlow', () => {
    it('should initialize onboarding flow successfully', async () => {
      mockSessionService.updateSessionContext.mockReturnValue(true);
      mockConversationService.addMessage.mockReturnValue({
        id: 'msg-id',
        sessionId: 'test-session-id',
        content: 'Welcome message',
        type: 'system',
        timestamp: new Date()
      });

      const result = await flowManager.initializeOnboardingFlow('test-session-id', 'general');

      expect(result).toBeTruthy();
      expect(result?.currentStep).toBe(0);
      expect(result?.totalSteps).toBeGreaterThan(0);
      expect(mockSessionService.updateSessionContext).toHaveBeenCalledWith(
        'test-session-id',
        expect.objectContaining({
          onboardingStep: 0,
          currentIntent: 'onboarding'
        })
      );
    });

    it('should return null when session update fails', async () => {
      mockSessionService.updateSessionContext.mockReturnValue(false);

      const result = await flowManager.initializeOnboardingFlow('test-session-id', 'general');

      expect(result).toBeNull();
    });
  });

  describe('progressOnboardingStep', () => {
    beforeEach(() => {
      mockSession.context.currentIntent = 'onboarding';
      mockSession.context.onboardingStep = 1;
    });

    it('should progress to next step successfully', async () => {
      mockSessionService.getSession.mockReturnValue(mockSession);
      mockSessionService.updateSessionContext.mockReturnValue(true);
      mockConversationService.addMessage.mockReturnValue({
        id: 'msg-id',
        sessionId: 'test-session-id',
        content: 'Next step message',
        type: 'system',
        timestamp: new Date()
      });

      const result = await flowManager.progressOnboardingStep('test-session-id');

      expect(result).toBeTruthy();
      expect(mockSessionService.updateSessionContext).toHaveBeenCalledWith(
        'test-session-id',
        expect.objectContaining({
          onboardingStep: 2
        })
      );
    });

    it('should complete onboarding when at final step', async () => {
      mockSession.context.onboardingStep = 4; // Assuming 5 steps total (0-4)
      mockSessionService.getSession.mockReturnValue(mockSession);
      mockSessionService.updateSessionContext.mockReturnValue(true);

      const result = await flowManager.progressOnboardingStep('test-session-id');

      expect(result).toBeNull();
      expect(mockSessionService.updateSessionContext).toHaveBeenCalledWith(
        'test-session-id',
        expect.objectContaining({
          onboardingStep: undefined,
          currentIntent: undefined
        })
      );
    });

    it('should return null for non-onboarding sessions', async () => {
      mockSession.context.currentIntent = 'idle';
      mockSessionService.getSession.mockReturnValue(mockSession);

      const result = await flowManager.progressOnboardingStep('test-session-id');

      expect(result).toBeNull();
    });
  });

  describe('initializeTroubleshootingFlow', () => {
    it('should initialize troubleshooting flow successfully', async () => {
      mockSessionService.updateSessionContext.mockReturnValue(true);
      mockConversationService.addMessage.mockReturnValue({
        id: 'msg-id',
        sessionId: 'test-session-id',
        content: 'Troubleshooting message',
        type: 'system',
        timestamp: new Date()
      });

      const result = await flowManager.initializeTroubleshootingFlow('test-session-id', 'Login not working');

      expect(result).toBeTruthy();
      expect(result?.issue).toBe('Login not working');
      expect(result?.currentSolution).toBe(0);
      expect(result?.solutions.length).toBeGreaterThan(0);
      expect(mockSessionService.updateSessionContext).toHaveBeenCalledWith(
        'test-session-id',
        expect.objectContaining({
          troubleshootingState: expect.any(Object),
          currentIntent: 'troubleshooting'
        })
      );
    });

    it('should return null when no solutions found', async () => {
      // Mock empty solutions array
      const result = await flowManager.initializeTroubleshootingFlow('test-session-id', '');

      expect(result).toBeNull();
    });
  });

  describe('progressTroubleshootingSolution', () => {
    beforeEach(() => {
      mockSession.context.troubleshootingState = {
        currentIssue: 'Login issue',
        attemptedSolutions: [],
        escalationLevel: 0
      };
    });

    it('should complete troubleshooting when solution works', async () => {
      mockSessionService.getSession.mockReturnValue(mockSession);
      mockSessionService.updateSessionContext.mockReturnValue(true);

      const result = await flowManager.progressTroubleshootingSolution('test-session-id', true);

      expect(result).toBeNull();
      expect(mockSessionService.updateSessionContext).toHaveBeenCalledWith(
        'test-session-id',
        expect.objectContaining({
          troubleshootingState: undefined,
          currentIntent: undefined
        })
      );
    });

    it('should progress to next solution when current fails', async () => {
      mockSessionService.getSession.mockReturnValue(mockSession);
      mockSessionService.updateSessionContext.mockReturnValue(true);
      mockConversationService.addMessage.mockReturnValue({
        id: 'msg-id',
        sessionId: 'test-session-id',
        content: 'Next solution message',
        type: 'system',
        timestamp: new Date()
      });

      const result = await flowManager.progressTroubleshootingSolution('test-session-id', false);

      expect(result).toBeTruthy();
      expect(mockSessionService.updateSessionContext).toHaveBeenCalled();
    });

    it('should return null for sessions without troubleshooting state', async () => {
      mockSession.context.troubleshootingState = undefined;
      mockSessionService.getSession.mockReturnValue(mockSession);

      const result = await flowManager.progressTroubleshootingSolution('test-session-id', false);

      expect(result).toBeNull();
    });
  });

  describe('handleStateTransition', () => {
    it('should handle state transition to onboarding', async () => {
      mockSessionService.getSession.mockReturnValue(mockSession);
      mockSessionService.updateSessionContext.mockReturnValue(true);

      const result = await flowManager.handleStateTransition('test-session-id', 'idle', 'onboarding');

      expect(result).toBe(true);
    });

    it('should handle state transition to idle', async () => {
      mockSessionService.getSession.mockReturnValue(mockSession);
      mockSessionService.updateSessionContext.mockReturnValue(true);

      const result = await flowManager.handleStateTransition('test-session-id', 'onboarding', 'idle');

      expect(result).toBe(true);
      expect(mockSessionService.updateSessionContext).toHaveBeenCalledWith(
        'test-session-id',
        expect.objectContaining({
          currentIntent: undefined,
          onboardingStep: undefined,
          troubleshootingState: undefined
        })
      );
    });

    it('should return false for non-existent session', async () => {
      mockSessionService.getSession.mockReturnValue(null);

      const result = await flowManager.handleStateTransition('invalid-session', 'idle', 'onboarding');

      expect(result).toBe(false);
    });
  });

  describe('recoverFromError', () => {
    it('should recover from conversation errors', async () => {
      mockConversationService.addMessage.mockReturnValue({
        id: 'msg-id',
        sessionId: 'test-session-id',
        content: 'Error recovery message',
        type: 'system',
        timestamp: new Date()
      });
      mockSessionService.updateSessionContext.mockReturnValue(true);

      const error = new Error('Test error');
      const result = await flowManager.recoverFromError('test-session-id', error);

      expect(result).toBe(true);
      expect(mockConversationService.addMessage).toHaveBeenCalledWith(
        'test-session-id',
        expect.stringContaining('apologize'),
        'system',
        expect.objectContaining({
          intent: 'error_recovery'
        })
      );
    });

    it('should handle recovery errors gracefully', async () => {
      mockConversationService.addMessage.mockImplementation(() => {
        throw new Error('Recovery failed');
      });

      const error = new Error('Test error');
      const result = await flowManager.recoverFromError('test-session-id', error);

      expect(result).toBe(false);
    });
  });
});
