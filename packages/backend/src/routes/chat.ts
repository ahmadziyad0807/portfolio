import { Router, Request, Response } from 'express';
import { ChatRequest, ChatResponse, APIResponse, Message } from '@intelligenai/shared';
import { sessionService } from '../services/sessionService';
import { conversationService } from '../services/conversationService';
import { conversationFlowManager } from '../services/conversationFlowManager';
import { createLogger } from 'winston';

const router = Router();
const logger = createLogger({
  level: 'info',
  defaultMeta: { service: 'chat-routes' }
});

/**
 * POST /api/chat/sessions
 * Create a new chat session
 */
router.post('/sessions', (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const session = sessionService.createSession(userId);
    
    const response: APIResponse = {
      success: true,
      data: {
        sessionId: session.id,
        configuration: session.configuration
      },
      timestamp: new Date()
    };

    logger.info(`Created new session: ${session.id}`);
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating session:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to create session',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

/**
 * GET /api/chat/sessions/:sessionId
 * Get session information
 */
router.get('/sessions/:sessionId', (req: Request, res: Response) => {
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

    const response: APIResponse = {
      success: true,
      data: {
        sessionId: session.id,
        startTime: session.startTime,
        lastActivity: session.lastActivity,
        configuration: session.configuration,
        messageCount: session.context.messages.length
      },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error getting session:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to get session',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

/**
 * POST /api/chat/message
 * Send a message and get a response
 */
router.post('/message', async (req: Request, res: Response) => {
  try {
    const chatRequest: ChatRequest = req.body;
    const { sessionId, message, context } = chatRequest;

    // Validate request
    if (!sessionId || !message || message.trim().length === 0) {
      const response: APIResponse = {
        success: false,
        error: 'Invalid request: sessionId and message are required',
        timestamp: new Date()
      };
      return res.status(400).json(response);
    }

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

    // Update session context if provided
    if (context) {
      sessionService.updateSessionContext(sessionId, context);
    }

    // Preserve conversation history with memory optimization
    await conversationFlowManager.preserveConversationHistory(sessionId);

    // Process message using LLM service
    const chatResponse = await req.llmService.processMessage(chatRequest);

    // Also add messages to the conversation service for compatibility
    conversationService.addMessage(
      sessionId,
      message.trim(),
      'user'
    );

    conversationService.addMessage(
      sessionId,
      chatResponse.message.content,
      'assistant',
      chatResponse.metadata
    );

    const response: APIResponse<ChatResponse> = {
      success: true,
      data: chatResponse,
      timestamp: new Date()
    };

    logger.info(`Processed message for session ${sessionId} in ${chatResponse.metadata?.processingTime || 0}ms`);
    res.json(response);

  } catch (error) {
    logger.error('Error processing message:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to process message',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

/**
 * GET /api/chat/sessions/:sessionId/history
 * Get conversation history
 */
router.get('/sessions/:sessionId/history', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { limit } = req.query;
    
    const session = sessionService.getSession(sessionId);
    if (!session) {
      const response: APIResponse = {
        success: false,
        error: 'Session not found',
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }

    let messages = conversationService.getConversationHistory(sessionId);
    
    // Apply limit if specified
    if (limit && typeof limit === 'string') {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        messages = messages.slice(-limitNum);
      }
    }

    const response: APIResponse = {
      success: true,
      data: {
        messages,
        totalCount: session.context.messages.length
      },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error getting conversation history:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to get conversation history',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

/**
 * DELETE /api/chat/sessions/:sessionId
 * Delete a session
 */
router.delete('/sessions/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const deleted = sessionService.deleteSession(sessionId);
    
    if (!deleted) {
      const response: APIResponse = {
        success: false,
        error: 'Session not found',
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }

    const response: APIResponse = {
      success: true,
      data: { message: 'Session deleted successfully' },
      timestamp: new Date()
    };

    logger.info(`Deleted session: ${sessionId}`);
    res.json(response);
  } catch (error) {
    logger.error('Error deleting session:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to delete session',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

/**
 * POST /api/chat/sessions/:sessionId/clear
 * Clear conversation history
 */
router.post('/sessions/:sessionId/clear', (req: Request, res: Response) => {
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

    // Clear conversation in both services
    const cleared = conversationService.clearConversation(sessionId);
    req.llmService.clearConversationHistory(sessionId);
    
    if (!cleared) {
      const response: APIResponse = {
        success: false,
        error: 'Failed to clear conversation',
        timestamp: new Date()
      };
      return res.status(500).json(response);
    }

    const response: APIResponse = {
      success: true,
      data: { message: 'Conversation cleared successfully' },
      timestamp: new Date()
    };

    logger.info(`Cleared conversation for session: ${sessionId}`);
    res.json(response);
  } catch (error) {
    logger.error('Error clearing conversation:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to clear conversation',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

/**
 * GET /api/chat/models
 * Get available LLM models
 */
router.get('/models', async (req: Request, res: Response) => {
  try {
    const models = await req.llmService.getAvailableModels();
    
    const response: APIResponse = {
      success: true,
      data: { models },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error getting available models:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to get available models',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

/**
 * GET /api/chat/health
 * Get LLM service health status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthStatus = await req.llmService.getHealthStatus();
    
    const response: APIResponse = {
      success: true,
      data: healthStatus,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error getting health status:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to get health status',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

/**
 * PUT /api/chat/sessions/:sessionId/preferences
 * Update user preferences for a session
 */
router.put('/sessions/:sessionId/preferences', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const preferences = req.body;
    
    const session = sessionService.getSession(sessionId);
    if (!session) {
      const response: APIResponse = {
        success: false,
        error: 'Session not found',
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }

    req.llmService.updateUserPreferences(sessionId, preferences);
    
    const response: APIResponse = {
      success: true,
      data: { message: 'Preferences updated successfully' },
      timestamp: new Date()
    };

    logger.info(`Updated preferences for session: ${sessionId}`);
    res.json(response);
  } catch (error) {
    logger.error('Error updating preferences:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to update preferences',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

/**
 * PUT /api/chat/sessions/:sessionId/onboarding
 * Update onboarding step for a session
 */
router.put('/sessions/:sessionId/onboarding', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { step } = req.body;
    
    if (typeof step !== 'number') {
      const response: APIResponse = {
        success: false,
        error: 'Invalid step: must be a number',
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

    req.llmService.updateOnboardingStep(sessionId, step);
    
    const response: APIResponse = {
      success: true,
      data: { message: 'Onboarding step updated successfully' },
      timestamp: new Date()
    };

    logger.info(`Updated onboarding step for session: ${sessionId} to step ${step}`);
    res.json(response);
  } catch (error) {
    logger.error('Error updating onboarding step:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to update onboarding step',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

export default router;
