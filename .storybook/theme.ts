import { create } from '@storybook/theming/create';

export default create({
  base: 'dark',
  
  // Brand
  brandTitle: 'CNC Control Design System',
  brandUrl: 'https://github.com/your-org/cnc-design-system',
  brandTarget: '_self',
  
  // Colors
  colorPrimary: '#1890ff',
  colorSecondary: '#722ed1',
  
  // UI
  appBg: '#141414',
  appContentBg: '#1f1f1f',
  appPreviewBg: '#1f1f1f',
  appBorderColor: '#434343',
  appBorderRadius: 6,
  
  // Text colors
  textColor: '#ffffff',
  textInverseColor: '#000000',
  textMutedColor: '#a6a6a6',
  
  // Toolbar default and active colors
  barTextColor: '#a6a6a6',
  barHoverColor: '#ffffff',
  barSelectedColor: '#1890ff',
  barBg: '#1f1f1f',
  
  // Form colors
  inputBg: '#2d2d2d',
  inputBorder: '#434343',
  inputTextColor: '#ffffff',
  inputBorderRadius: 4,
  
  // Button colors
  buttonBg: '#2d2d2d',
  buttonBorder: '#434343',
  booleanBg: '#2d2d2d',
  booleanSelectedBg: '#1890ff',
});