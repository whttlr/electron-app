import type { Preview } from '@storybook/react';
import { themes } from '@storybook/theming';
import '../src/index.css';

// CNC Design System theme
const cncTheme = {
  ...themes.dark,
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
  
  // Form colors
  inputBg: '#2d2d2d',
  inputBorder: '#434343',
  inputTextColor: '#ffffff',
  inputBorderRadius: 4,
  
  // Brand
  brandTitle: 'CNC Control Design System',
  brandUrl: 'https://github.com/your-org/cnc-design-system',
  brandImage: undefined, // Add your logo here
  brandTarget: '_self',
};

const preview: Preview = {
  parameters: {
    docs: {
      theme: cncTheme,
      toc: true,
    },
    
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#141414',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'workshop',
          value: '#2d2d2d',
        },
      ],
    },
    
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
        largeDesktop: {
          name: 'Large Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
        workshop: {
          name: 'Workshop Display',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
      },
    },
    
    actions: { argTypesRegex: '^on[A-Z].*' },
    
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
      expanded: true,
      sort: 'alpha',
    },
    
    // Accessibility testing
    a11y: {
      config: {
        rules: [
          {
            // Disable color-contrast rule for design tokens display
            id: 'color-contrast',
            enabled: false,
          },
        ],
      },
      options: {
        checks: { 'color-contrast': { options: { noScroll: true } } },
        restoreScroll: true,
      },
    },
    
    // Layout options
    layout: 'centered',
    
    // Add custom toolbar items
    toolbar: {
      title: { hidden: false },
      zoom: { hidden: false },
      eject: { hidden: false },
      copy: { hidden: false },
      fullscreen: { hidden: false },
    },
  },
  
  // Global decorators
  decorators: [
    (Story, context) => {
      // Add theme wrapper
      const isDark = context.globals.backgrounds?.value === '#141414';
      
      return (
        <div 
          className={isDark ? 'dark' : 'light'}
          style={{
            padding: '1rem',
            minHeight: '100vh',
            backgroundColor: 'var(--sb-color-bg)',
            color: 'var(--sb-color-text)',
          }}
        >
          <Story />
        </div>
      );
    },
  ],
  
  // Global args
  args: {},
  
  // Global arg types
  argTypes: {
    // Common prop types for all components
    className: {
      control: 'text',
      description: 'Additional CSS classes',
      table: {
        type: { summary: 'string' },
        category: 'Styling',
      },
    },
    
    'data-testid': {
      control: 'text',
      description: 'Test identifier for automated testing',
      table: {
        type: { summary: 'string' },
        category: 'Testing',
      },
    },
  },
  
  // Tags
  tags: ['autodocs'],
};

export default preview;