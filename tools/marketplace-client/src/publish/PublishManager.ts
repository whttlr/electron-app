import fs from 'fs-extra'
import path from 'path'
import crypto from 'crypto'
import archiver from 'archiver'
import { MarketplaceClient } from '../client/MarketplaceClient'
import { AuthManager } from '../auth/AuthManager'
import { ConfigManager } from '../config/ConfigManager'
import { Logger } from '../utils/Logger'

export interface PublishOptions {
  tag?: string
  public?: boolean
  dryRun?: boolean
  force?: boolean
  skipValidation?: boolean
}

export interface UnpublishOptions {
  version?: string
  force?: boolean
}

export interface DeprecateOptions {
  version?: string
  message?: string
}

export interface PackageMetadata {
  name: string
  version: string
  description: string
  author: string | { name: string; email?: string }
  license: string
  keywords: string[]
  homepage?: string
  repository?: string
  bugs?: string
  main: string
  files: string[]
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  peerDependencies: Record<string, string>
  engines: Record<string, string>
  cncPlugin: {
    apiVersion: string
    category: string
    permissions: string[]
    icon?: string
    displayName?: string
    description?: string
  }
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export class PublishManager {
  private client: MarketplaceClient
  private authManager: AuthManager
  private configManager: ConfigManager
  private logger: Logger

  constructor() {
    this.client = new MarketplaceClient()
    this.authManager = new AuthManager()
    this.configManager = new ConfigManager()
    this.logger = new Logger()
  }

  /**
   * Publish a plugin to the marketplace
   */
  async publish(pluginPath: string, options: PublishOptions = {}): Promise<void> {
    try {
      this.logger.info('📦 Preparing plugin for publication...')

      // Resolve plugin path
      const resolvedPath = path.resolve(pluginPath)
      if (!await fs.pathExists(resolvedPath)) {
        throw new Error(`Plugin path does not exist: ${resolvedPath}`)
      }

      // Load and validate package metadata
      const metadata = await this.loadPackageMetadata(resolvedPath)
      
      if (!options.skipValidation) {
        const validation = await this.validatePackage(resolvedPath, metadata)
        if (!validation.valid) {
          this.logger.error('❌ Package validation failed:')
          validation.errors.forEach(error => this.logger.error(`  • ${error}`))
          throw new Error('Package validation failed')
        }

        if (validation.warnings.length > 0) {
          this.logger.warn('⚠️  Package validation warnings:')
          validation.warnings.forEach(warning => this.logger.warn(`  • ${warning}`))
        }
      }

      // Check authentication
      if (!await this.authManager.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.')
      }

      // Check if version already exists
      if (!options.force) {
        const exists = await this.client.pluginExists(metadata.name, metadata.version)
        if (exists) {
          throw new Error(`Version ${metadata.version} of ${metadata.name} already exists. Use --force to overwrite.`)
        }
      }

      // Create package archive
      this.logger.info('📁 Creating package archive...')
      const packageBuffer = await this.createPackageArchive(resolvedPath, metadata)

      // Dry run check
      if (options.dryRun) {
        this.logger.info('📋 Dry run: Package would be published successfully')
        this.logger.info(`   Name: ${metadata.name}`)
        this.logger.info(`   Version: ${metadata.version}`)
        this.logger.info(`   Size: ${this.formatBytes(packageBuffer.length)}`)
        this.logger.info(`   Tag: ${options.tag || 'latest'}`)
        this.logger.info(`   Access: ${options.public ? 'public' : 'private'}`)
        return
      }

      // Publish to marketplace
      this.logger.info('🚀 Publishing to marketplace...')
      const result = await this.client.publishPlugin(packageBuffer, {
        tag: options.tag || 'latest',
        access: options.public ? 'public' : 'private',
        force: options.force
      })

      this.logger.info(`✅ Successfully published ${metadata.name}@${metadata.version}`)
      this.logger.info(`📊 Package URL: ${result.url}`)

      // Update local publish history
      await this.updatePublishHistory(metadata, result)

    } catch (error) {
      this.logger.error('Publication failed:', error.message)
      throw error
    }
  }

  /**
   * Unpublish a plugin from the marketplace
   */
  async unpublish(pluginName: string, options: UnpublishOptions = {}): Promise<void> {
    try {
      // Check authentication
      if (!await this.authManager.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.')
      }

      // Confirm unpublish action
      if (!options.force) {
        const confirmed = await this.confirmUnpublish(pluginName, options.version)
        if (!confirmed) {
          this.logger.info('Unpublish cancelled')
          return
        }
      }

      // Unpublish from marketplace
      await this.client.unpublishPlugin(pluginName, options.version)

      const target = options.version ? `${pluginName}@${options.version}` : pluginName
      this.logger.info(`✅ Successfully unpublished ${target}`)

    } catch (error) {
      this.logger.error('Unpublish failed:', error.message)
      throw error
    }
  }

  /**
   * Deprecate a plugin version
   */
  async deprecate(pluginName: string, options: DeprecateOptions = {}): Promise<void> {
    try {
      // Check authentication
      if (!await this.authManager.isAuthenticated()) {
        throw new Error('Authentication required. Please login first.')
      }

      // Deprecate plugin
      await this.client.deprecatePlugin(pluginName, {
        version: options.version,
        message: options.message || 'This plugin version has been deprecated'
      })

      const target = options.version ? `${pluginName}@${options.version}` : pluginName
      this.logger.info(`✅ Successfully deprecated ${target}`)

    } catch (error) {
      this.logger.error('Deprecation failed:', error.message)
      throw error
    }
  }

  /**
   * Load package metadata from package.json
   */
  private async loadPackageMetadata(pluginPath: string): Promise<PackageMetadata> {
    const packageJsonPath = path.join(pluginPath, 'package.json')
    
    if (!await fs.pathExists(packageJsonPath)) {
      throw new Error('package.json not found in plugin directory')
    }

    try {
      const packageJson = await fs.readJson(packageJsonPath)
      
      // Validate required fields
      const required = ['name', 'version', 'description', 'main', 'author', 'license']
      for (const field of required) {
        if (!packageJson[field]) {
          throw new Error(`Missing required field in package.json: ${field}`)
        }
      }

      // Validate CNC plugin specific fields
      if (!packageJson.cncPlugin) {
        throw new Error('Missing cncPlugin configuration in package.json')
      }

      const cncRequired = ['apiVersion', 'category', 'permissions']
      for (const field of cncRequired) {
        if (!packageJson.cncPlugin[field]) {
          throw new Error(`Missing required cncPlugin field: ${field}`)
        }
      }

      return packageJson as PackageMetadata

    } catch (error) {
      if (error.message.includes('JSON')) {
        throw new Error('Invalid package.json format')
      }
      throw error
    }
  }

  /**
   * Validate package before publishing
   */
  private async validatePackage(pluginPath: string, metadata: PackageMetadata): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate package name
    if (!/^[@a-z0-9][a-z0-9-_]*[a-z0-9]$/i.test(metadata.name)) {
      errors.push('Package name contains invalid characters')
    }

    // Validate version format
    const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?$/
    if (!semverRegex.test(metadata.version)) {
      errors.push('Version must follow semantic versioning (x.y.z)')
    }

    // Check main file exists
    const mainFile = path.join(pluginPath, metadata.main)
    if (!await fs.pathExists(mainFile)) {
      errors.push(`Main file not found: ${metadata.main}`)
    }

    // Validate plugin category
    const validCategories = ['machine-control', 'visualization', 'utility', 'workflow', 'debugging']
    if (!validCategories.includes(metadata.cncPlugin.category)) {
      warnings.push(`Unknown plugin category: ${metadata.cncPlugin.category}`)
    }

    // Check for README
    const readmePath = path.join(pluginPath, 'README.md')
    if (!await fs.pathExists(readmePath)) {
      warnings.push('README.md file not found')
    }

    // Check for LICENSE
    const licensePath = path.join(pluginPath, 'LICENSE')
    if (!await fs.pathExists(licensePath)) {
      warnings.push('LICENSE file not found')
    }

    // Validate file list
    if (metadata.files && metadata.files.length > 0) {
      for (const file of metadata.files) {
        const filePath = path.join(pluginPath, file)
        if (!await fs.pathExists(filePath)) {
          warnings.push(`File listed in files array not found: ${file}`)
        }
      }
    }

    // Check package size
    const stats = await this.calculatePackageSize(pluginPath)
    if (stats.totalSize > 50 * 1024 * 1024) { // 50MB
      warnings.push(`Package is large (${this.formatBytes(stats.totalSize)}), consider reducing size`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Create package archive
   */
  private async createPackageArchive(pluginPath: string, metadata: PackageMetadata): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      const archive = archiver('tar', {
        gzip: true,
        gzipOptions: {
          level: 9,
          memLevel: 9
        }
      })

      archive.on('data', (chunk: Buffer) => chunks.push(chunk))
      archive.on('end', () => resolve(Buffer.concat(chunks)))
      archive.on('error', reject)

      // Add files to archive
      if (metadata.files && metadata.files.length > 0) {
        // Use files array if specified
        for (const file of metadata.files) {
          const filePath = path.join(pluginPath, file)
          if (fs.existsSync(filePath)) {
            if (fs.statSync(filePath).isDirectory()) {
              archive.directory(filePath, file)
            } else {
              archive.file(filePath, { name: file })
            }
          }
        }
      } else {
        // Default file inclusion
        archive.file(path.join(pluginPath, 'package.json'), { name: 'package.json' })
        
        // Add common files
        const commonFiles = ['README.md', 'LICENSE', 'CHANGELOG.md', 'index.js', 'index.ts']
        for (const file of commonFiles) {
          const filePath = path.join(pluginPath, file)
          if (await fs.pathExists(filePath)) {
            archive.file(filePath, { name: file })
          }
        }
        
        // Add source directories
        const sourceDirs = ['src', 'lib', 'dist']
        for (const dir of sourceDirs) {
          const dirPath = path.join(pluginPath, dir)
          if (await fs.pathExists(dirPath)) {
            archive.directory(dirPath, dir)
          }
        }
      }

      archive.finalize()
    })
  }

  /**
   * Calculate package size statistics
   */
  private async calculatePackageSize(pluginPath: string): Promise<{
    totalSize: number
    fileCount: number
  }> {
    let totalSize = 0
    let fileCount = 0

    const calculateDir = async (dirPath: string) => {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        
        // Skip node_modules and other common excludes
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.DS_Store') {
          continue
        }
        
        if (entry.isDirectory()) {
          await calculateDir(fullPath)
        } else {
          const stats = await fs.stat(fullPath)
          totalSize += stats.size
          fileCount++
        }
      }
    }

    await calculateDir(pluginPath)
    
    return { totalSize, fileCount }
  }

  /**
   * Confirm unpublish action with user
   */
  private async confirmUnpublish(pluginName: string, version?: string): Promise<boolean> {
    const inquirer = require('inquirer')
    const target = version ? `${pluginName}@${version}` : `all versions of ${pluginName}`
    
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to unpublish ${target}? This action cannot be undone.`,
      default: false
    }])
    
    return confirm
  }

  /**
   * Update local publish history
   */
  private async updatePublishHistory(metadata: PackageMetadata, result: any): Promise<void> {
    const history = await this.configManager.get('publishHistory') || []
    
    history.unshift({
      name: metadata.name,
      version: metadata.version,
      publishedAt: new Date().toISOString(),
      tag: result.tag || 'latest',
      url: result.url
    })

    // Keep only last 50 entries
    if (history.length > 50) {
      history.splice(50)
    }

    await this.configManager.set('publishHistory', history)
  }

  /**
   * Format bytes for human readable display
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }
}