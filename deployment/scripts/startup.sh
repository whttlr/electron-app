#!/bin/sh
#
# Startup Script for CNC Control Application
# Handles initialization, configuration, and service startup
#

set -e

# Configuration
APP_NAME="CNC Control"
LOG_FILE="/var/log/nginx/startup.log"
PID_FILE="/var/run/nginx/nginx.pid"

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

# Print banner
print_banner() {
    cat << 'EOF'
  ____  _____    ____   ____  ____    ___ __ _  _____  __ ____  __   __   
 /   __)/___  \  / ___ \/   __)/   __) / / \  \) /___  \/  /   __)/  \ /  \  
/   /__   /  /  / /__   |  /__ |  /__ / /   \  _    /  /  /   /__\  _ '  _ '  
\__   _) _/ _/ _\__   _)_\__   _\__   _/_     |_|   _/ _/   \__   _)|_|_)|_|_|
   / /   / / / //  / / / //  / / //  /___                      / / /       
  /_/   /_/_/_//__/_/ /_//__/_/ /__/_____/                    /_/_/        
                                                                           
 CNC Control Application - Production Deployment
EOF
}

# Environment setup
setup_environment() {
    log "Setting up environment..."
    
    # Create necessary directories
    mkdir -p /var/log/nginx
    mkdir -p /var/cache/nginx
    mkdir -p /var/run/nginx
    
    # Set correct permissions
    chown -R cnc:cnc /var/log/nginx /var/cache/nginx /var/run/nginx
    chmod 755 /var/log/nginx /var/cache/nginx /var/run/nginx
    
    # Initialize log file
    touch "$LOG_FILE"
    chown cnc:cnc "$LOG_FILE"
    
    log "${GREEN}Environment setup complete${NC}"
}

# Configuration validation
validate_configuration() {
    log "Validating configuration..."
    
    # Check required environment variables
    local required_vars="VITE_API_URL VITE_WS_URL"
    local missing_vars=""
    
    for var in $required_vars; do
        eval "value=\${$var:-}"
        if [ -z "$value" ]; then
            missing_vars="$missing_vars $var"
        fi
    done
    
    if [ -n "$missing_vars" ]; then
        log "${YELLOW}WARNING: Missing environment variables:$missing_vars${NC}"
        log "Using default configuration"
    fi
    
    # Validate nginx configuration
    if ! nginx -t > /dev/null 2>&1; then
        log "${RED}ERROR: Invalid nginx configuration${NC}"
        nginx -t
        exit 1
    fi
    
    log "${GREEN}Configuration validation complete${NC}"
}

# Application initialization
initialize_application() {
    log "Initializing application..."
    
    # Check if application files exist
    local required_files="
        /usr/share/nginx/html/index.html
        /usr/share/nginx/html/manifest.json
        /usr/share/nginx/html/sw.js
    "
    
    for file in $required_files; do
        if [ ! -f "$file" ]; then
            log "${RED}ERROR: Required file missing: $file${NC}"
            exit 1
        fi
    done
    
    # Set correct file permissions
    chown -R cnc:cnc /usr/share/nginx/html
    find /usr/share/nginx/html -type f -exec chmod 644 {} \;
    find /usr/share/nginx/html -type d -exec chmod 755 {} \;
    
    # Generate runtime configuration if needed
    if [ -n "${VITE_API_URL:-}" ]; then
        log "Injecting runtime configuration..."
        cat > /usr/share/nginx/html/runtime-config.js << EOF
window.RUNTIME_CONFIG = {
    API_URL: '${VITE_API_URL}',
    WS_URL: '${VITE_WS_URL:-}',
    VERSION: '${VITE_APP_VERSION:-latest}',
    BUILD_TIME: '$(date -u +"%Y-%m-%dT%H:%M:%SZ")',
    ENVIRONMENT: '${NODE_ENV:-production}'
};
EOF
        chown cnc:cnc /usr/share/nginx/html/runtime-config.js
        chmod 644 /usr/share/nginx/html/runtime-config.js
    fi
    
    log "${GREEN}Application initialization complete${NC}"
}

# SSL certificate setup
setup_ssl() {
    local ssl_cert_path="/etc/nginx/ssl"
    
    # Check if SSL certificates are provided
    if [ -f "$ssl_cert_path/cert.pem" ] && [ -f "$ssl_cert_path/key.pem" ]; then
        log "Setting up SSL certificates..."
        
        # Validate certificates
        if ! openssl x509 -in "$ssl_cert_path/cert.pem" -noout > /dev/null 2>&1; then
            log "${RED}ERROR: Invalid SSL certificate${NC}"
            exit 1
        fi
        
        if ! openssl rsa -in "$ssl_cert_path/key.pem" -check -noout > /dev/null 2>&1; then
            log "${RED}ERROR: Invalid SSL private key${NC}"
            exit 1
        fi
        
        # Check certificate expiration
        local cert_end_date
        cert_end_date=$(openssl x509 -enddate -noout -in "$ssl_cert_path/cert.pem" | cut -d= -f2)
        local cert_end_epoch
        cert_end_epoch=$(date -d "$cert_end_date" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$cert_end_date" +%s)
        local current_epoch
        current_epoch=$(date +%s)
        local days_until_expiry
        days_until_expiry=$(( (cert_end_epoch - current_epoch) / 86400 ))
        
        if [ "$days_until_expiry" -lt 30 ]; then
            log "${YELLOW}WARNING: SSL certificate expires in $days_until_expiry days${NC}"
        fi
        
        # Set correct permissions
        chown -R cnc:cnc "$ssl_cert_path"
        chmod 600 "$ssl_cert_path"/*.pem
        
        log "${GREEN}SSL setup complete${NC}"
    else
        log "No SSL certificates found, running in HTTP mode"
    fi
}

# Health check setup
setup_health_checks() {
    log "Setting up health checks..."
    
    # Make health check script executable
    chmod +x /usr/local/bin/health-check.sh
    
    # Create health check endpoint test
    if [ -f /usr/share/nginx/html/index.html ]; then
        # Create a simple health check page
        cat > /usr/share/nginx/html/health-check.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Health Check</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>CNC Control - Health Check</h1>
    <p>Status: <span id="status">Checking...</span></p>
    <p>Timestamp: <span id="timestamp"></span></p>
    <script>
        document.getElementById('timestamp').textContent = new Date().toISOString();
        document.getElementById('status').textContent = 'Healthy';
        document.getElementById('status').style.color = 'green';
    </script>
</body>
</html>
EOF
        chown cnc:cnc /usr/share/nginx/html/health-check.html
        chmod 644 /usr/share/nginx/html/health-check.html
    fi
    
    log "${GREEN}Health checks setup complete${NC}"
}

# Performance optimization
optimize_performance() {
    log "Applying performance optimizations..."
    
    # Set worker processes based on CPU cores
    local cpu_cores
    cpu_cores=$(nproc 2>/dev/null || echo "1")
    
    # Update nginx configuration if auto worker processes
    if grep -q "worker_processes auto" /etc/nginx/nginx.conf; then
        log "Using auto worker processes (detected $cpu_cores cores)"
    fi
    
    # Set appropriate worker connections
    local max_connections=4096
    if [ "$cpu_cores" -gt 4 ]; then
        max_connections=8192
    fi
    
    log "Optimized for $cpu_cores CPU cores with max $max_connections connections"
    log "${GREEN}Performance optimization complete${NC}"
}

# Signal handlers
handle_term() {
    log "Received SIGTERM, shutting down gracefully..."
    if [ -f "$PID_FILE" ]; then
        local pid
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill -QUIT "$pid"
            # Wait for graceful shutdown
            local timeout=30
            while [ $timeout -gt 0 ] && kill -0 "$pid" 2>/dev/null; do
                sleep 1
                timeout=$((timeout - 1))
            done
            
            if kill -0 "$pid" 2>/dev/null; then
                log "${YELLOW}Graceful shutdown timeout, forcing termination${NC}"
                kill -KILL "$pid"
            fi
        fi
    fi
    log "${GREEN}Shutdown complete${NC}"
    exit 0
}

handle_reload() {
    log "Received SIGHUP, reloading configuration..."
    if [ -f "$PID_FILE" ]; then
        local pid
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill -HUP "$pid"
            log "${GREEN}Configuration reloaded${NC}"
        fi
    fi
}

# Register signal handlers
trap handle_term TERM INT
trap handle_reload HUP

# Start nginx
start_nginx() {
    log "Starting nginx..."
    
    # Remove old PID file if exists
    if [ -f "$PID_FILE" ]; then
        rm -f "$PID_FILE"
    fi
    
    # Start nginx in foreground mode
    exec nginx -g "daemon off;"
}

# Main startup sequence
main() {
    print_banner
    log "Starting $APP_NAME deployment..."
    
    # Startup sequence
    setup_environment
    validate_configuration
    initialize_application
    setup_ssl
    setup_health_checks
    optimize_performance
    
    log "${GREEN}Startup sequence complete${NC}"
    log "${BLUE}$APP_NAME is ready to serve requests${NC}"
    
    # Start the main service
    start_nginx
}

# Handle script arguments
case "${1:-}" in
    --check)
        validate_configuration
        exit 0
        ;;
    --init-only)
        setup_environment
        initialize_application
        exit 0
        ;;
    --test)
        validate_configuration
        nginx -t
        exit 0
        ;;
    --help)
        echo "Usage: $0 [option]"
        echo "Options:"
        echo "  --check      Validate configuration only"
        echo "  --init-only  Initialize application without starting"
        echo "  --test       Test nginx configuration"
        echo "  --help       Show this help message"
        echo ""
        echo "Default: Run full startup sequence"
        exit 0
        ;;
    "")
        main
        ;;
    *)
        echo "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac