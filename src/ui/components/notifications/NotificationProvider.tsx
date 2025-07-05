/**
 * Notification Provider
 * React context provider for notification system
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { NotificationManager, notificationManager } from './NotificationManager';
import { ToastContainer } from './ToastContainer';
import { NotificationType, ToastOptions } from './types';

const NotificationContext = createContext<{
  manager: NotificationManager;
  show: (options: ToastOptions) => string;
  hide: (id: string) => void;
  clear: (type?: NotificationType) => void;
} | null>(null);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const contextValue = {
    manager: notificationManager,
    show: notificationManager.show.bind(notificationManager),
    hide: notificationManager.hide.bind(notificationManager),
    clear: notificationManager.clear.bind(notificationManager),
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer position="top-right" />
      <ToastContainer position="bottom-right" />
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};