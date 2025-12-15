// Validation functions for core data models

import { 
  Message, 
  Session, 
  ChatbotConfig, 
  KnowledgeEntry, 
  ConversationContext,
  SessionConfig,
  UserPreferences,
  ChatRequest,
  ResponseMetadata
} from '../types';

// Validation error class
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Helper functions
const isValidString = (value: unknown, minLength = 1): value is string => {
  return typeof value === 'string' && value.trim().length >= minLength;
};

const isValidDate = (value: unknown): value is Date => {
  return value instanceof Date && !isNaN(value.getTime());
};

const isValidUUID = (value: unknown): value is string => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof value === 'string' && uuidRegex.test(value);
};

// Message validation
export function validateMessage(data: unknown): Message {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Message must be an object');
  }

  const msg = data as Partial<Message>;

  if (!isValidString(msg.id)) {
    throw new ValidationError('Message ID must be a non-empty string', 'id');
  }

  if (!isValidString(msg.sessionId)) {
    throw new ValidationError('Session ID must be a non-empty string', 'sessionId');
  }

  if (!isValidString(msg.content)) {
    throw new ValidationError('Message content must be a non-empty string', 'content');
  }

  if (!msg.type || !['user', 'assistant', 'system'].includes(msg.type)) {
    throw new ValidationError('Message type must be user, assistant, or system', 'type');
  }

  if (!isValidDate(msg.timestamp)) {
    throw new ValidationError('Message timestamp must be a valid Date', 'timestamp');
  }

  // Validate metadata if present
  if (msg.metadata) {
    if (typeof msg.metadata !== 'object') {
      throw new ValidationError('Message metadata must be an object', 'metadata');
    }

    if (msg.metadata.confidence !== undefined && 
        (typeof msg.metadata.confidence !== 'number' || 
         msg.metadata.confidence < 0 || 
         msg.metadata.confidence > 1)) {
      throw new ValidationError('Confidence must be a number between 0 and 1', 'metadata.confidence');
    }

    if (msg.metadata.processingTime !== undefined && 
        (typeof msg.metadata.processingTime !== 'number' || 
         msg.metadata.processingTime < 0)) {
      throw new ValidationError('Processing time must be a non-negative number', 'metadata.processingTime');
    }
  }

  return msg as Message;
}

// Session validation
export function validateSession(data: unknown): Session {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Session must be an object');
  }

  const session = data as Partial<Session>;

  if (!isValidString(session.id)) {
    throw new ValidationError('Session ID must be a non-empty string', 'id');
  }

  if (!isValidDate(session.startTime)) {
    throw new ValidationError('Start time must be a valid Date', 'startTime');
  }

  if (!isValidDate(session.lastActivity)) {
    throw new ValidationError('Last activity must be a valid Date', 'lastActivity');
  }

  if (session.startTime && session.lastActivity && session.startTime > session.lastActivity) {
    throw new ValidationError('Start time cannot be after last activity', 'lastActivity');
  }

  if (!session.context || typeof session.context !== 'object') {
    throw new ValidationError('Session context must be an object', 'context');
  }

  if (!session.configuration || typeof session.configuration !== 'object') {
    throw new ValidationError('Session configuration must be an object', 'configuration');
  }

  // Validate context
  validateConversationContext(session.context);
  validateSessionConfig(session.configuration);

  return session as Session;
}

// Conversation context validation
export function validateConversationContext(data: unknown): ConversationContext {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Conversation context must be an object');
  }

  const context = data as Partial<ConversationContext>;

  if (!Array.isArray(context.messages)) {
    throw new ValidationError('Messages must be an array', 'messages');
  }

  // Validate each message in the context
  context.messages.forEach((msg, index) => {
    try {
      validateMessage(msg);
    } catch (error) {
      throw new ValidationError(`Invalid message at index ${index}: ${(error as Error).message}`, `messages[${index}]`);
    }
  });

  if (context.onboardingStep !== undefined && 
      (typeof context.onboardingStep !== 'number' || context.onboardingStep < 0)) {
    throw new ValidationError('Onboarding step must be a non-negative number', 'onboardingStep');
  }

  return context as ConversationContext;
}

// Session config validation
export function validateSessionConfig(data: unknown): SessionConfig {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Session config must be an object');
  }

  const config = data as Partial<SessionConfig>;

  if (typeof config.maxMessages !== 'number' || config.maxMessages <= 0) {
    throw new ValidationError('Max messages must be a positive number', 'maxMessages');
  }

  if (typeof config.responseTimeout !== 'number' || config.responseTimeout <= 0) {
    throw new ValidationError('Response timeout must be a positive number', 'responseTimeout');
  }

  if (typeof config.voiceEnabled !== 'boolean') {
    throw new ValidationError('Voice enabled must be a boolean', 'voiceEnabled');
  }

  if (!isValidString(config.language)) {
    throw new ValidationError('Language must be a non-empty string', 'language');
  }

  return config as SessionConfig;
}

// Chatbot config validation
export function validateChatbotConfig(data: unknown): ChatbotConfig {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Chatbot config must be an object');
  }

  const config = data as Partial<ChatbotConfig>;

  if (!isValidString(config.modelName)) {
    throw new ValidationError('Model name must be a non-empty string', 'modelName');
  }

  if (typeof config.maxContextLength !== 'number' || config.maxContextLength <= 0) {
    throw new ValidationError('Max context length must be a positive number', 'maxContextLength');
  }

  if (typeof config.responseTimeout !== 'number' || config.responseTimeout <= 0) {
    throw new ValidationError('Response timeout must be a positive number', 'responseTimeout');
  }

  if (typeof config.voiceEnabled !== 'boolean') {
    throw new ValidationError('Voice enabled must be a boolean', 'voiceEnabled');
  }

  if (!Array.isArray(config.knowledgeBase)) {
    throw new ValidationError('Knowledge base must be an array', 'knowledgeBase');
  }

  if (!config.styling || typeof config.styling !== 'object') {
    throw new ValidationError('Styling must be an object', 'styling');
  }

  return config as ChatbotConfig;
}

// Knowledge entry validation
export function validateKnowledgeEntry(data: unknown): KnowledgeEntry {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Knowledge entry must be an object');
  }

  const entry = data as Partial<KnowledgeEntry>;

  if (!isValidString(entry.id)) {
    throw new ValidationError('Knowledge entry ID must be a non-empty string', 'id');
  }

  if (!entry.category || !['faq', 'troubleshooting', 'product', 'onboarding'].includes(entry.category)) {
    throw new ValidationError('Category must be faq, troubleshooting, product, or onboarding', 'category');
  }

  if (!isValidString(entry.question)) {
    throw new ValidationError('Question must be a non-empty string', 'question');
  }

  if (!isValidString(entry.answer)) {
    throw new ValidationError('Answer must be a non-empty string', 'answer');
  }

  if (!Array.isArray(entry.keywords)) {
    throw new ValidationError('Keywords must be an array', 'keywords');
  }

  if (entry.keywords.some(keyword => !isValidString(keyword))) {
    throw new ValidationError('All keywords must be non-empty strings', 'keywords');
  }

  if (!isValidDate(entry.lastUpdated)) {
    throw new ValidationError('Last updated must be a valid Date', 'lastUpdated');
  }

  return entry as KnowledgeEntry;
}

// Chat request validation
export function validateChatRequest(data: unknown): ChatRequest {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Chat request must be an object');
  }

  const request = data as Partial<ChatRequest>;

  if (!isValidString(request.sessionId)) {
    throw new ValidationError('Session ID must be a non-empty string', 'sessionId');
  }

  if (!isValidString(request.message)) {
    throw new ValidationError('Message must be a non-empty string', 'message');
  }

  // Validate context if present
  if (request.context) {
    validateConversationContext(request.context);
  }

  return request as ChatRequest;
}

// Utility function to check if a message is empty (whitespace only)
export function isEmptyMessage(content: string): boolean {
  return !content || content.trim().length === 0;
}

// Utility function to sanitize message content
export function sanitizeMessageContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // Remove excessive whitespace and trim
  return content.trim().replace(/\s+/g, ' ');
}