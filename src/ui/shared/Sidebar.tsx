import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from './utils';
import { Button } from './Button';

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
  onClose?: () => void
  position?: 'left' | 'right'
  width?: 'sm' | 'md' | 'lg' | 'xl'
  overlay?: boolean
  title?: string
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({
    className,
    isOpen = false,
    onClose,
    position = 'left',
    width = 'md',
    overlay = true,
    title,
    children,
    ...props
  }, ref) => {
    const sidebarVariants = {
      closed: {
        x: position === 'left' ? '-100%' : '100%',
        transition: {
          type: 'tween',
          duration: 0.3,
        },
      },
      open: {
        x: 0,
        transition: {
          type: 'tween',
          duration: 0.3,
        },
      },
    };

    const overlayVariants = {
      closed: {
        opacity: 0,
        transition: {
          duration: 0.3,
        },
      },
      open: {
        opacity: 1,
        transition: {
          duration: 0.3,
        },
      },
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            {overlay && (
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={overlayVariants}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
              />
            )}

            {/* Sidebar */}
            <motion.div
              ref={ref}
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              className={cn(
                'fixed top-0 h-full bg-background text-foreground border-r border-border shadow-lg z-50 flex flex-col',
                position === 'left' && 'left-0',
                position === 'right' && 'right-0 border-l border-r-0',
                width === 'sm' && 'w-64',
                width === 'md' && 'w-80',
                width === 'lg' && 'w-96',
                width === 'xl' && 'w-[32rem]',
                className,
              )}
              {...props}
            >
              {/* Header */}
              {(title || onClose) && (
                <div className="flex items-center justify-between p-4 border-b border-border">
                  {title && (
                    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                  )}
                  {onClose && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={onClose}
                      className="hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  },
);
Sidebar.displayName = 'Sidebar';

// CNC-specific sidebar variants
const ToolSidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, width = 'sm', ...props }, ref) => (
      <Sidebar
        ref={ref}
        width={width}
        className={cn(
          'bg-industrial-50 border-industrial-200',
          className,
        )}
        {...props}
      />
  ),
);
ToolSidebar.displayName = 'ToolSidebar';

const SettingsSidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({
    className, width = 'md', position = 'right', ...props
  }, ref) => (
      <Sidebar
        ref={ref}
        width={width}
        position={position}
        className={cn(
          'bg-card',
          className,
        )}
        {...props}
      />
  ),
);
SettingsSidebar.displayName = 'SettingsSidebar';

export { Sidebar, ToolSidebar, SettingsSidebar };
