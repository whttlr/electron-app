# API Service Module

## Purpose
Provides a unified client interface for communicating with the embedded API server that runs within the Electron application.

## Key Components

### ApiClient
- Singleton client for consistent API communication
- Handles initialization and health checking
- Provides type-safe CNC-specific methods
- Manages connection state and error handling

## Usage

```typescript
import { apiClient } from './index';

// Check if API is ready
const isReady = apiClient.isReady();

// Get connection status
const status = await apiClient.getConnectionStatus();

// Send G-code commands
await apiClient.sendGcode(['G0 X10 Y20']);

// Upload files
await apiClient.uploadGcodeFile(file);
```

## Configuration
- Automatically discovers embedded API server URL
- Handles initialization timing with Electron main process
- Provides health checking capabilities

## Error Handling
- Graceful degradation when API server is not ready
- Typed error responses with detailed messages
- Retry logic for initialization failures

## Dependencies
- Electron IPC for API configuration
- Window.electronAPI for main process communication
- Native fetch API for HTTP requests