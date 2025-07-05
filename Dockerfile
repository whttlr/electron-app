# Multi-stage Dockerfile for CNC Control Application
# Optimized for production deployment with security and performance best practices

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set build-time environment variables
ARG NODE_ENV=production
ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_APP_VERSION

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    && npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Audit and prune dependencies
RUN pnpm audit --audit-level high && \
    pnpm prune --production

# Stage 2: Production stage
FROM nginx:1.25-alpine AS production

# Install security updates and required packages
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    curl \
    jq \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S cnc && \
    adduser -S cnc -u 1001 -G cnc

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY deployment/nginx/nginx.conf /etc/nginx/nginx.conf
COPY deployment/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy security headers configuration
COPY deployment/nginx/security-headers.conf /etc/nginx/conf.d/security-headers.conf

# Copy SSL configuration (if certificates are provided)
COPY deployment/nginx/ssl.conf /etc/nginx/conf.d/ssl.conf

# Create necessary directories and set permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run/nginx && \
    chown -R cnc:cnc /var/cache/nginx /var/log/nginx /var/run/nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Copy health check script
COPY deployment/scripts/health-check.sh /usr/local/bin/health-check.sh
RUN chmod +x /usr/local/bin/health-check.sh

# Copy startup script
COPY deployment/scripts/startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh

# Switch to non-root user
USER cnc

# Expose port
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /usr/local/bin/health-check.sh

# Set labels for metadata
LABEL \
    org.label-schema.name="CNC Control Application" \
    org.label-schema.description="Industrial CNC control interface with mobile support" \
    org.label-schema.version="${VITE_APP_VERSION:-latest}" \
    org.label-schema.schema-version="1.0" \
    org.label-schema.build-date="${BUILD_DATE}" \
    org.label-schema.vcs-url="https://github.com/your-org/cnc-control" \
    maintainer="CNC Control Team <team@cnc-control.com>"

# Start the application
CMD ["/usr/local/bin/startup.sh"]

# Development stage for local development
FROM node:18-alpine AS development

# Install development dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    && npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies including dev dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Expose development port
EXPOSE 5173

# Start development server
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]

# Testing stage for CI/CD
FROM node:18-alpine AS testing

# Install test dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    chromium \
    && npm install -g pnpm

WORKDIR /app

# Set Playwright environment
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Run tests
CMD ["pnpm", "run", "test:ci"]