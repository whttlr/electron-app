# Codebase Cleanup and Refactoring Plan

## Executive Summary

This plan addresses critical architecture violations, oversized files, missing test coverage, and organizational issues in the CNC Jog Controls application. The codebase currently violates the self-contained module architecture defined in CLAUDE.md and requires comprehensive refactoring.

## Issues Identified

### 🚨 Critical Issues (Must Fix)
- **16 files exceed the 500-line limit** (largest: 926 lines)
- **Missing required UI modules** (`ui/controls/`, `ui/visualization/`)
- **Incomplete service module structure** (9 services missing required files)
- **Test coverage at 18.4%** (target: 80%+)
- **Architecture violations** throughout the codebase

### 📊 Current State
- **174 total source files**
- **32 test files** (severely inadequate)
- **Multiple legacy directories** requiring cleanup
- **Inconsistent module organization**

## Phase 1: Critical Architecture Fixes (Week 1-2)

### 1.1 Split Oversized Core Controllers
**Priority: 🔴 Critical**

Split these massive files into smaller, focused modules:

#### VisualizationController.ts (926 lines → 4-5 files)
```
src/core/visualization/
├── controllers/
│   ├── SceneController.ts     # 3D scene management
│   ├── CameraController.ts    # Camera positioning
│   ├── RenderController.ts    # Rendering pipeline
│   └── AnimationController.ts # Animations & transitions
├── utils/
│   └── GeometryUtils.ts      # Geometry calculations
```

#### PositioningController.ts (729 lines → 3-4 files)
```
src/core/positioning/
├── controllers/
│   ├── JogController.ts      # Jog movement logic
│   ├── CoordinateController.ts # Coordinate system
│   └── BoundsController.ts   # Boundary checking
├── utils/
│   └── PositionUtils.ts      # Position calculations
```

#### WorkspaceController.ts (725 lines → 3-4 files)
```
src/core/workspace/
├── controllers/
│   ├── DimensionController.ts # Workspace dimensions
│   ├── BoundaryController.ts  # Working area bounds
│   └── GridController.ts      # Grid system
├── utils/
│   └── WorkspaceUtils.ts      # Workspace calculations
```

#### MachineController.ts (631 lines → 3-4 files)
```
src/core/machine/
├── controllers/
│   ├── StateController.ts     # Machine state
│   ├── ConnectionController.ts # Connection management
│   └── SafetyController.ts    # Safety systems
├── utils/
│   └── MachineUtils.ts        # Machine calculations
```

### 1.2 Create Missing UI Modules
**Priority: 🔴 Critical**

#### Create ui/controls/ module
```
src/ui/controls/
├── __tests__/
│   ├── JogControls.test.tsx
│   ├── AxisControls.test.tsx
│   └── SpeedControls.test.tsx
├── __mocks__/
│   └── mockControlData.ts
├── README.md
├── config.ts
├── index.ts
├── JogControls.tsx
├── AxisControls.tsx
├── SpeedControls.tsx
└── EmergencyStop.tsx
```

#### Create ui/visualization/ module
```
src/ui/visualization/
├── __tests__/
│   ├── WorkingAreaPreview.test.tsx
│   ├── MachineDisplay2D.test.tsx
│   └── VisualizationContainer.test.tsx
├── __mocks__/
│   └── mockVisualizationData.ts
├── README.md
├── config.ts
├── index.ts
├── WorkingAreaPreview.tsx (move from existing location)
├── MachineDisplay2D.tsx (move from existing location)
└── VisualizationContainer.tsx
```

### 1.3 Complete Service Module Structure
**Priority: 🔴 Critical**

Add missing files to incomplete service modules:

#### services/analytics/
- Add: `README.md`, `__tests__/`, `__mocks__/`

#### services/command/
- Add: `README.md`, `config.ts`, `__tests__/`, `__mocks__/`

#### services/connection/
- Add: `README.md`, `config.ts`, `__tests__/`, `__mocks__/`

#### services/database/
- Add: `README.md`, `config.ts`, `__tests__/`, `__mocks__/`

#### services/gcode/
- Add: `README.md`, `config.ts`, `__tests__/`, `__mocks__/`

#### services/job-tracking/
- Add: `README.md`, `config.ts`, `__tests__/`, `__mocks__/`

#### services/machine-config/
- Add: `README.md`, `config.ts`, `__tests__/`, `__mocks__/`

#### services/settings/
- Add: `README.md`, `config.ts`, `__tests__/`, `__mocks__/`

#### services/bundled-api-supabase/
- Add: `README.md`, `config.ts`, `__tests__/`, `__mocks__/`

## Phase 2: File Size Reduction (Week 2-3)

### 2.1 Split Oversized Views
**Priority: 🟡 High**

#### MobileDashboardView.tsx (667 lines → 3-4 components)
```
src/views/MobileDashboard/
├── MobileDashboardView.tsx    # Main container (150-200 lines)
├── components/
│   ├── StatusPanel.tsx        # Status display
│   ├── QuickActions.tsx       # Action buttons
│   └── MobileNavigation.tsx   # Mobile navigation
└── hooks/
    └── useMobileDashboard.ts  # Dashboard logic
```

#### StyleGuideView.tsx (548 lines → 2-3 components)
```
src/views/StyleGuide/
├── StyleGuideView.tsx         # Main container (200 lines)
├── components/
│   ├── ComponentShowcase.tsx  # Component examples
│   └── ColorPalette.tsx       # Color swatches
└── utils/
    └── styleGuideData.ts      # Static data
```

### 2.2 Refactor Oversized Utils
**Priority: 🟡 High**

Break down large utility files into focused modules:

#### accessibility-enhancements.ts (641 lines → utils/accessibility/)
```
src/utils/accessibility/
├── index.ts
├── screenReader.ts
├── keyboardNavigation.ts
├── colorContrast.ts
└── focusManagement.ts
```

#### pwa.ts (639 lines → utils/pwa/)
```
src/utils/pwa/
├── index.ts
├── serviceWorker.ts
├── offlineStorage.ts
├── caching.ts
└── installPrompt.ts
```

#### browser-compatibility.ts (622 lines → utils/browser/)
```
src/utils/browser/
├── index.ts
├── featureDetection.ts
├── polyfills.ts
├── userAgent.ts
└── compatibility.ts
```

#### performance-monitor.ts (613 lines → utils/performance/)
```
src/utils/performance/
├── index.ts
├── metrics.ts
├── monitoring.ts
├── optimization.ts
└── reporting.ts
```

### 2.3 Split Oversized Services
**Priority: 🟡 High**

#### SyncService.ts (595 lines → 3-4 files)
```
src/services/state/sync/
├── SyncService.ts             # Main service (200 lines)
├── SyncQueue.ts              # Queue management
├── ConflictResolver.ts       # Conflict resolution
└── SyncUtils.ts              # Sync utilities
```

#### SettingsService.ts (570 lines → 3 files)
```
src/services/state/settings/
├── SettingsService.ts        # Main service (200 lines)
├── SettingsValidator.ts      # Validation logic
└── SettingsStorage.ts        # Storage management
```

## Phase 3: Test Coverage Improvement (Week 3-4)

### 3.1 Add Missing View Tests
**Priority: 🟡 High**

Create comprehensive test suites for:
- `views/Jobs/JobHistoryView.tsx`
- `views/MobileControls/MobileControlsView.tsx`  
- `views/MobileDashboard/MobileDashboardView.tsx`
- `views/StyleGuide/StyleGuideView.tsx`

### 3.2 Add Missing Utils Tests
**Priority: 🟠 Medium**

Test files needed for:
- All accessibility utilities
- Browser compatibility utilities
- Performance monitoring utilities
- PWA utilities
- Mobile optimization utilities

### 3.3 Complete Service Test Coverage
**Priority: 🟠 Medium**

Add comprehensive test suites for all services missing tests:
- Analytics service
- Command service  
- Connection service
- Database service
- GCode service
- Job tracking service
- Machine config service
- Settings service
- Bundled API service

### 3.4 Test Coverage Targets
- **Unit Tests**: 85% coverage minimum
- **Integration Tests**: Key user workflows
- **E2E Tests**: Critical paths (jog controls, plugin system)

## Phase 4: Legacy Code Cleanup (Week 4-5)

### 4.1 Remove Empty/Legacy Directories
**Priority: 🟢 Low**

Remove these empty directories:
- `src/contexts/` (empty)
- `src/hooks/` (empty)  
- `src/main/services/` (duplicate)

### 4.2 Migrate Legacy Components
**Priority: 🟢 Low**

Move components from `src/components/` to appropriate UI modules:
- Controls → `ui/controls/`
- Visualization → `ui/visualization/`
- Shared components → `ui/shared/`

### 4.3 Consolidate Configuration
**Priority: 🟢 Low**

Ensure all modules have proper `config.ts` files with:
- Module-specific settings
- Default values
- Type definitions
- Validation schemas

## Phase 5: Architecture Compliance (Week 5-6)

### 5.1 Enforce Self-Contained Modules
**Priority: 🟠 Medium**

Ensure every module has:
- ✅ `__tests__/` directory with comprehensive tests
- ✅ `__mocks__/` directory with mock data
- ✅ `README.md` with module documentation
- ✅ `config.ts` with module configuration (where applicable)
- ✅ `index.ts` with clean public API exports

### 5.2 Dependency Cleanup
**Priority: 🟠 Medium**

- Remove circular dependencies
- Ensure modules only import from `services/` or `utils/`
- Clean up unused imports and exports
- Optimize bundle size

### 5.3 Documentation Updates
**Priority: 🟢 Low**

- Update CLAUDE.md with current architecture
- Add README.md files to all modules
- Document APIs and interfaces
- Create development guides

## Implementation Strategy

### Development Approach
1. **Create feature branches** for each phase
2. **Implement incrementally** to avoid breaking changes
3. **Maintain backward compatibility** during transition
4. **Update tests continuously** as code is refactored
5. **Review architecture compliance** at each step

### Testing Strategy
1. **Test before refactoring** to establish baseline
2. **Maintain test coverage** during file splits
3. **Add missing tests** for new modules
4. **Run full test suite** before merging changes
5. **Update E2E tests** for architectural changes

### Risk Mitigation
1. **Backup current working state** before major changes
2. **Split large changes** into smaller, reviewable chunks
3. **Test thoroughly** at each step
4. **Document breaking changes** and migration paths
5. **Plan rollback strategy** for each phase

## Success Metrics

### Code Quality Targets
- ✅ **File Size**: All files ≤500 lines
- ✅ **Test Coverage**: ≥85% unit test coverage
- ✅ **Architecture**: 100% module compliance
- ✅ **Performance**: No regression in app performance
- ✅ **Bundle Size**: Optimize for production builds

### Timeline
- **Phase 1**: Weeks 1-2 (Critical fixes)
- **Phase 2**: Weeks 2-3 (File size reduction)  
- **Phase 3**: Weeks 3-4 (Test coverage)
- **Phase 4**: Weeks 4-5 (Legacy cleanup)
- **Phase 5**: Weeks 5-6 (Architecture compliance)

### Validation Criteria
- All files pass ESLint and TypeScript checks
- Test suite runs successfully with ≥85% coverage
- Application builds and runs without errors
- E2E tests pass for critical user workflows
- Performance benchmarks maintained or improved

## Conclusion

This comprehensive cleanup plan addresses the major architectural and organizational issues in the codebase. Following this plan will result in a maintainable, testable, and scalable application that properly follows the self-contained module architecture defined in CLAUDE.md.

The phased approach ensures minimal disruption to development while systematically improving code quality, test coverage, and architectural compliance.