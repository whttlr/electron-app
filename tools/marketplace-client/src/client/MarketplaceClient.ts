import fetch from 'node-fetch'
import { ConfigManager } from '../config/ConfigManager'
import { AuthManager } from '../auth/AuthManager'
import { Logger } from '../utils/Logger'

export interface PluginInfo {
  name: string
  version: string
  description: string
  author: {
    name: string
    email: string
    organization?: string
  }
  publishedAt: string
  downloads: number
  rating: number
  ratingCount: number
  keywords: string[]
  homepage?: string
  repository?: string
  license: string
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  readme: string
  changelog: string
  versions: PluginVersion[]
  categories: string[]
  tags: string[]
  maintainers: Author[]
  bugs?: string
  deprecated?: boolean
  deprecationMessage?: string
}

export interface PluginVersion {
  version: string
  publishedAt: string
  deprecated: boolean
  deprecationMessage?: string
  downloads: number
  integrity: string
  tarball: string
}

export interface Author {
  name: string
  email: string
  url?: string
}

export interface SearchResult {
  plugins: PluginSearchItem[]
  total: number
  offset: number
  limit: number
}

export interface PluginSearchItem {
  name: string
  version: string
  description: string
  author: Author
  downloads: number
  rating: number
  publishedAt: string
  keywords: string[]
  categories: string[]
}

export interface MarketplaceConfig {
  registryUrl: string
  timeout: number
  retries: number
  userAgent: string
}

export class MarketplaceClient {
  private config: MarketplaceConfig
  private authManager: AuthManager
  private logger: Logger

  constructor(options?: Partial<MarketplaceConfig>) {
    const configManager = new ConfigManager()
    this.config = {
      registryUrl: 'https://registry.cnc-jog-controls.com',
      timeout: 30000,
      retries: 3,
      userAgent: 'cnc-marketplace-client/1.0.0',
      ...configManager.get('marketplace'),
      ...options
    }
    
    this.authManager = new AuthManager()
    this.logger = new Logger()
  }

  /**
   * Get detailed information about a plugin
   */
  async getPluginInfo(pluginName: string, version?: string): Promise<PluginInfo> {
    const url = version 
      ? `${this.config.registryUrl}/plugins/${pluginName}/${version}`
      : `${this.config.registryUrl}/plugins/${pluginName}`

    try {
      const response = await this.makeRequest(url)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Plugin '${pluginName}' not found`)
        }
        throw new Error(`Failed to fetch plugin info: ${response.statusText}`)
      }

      const pluginInfo = await response.json() as PluginInfo
      return pluginInfo

    } catch (error) {
      this.logger.error(`Failed to get plugin info for ${pluginName}:`, error.message)
      throw error
    }
  }

  /**
   * Search for plugins in the marketplace
   */
  async searchPlugins(query: string, options: {
    limit?: number
    offset?: number
    sort?: string
    category?: string
    tags?: string[]
  } = {}): Promise<SearchResult> {
    const params = new URLSearchParams({
      q: query,
      limit: (options.limit || 20).toString(),
      offset: (options.offset || 0).toString(),
      sort: options.sort || 'downloads'
    })

    if (options.category) {
      params.append('category', options.category)
    }

    if (options.tags && options.tags.length > 0) {
      params.append('tags', options.tags.join(','))
    }

    const url = `${this.config.registryUrl}/search?${params}`

    try {
      const response = await this.makeRequest(url)
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const searchResult = await response.json() as SearchResult
      return searchResult

    } catch (error) {
      this.logger.error('Search failed:', error.message)
      throw error
    }
  }

  /**
   * Get plugin download URL
   */
  async getDownloadUrl(pluginName: string, version?: string): Promise<string> {
    const pluginInfo = await this.getPluginInfo(pluginName, version)
    const targetVersion = version || pluginInfo.version
    const versionInfo = pluginInfo.versions.find(v => v.version === targetVersion)
    
    if (!versionInfo) {
      throw new Error(`Version ${targetVersion} not found for plugin ${pluginName}`)
    }

    return versionInfo.tarball
  }

  /**
   * Check if plugin exists
   */
  async pluginExists(pluginName: string, version?: string): Promise<boolean> {
    try {
      await this.getPluginInfo(pluginName, version)
      return true
    } catch (error) {
      if (error.message.includes('not found')) {
        return false
      }
      throw error
    }
  }

  /**
   * Get plugin versions
   */
  async getPluginVersions(pluginName: string): Promise<PluginVersion[]> {
    const pluginInfo = await this.getPluginInfo(pluginName)
    return pluginInfo.versions
  }

  /**
   * Get latest version of a plugin
   */
  async getLatestVersion(pluginName: string): Promise<string> {
    const pluginInfo = await this.getPluginInfo(pluginName)
    return pluginInfo.version
  }

  /**
   * Publish a plugin to the marketplace
   */
  async publishPlugin(packageData: Buffer, options: {
    tag?: string
    access?: 'public' | 'private'
    force?: boolean
  } = {}): Promise<{ success: boolean; version: string; url: string }> {
    const token = await this.authManager.getToken()
    if (!token) {
      throw new Error('Authentication required. Please login first.')
    }

    const url = `${this.config.registryUrl}/publish`
    const formData = new FormData()
    formData.append('package', new Blob([packageData]), 'package.tgz')
    formData.append('tag', options.tag || 'latest')
    formData.append('access', options.access || 'public')
    
    if (options.force) {
      formData.append('force', 'true')
    }

    try {
      const response = await this.makeRequest(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `Publish failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result

    } catch (error) {
      this.logger.error('Publish failed:', error.message)
      throw error
    }
  }

  /**
   * Unpublish a plugin from the marketplace
   */
  async unpublishPlugin(pluginName: string, version?: string): Promise<void> {
    const token = await this.authManager.getToken()
    if (!token) {
      throw new Error('Authentication required. Please login first.')
    }

    const url = version
      ? `${this.config.registryUrl}/plugins/${pluginName}/versions/${version}`
      : `${this.config.registryUrl}/plugins/${pluginName}`

    try {
      const response = await this.makeRequest(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `Unpublish failed: ${response.statusText}`)
      }

    } catch (error) {
      this.logger.error('Unpublish failed:', error.message)
      throw error
    }
  }

  /**
   * Deprecate a plugin version
   */
  async deprecatePlugin(pluginName: string, options: {
    version?: string
    message?: string
  } = {}): Promise<void> {
    const token = await this.authManager.getToken()
    if (!token) {
      throw new Error('Authentication required. Please login first.')
    }

    const url = options.version
      ? `${this.config.registryUrl}/plugins/${pluginName}/versions/${options.version}/deprecate`
      : `${this.config.registryUrl}/plugins/${pluginName}/deprecate`

    try {
      const response = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: options.message || 'This plugin version has been deprecated'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `Deprecation failed: ${response.statusText}`)
      }

    } catch (error) {
      this.logger.error('Deprecation failed:', error.message)
      throw error
    }
  }

  /**
   * Get marketplace statistics
   */
  async getStats(): Promise<{
    totalPlugins: number
    totalDownloads: number
    recentPlugins: PluginSearchItem[]
    popularPlugins: PluginSearchItem[]
    categories: { name: string; count: number }[]
  }> {
    const url = `${this.config.registryUrl}/stats`

    try {
      const response = await this.makeRequest(url)
      
      if (!response.ok) {
        throw new Error(`Failed to get stats: ${response.statusText}`)
      }

      const stats = await response.json()
      return stats

    } catch (error) {
      this.logger.error('Failed to get marketplace stats:', error.message)
      throw error
    }
  }

  /**
   * Make authenticated HTTP request with retry logic
   */
  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const requestOptions: RequestInit = {
      timeout: this.config.timeout,
      headers: {
        'User-Agent': this.config.userAgent,
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    }

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions)
        return response

      } catch (error) {
        lastError = error
        
        if (attempt < this.config.retries) {
          const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
          this.logger.debug(`Request failed (attempt ${attempt}/${this.config.retries}), retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error('Request failed after all retries')
  }
}