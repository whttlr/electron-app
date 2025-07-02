# CNC G-code Sender MCP Server

Generated MCP (Model Context Protocol) server for the CNC G-code Sender API.

## Generated Tools

This MCP server provides 13 tools for interacting with the CNC API:

### connection_ports

[Connection] Get Status

Endpoint: GET /ports
Tags: Connection

**Input Parameters:**
```json
{
  "type": "object",
  "properties": {
    "baseUrl": {
      "type": "string",
      "description": "Base URL of the CNC API server",
      "default": "http://localhost:3000"
    }
  },
  "required": []
}
```

### files_get_index

[Files] files endpoint

Endpoint: GET /
Tags: Files

**Input Parameters:**
```json
{
  "type": "object",
  "properties": {
    "baseUrl": {
      "type": "string",
      "description": "Base URL of the CNC API server",
      "default": "http://localhost:3000"
    }
  },
  "required": []
}
```

### files_get_index

[Files] Get File Info

Endpoint: GET /{filename}
Tags: Files

**Input Parameters:**
```json
{
  "type": "object",
  "properties": {
    "baseUrl": {
      "type": "string",
      "description": "Base URL of the CNC API server",
      "default": "http://localhost:3000"
    },
    "filename": {
      "type": "string",
      "description": "Path parameter: filename"
    }
  },
  "required": [
    "filename"
  ]
}
```

### files_download

[Files] files endpoint

Endpoint: GET /{filename}/download
Tags: Files

**Input Parameters:**
```json
{
  "type": "object",
  "properties": {
    "baseUrl": {
      "type": "string",
      "description": "Base URL of the CNC API server",
      "default": "http://localhost:3000"
    },
    "filename": {
      "type": "string",
      "description": "Path parameter: filename"
    }
  },
  "required": [
    "filename"
  ]
}
```

### files_post_validate

[Files] files endpoint

Endpoint: POST /{filename}/validate
Tags: Files

**Input Parameters:**
```json
{
  "type": "object",
  "properties": {
    "baseUrl": {
      "type": "string",
      "description": "Base URL of the CNC API server",
      "default": "http://localhost:3000"
    },
    "body": {
      "type": "object",
      "description": "Request body data",
      "additionalProperties": true
    },
    "filename": {
      "type": "string",
      "description": "Path parameter: filename"
    }
  },
  "required": [
    "filename"
  ]
}
```

### gcode_post_execute

[Gcode] Get Execution Queue

Endpoint: POST /execute
Tags: Gcode

**Input Parameters:**
```json
{
  "type": "object",
  "properties": {
    "baseUrl": {
      "type": "string",
      "description": "Base URL of the CNC API server",
      "default": "http://localhost:3000"
    },
    "body": {
      "type": "object",
      "description": "Request body data",
      "additionalProperties": true
    }
  },
  "required": [
    "body"
  ]
}
```

### health_help

[Health] Get Help

Endpoint: GET /help
Tags: Health

**Input Parameters:**
```json
{
  "type": "object",
  "properties": {
    "baseUrl": {
      "type": "string",
      "description": "Base URL of the CNC API server",
      "default": "http://localhost:3000"
    }
  },
  "required": []
}
```

### machine_status

[Machine] Get Machine Status

Endpoint: GET /status
Tags: Machine

**Input Parameters:**
```json
{
  "type": "object",
  "properties": {
    "baseUrl": {
      "type": "string",
      "description": "Base URL of the CNC API server",
      "default": "http://localhost:3000"
    }
  },
  "required": []
}
```

### presets_get_index

[Presets] presets endpoint

Endpoint: GET /
Tags: Presets

**Input Parameters:**
```json
{
  "type": "object",
  "properties": {
    "baseUrl": {
      "type": "string",
      "description": "Base URL of the CNC API server",
      "default": "http://localhost:3000"
    }
  },
  "required": []
}
```

### presets_get_index

[Presets] Get Preset Info

Endpoint: GET /{presetName}
Tags: Presets

**Input Parameters:**
```json
{
  "type": "object",
  "properties": {
    "baseUrl": {
      "type": "string",
      "description": "Base URL of the CNC API server",
      "default": "http://localhost:3000"
    },
    "presetName": {
      "type": "string",
      "description": "Path parameter: presetName"
    }
  },
  "required": [
    "presetName"
  ]
}
```

### presets_post_execute

[Presets] presets endpoint

Endpoint: POST /{presetName}/execute
Tags: Presets

**Input Parameters:**
```json
{
  "type": "object",
  "properties": {
    "baseUrl": {
      "type": "string",
      "description": "Base URL of the CNC API server",
      "default": "http://localhost:3000"
    },
    "body": {
      "type": "object",
      "description": "Request body data",
      "additionalProperties": true
    },
    "presetName": {
      "type": "string",
      "description": "Path parameter: presetName"
    }
  },
  "required": [
    "body",
    "presetName"
  ]
}
```

### presets_post_validate

[Presets] presets endpoint

Endpoint: POST /{presetName}/validate
Tags: Presets

**Input Parameters:**
```json
{
  "type": "object",
  "properties": {
    "baseUrl": {
      "type": "string",
      "description": "Base URL of the CNC API server",
      "default": "http://localhost:3000"
    },
    "body": {
      "type": "object",
      "description": "Request body data",
      "additionalProperties": true
    },
    "presetName": {
      "type": "string",
      "description": "Path parameter: presetName"
    }
  },
  "required": [
    "presetName"
  ]
}
```

### main_get_index

[Main] Routes

Endpoint: GET /
Tags: Main

**Input Parameters:**
```json
{
  "type": "object",
  "properties": {
    "baseUrl": {
      "type": "string",
      "description": "Base URL of the CNC API server",
      "default": "http://localhost:3000"
    }
  },
  "required": []
}
```


## Installation & Setup

### Step 1: Install MCP Dependencies

Navigate to the MCP directory and install required packages:

```bash
cd /Users/tylerhenry/Desktop/whttlr/api/docs/mcp
npm install
```

### Step 2: Ensure CNC API is Running

Make sure your CNC API server is running before using the MCP server:

```bash
# In your API directory
cd /Users/tylerhenry/Desktop/whttlr/api
npm start
```

The API should be accessible at `http://localhost:3000`

### Step 3: Configure Claude (Desktop or CLI)

Choose the appropriate setup for your Claude environment:

#### Option A: Claude Desktop Application

Create or edit your Claude Desktop configuration file:

**Configuration File Locations:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Add this configuration:**

```json
{
  "mcpServers": {
    "cnc-gcode-sender": {
      "command": "node",
      "args": ["/Users/tylerhenry/Desktop/whttlr/api/docs/mcp/server.js"],
      "env": {
        "CNC_API_BASE_URL": "http://localhost:3000"
      }
    }
  }
}
```

Then **restart Claude Desktop** completely.

#### Option B: Claude Code (CLI Tool)

Add the MCP server using the CLI command:

```bash
claude mcp add cnc-gcode-sender node /Users/tylerhenry/Desktop/whttlr/api/docs/mcp/server.js -e CNC_API_BASE_URL=http://localhost:3000
```

**Alternative: Project-wide Configuration**

Create a `.mcp.json` file in your project root and add to project scope:

```bash
# Create .mcp.json configuration file
cat > .mcp.json << 'EOF'
{
  "mcpServers": {
    "cnc-gcode-sender": {
      "command": "node",
      "args": ["/Users/tylerhenry/Desktop/whttlr/api/docs/mcp/server.js"],
      "env": {
        "CNC_API_BASE_URL": "http://localhost:3000"
      }
    }
  }
}
EOF

# Add to project scope
claude mcp add --scope project cnc-gcode-sender node /Users/tylerhenry/Desktop/whttlr/api/docs/mcp/server.js -e CNC_API_BASE_URL=http://localhost:3000
```

**Verify Configuration:**

```bash
# List configured MCP servers
claude mcp list

# Get server details
claude mcp get cnc-gcode-sender
```

### Step 4: Restart (if needed)

- **Claude Desktop**: Completely quit and restart the application
- **Claude Code (CLI)**: No restart needed! MCP tools are available immediately

### Step 5: Test the Integration

Once configured, you can test the integration by asking Claude to:

- "List available serial ports using the CNC API"
- "Get the machine status"
- "Check the health of the CNC system"
- "Execute a G-code command"

## Available MCP Tools

Once integrated, Claude will have access to these **13 CNC control tools**:

### 🔌 Connection Tools
- `connection_ports` - List available serial ports

### 📁 File Management
- `files_get_index` - List files
- `files_download` - Download files  
- `files_post_validate` - Validate G-code files

### ⚙️ G-code Execution
- `gcode_post_execute` - Execute G-code commands

### 📊 Machine Control
- `machine_status` - Get machine status

### 🎯 Presets
- `presets_get_index` - List presets
- `presets_post_execute` - Execute presets
- `presets_post_validate` - Validate presets

### 🛠️ System Health
- `health_help` - Get help information

## What This Enables

Once configured, Claude can:

1. **🔌 Help you connect to CNC machines** by listing available ports
2. **📁 Manage G-code files** by validating, downloading, and organizing them  
3. **⚙️ Execute G-code commands** safely with proper validation
4. **📊 Monitor machine status** and provide real-time feedback
5. **🎯 Use presets** for common operations like homing and tool changes
6. **🛠️ Troubleshoot issues** using health checks and diagnostics
7. **📚 Provide contextual help** based on your specific CNC setup

## MCP Server Management (Claude Code CLI)

### Managing MCP Servers

```bash
# List all configured MCP servers
claude mcp list

# Get detailed information about a specific server
claude mcp get cnc-gcode-sender

# Remove an MCP server
claude mcp remove cnc-gcode-sender

# Add server to different scopes
claude mcp add --scope local cnc-gcode-sender node /path/to/server.js    # Local only
claude mcp add --scope project cnc-gcode-sender node /path/to/server.js  # Project-wide
claude mcp add --scope user cnc-gcode-sender node /path/to/server.js     # User-wide
```

### Configuration Scopes

- **Local scope**: Private to your current session
- **Project scope**: Shared via `.mcp.json` file (team-wide)
- **User scope**: Available across all your projects

### Environment Variables

```bash
# Add with environment variables
claude mcp add cnc-gcode-sender node server.js -e VAR1=value1 -e VAR2=value2

# Common CNC API environment variables
claude mcp add cnc-gcode-sender node server.js \
  -e CNC_API_BASE_URL=http://localhost:3000 \
  -e DEBUG=true
```

## Configuration Options

The server can be configured using environment variables:

- `CNC_API_BASE_URL`: Base URL of the CNC API server (default: http://localhost:3000)

## Standalone Usage (Optional)

You can also run the MCP server standalone for testing:

```bash
cd /Users/tylerhenry/Desktop/whttlr/api/docs/mcp
node server.js
```

## Troubleshooting

**MCP tools not appearing in Claude:**
1. Verify the configuration file path is correct for your OS
2. Check that the JSON syntax is valid
3. Ensure the server.js path in the config is correct
4. Restart Claude Desktop completely
5. Make sure the CNC API is running on localhost:3000

**Connection errors:**
1. Verify the CNC API is running: `curl http://localhost:3000/api/v1/health`
2. Check that no firewall is blocking localhost connections
3. Ensure the API server started without errors

## Generated Information

- **Generated on:** 2025-06-30T11:54:22.076Z
- **Source:** CNC G-code Sender API routes
- **Tools count:** 13
- **API Base URL:** http://localhost:3000
