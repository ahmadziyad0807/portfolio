import { Request, Response, NextFunction } from 'express';
import { ChatRequest } from '@intelligenai/shared';
import { conversationFlowManager } from '../services/conversationFlowManager';
import { sessionService } from '../services/sessionService';
import { logger } from '../utils/logger';

/**
 * Middleware to handle automatic conversation flow transitions
 */
export const conversationFlowMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only process for chat message endpoints
    if (req.path !== '/message' || req.method !== 'POST') {
      return next();
    }

    const chatRequest: ChatRequest = req.body;
    const { sessionId, message } = chatRequest;

    if (!sessionId || !message) {
      return next();
    }

    const session = sessionService.getSession(sessionId);
    if (!session) {
      return next();
    }

    // Analyze message for flow triggers
    const messageText = message.toLowerCase().trim();
    const currentIntent = session.context.currentIntent;

    // Handle onboarding flow triggers
    if (messageText.includes('help me get started') || 
        messageText.includes('onboarding') || 
        messageText.includes('setup') ||
        messageText.includes('how do i begin')) {
      
      if (currentIntent !== 'onboarding') {
        logger.info(`Triggering onboarding flow for session ${sessionId}`);
        await conversationFlowManager.handleStateTransition(sessionId, currentIntent || 'idle', 'onboarding');
        await conversationFlowManager.initializeOnboardingFlow(sessionId);
      }
    }

    // Handle troubleshooting flow triggers
    else if (messageText.includes('problem') || 
             messageText.includes('issue') || 
             messageText.includes('not working') ||
             messageText.includes('error') ||
             messageText.includes('broken') ||
             messageText.includes('help') ||
             messageText.includes('fix')) {
      
      if (currentIntent !== 'troubleshooting') {
        logger.info(`Triggering troubleshooting flow for session ${sessionId}`);
        await conversationFlowManager.handleStateTransition(sessionId, currentIntent || 'idle', 'troubleshooting');
        // The specific issue will be extracted and troubleshooting initialized by the LLM service
      }
    }

    // Handle flow progression for existing flows
    else if (currentIntent === 'onboarding') {
      // Check for completion indicators
      if (messageText.includes('done') || 
          messageText.includes('complete') || 
          messageText.includes('finished') ||
          messageText.includes('next') ||
          messageText.includes('continue')) {
        
        logger.info(`Progressing onboarding step for session ${sessionId}`);
        await conversationFlowManager.progressOnboardingStep(sessionId);
      }
    }

    else if (currentIntent === 'troubleshooting' && session.context.troubleshootingState) {
      // Check for solution feedback
      if (messageText.includes('worked') || 
          messageText.includes('fixed') || 
          messageText.includes('solved') ||
          messageText.includes('yes') ||
          messageText.includes('success')) {
        
        logger.info(`Marking troubleshooting solution as successful for session ${sessionId}`);
        await conversationFlowManager.progressTroubleshootingSolution(sessionId, true);
      }
      
      else if (messageText.includes('didn\'t work') || 
               messageText.includes('still broken') || 
               messageText.includes('no') ||
               messageText.includes('failed') ||
               messageText.includes('try something else')) {
        
        logger.info(`Progressing to next troubleshooting solution for session ${sessionId}`);
        await conversationFlowManager.progressTroubleshootingSolution(sessionId, false);
      }
    }

    next();
  } catch (error) {
    logger.error('Error in conversation flow middleware:', error);
    // Don't block the request, just log the error and continue
    next();
  }
};

/**
 * Error recovery middleware for conversation flows
 */
export const conversationErrorRecoveryMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Only handle conversation-related errors
  if (req.path.includes('/api/chat') || req.path.includes('/api/conversation-flow')) {
    const sessionId = req.params.sessionId || req.body.sessionId;
    
    if (sessionId) {
      // Attempt to recover the conversation
      conversationFlowManager.recoverFromError(sessionId, error)
        .then(recovered => {
          if (recovered) {
            logger.info(`Conversation recovered for session ${sessionId}`);
          }
        })
        .catch(recoveryError => {
          logger.error('Failed to recover conversation:', recoveryError);
        });
    }
  }

  // Continue with normal error handling
  next(error);
};
