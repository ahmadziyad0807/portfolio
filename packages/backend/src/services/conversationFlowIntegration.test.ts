import { conversationFlowManager } from './conversationFlowManager';
import { sessionService } from './sessionService';
import { conversationService } from './conversationService';

describe('Conversation Flow Integration', () => {
  let sessionId: string;

  beforeEach(() => {
    // Create a real session for integration testing
    const session = sessionService.createSession();
    sessionId = session.id;
  });

  afterEach(() => {
    // Clean up session
    sessionService.deleteSession(sessionId);
  });

  describe('Onboarding Flow Integration', () => {
    it('should complete full onboarding flow', async () => {
      // Initialize onboarding
      const onboardingFlow = await conversationFlowManager.initializeOnboardingFlow(sessionId, 'general');
      expect(onboardingFlow).toBeTruthy();
      expect(onboardingFlow?.currentStep).toBe(0);

      // Progress through steps
      let currentStep = 0;
      let nextStep = await conversationFlowManager.progressOnboardingStep(sessionId);
      
      while (nextStep !== null && currentStep < 10) { // Safety limit
        expect(nextStep).toBeTruthy();
        currentStep++;
        nextStep = await conversationFlowManager.progressOnboardingStep(sessionId);
      }

      // Verify onboarding is complete
      const session = sessionService.getSession(sessionId);
      expect(session?.context.currentIntent).toBeUndefined();
      expect(session?.context.onboardingStep).toBeUndefined();

      // Verify messages were added
      const messages = conversationService.getConversationHistory(sessionId);
      expect(messages.length).toBeGreaterThan(0);
      expect(messages.some(m => m.content.includes('onboarding'))).toBe(true);
    });
  });

  describe('Troubleshooting Flow Integration', () => {
    it('should handle troubleshooting flow with solution success', async () => {
      const issue = 'Login not working';
      
      // Initialize troubleshooting
      const troubleshootingFlow = await conversationFlowManager.initializeTroubleshootingFlow(sessionId, issue);
      expect(troubleshootingFlow).toBeTruthy();
      expect(troubleshootingFlow?.issue).toBe(issue);

      // Verify session state
      let session = sessionService.getSession(sessionId);
      expect(session?.context.currentIntent).toBe('troubleshooting');
      expect(session?.context.troubleshootingState?.currentIssue).toBe(issue);

      // Mark first solution as successful
      const result = await conversationFlowManager.progressTroubleshootingSolution(sessionId, true);
      expect(result).toBeNull(); // Should be null when resolved

      // Verify troubleshooting is complete
      session = sessionService.getSession(sessionId);
      expect(session?.context.currentIntent).toBeUndefined();
      expect(session?.context.troubleshootingState).toBeUndefined();

      // Verify messages were added
      const messages = conversationService.getConversationHistory(sessionId);
      expect(messages.length).toBeGreaterThan(0);
      expect(messages.some(m => m.content.includes('resolve'))).toBe(true);
    });

    it('should handle troubleshooting flow with escalation', async () => {
      const issue = 'Complex technical issue';
      
      // Initialize troubleshooting
      const troubleshootingFlow = await conversationFlowManager.initializeTroubleshootingFlow(sessionId, issue);
      expect(troubleshootingFlow).toBeTruthy();

      // Try all solutions (mark as failed)
      let nextSolution: any = troubleshootingFlow?.solutions[0];
      let solutionCount = 0;
      
      while (nextSolution && solutionCount < 10) { // Safety limit
        nextSolution = await conversationFlowManager.progressTroubleshootingSolution(sessionId, false);
        solutionCount++;
      }

      // Should eventually escalate or complete
      const session = sessionService.getSession(sessionId);
      const messages = conversationService.getConversationHistory(sessionId);
      
      // Should have escalation or completion messages
      expect(messages.some(m => 
        m.content.includes('support') || 
        m.content.includes('escalat') ||
        m.content.includes('different approach')
      )).toBe(true);
    });
  });

  describe('State Transition Integration', () => {
    it('should handle state transitions correctly', async () => {
      // Start in idle state
      let session = sessionService.getSession(sessionId);
      expect(session?.context.currentIntent).toBeUndefined();

      // Transition to onboarding
      await conversationFlowManager.handleStateTransition(sessionId, 'idle', 'onboarding');
      session = sessionService.getSession(sessionId);
      expect(session?.context.currentIntent).toBe('onboarding');

      // Transition back to idle
      await conversationFlowManager.handleStateTransition(sessionId, 'onboarding', 'idle');
      session = sessionService.getSession(sessionId);
      expect(session?.context.currentIntent).toBeUndefined();
      expect(session?.context.onboardingStep).toBeUndefined();
    });
  });

  describe('Memory Optimization Integration', () => {
    it('should optimize memory for large conversations', async () => {
      // Add many messages to trigger optimization
      for (let i = 0; i < 60; i++) {
        conversationService.addMessage(sessionId, `Test message ${i}`, 'user');
        conversationService.addMessage(sessionId, `Response ${i}`, 'assistant');
      }

      const initialMessages = conversationService.getConversationHistory(sessionId);
      expect(initialMessages.length).toBe(50); // Limited by session maxMessages

      // Trigger memory optimization (should still work even if already at limit)
      const result = await conversationFlowManager.preserveConversationHistory(sessionId);
      expect(result).toBe(true);

      // Verify messages are still present
      const optimizedMessages = conversationService.getConversationHistory(sessionId);
      expect(optimizedMessages.length).toBeGreaterThan(0);
      expect(optimizedMessages.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Error Recovery Integration', () => {
    it('should recover from errors gracefully', async () => {
      // Set up a conversation state
      await conversationFlowManager.initializeOnboardingFlow(sessionId, 'general');
      
      let session = sessionService.getSession(sessionId);
      expect(session?.context.currentIntent).toBe('onboarding');

      // Simulate an error and recovery
      const error = new Error('Simulated conversation error');
      const recovered = await conversationFlowManager.recoverFromError(sessionId, error);
      expect(recovered).toBe(true);

      // Verify state was reset
      session = sessionService.getSession(sessionId);
      expect(session?.context.currentIntent).toBeUndefined();
      expect(session?.context.onboardingStep).toBeUndefined();

      // Verify recovery message was added
      const messages = conversationService.getConversationHistory(sessionId);
      expect(messages.some(m => m.content.includes('apologize'))).toBe(true);
    });
  });
});