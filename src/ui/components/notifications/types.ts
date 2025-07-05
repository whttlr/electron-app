/**
 * Notification System Types
 * Type definitions for the notification system
 */

import { ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'machine' | 'safety' | 'job';

export interface ToastOptions {
  id?: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: ToastAction[];
  icon?: ReactNode;
  onClick?: () => void;
  onClose?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  sound?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ToastAction {
  label: string;
  onClick: () => void;
  type?: 'default' | 'primary' | 'danger';
}

export interface Toast extends Required<Omit<ToastOptions, 'actions'>> {
  id: string;
  actions: ToastAction[];
  timestamp: Date;
  read: boolean;
}

export interface ToastComponentProps {
  toast: Toast;
  onClose: (id: string) => void;
  onRead: (id: string) => void;
}

export interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

export interface NotificationBellProps {
  onClick?: () => void;
  className?: string;
}