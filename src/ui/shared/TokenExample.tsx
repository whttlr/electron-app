import React from 'react';
import { Button, Card, Space, Typography, Divider } from 'antd';
import { useTheme, useAntdTheme } from '../theme';

const { Text, Title } = Typography;

/**
 * Example component demonstrating Ant Design v5 token-based theming
 * This shows how to use both custom theme tokens and Ant Design tokens
 */
export const TokenExample: React.FC = () => {
  const { themeConfig, isDarkMode, updateTheme } = useTheme();
  const antdTokens = useAntdTheme();

  const handleThemeUpdate = () => {
    const newColor = isDarkMode ? '#52c41a' : '#ff4d4f';
    updateTheme({ primaryColor: newColor });
  };

  const handleSpacingUpdate = () => {
    const newSpacing = themeConfig.spacing === 16 ? 24 : 16;
    updateTheme({ spacing: newSpacing });
  };

  const handleBorderRadiusUpdate = () => {
    const newRadius = themeConfig.borderRadius === 6 ? 12 : 6;
    updateTheme({ borderRadius: newRadius });
  };

  return (
    <Card title="Token-Based Theme Example" style={{ margin: antdTokens.margin }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Custom Theme Tokens */}
        <div>
          <Title level={4}>Custom Theme Tokens</Title>
          <Text>Primary Color: {themeConfig.primaryColor}</Text><br />
          <Text>Border Radius: {themeConfig.borderRadius}px</Text><br />
          <Text>Spacing: {themeConfig.spacing}px</Text><br />
          <Text>Font Size: {themeConfig.fontSize}px</Text>
        </div>

        <Divider />

        {/* Ant Design Tokens */}
        <div>
          <Title level={4}>Ant Design Generated Tokens</Title>
          <Text>Color Primary: {antdTokens.colorPrimary}</Text><br />
          <Text>Color Text: {antdTokens.colorText}</Text><br />
          <Text>Color Background: {antdTokens.colorBgContainer}</Text><br />
          <Text>Border Radius: {antdTokens.borderRadius}px</Text><br />
          <Text>Font Size: {antdTokens.fontSize}px</Text><br />
          <Text>Line Height: {antdTokens.lineHeight}</Text>
        </div>

        <Divider />

        {/* Axis Colors */}
        <div>
          <Title level={4}>CNC Axis Colors</Title>
          <Space>
            <div 
              style={{ 
                width: 24, 
                height: 24, 
                backgroundColor: themeConfig.axisColors.x,
                borderRadius: antdTokens.borderRadius
              }} 
            />
            <Text>X-Axis: {themeConfig.axisColors.x}</Text>
          </Space>
          <br />
          <Space>
            <div 
              style={{ 
                width: 24, 
                height: 24, 
                backgroundColor: themeConfig.axisColors.y,
                borderRadius: antdTokens.borderRadius
              }} 
            />
            <Text>Y-Axis: {themeConfig.axisColors.y}</Text>
          </Space>
          <br />
          <Space>
            <div 
              style={{ 
                width: 24, 
                height: 24, 
                backgroundColor: themeConfig.axisColors.z,
                borderRadius: antdTokens.borderRadius
              }} 
            />
            <Text>Z-Axis: {themeConfig.axisColors.z}</Text>
          </Space>
        </div>

        <Divider />

        {/* CSS Custom Properties */}
        <div>
          <Title level={4}>CSS Custom Properties</Title>
          <div 
            style={{
              padding: 'var(--spacing)',
              backgroundColor: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              color: 'var(--text-color)'
            }}
          >
            This div uses CSS custom properties set by the theme system
          </div>
        </div>

        <Divider />

        {/* Interactive Controls */}
        <div>
          <Title level={4}>Theme Controls</Title>
          <Space wrap>
            <Button onClick={handleThemeUpdate}>
              Change Primary Color
            </Button>
            <Button onClick={handleSpacingUpdate}>
              Toggle Spacing ({themeConfig.spacing}px)
            </Button>
            <Button onClick={handleBorderRadiusUpdate}>
              Toggle Border Radius ({themeConfig.borderRadius}px)
            </Button>
          </Space>
        </div>

        {/* Component Token Demo */}
        <div>
          <Title level={4}>Component Tokens in Action</Title>
          <Space wrap>
            <Button type="primary">Primary Button</Button>
            <Button>Default Button</Button>
            <Button danger>Danger Button</Button>
          </Space>
          <br />
          <Text type="secondary">
            These buttons automatically use the theme tokens for consistent styling
          </Text>
        </div>
      </Space>
    </Card>
  );
};