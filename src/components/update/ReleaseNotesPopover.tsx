import React, { useState } from 'react';
import {
  Modal, Button, Typography, Divider, Space, Tag, Progress, Alert,
} from 'antd';
import {
  DownloadOutlined, CalendarOutlined, TagOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { UpdateCheckResult } from '../../services/update/types';
import './ReleaseNotesPopover.css';

const { Title, Text } = Typography;

interface ReleaseNotesPopoverProps {
  visible: boolean;
  releaseData?: UpdateCheckResult;
  downloadProgress?: number;
  isDownloading?: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
}

export const ReleaseNotesPopover: React.FC<ReleaseNotesPopoverProps> = ({
  visible,
  releaseData,
  downloadProgress,
  isDownloading = false,
  onUpdate,
  onDismiss,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await onUpdate();
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderProgressSection = () => {
    if (isDownloading && downloadProgress !== undefined) {
      return (
        <Alert
          message="Downloading Update"
          description={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Progress percent={Math.round(downloadProgress)} status="active" />
              <Text type="secondary">Please wait while the update is being downloaded...</Text>
            </Space>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }
    return null;
  };

  return (
    <Modal
      title={
        <Space>
          <TagOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Update Available
          </Title>
        </Space>
      }
      open={visible}
      onCancel={onDismiss}
      width={600}
      className="release-notes-modal"
      footer={[
        <Button key="dismiss" onClick={onDismiss}>
          Later
        </Button>,
        <Button
          key="update"
          type="primary"
          icon={<DownloadOutlined />}
          loading={isUpdating || isDownloading}
          disabled={!releaseData?.updateAvailable}
          onClick={handleUpdate}
        >
          {(() => {
            if (isUpdating) return 'Preparing Update...';
            if (isDownloading) return 'Downloading...';
            return 'Download & Install';
          })()}
        </Button>,
      ]}
    >
      <div className="release-notes-content">
        {renderProgressSection()}

        {releaseData && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Version Information */}
            <div className="version-info">
              <Space direction="vertical" size="small">
                <div>
                  <Text strong>Current Version: </Text>
                  <Tag>{releaseData.currentVersion}</Tag>
                </div>
                <div>
                  <Text strong>Latest Version: </Text>
                  <Tag color="green">{releaseData.latestVersion}</Tag>
                </div>
                <div>
                  <Space>
                    <CalendarOutlined />
                    <Text type="secondary">Released on {formatDate(releaseData.publishedAt)}</Text>
                  </Space>
                </div>
              </Space>
            </div>

            <Divider />

            {/* Release Notes */}
            <div className="release-notes-section">
              <Title level={5}>What&apos;s New</Title>
              <div className="markdown-content">
                {releaseData.releaseNotes ? (
                  <ReactMarkdown>{releaseData.releaseNotes}</ReactMarkdown>
                ) : (
                  <Text type="secondary">No release notes available.</Text>
                )}
              </div>
            </div>

            {/* Update Information */}
            <Alert
              message="About This Update"
              description={
                <Space direction="vertical" size="small">
                  <Text>
                    This update will be downloaded and installed automatically.
                    The application will restart to apply the changes.
                  </Text>
                  <Text type="secondary">
                    You can continue using the application while the update downloads in the background.
                  </Text>
                </Space>
              }
              type="info"
              showIcon
            />
          </Space>
        )}
      </div>
    </Modal>
  );
};