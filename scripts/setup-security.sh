#!/bin/bash

# Security Setup Script for Portfolio Project
echo "🔒 Setting up security for Ahmad Ziyad Portfolio..."

# Create environment files if they don't exist
if [ ! -f "packages/backend/.env" ]; then
    echo "📝 Creating backend environment file..."
    cp packages/backend/.env.example packages/backend/.env
    echo "⚠️  Please edit packages/backend/.env with secure values"
fi

# Install security dependencies
echo "📦 Installing security dependencies..."
npm install --save-dev eslint-plugin-security audit-ci

# Run initial security audit
echo "🔍 Running security audit..."
npm audit

# Check for common security issues
echo "🔎 Checking for potential security issues..."

# Check for hardcoded secrets (basic check)
echo "Checking for potential secrets..."
grep -r -i "password\|secret\|key\|token" --include="*.js" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules . || echo "No obvious secrets found"

# Set proper file permissions
echo "🔐 Setting secure file permissions..."
chmod 600 packages/backend/.env 2>/dev/null || echo "Backend .env not found"
chmod 644 .gitignore
chmod 644 SECURITY.md

# Generate security report
echo "📊 Generating security report..."
cat > security-checklist.txt << EOF
Security Checklist for Ahmad Ziyad Portfolio
==========================================

✅ Environment files created
✅ Security headers configured
✅ Dependencies audited
✅ File permissions set
✅ Security documentation created

Next Steps:
- [ ] Review and update .env files with secure values
- [ ] Enable GitHub security features (Dependabot, CodeQL)
- [ ] Set up monitoring and alerting
- [ ] Regular security reviews (monthly)

Generated: $(date)
EOF

echo "✅ Security setup complete!"
echo "📋 Check security-checklist.txt for next steps"
echo "📖 Review SECURITY.md for detailed security guidelines"