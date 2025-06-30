/**
 * Work Coordinate System Management Component
 */

import React, { useState } from 'react'
import { 
  Modal, 
  Tabs, 
  Card, 
  Button, 
  InputNumber, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Select,
  Popconfirm,
  message,
  Divider
} from 'antd'
import { 
  SettingOutlined, 
  CopyOutlined, 
  DeleteOutlined, 
  HomeOutlined,
  CheckOutlined
} from '@ant-design/icons'
import { useCoordinates, useCoordinateActions, useCoordinateFormatting } from '../../hooks/useCoordinates'
import { useCoordinateManager } from '../../services/coordinates/CoordinateContext'
import { WCSSystem, Position, createPosition } from '../../core/coordinates'

const { Text, Title } = Typography
const { Option } = Select
const { TabPane } = Tabs

interface WCSManagerProps {
  isOpen: boolean
  onClose: () => void
}

const WCSManager: React.FC<WCSManagerProps> = ({ isOpen, onClose }) => {
  const coordinateManager = useCoordinateManager()
  const coordinates = useCoordinates({ 
    coordinateManager: coordinateManager || undefined 
  })
  const actions = useCoordinateActions(coordinateManager || undefined)
  const { formatPosition, parsePosition } = useCoordinateFormatting()

  const [selectedWCS, setSelectedWCS] = useState<WCSSystem>(coordinates.activeWCS)
  const [offsetInputs, setOffsetInputs] = useState({
    x: 0,
    y: 0,
    z: 0
  })

  // Update offset inputs when WCS changes
  React.useEffect(() => {
    if (coordinates.wcsOffsets[selectedWCS]) {
      const offset = coordinates.wcsOffsets[selectedWCS]
      setOffsetInputs({
        x: offset.x,
        y: offset.y,
        z: offset.z
      })
    }
  }, [selectedWCS, coordinates.wcsOffsets])

  const handleSetCurrentAsZero = () => {
    if (coordinates.machine) {
      actions.zeroWCS(selectedWCS)
      message.success(`${selectedWCS} set to current position`)
    }
  }

  const handleCopyFromActive = () => {
    actions.copyWCSOffset(coordinates.activeWCS, selectedWCS)
    message.success(`Copied offset from ${coordinates.activeWCS} to ${selectedWCS}`)
  }

  const handleResetWCS = () => {
    actions.resetWCS(selectedWCS)
    message.success(`${selectedWCS} reset to machine zero`)
  }

  const handleSetActive = () => {
    actions.setActiveWCS(selectedWCS)
    message.success(`${selectedWCS} is now active`)
  }

  const handleOffsetChange = (axis: 'x' | 'y' | 'z', value: number | null) => {
    if (value !== null) {
      setOffsetInputs(prev => ({
        ...prev,
        [axis]: value
      }))
    }
  }

  const handleApplyOffset = () => {
    const offset = createPosition(offsetInputs.x, offsetInputs.y, offsetInputs.z)
    actions.setWCSOffset(selectedWCS, offset)
    message.success(`${selectedWCS} offset applied`)
  }

  const wcsSystemOptions: WCSSystem[] = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']

  const renderCurrentPosition = () => (
    <Card size="small" title="Current Position">
      {coordinates.machine && coordinates.work && (
        <>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Text strong>Machine:</Text>
              <div>{formatPosition(coordinates.machine, { precision: 3, compact: true })}</div>
            </Col>
            <Col span={12}>
              <Text strong>{coordinates.activeWCS}:</Text>
              <div>{formatPosition(coordinates.work, { precision: 3, compact: true })}</div>
            </Col>
          </Row>
        </>
      )}
    </Card>
  )

  const renderWCSOffset = (wcs: WCSSystem) => {
    const offset = coordinates.wcsOffsets[wcs] || { x: 0, y: 0, z: 0 }
    const isActive = wcs === coordinates.activeWCS
    const isSelected = wcs === selectedWCS
    const hasOffset = offset.x !== 0 || offset.y !== 0 || offset.z !== 0

    return (
      <Card 
        key={wcs}
        size="small"
        style={{ 
          marginBottom: 8,
          border: isSelected ? '2px solid #1890ff' : undefined,
          backgroundColor: isActive ? '#f6ffed' : undefined
        }}
        onClick={() => setSelectedWCS(wcs)}
      >
        <Row align="middle" justify="space-between">
          <Col span={4}>
            <Space>
              <Text strong style={{ color: isActive ? '#52c41a' : undefined }}>
                {wcs}
              </Text>
              {isActive && <CheckOutlined style={{ color: '#52c41a' }} />}
            </Space>
          </Col>
          <Col span={12}>
            <Text style={{ fontSize: '12px', color: hasOffset ? undefined : '#999' }}>
              X:{offset.x.toFixed(3)} Y:{offset.y.toFixed(3)} Z:{offset.z.toFixed(3)}
            </Text>
          </Col>
          <Col span={8}>
            <Space>
              {!isActive && (
                <Button 
                  size="small" 
                  type="link"
                  onClick={(e) => {
                    e.stopPropagation()
                    actions.setActiveWCS(wcs)
                  }}
                >
                  Activate
                </Button>
              )}
              <Button 
                size="small" 
                type="text"
                icon={<CopyOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  const offsetText = formatPosition(offset, { precision: 3, compact: true })
                  navigator.clipboard.writeText(offsetText)
                  message.success('Offset copied to clipboard')
                }}
              />
            </Space>
          </Col>
        </Row>
      </Card>
    )
  }

  const renderOffsetEditor = () => (
    <Card size="small" title={`${selectedWCS} Offset Editor`}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Text strong>X:</Text>
          <InputNumber
            value={offsetInputs.x}
            onChange={(value) => handleOffsetChange('x', value)}
            precision={3}
            style={{ width: '100%' }}
            step={0.1}
          />
        </Col>
        <Col span={8}>
          <Text strong>Y:</Text>
          <InputNumber
            value={offsetInputs.y}
            onChange={(value) => handleOffsetChange('y', value)}
            precision={3}
            style={{ width: '100%' }}
            step={0.1}
          />
        </Col>
        <Col span={8}>
          <Text strong>Z:</Text>
          <InputNumber
            value={offsetInputs.z}
            onChange={(value) => handleOffsetChange('z', value)}
            precision={3}
            style={{ width: '100%' }}
            step={0.1}
          />
        </Col>
      </Row>
      
      <Divider />
      
      <Space wrap>
        <Button 
          type="primary"
          onClick={handleApplyOffset}
        >
          Apply Offset
        </Button>
        
        <Button 
          icon={<HomeOutlined />}
          onClick={handleSetCurrentAsZero}
        >
          Set Current as Zero
        </Button>
        
        <Button 
          icon={<CopyOutlined />}
          onClick={handleCopyFromActive}
          disabled={selectedWCS === coordinates.activeWCS}
        >
          Copy from {coordinates.activeWCS}
        </Button>
        
        <Popconfirm
          title="Reset this WCS to machine zero?"
          description="This will set the offset to 0,0,0"
          onConfirm={handleResetWCS}
          okText="Reset"
          cancelText="Cancel"
        >
          <Button 
            icon={<DeleteOutlined />}
            danger
          >
            Reset
          </Button>
        </Popconfirm>
        
        {selectedWCS !== coordinates.activeWCS && (
          <Button 
            type="default"
            icon={<CheckOutlined />}
            onClick={handleSetActive}
          >
            Set as Active
          </Button>
        )}
      </Space>
    </Card>
  )

  const renderWCSOverview = () => (
    <div>
      <Title level={5}>Work Coordinate Systems</Title>
      <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
        Click on a WCS to select it for editing. The active WCS is highlighted in green.
      </Text>
      
      {wcsSystemOptions.map(renderWCSOffset)}
    </div>
  )

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          Work Coordinate Systems
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
      width={800}
    >
      <Tabs defaultActiveKey="overview">
        <TabPane tab="Overview" key="overview">
          <Space direction="vertical" style={{ width: '100%' }}>
            {renderCurrentPosition()}
            {renderWCSOverview()}
          </Space>
        </TabPane>
        
        <TabPane tab="Edit WCS" key="editor">
          <Space direction="vertical" style={{ width: '100%' }}>
            {renderCurrentPosition()}
            
            <Card size="small" title="Select WCS">
              <Select 
                value={selectedWCS} 
                onChange={setSelectedWCS}
                style={{ width: 200 }}
              >
                {wcsSystemOptions.map(wcs => (
                  <Option key={wcs} value={wcs}>
                    {wcs} {wcs === coordinates.activeWCS ? '(Active)' : ''}
                  </Option>
                ))}
              </Select>
            </Card>
            
            {renderOffsetEditor()}
          </Space>
        </TabPane>
      </Tabs>
    </Modal>
  )
}

export default WCSManager