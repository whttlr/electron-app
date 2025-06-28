/**
 * Main Navigation Component
 * 
 * Primary navigation component with Ant Design Menu integration.
 * Provides hierarchical navigation with icons, connection state awareness, and responsive design.
 */

import React, { useMemo } from 'react';
import { Menu, Layout } from 'antd';
import type { MenuProps } from 'antd';
import * as Icons from '@ant-design/icons';
import { MainNavigationProps } from './NavigationTypes';
import { RouteDefinition } from '../../services/router/RouterTypes';
import { logger } from '../../services/logger';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

export const MainNavigation: React.FC<MainNavigationProps> = ({
  routes,
  currentRoute,
  isConnected,
  onNavigate,
  collapsed = false,
  onCollapse,
  className,
  style
}) => {
  /**
   * Get icon component from string name
   */
  const getIcon = (iconName?: string): React.ReactNode => {
    if (!iconName) return null;
    
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? React.createElement(IconComponent) : null;
  };

  /**
   * Check if route should be disabled
   */
  const isRouteDisabled = (route: RouteDefinition): boolean => {
    return route.requiresConnection && !isConnected;
  };

  /**
   * Build menu items from route definitions
   */
  const menuItems = useMemo((): MenuItem[] => {
    const buildMenuItems = (routeList: RouteDefinition[], level = 0): MenuItem[] => {
      return routeList
        .filter(route => 
          (!route.parentId || level > 0) && // Top-level routes or children when processing children
          !route.hidden // Exclude hidden routes
        )
        .map(route => {
          const disabled = isRouteDisabled(route);
          const hasChildren = routeList.some(r => r.parentId === route.id && !r.hidden);
          
          const item: MenuItem = {
            key: route.fullPath,
            icon: getIcon(route.icon),
            label: route.title,
            disabled,
            title: disabled ? `Requires machine connection: ${route.title}` : route.title
          };

          // Add children if they exist
          if (hasChildren) {
            const children = routeList.filter(r => r.parentId === route.id && !r.hidden);
            if (children.length > 0) {
              item.children = buildMenuItems(children, level + 1);
            }
          }

          return item;
        });
    };

    return buildMenuItems(routes);
  }, [routes, isConnected]);

  /**
   * Handle menu item click
   */
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const path = key as string;
    
    logger.debug('Navigation menu clicked', { path, currentRoute });
    
    if (path !== currentRoute) {
      onNavigate(path);
    }
  };

  /**
   * Get selected keys for current route
   */
  const selectedKeys = useMemo(() => {
    return [currentRoute];
  }, [currentRoute]);

  /**
   * Get opened keys for current route (for submenu expansion)
   */
  const openKeys = useMemo(() => {
    const keys: string[] = [];
    const currentRouteObj = routes.find(r => r.fullPath === currentRoute);
    
    if (currentRouteObj?.parentId) {
      const parentRoute = routes.find(r => r.id === currentRouteObj.parentId);
      if (parentRoute) {
        keys.push(parentRoute.fullPath);
      }
    }
    
    return keys;
  }, [currentRoute, routes]);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={240}
      className={className}
      style={style}
      theme="light"
      trigger={null} // Custom trigger in header
    >
      <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
        {collapsed ? (
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>CNC</div>
        ) : (
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
              CNC Controls
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: isConnected ? '#52c41a' : '#ff4d4f',
              fontWeight: 'medium'
            }}>
              {isConnected ? '● Connected' : '○ Disconnected'}
            </div>
          </div>
        )}
      </div>
      
      <Menu
        mode="inline"
        items={menuItems}
        selectedKeys={selectedKeys}
        defaultOpenKeys={openKeys}
        onClick={handleMenuClick}
        style={{ 
          border: 'none',
          height: 'calc(100vh - 120px)',
          overflowY: 'auto'
        }}
      />
    </Sider>
  );
};

export default MainNavigation;