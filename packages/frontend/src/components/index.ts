/**
 * Component exports for the chat widget
 */

export { default as ChatWidget } from './ChatWidget';
export { default as MessageList } from './MessageList';
export { default as MessageItem } from './MessageItem';
export { default as MessageInput } from './MessageInput';
export { default as TypingIndicator } from './TypingIndicator';
export { default as VoiceInterface } from './VoiceInterface';
export { useSpeech } from './VoiceInterface';

// Re-export types that components might need
export type { Message, ChatbotConfig, WidgetStyling } from '@intelligenai/shared';