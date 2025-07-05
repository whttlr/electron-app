#!/bin/bash
#
# Production Rollback Script for CNC Control Application
# Handles automated rollback to previous stable version
#

set -e

# Configuration
NAMESPACE="cnc-control"
DEPLOYMENT_NAME="cnc-control-production"
BACKUP_DIR="/var/backups/cnc-control"
LOG_FILE="/var/log/rollback.log"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "${RED}ERROR: $1${NC}"
    notify_slack "🚨 ROLLBACK FAILED: $1"
    exit 1
}

# Success notification
success_message() {
    log "${GREEN}SUCCESS: $1${NC}"
    notify_slack "✅ ROLLBACK SUCCESS: $1"
}

# Warning message
warning_message() {
    log "${YELLOW}WARNING: $1${NC}"
}

# Info message
info_message() {
    log "${BLUE}INFO: $1${NC}"
}

# Slack notification
notify_slack() {
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$1\"}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || true
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        error_exit "kubectl is not installed or not in PATH"
    fi
    
    # Check if we can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        error_exit "Cannot connect to Kubernetes cluster"
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        error_exit "Namespace $NAMESPACE does not exist"
    fi
    
    # Check if deployment exists
    if ! kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" &> /dev/null; then
        error_exit "Deployment $DEPLOYMENT_NAME does not exist in namespace $NAMESPACE"
    fi
    
    log "${GREEN}Prerequisites check passed${NC}"
}

# Get current deployment info
get_current_info() {
    log "Getting current deployment information..."
    
    CURRENT_IMAGE=$(kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].image}')
    CURRENT_REPLICAS=$(kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')
    CURRENT_REVISION=$(kubectl rollout history deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE" --revision=0 | tail -n 1 | awk '{print $1}')
    
    log "Current image: $CURRENT_IMAGE"
    log "Current replicas: $CURRENT_REPLICAS"
    log "Current revision: $CURRENT_REVISION"
}

# List available rollback targets
list_rollback_targets() {
    log "Available rollback targets:"
    kubectl rollout history deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE"
}

# Validate rollback target
validate_rollback_target() {
    local target_revision=$1
    
    if [ -z "$target_revision" ]; then
        error_exit "No rollback target specified"
    fi
    
    # Check if revision exists
    if ! kubectl rollout history deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE" --revision="$target_revision" &> /dev/null; then
        error_exit "Revision $target_revision does not exist"
    fi
    
    log "Rollback target revision $target_revision validated"
}

# Create pre-rollback backup
create_backup() {
    log "Creating pre-rollback backup..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/pre-rollback-$timestamp.yaml"
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Backup current deployment
    kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" -o yaml > "$backup_file"
    
    # Backup configmaps and secrets
    kubectl get configmap -n "$NAMESPACE" -o yaml > "$BACKUP_DIR/configmaps-$timestamp.yaml"
    kubectl get secret -n "$NAMESPACE" -o yaml > "$BACKUP_DIR/secrets-$timestamp.yaml"
    
    log "Backup created: $backup_file"
    echo "$backup_file" > "$BACKUP_DIR/latest-backup.txt"
}

# Perform health check
health_check() {
    local max_attempts=30
    local attempt=1
    local health_url="https://cnc-control.com/health"
    
    log "Performing health check..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s --max-time 10 "$health_url" > /dev/null 2>&1; then
            log "${GREEN}Health check passed (attempt $attempt)${NC}"
            return 0
        fi
        
        log "Health check failed (attempt $attempt/$max_attempts), retrying in 10 seconds..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    error_exit "Health check failed after $max_attempts attempts"
}

# Check application readiness
check_readiness() {
    local max_wait=300  # 5 minutes
    local elapsed=0
    
    log "Waiting for pods to be ready..."
    
    while [ $elapsed -lt $max_wait ]; do
        local ready_pods=$(kubectl get pods -n "$NAMESPACE" -l app="$DEPLOYMENT_NAME" -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' | grep -o True | wc -l)
        local total_pods=$(kubectl get pods -n "$NAMESPACE" -l app="$DEPLOYMENT_NAME" --no-headers | wc -l)
        
        if [ "$ready_pods" -eq "$total_pods" ] && [ "$total_pods" -gt 0 ]; then
            log "${GREEN}All $total_pods pods are ready${NC}"
            return 0
        fi
        
        log "Waiting for pods: $ready_pods/$total_pods ready"
        sleep 10
        elapsed=$((elapsed + 10))
    done
    
    error_exit "Pods failed to become ready within $max_wait seconds"
}

# Perform rollback
perform_rollback() {
    local target_revision=$1
    
    log "Starting rollback to revision $target_revision..."
    notify_slack "🔄 Starting rollback of CNC Control to revision $target_revision"
    
    # Record rollback start time
    local start_time=$(date +%s)
    
    # Perform the rollback
    if [ "$target_revision" = "previous" ]; then
        kubectl rollout undo deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE"
        log "Rolling back to previous revision..."
    else
        kubectl rollout undo deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE" --to-revision="$target_revision"
        log "Rolling back to revision $target_revision..."
    fi
    
    # Wait for rollback to complete
    log "Waiting for rollback to complete..."
    if ! kubectl rollout status deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE" --timeout=600s; then
        error_exit "Rollback failed to complete within timeout"
    fi
    
    # Calculate rollback duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log "${GREEN}Rollback completed in ${duration} seconds${NC}"
}

# Verify rollback success
verify_rollback() {
    log "Verifying rollback success..."
    
    # Check pod status
    local failed_pods=$(kubectl get pods -n "$NAMESPACE" -l app="$DEPLOYMENT_NAME" --field-selector=status.phase!=Running --no-headers | wc -l)
    if [ "$failed_pods" -gt 0 ]; then
        warning_message "$failed_pods pods are not in Running state"
        kubectl get pods -n "$NAMESPACE" -l app="$DEPLOYMENT_NAME"
    fi
    
    # Check readiness
    check_readiness
    
    # Perform health check
    health_check
    
    # Verify new image
    local new_image=$(kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].image}')
    local new_revision=$(kubectl rollout history deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE" --revision=0 | tail -n 1 | awk '{print $1}')
    
    log "New image: $new_image"
    log "New revision: $new_revision"
    
    if [ "$new_image" != "$CURRENT_IMAGE" ]; then
        success_message "Rollback verified: Image changed from $CURRENT_IMAGE to $new_image"
    else
        error_exit "Rollback verification failed: Image unchanged"
    fi
}

# Run smoke tests
run_smoke_tests() {
    log "Running post-rollback smoke tests..."
    
    # Basic endpoint tests
    local endpoints=(
        "https://cnc-control.com/health"
        "https://cnc-control.com/manifest.json"
        "https://cnc-control.com/"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f -s --max-time 30 "$endpoint" > /dev/null; then
            log "${GREEN}✓ $endpoint${NC}"
        else
            warning_message "✗ $endpoint failed"
        fi
    done
    
    # Run automated smoke tests if available
    if command -v npm &> /dev/null && [ -f package.json ]; then
        log "Running automated smoke tests..."
        if npm run test:smoke:production 2>/dev/null; then
            log "${GREEN}Automated smoke tests passed${NC}"
        else
            warning_message "Automated smoke tests failed"
        fi
    fi
}

# Post-rollback monitoring
post_rollback_monitoring() {
    log "Setting up post-rollback monitoring..."
    
    local monitor_duration=300  # 5 minutes
    local check_interval=30     # 30 seconds
    local elapsed=0
    
    while [ $elapsed -lt $monitor_duration ]; do
        # Check error rate
        local error_count=$(kubectl logs deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE" --since=30s | grep -i error | wc -l)
        if [ "$error_count" -gt 10 ]; then
            warning_message "High error rate detected: $error_count errors in last 30 seconds"
        fi
        
        # Check memory usage
        local memory_usage=$(kubectl top pods -n "$NAMESPACE" -l app="$DEPLOYMENT_NAME" --no-headers | awk '{sum+=$3} END {print sum}' | sed 's/Mi//')
        if [ "${memory_usage:-0}" -gt 1000 ]; then
            warning_message "High memory usage detected: ${memory_usage}Mi"
        fi
        
        sleep $check_interval
        elapsed=$((elapsed + check_interval))
        log "Monitoring... ${elapsed}/${monitor_duration} seconds"
    done
    
    log "${GREEN}Post-rollback monitoring completed${NC}"
}

# Clean up old rollback artifacts
cleanup() {
    log "Cleaning up old rollback artifacts..."
    
    # Keep only last 10 backups
    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -name "pre-rollback-*.yaml" -type f | sort -r | tail -n +11 | xargs rm -f
        log "Cleaned up old backup files"
    fi
    
    # Clean up old replicasets (keep last 3)
    kubectl delete replicaset -n "$NAMESPACE" -l app="$DEPLOYMENT_NAME" \
        $(kubectl get replicaset -n "$NAMESPACE" -l app="$DEPLOYMENT_NAME" --sort-by=.metadata.creationTimestamp -o name | head -n -3) 2>/dev/null || true
    
    log "Cleanup completed"
}

# Generate rollback report
generate_report() {
    local report_file="/tmp/rollback-report-$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$report_file" << EOF
CNC Control Application - Rollback Report
=========================================

Date: $(date)
Rollback Target: ${1:-previous}
Duration: Started at $(date -d "@$2" '+%Y-%m-%d %H:%M:%S')

Pre-Rollback State:
- Image: $CURRENT_IMAGE
- Revision: $CURRENT_REVISION
- Replicas: $CURRENT_REPLICAS

Post-Rollback State:
$(kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" -o wide)

Current Pod Status:
$(kubectl get pods -n "$NAMESPACE" -l app="$DEPLOYMENT_NAME")

Recent Events:
$(kubectl get events -n "$NAMESPACE" --sort-by='.lastTimestamp' | tail -10)

Health Check Results:
- Application Health: $(curl -f -s https://cnc-control.com/health > /dev/null && echo "HEALTHY" || echo "UNHEALTHY")
- Response Time: $(curl -w "%{time_total}" -o /dev/null -s https://cnc-control.com/)s

EOF

    log "Rollback report generated: $report_file"
    
    # Send report via Slack if webhook is configured
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        notify_slack "📊 Rollback report available: $report_file"
    fi
}

# Display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS] [REVISION]

Rollback CNC Control application to a previous version.

OPTIONS:
    -h, --help              Show this help message
    -l, --list              List available rollback targets
    -n, --namespace         Kubernetes namespace (default: cnc-control)
    -d, --deployment        Deployment name (default: cnc-control-production)
    --dry-run              Show what would be done without executing
    --force                Skip confirmation prompts
    --no-backup            Skip creating pre-rollback backup
    --no-monitoring        Skip post-rollback monitoring

REVISION:
    Specific revision number to rollback to (e.g., 5)
    If not specified, rolls back to previous revision

Examples:
    $0                      # Rollback to previous revision
    $0 5                    # Rollback to revision 5
    $0 --list               # List available revisions
    $0 --dry-run            # Show rollback plan without executing

EOF
}

# Parse command line arguments
ROLLBACK_TARGET=""
DRY_RUN=false
FORCE=false
NO_BACKUP=false
NO_MONITORING=false
LIST_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -l|--list)
            LIST_ONLY=true
            shift
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -d|--deployment)
            DEPLOYMENT_NAME="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --no-backup)
            NO_BACKUP=true
            shift
            ;;
        --no-monitoring)
            NO_MONITORING=true
            shift
            ;;
        -*)
            echo "Unknown option $1"
            usage
            exit 1
            ;;
        *)
            ROLLBACK_TARGET="$1"
            shift
            ;;
    esac
done

# Main execution
main() {
    local start_time=$(date +%s)
    
    log "=== CNC Control Rollback Script Started ==="
    log "Namespace: $NAMESPACE"
    log "Deployment: $DEPLOYMENT_NAME"
    
    # Check prerequisites
    check_prerequisites
    
    # Get current deployment info
    get_current_info
    
    # Handle list-only option
    if [ "$LIST_ONLY" = true ]; then
        list_rollback_targets
        exit 0
    fi
    
    # Set default rollback target
    if [ -z "$ROLLBACK_TARGET" ]; then
        ROLLBACK_TARGET="previous"
    fi
    
    # Validate rollback target (unless it's "previous")
    if [ "$ROLLBACK_TARGET" != "previous" ]; then
        validate_rollback_target "$ROLLBACK_TARGET"
    fi
    
    # Dry run mode
    if [ "$DRY_RUN" = true ]; then
        log "=== DRY RUN MODE ==="
        log "Would rollback from revision $CURRENT_REVISION to $ROLLBACK_TARGET"
        log "Current image: $CURRENT_IMAGE"
        
        if [ "$ROLLBACK_TARGET" != "previous" ]; then
            local target_info=$(kubectl rollout history deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE" --revision="$ROLLBACK_TARGET")
            log "Target revision info: $target_info"
        fi
        
        log "=== DRY RUN COMPLETE ==="
        exit 0
    fi
    
    # Confirmation prompt (unless forced)
    if [ "$FORCE" != true ]; then
        echo -e "${YELLOW}WARNING: You are about to rollback the production deployment!${NC}"
        echo "Current revision: $CURRENT_REVISION"
        echo "Target revision: $ROLLBACK_TARGET"
        echo "Current image: $CURRENT_IMAGE"
        echo ""
        read -p "Are you sure you want to proceed? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log "Rollback cancelled by user"
            exit 0
        fi
    fi
    
    # Create backup (unless skipped)
    if [ "$NO_BACKUP" != true ]; then
        create_backup
    fi
    
    # Perform rollback
    perform_rollback "$ROLLBACK_TARGET"
    
    # Verify rollback
    verify_rollback
    
    # Run smoke tests
    run_smoke_tests
    
    # Post-rollback monitoring (unless skipped)
    if [ "$NO_MONITORING" != true ]; then
        post_rollback_monitoring
    fi
    
    # Generate report
    generate_report "$ROLLBACK_TARGET" "$start_time"
    
    # Cleanup
    cleanup
    
    local end_time=$(date +%s)
    local total_duration=$((end_time - start_time))
    
    success_message "Rollback completed successfully in ${total_duration} seconds"
    log "=== CNC Control Rollback Script Completed ==="
}

# Execute main function
main "$@"