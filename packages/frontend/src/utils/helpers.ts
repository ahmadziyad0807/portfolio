/**
 * Utility functions for the frontend application
 */

/**
 * Generates a unique identifier
 * @returns A unique string ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validates if a string is empty or contains only whitespace
 * @param text The text to validate
 * @returns True if the text is empty or whitespace-only
 */
export const isEmptyOrWhitespace = (text: string): boolean => {
  return !text || !text.trim();
};

/**
 * Truncates text to a specified length with ellipsis
 * @param text The text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Formats a timestamp for display
 * @param timestamp The timestamp to format
 * @returns Formatted time string
 */
export const formatTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else {
    return messageTime.toLocaleDateString();
  }
};

/**
 * Debounces a function call
 * @param func The function to debounce
 * @param wait The wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Checks if the current device is mobile
 * @returns True if the device is mobile
 */
export const isMobile = (): boolean => {
  return window.innerWidth <= 768;
};

/**
 * Sanitizes HTML content to prevent XSS
 * @param html The HTML content to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Validates message content
 * @param content The message content to validate
 * @param maxLength Maximum allowed length
 * @returns Validation result with error message if invalid
 */
export const validateMessageContent = (
  content: string, 
  maxLength: number = 1000
): { isValid: boolean; error?: string } => {
  const trimmed = content.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (trimmed.length > maxLength) {
    return { 
      isValid: false, 
      error: `Message is too long (${trimmed.length}/${maxLength} characters)` 
    };
  }
  
  if (!/\S/.test(content)) {
    return { isValid: false, error: 'Message cannot contain only whitespace' };
  }
  
  return { isValid: true };
};

/**
 * Extracts configuration from URL parameters or data attributes
 * @param element The element to extract config from
 * @returns Partial configuration object
 */
export const extractWidgetConfig = (element?: HTMLElement): any => {
  const config: any = {};
  
  if (element) {
    // Extract from data attributes
    const primaryColor = element.dataset.primaryColor;
    const backgroundColor = element.dataset.backgroundColor;
    const position = element.dataset.position;
    const voiceEnabled = element.dataset.voiceEnabled;
    
    if (primaryColor) config.styling = { ...config.styling, primaryColor };
    if (backgroundColor) config.styling = { ...config.styling, backgroundColor };
    if (position) config.styling = { ...config.styling, position };
    if (voiceEnabled) config.voiceEnabled = voiceEnabled === 'true';
  }
  
  // Extract from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlPrimaryColor = urlParams.get('primaryColor');
  const urlVoiceEnabled = urlParams.get('voiceEnabled');
  
  if (urlPrimaryColor) {
    config.styling = { ...config.styling, primaryColor: urlPrimaryColor };
  }
  if (urlVoiceEnabled) {
    config.voiceEnabled = urlVoiceEnabled === 'true';
  }
  
  return config;
};