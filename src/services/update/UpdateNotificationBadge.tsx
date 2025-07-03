import React from 'react';
import { Badge, Button, Tooltip } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import './UpdateNotificationBadge.css';

interface UpdateNotificationBadgeProps {
  updateAvailable: boolean;
  onUpdateClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const UpdateNotificationBadge: React.FC<UpdateNotificationBadgeProps> = ({
  updateAvailable,
  onUpdateClick,
  className,
  style,
}) => {
  if (!updateAvailable) {
    return null;
  }

  return (
    <div className={`update-notification-badge ${className || ''}`} style={style}>
      <Tooltip title="New update available! Click to view release notes and download.">
        <Badge dot className="update-badge-wrapper">
          <Button
            type="text"
            icon={<UploadOutlined />}
            onClick={onUpdateClick}
            className="update-notification-button"
            size="small"
          >
            Update Available
          </Button>
        </Badge>
      </Tooltip>
    </div>
  );
};