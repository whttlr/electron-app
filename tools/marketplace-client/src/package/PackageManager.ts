import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import semver from 'semver'
import tar from 'tar'
import extractZip from 'extract-zip'
import { MarketplaceClient } from '../client/MarketplaceClient'
import { ConfigManager } from '../config/ConfigManager'
import { Logger } from '../utils/Logger'

export interface InstalledPlugin {
  name: string
  version: string
  installedAt: string
  global: boolean
  path: string
  manifest: PluginManifest
  outdated?: boolean
  latestVersion?: string
}

export interface PluginManifest {
  name: string
  version: string
  description: string
  main: string
  author: string | { name: string; email?: string }
  license: string
  keywords: string[]
  dependencies: Record<string, string>
  peerDependencies?: Record<string, string>
  engines: Record<string, string>
  cncPlugin: {
    apiVersion: string
    category: string
    permissions: string[]
    icon?: string
    displayName?: string
  }
}

export interface InstallOptions {
  version?: string
  global?: boolean
  force?: boolean
  dryRun?: boolean
  saveDev?: boolean
}

export interface UninstallOptions {
  global?: boolean
}

export interface UpdateOptions {
  global?: boolean
  checkOnly?: boolean
}

export interface ListOptions {
  global?: boolean
  outdatedOnly?: boolean
}

export class PackageManager {
  private client: MarketplaceClient
  private configManager: ConfigManager
  private logger: Logger

  constructor() {
    this.client = new MarketplaceClient()
    this.configManager = new ConfigManager()
    this.logger = new Logger()
  }

  /**
   * Install a plugin from the marketplace
   */
  async install(pluginName: string, options: InstallOptions = {}): Promise<void> {
    try {
      this.logger.info(`📦 Installing ${pluginName}...`)

      // Check if plugin exists
      const pluginInfo = await this.client.getPluginInfo(pluginName, options.version)
      const targetVersion = options.version || pluginInfo.version

      // Check if already installed
      const existingInstallation = await this.getInstalledPlugin(pluginName, options.global)
      if (existingInstallation && !options.force) {
        if (semver.eq(existingInstallation.version, targetVersion)) {
          this.logger.info(`✅ ${pluginName}@${targetVersion} is already installed`)
          return
        } else if (semver.gt(existingInstallation.version, targetVersion)) {
          const shouldDowngrade = await this.confirmDowngrade(pluginName, existingInstallation.version, targetVersion)
          if (!shouldDowngrade) {
            return
          }
        }
      }

      // Validate compatibility
      await this.validateCompatibility(pluginInfo)

      // Get installation path
      const installPath = this.getInstallationPath(pluginName, options.global)

      // Dry run check
      if (options.dryRun) {
        this.logger.info(`📋 Dry run: Would install ${pluginName}@${targetVersion} to ${installPath}`)
        return
      }

      // Download and extract plugin
      await this.downloadAndExtract(pluginInfo, targetVersion, installPath)

      // Install dependencies
      if (pluginInfo.dependencies && Object.keys(pluginInfo.dependencies).length > 0) {
        await this.installDependencies(pluginInfo.dependencies, installPath)
      }

      // Register installation
      await this.registerInstallation(pluginName, targetVersion, installPath, options.global, pluginInfo)

      // Run post-install hooks
      await this.runPostInstallHooks(installPath)

      this.logger.info(`✅ Successfully installed ${pluginName}@${targetVersion}`)

    } catch (error) {
      this.logger.error(`Failed to install ${pluginName}:`, error.message)
      throw error
    }
  }

  /**
   * Uninstall a plugin
   */
  async uninstall(pluginName: string, options: UninstallOptions = {}): Promise<void> {
    try {
      this.logger.info(`🗑️  Uninstalling ${pluginName}...`)

      // Check if plugin is installed
      const installation = await this.getInstalledPlugin(pluginName, options.global)
      if (!installation) {
        throw new Error(`Plugin ${pluginName} is not installed`)
      }

      // Run pre-uninstall hooks
      await this.runPreUninstallHooks(installation.path)

      // Remove plugin files
      await fs.remove(installation.path)

      // Unregister installation
      await this.unregisterInstallation(pluginName, options.global)

      this.logger.info(`✅ Successfully uninstalled ${pluginName}`)

    } catch (error) {
      this.logger.error(`Failed to uninstall ${pluginName}:`, error.message)
      throw error
    }
  }

  /**
   * Update installed plugins
   */
  async updatePlugins(pluginNames: string[], options: UpdateOptions = {}): Promise<void> {
    for (const pluginName of pluginNames) {
      try {
        await this.updateSinglePlugin(pluginName, options)
      } catch (error) {
        this.logger.error(`Failed to update ${pluginName}:`, error.message)
      }
    }
  }

  /**
   * Update all installed plugins
   */
  async updateAll(options: UpdateOptions = {}): Promise<void> {
    const installed = await this.listInstalled({ global: options.global })
    const pluginNames = installed.map(p => p.name)
    
    if (pluginNames.length === 0) {
      this.logger.info('No plugins installed')
      return
    }

    await this.updatePlugins(pluginNames, options)
  }

  /**
   * List installed plugins
   */
  async listInstalled(options: ListOptions = {}): Promise<InstalledPlugin[]> {
    const installations = await this.getInstalledPlugins(options.global)
    let plugins = Object.values(installations)

    // Check for outdated plugins
    if (options.outdatedOnly || !options.outdatedOnly) {
      plugins = await this.checkOutdated(plugins)
    }

    if (options.outdatedOnly) {
      plugins = plugins.filter(p => p.outdated)
    }

    return plugins.sort((a, b) => a.name.localeCompare(b.name))
  }

  /**
   * Display installed plugins in formatted table
   */
  displayInstalledPlugins(plugins: InstalledPlugin[], logger: Logger): void {
    if (plugins.length === 0) {
      logger.info('No plugins installed')
      return
    }

    const { table } = require('table')
    
    const data = [
      ['Name', 'Version', 'Latest', 'Status', 'Location']
    ]

    for (const plugin of plugins) {
      const status = plugin.outdated ? '⚠️  Outdated' : '✅ Current'
      const location = plugin.global ? 'Global' : 'Local'
      
      data.push([
        plugin.name,
        plugin.version,
        plugin.latestVersion || plugin.version,
        status,
        location
      ])
    }

    console.log(table(data))
  }

  /**
   * Get plugin installation path
   */
  private getInstallationPath(pluginName: string, global: boolean): string {
    if (global) {
      const globalDir = path.join(os.homedir(), '.cnc-jog-controls', 'plugins')
      return path.join(globalDir, pluginName)
    } else {
      return path.join(process.cwd(), 'plugins', pluginName)
    }
  }

  /**
   * Get installed plugin info
   */
  private async getInstalledPlugin(pluginName: string, global: boolean): Promise<InstalledPlugin | null> {
    const installations = await this.getInstalledPlugins(global)
    return installations[pluginName] || null
  }

  /**
   * Get all installed plugins
   */
  private async getInstalledPlugins(global: boolean): Promise<Record<string, InstalledPlugin>> {
    const key = global ? 'installations.global' : 'installations.local'
    return await this.configManager.get(key) || {}
  }

  /**
   * Download and extract plugin package
   */
  private async downloadAndExtract(pluginInfo: any, version: string, installPath: string): Promise<void> {
    // Get download URL
    const downloadUrl = await this.client.getDownloadUrl(pluginInfo.name, version)
    
    // Create installation directory
    await fs.ensureDir(installPath)

    // Download package
    this.logger.info('📥 Downloading package...')
    const response = await fetch(downloadUrl)
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const tempFile = path.join(os.tmpdir(), `${pluginInfo.name}-${version}.tgz`)
    
    try {
      await fs.writeFile(tempFile, buffer)

      // Extract package
      this.logger.info('📂 Extracting package...')
      if (tempFile.endsWith('.zip')) {
        await extractZip(tempFile, { dir: installPath })
      } else {
        await tar.extract({
          file: tempFile,
          cwd: installPath,
          strip: 1 // Remove top-level directory
        })
      }

    } finally {
      // Clean up temp file
      await fs.remove(tempFile)
    }
  }

  /**
   * Install plugin dependencies
   */
  private async installDependencies(dependencies: Record<string, string>, installPath: string): Promise<void> {
    this.logger.info('📦 Installing dependencies...')
    
    // Create package.json for npm install
    const packageJson = {
      name: 'temp-plugin-deps',
      version: '1.0.0',
      dependencies
    }

    const packageJsonPath = path.join(installPath, 'package.json.temp')
    await fs.writeJson(packageJsonPath, packageJson)

    try {
      // Run npm install in plugin directory
      const { spawn } = require('child_process')
      await new Promise((resolve, reject) => {
        const npmProcess = spawn('npm', ['install'], {
          cwd: installPath,
          stdio: 'pipe'
        })

        npmProcess.on('close', (code: number) => {
          if (code === 0) {
            resolve(void 0)
          } else {
            reject(new Error(`npm install failed with code ${code}`))
          }
        })

        npmProcess.on('error', reject)
      })

    } finally {
      await fs.remove(packageJsonPath)
    }
  }

  /**
   * Validate plugin compatibility
   */
  private async validateCompatibility(pluginInfo: any): Promise<void> {
    const manifest = pluginInfo.manifest || pluginInfo
    
    // Check Node.js version
    if (manifest.engines && manifest.engines.node) {
      if (!semver.satisfies(process.version, manifest.engines.node)) {
        throw new Error(`Plugin requires Node.js ${manifest.engines.node}, but you have ${process.version}`)
      }
    }

    // Check CNC plugin API version
    if (manifest.cncPlugin && manifest.cncPlugin.apiVersion) {
      const currentApiVersion = '1.0.0' // Should come from config
      if (!semver.satisfies(currentApiVersion, manifest.cncPlugin.apiVersion)) {
        throw new Error(`Plugin requires CNC API ${manifest.cncPlugin.apiVersion}, but you have ${currentApiVersion}`)
      }
    }
  }

  /**
   * Register plugin installation
   */
  private async registerInstallation(
    pluginName: string, 
    version: string, 
    installPath: string, 
    global: boolean,
    pluginInfo: any
  ): Promise<void> {
    const installations = await this.getInstalledPlugins(global)
    
    // Read manifest from installed plugin
    const manifestPath = path.join(installPath, 'package.json')
    const manifest = await fs.readJson(manifestPath)

    installations[pluginName] = {
      name: pluginName,
      version: version,
      installedAt: new Date().toISOString(),
      global: global,
      path: installPath,
      manifest: manifest
    }

    const key = global ? 'installations.global' : 'installations.local'
    await this.configManager.set(key, installations)
  }

  /**
   * Unregister plugin installation
   */
  private async unregisterInstallation(pluginName: string, global: boolean): Promise<void> {
    const installations = await this.getInstalledPlugins(global)
    delete installations[pluginName]

    const key = global ? 'installations.global' : 'installations.local'
    await this.configManager.set(key, installations)
  }

  /**
   * Update single plugin
   */
  private async updateSinglePlugin(pluginName: string, options: UpdateOptions): Promise<void> {
    const installation = await this.getInstalledPlugin(pluginName, options.global)
    if (!installation) {
      this.logger.warn(`Plugin ${pluginName} is not installed`)
      return
    }

    const latestVersion = await this.client.getLatestVersion(pluginName)
    
    if (semver.eq(installation.version, latestVersion)) {
      this.logger.info(`${pluginName} is already up to date`)
      return
    }

    if (options.checkOnly) {
      this.logger.info(`${pluginName}: ${installation.version} → ${latestVersion}`)
      return
    }

    this.logger.info(`Updating ${pluginName}: ${installation.version} → ${latestVersion}`)
    
    await this.install(pluginName, {
      version: latestVersion,
      global: options.global,
      force: true
    })
  }

  /**
   * Check which plugins are outdated
   */
  private async checkOutdated(plugins: InstalledPlugin[]): Promise<InstalledPlugin[]> {
    const updatedPlugins = []

    for (const plugin of plugins) {
      try {
        const latestVersion = await this.client.getLatestVersion(plugin.name)
        const outdated = semver.lt(plugin.version, latestVersion)
        
        updatedPlugins.push({
          ...plugin,
          outdated,
          latestVersion
        })
      } catch (error) {
        // If we can't check latest version, assume it's current
        updatedPlugins.push(plugin)
      }
    }

    return updatedPlugins
  }

  /**
   * Confirm downgrade with user
   */
  private async confirmDowngrade(pluginName: string, currentVersion: string, targetVersion: string): Promise<boolean> {
    const inquirer = require('inquirer')
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: `${pluginName} ${currentVersion} is newer than ${targetVersion}. Downgrade?`,
      default: false
    }])
    
    return confirm
  }

  /**
   * Run post-install hooks
   */
  private async runPostInstallHooks(installPath: string): Promise<void> {
    const hookPath = path.join(installPath, 'hooks', 'post-install.js')
    if (await fs.pathExists(hookPath)) {
      try {
        const hook = require(hookPath)
        if (typeof hook === 'function') {
          await hook()
        }
      } catch (error) {
        this.logger.warn('Post-install hook failed:', error.message)
      }
    }
  }

  /**
   * Run pre-uninstall hooks
   */
  private async runPreUninstallHooks(installPath: string): Promise<void> {
    const hookPath = path.join(installPath, 'hooks', 'pre-uninstall.js')
    if (await fs.pathExists(hookPath)) {
      try {
        const hook = require(hookPath)
        if (typeof hook === 'function') {
          await hook()
        }
      } catch (error) {
        this.logger.warn('Pre-uninstall hook failed:', error.message)
      }
    }
  }
}