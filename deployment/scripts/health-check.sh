#!/bin/sh
#
# Health Check Script for CNC Control Application
# Performs comprehensive health checks for containerized deployment
#

set -e

# Configuration
HEALTH_CHECK_URL="http://localhost:8080/health"
TIMEOUT=5
MAX_RETRIES=3
LOG_FILE="/var/log/nginx/health-check.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Check if service is running
check_service() {
    log "Checking if nginx is running..."
    
    if ! pgrep nginx > /dev/null; then
        log "${RED}ERROR: nginx process not found${NC}"
        return 1
    fi
    
    log "${GREEN}OK: nginx process is running${NC}"
    return 0
}

# Check HTTP endpoint
check_http() {
    log "Checking HTTP endpoint: $HEALTH_CHECK_URL"
    
    local retry_count=0
    while [ $retry_count -lt $MAX_RETRIES ]; do
        if curl -f -s --max-time $TIMEOUT "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
            log "${GREEN}OK: HTTP endpoint is responding${NC}"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        log "${YELLOW}WARNING: HTTP check failed (attempt $retry_count/$MAX_RETRIES)${NC}"
        
        if [ $retry_count -lt $MAX_RETRIES ]; then
            sleep 1
        fi
    done
    
    log "${RED}ERROR: HTTP endpoint failed after $MAX_RETRIES attempts${NC}"
    return 1
}

# Check application files
check_files() {
    log "Checking application files..."
    
    local required_files="
        /usr/share/nginx/html/index.html
        /usr/share/nginx/html/manifest.json
        /usr/share/nginx/html/sw.js
    "
    
    for file in $required_files; do
        if [ ! -f "$file" ]; then
            log "${RED}ERROR: Required file missing: $file${NC}"
            return 1
        fi
    done
    
    log "${GREEN}OK: All required files present${NC}"
    return 0
}

# Check disk space
check_disk_space() {
    log "Checking disk space..."
    
    local disk_usage
    disk_usage=$(df /usr/share/nginx/html | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -gt 90 ]; then
        log "${RED}ERROR: Disk usage is ${disk_usage}% (> 90%)${NC}"
        return 1
    elif [ "$disk_usage" -gt 80 ]; then
        log "${YELLOW}WARNING: Disk usage is ${disk_usage}% (> 80%)${NC}"
    else
        log "${GREEN}OK: Disk usage is ${disk_usage}%${NC}"
    fi
    
    return 0
}

# Check memory usage
check_memory() {
    log "Checking memory usage..."
    
    local mem_total mem_available mem_usage_percent
    
    # Read memory info
    if [ -f /proc/meminfo ]; then
        mem_total=$(awk '/MemTotal/ {print $2}' /proc/meminfo)
        mem_available=$(awk '/MemAvailable/ {print $2}' /proc/meminfo)
        
        if [ "$mem_total" -gt 0 ] && [ "$mem_available" -gt 0 ]; then
            mem_usage_percent=$(( (mem_total - mem_available) * 100 / mem_total ))
            
            if [ "$mem_usage_percent" -gt 90 ]; then
                log "${RED}ERROR: Memory usage is ${mem_usage_percent}% (> 90%)${NC}"
                return 1
            elif [ "$mem_usage_percent" -gt 80 ]; then
                log "${YELLOW}WARNING: Memory usage is ${mem_usage_percent}% (> 80%)${NC}"
            else
                log "${GREEN}OK: Memory usage is ${mem_usage_percent}%${NC}"
            fi
        else
            log "${YELLOW}WARNING: Could not calculate memory usage${NC}"
        fi
    else
        log "${YELLOW}WARNING: /proc/meminfo not available${NC}"
    fi
    
    return 0
}

# Check nginx configuration
check_nginx_config() {
    log "Checking nginx configuration..."
    
    if nginx -t > /dev/null 2>&1; then
        log "${GREEN}OK: nginx configuration is valid${NC}"
        return 0
    else
        log "${RED}ERROR: nginx configuration is invalid${NC}"
        return 1
    fi
}

# Check SSL certificates (if HTTPS is enabled)
check_ssl_certificates() {
    local ssl_cert="/etc/nginx/ssl/cert.pem"
    local ssl_key="/etc/nginx/ssl/key.pem"
    
    # Skip SSL check if certificates don't exist
    if [ ! -f "$ssl_cert" ] || [ ! -f "$ssl_key" ]; then
        log "INFO: SSL certificates not found, skipping SSL check"
        return 0
    fi
    
    log "Checking SSL certificates..."
    
    # Check certificate expiration
    local cert_end_date
    cert_end_date=$(openssl x509 -enddate -noout -in "$ssl_cert" | cut -d= -f2)
    local cert_end_epoch
    cert_end_epoch=$(date -d "$cert_end_date" +%s)
    local current_epoch
    current_epoch=$(date +%s)
    local days_until_expiry
    days_until_expiry=$(( (cert_end_epoch - current_epoch) / 86400 ))
    
    if [ "$days_until_expiry" -lt 7 ]; then
        log "${RED}ERROR: SSL certificate expires in $days_until_expiry days${NC}"
        return 1
    elif [ "$days_until_expiry" -lt 30 ]; then
        log "${YELLOW}WARNING: SSL certificate expires in $days_until_expiry days${NC}"
    else
        log "${GREEN}OK: SSL certificate valid for $days_until_expiry days${NC}"
    fi
    
    # Check if certificate and key match
    local cert_hash key_hash
    cert_hash=$(openssl x509 -noout -modulus -in "$ssl_cert" | openssl md5)
    key_hash=$(openssl rsa -noout -modulus -in "$ssl_key" | openssl md5)
    
    if [ "$cert_hash" != "$key_hash" ]; then
        log "${RED}ERROR: SSL certificate and key do not match${NC}"
        return 1
    fi
    
    log "${GREEN}OK: SSL certificate and key match${NC}"
    return 0
}

# Check PWA requirements
check_pwa() {
    log "Checking PWA requirements..."
    
    # Check manifest.json
    local manifest_response
    manifest_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/manifest.json")
    
    if [ "$manifest_response" != "200" ]; then
        log "${RED}ERROR: manifest.json not accessible (HTTP $manifest_response)${NC}"
        return 1
    fi
    
    # Check service worker
    local sw_response
    sw_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/sw.js")
    
    if [ "$sw_response" != "200" ]; then
        log "${RED}ERROR: service worker not accessible (HTTP $sw_response)${NC}"
        return 1
    fi
    
    log "${GREEN}OK: PWA requirements met${NC}"
    return 0
}

# Main health check function
main() {
    log "Starting health check..."
    
    local overall_status=0
    
    # Run all checks
    check_service || overall_status=1
    check_files || overall_status=1
    check_nginx_config || overall_status=1
    check_http || overall_status=1
    check_pwa || overall_status=1
    check_disk_space || overall_status=1
    check_memory || overall_status=1
    check_ssl_certificates || overall_status=1
    
    # Summary
    if [ $overall_status -eq 0 ]; then
        log "${GREEN}Health check PASSED - All systems operational${NC}"
        exit 0
    else
        log "${RED}Health check FAILED - Issues detected${NC}"
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    --service)
        check_service
        ;;
    --http)
        check_http
        ;;
    --files)
        check_files
        ;;
    --disk)
        check_disk_space
        ;;
    --memory)
        check_memory
        ;;
    --nginx)
        check_nginx_config
        ;;
    --ssl)
        check_ssl_certificates
        ;;
    --pwa)
        check_pwa
        ;;
    --all|"")
        main
        ;;
    --help)
        echo "Usage: $0 [option]"
        echo "Options:"
        echo "  --service   Check if nginx service is running"
        echo "  --http      Check HTTP endpoint"
        echo "  --files     Check required application files"
        echo "  --disk      Check disk space"
        echo "  --memory    Check memory usage"
        echo "  --nginx     Check nginx configuration"
        echo "  --ssl       Check SSL certificates"
        echo "  --pwa       Check PWA requirements"
        echo "  --all       Run all checks (default)"
        echo "  --help      Show this help message"
        exit 0
        ;;
    *)
        echo "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac