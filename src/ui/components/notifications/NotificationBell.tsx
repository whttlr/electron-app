/**
 * Notification Bell Component
 * Bell icon with unread count indicator
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../shared/utils';
import { Button } from '../../adapters/ant-design/Button';
import { BellOutlined } from '@ant-design/icons';
import { notificationManager } from './NotificationManager';
import { NotificationBellProps } from './types';

export const NotificationBell: React.FC<NotificationBellProps> = ({ onClick, className }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const updateCount = () => setUnreadCount(notificationManager.getUnreadCount());
    
    const unsubscribe = notificationManager.subscribe(updateCount);
    updateCount(); // Initial count
    
    return unsubscribe;
  }, []);
  
  return (
    <Button
      type="text"
      icon={<BellOutlined />}
      onClick={onClick}
      className={cn('relative', className)}
    >
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </motion.div>
      )}
    </Button>
  );
};