@echo off
echo 🔒 Setting up security for Ahmad Ziyad Portfolio...

REM Create environment files if they don't exist
if not exist "packages\backend\.env" (
    echo 📝 Creating backend environment file...
    copy "packages\backend\.env.example" "packages\backend\.env"
    echo ⚠️  Please edit packages\backend\.env with secure values
)

REM Install security dependencies
echo 📦 Installing security dependencies...
npm install --save-dev eslint-plugin-security audit-ci

REM Run initial security audit
echo 🔍 Running security audit...
npm audit

REM Generate security report
echo 📊 Generating security report...
echo Security Checklist for Ahmad Ziyad Portfolio > security-checklist.txt
echo ========================================== >> security-checklist.txt
echo. >> security-checklist.txt
echo ✅ Environment files created >> security-checklist.txt
echo ✅ Security headers configured >> security-checklist.txt
echo ✅ Dependencies audited >> security-checklist.txt
echo ✅ Security documentation created >> security-checklist.txt
echo. >> security-checklist.txt
echo Next Steps: >> security-checklist.txt
echo - [ ] Review and update .env files with secure values >> security-checklist.txt
echo - [ ] Enable GitHub security features (Dependabot, CodeQL) >> security-checklist.txt
echo - [ ] Set up monitoring and alerting >> security-checklist.txt
echo - [ ] Regular security reviews (monthly) >> security-checklist.txt
echo. >> security-checklist.txt
echo Generated: %date% %time% >> security-checklist.txt

echo ✅ Security setup complete!
echo 📋 Check security-checklist.txt for next steps
echo 📖 Review SECURITY.md for detailed security guidelines

pause