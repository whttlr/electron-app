import { ReactNode } from 'react';

export interface SectionHeaderProps {
  title: string;
  level?: 1 | 2 | 3 | 4 | 5;
  helpTitle?: string;
  helpContent?: ReactNode;
  extra?: ReactNode;
}

export interface DebugPanelProps {
  title: string;
  data: Record<string, any>;
  visible: boolean;
  onClose: () => void;
}

export interface LoadingSpinnerProps {
  spinning: boolean;
  tip?: string;
  size?: 'small' | 'default' | 'large';
  children?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}