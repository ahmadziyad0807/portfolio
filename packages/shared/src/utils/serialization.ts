// Serialization and deserialization utilities for core data models

import { 
  Message, 
  Session, 
  ChatbotConfig, 
  KnowledgeEntry, 
  ConversationContext,
  ChatRequest,
  ChatResponse,
  APIResponse
} from '../types';

import {
  validateMessage,
  validateSession,
  validateChatbotConfig,
  validateKnowledgeEntry,
  validateConversationContext,
  validateChatRequest,
  ValidationError
} from '../validation';

// Serialization error class
export class SerializationError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'SerializationError';
  }
}

// Date serialization helpers
const serializeDate = (date: Date): string => {
  return date.toISOString();
};

const deserializeDate = (dateString: string): Date => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new SerializationError(`Invalid date string: ${dateString}`);
  }
  return date;
};

// Message serialization
export function serializeMessage(message: Message): string {
  try {
    const serializable = {
      ...message,
      timestamp: serializeDate(message.timestamp)
    };
    return JSON.stringify(serializable);
  } catch (error) {
    throw new SerializationError('Failed to serialize message', error as Error);
  }
}

export function deserializeMessage(data: string): Message {
  try {
    const parsed = JSON.parse(data);
    const messageData = {
      ...parsed,
      timestamp: deserializeDate(parsed.timestamp)
    };
    return validateMessage(messageData);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new SerializationError('Failed to deserialize message', error as Error);
  }
}

// Session serialization
export function serializeSession(session: Session): string {
  try {
    const serializable = {
      ...session,
      startTime: serializeDate(session.startTime),
      lastActivity: serializeDate(session.lastActivity),
      context: {
        ...session.context,
        messages: session.context.messages.map(msg => ({
          ...msg,
          timestamp: serializeDate(msg.timestamp)
        }))
      }
    };
    return JSON.stringify(serializable);
  } catch (error) {
    throw new SerializationError('Failed to serialize session', error as Error);
  }
}

export function deserializeSession(data: string): Session {
  try {
    const parsed = JSON.parse(data);
    const sessionData = {
      ...parsed,
      startTime: deserializeDate(parsed.startTime),
      lastActivity: deserializeDate(parsed.lastActivity),
      context: {
        ...parsed.context,
        messages: parsed.context.messages.map((msg: any) => ({
          ...msg,
          timestamp: deserializeDate(msg.timestamp)
        }))
      }
    };
    return validateSession(sessionData);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new SerializationError('Failed to deserialize session', error as Error);
  }
}

// Conversation context serialization
export function serializeConversationContext(context: ConversationContext): string {
  try {
    const serializable = {
      ...context,
      messages: context.messages.map(msg => ({
        ...msg,
        timestamp: serializeDate(msg.timestamp)
      }))
    };
    return JSON.stringify(serializable);
  } catch (error) {
    throw new SerializationError('Failed to serialize conversation context', error as Error);
  }
}

export function deserializeConversationContext(data: string): ConversationContext {
  try {
    const parsed = JSON.parse(data);
    const contextData = {
      ...parsed,
      messages: parsed.messages.map((msg: any) => ({
        ...msg,
        timestamp: deserializeDate(msg.timestamp)
      }))
    };
    return validateConversationContext(contextData);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new SerializationError('Failed to deserialize conversation context', error as Error);
  }
}

// Chatbot config serialization
export function serializeChatbotConfig(config: ChatbotConfig): string {
  try {
    return JSON.stringify(config);
  } catch (error) {
    throw new SerializationError('Failed to serialize chatbot config', error as Error);
  }
}

export function deserializeChatbotConfig(data: string): ChatbotConfig {
  try {
    const parsed = JSON.parse(data);
    return validateChatbotConfig(parsed);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new SerializationError('Failed to deserialize chatbot config', error as Error);
  }
}

// Knowledge entry serialization
export function serializeKnowledgeEntry(entry: KnowledgeEntry): string {
  try {
    const serializable = {
      ...entry,
      lastUpdated: serializeDate(entry.lastUpdated)
    };
    return JSON.stringify(serializable);
  } catch (error) {
    throw new SerializationError('Failed to serialize knowledge entry', error as Error);
  }
}

export function deserializeKnowledgeEntry(data: string): KnowledgeEntry {
  try {
    const parsed = JSON.parse(data);
    const entryData = {
      ...parsed,
      lastUpdated: deserializeDate(parsed.lastUpdated)
    };
    return validateKnowledgeEntry(entryData);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new SerializationError('Failed to deserialize knowledge entry', error as Error);
  }
}

// Chat request serialization
export function serializeChatRequest(request: ChatRequest): string {
  try {
    let serializable: any = { ...request };
    
    if (request.context) {
      serializable.context = {
        ...request.context,
        messages: request.context.messages?.map(msg => ({
          ...msg,
          timestamp: serializeDate(msg.timestamp)
        })) || []
      };
    }
    
    return JSON.stringify(serializable);
  } catch (error) {
    throw new SerializationError('Failed to serialize chat request', error as Error);
  }
}

export function deserializeChatRequest(data: string): ChatRequest {
  try {
    const parsed = JSON.parse(data);
    let requestData: any = { ...parsed };
    
    if (parsed.context && parsed.context.messages) {
      requestData.context = {
        ...parsed.context,
        messages: parsed.context.messages.map((msg: any) => ({
          ...msg,
          timestamp: deserializeDate(msg.timestamp)
        }))
      };
    }
    
    return validateChatRequest(requestData);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new SerializationError('Failed to deserialize chat request', error as Error);
  }
}

// API response serialization
export function serializeAPIResponse<T>(response: APIResponse<T>): string {
  try {
    const serializable = {
      ...response,
      timestamp: serializeDate(response.timestamp)
    };
    return JSON.stringify(serializable);
  } catch (error) {
    throw new SerializationError('Failed to serialize API response', error as Error);
  }
}

export function deserializeAPIResponse<T>(data: string): APIResponse<T> {
  try {
    const parsed = JSON.parse(data);
    return {
      ...parsed,
      timestamp: deserializeDate(parsed.timestamp)
    };
  } catch (error) {
    throw new SerializationError('Failed to deserialize API response', error as Error);
  }
}

// Batch operations for arrays
export function serializeMessages(messages: Message[]): string {
  try {
    const serializable = messages.map(msg => ({
      ...msg,
      timestamp: serializeDate(msg.timestamp)
    }));
    return JSON.stringify(serializable);
  } catch (error) {
    throw new SerializationError('Failed to serialize messages array', error as Error);
  }
}

export function deserializeMessages(data: string): Message[] {
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      throw new SerializationError('Expected array of messages');
    }
    
    return parsed.map((msgData: any) => {
      const messageData = {
        ...msgData,
        timestamp: deserializeDate(msgData.timestamp)
      };
      return validateMessage(messageData);
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new SerializationError('Failed to deserialize messages array', error as Error);
  }
}

export function serializeKnowledgeEntries(entries: KnowledgeEntry[]): string {
  try {
    const serializable = entries.map(entry => ({
      ...entry,
      lastUpdated: serializeDate(entry.lastUpdated)
    }));
    return JSON.stringify(serializable);
  } catch (error) {
    throw new SerializationError('Failed to serialize knowledge entries array', error as Error);
  }
}

export function deserializeKnowledgeEntries(data: string): KnowledgeEntry[] {
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      throw new SerializationError('Expected array of knowledge entries');
    }
    
    return parsed.map((entryData: any) => {
      const entry = {
        ...entryData,
        lastUpdated: deserializeDate(entryData.lastUpdated)
      };
      return validateKnowledgeEntry(entry);
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new SerializationError('Failed to deserialize knowledge entries array', error as Error);
  }
}

// Utility functions for safe serialization
export function safeSerialize<T>(data: T, serializer: (data: T) => string): string | null {
  try {
    return serializer(data);
  } catch (error) {
    console.error('Serialization failed:', error);
    return null;
  }
}

export function safeDeserialize<T>(data: string, deserializer: (data: string) => T): T | null {
  try {
    return deserializer(data);
  } catch (error) {
    console.error('Deserialization failed:', error);
    return null;
  }
}