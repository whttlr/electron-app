/**
 * Notification System - Legacy Export
 * 
 * This file now re-exports from the modular notification system structure.
 * Use individual imports for better organization.
 */

// Re-export all notification system modules
export * from './index';

// Re-export default for backward compatibility
export { default } from './index';

/**
 * @deprecated Use individual imports instead:
 * 
 * ```typescript
 * import { notificationManager, ToastComponent, ToastContainer } from '@/ui/components/notifications';
 * import { NotificationBell, NotificationProvider, useNotifications } from '@/ui/components/notifications';
 * import { machineNotifications } from '@/ui/components/notifications';
 * ```
 * 
 * Or use specific components:
 * 
 * ```typescript
 * import { NotificationManager } from '@/ui/components/notifications/NotificationManager';
 * import type { NotificationType, ToastOptions } from '@/ui/components/notifications/types';
 * ```
 */
