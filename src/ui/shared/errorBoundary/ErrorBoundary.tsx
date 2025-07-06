/**
 * Error Boundary Component
 * Main error boundary implementation with recovery strategies
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Result, Button, Collapse, Typography, Space, Alert,
} from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ReloadOutlined,
  HomeOutlined,
  BugOutlined,
  QuestionCircleOutlined,
  CopyOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { storeEventBus } from '../../../services/state/storeUtils';
import { ErrorRecovery } from './ErrorRecovery';
import type { ErrorBoundaryProps, ErrorBoundaryInternalState, ErrorReport } from './types';

const { Text, Paragraph } = Typography;

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryInternalState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
      lastError: undefined,
      errorId: '',
      errorDetails: undefined,
      stackTrace: undefined,
      componentStack: undefined,
      browserInfo: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryInternalState> {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
      lastError: new Date(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, maxRetries = 3 } = this.props;

    // Log error details
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);

    // Extract error details
    const errorDetails = this.extractErrorDetails(error);
    const stackTrace = this.parseStackTrace(error.stack || '');
    const { componentStack } = errorInfo;
    const browserInfo = this.getBrowserInfo();

    // Update state with details
    this.setState({
      errorInfo,
      errorDetails,
      stackTrace,
      componentStack,
      browserInfo,
    });

    // Report error
    this.reportError(error, errorInfo);

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Emit error event
    storeEventBus.emit('error:boundary', {
      error,
      errorInfo,
      errorId: this.state.errorId,
      timestamp: new Date(),
    });

    // Auto-retry logic
    if (this.state.retryCount < maxRetries) {
      this.scheduleAutoRetry();
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error boundary when children change
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.reset();
    }
  }

  private extractErrorDetails(error: Error): string {
    const details: string[] = [];

    details.push(`Name: ${error.name}`);
    details.push(`Message: ${error.message}`);

    if ('code' in error) {
      details.push(`Code: ${(error as any).code}`);
    }

    if ('cause' in error) {
      details.push(`Cause: ${(error as any).cause}`);
    }

    return details.join('\n');
  }

  private parseStackTrace(stack: string): string {
    if (!stack) return 'No stack trace available';

    // Clean up stack trace for better readability
    return stack
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => line.trim())
      .join('\n');
  }

  private getBrowserInfo(): string {
    const info: string[] = [];

    info.push(`User Agent: ${navigator.userAgent}`);
    info.push(`Platform: ${navigator.platform}`);
    info.push(`Language: ${navigator.language}`);
    info.push(`Online: ${navigator.onLine}`);
    info.push(`URL: ${window.location.href}`);
    info.push(`Timestamp: ${new Date().toISOString()}`);

    if ('memory' in performance) {
      const mem = (performance as any).memory;
      info.push(`Memory: ${Math.round(mem.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round(mem.jsHeapSizeLimit / 1024 / 1024)}MB`);
    }

    return info.join('\n');
  }

  private reportError(error: Error, errorInfo: ErrorInfo): void {
    const errorReport: ErrorReport = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      metadata: {
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        retryCount: this.state.retryCount,
      },
    };

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry, LogRocket, etc.
      console.log('Error report:', errorReport);
    }

    // Store error locally
    this.storeErrorLocally(errorReport);
  }

  private storeErrorLocally(errorReport: ErrorReport): void {
    try {
      const errors = JSON.parse(localStorage.getItem('error-reports') || '[]');
      errors.push(errorReport);

      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }

      localStorage.setItem('error-reports', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to store error report:', e);
    }
  }

  private scheduleAutoRetry(): void {
    const delay = 2 ** this.state.retryCount * 1000; // Exponential backoff

    console.log(`Scheduling auto-retry in ${delay}ms...`);

    setTimeout(() => {
      this.setState((prevState) => ({
        retryCount: prevState.retryCount + 1,
      }), () => {
        this.reset();
      });
    }, delay);
  }

  private reset = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: '',
      errorDetails: undefined,
      stackTrace: undefined,
      componentStack: undefined,
      browserInfo: undefined,
    });
  };

  private handleRecovery = async (strategy: string): Promise<void> => {
    try {
      await ErrorRecovery.executeStrategy(strategy);

      if (strategy === 'reset-component') {
        this.reset();
      }
    } catch (error) {
      console.error('Recovery strategy failed:', error);
    }
  };

  private copyErrorDetails = (): void => {
    const {
      errorDetails, stackTrace, componentStack, browserInfo,
    } = this.state;

    const fullDetails = [
      '=== Error Details ===',
      errorDetails,
      '',
      '=== Stack Trace ===',
      stackTrace,
      '',
      '=== Component Stack ===',
      componentStack,
      '',
      '=== Browser Info ===',
      browserInfo,
    ].join('\n');

    navigator.clipboard.writeText(fullDetails).then(() => {
      console.log('Error details copied to clipboard');
    });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const {
      fallback, showDetails = true, enableRecovery = true, isolate = false,
    } = this.props;
    const {
      error, errorInfo, retryCount, errorId,
    } = this.state;

    if (fallback && error && errorInfo) {
      return fallback(error, errorInfo, this.reset);
    }

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`error-boundary-container ${isolate ? 'isolated' : 'full-page'}`}
          style={{
            minHeight: isolate ? '400px' : '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: isolate ? 'transparent' : '#f0f2f5',
          }}
        >
          <div style={{ maxWidth: '800px', width: '100%' }}>
            <Result
              status="error"
              title="Something went wrong"
              subTitle={
                <>
                  <Paragraph>
                    We encountered an unexpected error. The application may not work correctly.
                  </Paragraph>
                  {retryCount > 0 && (
                    <Alert
                      message={`Retry attempt ${retryCount} of ${this.props.maxRetries || 3}`}
                      type="warning"
                      showIcon
                      style={{ marginTop: 16 }}
                    />
                  )}
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Error ID: {errorId}
                  </Text>
                </>
              }
              extra={[
                <Button
                  type="primary"
                  key="retry"
                  onClick={this.reset}
                  icon={<ReloadOutlined />}
                >
                  Try Again
                </Button>,
                <Button
                  key="home"
                  onClick={() => this.handleRecovery('navigate-home')}
                  icon={<HomeOutlined />}
                >
                  Go Home
                </Button>,
                <Button
                  key="report"
                  icon={<SendOutlined />}
                  onClick={() => {
                    // TODO: Implement error reporting UI
                    console.log('Report error:', errorId);
                  }}
                >
                  Report Issue
                </Button>,
              ]}
            >
              {showDetails && (
                <Collapse
                  ghost
                  style={{ marginTop: 24 }}
                  items={[
                    {
                      key: 'error-details',
                      label: (
                        <Space>
                          <BugOutlined />
                          Error Details
                        </Space>
                      ),
                      children: (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Alert
                            message={error?.name}
                            description={error?.message}
                            type="error"
                            showIcon
                          />
                          <Button
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={this.copyErrorDetails}
                          >
                            Copy All Details
                          </Button>
                          <Paragraph>
                            <Text strong>Stack Trace:</Text>
                            <pre style={{
                              background: '#f5f5f5',
                              padding: '12px',
                              borderRadius: '4px',
                              overflow: 'auto',
                              maxHeight: '200px',
                              fontSize: '12px',
                            }}>
                              {this.state.stackTrace}
                            </pre>
                          </Paragraph>
                        </Space>
                      ),
                    },
                  ]}
                />
              )}

              {enableRecovery && (
                <Collapse
                  ghost
                  style={{ marginTop: 16 }}
                  items={[
                    {
                      key: 'recovery-options',
                      label: (
                        <Space>
                          <QuestionCircleOutlined />
                          Recovery Options
                        </Space>
                      ),
                      children: (
                        <Space direction="vertical">
                          <Alert
                            message="Try these recovery options if the error persists"
                            type="info"
                            showIcon
                          />
                          <Button.Group>
                            <Button
                              onClick={() => this.handleRecovery('reset-stores')}
                            >
                              Reset Application State
                            </Button>
                            <Button
                              onClick={() => this.handleRecovery('clear-cache')}
                            >
                              Clear Cache & Storage
                            </Button>
                            <Button
                              onClick={() => this.handleRecovery('reload-page')}
                            >
                              Hard Reload
                            </Button>
                          </Button.Group>
                        </Space>
                      ),
                    },
                  ]}
                />
              )}
            </Result>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }
}
