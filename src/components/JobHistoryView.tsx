import React, { useState } from 'react'
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Tooltip,
  Progress,
  Statistic,
  Row,
  Col,
  Select,
  Input,
  Modal,
  Typography,
  Alert,
  Badge,
  Divider
} from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  HistoryOutlined,
  FileTextOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useJobTracking } from '../services/job-tracking/useJobTracking'
import type { ExtendedCncJob } from '../services/job-tracking'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { Search } = Input
const { Text, Title } = Typography

interface JobDetailsModalProps {
  job: ExtendedCncJob | null
  visible: boolean
  onClose: () => void
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, visible, onClose }) => {
  if (!job) return null

  const positionLogSample = job.position_log?.slice(-10) || []

  return (
    <Modal
      title={`Job Details: ${job.job_name}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
      width={800}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Statistic title="Status" value={job.status} />
        </Col>
        <Col span={12}>
          <Statistic 
            title="Duration" 
            value={job.duration ? `${Math.floor(job.duration / 60)}m ${job.duration % 60}s` : 'N/A'} 
          />
        </Col>
        <Col span={12}>
          <Statistic title="Progress" value={job.progress || 0} suffix="%" />
        </Col>
        <Col span={12}>
          <Statistic title="G-code File" value={job.gcode_file || 'N/A'} />
        </Col>
      </Row>

      <Divider>Timeline</Divider>
      <Row gutter={[16, 8]}>
        <Col span={12}>
          <Text strong>Created:</Text> {job.created_at ? new Date(job.created_at).toLocaleString() : 'N/A'}
        </Col>
        <Col span={12}>
          <Text strong>Started:</Text> {job.start_time ? new Date(job.start_time).toLocaleString() : 'N/A'}
        </Col>
        <Col span={12}>
          <Text strong>Ended:</Text> {job.end_time ? new Date(job.end_time).toLocaleString() : 'N/A'}
        </Col>
      </Row>

      {positionLogSample.length > 0 && (
        <>
          <Divider>Recent Position Log (Last 10 entries)</Divider>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {positionLogSample.map((entry, index) => (
              <div key={index} style={{ marginBottom: 4, fontSize: '12px' }}>
                <Text code>
                  {new Date(entry.timestamp).toLocaleTimeString()} - 
                  X:{entry.x} Y:{entry.y} Z:{entry.z}
                </Text>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  )
}

export const JobHistoryView: React.FC = () => {
  const {
    currentJob,
    jobHistory,
    isLoading,
    error,
    statistics,
    pauseJob,
    resumeJob,
    completeJob,
    refreshHistory,
    refreshStatistics
  } = useJobTracking()

  const [selectedJob, setSelectedJob] = useState<ExtendedCncJob | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchText, setSearchText] = useState('')

  // Filter jobs based on status and search
  const filteredJobs = jobHistory.filter(job => {
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    const matchesSearch = job.job_name.toLowerCase().includes(searchText.toLowerCase()) ||
                         (job.gcode_file && job.gcode_file.toLowerCase().includes(searchText.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <PlayCircleOutlined style={{ color: '#52c41a' }} />
      case 'paused': return <PauseCircleOutlined style={{ color: '#faad14' }} />
      case 'completed': return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'failed': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      case 'cancelled': return <StopOutlined style={{ color: '#8c8c8c' }} />
      default: return <ClockCircleOutlined style={{ color: '#1890ff' }} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'processing'
      case 'paused': return 'warning'
      case 'completed': return 'success'
      case 'failed': return 'error'
      case 'cancelled': return 'default'
      default: return 'default'
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const handleJobAction = async (action: 'pause' | 'resume' | 'complete' | 'cancel') => {
    try {
      switch (action) {
        case 'pause':
          await pauseJob()
          break
        case 'resume':
          await resumeJob()
          break
        case 'complete':
          await completeJob('completed')
          break
        case 'cancel':
          await completeJob('cancelled')
          break
      }
    } catch (error) {
      console.error(`Failed to ${action} job:`, error)
    }
  }

  const columns: ColumnsType<ExtendedCncJob> = [
    {
      title: 'Job Name',
      dataIndex: 'job_name',
      key: 'job_name',
      render: (text, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => setSelectedJob(record)}
            style={{ padding: 0 }}
          >
            {text}
          </Button>
          {record.gcode_file && (
            <Tooltip title={`G-code: ${record.gcode_file}`}>
              <FileTextOutlined style={{ color: '#8c8c8c' }} />
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Running', value: 'running' },
        { text: 'Paused', value: 'paused' },
        { text: 'Completed', value: 'completed' },
        { text: 'Failed', value: 'failed' },
        { text: 'Cancelled', value: 'cancelled' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress 
          percent={progress || 0} 
          size="small" 
          status={progress === 100 ? 'success' : 'active'}
        />
      )
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => formatDuration(duration)
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          size="small"
          onClick={() => setSelectedJob(record)}
          icon={<SearchOutlined />}
        >
          Details
        </Button>
      )
    }
  ]

  return (
    <div>
      {/* Current Job Status */}
      {currentJob && (
        <Card 
          title={
            <Space>
              <PlayCircleOutlined />
              Current Job
            </Space>
          }
          style={{ marginBottom: 16 }}
          extra={
            <Space>
              {currentJob.status === 'running' && (
                <Button 
                  icon={<PauseCircleOutlined />}
                  onClick={() => handleJobAction('pause')}
                >
                  Pause
                </Button>
              )}
              {currentJob.status === 'paused' && (
                <Button 
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleJobAction('resume')}
                >
                  Resume
                </Button>
              )}
              <Button 
                icon={<CheckCircleOutlined />}
                onClick={() => handleJobAction('complete')}
              >
                Complete
              </Button>
              <Button 
                danger
                icon={<StopOutlined />}
                onClick={() => handleJobAction('cancel')}
              >
                Cancel
              </Button>
            </Space>
          }
        >
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="Job Name" value={currentJob.job_name} />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Status" 
                value={currentJob.status}
                prefix={getStatusIcon(currentJob.status)}
              />
            </Col>
            <Col span={6}>
              <Progress 
                type="circle" 
                percent={currentJob.progress || 0}
                size={80}
                status={currentJob.status === 'failed' ? 'exception' : 'active'}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Duration" 
                value={formatDuration(currentJob.duration)}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Statistics */}
      <Card 
        title={
          <Space>
            <HistoryOutlined />
            Job Statistics
          </Space>
        }
        style={{ marginBottom: 16 }}
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => {
              refreshHistory()
              refreshStatistics()
            }}
            loading={isLoading}
          >
            Refresh
          </Button>
        }
      >
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="Total Jobs" value={statistics.total} />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Completed" 
              value={statistics.completed} 
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Failed" 
              value={statistics.failed} 
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Avg Duration" 
              value={formatDuration(Math.floor(statistics.avgDuration))}
            />
          </Col>
        </Row>
      </Card>

      {/* Job History */}
      <Card 
        title={
          <Space>
            <HistoryOutlined />
            Job History
          </Space>
        }
        extra={
          <Space>
            <Search
              placeholder="Search jobs..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
            >
              <Option value="all">All Status</Option>
              <Option value="running">Running</Option>
              <Option value="paused">Paused</Option>
              <Option value="completed">Completed</Option>
              <Option value="failed">Failed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Space>
        }
      >
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            closable
            style={{ marginBottom: 16 }}
          />
        )}

        <Table<ExtendedCncJob>
          columns={columns}
          dataSource={filteredJobs}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} jobs`
          }}
          locale={{
            emptyText: 'No jobs found. Start a new job to see it here.'
          }}
        />
      </Card>

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJob}
        visible={!!selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  )
}

export default JobHistoryView