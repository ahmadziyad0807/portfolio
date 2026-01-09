@echo off
setlocal enabledelayedexpansion

REM Comprehensive Security Testing Script for Windows
echo 🛡️ Starting Comprehensive Security Testing Suite
echo =================================================

REM Get current timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "TIMESTAMP=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"
set "REPORT_DIR=security-reports-%TIMESTAMP%"
mkdir "%REPORT_DIR%"

REM Function to log messages
echo [%date% %time%] Security testing initiated >> "%REPORT_DIR%\security-test.log"

REM Step 1: Static Code Analysis
echo 🔍 Step 1: Static Code Analysis
echo [%date% %time%] Running static code analysis >> "%REPORT_DIR%\security-test.log"

REM ESLint security scan
echo Running ESLint security scan...
npx eslint . --config .eslintrc.security.js --ext .js,.jsx,.ts,.tsx --format json > "%REPORT_DIR%\eslint-security.json" 2>nul

REM Check for hardcoded secrets
echo Scanning for hardcoded secrets...
findstr /s /i /n "password secret key token api_key" *.js *.ts *.tsx *.json > "%REPORT_DIR%\potential-secrets.txt" 2>nul
if errorlevel 1 echo No obvious secrets found > "%REPORT_DIR%\potential-secrets.txt"

REM Step 2: Dependency Vulnerability Scan
echo 📦 Step 2: Dependency Vulnerability Scan
echo [%date% %time%] Scanning dependencies for vulnerabilities >> "%REPORT_DIR%\security-test.log"

REM NPM audit
echo Running npm audit...
npm audit --json > "%REPORT_DIR%\npm-audit.json" 2>nul
npm audit > "%REPORT_DIR%\npm-audit-summary.txt" 2>nul

REM Step 3: Security Headers Test
echo 🔒 Step 3: Security Headers Test
echo [%date% %time%] Testing security headers configuration >> "%REPORT_DIR%\security-test.log"

REM Create security headers test
echo const https = require('https'); > "%REPORT_DIR%\security-headers-test.js"
echo const http = require('http'); >> "%REPORT_DIR%\security-headers-test.js"
echo. >> "%REPORT_DIR%\security-headers-test.js"
echo const testSecurityHeaders = (url) =^> { >> "%REPORT_DIR%\security-headers-test.js"
echo   return new Promise((resolve, reject) =^> { >> "%REPORT_DIR%\security-headers-test.js"
echo     const client = url.startsWith('https') ? https : http; >> "%REPORT_DIR%\security-headers-test.js"
echo. >> "%REPORT_DIR%\security-headers-test.js"
echo     client.get(url, (res) =^> { >> "%REPORT_DIR%\security-headers-test.js"
echo       const headers = res.headers; >> "%REPORT_DIR%\security-headers-test.js"
echo       const securityHeaders = { >> "%REPORT_DIR%\security-headers-test.js"
echo         'content-security-policy': headers['content-security-policy'], >> "%REPORT_DIR%\security-headers-test.js"
echo         'strict-transport-security': headers['strict-transport-security'], >> "%REPORT_DIR%\security-headers-test.js"
echo         'x-content-type-options': headers['x-content-type-options'], >> "%REPORT_DIR%\security-headers-test.js"
echo         'x-frame-options': headers['x-frame-options'], >> "%REPORT_DIR%\security-headers-test.js"
echo         'x-xss-protection': headers['x-xss-protection'], >> "%REPORT_DIR%\security-headers-test.js"
echo         'referrer-policy': headers['referrer-policy'] >> "%REPORT_DIR%\security-headers-test.js"
echo       }; >> "%REPORT_DIR%\security-headers-test.js"
echo. >> "%REPORT_DIR%\security-headers-test.js"
echo       const results = { >> "%REPORT_DIR%\security-headers-test.js"
echo         url, >> "%REPORT_DIR%\security-headers-test.js"
echo         statusCode: res.statusCode, >> "%REPORT_DIR%\security-headers-test.js"
echo         securityHeaders, >> "%REPORT_DIR%\security-headers-test.js"
echo         missing: [], >> "%REPORT_DIR%\security-headers-test.js"
echo         present: [] >> "%REPORT_DIR%\security-headers-test.js"
echo       }; >> "%REPORT_DIR%\security-headers-test.js"
echo. >> "%REPORT_DIR%\security-headers-test.js"
echo       Object.keys(securityHeaders).forEach(header =^> { >> "%REPORT_DIR%\security-headers-test.js"
echo         if (securityHeaders[header]) { >> "%REPORT_DIR%\security-headers-test.js"
echo           results.present.push(header); >> "%REPORT_DIR%\security-headers-test.js"
echo         } else { >> "%REPORT_DIR%\security-headers-test.js"
echo           results.missing.push(header); >> "%REPORT_DIR%\security-headers-test.js"
echo         } >> "%REPORT_DIR%\security-headers-test.js"
echo       }); >> "%REPORT_DIR%\security-headers-test.js"
echo. >> "%REPORT_DIR%\security-headers-test.js"
echo       resolve(results); >> "%REPORT_DIR%\security-headers-test.js"
echo     }).on('error', reject); >> "%REPORT_DIR%\security-headers-test.js"
echo   }); >> "%REPORT_DIR%\security-headers-test.js"
echo }; >> "%REPORT_DIR%\security-headers-test.js"
echo. >> "%REPORT_DIR%\security-headers-test.js"
echo testSecurityHeaders('http://localhost:3000') >> "%REPORT_DIR%\security-headers-test.js"
echo   .then(results =^> console.log(JSON.stringify(results, null, 2))) >> "%REPORT_DIR%\security-headers-test.js"
echo   .catch(error =^> console.log(JSON.stringify({ error: error.message }, null, 2))); >> "%REPORT_DIR%\security-headers-test.js"

REM Run security headers test
echo Testing security headers...
node "%REPORT_DIR%\security-headers-test.js" > "%REPORT_DIR%\security-headers-results.json" 2>nul
if errorlevel 1 echo {"error": "Could not test headers - server not running"} > "%REPORT_DIR%\security-headers-results.json"

REM Step 4: File Permission Audit
echo 📁 Step 4: File Permission Audit
echo [%date% %time%] Auditing file permissions >> "%REPORT_DIR%\security-test.log"

REM Check for potentially dangerous files
echo Checking for potentially dangerous files...
dir /s /b *.exe *.bat *.cmd *.ps1 *.vbs *.scr > "%REPORT_DIR%\executable-files.txt" 2>nul
if errorlevel 1 echo No executable files found > "%REPORT_DIR%\executable-files.txt"

REM Step 5: Configuration Security Audit
echo ⚙️ Step 5: Configuration Security Audit
echo [%date% %time%] Auditing configuration security >> "%REPORT_DIR%\security-test.log"

REM Create configuration audit script
echo const fs = require('fs'); > "%REPORT_DIR%\config-audit.js"
echo const path = require('path'); >> "%REPORT_DIR%\config-audit.js"
echo. >> "%REPORT_DIR%\config-audit.js"
echo const configFiles = [ >> "%REPORT_DIR%\config-audit.js"
echo   'package.json', >> "%REPORT_DIR%\config-audit.js"
echo   'vercel.json', >> "%REPORT_DIR%\config-audit.js"
echo   'packages/frontend/vercel.json', >> "%REPORT_DIR%\config-audit.js"
echo   '.env.example', >> "%REPORT_DIR%\config-audit.js"
echo   'packages/backend/.env.example' >> "%REPORT_DIR%\config-audit.js"
echo ]; >> "%REPORT_DIR%\config-audit.js"
echo. >> "%REPORT_DIR%\config-audit.js"
echo const securityIssues = []; >> "%REPORT_DIR%\config-audit.js"
echo. >> "%REPORT_DIR%\config-audit.js"
echo configFiles.forEach(file =^> { >> "%REPORT_DIR%\config-audit.js"
echo   if (fs.existsSync(file)) { >> "%REPORT_DIR%\config-audit.js"
echo     try { >> "%REPORT_DIR%\config-audit.js"
echo       const content = fs.readFileSync(file, 'utf8'); >> "%REPORT_DIR%\config-audit.js"
echo. >> "%REPORT_DIR%\config-audit.js"
echo       if (content.includes('"debug": true') ^&^& file.includes('production')) { >> "%REPORT_DIR%\config-audit.js"
echo         securityIssues.push(`${file}: Debug mode enabled in production`); >> "%REPORT_DIR%\config-audit.js"
echo       } >> "%REPORT_DIR%\config-audit.js"
echo. >> "%REPORT_DIR%\config-audit.js"
echo       if (content.includes('cors.*"*"') ^|^| content.includes("'*'")) { >> "%REPORT_DIR%\config-audit.js"
echo         securityIssues.push(`${file}: Wildcard CORS configuration detected`); >> "%REPORT_DIR%\config-audit.js"
echo       } >> "%REPORT_DIR%\config-audit.js"
echo. >> "%REPORT_DIR%\config-audit.js"
echo       if (content.includes('password') ^&^& content.includes('admin')) { >> "%REPORT_DIR%\config-audit.js"
echo         securityIssues.push(`${file}: Potential default credentials found`); >> "%REPORT_DIR%\config-audit.js"
echo       } >> "%REPORT_DIR%\config-audit.js"
echo. >> "%REPORT_DIR%\config-audit.js"
echo     } catch (error) { >> "%REPORT_DIR%\config-audit.js"
echo       securityIssues.push(`${file}: Could not read file - ${error.message}`); >> "%REPORT_DIR%\config-audit.js"
echo     } >> "%REPORT_DIR%\config-audit.js"
echo   } >> "%REPORT_DIR%\config-audit.js"
echo }); >> "%REPORT_DIR%\config-audit.js"
echo. >> "%REPORT_DIR%\config-audit.js"
echo console.log(JSON.stringify({ configFiles, securityIssues }, null, 2)); >> "%REPORT_DIR%\config-audit.js"

node "%REPORT_DIR%\config-audit.js" > "%REPORT_DIR%\config-audit-results.json"

REM Step 6: Run Jest Security Tests
echo 🧪 Step 6: Running Jest Security Tests
echo [%date% %time%] Executing security test suites >> "%REPORT_DIR%\security-test.log"

echo Running security attack scenarios tests...
npm test -- --testPathPattern="security-attack-scenarios" --json > "%REPORT_DIR%\security-tests-results.json" 2>nul

echo Running penetration testing suite...
npm test -- --testPathPattern="penetration-testing" --json > "%REPORT_DIR%\penetration-tests-results.json" 2>nul

REM Step 7: Generate Comprehensive Report
echo 📊 Step 7: Generating Comprehensive Security Report
echo [%date% %time%] Generating security report >> "%REPORT_DIR%\security-test.log"

REM Create comprehensive report generator
echo const fs = require('fs'); > "%REPORT_DIR%\generate-report.js"
echo. >> "%REPORT_DIR%\generate-report.js"
echo const readJsonFile = (filename) =^> { >> "%REPORT_DIR%\generate-report.js"
echo   try { >> "%REPORT_DIR%\generate-report.js"
echo     return JSON.parse(fs.readFileSync(filename, 'utf8')); >> "%REPORT_DIR%\generate-report.js"
echo   } catch (error) { >> "%REPORT_DIR%\generate-report.js"
echo     return { error: `Could not read ${filename}: ${error.message}` }; >> "%REPORT_DIR%\generate-report.js"
echo   } >> "%REPORT_DIR%\generate-report.js"
echo }; >> "%REPORT_DIR%\generate-report.js"
echo. >> "%REPORT_DIR%\generate-report.js"
echo const readTextFile = (filename) =^> { >> "%REPORT_DIR%\generate-report.js"
echo   try { >> "%REPORT_DIR%\generate-report.js"
echo     return fs.readFileSync(filename, 'utf8'); >> "%REPORT_DIR%\generate-report.js"
echo   } catch (error) { >> "%REPORT_DIR%\generate-report.js"
echo     return `Could not read ${filename}: ${error.message}`; >> "%REPORT_DIR%\generate-report.js"
echo   } >> "%REPORT_DIR%\generate-report.js"
echo }; >> "%REPORT_DIR%\generate-report.js"
echo. >> "%REPORT_DIR%\generate-report.js"
echo const npmAudit = readJsonFile('npm-audit.json'); >> "%REPORT_DIR%\generate-report.js"
echo const securityHeaders = readJsonFile('security-headers-results.json'); >> "%REPORT_DIR%\generate-report.js"
echo const configAudit = readJsonFile('config-audit-results.json'); >> "%REPORT_DIR%\generate-report.js"
echo. >> "%REPORT_DIR%\generate-report.js"
echo let securityScore = 100; >> "%REPORT_DIR%\generate-report.js"
echo let criticalIssues = 0; >> "%REPORT_DIR%\generate-report.js"
echo let highIssues = 0; >> "%REPORT_DIR%\generate-report.js"
echo let mediumIssues = 0; >> "%REPORT_DIR%\generate-report.js"
echo let lowIssues = 0; >> "%REPORT_DIR%\generate-report.js"
echo. >> "%REPORT_DIR%\generate-report.js"
echo if (npmAudit.vulnerabilities) { >> "%REPORT_DIR%\generate-report.js"
echo   Object.values(npmAudit.vulnerabilities).forEach(vuln =^> { >> "%REPORT_DIR%\generate-report.js"
echo     switch (vuln.severity) { >> "%REPORT_DIR%\generate-report.js"
echo       case 'critical': criticalIssues++; securityScore -= 20; break; >> "%REPORT_DIR%\generate-report.js"
echo       case 'high': highIssues++; securityScore -= 15; break; >> "%REPORT_DIR%\generate-report.js"
echo       case 'moderate': mediumIssues++; securityScore -= 10; break; >> "%REPORT_DIR%\generate-report.js"
echo       case 'low': lowIssues++; securityScore -= 5; break; >> "%REPORT_DIR%\generate-report.js"
echo     } >> "%REPORT_DIR%\generate-report.js"
echo   }); >> "%REPORT_DIR%\generate-report.js"
echo } >> "%REPORT_DIR%\generate-report.js"
echo. >> "%REPORT_DIR%\generate-report.js"
echo securityScore = Math.max(0, securityScore); >> "%REPORT_DIR%\generate-report.js"
echo. >> "%REPORT_DIR%\generate-report.js"
echo let riskLevel = 'low'; >> "%REPORT_DIR%\generate-report.js"
echo if (criticalIssues ^> 0) riskLevel = 'critical'; >> "%REPORT_DIR%\generate-report.js"
echo else if (highIssues ^> 0) riskLevel = 'high'; >> "%REPORT_DIR%\generate-report.js"
echo else if (mediumIssues ^> 0) riskLevel = 'medium'; >> "%REPORT_DIR%\generate-report.js"
echo. >> "%REPORT_DIR%\generate-report.js"
echo const report = { >> "%REPORT_DIR%\generate-report.js"
echo   summary: { >> "%REPORT_DIR%\generate-report.js"
echo     timestamp: new Date().toISOString(), >> "%REPORT_DIR%\generate-report.js"
echo     securityScore, >> "%REPORT_DIR%\generate-report.js"
echo     riskLevel, >> "%REPORT_DIR%\generate-report.js"
echo     totalIssues: criticalIssues + highIssues + mediumIssues + lowIssues, >> "%REPORT_DIR%\generate-report.js"
echo     criticalIssues, >> "%REPORT_DIR%\generate-report.js"
echo     highIssues, >> "%REPORT_DIR%\generate-report.js"
echo     mediumIssues, >> "%REPORT_DIR%\generate-report.js"
echo     lowIssues >> "%REPORT_DIR%\generate-report.js"
echo   } >> "%REPORT_DIR%\generate-report.js"
echo }; >> "%REPORT_DIR%\generate-report.js"
echo. >> "%REPORT_DIR%\generate-report.js"
echo fs.writeFileSync('security-report.json', JSON.stringify(report, null, 2)); >> "%REPORT_DIR%\generate-report.js"
echo. >> "%REPORT_DIR%\generate-report.js"
echo console.log('Security report generated successfully!'); >> "%REPORT_DIR%\generate-report.js"
echo console.log(`Security Score: ${securityScore}%%`); >> "%REPORT_DIR%\generate-report.js"
echo console.log(`Risk Level: ${riskLevel.toUpperCase()}`); >> "%REPORT_DIR%\generate-report.js"
echo console.log(`Total Issues: ${criticalIssues + highIssues + mediumIssues + lowIssues}`); >> "%REPORT_DIR%\generate-report.js"

REM Generate the report
cd "%REPORT_DIR%"
node generate-report.js
cd ..

REM Step 8: Summary
echo.
echo 🎯 SECURITY TESTING COMPLETE
echo =============================
echo Report Directory: %REPORT_DIR%
echo Generated Files:
echo   - security-report.json (Detailed JSON report)
echo   - security-test.log (Execution log)
echo   - Individual test result files
echo.

REM Display summary if report was generated successfully
if exist "%REPORT_DIR%\security-report.json" (
    echo 📊 SECURITY SUMMARY:
    node -e "const report = JSON.parse(require('fs').readFileSync('%REPORT_DIR%/security-report.json', 'utf8')); console.log('Security Score:', report.summary.securityScore + '%%'); console.log('Risk Level:', report.summary.riskLevel.toUpperCase()); console.log('Total Issues:', report.summary.totalIssues); console.log('Critical Issues:', report.summary.criticalIssues); console.log('High Issues:', report.summary.highIssues); console.log('Medium Issues:', report.summary.mediumIssues); console.log('Low Issues:', report.summary.lowIssues);"
) else (
    echo ⚠️ Report generation failed. Check individual test files for details.
)

echo.
echo 🔍 To view the detailed report:
echo   - Review %REPORT_DIR%\security-report.json for raw data
echo.

echo [%date% %time%] Security testing completed >> "%REPORT_DIR%\security-test.log"

echo For immediate assistance with critical issues, contact: ahmadziyad0807@gmail.com

pause