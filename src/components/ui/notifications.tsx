import * as React from 'react';
import {
  X, CheckCircle, AlertTriangle, Info, AlertCircle,
} from 'lucide-react';
import { Alert, Button } from '@whttlr/ui-core';
import { cn } from './utils';

interface NotificationProps {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
  onDismiss?: (id: string) => void;
  className?: string;
}

export const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({
    id, type, title, message, duration = 5000, onDismiss, className,
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onDismiss?.(id), 300);
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [duration, id, onDismiss]);

    const handleDismiss = () => {
      setIsVisible(false);
      setTimeout(() => onDismiss?.(id), 300);
    };

    const getIcon = () => {
      switch (type) {
        case 'success':
          return <CheckCircle className="w-5 h-5" />;
        case 'warning':
          return <AlertTriangle className="w-5 h-5" />;
        case 'error':
          return <AlertCircle className="w-5 h-5" />;
        default:
          return <Info className="w-5 h-5" />;
      }
    };

    const variantMap = {
      info: 'info',
      success: 'success',
      warning: 'warning',
      error: 'destructive',
    } as const;

    return (
      <div
        ref={ref}
        className={cn(
          'transition-all duration-300 ease-in-out transform-gpu',
          isVisible
            ? 'translate-x-0 opacity-100'
            : 'translate-x-full opacity-0',
          className,
        )}
      >
        <Alert variant={variantMap[type]} className="relative pr-12 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              {title && (
                <h5 className="mb-1 font-medium leading-none tracking-tight">
                  {title}
                </h5>
              )}
              <div className="text-sm">
                {message}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="absolute top-2 right-2 h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </Alert>
      </div>
    );
  },
);
Notification.displayName = 'Notification';

interface NotificationContainerProps {
  notifications: NotificationProps[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

export const NotificationContainer = React.forwardRef<HTMLDivElement, NotificationContainerProps>(
  ({
    notifications, onDismiss, position = 'top-right', className,
  }, ref) => {
    const positionClasses = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'fixed z-50 flex flex-col space-y-3 w-80 max-w-sm',
          positionClasses[position],
          className,
        )}
      >
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            {...notification}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    );
  },
);
NotificationContainer.displayName = 'NotificationContainer';

// Notification hook for easy usage
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState<NotificationProps[]>([]);

  const addNotification = React.useCallback((notification: Omit<NotificationProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { ...notification, id }]);
  }, []);

  const dismissNotification = React.useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = React.useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
  };
};
