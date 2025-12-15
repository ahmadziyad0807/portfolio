// Utility functions for validation and data processing

// Re-export serialization utilities
export * from './serialization';

// ID generation utilities
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// String validation utilities (kept for backward compatibility)
export function validateMessageContent(content: string): boolean {
  return content.trim().length > 0;
}

export function isEmptyOrWhitespace(str: string): boolean {
  return !str || str.trim().length === 0;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

// Date utilities
export function formatTimestamp(date: Date): string {
  return date.toISOString();
}

export function parseTimestamp(timestamp: string): Date {
  return new Date(timestamp);
}

// Data model factory functions
export function createMessage(
  sessionId: string, 
  content: string, 
  type: 'user' | 'assistant' | 'system' = 'user'
): import('../types').Message {
  return {
    id: generateMessageId(),
    sessionId,
    content: sanitizeInput(content),
    type,
    timestamp: new Date()
  };
}

export function createSession(
  userId?: string,
  config?: Partial<import('../types').SessionConfig>
): import('../types').Session {
  const defaultConfig: import('../types').SessionConfig = {
    maxMessages: 50,
    responseTimeout: 5000,
    voiceEnabled: false,
    language: 'en'
  };

  return {
    id: generateSessionId(),
    userId,
    startTime: new Date(),
    lastActivity: new Date(),
    context: {
      messages: []
    },
    configuration: { ...defaultConfig, ...config }
  };
}

export function createKnowledgeEntry(
  category: 'faq' | 'troubleshooting' | 'product' | 'onboarding',
  question: string,
  answer: string,
  keywords: string[] = []
): import('../types').KnowledgeEntry {
  return {
    id: generateUUID(),
    category,
    question: sanitizeInput(question),
    answer: sanitizeInput(answer),
    keywords: keywords.map(k => sanitizeInput(k)),
    lastUpdated: new Date()
  };
}