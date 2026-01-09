#!/bin/bash

# Comprehensive Security Testing Script
echo "🛡️ Starting Comprehensive Security Testing Suite"
echo "================================================="

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
REPORT_DIR="security-reports-${TIMESTAMP}"
mkdir -p "$REPORT_DIR"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$REPORT_DIR/security-test.log"
}

log_message "Security testing initiated"

# Step 1: Static Code Analysis
echo "🔍 Step 1: Static Code Analysis"
log_message "Running static code analysis"

# ESLint security scan
echo "Running ESLint security scan..."
npx eslint . --config .eslintrc.security.js --ext .js,.jsx,.ts,.tsx --format json > "$REPORT_DIR/eslint-security.json" 2>/dev/null || true

# Check for hardcoded secrets
echo "Scanning for hardcoded secrets..."
grep -r -i -n "password\|secret\|key\|token\|api_key" --include="*.js" --include="*.ts" --include="*.tsx" --include="*.json" --exclude-dir=node_modules --exclude-dir=.git . > "$REPORT_DIR/potential-secrets.txt" 2>/dev/null || echo "No obvious secrets found" > "$REPORT_DIR/potential-secrets.txt"

# Step 2: Dependency Vulnerability Scan
echo "📦 Step 2: Dependency Vulnerability Scan"
log_message "Scanning dependencies for vulnerabilities"

# NPM audit
echo "Running npm audit..."
npm audit --json > "$REPORT_DIR/npm-audit.json" 2>/dev/null || true

# Generate audit summary
npm audit > "$REPORT_DIR/npm-audit-summary.txt" 2>/dev/null || true

# Step 3: Security Headers Test
echo "🔒 Step 3: Security Headers Test"
log_message "Testing security headers configuration"

# Create security headers test
cat > "$REPORT_DIR/security-headers-test.js" << 'EOF'
const https = require('https');
const http = require('http');

const testSecurityHeaders = (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      const headers = res.headers;
      const securityHeaders = {
        'content-security-policy': headers['content-security-policy'],
        'strict-transport-security': headers['strict-transport-security'],
        'x-content-type-options': headers['x-content-type-options'],
        'x-frame-options': headers['x-frame-options'],
        'x-xss-protection': headers['x-xss-protection'],
        'referrer-policy': headers['referrer-policy']
      };
      
      const results = {
        url,
        statusCode: res.statusCode,
        securityHeaders,
        missing: [],
        present: []
      };
      
      Object.keys(securityHeaders).forEach(header => {
        if (securityHeaders[header]) {
          results.present.push(header);
        } else {
          results.missing.push(header);
        }
      });
      
      resolve(results);
    }).on('error', reject);
  });
};

// Test localhost (if running)
testSecurityHeaders('http://localhost:3000')
  .then(results => {
    console.log(JSON.stringify(results, null, 2));
  })
  .catch(error => {
    console.log(JSON.stringify({ error: error.message }, null, 2));
  });
EOF

# Run security headers test
echo "Testing security headers..."
node "$REPORT_DIR/security-headers-test.js" > "$REPORT_DIR/security-headers-results.json" 2>/dev/null || echo '{"error": "Could not test headers - server not running"}' > "$REPORT_DIR/security-headers-results.json"

# Step 4: File Permission Audit
echo "📁 Step 4: File Permission Audit"
log_message "Auditing file permissions"

# Check for overly permissive files
echo "Checking file permissions..."
find . -type f -perm -o+w ! -path "./node_modules/*" ! -path "./.git/*" > "$REPORT_DIR/world-writable-files.txt" 2>/dev/null || true

# Check for executable files that shouldn't be
find . -type f -executable ! -name "*.sh" ! -name "*.bat" ! -path "./node_modules/*" ! -path "./.git/*" > "$REPORT_DIR/unexpected-executables.txt" 2>/dev/null || true

# Step 5: Configuration Security Audit
echo "⚙️ Step 5: Configuration Security Audit"
log_message "Auditing configuration security"

# Check for insecure configurations
cat > "$REPORT_DIR/config-audit.js" << 'EOF'
const fs = require('fs');
const path = require('path');

const configFiles = [
  'package.json',
  'vercel.json',
  'packages/frontend/vercel.json',
  '.env.example',
  'packages/backend/.env.example'
];

const securityIssues = [];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for common security misconfigurations
      if (content.includes('"debug": true') && file.includes('production')) {
        securityIssues.push(`${file}: Debug mode enabled in production`);
      }
      
      if (content.includes('cors.*"*"') || content.includes("'*'")) {
        securityIssues.push(`${file}: Wildcard CORS configuration detected`);
      }
      
      if (content.includes('password') && content.includes('admin')) {
        securityIssues.push(`${file}: Potential default credentials found`);
      }
      
      if (content.includes('ssl.*false') || content.includes('secure.*false')) {
        securityIssues.push(`${file}: SSL/TLS security disabled`);
      }
      
    } catch (error) {
      securityIssues.push(`${file}: Could not read file - ${error.message}`);
    }
  }
});

console.log(JSON.stringify({ configFiles, securityIssues }, null, 2));
EOF

node "$REPORT_DIR/config-audit.js" > "$REPORT_DIR/config-audit-results.json"

# Step 6: Run Jest Security Tests
echo "🧪 Step 6: Running Jest Security Tests"
log_message "Executing security test suites"

# Run security-specific tests
echo "Running security attack scenarios tests..."
npm test -- --testPathPattern="security-attack-scenarios" --json > "$REPORT_DIR/security-tests-results.json" 2>/dev/null || true

echo "Running penetration testing suite..."
npm test -- --testPathPattern="penetration-testing" --json > "$REPORT_DIR/penetration-tests-results.json" 2>/dev/null || true

# Step 7: Generate Comprehensive Report
echo "📊 Step 7: Generating Comprehensive Security Report"
log_message "Generating security report"

# Create comprehensive report generator
cat > "$REPORT_DIR/generate-report.js" << 'EOF'
const fs = require('fs');

const readJsonFile = (filename) => {
  try {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
  } catch (error) {
    return { error: `Could not read ${filename}: ${error.message}` };
  }
};

const readTextFile = (filename) => {
  try {
    return fs.readFileSync(filename, 'utf8');
  } catch (error) {
    return `Could not read ${filename}: ${error.message}`;
  }
};

// Read all test results
const eslintResults = readJsonFile('eslint-security.json');
const npmAudit = readJsonFile('npm-audit.json');
const securityHeaders = readJsonFile('security-headers-results.json');
const configAudit = readJsonFile('config-audit-results.json');
const securityTests = readJsonFile('security-tests-results.json');
const penetrationTests = readJsonFile('penetration-tests-results.json');

const potentialSecrets = readTextFile('potential-secrets.txt');
const worldWritableFiles = readTextFile('world-writable-files.txt');
const unexpectedExecutables = readTextFile('unexpected-executables.txt');

// Calculate security score
let securityScore = 100;
let criticalIssues = 0;
let highIssues = 0;
let mediumIssues = 0;
let lowIssues = 0;

// Analyze NPM audit results
if (npmAudit.vulnerabilities) {
  Object.values(npmAudit.vulnerabilities).forEach(vuln => {
    switch (vuln.severity) {
      case 'critical':
        criticalIssues++;
        securityScore -= 20;
        break;
      case 'high':
        highIssues++;
        securityScore -= 15;
        break;
      case 'moderate':
        mediumIssues++;
        securityScore -= 10;
        break;
      case 'low':
        lowIssues++;
        securityScore -= 5;
        break;
    }
  });
}

// Analyze ESLint security results
if (eslintResults.length) {
  eslintResults.forEach(result => {
    if (result.messages) {
      result.messages.forEach(message => {
        if (message.severity === 2) {
          highIssues++;
          securityScore -= 5;
        } else {
          mediumIssues++;
          securityScore -= 2;
        }
      });
    }
  });
}

// Analyze configuration issues
if (configAudit.securityIssues && configAudit.securityIssues.length > 0) {
  configAudit.securityIssues.forEach(issue => {
    if (issue.includes('production') || issue.includes('SSL') || issue.includes('credentials')) {
      criticalIssues++;
      securityScore -= 15;
    } else {
      mediumIssues++;
      securityScore -= 8;
    }
  });
}

// Analyze security headers
if (securityHeaders.missing && securityHeaders.missing.length > 0) {
  securityHeaders.missing.forEach(header => {
    if (header === 'content-security-policy' || header === 'strict-transport-security') {
      highIssues++;
      securityScore -= 10;
    } else {
      mediumIssues++;
      securityScore -= 5;
    }
  });
}

// Ensure score doesn't go below 0
securityScore = Math.max(0, securityScore);

// Determine risk level
let riskLevel = 'low';
if (criticalIssues > 0) riskLevel = 'critical';
else if (highIssues > 0) riskLevel = 'high';
else if (mediumIssues > 0) riskLevel = 'medium';

// Generate recommendations
const recommendations = [];
if (criticalIssues > 0) {
  recommendations.push('🚨 URGENT: Address all critical vulnerabilities immediately');
}
if (highIssues > 0) {
  recommendations.push('⚠️ HIGH PRIORITY: Resolve high-severity issues within 24-48 hours');
}
if (mediumIssues > 0) {
  recommendations.push('📋 MEDIUM PRIORITY: Address medium-severity issues within 1-2 weeks');
}
if (lowIssues > 0) {
  recommendations.push('📝 LOW PRIORITY: Address low-severity issues in next maintenance cycle');
}

recommendations.push('🔍 Schedule regular security audits and penetration testing');
recommendations.push('📚 Keep security documentation and incident response plans updated');
recommendations.push('🎯 Implement continuous security monitoring');

// Generate final report
const report = {
  summary: {
    timestamp: new Date().toISOString(),
    securityScore,
    riskLevel,
    totalIssues: criticalIssues + highIssues + mediumIssues + lowIssues,
    criticalIssues,
    highIssues,
    mediumIssues,
    lowIssues
  },
  testResults: {
    eslintSecurity: eslintResults,
    npmAudit: npmAudit,
    securityHeaders: securityHeaders,
    configurationAudit: configAudit,
    securityTests: securityTests,
    penetrationTests: penetrationTests
  },
  fileAnalysis: {
    potentialSecrets: potentialSecrets.split('\n').filter(line => line.trim()),
    worldWritableFiles: worldWritableFiles.split('\n').filter(line => line.trim()),
    unexpectedExecutables: unexpectedExecutables.split('\n').filter(line => line.trim())
  },
  recommendations
};

// Write JSON report
fs.writeFileSync('security-report.json', JSON.stringify(report, null, 2));

// Generate HTML report
const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .score { font-size: 3em; font-weight: bold; color: ${riskLevel === 'critical' ? '#dc3545' : riskLevel === 'high' ? '#fd7e14' : riskLevel === 'medium' ? '#ffc107' : '#28a745'}; }
        .risk-level { font-size: 1.5em; color: ${riskLevel === 'critical' ? '#dc3545' : riskLevel === 'high' ? '#fd7e14' : riskLevel === 'medium' ? '#ffc107' : '#28a745'}; text-transform: uppercase; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .number { font-size: 2em; font-weight: bold; }
        .critical { color: #dc3545; }
        .high { color: #fd7e14; }
        .medium { color: #ffc107; }
        .low { color: #28a745; }
        .recommendations { margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 5px; }
        .recommendations h3 { color: #1976d2; }
        .recommendations ul { padding-left: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Security Test Report</h1>
            <div class="score">${securityScore}%</div>
            <div class="risk-level">Risk Level: ${riskLevel}</div>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Issues</h3>
                <div class="number">${criticalIssues + highIssues + mediumIssues + lowIssues}</div>
            </div>
            <div class="summary-card">
                <h3>Critical</h3>
                <div class="number critical">${criticalIssues}</div>
            </div>
            <div class="summary-card">
                <h3>High</h3>
                <div class="number high">${highIssues}</div>
            </div>
            <div class="summary-card">
                <h3>Medium</h3>
                <div class="number medium">${mediumIssues}</div>
            </div>
            <div class="summary-card">
                <h3>Low</h3>
                <div class="number low">${lowIssues}</div>
            </div>
        </div>
        
        <div class="recommendations">
            <h3>🎯 Key Recommendations</h3>
            <ul>
                ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync('security-report.html', htmlReport);

console.log('Security report generated successfully!');
console.log(`Security Score: ${securityScore}%`);
console.log(`Risk Level: ${riskLevel.toUpperCase()}`);
console.log(`Total Issues: ${criticalIssues + highIssues + mediumIssues + lowIssues}`);
EOF

# Generate the report
cd "$REPORT_DIR"
node generate-report.js

# Step 8: Summary
echo ""
echo "🎯 SECURITY TESTING COMPLETE"
echo "============================="
echo "Report Directory: $REPORT_DIR"
echo "Generated Files:"
echo "  - security-report.json (Detailed JSON report)"
echo "  - security-report.html (Visual HTML report)"
echo "  - security-test.log (Execution log)"
echo "  - Individual test result files"
echo ""

# Display summary if report was generated successfully
if [ -f "$REPORT_DIR/security-report.json" ]; then
    echo "📊 SECURITY SUMMARY:"
    node -e "
        const report = JSON.parse(require('fs').readFileSync('$REPORT_DIR/security-report.json', 'utf8'));
        console.log('Security Score:', report.summary.securityScore + '%');
        console.log('Risk Level:', report.summary.riskLevel.toUpperCase());
        console.log('Total Issues:', report.summary.totalIssues);
        console.log('Critical Issues:', report.summary.criticalIssues);
        console.log('High Issues:', report.summary.highIssues);
        console.log('Medium Issues:', report.summary.mediumIssues);
        console.log('Low Issues:', report.summary.lowIssues);
    "
else
    echo "⚠️ Report generation failed. Check individual test files for details."
fi

echo ""
echo "🔍 To view the detailed report:"
echo "  - Open $REPORT_DIR/security-report.html in your browser"
echo "  - Or review $REPORT_DIR/security-report.json for raw data"
echo ""

log_message "Security testing completed"

# Return to original directory
cd - > /dev/null

echo "For immediate assistance with critical issues, contact: ahmadziyad0807@gmail.com"