import { Session, ConversationContext, SessionConfig } from '@intelligenai/shared';
import { randomUUID } from 'crypto';

// In-memory session storage (will be replaced with Redis in production)
const sessions = new Map<string, Session>();

export class SessionService {
  /**
   * Create a new session with default configuration
   */
  createSession(userId?: string): Session {
    const sessionId = randomUUID();
    const now = new Date();
    
    const defaultContext: ConversationContext = {
      messages: [],
      currentIntent: undefined,
      userPreferences: {
        preferredResponseLength: 'medium',
        voiceEnabled: false,
        theme: 'auto'
      }
    };

    const defaultConfig: SessionConfig = {
      maxMessages: 50,
      responseTimeout: 5000,
      voiceEnabled: false,
      language: 'en'
    };

    const session: Session = {
      id: sessionId,
      userId,
      startTime: now,
      lastActivity: now,
      context: defaultContext,
      configuration: defaultConfig
    };

    sessions.set(sessionId, session);
    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): Session | null {
    return sessions.get(sessionId) || null;
  }

  /**
   * Update session activity timestamp
   */
  updateSessionActivity(sessionId: string): boolean {
    const session = sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      return true;
    }
    return false;
  }

  /**
   * Update session context
   */
  updateSessionContext(sessionId: string, context: Partial<ConversationContext>): boolean {
    const session = sessions.get(sessionId);
    if (session) {
      session.context = { ...session.context, ...context };
      session.lastActivity = new Date();
      return true;
    }
    return false;
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): boolean {
    return sessions.delete(sessionId);
  }

  /**
   * Clean up expired sessions (older than 24 hours)
   */
  cleanupExpiredSessions(): number {
    const now = new Date();
    const expiredThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    let deletedCount = 0;

    for (const [sessionId, session] of sessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > expiredThreshold) {
        sessions.delete(sessionId);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    return {
      totalSessions: sessions.size,
      activeSessions: Array.from(sessions.values()).filter(
        session => new Date().getTime() - session.lastActivity.getTime() < 60 * 60 * 1000 // 1 hour
      ).length
    };
  }
}

export const sessionService = new SessionService();
