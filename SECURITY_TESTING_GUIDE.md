# 🛡️ Security Testing Guide

## Overview

This guide provides comprehensive instructions for running security tests and attack scenario simulations on the Ahmad Ziyad Portfolio project. The testing framework includes automated vulnerability scanning, penetration testing, and attack simulation capabilities.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Test Categories](#test-categories)
3. [Running Individual Tests](#running-individual-tests)
4. [Attack Scenarios](#attack-scenarios)
5. [Interpreting Results](#interpreting-results)
6. [Remediation Guidelines](#remediation-guidelines)
7. [Continuous Security Testing](#continuous-security-testing)

## 🚀 Quick Start

### Run Complete Security Test Suite

```bash
# Run comprehensive security testing (recommended)
npm run security:test-full

# Quick security audit
npm run security:audit

# Run only Jest security tests
npm run security:test
```

### Emergency Security Response

```bash
# If security incident detected
npm run security:emergency
```

## 🎯 Test Categories

### 1. Static Code Analysis
- **ESLint Security Rules**: Detects security anti-patterns in code
- **Secret Scanning**: Identifies hardcoded credentials and API keys
- **Configuration Audit**: Reviews security configurations

### 2. Dependency Vulnerability Scanning
- **NPM Audit**: Identifies known vulnerabilities in dependencies
- **License Compliance**: Checks for problematic licenses
- **Outdated Package Detection**: Finds packages with security updates

### 3. Dynamic Security Testing
- **XSS Attack Simulation**: Tests cross-site scripting protection
- **SQL Injection Testing**: Validates input sanitization
- **CSRF Protection**: Verifies cross-site request forgery defenses
- **Authentication Bypass**: Tests access control mechanisms

### 4. Infrastructure Security
- **Security Headers Validation**: Checks HTTP security headers
- **HTTPS Configuration**: Validates SSL/TLS setup
- **File Permission Audit**: Reviews file system permissions

### 5. Penetration Testing
- **OWASP Top 10 Testing**: Comprehensive vulnerability assessment
- **Attack Chain Simulation**: Multi-stage attack scenarios
- **Business Logic Testing**: Application-specific security flaws

## 🔧 Running Individual Tests

### Security Attack Scenarios
```bash
# Run XSS, SQL injection, and other attack simulations
npm run security:attack-scenarios
```

### Penetration Testing Suite
```bash
# Run OWASP Top 10 and advanced attack simulations
npm run security:penetration-test
```

### Dependency Scanning
```bash
# Scan for vulnerable dependencies
npm run security:audit

# Fix automatically fixable vulnerabilities
npm run security:fix
```

### Code Security Analysis
```bash
# Run ESLint security rules
npm run security:scan
```

## 🎭 Attack Scenarios

### Cross-Site Scripting (XSS) Tests

The framework tests various XSS attack vectors:

```javascript
// Example XSS payloads tested
const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src="x" onerror="alert(\'XSS\')">',
  'javascript:alert("XSS")',
  '<svg onload="alert(\'XSS\')">',
  '<iframe src="javascript:alert(\'XSS\')"></iframe>'
];
```

### SQL Injection Tests

Tests protection against SQL injection attacks:

```javascript
// Example SQL injection payloads
const sqlInjectionPayloads = [
  "'; DROP TABLE users; --",
  "' OR '1'='1",
  "' UNION SELECT * FROM users --",
  "'; INSERT INTO users VALUES ('hacker', 'password'); --"
];
```

### Authentication Attack Tests

Simulates various authentication bypass attempts:

- Brute force attacks
- Credential stuffing
- Session hijacking
- Privilege escalation

### File Upload Security Tests

Tests file upload security:

- Malicious file type detection
- Path traversal prevention
- File size validation
- Content type verification

## 📊 Interpreting Results

### Security Score Calculation

The security score (0-100) is calculated based on:

- **Critical Issues**: -20 points each
- **High Issues**: -15 points each
- **Medium Issues**: -10 points each
- **Low Issues**: -5 points each

### Risk Levels

- **Critical (0-40)**: Immediate action required
- **High (41-60)**: Address within 24-48 hours
- **Medium (61-80)**: Address within 1-2 weeks
- **Low (81-100)**: Address in next maintenance cycle

### Report Files

After running tests, you'll find:

```
security-reports-YYYY-MM-DD_HH-MM-SS/
├── security-report.json          # Detailed JSON report
├── security-report.html          # Visual HTML report
├── security-test.log             # Execution log
├── npm-audit.json               # Dependency vulnerabilities
├── eslint-security.json         # Code security issues
├── security-headers-results.json # HTTP headers analysis
├── config-audit-results.json    # Configuration issues
├── security-tests-results.json  # Jest test results
└── penetration-tests-results.json # Penetration test results
```

## 🔧 Remediation Guidelines

### Critical Issues (Immediate Action)

1. **Exposed Secrets**
   ```bash
   # Rotate all exposed credentials immediately
   # Update .env files with new secrets
   # Add secrets to .gitignore if not already present
   ```

2. **Critical Vulnerabilities**
   ```bash
   # Update vulnerable dependencies
   npm audit fix --force
   
   # If breaking changes, update code accordingly
   npm update
   ```

3. **Missing Security Headers**
   ```javascript
   // Add to vercel.json or server configuration
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "Content-Security-Policy",
             "value": "default-src 'self'; script-src 'self'"
           }
         ]
       }
     ]
   }
   ```

### High Issues (24-48 Hours)

1. **XSS Vulnerabilities**
   ```javascript
   // Use proper input sanitization
   import { SecurityUtils } from './utils/security';
   
   const userInput = SecurityUtils.sanitizeHtml(rawInput);
   ```

2. **Authentication Issues**
   ```javascript
   // Implement rate limiting
   const rateLimiter = SecurityUtils.createRateLimiter(5, 60000);
   
   if (!rateLimiter(userIP)) {
     return res.status(429).json({ error: 'Too many requests' });
   }
   ```

### Medium Issues (1-2 Weeks)

1. **Weak Password Policies**
   ```javascript
   // Implement strong password validation
   const isStrongPassword = (password) => {
     return password.length >= 8 && 
            /[A-Z]/.test(password) && 
            /[a-z]/.test(password) && 
            /\d/.test(password) && 
            /[!@#$%^&*]/.test(password);
   };
   ```

2. **Missing Input Validation**
   ```javascript
   // Add comprehensive input validation
   const validateInput = (input, type) => {
     switch (type) {
       case 'email':
         return SecurityUtils.isValidEmail(input);
       case 'url':
         return SecurityUtils.isValidUrl(input);
       default:
         return SecurityUtils.sanitizeInput(input);
     }
   };
   ```

## 🔄 Continuous Security Testing

### Automated Testing in CI/CD

Add to `.github/workflows/security.yml`:

```yaml
name: Security Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run security tests
        run: npm run security:test-full
      - name: Upload security reports
        uses: actions/upload-artifact@v4
        with:
          name: security-reports
          path: security-reports-*/
```

### Regular Security Maintenance

**Daily:**
- Monitor security alerts
- Review failed authentication attempts
- Check error logs for suspicious activity

**Weekly:**
- Run comprehensive security tests
- Update dependencies
- Review security configurations

**Monthly:**
- Conduct penetration testing
- Review and update security policies
- Security training and awareness

**Quarterly:**
- Third-party security assessment
- Incident response plan review
- Security architecture review

## 🚨 Emergency Response

If critical security issues are detected:

1. **Immediate Response**
   ```bash
   # Run emergency response script
   npm run security:emergency
   ```

2. **Follow the generated incident response plan**
   - Review evidence in the generated directory
   - Follow the recovery checklist
   - Contact security team if needed

3. **Post-Incident Actions**
   - Conduct root cause analysis
   - Update security measures
   - Document lessons learned

## 📞 Support and Contact

- **Security Issues**: Create a private security advisory on GitHub
- **Emergency Contact**: ahmadziyad0807@gmail.com
- **Documentation**: Review `CYBERSECURITY_PREVENTION.md` for detailed security guidelines

## 🔗 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [SANS Secure Coding Practices](https://www.sans.org/white-papers/2172/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

*This guide is part of the comprehensive security framework for the Ahmad Ziyad Portfolio project. Keep this documentation updated as security measures evolve.*

**Last Updated**: January 2026  
**Next Review**: February 2026