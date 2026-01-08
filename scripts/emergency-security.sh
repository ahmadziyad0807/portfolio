#!/bin/bash

# Emergency Security Response Script
# Use this script when a security incident is detected

echo "🚨 EMERGENCY SECURITY RESPONSE ACTIVATED"
echo "========================================"

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
INCIDENT_LOG="security-incident-${TIMESTAMP}.log"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$INCIDENT_LOG"
}

log_message "Emergency security response initiated"
log_message "Incident ID: SEC-${TIMESTAMP}"

# Step 1: Immediate containment
echo "🔒 Step 1: Immediate Containment"
log_message "Starting immediate containment procedures"

# Stop all running services
echo "Stopping development servers..."
pkill -f "npm.*start" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "node.*server" 2>/dev/null || true
log_message "Development servers stopped"

# Step 2: Evidence collection
echo "📊 Step 2: Evidence Collection"
log_message "Collecting system evidence"

# Create evidence directory
EVIDENCE_DIR="security-evidence-${TIMESTAMP}"
mkdir -p "$EVIDENCE_DIR"

# Collect system information
echo "Collecting system information..."
{
    echo "=== System Information ==="
    uname -a
    echo ""
    echo "=== Current Processes ==="
    ps aux
    echo ""
    echo "=== Network Connections ==="
    netstat -tulpn 2>/dev/null || ss -tulpn
    echo ""
    echo "=== Recent Log Entries ==="
    tail -100 /var/log/syslog 2>/dev/null || tail -100 /var/log/messages 2>/dev/null || echo "System logs not accessible"
} > "$EVIDENCE_DIR/system-info.txt"

# Collect application logs
echo "Collecting application logs..."
find . -name "*.log" -type f -exec cp {} "$EVIDENCE_DIR/" \; 2>/dev/null || true

# Collect Git information
echo "Collecting Git information..."
{
    echo "=== Git Status ==="
    git status
    echo ""
    echo "=== Recent Commits ==="
    git log --oneline -10
    echo ""
    echo "=== Current Branch ==="
    git branch --show-current
} > "$EVIDENCE_DIR/git-info.txt" 2>/dev/null || true

log_message "Evidence collected in $EVIDENCE_DIR"

# Step 3: Security assessment
echo "🔍 Step 3: Security Assessment"
log_message "Running security assessment"

# Check for suspicious files
echo "Scanning for suspicious files..."
find . -name "*.php" -o -name "*.jsp" -o -name "*.asp" | grep -v node_modules > "$EVIDENCE_DIR/suspicious-files.txt" 2>/dev/null || true

# Check for recent file modifications
echo "Checking recent file modifications..."
find . -type f -mtime -1 | grep -v node_modules | head -20 > "$EVIDENCE_DIR/recent-modifications.txt" 2>/dev/null || true

# Run security audit
echo "Running npm security audit..."
npm audit --json > "$EVIDENCE_DIR/npm-audit.json" 2>/dev/null || true

# Check for environment variables exposure
echo "Checking for exposed secrets..."
grep -r -i "password\|secret\|key\|token" --include="*.js" --include="*.ts" --include="*.json" --exclude-dir=node_modules . > "$EVIDENCE_DIR/potential-secrets.txt" 2>/dev/null || true

log_message "Security assessment completed"

# Step 4: Immediate remediation
echo "🛠️ Step 4: Immediate Remediation"
log_message "Starting immediate remediation"

# Backup current state
echo "Creating backup of current state..."
tar -czf "backup-${TIMESTAMP}.tar.gz" --exclude=node_modules --exclude=.git . 2>/dev/null || true
log_message "Backup created: backup-${TIMESTAMP}.tar.gz"

# Reset to last known good state (if needed)
read -p "Do you want to reset to the last known good commit? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Resetting to HEAD~1..."
    git reset --hard HEAD~1
    log_message "Reset to previous commit"
fi

# Update dependencies
echo "Updating dependencies..."
npm audit fix --force 2>/dev/null || true
log_message "Dependencies updated"

# Step 5: Communication
echo "📞 Step 5: Communication"
log_message "Preparing incident communication"

# Generate incident report
cat > "incident-report-${TIMESTAMP}.md" << EOF
# Security Incident Report

**Incident ID**: SEC-${TIMESTAMP}
**Date/Time**: $(date)
**Severity**: HIGH
**Status**: INVESTIGATING

## Summary
Security incident detected and emergency response activated.

## Timeline
- $(date): Incident detected
- $(date): Emergency response initiated
- $(date): Containment measures applied
- $(date): Evidence collection completed

## Actions Taken
- [x] Services stopped
- [x] Evidence collected
- [x] Security assessment performed
- [x] Immediate remediation applied
- [ ] Root cause analysis
- [ ] Long-term remediation plan

## Evidence Location
- Evidence directory: $EVIDENCE_DIR
- System backup: backup-${TIMESTAMP}.tar.gz
- Incident log: $INCIDENT_LOG

## Next Steps
1. Conduct thorough root cause analysis
2. Implement additional security measures
3. Update security procedures
4. Schedule security review meeting

## Contacts
- Security Lead: ahmadziyad0807@gmail.com
- Incident Response Team: [To be defined]

---
*This report was generated automatically by the emergency security response script.*
EOF

log_message "Incident report generated: incident-report-${TIMESTAMP}.md"

# Step 6: Recovery preparation
echo "🔄 Step 6: Recovery Preparation"
log_message "Preparing for recovery"

# Create recovery checklist
cat > "recovery-checklist-${TIMESTAMP}.md" << EOF
# Recovery Checklist

## Pre-Recovery
- [ ] Root cause identified and documented
- [ ] Security patches applied
- [ ] Code review completed
- [ ] Security testing performed

## Recovery Steps
- [ ] Restore services in staging environment
- [ ] Perform security validation
- [ ] Monitor for 24 hours
- [ ] Restore production services
- [ ] Enable monitoring and alerting

## Post-Recovery
- [ ] Conduct post-incident review
- [ ] Update security procedures
- [ ] Implement additional monitoring
- [ ] Schedule follow-up security audit

## Validation Tests
- [ ] Authentication systems working
- [ ] Authorization controls in place
- [ ] Input validation functioning
- [ ] Security headers configured
- [ ] Logging and monitoring active
EOF

log_message "Recovery checklist created: recovery-checklist-${TIMESTAMP}.md"

# Final summary
echo ""
echo "🎯 EMERGENCY RESPONSE SUMMARY"
echo "============================="
echo "Incident ID: SEC-${TIMESTAMP}"
echo "Evidence Directory: $EVIDENCE_DIR"
echo "Incident Log: $INCIDENT_LOG"
echo "Incident Report: incident-report-${TIMESTAMP}.md"
echo "Recovery Checklist: recovery-checklist-${TIMESTAMP}.md"
echo "System Backup: backup-${TIMESTAMP}.tar.gz"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Review all evidence files"
echo "2. Identify root cause"
echo "3. Implement security fixes"
echo "4. Follow recovery checklist"
echo "5. Contact security team if needed"
echo ""

log_message "Emergency response completed"
log_message "Manual intervention required for next steps"

echo "📋 All files have been created in the current directory."
echo "🔍 Please review the incident report and evidence before proceeding."
echo ""
echo "For immediate assistance, contact: ahmadziyad0807@gmail.com"