# CNC Jog Controls Plugin Examples

This directory contains complete, working example plugins that demonstrate various aspects of the CNC Jog Controls plugin system. Each example is fully functional and can be used as a starting point for your own plugins.

## 📦 Example Plugins

### 1. [Machine Status Monitor](./machine-status-monitor/)
A comprehensive plugin that displays real-time machine status, position, and alarms.
- **Category**: Machine Control
- **Features**: Real-time updates, status visualization, alarm notifications
- **Technologies**: React, TypeScript, WebSocket

### 2. [G-Code Snippets](./gcode-snippets/)
A utility plugin that provides quick access to commonly used G-code snippets and macros.
- **Category**: Utility
- **Features**: Snippet management, quick insertion, custom macros
- **Technologies**: React, TypeScript, Local Storage

### 3. [3D Toolpath Visualizer](./toolpath-visualizer/)
An advanced visualization plugin that renders G-code toolpaths in 3D.
- **Category**: Visualization
- **Features**: 3D rendering, toolpath animation, simulation controls
- **Technologies**: React, TypeScript, Three.js, WebGL

### 4. [Workflow Automation](./workflow-automation/)
A workflow plugin that automates common CNC operations and job sequences.
- **Category**: Workflow
- **Features**: Job queuing, conditional execution, parameter templates
- **Technologies**: React, TypeScript, State Machines

### 5. [Debug Console](./debug-console/)
A debugging plugin that provides advanced logging and machine diagnostics.
- **Category**: Debugging
- **Features**: Command history, log filtering, performance metrics
- **Technologies**: React, TypeScript, Chart.js

## 🚀 Getting Started

### Running an Example

1. Navigate to the example directory:
   ```bash
   cd examples/plugins/machine-status-monitor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. The plugin will be available at `http://localhost:3001`

### Building for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Testing Plugins

Each example includes comprehensive tests:

```bash
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

## 📚 Learning Path

We recommend exploring the examples in this order:

1. **Machine Status Monitor** - Learn the basics of plugin structure and real-time data
2. **G-Code Snippets** - Understand state management and user interactions
3. **Debug Console** - Explore advanced UI components and data visualization
4. **Workflow Automation** - Learn about complex state machines and job management
5. **3D Toolpath Visualizer** - Dive into advanced graphics and 3D rendering

## 🏗️ Common Patterns

### Plugin Structure
All examples follow the same structure:
```
plugin-name/
├── src/
│   ├── index.tsx          # Plugin entry point
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Business logic
│   ├── types/             # TypeScript definitions
│   └── utils/             # Helper functions
├── assets/                # Static assets
├── tests/                 # Test files
├── package.json          # Plugin manifest
└── README.md             # Plugin documentation
```

### Shared Concepts

1. **Plugin Manifest** - Every plugin has a properly configured `package.json`
2. **TypeScript** - All examples use TypeScript for type safety
3. **React Hooks** - Modern React patterns with hooks and functional components
4. **Testing** - Comprehensive test coverage with Jest and React Testing Library
5. **Documentation** - Each plugin is well-documented with inline comments

## 🔧 Development Tips

### Hot Reload
All examples support hot module replacement for rapid development:
```bash
npm run dev
```

### TypeScript Checking
Run TypeScript compiler in watch mode:
```bash
npm run type-check:watch
```

### Linting
Check code quality:
```bash
npm run lint
npm run lint:fix
```

### Bundle Analysis
Analyze bundle size:
```bash
npm run analyze
```

## 📖 Additional Resources

- [Plugin Development Guide](../../docs/plugins/README.md)
- [API Reference](../../docs/plugins/api-reference/README.md)
- [Plugin Architecture](../../docs/plugins/concepts/plugin-architecture.md)
- [Best Practices](../../docs/plugins/guides/best-practices.md)

## 🤝 Contributing

We welcome contributions to our example plugins! If you have an idea for a new example:

1. Fork the repository
2. Create your example plugin
3. Ensure it follows our patterns and includes tests
4. Submit a pull request

## 📝 License

All example plugins are MIT licensed and can be freely used as starting points for your own plugins.