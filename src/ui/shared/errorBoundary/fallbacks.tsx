/**
 * Error Fallback Components
 * Reusable error fallback components for different scenarios
 */

import React from 'react';
import { Button, Alert } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import type { ErrorFallbackProps } from './types';

export const MinimalErrorFallback: React.FC<ErrorFallbackProps> = ({ error, reset }) => (
  <div style={{
    padding: '20px',
    textAlign: 'center',
    background: '#fff2f0',
    border: '1px solid #ffccc7',
    borderRadius: '4px',
  }}>
    <WarningOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
    <h3 style={{ margin: '16px 0 8px' }}>Something went wrong</h3>
    <p style={{ margin: '0 0 16px', color: '#666' }}>{error.message}</p>
    <Button type="primary" size="small" onClick={reset}>
      Try Again
    </Button>
  </div>
);

export const InlineErrorFallback: React.FC<ErrorFallbackProps> = ({ error, reset }) => (
  <Alert
    message="Error"
    description={error.message}
    type="error"
    showIcon
    action={
      <Button size="small" danger onClick={reset}>
        Retry
      </Button>
    }
  />
);