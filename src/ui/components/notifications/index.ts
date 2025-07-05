/**
 * Notification System Module
 * 
 * Advanced notification and toast system with animations, queuing,
 * persistence, and CNC-specific alert types.
 */

export * from './types';
export { NotificationManager, notificationManager } from './NotificationManager';
export { ToastComponent } from './ToastComponent';
export { ToastContainer } from './ToastContainer';
export { NotificationBell } from './NotificationBell';
export { NotificationProvider, useNotifications } from './NotificationProvider';
export { machineNotifications } from './machineNotifications';

// Default export for backward compatibility
export default {
  notificationManager: require('./NotificationManager').notificationManager,
  ToastComponent: require('./ToastComponent').ToastComponent,
  ToastContainer: require('./ToastContainer').ToastContainer,
  NotificationBell: require('./NotificationBell').NotificationBell,
  NotificationProvider: require('./NotificationProvider').NotificationProvider,
  useNotifications: require('./NotificationProvider').useNotifications,
  machineNotifications: require('./machineNotifications').machineNotifications,
};