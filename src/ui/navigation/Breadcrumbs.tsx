/**
 * Breadcrumbs Component
 * 
 * Navigation breadcrumb component providing hierarchical route navigation.
 * Integrates with router service for automatic breadcrumb generation.
 */

import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { BreadcrumbsProps } from './NavigationTypes';
import { logger } from '../../services/logger';

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  breadcrumbs,
  currentRoute,
  onNavigate,
  separator = '/',
  className,
  style
}) => {
  /**
   * Handle breadcrumb click
   */
  const handleBreadcrumbClick = (index: number) => {
    // Calculate the path for the clicked breadcrumb
    // This is a simplified approach - in a real implementation,
    // you'd maintain a mapping of breadcrumb index to route path
    if (index === 0) {
      // Home breadcrumb
      onNavigate('/');
    } else {
      // For now, just log the click - full implementation would
      // require maintaining breadcrumb-to-path mapping
      logger.debug('Breadcrumb clicked', { index, breadcrumb: breadcrumbs[index] });
    }
  };

  /**
   * Build breadcrumb items
   */
  const breadcrumbItems = React.useMemo(() => {
    const items = [];

    // Always include home
    items.push({
      title: (
        <span 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={() => handleBreadcrumbClick(0)}
        >
          <HomeOutlined />
          Home
        </span>
      )
    });

    // Add route breadcrumbs
    breadcrumbs.forEach((crumb, index) => {
      const isLast = index === breadcrumbs.length - 1;
      
      items.push({
        title: isLast ? (
          <span style={{ color: '#666' }}>{crumb}</span>
        ) : (
          <span 
            style={{ cursor: 'pointer' }}
            onClick={() => handleBreadcrumbClick(index + 1)}
          >
            {crumb}
          </span>
        )
      });
    });

    return items;
  }, [breadcrumbs]);

  // Don't render if no breadcrumbs or only home
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className={className} style={style}>
      <Breadcrumb
        separator={separator}
        items={breadcrumbItems}
        style={{
          padding: '12px 0',
          fontSize: '14px'
        }}
      />
    </div>
  );
};

export default Breadcrumbs;