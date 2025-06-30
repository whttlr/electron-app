/**
 * Coordinate System Switcher Component
 * Quick toggle between coordinate display modes and WCS systems
 */

import React, { useState } from 'react'
import { Space, Button, Select, Typography, Popover, Switch, Card } from 'antd'
import { SettingOutlined, EyeOutlined, SwapOutlined } from '@ant-design/icons'
import { useCoordinates } from '../../hooks/useCoordinates'
import { useCoordinateManager } from '../../services/coordinates/CoordinateContext'
import { WCSSystem } from '../../core/coordinates'
import WCSManager from './WCSManager'

const { Text } = Typography
const { Option } = Select

interface CoordinateSystemSwitcherProps {
  compact?: boolean
  showWCSManager?: boolean
  showDisplayModeToggle?: boolean
}

const CoordinateSystemSwitcher: React.FC<CoordinateSystemSwitcherProps> = ({
  compact = false,
  showWCSManager = true,
  showDisplayModeToggle = true
}) => {
  const coordinateManager = useCoordinateManager()
  const coordinates = useCoordinates({ 
    coordinateManager: coordinateManager || undefined 
  })
  
  const [showWCSManagerModal, setShowWCSManagerModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  if (!coordinates.isInitialized) {
    return (
      <Text type="secondary" style={{ fontSize: '12px' }}>
        Coordinate system loading...
      </Text>
    )
  }

  const displayModeOptions = [
    { value: 'work' as const, label: coordinates.activeWCS },
    { value: 'machine' as const, label: 'Machine' },
    { value: 'both' as const, label: 'Both' }
  ]

  const wcsOptions: WCSSystem[] = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']

  const settingsContent = (
    <Card size="small" style={{ minWidth: 250 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong style={{ fontSize: '12px' }}>Display Mode:</Text>
          <Select
            value={coordinates.displayMode}
            onChange={coordinates.setDisplayMode}
            size="small"
            style={{ width: '100%', marginTop: 4 }}
          >
            {displayModeOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <Text strong style={{ fontSize: '12px' }}>Active WCS:</Text>
          <Select
            value={coordinates.activeWCS}
            onChange={coordinates.setActiveWCS}
            size="small"
            style={{ width: '100%', marginTop: 4 }}
          >
            {wcsOptions.map(wcs => (
              <Option key={wcs} value={wcs}>
                {wcs}
              </Option>
            ))}
          </Select>
        </div>

        {showWCSManager && (
          <Button
            block
            size="small"
            icon={<SettingOutlined />}
            onClick={() => {
              setShowWCSManagerModal(true)
              setShowSettings(false)
            }}
          >
            Manage WCS
          </Button>
        )}
      </Space>
    </Card>
  )

  if (compact) {
    return (
      <Space size="small">
        <Text style={{ fontSize: '12px' }}>
          {coordinates.displayMode === 'machine' ? 'Machine' : coordinates.activeWCS}
        </Text>
        
        <Popover
          content={settingsContent}
          trigger="click"
          open={showSettings}
          onOpenChange={setShowSettings}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            icon={<SettingOutlined />} 
            size="small"
          />
        </Popover>

        {showWCSManager && (
          <WCSManager
            isOpen={showWCSManagerModal}
            onClose={() => setShowWCSManagerModal(false)}
          />
        )}
      </Space>
    )
  }

  return (
    <Space>
      {/* Display Mode Toggle */}
      {showDisplayModeToggle && (
        <Space>
          <Text style={{ fontSize: '12px' }}>View:</Text>
          <Select
            value={coordinates.displayMode}
            onChange={coordinates.setDisplayMode}
            size="small"
            style={{ minWidth: 80 }}
          >
            {displayModeOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Space>
      )}

      {/* Active WCS Selector */}
      <Space>
        <Text style={{ fontSize: '12px' }}>WCS:</Text>
        <Select
          value={coordinates.activeWCS}
          onChange={coordinates.setActiveWCS}
          size="small"
          style={{ minWidth: 60 }}
        >
          {wcsOptions.map(wcs => (
            <Option key={wcs} value={wcs}>
              {wcs}
            </Option>
          ))}
        </Select>
      </Space>

      {/* WCS Manager Button */}
      {showWCSManager && (
        <Button
          type="default"
          icon={<SettingOutlined />}
          size="small"
          onClick={() => setShowWCSManagerModal(true)}
        >
          Manage WCS
        </Button>
      )}

      {/* WCS Manager Modal */}
      {showWCSManager && (
        <WCSManager
          isOpen={showWCSManagerModal}
          onClose={() => setShowWCSManagerModal(false)}
        />
      )}
    </Space>
  )
}

export default CoordinateSystemSwitcher