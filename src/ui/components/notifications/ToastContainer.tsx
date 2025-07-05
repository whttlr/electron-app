/**
 * Toast Container Component
 * Container for displaying toast notifications at specific positions
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '../../shared/utils';
import { notificationManager } from './NotificationManager';
import { ToastComponent } from './ToastComponent';
import { Toast, ToastContainerProps } from './types';

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  className,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  useEffect(() => {
    const unsubscribe = notificationManager.subscribe(setToasts);
    return unsubscribe;
  }, []);
  
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };
  
  const filteredToasts = toasts.filter(toast => toast.position === position);
  
  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col space-y-2 pointer-events-none',
        positionClasses[position],
        className
      )}
    >
      <AnimatePresence>
        {filteredToasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastComponent
              toast={toast}
              onClose={notificationManager.hide.bind(notificationManager)}
              onRead={notificationManager.markAsRead.bind(notificationManager)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};