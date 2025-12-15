// Core data models for the LLM Chatbot system

export interface Message {
  id: string;
  sessionId: string;
  content: string;
  type: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    processingTime?: number;
  };
}

export interface Session {
  id: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  context: ConversationContext;
  configuration: SessionConfig;
}

export interface ConversationContext {
  messages: Message[];
  currentIntent?: string;
  userPreferences?: UserPreferences;
  onboardingStep?: number;
  troubleshootingState?: TroubleshootingState;
}

export interface SessionConfig {
  maxMessages: number;
  responseTimeout: number;
  voiceEnabled: boolean;
  language: string;
}

export interface UserPreferences {
  preferredResponseLength: 'short' | 'medium' | 'detailed';
  voiceEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface TroubleshootingState {
  currentIssue?: string;
  attemptedSolutions: string[];
  escalationLevel: number;
}

export interface ChatbotConfig {
  modelName: string;
  maxContextLength: number;
  responseTimeout: number;
  voiceEnabled: boolean;
  knowledgeBase: string[];
  styling: WidgetStyling;
}

export interface WidgetStyling {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  borderRadius: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export interface KnowledgeEntry {
  id: string;
  category: 'faq' | 'troubleshooting' | 'product' | 'onboarding';
  question: string;
  answer: string;
  keywords: string[];
  lastUpdated: Date;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  context?: Partial<ConversationContext>;
}

export interface ChatResponse {
  message: Message;
  suggestions?: string[];
  metadata?: ResponseMetadata;
}

export interface ResponseMetadata {
  processingTime: number;
  modelUsed: string;
  confidence: number;
  intent: string;
  nextSteps?: string[];
  relatedLinks?: Array<{
    title: string;
    url: string;
  }>;
}