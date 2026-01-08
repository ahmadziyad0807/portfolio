// Security utilities for frontend application
import DOMPurify from 'dompurify';

/**
 * Input validation and sanitization utilities
 */
export class SecurityUtils {
  
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(dirty: string): string {
    if (typeof window !== 'undefined' && window.DOMPurify) {
      return window.DOMPurify.sanitize(dirty);
    }
    // Fallback for server-side or when DOMPurify is not available
    return dirty
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate URL format and ensure it's safe
   */
  static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // Only allow http and https protocols
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Sanitize user input for general use
   */
  static sanitizeInput(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    return input
      .trim()
      .substring(0, maxLength)
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  /**
   * Validate phone number format
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Check for suspicious patterns in user input
   */
  static containsSuspiciousContent(input: string): boolean {
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /union.*select/gi,
      /insert.*into/gi,
      /delete.*from/gi,
      /drop.*table/gi
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Generate a secure random string
   */
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for environments without crypto API
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Rate limiting utility for client-side
   */
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>();

    return (identifier: string): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      if (!requests.has(identifier)) {
        requests.set(identifier, []);
      }
      
      const userRequests = requests.get(identifier)!;
      
      // Remove old requests outside the window
      const validRequests = userRequests.filter(time => time > windowStart);
      
      if (validRequests.length >= maxRequests) {
        return false; // Rate limited
      }
      
      validRequests.push(now);
      requests.set(identifier, validRequests);
      
      return true; // Request allowed
    };
  }

  /**
   * Secure local storage wrapper
   */
  static secureStorage = {
    setItem(key: string, value: string): void {
      try {
        const sanitizedKey = SecurityUtils.sanitizeInput(key, 100);
        const sanitizedValue = SecurityUtils.sanitizeInput(value, 10000);
        localStorage.setItem(sanitizedKey, sanitizedValue);
      } catch (error) {
        console.error('Failed to set secure storage item:', error);
      }
    },

    getItem(key: string): string | null {
      try {
        const sanitizedKey = SecurityUtils.sanitizeInput(key, 100);
        const value = localStorage.getItem(sanitizedKey);
        return value ? SecurityUtils.sanitizeInput(value, 10000) : null;
      } catch (error) {
        console.error('Failed to get secure storage item:', error);
        return null;
      }
    },

    removeItem(key: string): void {
      try {
        const sanitizedKey = SecurityUtils.sanitizeInput(key, 100);
        localStorage.removeItem(sanitizedKey);
      } catch (error) {
        console.error('Failed to remove secure storage item:', error);
      }
    }
  };

  /**
   * Content Security Policy violation reporter
   */
  static setupCSPReporting(): void {
    if (typeof window !== 'undefined') {
      document.addEventListener('securitypolicyviolation', (event) => {
        console.error('CSP Violation:', {
          blockedURI: event.blockedURI,
          violatedDirective: event.violatedDirective,
          originalPolicy: event.originalPolicy,
          sourceFile: event.sourceFile,
          lineNumber: event.lineNumber
        });
        
        // Report to your security monitoring service
        // fetch('/api/security/csp-violation', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     blockedURI: event.blockedURI,
        //     violatedDirective: event.violatedDirective,
        //     timestamp: new Date().toISOString()
        //   })
        // });
      });
    }
  }

  /**
   * Detect and prevent clickjacking
   */
  static preventClickjacking(): void {
    if (typeof window !== 'undefined') {
      if (window.top !== window.self) {
        // Page is in an iframe
        console.warn('Potential clickjacking attempt detected');
        window.top!.location = window.self.location;
      }
    }
  }

  /**
   * Secure form submission helper
   */
  static secureFormSubmit(formData: Record<string, any>): Record<string, any> {
    const secureData: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        // Check for suspicious content
        if (SecurityUtils.containsSuspiciousContent(value)) {
          console.warn(`Suspicious content detected in field: ${key}`);
          continue; // Skip this field
        }
        
        secureData[key] = SecurityUtils.sanitizeInput(value);
      } else {
        secureData[key] = value;
      }
    }
    
    return secureData;
  }
}

/**
 * Security monitoring utilities
 */
export class SecurityMonitor {
  private static events: Array<{
    type: string;
    timestamp: number;
    details: any;
  }> = [];

  /**
   * Log security events
   */
  static logEvent(type: string, details: any): void {
    const event = {
      type,
      timestamp: Date.now(),
      details
    };
    
    this.events.push(event);
    
    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events.shift();
    }
    
    console.log('Security Event:', event);
  }

  /**
   * Get security events
   */
  static getEvents(): Array<{ type: string; timestamp: number; details: any }> {
    return [...this.events];
  }

  /**
   * Clear security events
   */
  static clearEvents(): void {
    this.events = [];
  }

  /**
   * Monitor for suspicious activity
   */
  static startMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor for multiple failed attempts
    let failedAttempts = 0;
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (response.status === 401 || response.status === 403) {
          failedAttempts++;
          
          if (failedAttempts > 5) {
            SecurityMonitor.logEvent('multiple_failed_requests', {
              count: failedAttempts,
              url: args[0]
            });
          }
        } else if (response.ok) {
          failedAttempts = 0; // Reset on successful request
        }
        
        return response;
      } catch (error) {
        SecurityMonitor.logEvent('network_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          url: args[0]
        });
        throw error;
      }
    };

    // Monitor for console access (potential debugging attempts)
    let consoleAccessCount = 0;
    const originalLog = console.log;
    console.log = (...args) => {
      consoleAccessCount++;
      if (consoleAccessCount > 50) {
        SecurityMonitor.logEvent('excessive_console_access', {
          count: consoleAccessCount
        });
      }
      return originalLog(...args);
    };
  }
}

// Initialize security measures
if (typeof window !== 'undefined') {
  // Set up CSP reporting
  SecurityUtils.setupCSPReporting();
  
  // Prevent clickjacking
  SecurityUtils.preventClickjacking();
  
  // Start security monitoring
  SecurityMonitor.startMonitoring();
}

export default SecurityUtils;