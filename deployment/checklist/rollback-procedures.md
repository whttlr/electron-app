# Rollback Procedures

## Overview

This document outlines the procedures for rolling back the CNC Control application to a previous stable version in case of deployment issues or critical bugs discovered in production.

## When to Rollback

### Immediate Rollback Triggers ⚠️

Execute immediate rollback if any of these conditions occur:

- **Critical Security Vulnerability**: Security breach or vulnerability discovered
- **Complete Application Failure**: Application is completely unavailable for >5 minutes
- **Data Corruption**: Any sign of data corruption or data loss
- **High Error Rate**: Error rate >10% for >5 minutes
- **Severe Performance Degradation**: Response time >5 seconds for >10 minutes
- **Critical Feature Failure**: Core CNC functionality not working

### Consider Rollback Triggers 🟡

Evaluate for rollback if these conditions persist:

- **Moderate Error Rate**: Error rate >5% for >15 minutes
- **Performance Issues**: Response time >2 seconds for >30 minutes
- **Feature Degradation**: Important features not working properly
- **User Complaints**: Significant increase in user-reported issues
- **Memory Leaks**: Uncontrolled memory growth

## Rollback Decision Matrix

| Severity | Duration | Error Rate | Response Time | Action |
|----------|----------|------------|---------------|--------|
| Critical | Any | >10% | >5s | Immediate Rollback |
| High | >5 min | >5% | >2s | Immediate Rollback |
| Medium | >15 min | >2% | >1s | Consider Rollback |
| Low | >30 min | >1% | >500ms | Monitor & Assess |

## Rollback Types

### 1. Automatic Rollback

Triggered by monitoring systems when critical thresholds are exceeded.

```bash
# Automatic rollback via monitoring alert
curl -X POST https://api.cnc-control.com/rollback/trigger \
  -H "Authorization: Bearer $ROLLBACK_TOKEN" \
  -d '{"reason": "high_error_rate", "severity": "critical"}'
```

### 2. Manual Rollback

Executed by operations team when issues are detected.

```bash
# Quick rollback to previous version
./deployment/scripts/rollback.sh

# Rollback to specific version
./deployment/scripts/rollback.sh 15

# List available rollback targets
./deployment/scripts/rollback.sh --list
```

### 3. Emergency Rollback

For critical situations requiring immediate action.

```bash
# Emergency rollback (skips confirmations)
./deployment/scripts/rollback.sh --force --no-monitoring

# Fastest possible rollback
kubectl rollout undo deployment/cnc-control-production -n cnc-control
```

## Rollback Procedures

### Step 1: Assessment and Decision 🔍

**Time Limit: 5 minutes maximum**

1. **Assess Impact**
   - [ ] Check monitoring dashboards
   - [ ] Review error rates and performance metrics
   - [ ] Evaluate user impact
   - [ ] Determine severity level

2. **Gather Information**
   - [ ] Recent deployment details
   - [ ] Current application version
   - [ ] Available rollback targets
   - [ ] Estimated rollback time

3. **Make Decision**
   - [ ] Immediate rollback required?
   - [ ] Can issue be hotfixed quickly?
   - [ ] What rollback target to use?

### Step 2: Pre-Rollback Actions 📋

**Time Limit: 2 minutes**

1. **Notify Stakeholders**
   ```bash
   # Send Slack notification
   curl -X POST -H 'Content-type: application/json' \
     --data '{"text":"🚨 INITIATING PRODUCTION ROLLBACK - Issue: [DESCRIPTION]"}' \
     $SLACK_WEBHOOK_URL
   ```

2. **Document Issue**
   - [ ] Create incident ticket
   - [ ] Record issue description
   - [ ] Note affected systems
   - [ ] Set incident severity

3. **Prepare Environment**
   - [ ] Ensure kubectl access
   - [ ] Verify rollback script permissions
   - [ ] Check backup availability

### Step 3: Execute Rollback 🔄

**Time Limit: 10 minutes**

1. **Initiate Rollback**
   ```bash
   # Standard rollback procedure
   cd /path/to/cnc-control
   ./deployment/scripts/rollback.sh
   
   # Follow prompts and confirm rollback target
   ```

2. **Monitor Progress**
   - [ ] Watch deployment status
   - [ ] Monitor pod startup
   - [ ] Check application health
   - [ ] Verify error rates

3. **Validate Rollback**
   - [ ] Confirm new version deployed
   - [ ] Test critical functionality
   - [ ] Verify performance metrics
   - [ ] Check user access

### Step 4: Post-Rollback Verification ✅

**Time Limit: 15 minutes**

1. **Functional Testing**
   ```bash
   # Run automated smoke tests
   npm run test:smoke:production
   
   # Manual critical path testing
   curl -f https://cnc-control.com/health
   curl -f https://cnc-control.com/api/cnc/status
   ```

2. **Performance Validation**
   - [ ] Response times normal (<500ms)
   - [ ] Error rate acceptable (<1%)
   - [ ] Memory usage stable
   - [ ] CPU usage normal

3. **User Experience Check**
   - [ ] Login functionality working
   - [ ] CNC controls responsive
   - [ ] File operations working
   - [ ] Plugin system functional

### Step 5: Communication and Monitoring 📢

**Ongoing**

1. **Update Stakeholders**
   ```bash
   # Success notification
   curl -X POST -H 'Content-type: application/json' \
     --data '{"text":"✅ ROLLBACK COMPLETED - Application restored to stable version"}' \
     $SLACK_WEBHOOK_URL
   ```

2. **Extended Monitoring**
   - Monitor for 2 hours post-rollback
   - Check for delayed issues
   - Verify user behavior returns to normal
   - Ensure no data integrity issues

3. **Documentation**
   - [ ] Update incident ticket
   - [ ] Document lessons learned
   - [ ] Update rollback procedures if needed
   - [ ] Schedule post-mortem meeting

## Rollback Commands Quick Reference

### Basic Commands

```bash
# List available rollback targets
./deployment/scripts/rollback.sh --list

# Rollback to previous version
./deployment/scripts/rollback.sh

# Rollback to specific revision
./deployment/scripts/rollback.sh 15

# Dry run (see what would happen)
./deployment/scripts/rollback.sh --dry-run

# Force rollback (no confirmations)
./deployment/scripts/rollback.sh --force
```

### Emergency Commands

```bash
# Emergency rollback (fastest)
kubectl rollout undo deployment/cnc-control-production -n cnc-control

# Check rollback status
kubectl rollout status deployment/cnc-control-production -n cnc-control

# Scale down if needed
kubectl scale deployment cnc-control-production --replicas=0 -n cnc-control

# Scale back up
kubectl scale deployment cnc-control-production --replicas=3 -n cnc-control
```

### Monitoring Commands

```bash
# Check pod status
kubectl get pods -n cnc-control -l app=cnc-control-production

# View recent logs
kubectl logs deployment/cnc-control-production -n cnc-control --tail=50

# Check deployment history
kubectl rollout history deployment/cnc-control-production -n cnc-control

# Monitor events
kubectl get events -n cnc-control --sort-by='.lastTimestamp'
```

## Database Rollback Considerations

### When Database Changes Are Involved

If the deployment included database migrations:

1. **Assess Migration Impact**
   - [ ] Were migrations destructive?
   - [ ] Can they be safely reverted?
   - [ ] Is data rollback required?

2. **Database Rollback Options**
   ```bash
   # Option 1: Revert migrations (if safe)
   npm run db:migrate:down
   
   # Option 2: Restore from backup
   pg_restore -d production_db backup_file.sql
   
   # Option 3: Point-in-time recovery
   # (Follow your database-specific procedures)
   ```

3. **Data Integrity Checks**
   - [ ] Verify data consistency
   - [ ] Check foreign key constraints
   - [ ] Validate critical business data

## Rollback Testing

### Pre-Production Testing

Regularly test rollback procedures in staging:

```bash
# Monthly rollback drill
./deployment/scripts/rollback.sh --namespace cnc-control-staging

# Verify staging rollback works
npm run test:e2e:staging
```

### Rollback Simulation

```bash
# Simulate rollback scenarios
./deployment/scripts/rollback.sh --dry-run --namespace cnc-control-staging

# Test with different rollback targets
for revision in {1..5}; do
  ./deployment/scripts/rollback.sh --dry-run $revision
done
```

## Rollback Metrics and SLAs

### Target Metrics

| Metric | Target | Maximum |
|--------|--------|---------|
| Decision Time | <5 minutes | 10 minutes |
| Rollback Execution | <10 minutes | 20 minutes |
| Total Recovery Time | <15 minutes | 30 minutes |
| Success Rate | >95% | >90% |

### Success Criteria

A rollback is considered successful when:

- [ ] Application is fully functional
- [ ] Error rate returns to normal (<1%)
- [ ] Response times are acceptable (<500ms)
- [ ] All critical features working
- [ ] No data loss or corruption
- [ ] User experience restored

## Common Rollback Scenarios

### Scenario 1: New Feature Bug

**Situation**: New feature causing errors

**Action**:
```bash
# Quick rollback to previous version
./deployment/scripts/rollback.sh

# Verify feature is disabled
curl -f https://cnc-control.com/api/features
```

### Scenario 2: Performance Regression

**Situation**: Significant performance degradation

**Action**:
```bash
# Rollback with extended monitoring
./deployment/scripts/rollback.sh

# Monitor performance metrics for 1 hour
# Check memory leaks and CPU usage
```

### Scenario 3: Security Issue

**Situation**: Security vulnerability discovered

**Action**:
```bash
# Emergency rollback
./deployment/scripts/rollback.sh --force

# Immediate security assessment
# Block affected endpoints if needed
```

### Scenario 4: Third-party Integration Failure

**Situation**: External API integration broken

**Action**:
```bash
# Rollback to version with working integration
./deployment/scripts/rollback.sh 12

# Verify integration endpoints
curl -f https://cnc-control.com/api/integrations/health
```

## Preventive Measures

### Deployment Safeguards

- **Gradual Rollout**: Deploy to percentage of users first
- **Feature Flags**: Use feature toggles for new features
- **Health Checks**: Comprehensive health monitoring
- **Automated Testing**: Extensive test coverage
- **Staging Validation**: Full staging environment testing

### Monitoring Improvements

- **Real-time Alerts**: Immediate notification of issues
- **Predictive Analytics**: Early warning systems
- **User Experience Monitoring**: Real user monitoring (RUM)
- **Business Metrics**: Track business impact metrics

## Contact Information

### Emergency Contacts

| Role | Primary | Secondary | Phone | Escalation |
|------|---------|-----------|-------|------------|
| On-Call Engineer | [Name] | [Name] | [Phone] | Immediate |
| Lead Developer | [Name] | [Name] | [Phone] | <15 min |
| DevOps Lead | [Name] | [Name] | [Phone] | <15 min |
| Product Manager | [Name] | [Name] | [Phone] | <30 min |

### Communication Channels

- **Slack**: #production-alerts
- **Email**: ops-team@cnc-control.com
- **Phone**: Emergency hotline
- **Status Page**: https://status.cnc-control.com

## Documentation Links

- [Deployment Checklist](./deployment-checklist.md)
- [Monitoring Dashboard](https://monitoring.cnc-control.com)
- [Incident Response Playbook](../incident-response.md)
- [Architecture Documentation](../../docs/architecture/)

---

**Remember**: When in doubt, prioritize user safety and data integrity. It's better to rollback early and investigate than to let issues persist.

**Last Updated**: [Date]
**Version**: 1.0
**Next Review**: [Date + 3 months]