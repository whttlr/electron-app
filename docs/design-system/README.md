# CNC Control Design System

> A comprehensive, industrial-grade design system for CNC machine control applications

## Overview

The CNC Control Design System is a modern, accessible, and performant design system built specifically for industrial machine control interfaces. It provides a complete set of components, patterns, and guidelines for building professional CNC control applications.

## ✨ Key Features

- **Industrial-First Design**: Purpose-built for manufacturing and CNC environments
- **Accessibility Compliant**: WCAG 2.1 AA standards with screen reader support
- **Real-Time Optimized**: Sub-100ms response times for critical operations
- **Framework Agnostic**: Adapter pattern allows for easy migration between UI libraries
- **Dark Theme Native**: Optimized for workshop environments with reduced eye strain
- **Performance Monitored**: Built-in performance tracking and optimization
- **Fully Tested**: 95%+ test coverage with comprehensive E2E testing

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run Storybook
npm run storybook

# Run tests
npm test
```

## 📁 Project Structure

```
src/
├── ui/
│   ├── theme/              # Design tokens and theme system
│   ├── adapters/            # Component adapters (Ant Design, future frameworks)
│   ├── interfaces/          # Framework-agnostic component interfaces
│   ├── providers/           # Component and theme providers
│   ├── components/          # Shared UI components
│   └── forms/              # CNC-specific form components
├── stores/                 # State management (Zustand)
├── components/             # Application components
└── test-utils/             # Testing utilities and helpers
```

## 🎨 Design Principles

### 1. **Safety First**
- High contrast colors for critical actions
- Clear visual hierarchy for emergency controls
- Consistent error states and warnings
- Redundant feedback mechanisms

### 2. **Industrial Durability**
- Dark theme optimized for workshop lighting
- Large touch targets for industrial environments
- Minimal visual noise and distractions
- Robust error handling and recovery

### 3. **Performance Critical**
- Real-time data visualization
- Sub-100ms interaction response times
- Efficient memory management
- Optimized for continuous operation

### 4. **Accessibility & Inclusion**
- WCAG 2.1 AA compliance
- Keyboard-only navigation support
- Screen reader compatibility
- Multiple input method support

## 🎯 Core Components

### **Interaction Components**
- **Button**: Primary, secondary, emergency, and jog variants
- **Input**: Text, number, coordinate, and validation states
- **Select**: Dropdown selection with search and grouping
- **Slider**: Continuous value selection with step controls

### **Display Components**
- **Card**: Content containers with elevation and actions
- **Badge**: Status indicators and notifications
- **Progress**: Linear and circular progress indicators
- **Tooltip**: Contextual help and information

### **Layout Components**
- **Grid**: Responsive grid system for complex layouts
- **Stack**: Flexible spacing and alignment utility
- **Divider**: Visual content separation
- **Container**: Consistent content width and padding

### **CNC-Specific Components**
- **JogControls**: Multi-axis machine positioning
- **CoordinateDisplay**: Real-time position monitoring
- **MachineStatus**: Comprehensive status indicators
- **EmergencyStop**: Critical safety controls

## 🛠 Architecture

### **Adapter Pattern**
The design system uses an adapter pattern to remain framework-agnostic:

```typescript
// Framework-agnostic interface
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'emergency';
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
}

// Current implementation (Ant Design)
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...);

// Future implementation (Material-UI, Chakra, etc.)
// Same interface, different implementation
```

### **Component Provider System**
```typescript
// Switch between implementations
<ComponentProvider implementation="ant-design">
  <App />
</ComponentProvider>
```

### **Design Token System**
```typescript
export const designTokens = {
  colors: {
    primary: { 50: '#e6f7ff', 500: '#1890ff', 900: '#002766' },
    semantic: { success: '#52c41a', warning: '#faad14', error: '#ff4d4f' }
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: { /* ... */ },
  // CNC-specific tokens
  cnc: {
    emergency: '#ff1744',
    machine: { idle: '#4caf50', running: '#2196f3', error: '#f44336' }
  }
};
```

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: < 768px (Touch-optimized controls)
- **Tablet**: 768px - 1023px (Hybrid interface)
- **Desktop**: ≥ 1024px (Full feature set)
- **Large**: ≥ 1440px (Multi-monitor support)

### **Adaptive Interfaces**
- Touch-friendly controls on mobile devices
- Contextual menu systems for different screen sizes
- Progressive disclosure of advanced features
- Responsive typography and spacing

## 🎭 Theme System

### **Dark Theme (Default)**
```scss
:root[data-theme="dark"] {
  --color-bg-primary: #141414;
  --color-bg-secondary: #1f1f1f;
  --color-text-primary: #ffffff;
  --color-text-secondary: #a6a6a6;
}
```

### **Light Theme**
```scss
:root[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #fafafa;
  --color-text-primary: #000000;
  --color-text-secondary: #666666;
}
```

### **High Contrast Theme**
```scss
:root[data-theme="high-contrast"] {
  --color-bg-primary: #000000;
  --color-bg-secondary: #1a1a1a;
  --color-text-primary: #ffffff;
  --color-emergency: #ff0000;
}
```

## 🔧 State Management

### **Store Architecture**
- **Machine Store**: Real-time machine state and control
- **Job Store**: Job queue and execution management
- **UI Store**: Interface state and user preferences
- **Settings Store**: Configuration and validation
- **Performance Store**: Monitoring and optimization

### **Real-Time Synchronization**
- WebSocket-based data streaming
- Conflict resolution strategies
- Offline queue management
- Cross-client synchronization

## 🧪 Testing Strategy

### **Test Pyramid**
- **Unit Tests**: Component logic and store behavior
- **Integration Tests**: Cross-store communication
- **E2E Tests**: Complete user workflows
- **Accessibility Tests**: WCAG compliance validation
- **Performance Tests**: Response time benchmarks

### **Testing Tools**
- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **axe-core**: Accessibility testing
- **Custom utilities**: CNC-specific test helpers

## 📈 Performance

### **Benchmarks**
- **Initial Load**: < 2 seconds
- **Component Render**: < 16ms (60 FPS)
- **State Updates**: < 100ms
- **Real-time Data**: < 50ms latency
- **Memory Usage**: < 100MB for typical workloads

### **Optimization Techniques**
- Component memoization and lazy loading
- Virtual scrolling for large datasets
- Efficient state management with Zustand
- Cache management and memory optimization
- Bundle splitting and code optimization

## 🌐 Accessibility

### **WCAG 2.1 AA Compliance**
- **Perceivable**: High contrast, scalable text, alternative text
- **Operable**: Keyboard navigation, focus management, timing
- **Understandable**: Clear language, consistent behavior
- **Robust**: Screen reader compatibility, semantic markup

### **Keyboard Navigation**
- Tab order optimization
- Focus management in modals
- Escape key handling
- Arrow key navigation for complex components

### **Screen Reader Support**
- ARIA labels and descriptions
- Live regions for dynamic content
- Semantic HTML structure
- Descriptive error messages

## 🔄 Migration Strategy

### **From Ant Design to Future Framework**
1. **Assessment**: Analyze current component usage
2. **Mapping**: Create component mapping documentation
3. **Implementation**: Build new adapters
4. **Testing**: Validate functionality and design
5. **Rollout**: Gradual migration with feature flags

### **Backward Compatibility**
- Semantic versioning for breaking changes
- Deprecation warnings and migration guides
- Legacy component support during transition
- Automated migration tools where possible

## 🛡 Security Considerations

### **Input Validation**
- Sanitization of user inputs
- Coordinate boundary validation
- File upload restrictions
- SQL injection prevention

### **Access Control**
- Role-based permissions
- Session management
- Audit logging
- Emergency access protocols

## 📚 Additional Resources

- [Component API Documentation](./components/README.md)
- [Development Guidelines](./development/README.md)
- [Testing Guide](./testing/README.md)
- [Performance Optimization](./performance/README.md)
- [Migration Guides](./migration/README.md)
- [Storybook Components](https://storybook.example.com)

## 🤝 Contributing

### **Getting Started**
1. Read the [development guidelines](./development/README.md)
2. Set up your [development environment](./development/setup.md)
3. Review [coding standards](./development/standards.md)
4. Check [component requirements](./components/requirements.md)

### **Development Workflow**
1. Create feature branch from `main`
2. Implement changes with tests
3. Run quality checks (`npm run lint`, `npm test`)
4. Create pull request with documentation
5. Code review and merge

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🆘 Support

- **Documentation**: [Design System Docs](./docs/)
- **Issues**: [GitHub Issues](https://github.com/example/cnc-design-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/example/cnc-design-system/discussions)
- **Email**: design-system@example.com

---

**Built with ❤️ for the manufacturing industry**
