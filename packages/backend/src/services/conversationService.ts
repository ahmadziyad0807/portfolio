import { Message, ConversationContext } from '@intelligenai/shared';
import { randomUUID } from 'crypto';
import { sessionService } from './sessionService';

export class ConversationService {
  /**
   * Add a message to a conversation
   */
  addMessage(sessionId: string, content: string, type: Message['type'], metadata?: Message['metadata']): Message | null {
    const session = sessionService.getSession(sessionId);
    if (!session) {
      return null;
    }

    const message: Message = {
      id: randomUUID(),
      sessionId,
      content,
      type,
      timestamp: new Date(),
      metadata
    };

    // Add message to conversation context
    const updatedMessages = [...session.context.messages, message];
    
    // Implement message limit to prevent memory overflow
    const maxMessages = session.configuration.maxMessages;
    if (updatedMessages.length > maxMessages) {
      // Keep the most recent messages
      updatedMessages.splice(0, updatedMessages.length - maxMessages);
    }

    // Update session context
    const success = sessionService.updateSessionContext(sessionId, {
      messages: updatedMessages
    });

    return success ? message : null;
  }

  /**
   * Get conversation history for a session
   */
  getConversationHistory(sessionId: string): Message[] {
    const session = sessionService.getSession(sessionId);
    return session?.context.messages || [];
  }

  /**
   * Get recent messages (for context window management)
   */
  getRecentMessages(sessionId: string, count: number = 10): Message[] {
    const messages = this.getConversationHistory(sessionId);
    return messages.slice(-count);
  }

  /**
   * Clear conversation history
   */
  clearConversation(sessionId: string): boolean {
    return sessionService.updateSessionContext(sessionId, {
      messages: [],
      currentIntent: undefined
    });
  }

  /**
   * Update conversation intent
   */
  updateIntent(sessionId: string, intent: string): boolean {
    return sessionService.updateSessionContext(sessionId, {
      currentIntent: intent
    });
  }

  /**
   * Get conversation statistics
   */
  getConversationStats(sessionId: string) {
    const messages = this.getConversationHistory(sessionId);
    const userMessages = messages.filter(m => m.type === 'user');
    const assistantMessages = messages.filter(m => m.type === 'assistant');

    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      averageResponseTime: this.calculateAverageResponseTime(messages)
    };
  }

  private calculateAverageResponseTime(messages: Message[]): number {
    const responseTimes: number[] = [];
    
    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i];
      const next = messages[i + 1];
      
      if (current.type === 'user' && next.type === 'assistant') {
        const responseTime = next.timestamp.getTime() - current.timestamp.getTime();
        responseTimes.push(responseTime);
      }
    }

    return responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;
  }
}

export const conversationService = new ConversationService();
