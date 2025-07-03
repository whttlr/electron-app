/**
 * G-Code Runner Component
 * Complete interface for G-code execution, file management, and machine monitoring
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Space,
  Typography,
  Table,
  Upload,
  Progress,
  Statistic,
  Alert,
  Tabs,
  List,
  Tag,
  Tooltip,
  message,
  Modal,
  Dropdown,
  Menu
} from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  UploadOutlined,
  HistoryOutlined,
  MonitorOutlined,
  FileTextOutlined,
  SendOutlined,
  MoreOutlined,
  DeleteOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import {
  gcodeService,
  GCodeCommand,
  GCodeExecution,
  GCodeFile,
  MachineStatus
} from '../services/gcode'

const { Title, Text } = Typography
const { TextArea } = Input
const { TabPane } = Tabs

export const GcodeRunner: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [commandInput, setCommandInput] = useState('')
  const [multilineInput, setMultilineInput] = useState('')
  const [commandHistory, setCommandHistory] = useState<GCodeCommand[]>([])
  const [executionHistory, setExecutionHistory] = useState<GCodeExecution[]>([])
  const [currentExecution, setCurrentExecution] = useState<GCodeExecution | null>(null)
  const [machineStatus, setMachineStatus] = useState<MachineStatus | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<GCodeFile[]>([])
  const [activeTab, setActiveTab] = useState('single')
  
  const historyEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeService()
    return () => {
      gcodeService.cleanup()
    }
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom of command history
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [commandHistory])

  const initializeService = async () => {
    try {
      await gcodeService.initialize()
      
      // Load initial data
      setCommandHistory(gcodeService.getCommandHistory())
      setExecutionHistory(gcodeService.getExecutionHistory())
      setCurrentExecution(gcodeService.getCurrentExecution())
      setMachineStatus(gcodeService.getCurrentMachineStatus())

      // Add listeners
      gcodeService.addStatusListener(handleStatusUpdate)
      gcodeService.addExecutionListener(handleExecutionUpdate)
      
    } catch (error) {
      console.error('Failed to initialize G-code service:', error)
      message.error('Failed to initialize G-code service')
    }
  }

  const handleStatusUpdate = (status: MachineStatus) => {
    setMachineStatus(status)
  }

  const handleExecutionUpdate = (execution: GCodeExecution | null) => {
    setCurrentExecution(execution)
    setExecutionHistory(gcodeService.getExecutionHistory())
  }

  const handleSingleCommand = async () => {
    if (!commandInput.trim()) {
      message.error('Please enter a G-code command')
      return
    }

    setLoading(true)
    try {
      await gcodeService.executeCommand(commandInput.trim())
      setCommandHistory(gcodeService.getCommandHistory())
      setCommandInput('')
      message.success('Command executed')
    } catch (error) {
      console.error('Failed to execute command:', error)
      message.error('Failed to execute command')
    } finally {
      setLoading(false)
    }
  }

  const handleMultipleCommands = async () => {
    if (!multilineInput.trim()) {
      message.error('Please enter G-code commands')
      return
    }

    const commands = multilineInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith(';') && !line.startsWith('('))

    if (commands.length === 0) {
      message.error('No valid G-code commands found')
      return
    }

    setLoading(true)
    try {
      await gcodeService.executeCommands(commands)
      setCommandHistory(gcodeService.getCommandHistory())
      setMultilineInput('')
      message.success(`Executed ${commands.length} commands`)
    } catch (error) {
      console.error('Failed to execute commands:', error)
      message.error('Failed to execute commands')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      const gcodeFile = await gcodeService.uploadFile(file)
      setUploadedFiles(prev => [gcodeFile, ...prev])
      message.success(`File uploaded: ${file.name}`)
      return false // Prevent default upload
    } catch (error) {
      console.error('Failed to upload file:', error)
      message.error('Failed to upload file')
      return false
    }
  }

  const handleExecuteFile = async (file: GCodeFile) => {
    Modal.confirm({
      title: 'Execute G-code File',
      content: `Are you sure you want to execute "${file.name}" (${file.lineCount} lines)?`,
      onOk: async () => {
        setLoading(true)
        try {
          await gcodeService.executeFile(file)
          message.success(`Started executing ${file.name}`)
        } catch (error) {
          console.error('Failed to execute file:', error)
          message.error('Failed to execute file')
        } finally {
          setLoading(false)
        }
      }
    })
  }

  const handleCancelExecution = async () => {
    try {
      await gcodeService.cancelExecution()
      message.success('Execution cancelled')
    } catch (error) {
      console.error('Failed to cancel execution:', error)
      message.error('Failed to cancel execution')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'idle': return '#52c41a'
      case 'run': return '#1890ff'
      case 'alarm': return '#ff4d4f'
      case 'hold': return '#faad14'
      default: return '#d9d9d9'
    }
  }

  const commandColumns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 120,
      render: (timestamp: string) => new Date(timestamp).toLocaleTimeString()
    },
    {
      title: 'Command',
      dataIndex: 'command',
      key: 'command',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colors = {
          pending: 'default',
          executing: 'processing',
          completed: 'success',
          failed: 'error'
        }
        return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>
      }
    },
    {
      title: 'Response',
      dataIndex: 'response',
      key: 'response',
      ellipsis: true,
      render: (response: string, record: GCodeCommand) => {
        if (record.error) {
          return <Text type="danger">{record.error}</Text>
        }
        return response || '-'
      }
    }
  ]

  const executionColumns = [
    {
      title: 'Time',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 120,
      render: (startTime: string) => new Date(startTime).toLocaleTimeString()
    },
    {
      title: 'File/Description',
      key: 'description',
      render: (record: GCodeExecution) => record.fileName || `${record.totalCommands} commands`
    },
    {
      title: 'Progress',
      key: 'progress',
      width: 120,
      render: (record: GCodeExecution) => (
        <Progress
          percent={Math.round((record.completedCommands / record.totalCommands) * 100)}
          size="small"
          status={record.status === 'failed' ? 'exception' : undefined}
        />
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colors = {
          running: 'processing',
          completed: 'success',
          failed: 'error',
          cancelled: 'default'
        }
        return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>
      }
    }
  ]

  const fileMenuItems = (file: GCodeFile) => (
    <Menu>
      <Menu.Item key="execute" icon={<PlayCircleOutlined />} onClick={() => handleExecuteFile(file)}>
        Execute
      </Menu.Item>
      <Menu.Item key="download" icon={<DownloadOutlined />}>
        Download
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
        Delete
      </Menu.Item>
    </Menu>
  )

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>G-Code Runner</Title>
      
      <Row gutter={[16, 16]}>
        {/* Machine Status */}
        <Col span={24}>
          <Card title="Machine Status" size="small">
            {machineStatus ? (
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="State"
                    value={machineStatus.state}
                    valueStyle={{ color: getStatusColor(machineStatus.state) }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Position"
                    value={`X${machineStatus.position.x} Y${machineStatus.position.y} Z${machineStatus.position.z}`}
                    valueStyle={{ fontSize: '14px' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Feed Rate"
                    value={machineStatus.feedRate}
                    suffix="mm/min"
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Spindle"
                    value={machineStatus.spindleSpeed}
                    suffix="RPM"
                  />
                </Col>
              </Row>
            ) : (
              <Alert message="Machine status unavailable" type="warning" />
            )}
          </Card>
        </Col>

        {/* Current Execution */}
        {currentExecution && (
          <Col span={24}>
            <Card title="Current Execution" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <Text strong>{currentExecution.fileName || 'Multiple Commands'}</Text>
                    <Tag color="processing">{currentExecution.status}</Tag>
                  </Space>
                  <Button
                    danger
                    icon={<StopOutlined />}
                    onClick={handleCancelExecution}
                    size="small"
                  >
                    Cancel
                  </Button>
                </div>
                <Progress
                  percent={Math.round((currentExecution.completedCommands / currentExecution.totalCommands) * 100)}
                  status={currentExecution.status === 'failed' ? 'exception' : 'active'}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">
                    {currentExecution.completedCommands} / {currentExecution.totalCommands} completed
                  </Text>
                  <Text type="secondary">
                    {currentExecution.failedCommands} failed
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        )}

        {/* G-Code Input */}
        <Col span={24}>
          <Card title="Execute G-Code" size="small">
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Single Command" key="single">
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    placeholder="Enter G-code command (e.g., G0 X10 Y10)"
                    onPressEnter={handleSingleCommand}
                    disabled={loading}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSingleCommand}
                    loading={loading}
                    disabled={!commandInput.trim()}
                  >
                    Send
                  </Button>
                </Space.Compact>
              </TabPane>
              
              <TabPane tab="Multiple Commands" key="multiple">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <TextArea
                    value={multilineInput}
                    onChange={(e) => setMultilineInput(e.target.value)}
                    placeholder="Enter multiple G-code commands (one per line)"
                    rows={6}
                    disabled={loading}
                  />
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={handleMultipleCommands}
                    loading={loading}
                    disabled={!multilineInput.trim()}
                  >
                    Execute All
                  </Button>
                </Space>
              </TabPane>
              
              <TabPane tab="File Upload" key="file">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Upload
                    accept=".gcode,.nc,.txt"
                    beforeUpload={handleFileUpload}
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />}>Upload G-code File</Button>
                  </Upload>
                  
                  {uploadedFiles.length > 0 && (
                    <List
                      size="small"
                      dataSource={uploadedFiles}
                      renderItem={(file) => (
                        <List.Item
                          actions={[
                            <Dropdown overlay={fileMenuItems(file)} trigger={['click']}>
                              <Button type="text" icon={<MoreOutlined />} />
                            </Dropdown>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<FileTextOutlined />}
                            title={file.name}
                            description={`${file.lineCount} lines • ${(file.size / 1024).toFixed(1)} KB`}
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </Space>
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        {/* History */}
        <Col span={12}>
          <Card title="Command History" size="small">
            <div style={{ height: '400px', overflow: 'auto' }}>
              <Table
                dataSource={commandHistory}
                columns={commandColumns}
                size="small"
                pagination={false}
                rowKey="id"
              />
              <div ref={historyEndRef} />
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Execution History" size="small">
            <div style={{ height: '400px', overflow: 'auto' }}>
              <Table
                dataSource={executionHistory}
                columns={executionColumns}
                size="small"
                pagination={false}
                rowKey="id"
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default GcodeRunner