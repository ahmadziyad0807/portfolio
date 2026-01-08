# 🛡️ Cybersecurity Prevention Guide

## Table of Contents
1. [Application Security](#application-security)
2. [Infrastructure Security](#infrastructure-security)
3. [Development Security](#development-security)
4. [Deployment Security](#deployment-security)
5. [Monitoring & Response](#monitoring--response)
6. [Personal Security](#personal-security)

---

## 🔐 Application Security

### Input Validation & Sanitization
```typescript
// Always validate and sanitize user inputs
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

### XSS Prevention
```typescript
// Use proper escaping for dynamic content
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Use dangerouslySetInnerHTML carefully
const SafeComponent = ({ content }: { content: string }) => {
  const sanitizedContent = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};
```

### CSRF Protection
```typescript
// Generate CSRF tokens
const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Validate CSRF tokens
const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(sessionToken, 'hex')
  );
};
```

### SQL Injection Prevention
```typescript
// Use parameterized queries (if using database)
const getUserById = async (id: number) => {
  // ❌ NEVER do this
  // const query = `SELECT * FROM users WHERE id = ${id}`;
  
  // ✅ Always use parameterized queries
  const query = 'SELECT * FROM users WHERE id = ?';
  return await db.query(query, [id]);
};
```

---

## 🏗️ Infrastructure Security

### HTTPS Everywhere
```json
// vercel.json - Force HTTPS
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

### Security Headers Implementation
```json
// Complete security headers setup
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
        }
      ]
    }
  ]
}
```

### Environment Security
```bash
# .env file security
NODE_ENV=production
API_KEY=your-secure-api-key-here
DATABASE_URL=your-secure-database-url
JWT_SECRET=your-very-long-random-jwt-secret-at-least-32-characters

# Never commit .env files
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

---

## 👨‍💻 Development Security

### Secure Coding Practices
```typescript
// 1. Use TypeScript for type safety
interface User {
  id: number;
  email: string;
  role: 'admin' | 'user';
}

// 2. Implement proper error handling
const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    // Don't expose internal errors to users
    console.error('Internal error:', error.message);
    return 'An error occurred. Please try again.';
  }
  return 'Unknown error occurred.';
};

// 3. Use secure random generation
const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// 4. Implement rate limiting
const rateLimiter = new Map<string, number>();
const isRateLimited = (ip: string): boolean => {
  const requests = rateLimiter.get(ip) || 0;
  if (requests > 100) return true; // 100 requests per hour
  rateLimiter.set(ip, requests + 1);
  return false;
};
```

### Dependency Security
```bash
# Regular security audits
npm audit
npm audit fix

# Use exact versions in package.json
{
  "dependencies": {
    "react": "18.2.0",  # Exact version
    "axios": "^1.6.2"   # Allow patch updates only
  }
}

# Check for known vulnerabilities
npx audit-ci --moderate
```

### Code Review Security Checklist
```markdown
## Security Code Review Checklist

### Input Validation
- [ ] All user inputs are validated
- [ ] Input length limits are enforced
- [ ] Special characters are handled properly
- [ ] File uploads are restricted and validated

### Authentication & Authorization
- [ ] Authentication is required for sensitive operations
- [ ] Authorization checks are in place
- [ ] Session management is secure
- [ ] Password policies are enforced

### Data Protection
- [ ] Sensitive data is encrypted
- [ ] No hardcoded secrets
- [ ] Proper error handling (no info leakage)
- [ ] Secure communication (HTTPS)

### Dependencies
- [ ] No known vulnerable dependencies
- [ ] Dependencies are up to date
- [ ] Minimal dependency footprint
```

---

## 🚀 Deployment Security

### CI/CD Security
```yaml
# .github/workflows/security-deploy.yml
name: Secure Deployment

on:
  push:
    branches: [main]

jobs:
  security-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Security Audit
        run: |
          npm audit --audit-level=moderate
          
      - name: Secret Scanning
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          
      - name: SAST Scanning
        uses: github/codeql-action/analyze@v2
        
  deploy:
    needs: security-checks
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          # Only deploy if security checks pass
          npm run build
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

### Production Security
```typescript
// Production security configurations
const productionConfig = {
  // Disable debug mode
  debug: false,
  
  // Enable security middleware
  helmet: true,
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // CORS configuration
  cors: {
    origin: ['https://yourdomain.com'],
    credentials: true
  }
};
```

---

## 📊 Monitoring & Response

### Security Monitoring
```typescript
// Security event logging
const logSecurityEvent = (event: string, details: any) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    details,
    severity: 'security'
  }));
};

// Monitor for suspicious activity
const detectSuspiciousActivity = (req: Request) => {
  const suspiciousPatterns = [
    /\<script\>/i,
    /union.*select/i,
    /\.\.\//,
    /eval\(/i
  ];
  
  const userInput = req.body + req.query + req.params;
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(userInput)
  );
  
  if (isSuspicious) {
    logSecurityEvent('suspicious_input', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      input: userInput
    });
  }
};
```

### Incident Response Plan
```markdown
## Security Incident Response

### Immediate Response (0-1 hour)
1. **Identify** the security incident
2. **Isolate** affected systems
3. **Assess** the scope and impact
4. **Notify** stakeholders

### Short-term Response (1-24 hours)
1. **Contain** the incident
2. **Investigate** root cause
3. **Document** findings
4. **Implement** temporary fixes

### Long-term Response (1-7 days)
1. **Remediate** vulnerabilities
2. **Update** security measures
3. **Review** and improve processes
4. **Conduct** post-incident review
```

---

## 🔒 Personal Security

### Developer Security Best Practices
```bash
# 1. Use strong, unique passwords
# Use a password manager like 1Password, Bitwarden

# 2. Enable 2FA everywhere
# GitHub, npm, Vercel, email accounts

# 3. Keep systems updated
sudo apt update && sudo apt upgrade  # Linux
brew upgrade                         # macOS

# 4. Use secure development environment
# Enable firewall
# Use VPN for public WiFi
# Regular malware scans
```

### Git Security
```bash
# Sign commits with GPG
git config --global user.signingkey YOUR_GPG_KEY
git config --global commit.gpgsign true

# Use SSH keys instead of HTTPS
ssh-keygen -t ed25519 -C "your_email@example.com"

# Verify repository integrity
git fsck
git verify-commit HEAD
```

---

## 🚨 Common Attack Vectors & Prevention

### 1. Cross-Site Scripting (XSS)
**Prevention:**
- Sanitize all user inputs
- Use Content Security Policy
- Escape output data
- Use secure frameworks

### 2. SQL Injection
**Prevention:**
- Use parameterized queries
- Input validation
- Least privilege database access
- Regular security testing

### 3. Cross-Site Request Forgery (CSRF)
**Prevention:**
- CSRF tokens
- SameSite cookies
- Verify referrer headers
- Double-submit cookies

### 4. Insecure Dependencies
**Prevention:**
- Regular dependency updates
- Automated vulnerability scanning
- Minimal dependency usage
- Security-focused package selection

### 5. Broken Authentication
**Prevention:**
- Strong password policies
- Multi-factor authentication
- Secure session management
- Account lockout mechanisms

---

## 📋 Security Checklist

### Daily
- [ ] Monitor security alerts
- [ ] Review access logs
- [ ] Check for failed login attempts

### Weekly
- [ ] Update dependencies
- [ ] Review security configurations
- [ ] Backup security policies

### Monthly
- [ ] Security audit
- [ ] Penetration testing
- [ ] Review and update documentation
- [ ] Security training

### Quarterly
- [ ] Comprehensive security review
- [ ] Update incident response plan
- [ ] Security policy review
- [ ] Third-party security assessment

---

## 🔗 Security Resources

### Tools
- **OWASP ZAP** - Web application security scanner
- **Snyk** - Dependency vulnerability scanner
- **SonarQube** - Code quality and security analysis
- **Burp Suite** - Web application security testing

### Learning Resources
- **OWASP Top 10** - Most critical web application risks
- **SANS Secure Coding Practices**
- **Mozilla Web Security Guidelines**
- **Google Security Best Practices**

### Emergency Contacts
- **Security Team**: security@yourcompany.com
- **Incident Response**: incident@yourcompany.com
- **24/7 Hotline**: +1-XXX-XXX-XXXX

---

*Remember: Security is not a one-time setup but an ongoing process. Stay vigilant, keep learning, and always assume that attackers are trying to find vulnerabilities in your system.*

**Last Updated**: January 2026  
**Next Review**: February 2026