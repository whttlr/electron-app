/**
 * HTTP API Integration Adapter
 */

import { IntegrationAdapter, AdapterType, AdapterStatus, ConnectionResult, AdapterOperation, AdapterResult, AdapterError } from '../IntegrationFramework'

export interface HttpApiConfig {
  baseUrl: string
  timeout: number
  retries: number
  rateLimit?: {
    requests: number
    window: number
  }
  defaultHeaders?: Record<string, string>
}

export interface HttpApiCredentials {
  type: 'none' | 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth2'
  apiKey?: string
  token?: string
  username?: string
  password?: string
  oauth?: {
    clientId: string
    clientSecret: string
    accessToken?: string
    refreshToken?: string
  }
}

/**
 * HTTP API Integration Adapter
 * Provides standardized HTTP operations for REST APIs
 */
export class HttpApiAdapter implements IntegrationAdapter {
  id = 'http_api'
  name = 'HTTP API Adapter'
  type: AdapterType = 'http_api'
  version = '1.0.0'
  description = 'HTTP REST API integration adapter'

  private config: HttpApiConfig | null = null
  private credentials: HttpApiCredentials | null = null
  private connected = false
  private requestCount = 0
  private errorCount = 0
  private lastActivity = new Date()
  private rateLimitState: { count: number; resetTime: number } = { count: 0, resetTime: 0 }
  private logger: any

  constructor(logger?: any) {
    this.logger = logger || console
  }

  async initialize(config: HttpApiConfig): Promise<void> {
    this.config = config
    this.logger.debug('HttpApiAdapter initialized')
  }

  async shutdown(): Promise<void> {
    try {
      this.connected = false
      this.logger.debug('HttpApiAdapter shutdown complete')
    } catch (error) {
      this.logger.error('Error during HttpApiAdapter shutdown:', error)
      throw error
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.connected || !this.config) {
        return false
      }

      // Simple health check request
      const result = await this.execute({
        type: 'get',
        parameters: { 
          endpoint: '/health',
          timeout: 5000
        }
      })

      return result.success
    } catch (error) {
      return false
    }
  }

  async getStatus(): Promise<AdapterStatus> {
    return {
      connected: this.connected,
      lastActivity: this.lastActivity,
      connectionCount: this.requestCount,
      errorCount: this.errorCount,
      latency: await this.measureLatency(),
      metadata: {
        baseUrl: this.config?.baseUrl,
        rateLimitRemaining: this.getRateLimitRemaining(),
        credentialType: this.credentials?.type
      }
    }
  }

  async connect(credentials: HttpApiCredentials): Promise<ConnectionResult> {
    try {
      if (!this.config) {
        throw new Error('HTTP API adapter not initialized')
      }

      this.credentials = credentials
      
      // Test connection with a simple request
      const testResult = await this.testConnection()
      
      if (testResult.success) {
        this.connected = true
        this.lastActivity = new Date()

        this.logger.info(`Connected to HTTP API: ${this.config.baseUrl}`)

        return {
          success: true,
          connectionId: `http_${Date.now()}`,
          metadata: {
            baseUrl: this.config.baseUrl,
            credentialType: credentials.type
          }
        }
      } else {
        throw new Error(testResult.error || 'Connection test failed')
      }

    } catch (error) {
      this.errorCount++
      return {
        success: false,
        connectionId: '',
        error: error.message
      }
    }
  }

  async disconnect(): Promise<void> {
    try {
      this.connected = false
      this.credentials = null
      this.logger.info('HTTP API connection closed')
    } catch (error) {
      this.errorCount++
      this.logger.error('Error disconnecting from HTTP API:', error)
      throw error
    }
  }

  async execute(operation: AdapterOperation): Promise<AdapterResult> {
    const startTime = Date.now()

    try {
      if (!this.connected) {
        throw new Error('Not connected to HTTP API')
      }

      // Check rate limit
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded')
      }

      this.lastActivity = new Date()
      this.requestCount++

      let result: any

      switch (operation.type) {
        case 'get':
          result = await this.executeGet(operation.parameters)
          break
        
        case 'post':
          result = await this.executePost(operation.parameters)
          break
        
        case 'put':
          result = await this.executePut(operation.parameters)
          break
        
        case 'patch':
          result = await this.executePatch(operation.parameters)
          break
        
        case 'delete':
          result = await this.executeDelete(operation.parameters)
          break
        
        case 'upload':
          result = await this.executeUpload(operation.parameters)
          break
        
        case 'download':
          result = await this.executeDownload(operation.parameters)
          break

        default:
          throw new Error(`Unsupported operation type: ${operation.type}`)
      }

      return {
        success: true,
        data: result,
        metadata: {
          executionTime: Date.now() - startTime,
          operationType: operation.type,
          statusCode: result.status || 200
        }
      }

    } catch (error) {
      this.errorCount++
      
      return {
        success: false,
        error: this.createAdapterError(error),
        metadata: {
          executionTime: Date.now() - startTime,
          operationType: operation.type
        }
      }
    }
  }

  // === PRIVATE METHODS ===

  /**
   * Test API connection
   */
  private async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Try a simple GET request to root or health endpoint
      const response = await this.makeRequest('GET', '/', {}, {})
      
      return {
        success: response.status >= 200 && response.status < 400
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Execute GET request
   */
  private async executeGet(parameters: any): Promise<any> {
    const { endpoint, params, headers = {} } = parameters

    if (!endpoint) {
      throw new Error('Endpoint is required for GET request')
    }

    return await this.makeRequest('GET', endpoint, params, headers)
  }

  /**
   * Execute POST request
   */
  private async executePost(parameters: any): Promise<any> {
    const { endpoint, data, headers = {} } = parameters

    if (!endpoint) {
      throw new Error('Endpoint is required for POST request')
    }

    return await this.makeRequest('POST', endpoint, data, headers)
  }

  /**
   * Execute PUT request
   */
  private async executePut(parameters: any): Promise<any> {
    const { endpoint, data, headers = {} } = parameters

    if (!endpoint) {
      throw new Error('Endpoint is required for PUT request')
    }

    return await this.makeRequest('PUT', endpoint, data, headers)
  }

  /**
   * Execute PATCH request
   */
  private async executePatch(parameters: any): Promise<any> {
    const { endpoint, data, headers = {} } = parameters

    if (!endpoint) {
      throw new Error('Endpoint is required for PATCH request')
    }

    return await this.makeRequest('PATCH', endpoint, data, headers)
  }

  /**
   * Execute DELETE request
   */
  private async executeDelete(parameters: any): Promise<any> {
    const { endpoint, headers = {} } = parameters

    if (!endpoint) {
      throw new Error('Endpoint is required for DELETE request')
    }

    return await this.makeRequest('DELETE', endpoint, {}, headers)
  }

  /**
   * Execute file upload
   */
  private async executeUpload(parameters: any): Promise<any> {
    const { endpoint, file, data = {}, headers = {} } = parameters

    if (!endpoint || !file) {
      throw new Error('Endpoint and file are required for upload')
    }

    this.logger.debug(`Uploading file to: ${endpoint}`)

    // Mock file upload
    return {
      status: 200,
      data: {
        success: true,
        fileId: `file_${Date.now()}`,
        filename: file.name || 'uploaded_file',
        size: file.size || 1024,
        url: `${this.config?.baseUrl}${endpoint}/${Date.now()}`
      },
      headers: {}
    }
  }

  /**
   * Execute file download
   */
  private async executeDownload(parameters: any): Promise<any> {
    const { endpoint, headers = {} } = parameters

    if (!endpoint) {
      throw new Error('Endpoint is required for download')
    }

    this.logger.debug(`Downloading from: ${endpoint}`)

    // Mock file download
    return {
      status: 200,
      data: Buffer.from('Mock file content'),
      headers: {
        'content-type': 'application/octet-stream',
        'content-length': '17'
      },
      filename: 'downloaded_file.txt'
    }
  }

  /**
   * Make HTTP request
   */
  private async makeRequest(method: string, endpoint: string, data: any, headers: Record<string, string>): Promise<any> {
    if (!this.config) {
      throw new Error('HTTP API adapter not configured')
    }

    const url = `${this.config.baseUrl}${endpoint}`
    const requestHeaders = {
      ...this.config.defaultHeaders,
      ...headers,
      ...this.getAuthHeaders()
    }

    this.logger.debug(`${method} ${url}`)

    // Mock HTTP request
    // In production, would use actual HTTP client like axios or fetch
    await new Promise(resolve => setTimeout(resolve, 100)) // Simulate network delay

    // Simulate different response scenarios
    const scenarios = [
      { status: 200, data: { success: true, result: data, timestamp: new Date() } },
      { status: 201, data: { created: true, id: Math.floor(Math.random() * 10000) } },
      { status: 404, data: { error: 'Not found' } },
      { status: 500, data: { error: 'Internal server error' } }
    ]

    // Mostly successful responses
    const scenario = Math.random() < 0.9 ? scenarios[0] : scenarios[Math.floor(Math.random() * scenarios.length)]

    if (scenario.status >= 400) {
      throw new Error(`HTTP ${scenario.status}: ${scenario.data.error}`)
    }

    return {
      status: scenario.status,
      statusText: 'OK',
      data: scenario.data,
      headers: {
        'content-type': 'application/json',
        'x-request-id': `req_${Date.now()}`
      }
    }
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    if (!this.credentials) {
      return {}
    }

    switch (this.credentials.type) {
      case 'api_key':
        return {
          'X-API-Key': this.credentials.apiKey || ''
        }

      case 'bearer_token':
        return {
          'Authorization': `Bearer ${this.credentials.token || ''}`
        }

      case 'basic_auth':
        const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64')
        return {
          'Authorization': `Basic ${auth}`
        }

      case 'oauth2':
        return {
          'Authorization': `Bearer ${this.credentials.oauth?.accessToken || ''}`
        }

      default:
        return {}
    }
  }

  /**
   * Check rate limit
   */
  private checkRateLimit(): boolean {
    if (!this.config?.rateLimit) {
      return true
    }

    const now = Date.now()
    
    // Reset if window has passed
    if (now > this.rateLimitState.resetTime) {
      this.rateLimitState.count = 0
      this.rateLimitState.resetTime = now + this.config.rateLimit.window
    }

    // Check if within limit
    if (this.rateLimitState.count >= this.config.rateLimit.requests) {
      return false
    }

    this.rateLimitState.count++
    return true
  }

  /**
   * Get remaining rate limit
   */
  private getRateLimitRemaining(): number {
    if (!this.config?.rateLimit) {
      return -1
    }

    return Math.max(0, this.config.rateLimit.requests - this.rateLimitState.count)
  }

  /**
   * Measure API latency
   */
  private async measureLatency(): Promise<number> {
    if (!this.connected || !this.config) {
      return -1
    }

    try {
      const startTime = Date.now()
      await this.makeRequest('GET', '/ping', {}, {})
      return Date.now() - startTime
    } catch (error) {
      return -1
    }
  }

  /**
   * Create adapter error
   */
  private createAdapterError(error: any): AdapterError {
    let code = 'HTTP_ERROR'
    let retryable = false

    if (error.message?.includes('timeout')) {
      code = 'TIMEOUT'
      retryable = true
    } else if (error.message?.includes('Rate limit')) {
      code = 'RATE_LIMIT'
      retryable = true
    } else if (error.message?.includes('500')) {
      code = 'SERVER_ERROR'
      retryable = true
    } else if (error.message?.includes('401')) {
      code = 'UNAUTHORIZED'
      retryable = false
    } else if (error.message?.includes('403')) {
      code = 'FORBIDDEN'
      retryable = false
    } else if (error.message?.includes('404')) {
      code = 'NOT_FOUND'
      retryable = false
    }

    return {
      code,
      message: error.message || error.toString(),
      details: error.response || error.stack,
      retryable
    }
  }
}