/**
 * Enhanced position display with coordinate system integration
 */

import React, { useState } from 'react'
import { Card, Row, Col, Typography, Switch, Select, Space, Tooltip, Button } from 'antd'
import { SettingOutlined, CopyOutlined } from '@ant-design/icons'
import { useCoordinates, useCoordinateFormatting, DisplayMode } from '../../hooks/useCoordinates'
import { useCoordinateManager } from '../../services/coordinates/CoordinateContext'
import { WCSSystem } from '../../core/coordinates'
import { AXIS_COLORS } from '../theme/constants'

const { Text, Title } = Typography
const { Option } = Select

interface CoordinateDisplayProps {
  showTitle?: boolean
  showControls?: boolean
  showWCSSelector?: boolean
  compact?: boolean
  precision?: number
  highlightedAxis?: 'x' | 'y' | 'z' | null
  unit?: 'mm' | 'inch'
}

const CoordinateDisplay: React.FC<CoordinateDisplayProps> = ({
  showTitle = true,
  showControls = true,
  showWCSSelector = true,
  compact = false,
  precision = 3,
  highlightedAxis = null,
  unit = 'mm'
}) => {
  const coordinateManager = useCoordinateManager()
  const coordinates = useCoordinates({ 
    coordinateManager: coordinateManager || undefined,
    enableAutoSync: true 
  })
  const { formatPosition, formatDualPosition } = useCoordinateFormatting()
  
  const [showSettings, setShowSettings] = useState(false)

  if (!coordinates.isInitialized || !coordinates.machine || !coordinates.work) {
    return (
      <Card size="small" title={showTitle ? "Position" : undefined}>
        <Text type="secondary">No position data available</Text>
      </Card>
    )
  }

  const getAxisStyle = (axis: 'x' | 'y' | 'z') => ({
    color: highlightedAxis === axis ? AXIS_COLORS[axis] : undefined,
    fontWeight: highlightedAxis === axis ? 'bold' : 'normal',
    fontSize: compact ? '12px' : '14px',
    transition: 'all 0.2s ease'
  })

  const formatValue = (value: number): string => {
    return `${value.toFixed(precision)} ${unit}`
  }

  const handleCopyPosition = () => {
    const positionText = coordinates.displayMode === 'both' && typeof coordinates.display === 'object' && 'machine' in coordinates.display
      ? formatDualPosition(coordinates.display.machine, coordinates.display.work, coordinates.activeWCS, { precision, compact })
      : formatPosition(coordinates.machine, { precision, unit, compact })
    
    navigator.clipboard.writeText(positionText.combined || positionText)
  }

  const renderPositionRow = (position: any, label?: string) => (
    <Row gutter={[16, 8]} align="middle" style={{ marginBottom: label ? 8 : 0 }}>
      {label && (
        <Col span={24}>
          <Text type="secondary" style={{ fontSize: '12px', fontWeight: 'bold' }}>
            {label}
          </Text>
        </Col>
      )}
      <Col span={8}>
        <Text strong style={getAxisStyle('x')}>
          X: {formatValue(position.x)}
        </Text>
      </Col>
      <Col span={8}>
        <Text strong style={getAxisStyle('y')}>
          Y: {formatValue(position.y)}
        </Text>
      </Col>
      <Col span={8}>
        <Text strong style={getAxisStyle('z')}>
          Z: {formatValue(position.z)}
        </Text>
      </Col>
    </Row>
  )

  const title = showTitle ? (
    <Space>
      <span>Position</span>
      {coordinates.displayMode !== 'both' && (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          ({coordinates.displayMode === 'machine' ? 'Machine' : coordinates.activeWCS})
        </Text>
      )}
      {showControls && (
        <Space>
          <Tooltip title="Copy position">
            <Button 
              type="text" 
              icon={<CopyOutlined />} 
              size="small"
              onClick={handleCopyPosition}
            />
          </Tooltip>
          <Tooltip title="Settings">
            <Button 
              type="text" 
              icon={<SettingOutlined />} 
              size="small"
              onClick={() => setShowSettings(!showSettings)}
            />
          </Tooltip>
        </Space>
      )}
    </Space>
  ) : undefined

  return (
    <Card size="small" title={title}>
      {/* Settings Panel */}
      {showSettings && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Text strong style={{ fontSize: '12px' }}>Display Mode:</Text>
              <Select 
                value={coordinates.displayMode} 
                onChange={coordinates.setDisplayMode}
                size="small"
                style={{ width: '100%', marginTop: 4 }}
              >
                <Option value="work">Work ({coordinates.activeWCS})</Option>
                <Option value="machine">Machine</Option>
                <Option value="both">Both</Option>
              </Select>
            </Col>
            {showWCSSelector && (
              <Col span={12}>
                <Text strong style={{ fontSize: '12px' }}>Active WCS:</Text>
                <Select 
                  value={coordinates.activeWCS} 
                  onChange={coordinates.setActiveWCS}
                  size="small"
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="G54">G54</Option>
                  <Option value="G55">G55</Option>
                  <Option value="G56">G56</Option>
                  <Option value="G57">G57</Option>
                  <Option value="G58">G58</Option>
                  <Option value="G59">G59</Option>
                </Select>
              </Col>
            )}
          </Row>
        </div>
      )}

      {/* Position Display */}
      {coordinates.displayMode === 'both' && typeof coordinates.display === 'object' && 'machine' in coordinates.display ? (
        <>
          {renderPositionRow(coordinates.display.work, coordinates.activeWCS)}
          {renderPositionRow(coordinates.display.machine, 'Machine')}
        </>
      ) : coordinates.displayMode === 'machine' ? (
        renderPositionRow(coordinates.machine)
      ) : (
        renderPositionRow(coordinates.work)
      )}

      {/* Status Information */}
      {!compact && coordinates.lastUpdate && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Last updated: {coordinates.lastUpdate.toLocaleTimeString()}
          </Text>
        </div>
      )}
    </Card>
  )
}

export default CoordinateDisplay