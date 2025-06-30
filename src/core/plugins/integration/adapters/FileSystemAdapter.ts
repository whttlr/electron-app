/**
 * File System Integration Adapter
 */

import { IntegrationAdapter, AdapterType, AdapterStatus, ConnectionResult, AdapterOperation, AdapterResult, AdapterError } from '../IntegrationFramework'
import * as path from 'path'
import * as fs from 'fs/promises'

export interface FileSystemConfig {
  basePath: string
  allowedExtensions?: string[]
  maxFileSize?: number
  permissions: {
    read: boolean
    write: boolean
    delete: boolean
    create: boolean
  }
}

/**
 * File System Integration Adapter
 * Provides secure file system operations with configurable permissions
 */
export class FileSystemAdapter implements IntegrationAdapter {
  id = 'file_system'
  name = 'File System Adapter'
  type: AdapterType = 'file_system'
  version = '1.0.0'
  description = 'File system integration adapter with security controls'

  private config: FileSystemConfig | null = null
  private connected = false
  private operationCount = 0
  private errorCount = 0
  private lastActivity = new Date()
  private logger: any

  constructor(logger?: any) {
    this.logger = logger || console
  }

  async initialize(config: FileSystemConfig): Promise<void> {
    this.config = config
    this.logger.debug('FileSystemAdapter initialized')
  }

  async shutdown(): Promise<void> {
    try {
      this.connected = false
      this.logger.debug('FileSystemAdapter shutdown complete')
    } catch (error) {
      this.logger.error('Error during FileSystemAdapter shutdown:', error)
      throw error
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.connected || !this.config) {
        return false
      }

      // Check if base path is accessible
      await fs.access(this.config.basePath)
      return true
    } catch (error) {
      return false
    }
  }

  async getStatus(): Promise<AdapterStatus> {
    return {
      connected: this.connected,
      lastActivity: this.lastActivity,
      connectionCount: this.operationCount,
      errorCount: this.errorCount,
      metadata: {
        basePath: this.config?.basePath,
        permissions: this.config?.permissions,
        allowedExtensions: this.config?.allowedExtensions
      }
    }
  }

  async connect(credentials: any): Promise<ConnectionResult> {
    try {
      if (!this.config) {
        throw new Error('File system adapter not initialized')
      }

      // Verify base path exists and is accessible
      try {
        await fs.access(this.config.basePath)
        const stats = await fs.stat(this.config.basePath)
        
        if (!stats.isDirectory()) {
          throw new Error('Base path is not a directory')
        }
      } catch (error) {
        throw new Error(`Base path not accessible: ${error.message}`)
      }

      this.connected = true
      this.lastActivity = new Date()

      this.logger.info(`Connected to file system: ${this.config.basePath}`)

      return {
        success: true,
        connectionId: `fs_${Date.now()}`,
        metadata: {
          basePath: this.config.basePath,
          permissions: this.config.permissions
        }
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
      this.logger.info('File system connection closed')
    } catch (error) {
      this.errorCount++
      this.logger.error('Error disconnecting from file system:', error)
      throw error
    }
  }

  async execute(operation: AdapterOperation): Promise<AdapterResult> {
    const startTime = Date.now()

    try {
      if (!this.connected) {
        throw new Error('Not connected to file system')
      }

      this.lastActivity = new Date()
      this.operationCount++

      let result: any

      switch (operation.type) {
        case 'read':
          result = await this.executeRead(operation.parameters)
          break
        
        case 'write':
          result = await this.executeWrite(operation.parameters)
          break
        
        case 'list':
          result = await this.executeList(operation.parameters)
          break
        
        case 'delete':
          result = await this.executeDelete(operation.parameters)
          break
        
        case 'copy':
          result = await this.executeCopy(operation.parameters)
          break
        
        case 'move':
          result = await this.executeMove(operation.parameters)
          break
        
        case 'mkdir':
          result = await this.executeMkdir(operation.parameters)
          break
        
        case 'stat':
          result = await this.executeStat(operation.parameters)
          break
        
        case 'watch':
          result = await this.executeWatch(operation.parameters)
          break

        default:
          throw new Error(`Unsupported operation type: ${operation.type}`)
      }

      return {
        success: true,
        data: result,
        metadata: {
          executionTime: Date.now() - startTime,
          operationType: operation.type
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
   * Execute file read operation
   */
  private async executeRead(parameters: any): Promise<any> {
    if (!this.config?.permissions.read) {
      throw new Error('Read permission denied')
    }

    const { filePath, encoding = 'utf8', offset, length } = parameters

    if (!filePath) {
      throw new Error('File path is required for read operation')
    }

    const fullPath = this.resolvePath(filePath)
    this.validatePath(fullPath)
    this.validateFileExtension(fullPath)

    this.logger.debug(`Reading file: ${fullPath}`)

    const stats = await fs.stat(fullPath)
    
    if (!stats.isFile()) {
      throw new Error('Path is not a file')
    }

    if (this.config.maxFileSize && stats.size > this.config.maxFileSize) {
      throw new Error(`File too large: ${stats.size} > ${this.config.maxFileSize}`)
    }

    let content: string | Buffer

    if (offset !== undefined && length !== undefined) {
      // Read specific range
      const buffer = Buffer.alloc(length)
      const fileHandle = await fs.open(fullPath, 'r')
      try {
        await fileHandle.read(buffer, 0, length, offset)
        content = encoding === 'buffer' ? buffer : buffer.toString(encoding)
      } finally {
        await fileHandle.close()
      }
    } else {
      // Read entire file
      content = await fs.readFile(fullPath, encoding === 'buffer' ? undefined : encoding)
    }

    return {
      content,
      path: filePath,
      size: stats.size,
      modified: stats.mtime,
      encoding
    }
  }

  /**
   * Execute file write operation
   */
  private async executeWrite(parameters: any): Promise<any> {
    if (!this.config?.permissions.write) {
      throw new Error('Write permission denied')
    }

    const { filePath, content, encoding = 'utf8', append = false } = parameters

    if (!filePath || content === undefined) {
      throw new Error('File path and content are required for write operation')
    }

    const fullPath = this.resolvePath(filePath)
    this.validatePath(fullPath)
    this.validateFileExtension(fullPath)

    this.logger.debug(`Writing file: ${fullPath}`)

    // Check if file exists and we have permission to overwrite
    try {
      await fs.access(fullPath)
      // File exists, check write permission
      if (!this.config?.permissions.write) {
        throw new Error('Cannot overwrite existing file: write permission denied')
      }
    } catch (error) {
      // File doesn't exist, check create permission
      if (!this.config?.permissions.create) {
        throw new Error('Cannot create new file: create permission denied')
      }
    }

    // Validate content size
    const contentSize = Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content, encoding)
    if (this.config?.maxFileSize && contentSize > this.config.maxFileSize) {
      throw new Error(`Content too large: ${contentSize} > ${this.config.maxFileSize}`)
    }

    if (append) {
      await fs.appendFile(fullPath, content, encoding)
    } else {
      await fs.writeFile(fullPath, content, encoding)
    }

    const stats = await fs.stat(fullPath)

    return {
      path: filePath,
      size: stats.size,
      modified: stats.mtime,
      created: !append
    }
  }

  /**
   * Execute directory listing
   */
  private async executeList(parameters: any): Promise<any> {
    if (!this.config?.permissions.read) {
      throw new Error('Read permission denied')
    }

    const { dirPath = '', recursive = false, includeStats = false } = parameters

    const fullPath = this.resolvePath(dirPath)
    this.validatePath(fullPath)

    this.logger.debug(`Listing directory: ${fullPath}`)

    const entries = await fs.readdir(fullPath, { withFileTypes: true })
    const result = []

    for (const entry of entries) {
      const entryPath = path.join(fullPath, entry.name)
      const relativePath = path.relative(this.config!.basePath, entryPath)

      const item: any = {
        name: entry.name,
        path: relativePath,
        type: entry.isDirectory() ? 'directory' : 'file'
      }

      if (includeStats) {
        const stats = await fs.stat(entryPath)
        item.size = stats.size
        item.modified = stats.mtime
        item.created = stats.birthtime
      }

      result.push(item)

      // Recursive listing for directories
      if (recursive && entry.isDirectory()) {
        try {
          const subResult = await this.executeList({
            dirPath: relativePath,
            recursive: true,
            includeStats
          })
          result.push(...subResult.entries)
        } catch (error) {
          this.logger.warn(`Error listing subdirectory ${relativePath}:`, error)
        }
      }
    }

    return {
      path: dirPath,
      entries: result,
      count: result.length
    }
  }

  /**
   * Execute file/directory deletion
   */
  private async executeDelete(parameters: any): Promise<any> {
    if (!this.config?.permissions.delete) {
      throw new Error('Delete permission denied')
    }

    const { filePath, recursive = false } = parameters

    if (!filePath) {
      throw new Error('File path is required for delete operation')
    }

    const fullPath = this.resolvePath(filePath)
    this.validatePath(fullPath)

    this.logger.debug(`Deleting: ${fullPath}`)

    const stats = await fs.stat(fullPath)

    if (stats.isDirectory()) {
      if (recursive) {
        await fs.rm(fullPath, { recursive: true, force: true })
      } else {
        await fs.rmdir(fullPath)
      }
    } else {
      await fs.unlink(fullPath)
    }

    return {
      path: filePath,
      type: stats.isDirectory() ? 'directory' : 'file',
      deleted: true
    }
  }

  /**
   * Execute file copy operation
   */
  private async executeCopy(parameters: any): Promise<any> {
    if (!this.config?.permissions.read || !this.config?.permissions.create) {
      throw new Error('Read and create permissions required for copy operation')
    }

    const { sourcePath, targetPath, overwrite = false } = parameters

    if (!sourcePath || !targetPath) {
      throw new Error('Source and target paths are required for copy operation')
    }

    const fullSourcePath = this.resolvePath(sourcePath)
    const fullTargetPath = this.resolvePath(targetPath)
    
    this.validatePath(fullSourcePath)
    this.validatePath(fullTargetPath)
    this.validateFileExtension(fullSourcePath)
    this.validateFileExtension(fullTargetPath)

    this.logger.debug(`Copying: ${fullSourcePath} -> ${fullTargetPath}`)

    // Check if target exists
    try {
      await fs.access(fullTargetPath)
      if (!overwrite) {
        throw new Error('Target file exists and overwrite is false')
      }
    } catch (error) {
      // Target doesn't exist, which is fine
    }

    await fs.copyFile(fullSourcePath, fullTargetPath)

    const stats = await fs.stat(fullTargetPath)

    return {
      sourcePath,
      targetPath,
      size: stats.size,
      copied: true
    }
  }

  /**
   * Execute file move operation
   */
  private async executeMove(parameters: any): Promise<any> {
    if (!this.config?.permissions.write || !this.config?.permissions.delete) {
      throw new Error('Write and delete permissions required for move operation')
    }

    const { sourcePath, targetPath, overwrite = false } = parameters

    if (!sourcePath || !targetPath) {
      throw new Error('Source and target paths are required for move operation')
    }

    const fullSourcePath = this.resolvePath(sourcePath)
    const fullTargetPath = this.resolvePath(targetPath)
    
    this.validatePath(fullSourcePath)
    this.validatePath(fullTargetPath)

    this.logger.debug(`Moving: ${fullSourcePath} -> ${fullTargetPath}`)

    // Check if target exists
    try {
      await fs.access(fullTargetPath)
      if (!overwrite) {
        throw new Error('Target file exists and overwrite is false')
      }
    } catch (error) {
      // Target doesn't exist, which is fine
    }

    await fs.rename(fullSourcePath, fullTargetPath)

    return {
      sourcePath,
      targetPath,
      moved: true
    }
  }

  /**
   * Execute directory creation
   */
  private async executeMkdir(parameters: any): Promise<any> {
    if (!this.config?.permissions.create) {
      throw new Error('Create permission denied')
    }

    const { dirPath, recursive = false } = parameters

    if (!dirPath) {
      throw new Error('Directory path is required for mkdir operation')
    }

    const fullPath = this.resolvePath(dirPath)
    this.validatePath(fullPath)

    this.logger.debug(`Creating directory: ${fullPath}`)

    await fs.mkdir(fullPath, { recursive })

    return {
      path: dirPath,
      created: true
    }
  }

  /**
   * Execute file/directory stat operation
   */
  private async executeStat(parameters: any): Promise<any> {
    if (!this.config?.permissions.read) {
      throw new Error('Read permission denied')
    }

    const { filePath } = parameters

    if (!filePath) {
      throw new Error('File path is required for stat operation')
    }

    const fullPath = this.resolvePath(filePath)
    this.validatePath(fullPath)

    this.logger.debug(`Getting stats: ${fullPath}`)

    const stats = await fs.stat(fullPath)

    return {
      path: filePath,
      type: stats.isDirectory() ? 'directory' : 'file',
      size: stats.size,
      modified: stats.mtime,
      created: stats.birthtime,
      accessed: stats.atime,
      permissions: stats.mode,
      uid: stats.uid,
      gid: stats.gid
    }
  }

  /**
   * Execute file watching
   */
  private async executeWatch(parameters: any): Promise<any> {
    if (!this.config?.permissions.read) {
      throw new Error('Read permission denied')
    }

    const { filePath, events = ['change'] } = parameters

    if (!filePath) {
      throw new Error('File path is required for watch operation')
    }

    const fullPath = this.resolvePath(filePath)
    this.validatePath(fullPath)

    this.logger.debug(`Watching: ${fullPath}`)

    // Mock file watcher - in production would use fs.watch
    return {
      path: filePath,
      watchId: `watch_${Date.now()}`,
      events,
      watching: true
    }
  }

  /**
   * Resolve file path relative to base path
   */
  private resolvePath(filePath: string): string {
    if (!this.config) {
      throw new Error('File system adapter not configured')
    }

    // Ensure path is relative and doesn't escape base path
    const normalized = path.normalize(filePath)
    if (path.isAbsolute(normalized)) {
      throw new Error('Absolute paths not allowed')
    }

    if (normalized.includes('..')) {
      throw new Error('Path traversal not allowed')
    }

    return path.join(this.config.basePath, normalized)
  }

  /**
   * Validate path is within allowed base path
   */
  private validatePath(fullPath: string): void {
    if (!this.config) {
      throw new Error('File system adapter not configured')
    }

    const relativePath = path.relative(this.config.basePath, fullPath)
    
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      throw new Error('Path outside of allowed base path')
    }
  }

  /**
   * Validate file extension is allowed
   */
  private validateFileExtension(filePath: string): void {
    if (!this.config?.allowedExtensions) {
      return // All extensions allowed
    }

    const ext = path.extname(filePath).toLowerCase()
    
    if (!this.config.allowedExtensions.includes(ext)) {
      throw new Error(`File extension not allowed: ${ext}`)
    }
  }

  /**
   * Create adapter error
   */
  private createAdapterError(error: any): AdapterError {
    let code = 'FILE_SYSTEM_ERROR'
    let retryable = false

    if (error.code === 'ENOENT') {
      code = 'FILE_NOT_FOUND'
      retryable = false
    } else if (error.code === 'EACCES') {
      code = 'PERMISSION_DENIED'
      retryable = false
    } else if (error.code === 'EEXIST') {
      code = 'FILE_EXISTS'
      retryable = false
    } else if (error.code === 'ENOSPC') {
      code = 'NO_SPACE'
      retryable = true
    } else if (error.code === 'EMFILE' || error.code === 'ENFILE') {
      code = 'TOO_MANY_FILES'
      retryable = true
    }

    return {
      code,
      message: error.message || error.toString(),
      details: { code: error.code, errno: error.errno, path: error.path },
      retryable
    }
  }
}