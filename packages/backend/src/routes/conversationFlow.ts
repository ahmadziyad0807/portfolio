import { Router, Request, Response } from 'express';
import { APIResponse } from '@intelligenai/shared';
import { conversationFlowManager } from '../services/conversationFlowManager';
import { sessionService } from '../services/sessionService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/conversation-flow/sessions/:sessionId/onboarding/start
 * Start onboarding flow for a session
 */
router.post('/sessions/:sessionId/onboarding/start', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { flowType = 'general' } = req.body;

    // Check if session exists
    const session = sessionService.getSession(sessionId);
    if (!session) {
      const response: APIResponse = {
        success: false,
        error: 'Session not found',
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }

    const onboardingFlow = await conversationFlowManager.initializeOnboardingFlow(sessionId, flowType);
    
    if (!onboardingFlow) {
      const response: APIResponse = {
        success: false,
        error: 'Failed to initialize onboarding flow',
        timestamp: new Date()
      };
      return res.status(500).json(response);
    }

    const response: APIResponse = {
      success: true,
      data: onboardingFlow,
      timestamp: new Date()
    };

    logger.info(`Started onboarding flow for session ${sessionId}`);
    res.json(response);
  } catch (error) {
    logger.error('Error starting onboarding flow:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to start onboarding flow',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

/**
 * POST /api/conversation-flow/sessions/:sessionId/onboarding/next
 * Progress to next onboarding step
 */
router.post('/sessions/:sessionId/onboarding/next', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = sessionService.getSession(sessionId);
    if (!session) {
      const response: APIResponse = {
        success: false,
        error: 'Session not found',
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }

    const nextStep = await conversationFlowManager.progressOnboardingStep(sessionId);
    
    const response: APIResponse = {
      success: true,
      data: {
        nextStep,
        completed: nextStep === null
      },
      timestamp: new Date()
    };

    logger.info(`Progressed onboarding step for session ${sessionId}`);
    res.json(response);
  } catch (error) {
    logger.error('Error progressing onboarding step:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to progress onboarding step',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

/**
 * POST /api/conversation-flow/sessions/:sessionId/troubleshooting/start
 * Start troubleshooting flow for a session
 */
router.post('/sessions/:sessionId/troubleshooting/start', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { issue } = req.body;

    if (!issue || typeof issue !== 'string' || issue.trim().length === 0) {
      const response: APIResponse = {
        success: false,
        error: 'Issue description is required',
        timestamp: new Date()
      };
      return res.status(400).json(response);
    }

    const session = sessionService.getSession(sessionId);
    if (!session) {
      const response: APIResponse = {
        success: false,
        error: 'Session not found',
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }

    const troubleshootingFlow = await conversationFlowManager.initializeTroubleshootingFlow(sessionId, issue.trim());
    
    if (!troubleshootingFlow) {
      const response: APIResponse = {
        success: false,
        error: 'No troubleshooting solutions found for this issue',
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }

    const response: APIResponse = {
      success: true,
      data: troubleshootingFlow,
      timestamp: new Date()
    };

    logger.info(`Started troubleshooting flow for session ${sessionId} with issue: ${issue}`);
    res.json(response);
  } catch (error) {
    logger.error('Error starting troubleshooting flow:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to start troubleshooting flow',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

/**
 * POST /api/conversation-flow/sessions/:sessionId/troubleshooting/next
 * Progress to next troubleshooting solution
 */
router.post('/sessions/:sessionId/troubleshooting/next', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { solutionWorked = false } = req.body;

    const session = sessionService.getSession(sessionId);
    if (!session) {
      const response: APIResponse = {
        success: false,
        error: 'Session not found',
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }

    const nextSolution = await conversationFlowManager.progressTroubleshootingSolution(sessionId, solutionWorked);
    
    const response: APIResponse = {
      success: true,
      data: {
        nextSolution,
        resolved: solutionWorked,
        escalated: nextSolution === null && !solutionWorked
      },
      timestamp: new Date()
    };

    logger.info(`Progressed troubleshooting solution for session ${sessionId}, worked: ${solutionWorked}`);
    res.json(response);
  } catch (error) {
    logger.error('Error progressing troubleshooting solution:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to progress troubleshooting solution',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

/**
 * POST /api/conversation-flow/sessions/:sessionId/state-transition
 * Handle conversation state transitions
 */
router.post('/sessions/:sessionId/state-transition', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { fromState, toState } = req.body;

    if (!fromState || !toState) {
      const response: APIResponse = {
        success: false,
        error: 'Both fromState and toState are required',
        timestamp: new Date()
      };
      return res.status(400).json(response);
    }

    const session = sessionService.getSession(sessionId);
    if (!session) {
      const response: APIResponse = {
        success: false,
        error: 'Session not found',
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }

    const success = await conversationFlowManager.handleStateTransition(sessionId, fromState, toState);
    
    if (!success) {
      const response: APIResponse = {
        success: false,
        error: 'Failed to handle state transition',
        timestamp: new Date()
      };
      return res.status(500).json(response);
    }

    const response: APIResponse = {
      success: true,
      data: {
        message: `State transition completed: ${fromState} -> ${toState}`
      },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error handling state transition:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to handle state transition',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

/**
 * POST /api/conversation-flow/sessions/:sessionId/recover
 * Recover from conversation errors
 */
router.post('/sessions/:sessionId/recover', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { errorMessage } = req.body;

    const session = sessionService.getSession(sessionId);
    if (!session) {
      const response: APIResponse = {
        success: false,
        error: 'Session not found',
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }

    const error = new Error(errorMessage || 'Unknown conversation error');
    const recovered = await conversationFlowManager.recoverFromError(sessionId, error);
    
    if (!recovered) {
      const response: APIResponse = {
        success: false,
        error: 'Failed to recover from error',
        timestamp: new Date()
      };
      return res.status(500).json(response);
    }

    const response: APIResponse = {
      success: true,
      data: {
        message: 'Conversation recovered successfully'
      },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error recovering conversation:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to recover conversation',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

/**
 * POST /api/conversation-flow/sessions/:sessionId/preserve-history
 * Preserve conversation history with memory optimization
 */
router.post('/sessions/:sessionId/preserve-history', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = sessionService.getSession(sessionId);
    if (!session) {
      const response: APIResponse = {
        success: false,
        error: 'Session not found',
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }

    const preserved = await conversationFlowManager.preserveConversationHistory(sessionId);
    
    if (!preserved) {
      const response: APIResponse = {
        success: false,
        error: 'Failed to preserve conversation history',
        timestamp: new Date()
      };
      return res.status(500).json(response);
    }

    const response: APIResponse = {
      success: true,
      data: {
        message: 'Conversation history preserved successfully'
      },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error preserving conversation history:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to preserve conversation history',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

/**
 * GET /api/conversation-flow/sessions/:sessionId/status
 * Get current conversation flow status
 */
router.get('/sessions/:sessionId/status', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = sessionService.getSession(sessionId);
    if (!session) {
      const response: APIResponse = {
        success: false,
        error: 'Session not found',
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }

    const status = {
      currentIntent: session.context.currentIntent,
      onboardingStep: session.context.onboardingStep,
      troubleshootingState: session.context.troubleshootingState,
      messageCount: session.context.messages.length,
      lastActivity: session.lastActivity
    };

    const response: APIResponse = {
      success: true,
      data: status,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error getting conversation flow status:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to get conversation flow status',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

export default router;
