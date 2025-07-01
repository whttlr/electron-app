import path from 'path'
import fs from 'fs-extra'
import { TypeScriptAnalyzer, ApiAnalysis } from '../analyzer/TypeScriptAnalyzer'
import { MarkdownRenderer } from '../renderer/MarkdownRenderer'
import { HtmlRenderer } from '../renderer/HtmlRenderer'
import { JsonRenderer } from '../renderer/JsonRenderer'
import { ExampleGenerator } from './ExampleGenerator'
import { ConfigManager } from '../utils/ConfigManager'
import { Logger } from '../utils/Logger'

export interface GeneratorOptions {
  sourceDir: string
  outputDir: string
  format: 'markdown' | 'html' | 'json'
  template: string
  includePrivate: boolean
  includeInternal: boolean
  generateExamples: boolean
  interactive: boolean
  includePatterns?: string[]
  excludePatterns?: string[]
  configFile?: string
}

export interface DocumentationConfig {
  title: string
  description: string
  version: string
  baseUrl?: string
  theme: string
  navigation: NavigationConfig
  sections: SectionConfig[]
  rendering: RenderingConfig
  examples: ExamplesConfig
}

export interface NavigationConfig {
  showPrivate: boolean
  showInternal: boolean
  groupBy: 'module' | 'type' | 'category'
  sortBy: 'name' | 'line' | 'custom'
  collapsible: boolean
}

export interface SectionConfig {
  id: string
  title: string
  description?: string
  include: string[]
  exclude?: string[]
  template?: string
  order?: number
}

export interface RenderingConfig {
  syntaxHighlight: boolean
  typeLinks: boolean
  sourceLinks: boolean
  badges: boolean
  toc: boolean
  breadcrumbs: boolean
}

export interface ExamplesConfig {
  enabled: boolean
  generateUsage: boolean
  generateTests: boolean
  includePlayground: boolean
  sandboxUrl?: string
}

export class ApiDocumentationGenerator {
  private options: GeneratorOptions
  private config: DocumentationConfig
  private analyzer: TypeScriptAnalyzer
  private renderer: MarkdownRenderer | HtmlRenderer | JsonRenderer
  private exampleGenerator: ExampleGenerator
  private logger: Logger

  constructor(options: GeneratorOptions) {
    this.options = options
    this.logger = new Logger(options)
    this.analyzer = new TypeScriptAnalyzer()
    this.exampleGenerator = new ExampleGenerator()
    
    // Initialize renderer based on format
    switch (options.format) {
      case 'html':
        this.renderer = new HtmlRenderer()
        break
      case 'json':
        this.renderer = new JsonRenderer()
        break
      case 'markdown':
      default:
        this.renderer = new MarkdownRenderer()
        break
    }
  }

  /**
   * Generate complete API documentation
   */
  async generate(): Promise<void> {
    try {
      // Load configuration
      await this.loadConfiguration()
      
      // Analyze TypeScript source
      this.logger.info('🔍 Analyzing TypeScript source...')
      const analysis = await this.analyzer.analyzeProject(this.options.sourceDir, {
        includePrivate: this.options.includePrivate,
        includeInternal: this.options.includeInternal,
        includePatterns: this.options.includePatterns,
        excludePatterns: this.options.excludePatterns
      })
      
      // Validate analysis
      this.validateAnalysis(analysis)
      
      // Prepare output directory
      await this.prepareOutputDirectory()
      
      // Generate documentation sections
      await this.generateSections(analysis)
      
      // Generate examples if requested
      if (this.options.generateExamples) {
        await this.generateExamples(analysis)
      }
      
      // Generate navigation and index
      await this.generateNavigation(analysis)
      await this.generateIndex(analysis)
      
      // Copy assets and templates
      await this.copyAssets()
      
      // Generate search index
      await this.generateSearchIndex(analysis)
      
      // Generate interactive features
      if (this.options.interactive) {
        await this.generateInteractiveFeatures(analysis)
      }
      
      // Generate metadata
      await this.generateMetadata(analysis)
      
    } catch (error) {
      this.logger.error('Documentation generation failed:', error.message)
      throw error
    }
  }

  /**
   * Load configuration from file or use defaults
   */
  private async loadConfiguration(): Promise<void> {
    const configManager = new ConfigManager()
    
    if (this.options.configFile && await fs.pathExists(this.options.configFile)) {
      this.config = await configManager.loadConfig(this.options.configFile)
    } else {
      this.config = configManager.getDefaultConfig()
    }
    
    // Override with command line options
    this.config.rendering.syntaxHighlight = true
    this.config.rendering.typeLinks = true
    this.config.rendering.sourceLinks = true
    this.config.examples.enabled = this.options.generateExamples
  }

  /**
   * Validate analysis results
   */
  private validateAnalysis(analysis: ApiAnalysis): void {
    if (!analysis.modules || analysis.modules.length === 0) {
      throw new Error('No modules found in source directory')
    }
    
    let totalMembers = 0
    analysis.modules.forEach(module => {
      totalMembers += module.classes.length
      totalMembers += module.interfaces.length
      totalMembers += module.functions.length
      totalMembers += module.types.length
    })
    
    if (totalMembers === 0) {
      this.logger.warn('No API members found - check source files and patterns')
    }
    
    this.logger.info(`📊 Analysis complete: ${analysis.modules.length} modules, ${totalMembers} members`)
  }

  /**
   * Prepare output directory
   */
  private async prepareOutputDirectory(): Promise<void> {
    this.logger.info(`📁 Preparing output directory: ${this.options.outputDir}`)
    
    // Clean output directory
    if (await fs.pathExists(this.options.outputDir)) {
      await fs.remove(this.options.outputDir)
    }
    
    // Create directory structure
    await fs.ensureDir(this.options.outputDir)
    await fs.ensureDir(path.join(this.options.outputDir, 'modules'))
    await fs.ensureDir(path.join(this.options.outputDir, 'types'))
    await fs.ensureDir(path.join(this.options.outputDir, 'examples'))
    await fs.ensureDir(path.join(this.options.outputDir, 'assets'))
  }

  /**
   * Generate documentation sections
   */
  private async generateSections(analysis: ApiAnalysis): Promise<void> {
    this.logger.info('📝 Generating documentation sections...')
    
    for (const section of this.config.sections) {
      this.logger.info(`  • Generating section: ${section.title}`)
      
      const sectionData = this.filterAnalysisForSection(analysis, section)
      const content = await this.renderer.renderSection(section, sectionData, this.config)
      
      const outputPath = path.join(this.options.outputDir, `${section.id}.${this.getFileExtension()}`)
      await fs.writeFile(outputPath, content)
    }

    // Generate module documentation
    for (const module of analysis.modules) {
      this.logger.info(`  • Generating module: ${module.name}`)
      
      const content = await this.renderer.renderModule(module, this.config)
      const outputPath = path.join(this.options.outputDir, 'modules', `${module.name}.${this.getFileExtension()}`)
      await fs.writeFile(outputPath, content)
    }

    // Generate type documentation
    const allTypes = analysis.modules.flatMap(m => [...m.interfaces, ...m.types, ...m.enums])
    for (const type of allTypes) {
      const content = await this.renderer.renderType(type, this.config)
      const outputPath = path.join(this.options.outputDir, 'types', `${type.name}.${this.getFileExtension()}`)
      await fs.writeFile(outputPath, content)
    }
  }

  /**
   * Generate usage examples
   */
  private async generateExamples(analysis: ApiAnalysis): Promise<void> {
    this.logger.info('💡 Generating usage examples...')
    
    const examples = await this.exampleGenerator.generateExamples(analysis, {
      includeUsage: this.config.examples.generateUsage,
      includeTests: this.config.examples.generateTests,
      includePlayground: this.config.examples.includePlayground
    })
    
    for (const example of examples) {
      const outputPath = path.join(this.options.outputDir, 'examples', `${example.name}.md`)
      await fs.writeFile(outputPath, example.content)
    }
  }

  /**
   * Generate navigation structure
   */
  private async generateNavigation(analysis: ApiAnalysis): Promise<void> {
    this.logger.info('🧭 Generating navigation...')
    
    const navigation = this.buildNavigationStructure(analysis)
    const content = await this.renderer.renderNavigation(navigation, this.config)
    
    const outputPath = path.join(this.options.outputDir, `navigation.${this.getFileExtension()}`)
    await fs.writeFile(outputPath, content)
  }

  /**
   * Generate main index page
   */
  private async generateIndex(analysis: ApiAnalysis): Promise<void> {
    this.logger.info('🏠 Generating index page...')
    
    const indexData = {
      title: this.config.title,
      description: this.config.description,
      version: this.config.version,
      modules: analysis.modules.map(m => ({
        name: m.name,
        description: m.description,
        memberCount: m.classes.length + m.interfaces.length + m.functions.length
      })),
      statistics: this.generateStatistics(analysis),
      quickStart: await this.generateQuickStart(analysis)
    }
    
    const content = await this.renderer.renderIndex(indexData, this.config)
    const outputPath = path.join(this.options.outputDir, `index.${this.getFileExtension()}`)
    await fs.writeFile(outputPath, content)
  }

  /**
   * Copy assets and static files
   */
  private async copyAssets(): Promise<void> {
    this.logger.info('📋 Copying assets...')
    
    const templateDir = path.join(__dirname, '../../templates', this.options.template)
    if (await fs.pathExists(templateDir)) {
      const assetsDir = path.join(templateDir, 'assets')
      if (await fs.pathExists(assetsDir)) {
        await fs.copy(assetsDir, path.join(this.options.outputDir, 'assets'))
      }
    }
    
    // Copy CSS and JavaScript files for HTML output
    if (this.options.format === 'html') {
      await this.copyHtmlAssets()
    }
  }

  /**
   * Generate search index for client-side search
   */
  private async generateSearchIndex(analysis: ApiAnalysis): Promise<void> {
    this.logger.info('🔍 Generating search index...')
    
    const searchIndex = this.buildSearchIndex(analysis)
    const outputPath = path.join(this.options.outputDir, 'search-index.json')
    await fs.writeJson(outputPath, searchIndex, { spaces: 2 })
  }

  /**
   * Generate interactive features
   */
  private async generateInteractiveFeatures(analysis: ApiAnalysis): Promise<void> {
    this.logger.info('⚡ Generating interactive features...')
    
    // Generate API playground
    if (this.config.examples.includePlayground) {
      await this.generateApiPlayground(analysis)
    }
    
    // Generate type explorer
    await this.generateTypeExplorer(analysis)
    
    // Generate interactive examples
    await this.generateInteractiveExamples(analysis)
  }

  /**
   * Generate metadata file
   */
  private async generateMetadata(analysis: ApiAnalysis): Promise<void> {
    const metadata = {
      generated: new Date().toISOString(),
      generator: {
        name: 'cnc-api-docs',
        version: '1.0.0'
      },
      config: this.config,
      statistics: this.generateStatistics(analysis),
      files: await this.getGeneratedFiles()
    }
    
    const outputPath = path.join(this.options.outputDir, 'metadata.json')
    await fs.writeJson(outputPath, metadata, { spaces: 2 })
  }

  // Helper methods

  private filterAnalysisForSection(analysis: ApiAnalysis, section: SectionConfig): any {
    // Filter analysis based on section configuration
    return analysis // Simplified for now
  }

  private getFileExtension(): string {
    switch (this.options.format) {
      case 'html': return 'html'
      case 'json': return 'json'
      case 'markdown':
      default: return 'md'
    }
  }

  private buildNavigationStructure(analysis: ApiAnalysis): any {
    return {
      modules: analysis.modules.map(m => ({
        name: m.name,
        path: `modules/${m.name}`,
        children: [
          ...m.classes.map(c => ({ name: c.name, type: 'class', path: `types/${c.name}` })),
          ...m.interfaces.map(i => ({ name: i.name, type: 'interface', path: `types/${i.name}` })),
          ...m.functions.map(f => ({ name: f.name, type: 'function', path: `types/${f.name}` }))
        ]
      }))
    }
  }

  private generateStatistics(analysis: ApiAnalysis): any {
    const stats = {
      modules: analysis.modules.length,
      classes: 0,
      interfaces: 0,
      functions: 0,
      types: 0,
      enums: 0
    }
    
    analysis.modules.forEach(module => {
      stats.classes += module.classes.length
      stats.interfaces += module.interfaces.length
      stats.functions += module.functions.length
      stats.types += module.types.length
      stats.enums += module.enums.length
    })
    
    return stats
  }

  private async generateQuickStart(analysis: ApiAnalysis): Promise<string> {
    // Generate quick start guide based on main exports
    return 'Quick start guide content...'
  }

  private async copyHtmlAssets(): Promise<void> {
    // Copy HTML-specific assets (CSS, JS, images)
  }

  private buildSearchIndex(analysis: ApiAnalysis): any {
    const index: any[] = []
    
    analysis.modules.forEach(module => {
      // Add module to index
      index.push({
        name: module.name,
        type: 'module',
        description: module.description,
        path: `modules/${module.name}`
      })
      
      // Add classes
      module.classes.forEach(cls => {
        index.push({
          name: cls.name,
          type: 'class',
          module: module.name,
          description: cls.description,
          path: `types/${cls.name}`
        })
      })
      
      // Add interfaces
      module.interfaces.forEach(iface => {
        index.push({
          name: iface.name,
          type: 'interface',
          module: module.name,
          description: iface.description,
          path: `types/${iface.name}`
        })
      })
      
      // Add functions
      module.functions.forEach(func => {
        index.push({
          name: func.name,
          type: 'function',
          module: module.name,
          description: func.description,
          path: `types/${func.name}`
        })
      })
    })
    
    return index
  }

  private async generateApiPlayground(analysis: ApiAnalysis): Promise<void> {
    // Generate interactive API playground
  }

  private async generateTypeExplorer(analysis: ApiAnalysis): Promise<void> {
    // Generate interactive type explorer
  }

  private async generateInteractiveExamples(analysis: ApiAnalysis): Promise<void> {
    // Generate interactive code examples
  }

  private async getGeneratedFiles(): Promise<string[]> {
    const files: string[] = []
    
    const addFiles = async (dir: string, basePath = '') => {
      const entries = await fs.readdir(path.join(this.options.outputDir, dir))
      for (const entry of entries) {
        const fullPath = path.join(this.options.outputDir, dir, entry)
        const relativePath = path.join(basePath, entry)
        
        if ((await fs.stat(fullPath)).isDirectory()) {
          await addFiles(path.join(dir, entry), relativePath)
        } else {
          files.push(relativePath)
        }
      }
    }
    
    await addFiles('.')
    return files
  }
}