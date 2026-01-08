// Security utilities test suite
import { SecurityUtils, SecurityMonitor } from './security';

describe('SecurityUtils', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const malicious = '<script>alert("xss")</script>Hello';
      const sanitized = SecurityUtils.sanitizeHtml(malicious);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    it('should escape HTML entities', () => {
      const input = '<div>Hello & "World"</div>';
      const sanitized = SecurityUtils.sanitizeHtml(input);
      expect(sanitized).toContain('&lt;');
      expect(sanitized).toContain('&gt;');
      expect(sanitized).toContain('&amp;');
      expect(sanitized).toContain('&quot;');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(SecurityUtils.isValidEmail('test@example.com')).toBe(true);
      expect(SecurityUtils.isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(SecurityUtils.isValidEmail('invalid-email')).toBe(false);
      expect(SecurityUtils.isValidEmail('@domain.com')).toBe(false);
      expect(SecurityUtils.isValidEmail('test@')).toBe(false);
    });

    it('should reject overly long email addresses', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(SecurityUtils.isValidEmail(longEmail)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(SecurityUtils.isValidUrl('https://example.com')).toBe(true);
      expect(SecurityUtils.isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(SecurityUtils.isValidUrl('javascript:alert(1)')).toBe(false);
      expect(SecurityUtils.isValidUrl('ftp://example.com')).toBe(false);
      expect(SecurityUtils.isValidUrl('not-a-url')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = 'Hello <script>alert(1)</script> World';
      const sanitized = SecurityUtils.sanitizeInput(input);
      expect(sanitized).toBe('Hello alert(1) World');
    });

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert(1)';
      const sanitized = SecurityUtils.sanitizeInput(input);
      expect(sanitized).toBe('alert(1)');
    });

    it('should remove event handlers', () => {
      const input = 'onclick=alert(1)';
      const sanitized = SecurityUtils.sanitizeInput(input);
      expect(sanitized).toBe('');
    });

    it('should limit input length', () => {
      const longInput = 'a'.repeat(2000);
      const sanitized = SecurityUtils.sanitizeInput(longInput, 100);
      expect(sanitized.length).toBe(100);
    });
  });

  describe('containsSuspiciousContent', () => {
    it('should detect script tags', () => {
      expect(SecurityUtils.containsSuspiciousContent('<script>alert(1)</script>')).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      expect(SecurityUtils.containsSuspiciousContent('javascript:alert(1)')).toBe(true);
    });

    it('should detect SQL injection patterns', () => {
      expect(SecurityUtils.containsSuspiciousContent('UNION SELECT * FROM users')).toBe(true);
      expect(SecurityUtils.containsSuspiciousContent('DROP TABLE users')).toBe(true);
    });

    it('should detect event handlers', () => {
      expect(SecurityUtils.containsSuspiciousContent('onload=alert(1)')).toBe(true);
    });

    it('should not flag normal content', () => {
      expect(SecurityUtils.containsSuspiciousContent('Hello, this is normal text')).toBe(false);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate tokens of correct length', () => {
      const token = SecurityUtils.generateSecureToken(16);
      expect(token.length).toBe(32); // 16 bytes = 32 hex characters
    });

    it('should generate different tokens each time', () => {
      const token1 = SecurityUtils.generateSecureToken();
      const token2 = SecurityUtils.generateSecureToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('createRateLimiter', () => {
    it('should allow requests within limit', () => {
      const rateLimiter = SecurityUtils.createRateLimiter(5, 60000); // 5 requests per minute
      
      expect(rateLimiter('user1')).toBe(true);
      expect(rateLimiter('user1')).toBe(true);
      expect(rateLimiter('user1')).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      const rateLimiter = SecurityUtils.createRateLimiter(2, 60000); // 2 requests per minute
      
      expect(rateLimiter('user1')).toBe(true);
      expect(rateLimiter('user1')).toBe(true);
      expect(rateLimiter('user1')).toBe(false); // Should be blocked
    });

    it('should handle different users separately', () => {
      const rateLimiter = SecurityUtils.createRateLimiter(1, 60000);
      
      expect(rateLimiter('user1')).toBe(true);
      expect(rateLimiter('user2')).toBe(true); // Different user, should be allowed
      expect(rateLimiter('user1')).toBe(false); // Same user, should be blocked
    });
  });

  describe('secureStorage', () => {
    beforeEach(() => {
      // Mock localStorage
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });
    });

    it('should sanitize keys and values when setting items', () => {
      SecurityUtils.secureStorage.setItem('test<script>', 'value<script>');
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'testscript',
        'valuescript'
      );
    });

    it('should sanitize keys when getting items', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('test<script>value');
      
      const result = SecurityUtils.secureStorage.getItem('test<script>key');
      
      expect(localStorage.getItem).toHaveBeenCalledWith('testscriptkey');
      expect(result).toBe('testscriptvalue');
    });
  });

  describe('secureFormSubmit', () => {
    it('should sanitize form data', () => {
      const formData = {
        name: 'John<script>alert(1)</script>',
        email: 'john@example.com',
        message: 'Hello world'
      };

      const secureData = SecurityUtils.secureFormSubmit(formData);

      expect(secureData.name).toBe('Johnalert(1)');
      expect(secureData.email).toBe('john@example.com');
      expect(secureData.message).toBe('Hello world');
    });

    it('should skip fields with suspicious content', () => {
      const formData = {
        name: 'John',
        malicious: '<script>alert(1)</script>',
        email: 'john@example.com'
      };

      const secureData = SecurityUtils.secureFormSubmit(formData);

      expect(secureData.name).toBe('John');
      expect(secureData.malicious).toBeUndefined();
      expect(secureData.email).toBe('john@example.com');
    });
  });
});

describe('SecurityMonitor', () => {
  beforeEach(() => {
    SecurityMonitor.clearEvents();
  });

  describe('logEvent', () => {
    it('should log security events', () => {
      SecurityMonitor.logEvent('test_event', { data: 'test' });
      
      const events = SecurityMonitor.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('test_event');
      expect(events[0].details.data).toBe('test');
    });

    it('should limit the number of stored events', () => {
      // Log more than 100 events
      for (let i = 0; i < 150; i++) {
        SecurityMonitor.logEvent('test_event', { index: i });
      }
      
      const events = SecurityMonitor.getEvents();
      expect(events).toHaveLength(100);
      expect(events[0].details.index).toBe(50); // First 50 should be removed
    });
  });

  describe('clearEvents', () => {
    it('should clear all events', () => {
      SecurityMonitor.logEvent('test_event', { data: 'test' });
      expect(SecurityMonitor.getEvents()).toHaveLength(1);
      
      SecurityMonitor.clearEvents();
      expect(SecurityMonitor.getEvents()).toHaveLength(0);
    });
  });
});

// Integration tests
describe('Security Integration', () => {
  it('should handle a complete security workflow', () => {
    // Simulate user input
    const userInput = 'Hello <script>alert("xss")</script> World';
    
    // Check for suspicious content
    const isSuspicious = SecurityUtils.containsSuspiciousContent(userInput);
    expect(isSuspicious).toBe(true);
    
    // Log the security event
    SecurityMonitor.logEvent('suspicious_input', { input: userInput });
    
    // Sanitize the input
    const sanitized = SecurityUtils.sanitizeInput(userInput);
    expect(sanitized).toBe('Hello alert("xss") World');
    
    // Verify the event was logged
    const events = SecurityMonitor.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('suspicious_input');
  });

  it('should handle form submission securely', () => {
    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello <script>alert(1)</script>',
      phone: '+1234567890'
    };

    // Validate inputs
    expect(SecurityUtils.isValidEmail(formData.email)).toBe(true);
    expect(SecurityUtils.isValidPhone(formData.phone)).toBe(true);

    // Secure form submission
    const secureData = SecurityUtils.secureFormSubmit(formData);

    // Malicious message should be filtered out
    expect(secureData.message).toBeUndefined();
    expect(secureData.name).toBe('John Doe');
    expect(secureData.email).toBe('john@example.com');
    expect(secureData.phone).toBe('+1234567890');
  });
});