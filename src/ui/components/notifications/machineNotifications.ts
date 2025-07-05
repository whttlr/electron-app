/**
 * CNC-Specific Machine Notifications
 * Pre-configured notifications for common CNC operations
 */

import React from 'react';
import { CheckCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { notificationManager } from './NotificationManager';

/**
 * Machine Status Notifications
 */
export const machineNotifications = {
  connected: () => notificationManager.machine(
    'Machine Connected',
    'Successfully connected to CNC machine',
    { icon: React.createElement(CheckCircleOutlined, { className: 'text-green-500' }) }
  ),
  
  disconnected: () => notificationManager.error(
    'Machine Disconnected',
    'Lost connection to CNC machine. Check cables and network.',
    { persistent: true }
  ),
  
  emergencyStop: () => notificationManager.safety(
    'EMERGENCY STOP ACTIVATED',
    'All machine operations have been halted immediately.',
    { 
      icon: React.createElement(SafetyCertificateOutlined, { className: 'text-red-600' }),
      actions: [{ label: 'Reset', onClick: () => {}, type: 'danger' }]
    }
  ),
  
  jobCompleted: (jobName: string, duration: string) => notificationManager.success(
    'Job Completed',
    `${jobName} finished successfully in ${duration}`,
    { type: 'job' }
  ),
  
  jobFailed: (jobName: string, error: string) => notificationManager.error(
    'Job Failed',
    `${jobName} failed: ${error}`,
    { 
      type: 'job',
      actions: [
        { label: 'Retry', onClick: () => {}, type: 'primary' },
        { label: 'View Logs', onClick: () => {} }
      ]
    }
  ),
  
  temperatureWarning: (temp: number) => notificationManager.warning(
    'High Temperature',
    `Machine temperature is ${temp}°C. Consider pausing operation.`,
    { type: 'machine' }
  ),
  
  lowBattery: (percentage: number) => notificationManager.warning(
    'Low Battery',
    `Backup battery at ${percentage}%. Connect to power source.`
  ),
  
  maintenanceReminder: (hours: number) => notificationManager.info(
    'Maintenance Due',
    `Machine has run ${hours} hours since last maintenance.`,
    { 
      actions: [
        { label: 'Schedule', onClick: () => {}, type: 'primary' },
        { label: 'Remind Later', onClick: () => {} }
      ]
    }
  ),
};