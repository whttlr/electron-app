/**
 * MobileNavigationBar Component
 * 
 * Adaptive navigation bar optimized for mobile and tablet interfaces.
 * Features bottom navigation for portrait mode and side navigation for landscape.
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { useResponsive, touchTargets } from '../../theme/responsive';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  Play, 
  FileText, 
  MoreHorizontal, 
  AlertTriangle,
  Monitor,
  Menu,
  X
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  urgent?: boolean;
  shortcut?: string;
}

export interface MobileNavigationBarProps {
  /** Whether navigation is collapsed */
  collapsed?: boolean;
  /** Custom navigation items */
  items?: NavigationItem[];
  /** Show machine status indicator */
  showMachineStatus?: boolean;
  /** Machine connection status */
  machineConnected?: boolean;
  /** Emergency mode active */
  emergencyMode?: boolean;
  /** Notification count */
  notificationCount?: number;
  /** Callback when navigation item is selected */
  onItemSelect?: (item: NavigationItem) => void;
  /** Callback when emergency button is pressed */
  onEmergencyStop?: () => void;
}

const defaultNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home size={20} />,
    path: '/',
  },
  {
    id: 'controls',
    label: 'Controls',
    icon: <Play size={20} />,
    path: '/controls',
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: <FileText size={20} />,
    path: '/jobs',
  },
  {
    id: 'monitor',
    label: 'Monitor',
    icon: <Monitor size={20} />,
    path: '/monitor',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings size={20} />,
    path: '/settings',
  },
];

export const MobileNavigationBar: React.FC<MobileNavigationBarProps> = ({
  collapsed = false,
  items = defaultNavigationItems,
  showMachineStatus = true,
  machineConnected = false,
  emergencyMode = false,
  notificationCount = 0,
  onItemSelect,
  onEmergencyStop,
}) => {
  const { orientation, breakpoint, isTouchDevice } = useResponsive();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  // Determine navigation layout based on screen size and orientation
  const isBottomNavigation = orientation === 'portrait' || breakpoint === 'xs' || breakpoint === 'sm';
  const isCompact = breakpoint === 'xs';
  const maxVisibleItems = isCompact ? 3 : 4;

  // Split items into visible and overflow
  const visibleItems = items.slice(0, maxVisibleItems);
  const overflowItems = items.slice(maxVisibleItems);
  const hasOverflow = overflowItems.length > 0;

  // Check notification permissions
  useEffect(() => {
    if ('Notification' in window) {
      setHasNotificationPermission(Notification.permission === 'granted');
    }
  }, []);

  // Handle navigation item click
  const handleItemClick = (item: NavigationItem) => {
    navigate(item.path);
    onItemSelect?.(item);
    setExpandedMenu(false);
  };

  // Handle emergency stop
  const handleEmergencyStop = () => {
    onEmergencyStop?.();
    
    // Vibration feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  // Navigation item component
  const NavigationItem: React.FC<{
    item: NavigationItem;
    isActive: boolean;
    compact?: boolean;
  }> = ({ item, isActive, compact = false }) => (
    <button
      onClick={() => handleItemClick(item)}
      className={cn(
        'relative flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all duration-200',
        'touch-manipulation active:scale-95',
        isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800',
        compact ? 'min-h-12 min-w-12' : 'min-h-16 min-w-16'
      )}
      style={{
        minHeight: touchTargets.recommended,
        minWidth: touchTargets.recommended,
      }}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className={cn('flex-shrink-0', compact && 'scale-90')}>
        {item.icon}
      </span>
      
      {!compact && (
        <span className="text-xs font-medium truncate max-w-16">
          {item.label}
        </span>
      )}
      
      {/* Badge for notifications */}
      {item.badge && item.badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
      
      {/* Urgent indicator */}
      {item.urgent && (
        <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-3 w-3 animate-ping" />
      )}
    </button>
  );

  // Emergency button component
  const EmergencyButton: React.FC = () => (
    <button
      onClick={handleEmergencyStop}
      className={cn(
        'flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all duration-200',
        'bg-red-600 text-white shadow-lg hover:bg-red-700 active:bg-red-800',
        'touch-manipulation active:scale-95',
        'ring-2 ring-red-400/50',
        emergencyMode && 'animate-pulse'
      )}
      style={{
        minHeight: touchTargets.large,
        minWidth: touchTargets.large,
      }}
      aria-label="Emergency Stop"
    >
      <AlertTriangle size={24} />
      <span className="text-xs font-bold">E-STOP</span>
    </button>
  );

  // Machine status indicator
  const MachineStatusIndicator: React.FC = () => (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
      <div 
        className={cn(
          'w-3 h-3 rounded-full',
          machineConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        )}
      />
      <span className="text-xs text-gray-300">
        {machineConnected ? 'Connected' : 'Offline'}
      </span>
    </div>
  );

  // Overflow menu
  const OverflowMenu: React.FC = () => (
    <div className="relative">
      <button
        onClick={() => setExpandedMenu(!expandedMenu)}
        className={cn(
          'flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all duration-200',
          'text-gray-400 hover:text-gray-200 hover:bg-gray-800',
          'touch-manipulation active:scale-95',
          expandedMenu && 'bg-gray-800 text-gray-200'
        )}
        style={{
          minHeight: touchTargets.recommended,
          minWidth: touchTargets.recommended,
        }}
        aria-label="More options"
        aria-expanded={expandedMenu}
      >
        {expandedMenu ? <X size={20} /> : <MoreHorizontal size={20} />}
        {!isCompact && (
          <span className="text-xs font-medium">More</span>
        )}
      </button>

      {/* Dropdown menu */}
      {expandedMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setExpandedMenu(false)}
          />
          
          {/* Menu content */}
          <div className={cn(
            'absolute z-50 mt-2 py-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl',
            'min-w-48',
            isBottomNavigation 
              ? 'bottom-full right-0 mb-2' 
              : 'top-full left-0'
          )}>
            {overflowItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3 text-left',
                  'text-gray-300 hover:text-white hover:bg-gray-700',
                  'transition-colors duration-200',
                  location.pathname === item.path && 'bg-blue-600 text-white'
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
            
            {/* Divider */}
            <div className="my-2 border-t border-gray-700" />
            
            {/* Additional options */}
            <button
              onClick={() => {
                setExpandedMenu(false);
                // Handle notification toggle
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <AlertTriangle size={16} />
              <span className="text-sm">
                {hasNotificationPermission ? 'Notifications On' : 'Enable Notifications'}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Bottom navigation layout (portrait/mobile)
  if (isBottomNavigation) {
    return (
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-gray-900/95 backdrop-blur-sm border-t border-gray-700',
          'px-4 py-2',
          'transform transition-transform duration-300',
          collapsed && 'translate-y-full'
        )}
        role="navigation"
        aria-label="Bottom navigation"
      >
        <div className="flex items-center justify-between max-w-screen-lg mx-auto">
          {/* Emergency button */}
          <EmergencyButton />
          
          {/* Navigation items */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            {visibleItems.map((item) => (
              <NavigationItem
                key={item.id}
                item={item}
                isActive={location.pathname === item.path}
                compact={isCompact}
              />
            ))}
            
            {hasOverflow && <OverflowMenu />}
          </div>
          
          {/* Status indicator */}
          {showMachineStatus && (
            <div className="ml-2">
              <MachineStatusIndicator />
            </div>
          )}
        </div>
        
        {/* Safe area padding for devices with home indicators */}
        <div className="h-safe-area-inset-bottom" />
      </nav>
    );
  }

  // Side navigation layout (landscape/tablet)
  return (
    <nav
      className={cn(
        'fixed left-0 top-0 bottom-0 z-50',
        'bg-gray-900/95 backdrop-blur-sm border-r border-gray-700',
        'flex flex-col py-4',
        'transform transition-transform duration-300',
        collapsed ? '-translate-x-full' : 'translate-x-0',
        isCompact ? 'w-20' : 'w-72'
      )}
      role="navigation"
      aria-label="Side navigation"
    >
      {/* Header */}
      <div className="px-4 mb-6">
        {isCompact ? (
          <div className="flex justify-center">
            <Menu size={24} className="text-gray-400" />
          </div>
        ) : (
          <h1 className="text-lg font-bold text-white">CNC Control</h1>
        )}
      </div>
      
      {/* Emergency button */}
      <div className="px-4 mb-6">
        <EmergencyButton />
      </div>
      
      {/* Navigation items */}
      <div className="flex-1 px-4 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={cn(
              'flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200',
              'touch-manipulation active:scale-95',
              location.pathname === item.path
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800',
              isCompact && 'justify-center'
            )}
            style={{
              minHeight: touchTargets.recommended,
            }}
            aria-label={item.label}
            aria-current={location.pathname === item.path ? 'page' : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!isCompact && (
              <span className="font-medium">{item.label}</span>
            )}
            
            {/* Badge */}
            {item.badge && item.badge > 0 && (
              <span className={cn(
                'bg-red-500 text-white text-xs rounded-full flex items-center justify-center',
                isCompact ? 'absolute top-1 right-1 h-4 w-4' : 'ml-auto h-5 w-5'
              )}>
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Footer */}
      <div className="px-4 mt-6">
        {showMachineStatus && <MachineStatusIndicator />}
        
        {/* App version info */}
        {!isCompact && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            CNC Control v1.0.0
          </div>
        )}
      </div>
    </nav>
  );
};

export default MobileNavigationBar;