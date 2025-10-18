#!/usr/bin/env node

/**
 * Generated MCP Server for CNC G-code Sender API
 * 
 * This server provides MCP (Model Context Protocol) tools for interacting
 * with the CNC G-code Sender API endpoints.
 * 
 * Generated on: 2025-06-30T11:54:22.076Z
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class CNCMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'cnc-gcode-sender',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.baseUrl = process.env.CNC_API_BASE_URL || 'http://localhost:3000';
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
                    "name": "connection_ports",
                    "description": "[Connection] Get Status\n\nEndpoint: GET /ports\nTags: Connection",
                    "inputSchema": {
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
          },
          {
                    "name": "files_get_index",
                    "description": "[Files] files endpoint\n\nEndpoint: GET /\nTags: Files",
                    "inputSchema": {
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
          },
          {
                    "name": "files_get_index",
                    "description": "[Files] Get File Info\n\nEndpoint: GET /{filename}\nTags: Files",
                    "inputSchema": {
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
          },
          {
                    "name": "files_download",
                    "description": "[Files] files endpoint\n\nEndpoint: GET /{filename}/download\nTags: Files",
                    "inputSchema": {
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
          },
          {
                    "name": "files_post_validate",
                    "description": "[Files] files endpoint\n\nEndpoint: POST /{filename}/validate\nTags: Files",
                    "inputSchema": {
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
          },
          {
                    "name": "gcode_post_execute",
                    "description": "[Gcode] Get Execution Queue\n\nEndpoint: POST /execute\nTags: Gcode",
                    "inputSchema": {
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
          },
          {
                    "name": "health_help",
                    "description": "[Health] Get Help\n\nEndpoint: GET /help\nTags: Health",
                    "inputSchema": {
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
          },
          {
                    "name": "machine_status",
                    "description": "[Machine] Get Machine Status\n\nEndpoint: GET /status\nTags: Machine",
                    "inputSchema": {
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
          },
          {
                    "name": "presets_get_index",
                    "description": "[Presets] presets endpoint\n\nEndpoint: GET /\nTags: Presets",
                    "inputSchema": {
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
          },
          {
                    "name": "presets_get_index",
                    "description": "[Presets] Get Preset Info\n\nEndpoint: GET /{presetName}\nTags: Presets",
                    "inputSchema": {
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
          },
          {
                    "name": "presets_post_execute",
                    "description": "[Presets] presets endpoint\n\nEndpoint: POST /{presetName}/execute\nTags: Presets",
                    "inputSchema": {
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
          },
          {
                    "name": "presets_post_validate",
                    "description": "[Presets] presets endpoint\n\nEndpoint: POST /{presetName}/validate\nTags: Presets",
                    "inputSchema": {
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
          },
          {
                    "name": "main_get_index",
                    "description": "[Main] Routes\n\nEndpoint: GET /\nTags: Main",
                    "inputSchema": {
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
          }
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'connection_ports':
            return await this.connection_ports(args);
          case 'files_get_index':
            return await this.files_get_index(args);
          case 'files_get_index':
            return await this.files_get_index(args);
          case 'files_download':
            return await this.files_download(args);
          case 'files_post_validate':
            return await this.files_post_validate(args);
          case 'gcode_post_execute':
            return await this.gcode_post_execute(args);
          case 'health_help':
            return await this.health_help(args);
          case 'machine_status':
            return await this.machine_status(args);
          case 'presets_get_index':
            return await this.presets_get_index(args);
          case 'presets_get_index':
            return await this.presets_get_index(args);
          case 'presets_post_execute':
            return await this.presets_post_execute(args);
          case 'presets_post_validate':
            return await this.presets_post_validate(args);
          case 'main_get_index':
            return await this.main_get_index(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }


  /**
   * Get Status
   */
  async connection_ports(args) {
    const baseUrl = args.baseUrl || this.baseUrl;
    let path = `/ports`;
    
    // Remove undefined path parameters
    path = path.replace(/\$\{undefined\}/g, '');
    
    const body = ['POST', 'PUT', 'PATCH'].includes('GET') ? args.body : null;
    
    return await this.makeApiRequest('GET', path, body, baseUrl);
  }

  /**
   * files endpoint
   */
  async files_get_index(args) {
    const baseUrl = args.baseUrl || this.baseUrl;
    let path = `/`;
    
    // Remove undefined path parameters
    path = path.replace(/\$\{undefined\}/g, '');
    
    const body = ['POST', 'PUT', 'PATCH'].includes('GET') ? args.body : null;
    
    return await this.makeApiRequest('GET', path, body, baseUrl);
  }

  /**
   * Get File Info
   */
  async files_get_index(args) {
    const baseUrl = args.baseUrl || this.baseUrl;
    let path = `/${args.filename || '{filename}'}`;
    
    // Remove undefined path parameters
    path = path.replace(/\$\{undefined\}/g, '');
    
    const body = ['POST', 'PUT', 'PATCH'].includes('GET') ? args.body : null;
    
    return await this.makeApiRequest('GET', path, body, baseUrl);
  }

  /**
   * files endpoint
   */
  async files_download(args) {
    const baseUrl = args.baseUrl || this.baseUrl;
    let path = `/${args.filename || '{filename}'}/download`;
    
    // Remove undefined path parameters
    path = path.replace(/\$\{undefined\}/g, '');
    
    const body = ['POST', 'PUT', 'PATCH'].includes('GET') ? args.body : null;
    
    return await this.makeApiRequest('GET', path, body, baseUrl);
  }

  /**
   * files endpoint
   */
  async files_post_validate(args) {
    const baseUrl = args.baseUrl || this.baseUrl;
    let path = `/${args.filename || '{filename}'}/validate`;
    
    // Remove undefined path parameters
    path = path.replace(/\$\{undefined\}/g, '');
    
    const body = ['POST', 'PUT', 'PATCH'].includes('POST') ? args.body : null;
    
    return await this.makeApiRequest('POST', path, body, baseUrl);
  }

  /**
   * Get Execution Queue
   */
  async gcode_post_execute(args) {
    const baseUrl = args.baseUrl || this.baseUrl;
    let path = `/execute`;
    
    // Remove undefined path parameters
    path = path.replace(/\$\{undefined\}/g, '');
    
    const body = ['POST', 'PUT', 'PATCH'].includes('POST') ? args.body : null;
    
    return await this.makeApiRequest('POST', path, body, baseUrl);
  }

  /**
   * Get Help
   */
  async health_help(args) {
    const baseUrl = args.baseUrl || this.baseUrl;
    let path = `/help`;
    
    // Remove undefined path parameters
    path = path.replace(/\$\{undefined\}/g, '');
    
    const body = ['POST', 'PUT', 'PATCH'].includes('GET') ? args.body : null;
    
    return await this.makeApiRequest('GET', path, body, baseUrl);
  }

  /**
   * Get Machine Status
   */
  async machine_status(args) {
    const baseUrl = args.baseUrl || this.baseUrl;
    let path = `/status`;
    
    // Remove undefined path parameters
    path = path.replace(/\$\{undefined\}/g, '');
    
    const body = ['POST', 'PUT', 'PATCH'].includes('GET') ? args.body : null;
    
    return await this.makeApiRequest('GET', path, body, baseUrl);
  }

  /**
   * presets endpoint
   */
  async presets_get_index(args) {
    const baseUrl = args.baseUrl || this.baseUrl;
    let path = `/`;
    
    // Remove undefined path parameters
    path = path.replace(/\$\{undefined\}/g, '');
    
    const body = ['POST', 'PUT', 'PATCH'].includes('GET') ? args.body : null;
    
    return await this.makeApiRequest('GET', path, body, baseUrl);
  }

  /**
   * Get Preset Info
   */
  async presets_get_index(args) {
    const baseUrl = args.baseUrl || this.baseUrl;
    let path = `/${args.presetName || '{presetName}'}`;
    
    // Remove undefined path parameters
    path = path.replace(/\$\{undefined\}/g, '');
    
    const body = ['POST', 'PUT', 'PATCH'].includes('GET') ? args.body : null;
    
    return await this.makeApiRequest('GET', path, body, baseUrl);
  }

  /**
   * presets endpoint
   */
  async presets_post_execute(args) {
    const baseUrl = args.baseUrl || this.baseUrl;
    let path = `/${args.presetName || '{presetName}'}/execute`;
    
    // Remove undefined path parameters
    path = path.replace(/\$\{undefined\}/g, '');
    
    const body = ['POST', 'PUT', 'PATCH'].includes('POST') ? args.body : null;
    
    return await this.makeApiRequest('POST', path, body, baseUrl);
  }

  /**
   * presets endpoint
   */
  async presets_post_validate(args) {
    const baseUrl = args.baseUrl || this.baseUrl;
    let path = `/${args.presetName || '{presetName}'}/validate`;
    
    // Remove undefined path parameters
    path = path.replace(/\$\{undefined\}/g, '');
    
    const body = ['POST', 'PUT', 'PATCH'].includes('POST') ? args.body : null;
    
    return await this.makeApiRequest('POST', path, body, baseUrl);
  }

  /**
   * Routes
   */
  async main_get_index(args) {
    const baseUrl = args.baseUrl || this.baseUrl;
    let path = `/`;
    
    // Remove undefined path parameters
    path = path.replace(/\$\{undefined\}/g, '');
    
    const body = ['POST', 'PUT', 'PATCH'].includes('GET') ? args.body : null;
    
    return await this.makeApiRequest('GET', path, body, baseUrl);
  }


  /**
   * Make HTTP request to CNC API
   */
  async makeApiRequest(method, path, body = null, baseUrl = null) {
    const url = `${baseUrl || this.baseUrl}${path}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: response.status,
              statusText: response.statusText,
              data: data
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('CNC MCP server running on stdio');
  }
}

const server = new CNCMCPServer();
server.run().catch(console.error);
