# Documentation Directory

## Overview

This directory provides a comprehensive guide to all documentation available in the CNC Jog Controls project. Documentation is organized by topic and role to help developers, contributors, and users find the information they need quickly.

---

## Development Documentation

### 📋 Core Development Guides

#### **[DEVELOPMENT_PRINCIPLES.md](./DEVELOPMENT_PRINCIPLES.md)**
- **Purpose**: Fundamental principles and architectural philosophies
- **Audience**: All developers, new team members
- **Topics**: 
  - Domain-Driven Design patterns
  - Self-contained module architecture
  - Component-first development
  - Type safety standards
  - Testing philosophy
  - Performance principles

#### **[CLAUDE.md](./CLAUDE.md)**
- **Purpose**: AI assistant context and project structure
- **Audience**: AI tools, developers working with Claude
- **Topics**:
  - Complete project structure
  - Architecture enforcement rules
  - UI Library integration standards
  - Development commands
  - Module organization guidelines

### 🏗️ Architecture Documentation

#### **[docs/architecture/SYSTEM_OVERVIEW.md](./docs/architecture/SYSTEM_OVERVIEW.md)** *(Recommended)*
- **Purpose**: High-level system architecture and component relationships
- **Audience**: System architects, senior developers
- **Topics**:
  - System components diagram
  - Data flow architecture
  - Integration patterns
  - Scalability considerations

#### **[docs/architecture/MODULE_ARCHITECTURE.md](./docs/architecture/MODULE_ARCHITECTURE.md)** *(Recommended)*
- **Purpose**: Detailed module structure and boundaries
- **Audience**: Developers implementing new modules
- **Topics**:
  - Self-contained module patterns
  - Inter-module communication
  - Dependency management
  - Module lifecycle

#### **[docs/architecture/PLUGIN_ARCHITECTURE.md](./docs/architecture/PLUGIN_ARCHITECTURE.md)** *(Recommended)*
- **Purpose**: Plugin system design and implementation
- **Audience**: Plugin developers, core team
- **Topics**:
  - Plugin lifecycle management
  - Security sandbox model
  - Plugin API specifications
  - Dynamic loading mechanisms

### 🎨 UI/UX Documentation

#### **[docs/ui-library/UI_LIBRARY_GUIDE.md](./docs/ui-library/UI_LIBRARY_GUIDE.md)** *(Recommended)*
- **Purpose**: Complete UI Library usage and development guide
- **Audience**: Frontend developers, designers
- **Topics**:
  - Component catalog
  - Theme system
  - Design tokens
  - Local development setup
  - Storybook integration

#### **[docs/ui-library/DESIGN_SYSTEM.md](./docs/ui-library/DESIGN_SYSTEM.md)** *(Recommended)*
- **Purpose**: Design system standards and guidelines
- **Audience**: Designers, frontend developers
- **Topics**:
  - Color palettes and usage
  - Typography scale
  - Spacing system
  - Accessibility standards
  - Component patterns

#### **[docs/ui-library/COMPONENT_DEVELOPMENT.md](./docs/ui-library/COMPONENT_DEVELOPMENT.md)** *(Recommended)*
- **Purpose**: Creating and maintaining UI Library components
- **Audience**: Frontend developers
- **Topics**:
  - Component creation workflow
  - Testing requirements
  - Documentation standards
  - Deployment process

### 🔧 Development Setup

#### **[docs/development/GETTING_STARTED.md](./docs/development/GETTING_STARTED.md)** *(Recommended)*
- **Purpose**: Initial setup and first-time developer onboarding
- **Audience**: New developers, contributors
- **Topics**:
  - Prerequisites installation
  - Repository setup
  - Development environment configuration
  - First build and test run

#### **[docs/development/LOCAL_DEVELOPMENT.md](./docs/development/LOCAL_DEVELOPMENT.md)** *(Recommended)*
- **Purpose**: Day-to-day development workflow
- **Audience**: Active developers
- **Topics**:
  - Development server setup
  - Hot reload configuration
  - UI Library linking
  - Debugging techniques

#### **[docs/development/DEVELOPMENT_WORKFLOW.md](./docs/development/DEVELOPMENT_WORKFLOW.md)** *(Recommended)*
- **Purpose**: Git workflow and collaboration processes
- **Audience**: All developers
- **Topics**:
  - Branch naming conventions
  - Pull request process
  - Code review guidelines
  - Merge strategies

### 🧪 Testing Documentation

#### **[docs/testing/TESTING_STRATEGY.md](./docs/testing/TESTING_STRATEGY.md)** *(Recommended)*
- **Purpose**: Comprehensive testing approach and standards
- **Audience**: Developers, QA engineers
- **Topics**:
  - Test pyramid implementation
  - Unit testing patterns
  - Integration testing approach
  - E2E testing strategy
  - Coverage requirements

#### **[docs/testing/UNIT_TESTING.md](./docs/testing/UNIT_TESTING.md)** *(Recommended)*
- **Purpose**: Unit testing best practices and examples
- **Audience**: Developers writing tests
- **Topics**:
  - Jest configuration
  - React Testing Library patterns
  - Mocking strategies
  - Test organization

#### **[docs/testing/E2E_TESTING.md](./docs/testing/E2E_TESTING.md)** *(Recommended)*
- **Purpose**: End-to-end testing with Playwright
- **Audience**: QA engineers, senior developers
- **Topics**:
  - Playwright setup
  - Page object patterns
  - Test data management
  - CI/CD integration

---

## API & Backend Documentation

### 🌐 API Documentation

#### **[docs/api/API_OVERVIEW.md](./docs/api/API_OVERVIEW.md)** *(Recommended)*
- **Purpose**: Complete API architecture and endpoints
- **Audience**: Backend developers, API consumers
- **Topics**:
  - API architecture overview
  - Authentication methods
  - Rate limiting policies
  - Error handling standards

#### **[docs/api/CNC_CORE_INTEGRATION.md](./docs/api/CNC_CORE_INTEGRATION.md)** *(Recommended)*
- **Purpose**: Integration with CNC-core library
- **Audience**: CNC domain experts, backend developers
- **Topics**:
  - CNC-core API usage
  - Machine control protocols
  - Safety systems integration
  - Real-time communication

#### **[docs/api/ENDPOINT_REFERENCE.md](./docs/api/ENDPOINT_REFERENCE.md)** *(Recommended)*
- **Purpose**: Complete API endpoint documentation
- **Audience**: Frontend developers, API consumers
- **Topics**:
  - Endpoint specifications
  - Request/response schemas
  - Authentication requirements
  - Usage examples

### 🗄️ Database Documentation

#### **[docs/database/DATABASE_SCHEMA.md](./docs/database/DATABASE_SCHEMA.md)** *(Recommended)*
- **Purpose**: Database design and schema documentation
- **Audience**: Backend developers, database administrators
- **Topics**:
  - Entity relationship diagrams
  - Table specifications
  - Index strategies
  - Migration procedures

#### **[docs/database/DATA_MANAGEMENT.md](./docs/database/DATA_MANAGEMENT.md)** *(Recommended)*
- **Purpose**: Data lifecycle and management procedures
- **Audience**: Backend developers, DevOps engineers
- **Topics**:
  - Data retention policies
  - Backup strategies
  - Performance optimization
  - Security considerations

---

## Configuration & Deployment

### ⚙️ Configuration Documentation

#### **[docs/configuration/MACHINE_CONFIG.md](./docs/configuration/MACHINE_CONFIG.md)** *(Recommended)*
- **Purpose**: Machine configuration options and setup
- **Audience**: CNC operators, system administrators
- **Topics**:
  - Machine parameter definitions
  - Configuration file structure
  - Safety setting guidelines
  - Calibration procedures

#### **[docs/configuration/APPLICATION_CONFIG.md](./docs/configuration/APPLICATION_CONFIG.md)** *(Recommended)*
- **Purpose**: Application-level configuration management
- **Audience**: Developers, system administrators
- **Topics**:
  - Environment variables
  - Config file hierarchy
  - Feature flags
  - Runtime configuration

### 🚀 Deployment Documentation

#### **[docs/deployment/DEPLOYMENT_GUIDE.md](./docs/deployment/DEPLOYMENT_GUIDE.md)** *(Recommended)*
- **Purpose**: Complete deployment procedures and best practices
- **Audience**: DevOps engineers, release managers
- **Topics**:
  - Environment setup
  - Build processes
  - Deployment strategies
  - Rollback procedures

#### **[docs/deployment/GITHUB_ACTIONS.md](./docs/deployment/GITHUB_ACTIONS.md)** *(Recommended)*
- **Purpose**: CI/CD pipeline configuration and usage
- **Audience**: DevOps engineers, developers
- **Topics**:
  - Workflow specifications
  - Build automation
  - Test automation
  - Deployment automation

#### **[docs/deployment/ELECTRON_BUILD.md](./docs/deployment/ELECTRON_BUILD.md)** *(Recommended)*
- **Purpose**: Electron application building and distribution
- **Audience**: Release engineers, desktop app developers
- **Topics**:
  - Build configuration
  - Code signing
  - Distribution strategies
  - Platform-specific builds

---

## Plugin Development

### 🔌 Plugin Documentation

#### **[docs/plugins/PLUGIN_DEVELOPMENT_GUIDE.md](./docs/plugins/PLUGIN_DEVELOPMENT_GUIDE.md)** *(Recommended)*
- **Purpose**: Complete guide for developing plugins
- **Audience**: Plugin developers, third-party developers
- **Topics**:
  - Plugin architecture overview
  - Development environment setup
  - API reference
  - Testing strategies

#### **[docs/plugins/PLUGIN_API_REFERENCE.md](./docs/plugins/PLUGIN_API_REFERENCE.md)** *(Recommended)*
- **Purpose**: Detailed API reference for plugin developers
- **Audience**: Plugin developers
- **Topics**:
  - Core API interfaces
  - Event system
  - State management
  - UI integration points

#### **[docs/plugins/PLUGIN_EXAMPLES.md](./docs/plugins/PLUGIN_EXAMPLES.md)** *(Recommended)*
- **Purpose**: Example plugins with complete source code
- **Audience**: Plugin developers learning the system
- **Topics**:
  - Basic plugin template
  - Dashboard widget example
  - Standalone screen example
  - Modal dialog example

---

## User & Operations Documentation

### 👥 User Documentation

#### **[docs/user/USER_GUIDE.md](./docs/user/USER_GUIDE.md)** *(Recommended)*
- **Purpose**: End-user application guide
- **Audience**: CNC operators, end users
- **Topics**:
  - Application overview
  - Basic operations
  - Safety procedures
  - Troubleshooting

#### **[docs/user/CNC_OPERATIONS.md](./docs/user/CNC_OPERATIONS.md)** *(Recommended)*
- **Purpose**: CNC-specific operational procedures
- **Audience**: CNC operators, machinists
- **Topics**:
  - Machine setup procedures
  - Jog control usage
  - Safety protocols
  - Maintenance schedules

### 🔧 Operations Documentation

#### **[docs/operations/MONITORING.md](./docs/operations/MONITORING.md)** *(Recommended)*
- **Purpose**: System monitoring and observability
- **Audience**: DevOps engineers, system administrators
- **Topics**:
  - Metrics collection
  - Alerting strategies
  - Performance monitoring
  - Log management

#### **[docs/operations/TROUBLESHOOTING.md](./docs/operations/TROUBLESHOOTING.md)** *(Recommended)*
- **Purpose**: Common issues and resolution procedures
- **Audience**: Support engineers, system administrators
- **Topics**:
  - Common error scenarios
  - Diagnostic procedures
  - Performance issues
  - Recovery strategies

---

## Reference Documentation

### 📚 Technical Reference

#### **[docs/reference/CODING_STANDARDS.md](./docs/reference/CODING_STANDARDS.md)** *(Recommended)*
- **Purpose**: Code style and quality standards
- **Audience**: All developers
- **Topics**:
  - TypeScript style guide
  - React component patterns
  - Naming conventions
  - Code organization

#### **[docs/reference/SECURITY_GUIDELINES.md](./docs/reference/SECURITY_GUIDELINES.md)** *(Recommended)*
- **Purpose**: Security best practices and requirements
- **Audience**: All developers, security team
- **Topics**:
  - Authentication patterns
  - Data protection
  - Input validation
  - Plugin security

#### **[docs/reference/PERFORMANCE_GUIDELINES.md](./docs/reference/PERFORMANCE_GUIDELINES.md)** *(Recommended)*
- **Purpose**: Performance optimization guidelines
- **Audience**: Developers, performance engineers
- **Topics**:
  - Bundle optimization
  - Memory management
  - Rendering performance
  - API optimization

### 🔍 Troubleshooting & FAQ

#### **[docs/troubleshooting/COMMON_ISSUES.md](./docs/troubleshooting/COMMON_ISSUES.md)** *(Recommended)*
- **Purpose**: Frequently encountered problems and solutions
- **Audience**: Developers, support engineers
- **Topics**:
  - Development environment issues
  - Build problems
  - Runtime errors
  - Performance issues

#### **[docs/troubleshooting/DEBUG_GUIDE.md](./docs/troubleshooting/DEBUG_GUIDE.md)** *(Recommended)*
- **Purpose**: Debugging techniques and tools
- **Audience**: Developers
- **Topics**:
  - Browser debugging
  - Electron debugging
  - Plugin debugging
  - Performance profiling

---

## Documentation Standards

### 📝 Writing Guidelines

#### **[docs/meta/DOCUMENTATION_STANDARDS.md](./docs/meta/DOCUMENTATION_STANDARDS.md)** *(Recommended)*
- **Purpose**: Standards for creating and maintaining documentation
- **Audience**: All contributors
- **Topics**:
  - Documentation structure
  - Writing style guide
  - Markdown conventions
  - Review process

#### **[docs/meta/CONTRIBUTION_GUIDE.md](./docs/meta/CONTRIBUTION_GUIDE.md)** *(Recommended)*
- **Purpose**: How to contribute to the project
- **Audience**: Open source contributors, new team members
- **Topics**:
  - Contribution workflow
  - Code review process
  - Issue reporting
  - Documentation contributions

---

## Quick Reference

### 🚀 Getting Started Fast

1. **New Developer**: Start with [GETTING_STARTED.md](./docs/development/GETTING_STARTED.md)
2. **Understanding Architecture**: Read [DEVELOPMENT_PRINCIPLES.md](./DEVELOPMENT_PRINCIPLES.md)
3. **UI Development**: Check [UI_LIBRARY_GUIDE.md](./docs/ui-library/UI_LIBRARY_GUIDE.md)
4. **Plugin Development**: Begin with [PLUGIN_DEVELOPMENT_GUIDE.md](./docs/plugins/PLUGIN_DEVELOPMENT_GUIDE.md)
5. **API Integration**: Reference [API_OVERVIEW.md](./docs/api/API_OVERVIEW.md)

### 🔧 Development Workflow

1. **Daily Development**: [LOCAL_DEVELOPMENT.md](./docs/development/LOCAL_DEVELOPMENT.md)
2. **Testing**: [TESTING_STRATEGY.md](./docs/testing/TESTING_STRATEGY.md)
3. **Code Review**: [DEVELOPMENT_WORKFLOW.md](./docs/development/DEVELOPMENT_WORKFLOW.md)
4. **Deployment**: [DEPLOYMENT_GUIDE.md](./docs/deployment/DEPLOYMENT_GUIDE.md)

### 🐛 Troubleshooting

1. **Common Issues**: [COMMON_ISSUES.md](./docs/troubleshooting/COMMON_ISSUES.md)
2. **Debugging**: [DEBUG_GUIDE.md](./docs/troubleshooting/DEBUG_GUIDE.md)
3. **Performance**: [PERFORMANCE_GUIDELINES.md](./docs/reference/PERFORMANCE_GUIDELINES.md)

---

## Documentation Maintenance

### 📋 Status Legend

- **✅ Complete**: Documentation is comprehensive and up-to-date
- **🔄 In Progress**: Documentation exists but needs updates
- **⚠️ Outdated**: Documentation needs significant revision
- **❌ Missing**: Documentation needs to be created
- ***(Recommended)***: High-priority documentation that should be created

### 🔄 Update Schedule

- **Monthly**: Review and update development guides
- **Quarterly**: Architecture and API documentation review
- **Release-based**: Update deployment and configuration docs
- **As-needed**: Troubleshooting and FAQ updates

### 👥 Documentation Ownership

- **Core Team**: Architecture and development principles
- **Frontend Team**: UI Library and component documentation
- **Backend Team**: API and database documentation
- **DevOps Team**: Deployment and operations documentation
- **Product Team**: User documentation and guides

---

## Contributing to Documentation

### 📝 How to Contribute

1. **Identify gaps** using this directory
2. **Follow documentation standards** in [DOCUMENTATION_STANDARDS.md](./docs/meta/DOCUMENTATION_STANDARDS.md)
3. **Submit pull requests** with documentation updates
4. **Review and iterate** based on feedback

### 🎯 Priority Areas

Current documentation priorities:
1. **Development setup guides** - Critical for new developers
2. **API documentation** - Essential for frontend/backend integration
3. **Plugin development** - Key for extensibility
4. **Testing documentation** - Required for quality assurance
5. **Deployment guides** - Necessary for reliable releases

This documentation directory serves as the central hub for all project documentation, ensuring developers can quickly find the information they need to be productive and maintain high-quality standards.