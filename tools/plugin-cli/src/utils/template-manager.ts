import path from 'path'
import fs from 'fs-extra'
import mustache from 'mustache'
import { Logger } from './logger'

export interface PluginTemplate {
  name: string
  displayName: string
  description: string
  version: string
  author: string
  category: string
  tags: string[]
  features: string[]
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  files: TemplateFile[]
  prompts?: TemplatePrompt[]
  postInstall?: string[]
}

export interface TemplateFile {
  source: string
  destination: string
  template: boolean
  executable?: boolean
  condition?: string
}

export interface TemplatePrompt {
  name: string
  type: 'input' | 'confirm' | 'list' | 'checkbox'
  message: string
  default?: any
  choices?: Array<{ name: string; value: any }>
  validate?: string
  when?: string
}

export interface TemplateContext {
  pluginName: string
  displayName: string
  description: string
  author: {
    name: string
    email: string
    url?: string
  }
  license: string
  keywords: string[]
  category: string
  version: string
  repository?: string
  features?: Record<string, boolean>
  [key: string]: any
}

export class TemplateManager {
  private logger: Logger
  private templatesDir: string
  private builtinTemplates: string[]

  constructor(logger?: Logger) {
    this.logger = logger || new Logger()
    this.templatesDir = path.join(__dirname, '../../templates')
    this.builtinTemplates = [
      'basic',
      'typescript',
      'ui-component',
      'machine-control',
      'data-processing',
      'visualization',
      'automation'
    ]
  }

  /**
   * Get list of available templates
   */
  async listTemplates(): Promise<PluginTemplate[]> {
    const templates: PluginTemplate[] = []

    // Add built-in templates
    for (const templateName of this.builtinTemplates) {
      try {
        const template = await this.loadTemplate(templateName)
        templates.push(template)
      } catch (error) {
        this.logger.debug(`Failed to load template ${templateName}:`, error.message)
      }
    }

    // Add user templates
    const userTemplatesDir = this.getUserTemplatesDir()
    if (await fs.pathExists(userTemplatesDir)) {
      const userTemplates = await fs.readdir(userTemplatesDir)
      for (const templateName of userTemplates) {
        try {
          const template = await this.loadTemplate(templateName, true)
          templates.push(template)
        } catch (error) {
          this.logger.debug(`Failed to load user template ${templateName}:`, error.message)
        }
      }
    }

    return templates
  }

  /**
   * Check if a template exists
   */
  async hasTemplate(name: string): Promise<boolean> {
    try {
      await this.loadTemplate(name)
      return true
    } catch {
      return false
    }
  }

  /**
   * Load template configuration
   */
  async loadTemplate(name: string, isUserTemplate = false): Promise<PluginTemplate> {
    const templateDir = isUserTemplate 
      ? path.join(this.getUserTemplatesDir(), name)
      : path.join(this.templatesDir, name)

    const configPath = path.join(templateDir, 'template.json')
    
    if (!await fs.pathExists(configPath)) {
      throw new Error(`Template configuration not found: ${configPath}`)
    }

    const config = await fs.readJson(configPath)
    
    // Validate template configuration
    this.validateTemplateConfig(config, name)

    return {
      ...config,
      name
    }
  }

  /**
   * Generate project from template
   */
  async generateFromTemplate(
    templateName: string, 
    targetDir: string, 
    context: TemplateContext
  ): Promise<void> {
    const template = await this.loadTemplate(templateName)
    
    // Ensure target directory exists
    await fs.ensureDir(targetDir)

    // Process template files
    await this.processTemplateFiles(template, targetDir, context)

    // Run post-install commands
    if (template.postInstall) {
      await this.runPostInstallCommands(template.postInstall, targetDir)
    }
  }

  /**
   * Install template from remote source
   */
  async installTemplate(source: string, name?: string): Promise<void> {
    const userTemplatesDir = this.getUserTemplatesDir()
    await fs.ensureDir(userTemplatesDir)

    // Determine template name
    const templateName = name || this.extractTemplateNameFromSource(source)
    const targetDir = path.join(userTemplatesDir, templateName)

    if (await fs.pathExists(targetDir)) {
      throw new Error(`Template ${templateName} already exists`)
    }

    // Download and extract template
    if (source.startsWith('http')) {
      await this.downloadTemplate(source, targetDir)
    } else if (source.endsWith('.git')) {
      await this.cloneTemplate(source, targetDir)
    } else {
      await this.copyLocalTemplate(source, targetDir)
    }

    // Validate installed template
    const template = await this.loadTemplate(templateName, true)
    this.logger.success(`Template ${template.displayName} installed successfully`)
  }

  /**
   * Uninstall user template
   */
  async uninstallTemplate(name: string): Promise<void> {
    if (this.builtinTemplates.includes(name)) {
      throw new Error(`Cannot uninstall built-in template: ${name}`)
    }

    const templateDir = path.join(this.getUserTemplatesDir(), name)
    
    if (!await fs.pathExists(templateDir)) {
      throw new Error(`Template ${name} not found`)
    }

    await fs.remove(templateDir)
    this.logger.success(`Template ${name} uninstalled successfully`)
  }

  /**
   * Update templates
   */
  async updateTemplates(templateNames?: string[]): Promise<void> {
    const templates = await this.listTemplates()
    const toUpdate = templateNames 
      ? templates.filter(t => templateNames.includes(t.name))
      : templates.filter(t => !this.builtinTemplates.includes(t.name))

    for (const template of toUpdate) {
      try {
        // Check for updates (implementation depends on template source)
        await this.updateTemplate(template)
        this.logger.success(`Updated template: ${template.name}`)
      } catch (error) {
        this.logger.error(`Failed to update template ${template.name}:`, error.message)
      }
    }
  }

  /**
   * Process template files
   */
  private async processTemplateFiles(
    template: PluginTemplate, 
    targetDir: string, 
    context: TemplateContext
  ): Promise<void> {
    const templateDir = path.join(this.templatesDir, template.name)

    for (const fileConfig of template.files) {
      // Check condition if specified
      if (fileConfig.condition && !this.evaluateCondition(fileConfig.condition, context)) {
        continue
      }

      const sourcePath = path.join(templateDir, fileConfig.source)
      const targetPath = path.join(targetDir, this.processPath(fileConfig.destination, context))

      // Ensure target directory exists
      await fs.ensureDir(path.dirname(targetPath))

      if (fileConfig.template) {
        // Process as mustache template
        const content = await fs.readFile(sourcePath, 'utf8')
        const processed = mustache.render(content, context)
        await fs.writeFile(targetPath, processed)
      } else {
        // Copy file as-is
        await fs.copy(sourcePath, targetPath)
      }

      // Set executable permissions if specified
      if (fileConfig.executable) {
        await fs.chmod(targetPath, 0o755)
      }
    }
  }

  /**
   * Process path with template variables
   */
  private processPath(pathTemplate: string, context: TemplateContext): string {
    return mustache.render(pathTemplate, context)
  }

  /**
   * Evaluate template condition
   */
  private evaluateCondition(condition: string, context: TemplateContext): boolean {
    try {
      // Simple condition evaluation (can be enhanced)
      const func = new Function('context', `with(context) { return ${condition} }`)
      return func(context)
    } catch {
      return false
    }
  }

  /**
   * Run post-install commands
   */
  private async runPostInstallCommands(commands: string[], targetDir: string): Promise<void> {
    const { spawn } = require('child_process')

    for (const command of commands) {
      this.logger.info(`Running: ${command}`)
      
      const [cmd, ...args] = command.split(' ')
      
      await new Promise<void>((resolve, reject) => {
        const child = spawn(cmd, args, {
          cwd: targetDir,
          stdio: 'inherit'
        })

        child.on('close', (code) => {
          if (code === 0) {
            resolve()
          } else {
            reject(new Error(`Command failed with code ${code}: ${command}`))
          }
        })

        child.on('error', reject)
      })
    }
  }

  /**
   * Validate template configuration
   */
  private validateTemplateConfig(config: any, name: string): void {
    const required = ['displayName', 'description', 'version', 'files']
    
    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Template ${name} missing required field: ${field}`)
      }
    }

    if (!Array.isArray(config.files)) {
      throw new Error(`Template ${name} files must be an array`)
    }

    for (const file of config.files) {
      if (!file.source || !file.destination) {
        throw new Error(`Template ${name} file entry missing source or destination`)
      }
    }
  }

  /**
   * Get user templates directory
   */
  private getUserTemplatesDir(): string {
    const os = require('os')
    return path.join(os.homedir(), '.cnc-plugin-cli', 'templates')
  }

  /**
   * Extract template name from source
   */
  private extractTemplateNameFromSource(source: string): string {
    const basename = path.basename(source)
    return basename.replace(/\.(git|zip|tar\.gz)$/, '')
  }

  /**
   * Download template from URL
   */
  private async downloadTemplate(url: string, targetDir: string): Promise<void> {
    // Implementation for downloading and extracting templates
    // This would handle ZIP files, tar.gz files, etc.
    throw new Error('Template download not implemented yet')
  }

  /**
   * Clone template from git repository
   */
  private async cloneTemplate(gitUrl: string, targetDir: string): Promise<void> {
    const { spawn } = require('child_process')
    
    await new Promise<void>((resolve, reject) => {
      const child = spawn('git', ['clone', gitUrl, targetDir], {
        stdio: 'inherit'
      })

      child.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Git clone failed with code ${code}`))
        }
      })

      child.on('error', reject)
    })

    // Remove .git directory
    const gitDir = path.join(targetDir, '.git')
    if (await fs.pathExists(gitDir)) {
      await fs.remove(gitDir)
    }
  }

  /**
   * Copy template from local path
   */
  private async copyLocalTemplate(source: string, targetDir: string): Promise<void> {
    if (!await fs.pathExists(source)) {
      throw new Error(`Template source not found: ${source}`)
    }

    await fs.copy(source, targetDir)
  }

  /**
   * Update a single template
   */
  private async updateTemplate(template: PluginTemplate): Promise<void> {
    // Implementation for updating templates
    // This would check for updates and apply them
    throw new Error('Template update not implemented yet')
  }

  /**
   * Create a new template
   */
  async createTemplate(name: string, sourceDir: string): Promise<void> {
    const userTemplatesDir = this.getUserTemplatesDir()
    const templateDir = path.join(userTemplatesDir, name)
    
    if (await fs.pathExists(templateDir)) {
      throw new Error(`Template ${name} already exists`)
    }

    // Create template structure
    await fs.ensureDir(templateDir)
    
    // Copy source files
    if (await fs.pathExists(sourceDir)) {
      await fs.copy(sourceDir, templateDir)
    }

    // Create template configuration
    const config: PluginTemplate = {
      name,
      displayName: name.charAt(0).toUpperCase() + name.slice(1),
      description: `Custom plugin template: ${name}`,
      version: '1.0.0',
      author: 'Custom',
      category: 'custom',
      tags: ['custom'],
      features: [],
      dependencies: {},
      devDependencies: {},
      files: []
    }

    // Scan for files and create file entries
    const files = await this.scanTemplateFiles(templateDir)
    config.files = files

    const configPath = path.join(templateDir, 'template.json')
    await fs.writeJson(configPath, config, { spaces: 2 })

    this.logger.success(`Template ${name} created successfully`)
    this.logger.info(`Template directory: ${templateDir}`)
    this.logger.info('Edit template.json to customize the template configuration')
  }

  /**
   * Scan template directory for files
   */
  private async scanTemplateFiles(templateDir: string): Promise<TemplateFile[]> {
    const files: TemplateFile[] = []
    const glob = require('glob')
    
    const pattern = '**/*'
    const fileList = await new Promise<string[]>((resolve, reject) => {
      glob(pattern, { 
        cwd: templateDir,
        nodir: true,
        ignore: ['template.json', 'node_modules/**', '.git/**']
      }, (err: any, matches: string[]) => {
        if (err) reject(err)
        else resolve(matches)
      })
    })

    for (const file of fileList) {
      files.push({
        source: file,
        destination: file,
        template: file.endsWith('.mustache') || 
                 file.includes('{{') || 
                 file.endsWith('.json') ||
                 file.endsWith('.md')
      })
    }

    return files
  }
}