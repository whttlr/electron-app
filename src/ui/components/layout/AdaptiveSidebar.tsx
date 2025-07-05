/**
 * Adaptive Sidebar Component
 * Responsive sidebar that becomes a drawer on mobile
 */

import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../shared/utils';
import { Button } from '../../adapters/ant-design/Button';
import { Drawer } from 'antd';
import {
  MenuOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useResponsive } from './useResponsive';

export interface AdaptiveSidebarProps {
  children: ReactNode;
  title?: string;
  width?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  placement?: 'left' | 'right';
  overlay?: boolean;
  className?: string;
  onCollapse?: (collapsed: boolean) => void;
}

export const AdaptiveSidebar: React.FC<AdaptiveSidebarProps> = ({
  children,
  title,
  width = 280,
  collapsible = true,
  defaultCollapsed = false,
  placement = 'left',
  overlay = false,
  className,
  onCollapse,
}) => {
  const { isMobile } = useResponsive();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const handleCollapse = (newCollapsed: boolean) => {
    setCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
  };
  
  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Mobile version uses Drawer
  if (isMobile) {
    return (
      <>
        <Button
          icon={<MenuOutlined />}
          onClick={handleMobileToggle}
          className="fixed top-4 left-4 z-50 md:hidden"
          size="sm"
        />
        
        <Drawer
          title={title}
          placement={placement}
          width={width}
          onClose={() => setMobileOpen(false)}
          open={mobileOpen}
          className={className}
        >
          {children}
        </Drawer>
      </>
    );
  }
  
  // Desktop version
  const sidebarClasses = cn(
    'relative bg-card border-r border-border transition-all duration-300',
    collapsed ? 'w-16' : `w-[${width}px]`,
    overlay && 'absolute top-0 z-30 shadow-lg',
    placement === 'right' && 'border-r-0 border-l',
    className
  );
  
  return (
    <motion.aside
      className={sidebarClasses}
      initial={false}
      animate={{
        width: collapsed ? 64 : width,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <AnimatePresence>
          {!collapsed && title && (
            <motion.h2
              className="text-lg font-semibold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {title}
            </motion.h2>
          )}
        </AnimatePresence>
        
        {collapsible && (
          <Button
            icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
            onClick={() => handleCollapse(!collapsed)}
            size="sm"
            variant="ghost"
          />
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </motion.aside>
  );
};