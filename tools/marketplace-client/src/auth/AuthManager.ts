import inquirer from 'inquirer'
import jwt from 'jsonwebtoken'
import { ConfigManager } from '../config/ConfigManager'
import { Logger } from '../utils/Logger'

export interface UserInfo {
  username: string
  email: string
  organization?: string
  memberSince: string
  permissions: string[]
  plan: 'free' | 'pro' | 'enterprise'
}

export interface AuthConfig {
  defaultRegistry: string
  tokenStorage: 'file' | 'keychain'
  sessionTimeout: number
  autoRefresh: boolean
}

export interface LoginOptions {
  registry?: string
  username?: string
  password?: string
  token?: string
  interactive?: boolean
}

export class AuthManager {
  private config: AuthConfig
  private configManager: ConfigManager
  private logger: Logger

  constructor() {
    this.configManager = new ConfigManager()
    this.config = {
      defaultRegistry: 'https://registry.cnc-jog-controls.com',
      tokenStorage: 'file',
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      autoRefresh: true,
      ...this.configManager.get('auth')
    }
    this.logger = new Logger()
  }

  /**
   * Interactive login flow
   */
  async interactiveLogin(username?: string, registry?: string): Promise<void> {
    const targetRegistry = registry || this.config.defaultRegistry
    
    this.logger.info(`🔐 Logging in to ${targetRegistry}`)

    // Get credentials from user
    const credentials = await this.promptCredentials(username)
    
    // Authenticate with server
    await this.authenticateWithCredentials(credentials, targetRegistry)
  }

  /**
   * Login with provided token
   */
  async loginWithToken(token: string, registry?: string): Promise<void> {
    const targetRegistry = registry || this.config.defaultRegistry
    
    try {
      // Validate token format
      if (!this.isValidTokenFormat(token)) {
        throw new Error('Invalid token format')
      }

      // Verify token with server
      const userInfo = await this.verifyToken(token, targetRegistry)
      
      // Store token and user info
      await this.storeAuthData(token, userInfo, targetRegistry)
      
      this.logger.info(`✅ Successfully logged in as ${userInfo.username}`)

    } catch (error) {
      this.logger.error('Token authentication failed:', error.message)
      throw error
    }
  }

  /**
   * Logout from registry
   */
  async logout(registry?: string): Promise<void> {
    const targetRegistry = registry || this.config.defaultRegistry
    
    try {
      // Revoke token on server if possible
      const token = await this.getStoredToken(targetRegistry)
      if (token) {
        await this.revokeToken(token, targetRegistry)
      }

      // Clear stored auth data
      await this.clearAuthData(targetRegistry)
      
      this.logger.info('✅ Successfully logged out')

    } catch (error) {
      // Still clear local data even if server revocation fails
      await this.clearAuthData(targetRegistry)
      this.logger.warn('Logout completed with warnings:', error.message)
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(registry?: string): Promise<UserInfo | null> {
    const targetRegistry = registry || this.config.defaultRegistry
    
    try {
      const token = await this.getStoredToken(targetRegistry)
      if (!token) {
        return null
      }

      // Check if token is expired
      if (this.isTokenExpired(token)) {
        if (this.config.autoRefresh) {
          await this.refreshToken(targetRegistry)
          const newToken = await this.getStoredToken(targetRegistry)
          if (!newToken) {
            return null
          }
          return await this.verifyToken(newToken, targetRegistry)
        }
        return null
      }

      return await this.verifyToken(token, targetRegistry)

    } catch (error) {
      this.logger.debug('Failed to get current user:', error.message)
      return null
    }
  }

  /**
   * Get authentication token for API requests
   */
  async getToken(registry?: string): Promise<string | null> {
    const targetRegistry = registry || this.config.defaultRegistry
    
    try {
      const token = await this.getStoredToken(targetRegistry)
      if (!token) {
        return null
      }

      // Auto-refresh if needed
      if (this.isTokenExpired(token) && this.config.autoRefresh) {
        await this.refreshToken(targetRegistry)
        return await this.getStoredToken(targetRegistry)
      }

      return token

    } catch (error) {
      this.logger.debug('Failed to get token:', error.message)
      return null
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(registry?: string): Promise<boolean> {
    const user = await this.getCurrentUser(registry)
    return user !== null
  }

  /**
   * Prompt user for credentials
   */
  private async promptCredentials(username?: string): Promise<{ username: string; password: string }> {
    const questions = []

    if (!username) {
      questions.push({
        type: 'input',
        name: 'username',
        message: 'Username or email:',
        validate: (input: string) => input.trim().length > 0 || 'Username is required'
      })
    }

    questions.push({
      type: 'password',
      name: 'password',
      message: 'Password:',
      mask: '*',
      validate: (input: string) => input.length > 0 || 'Password is required'
    })

    const answers = await inquirer.prompt(questions)
    
    return {
      username: username || answers.username,
      password: answers.password
    }
  }

  /**
   * Authenticate with username and password
   */
  private async authenticateWithCredentials(
    credentials: { username: string; password: string }, 
    registry: string
  ): Promise<void> {
    const response = await fetch(`${registry}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'cnc-marketplace-client/1.0.0'
      },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid username or password')
      } else if (response.status === 429) {
        throw new Error('Too many login attempts. Please try again later.')
      }
      throw new Error(`Authentication failed: ${response.statusText}`)
    }

    const authData = await response.json()
    
    if (!authData.token || !authData.user) {
      throw new Error('Invalid response from authentication server')
    }

    await this.storeAuthData(authData.token, authData.user, registry)
    this.logger.info(`✅ Successfully logged in as ${authData.user.username}`)
  }

  /**
   * Verify token with server
   */
  private async verifyToken(token: string, registry: string): Promise<UserInfo> {
    const response = await fetch(`${registry}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'cnc-marketplace-client/1.0.0'
      }
    })

    if (!response.ok) {
      throw new Error('Token verification failed')
    }

    const userData = await response.json()
    return userData.user
  }

  /**
   * Revoke token on server
   */
  private async revokeToken(token: string, registry: string): Promise<void> {
    try {
      await fetch(`${registry}/auth/revoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'cnc-marketplace-client/1.0.0'
        }
      })
    } catch (error) {
      // Ignore revocation errors as they're not critical
      this.logger.debug('Token revocation failed:', error.message)
    }
  }

  /**
   * Store authentication data
   */
  private async storeAuthData(token: string, user: UserInfo, registry: string): Promise<void> {
    const authData = {
      token,
      user,
      registry,
      timestamp: Date.now()
    }

    await this.configManager.set(`auth.tokens.${this.getRegistryKey(registry)}`, authData)
  }

  /**
   * Get stored token for registry
   */
  private async getStoredToken(registry: string): Promise<string | null> {
    const authData = await this.configManager.get(`auth.tokens.${this.getRegistryKey(registry)}`)
    return authData?.token || null
  }

  /**
   * Clear authentication data
   */
  private async clearAuthData(registry: string): Promise<void> {
    await this.configManager.delete(`auth.tokens.${this.getRegistryKey(registry)}`)
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any
      if (!decoded || !decoded.exp) {
        return true
      }
      
      const now = Math.floor(Date.now() / 1000)
      return decoded.exp < now
    } catch (error) {
      return true
    }
  }

  /**
   * Validate token format
   */
  private isValidTokenFormat(token: string): boolean {
    // Basic JWT format validation
    const parts = token.split('.')
    return parts.length === 3 && parts.every(part => part.length > 0)
  }

  /**
   * Refresh expired token
   */
  private async refreshToken(registry: string): Promise<void> {
    // Implementation would depend on server support for refresh tokens
    // For now, we'll require re-authentication
    await this.clearAuthData(registry)
    throw new Error('Session expired. Please login again.')
  }

  /**
   * Get registry key for storage
   */
  private getRegistryKey(registry: string): string {
    return registry.replace(/[^a-zA-Z0-9]/g, '_')
  }
}