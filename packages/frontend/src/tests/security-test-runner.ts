// Security Test Runner and Reporting System
import { SecurityMonitor } from '../utils/security';

export interface SecurityTestResult {
  testName: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  passed: boolean;
  vulnerabilities: string[];
  recommendations: string[];
  executionTime: number;
  timestamp: string;
}

export interface SecurityTestReport {
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
  };
  results: SecurityTestResult[];
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  generatedAt: string;
  recommendations: string[];
}

export class SecurityTestRunner {
  private results: SecurityTestResult[] = [];
  
  async runTest(
    testName: string,
    category: string,
    severity: SecurityTestResult['severity'],
    testFunction: () => Promise<{ passed: boolean; vulnerabilities: string[]; recommendations: string[] }>
  ): Promise<SecurityTestResult> {
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const executionTime = Date.now() - startTime;
      
      const testResult: SecurityTestResult = {
        testName,
        category,
        severity,
        passed: result.passed,
        vulnerabilities: result.vulnerabilities,
        recommendations: result.recommendations,
        executionTime,
        timestamp: new Date().toISOString()
      };
      
      this.results.push(testResult);
      
      // Log security test event
      SecurityMonitor.logEvent('security_test_completed', {
        testName,
        category,
        severity,
        passed: result.passed,
        vulnerabilitiesFound: result.vulnerabilities.length
      });
      
      return testResult;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const testResult: SecurityTestResult = {
        testName,
        category,
        severity,
        passed: false,
        vulnerabilities: [`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Fix test execution issues and re-run'],
        executionTime,
        timestamp: new Date().toISOString()
      };
      
      this.results.push(testResult);
      return testResult;
    }
  }
  
  generateReport(): SecurityTestReport {
    const summary = {
      totalTests: this.results.length,
      passed: this.results.filter(r => r.passed).length,
      failed: this.results.filter(r => !r.passed).length,
      criticalIssues: this.results.filter(r => !r.passed && r.severity === 'critical').length,
      highIssues: this.results.filter(r => !r.passed && r.severity === 'high').length,
      mediumIssues: this.results.filter(r => !r.passed && r.severity === 'medium').length,
      lowIssues: this.results.filter(r => !r.passed && r.severity === 'low').length
    };
    
    // Calculate overall security score (0-100)
    const totalPossibleScore = this.results.length * 100;
    const actualScore = this.results.reduce((score, result) => {
      if (result.passed) return score + 100;
      
      // Deduct points based on severity
      switch (result.severity) {
        case 'critical': return score + 0;
        case 'high': return score + 25;
        case 'medium': return score + 50;
        case 'low': return score + 75;
        default: return score + 50;
      }
    }, 0);
    
    const overallScore = totalPossibleScore > 0 ? Math.round((actualScore / totalPossibleScore) * 100) : 0;
    
    // Determine risk level
    let riskLevel: SecurityTestReport['riskLevel'] = 'low';
    if (summary.criticalIssues > 0) riskLevel = 'critical';
    else if (summary.highIssues > 0) riskLevel = 'high';
    else if (summary.mediumIssues > 0) riskLevel = 'medium';
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(summary);
    
    return {
      summary,
      results: this.results,
      overallScore,
      riskLevel,
      generatedAt: new Date().toISOString(),
      recommendations
    };
  }
  
  private generateRecommendations(summary: SecurityTestReport['summary']): string[] {
    const recommendations: string[] = [];
    
    if (summary.criticalIssues > 0) {
      recommendations.push('🚨 URGENT: Address all critical security vulnerabilities immediately');
      recommendations.push('Consider taking the application offline until critical issues are resolved');
    }
    
    if (summary.highIssues > 0) {
      recommendations.push('⚠️ HIGH PRIORITY: Resolve high-severity security issues within 24-48 hours');
      recommendations.push('Implement additional monitoring for high-risk areas');
    }
    
    if (summary.mediumIssues > 0) {
      recommendations.push('📋 MEDIUM PRIORITY: Address medium-severity issues within 1-2 weeks');
      recommendations.push('Review and update security policies and procedures');
    }
    
    if (summary.lowIssues > 0) {
      recommendations.push('📝 LOW PRIORITY: Address low-severity issues in next maintenance cycle');
    }
    
    if (summary.failed > summary.totalTests * 0.5) {
      recommendations.push('🔄 Consider comprehensive security architecture review');
      recommendations.push('Implement security training for development team');
    }
    
    if (summary.passed === summary.totalTests) {
      recommendations.push('✅ Excellent security posture! Continue regular security testing');
      recommendations.push('Consider implementing additional advanced security measures');
    }
    
    // Always include general recommendations
    recommendations.push('🔍 Schedule regular penetration testing and security audits');
    recommendations.push('📚 Keep security documentation and incident response plans updated');
    recommendations.push('🎯 Implement continuous security monitoring and alerting');
    
    return recommendations;
  }
  
  exportReport(format: 'json' | 'html' | 'markdown' = 'json'): string {
    const report = this.generateReport();
    
    switch (format) {
      case 'html':
        return this.generateHtmlReport(report);
      case 'markdown':
        return this.generateMarkdownReport(report);
      default:
        return JSON.stringify(report, null, 2);
    }
  }
  
  private generateHtmlReport(report: SecurityTestReport): string {
    const riskColor = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545'
    };
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .score { font-size: 3em; font-weight: bold; color: ${riskColor[report.riskLevel]}; }
        .risk-level { font-size: 1.5em; color: ${riskColor[report.riskLevel]}; text-transform: uppercase; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .number { font-size: 2em; font-weight: bold; }
        .critical { color: #dc3545; }
        .high { color: #fd7e14; }
        .medium { color: #ffc107; }
        .low { color: #28a745; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .test-results { margin-top: 30px; }
        .test-result { margin-bottom: 20px; padding: 15px; border-left: 4px solid; border-radius: 0 5px 5px 0; }
        .test-result.passed { border-color: #28a745; background: #d4edda; }
        .test-result.failed { border-color: #dc3545; background: #f8d7da; }
        .test-result h4 { margin: 0 0 10px 0; }
        .test-result .category { font-size: 0.9em; color: #666; }
        .test-result .severity { font-weight: bold; text-transform: uppercase; }
        .vulnerabilities, .recommendations { margin-top: 10px; }
        .vulnerabilities ul, .recommendations ul { margin: 5px 0; padding-left: 20px; }
        .recommendations-section { margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 5px; }
        .recommendations-section h3 { color: #1976d2; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Security Test Report</h1>
            <div class="score">${report.overallScore}%</div>
            <div class="risk-level">Risk Level: ${report.riskLevel}</div>
            <p>Generated: ${new Date(report.generatedAt).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="number">${report.summary.totalTests}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="number passed">${report.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="number failed">${report.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Critical Issues</h3>
                <div class="number critical">${report.summary.criticalIssues}</div>
            </div>
            <div class="summary-card">
                <h3>High Issues</h3>
                <div class="number high">${report.summary.highIssues}</div>
            </div>
            <div class="summary-card">
                <h3>Medium Issues</h3>
                <div class="number medium">${report.summary.mediumIssues}</div>
            </div>
            <div class="summary-card">
                <h3>Low Issues</h3>
                <div class="number low">${report.summary.lowIssues}</div>
            </div>
        </div>
        
        <div class="recommendations-section">
            <h3>🎯 Key Recommendations</h3>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        
        <div class="test-results">
            <h3>📋 Detailed Test Results</h3>
            ${report.results.map(result => `
                <div class="test-result ${result.passed ? 'passed' : 'failed'}">
                    <h4>${result.testName} ${result.passed ? '✅' : '❌'}</h4>
                    <div class="category">Category: ${result.category}</div>
                    <div class="severity ${result.severity}">Severity: ${result.severity}</div>
                    <div>Execution Time: ${result.executionTime}ms</div>
                    
                    ${result.vulnerabilities.length > 0 ? `
                        <div class="vulnerabilities">
                            <strong>Vulnerabilities Found:</strong>
                            <ul>
                                ${result.vulnerabilities.map(vuln => `<li>${vuln}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${result.recommendations.length > 0 ? `
                        <div class="recommendations">
                            <strong>Recommendations:</strong>
                            <ul>
                                ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }
  
  private generateMarkdownReport(report: SecurityTestReport): string {
    return `# 🛡️ Security Test Report

## Summary

**Overall Security Score:** ${report.overallScore}%  
**Risk Level:** ${report.riskLevel.toUpperCase()}  
**Generated:** ${new Date(report.generatedAt).toLocaleString()}

### Test Results Overview

| Metric | Count |
|--------|-------|
| Total Tests | ${report.summary.totalTests} |
| Passed | ${report.summary.passed} ✅ |
| Failed | ${report.summary.failed} ❌ |
| Critical Issues | ${report.summary.criticalIssues} 🚨 |
| High Issues | ${report.summary.highIssues} ⚠️ |
| Medium Issues | ${report.summary.mediumIssues} 📋 |
| Low Issues | ${report.summary.lowIssues} 📝 |

## 🎯 Key Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## 📋 Detailed Test Results

${report.results.map(result => `
### ${result.testName} ${result.passed ? '✅' : '❌'}

**Category:** ${result.category}  
**Severity:** ${result.severity.toUpperCase()}  
**Execution Time:** ${result.executionTime}ms  
**Status:** ${result.passed ? 'PASSED' : 'FAILED'}

${result.vulnerabilities.length > 0 ? `
**Vulnerabilities Found:**
${result.vulnerabilities.map(vuln => `- ${vuln}`).join('\n')}
` : ''}

${result.recommendations.length > 0 ? `
**Recommendations:**
${result.recommendations.map(rec => `- ${rec}`).join('\n')}
` : ''}

---
`).join('')}

## 📊 Security Metrics

- **Security Score:** ${report.overallScore}/100
- **Pass Rate:** ${Math.round((report.summary.passed / report.summary.totalTests) * 100)}%
- **Critical Risk:** ${report.summary.criticalIssues > 0 ? 'YES' : 'NO'}
- **Overall Risk Level:** ${report.riskLevel.toUpperCase()}

---
*Report generated by Security Test Runner on ${new Date(report.generatedAt).toLocaleString()}*`;
  }
  
  clearResults(): void {
    this.results = [];
  }
  
  getResults(): SecurityTestResult[] {
    return [...this.results];
  }
}

// Example usage and test scenarios
export const runComprehensiveSecurityTests = async (): Promise<SecurityTestReport> => {
  const runner = new SecurityTestRunner();
  
  // XSS Protection Tests
  await runner.runTest(
    'XSS Input Sanitization',
    'Input Validation',
    'high',
    async () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert(1)'
      ];
      
      const vulnerabilities: string[] = [];
      const recommendations: string[] = [];
      
      // Test each malicious input
      maliciousInputs.forEach(input => {
        const sanitized = input.replace(/<[^>]*>/g, ''); // Basic sanitization
        if (sanitized.includes('script') || sanitized.includes('javascript:')) {
          vulnerabilities.push(`Inadequate XSS protection for input: ${input}`);
        }
      });
      
      if (vulnerabilities.length > 0) {
        recommendations.push('Implement comprehensive HTML sanitization');
        recommendations.push('Use Content Security Policy headers');
        recommendations.push('Validate and escape all user inputs');
      }
      
      return {
        passed: vulnerabilities.length === 0,
        vulnerabilities,
        recommendations
      };
    }
  );
  
  // Authentication Security Tests
  await runner.runTest(
    'Password Policy Enforcement',
    'Authentication',
    'medium',
    async () => {
      const weakPasswords = ['123456', 'password', 'qwerty'];
      const vulnerabilities: string[] = [];
      const recommendations: string[] = [];
      
      const isStrongPassword = (password: string): boolean => {
        return password.length >= 8 && 
               /[A-Z]/.test(password) && 
               /[a-z]/.test(password) && 
               /\d/.test(password) && 
               /[!@#$%^&*]/.test(password);
      };
      
      weakPasswords.forEach(password => {
        if (!isStrongPassword(password)) {
          vulnerabilities.push(`Weak password accepted: ${password}`);
        }
      });
      
      if (vulnerabilities.length > 0) {
        recommendations.push('Enforce strong password requirements');
        recommendations.push('Implement password complexity validation');
        recommendations.push('Consider implementing password strength meter');
      }
      
      return {
        passed: vulnerabilities.length === 0,
        vulnerabilities,
        recommendations
      };
    }
  );
  
  // Rate Limiting Tests
  await runner.runTest(
    'Rate Limiting Protection',
    'DoS Prevention',
    'high',
    async () => {
      const vulnerabilities: string[] = [];
      const recommendations: string[] = [];
      
      // Simulate rate limiting test
      const requestCounts = new Map<string, number>();
      const maxRequests = 10;
      const testIP = '192.168.1.100';
      
      // Simulate 20 requests from same IP
      for (let i = 0; i < 20; i++) {
        const currentCount = requestCounts.get(testIP) || 0;
        if (currentCount >= maxRequests) {
          // Should be blocked
          break;
        }
        requestCounts.set(testIP, currentCount + 1);
      }
      
      const finalCount = requestCounts.get(testIP) || 0;
      if (finalCount > maxRequests) {
        vulnerabilities.push('Rate limiting not properly implemented');
        recommendations.push('Implement proper rate limiting middleware');
        recommendations.push('Add IP-based request throttling');
      }
      
      return {
        passed: vulnerabilities.length === 0,
        vulnerabilities,
        recommendations
      };
    }
  );
  
  // HTTPS Security Tests
  await runner.runTest(
    'HTTPS Configuration',
    'Transport Security',
    'critical',
    async () => {
      const vulnerabilities: string[] = [];
      const recommendations: string[] = [];
      
      // Simulate HTTPS configuration check
      const httpsConfig = {
        enforceHttps: true,
        hstsEnabled: true,
        hstsMaxAge: 31536000,
        secureHeaders: true
      };
      
      if (!httpsConfig.enforceHttps) {
        vulnerabilities.push('HTTPS not enforced - HTTP traffic allowed');
      }
      
      if (!httpsConfig.hstsEnabled) {
        vulnerabilities.push('HTTP Strict Transport Security (HSTS) not enabled');
      }
      
      if (httpsConfig.hstsMaxAge < 31536000) {
        vulnerabilities.push('HSTS max-age too short (should be at least 1 year)');
      }
      
      if (!httpsConfig.secureHeaders) {
        vulnerabilities.push('Security headers not properly configured');
      }
      
      if (vulnerabilities.length > 0) {
        recommendations.push('Enable HTTPS enforcement');
        recommendations.push('Configure HSTS with appropriate max-age');
        recommendations.push('Implement comprehensive security headers');
      }
      
      return {
        passed: vulnerabilities.length === 0,
        vulnerabilities,
        recommendations
      };
    }
  );
  
  return runner.generateReport();
};

export default SecurityTestRunner;