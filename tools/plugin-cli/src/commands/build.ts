import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import webpack from 'webpack'
import path from 'path'
import fs from 'fs-extra'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { WebpackConfigBuilder } from '../utils/webpack-config'
import { PluginValidator } from '../utils/plugin-validator'
import { BuildOptimizer } from '../utils/build-optimizer'
import { Logger } from '../utils/logger'
import { AssetManager } from '../utils/asset-manager'

interface BuildOptions {
  output: string
  mode: 'development' | 'production'
  minify: boolean
  sourcemap: boolean
  analyze: boolean
  watch: boolean
}

interface BuildStats {
  buildTime: number
  bundleSize: number
  assetCount: number
  chunkCount: number
  warnings: string[]
  errors: string[]
}

export class BuildCommand {
  private static logger: Logger
  private static validator: PluginValidator
  private static optimizer: BuildOptimizer
  private static assetManager: AssetManager

  static async execute(options: BuildOptions): Promise<void> {
    this.logger = new Logger(options)
    this.validator = new PluginValidator(this.logger)
    this.optimizer = new BuildOptimizer(this.logger)
    this.assetManager = new AssetManager(this.logger)

    try {
      // Verify plugin project
      await this.verifyProject()

      // Validate plugin before building
      await this.validatePlugin()

      // Clean output directory
      await this.cleanOutput(options.output)

      // Build plugin
      const stats = await this.buildPlugin(options)

      // Optimize build output
      if (options.mode === 'production') {
        await this.optimizeBuild(options.output)
      }

      // Copy assets
      await this.copyAssets(options.output)

      // Generate build report
      await this.generateBuildReport(stats, options)

      // Show build summary
      this.showBuildSummary(stats, options)

      // Setup watch mode if requested
      if (options.watch) {
        await this.setupWatchMode(options)
      }

    } catch (error) {
      this.logger.error('Build failed:', error.message)
      if (this.logger.isDebug()) {
        this.logger.debug(error.stack)
      }
      process.exit(1)
    }
  }

  private static async verifyProject(): Promise<void> {
    const spinner = ora('Verifying project structure...').start()

    try {
      // Check for package.json
      if (!await fs.pathExists('package.json')) {
        throw new Error('No package.json found')
      }

      // Check for plugin manifest
      if (!await fs.pathExists('src/manifest.json')) {
        throw new Error('No plugin manifest found at src/manifest.json')
      }

      // Check for main entry point
      const packageJson = await fs.readJson('package.json')
      const entryPoint = packageJson.main || 'src/index.ts'
      
      if (!await fs.pathExists(entryPoint)) {
        throw new Error(`Entry point not found: ${entryPoint}`)
      }

      spinner.succeed('Project structure verified')

    } catch (error) {
      spinner.fail('Project verification failed')
      throw error
    }
  }

  private static async validatePlugin(): Promise<void> {
    const spinner = ora('Validating plugin...').start()

    try {
      const result = await this.validator.validateProject('.')
      
      if (!result.isValid) {
        if (result.errors.length > 0) {
          spinner.fail('Plugin validation failed')
          this.logger.error('\nValidation Errors:')
          result.errors.forEach(error => {
            this.logger.error(`  - ${error.message} (${error.file}:${error.line})`)
          })
          throw new Error('Please fix validation errors before building')
        }

        if (result.warnings.length > 0) {
          spinner.warn('Plugin validation completed with warnings')
          this.logger.warn('\nValidation Warnings:')
          result.warnings.forEach(warning => {
            this.logger.warn(`  - ${warning.message} (${warning.file}:${warning.line})`)
          })
        }
      } else {
        spinner.succeed('Plugin validation passed')
      }

    } catch (error) {
      spinner.fail('Plugin validation failed')
      throw error
    }
  }

  private static async cleanOutput(outputDir: string): Promise<void> {
    const spinner = ora('Cleaning output directory...').start()

    try {
      const outputPath = path.resolve(outputDir)
      
      if (await fs.pathExists(outputPath)) {
        await fs.remove(outputPath)
      }
      
      await fs.ensureDir(outputPath)
      
      spinner.succeed('Output directory cleaned')

    } catch (error) {
      spinner.fail('Failed to clean output directory')
      throw error
    }
  }

  private static async buildPlugin(options: BuildOptions): Promise<BuildStats> {
    const spinner = ora('Building plugin...').start()
    const startTime = Date.now()

    try {
      // Build webpack configuration
      const configBuilder = new WebpackConfigBuilder()
      const webpackConfig = await configBuilder.buildProductionConfig({
        mode: options.mode,
        entry: './src/index.ts',
        output: {
          path: path.resolve(options.output),
          filename: 'index.js',
          library: 'CNCPlugin',
          libraryTarget: 'umd',
          globalObject: 'this'
        },
        devtool: options.sourcemap ? 'source-map' : false,
        optimization: {
          minimize: options.minify && options.mode === 'production'
        },
        plugins: []
      })

      // Add bundle analyzer if requested
      if (options.analyze) {
        webpackConfig.plugins!.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: 'bundle-analysis.html',
            openAnalyzer: false,
            generateStatsFile: true,
            statsFilename: 'bundle-stats.json'
          })
        )
      }

      // Run webpack build
      const compiler = webpack(webpackConfig)
      
      const stats = await new Promise<webpack.Stats>((resolve, reject) => {
        compiler.run((err, stats) => {
          if (err) {
            reject(err)
            return
          }
          
          if (stats!.hasErrors()) {
            reject(new Error(stats!.toJson().errors!.map(e => e.message).join('\n')))
            return
          }
          
          resolve(stats!)
        })
      })

      const buildTime = Date.now() - startTime
      const statsJson = stats.toJson()

      // Calculate build statistics
      const buildStats: BuildStats = {
        buildTime,
        bundleSize: this.calculateBundleSize(statsJson),
        assetCount: statsJson.assets?.length || 0,
        chunkCount: statsJson.chunks?.length || 0,
        warnings: statsJson.warnings?.map(w => w.message) || [],
        errors: statsJson.errors?.map(e => e.message) || []
      }

      if (buildStats.warnings.length > 0) {
        spinner.warn(`Build completed with ${buildStats.warnings.length} warning(s)`)
      } else {
        spinner.succeed(`Build completed in ${buildTime}ms`)
      }

      return buildStats

    } catch (error) {
      spinner.fail('Build failed')
      throw error
    }
  }

  private static async optimizeBuild(outputDir: string): Promise<void> {
    const spinner = ora('Optimizing build...').start()

    try {
      await this.optimizer.optimizeBundle(outputDir, {
        minifyCSS: true,
        optimizeImages: true,
        removeUnusedCode: true,
        compressAssets: true
      })

      spinner.succeed('Build optimization completed')

    } catch (error) {
      spinner.warn('Build optimization failed (continuing anyway)')
      this.logger.debug('Optimization error:', error.message)
    }
  }

  private static async copyAssets(outputDir: string): Promise<void> {
    const spinner = ora('Copying assets...').start()

    try {
      // Copy manifest
      await fs.copy('src/manifest.json', path.join(outputDir, 'manifest.json'))

      // Copy assets directory if it exists
      const assetsDir = 'src/assets'
      if (await fs.pathExists(assetsDir)) {
        await fs.copy(assetsDir, path.join(outputDir, 'assets'))
      }

      // Copy locales directory if it exists
      const localesDir = 'src/locales'
      if (await fs.pathExists(localesDir)) {
        await fs.copy(localesDir, path.join(outputDir, 'locales'))
      }

      // Copy config directory if it exists
      const configDir = 'src/config'
      if (await fs.pathExists(configDir)) {
        await fs.copy(configDir, path.join(outputDir, 'config'))
      }

      // Copy additional files specified in package.json
      const packageJson = await fs.readJson('package.json')
      if (packageJson.files) {
        for (const filePattern of packageJson.files) {
          if (filePattern !== 'dist/' && await fs.pathExists(filePattern)) {
            const targetPath = path.join(outputDir, path.basename(filePattern))
            await fs.copy(filePattern, targetPath)
          }
        }
      }

      spinner.succeed('Assets copied successfully')

    } catch (error) {
      spinner.fail('Failed to copy assets')
      throw error
    }
  }

  private static async generateBuildReport(stats: BuildStats, options: BuildOptions): Promise<void> {
    const spinner = ora('Generating build report...').start()

    try {
      const report = {
        buildInfo: {
          timestamp: new Date().toISOString(),
          mode: options.mode,
          version: process.env.npm_package_version || '1.0.0',
          node: process.version,
          platform: process.platform
        },
        stats,
        options: {
          minify: options.minify,
          sourcemap: options.sourcemap,
          analyze: options.analyze
        },
        assets: await this.getAssetManifest(options.output),
        performance: this.analyzePerformance(stats)
      }

      const reportPath = path.join(options.output, 'build-report.json')
      await fs.writeJson(reportPath, report, { spaces: 2 })

      spinner.succeed('Build report generated')

    } catch (error) {
      spinner.warn('Failed to generate build report (continuing anyway)')
      this.logger.debug('Report generation error:', error.message)
    }
  }

  private static async getAssetManifest(outputDir: string): Promise<any[]> {
    const assets = []
    const files = await fs.readdir(outputDir, { withFileTypes: true })

    for (const file of files) {
      if (file.isFile()) {
        const filePath = path.join(outputDir, file.name)
        const stats = await fs.stat(filePath)
        
        assets.push({
          name: file.name,
          size: stats.size,
          type: path.extname(file.name),
          created: stats.birthtime,
          modified: stats.mtime
        })
      }
    }

    return assets
  }

  private static analyzePerformance(stats: BuildStats): any {
    const bundleSizeMB = stats.bundleSize / (1024 * 1024)
    
    return {
      bundleSize: {
        bytes: stats.bundleSize,
        mb: parseFloat(bundleSizeMB.toFixed(2)),
        rating: bundleSizeMB < 0.5 ? 'excellent' : 
                bundleSizeMB < 1 ? 'good' : 
                bundleSizeMB < 2 ? 'average' : 'poor'
      },
      buildTime: {
        ms: stats.buildTime,
        seconds: parseFloat((stats.buildTime / 1000).toFixed(2)),
        rating: stats.buildTime < 5000 ? 'excellent' :
                stats.buildTime < 15000 ? 'good' :
                stats.buildTime < 30000 ? 'average' : 'poor'
      },
      complexity: {
        chunks: stats.chunkCount,
        assets: stats.assetCount,
        rating: stats.chunkCount < 5 ? 'simple' :
                stats.chunkCount < 10 ? 'moderate' : 'complex'
      }
    }
  }

  private static showBuildSummary(stats: BuildStats, options: BuildOptions): void {
    this.logger.success('\n🎉 Build completed successfully!')
    
    this.logger.info('\n📊 Build Statistics:')
    this.logger.info(`  Build Time: ${chalk.cyan(stats.buildTime + 'ms')}`)
    this.logger.info(`  Bundle Size: ${chalk.cyan(this.formatFileSize(stats.bundleSize))}`)
    this.logger.info(`  Assets: ${chalk.cyan(stats.assetCount.toString())}`)
    this.logger.info(`  Chunks: ${chalk.cyan(stats.chunkCount.toString())}`)

    if (stats.warnings.length > 0) {
      this.logger.info(`\n⚠️  Warnings: ${chalk.yellow(stats.warnings.length.toString())}`)
      if (this.logger.isVerbose()) {
        stats.warnings.forEach(warning => {
          this.logger.warn(`  - ${warning}`)
        })
      }
    }

    this.logger.info(`\n📁 Output Directory: ${chalk.cyan(path.resolve(options.output))}`)
    
    if (options.analyze) {
      this.logger.info(`📈 Bundle Analysis: ${chalk.cyan(path.join(options.output, 'bundle-analysis.html'))}`)
    }

    this.logger.info('\n📦 Generated Files:')
    this.logger.info('  - index.js (main bundle)')
    this.logger.info('  - manifest.json (plugin manifest)')
    if (options.sourcemap) {
      this.logger.info('  - index.js.map (source map)')
    }
    this.logger.info('  - assets/ (plugin assets)')
    this.logger.info('  - locales/ (translations)')
    this.logger.info('  - config/ (configuration files)')

    const performance = this.analyzePerformance(stats)
    this.logger.info(`\n🚀 Performance Rating: ${this.getPerformanceColor(performance.bundleSize.rating)}`)

    this.logger.info('\n✨ Next Steps:')
    this.logger.info('  1. Test your plugin: cnc-plugin validate')
    this.logger.info('  2. Package for distribution: cnc-plugin package')
    this.logger.info('  3. Install in CNC Jog Controls: cnc-plugin install')
  }

  private static async setupWatchMode(options: BuildOptions): Promise<void> {
    this.logger.info('\n👀 Watch mode enabled. Press Ctrl+C to stop.')
    
    const chokidar = require('chokidar')
    
    const watcher = chokidar.watch('src/**/*', {
      ignored: ['**/node_modules/**', '**/dist/**'],
      persistent: true,
      ignoreInitial: true
    })

    let buildTimeout: NodeJS.Timeout | null = null

    watcher.on('change', (filePath: string) => {
      this.logger.info(`File changed: ${chalk.cyan(filePath)}`)
      
      // Debounce rebuilds
      if (buildTimeout) {
        clearTimeout(buildTimeout)
      }

      buildTimeout = setTimeout(async () => {
        try {
          this.logger.info('Rebuilding...')
          const stats = await this.buildPlugin(options)
          await this.copyAssets(options.output)
          this.logger.success(`Rebuild completed in ${stats.buildTime}ms`)
        } catch (error) {
          this.logger.error('Rebuild failed:', error.message)
        }
      }, 300)
    })

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.logger.info('\n👋 Stopping watch mode...')
      watcher.close()
      process.exit(0)
    })
  }

  private static calculateBundleSize(stats: any): number {
    return stats.assets?.reduce((total: number, asset: any) => {
      return total + (asset.size || 0)
    }, 0) || 0
  }

  private static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const size = parseFloat((bytes / Math.pow(1024, i)).toFixed(2))
    
    return `${size} ${sizes[i]}`
  }

  private static getPerformanceColor(rating: string): string {
    switch (rating) {
      case 'excellent': return chalk.green(rating)
      case 'good': return chalk.cyan(rating)
      case 'average': return chalk.yellow(rating)
      case 'poor': return chalk.red(rating)
      default: return chalk.gray(rating)
    }
  }
}

// Add to commander program
export function addBuildCommand(program: Command): void {
  program
    .command('build')
    .description('build plugin for production')
    .option('-o, --output <dir>', 'output directory', 'dist')
    .option('--mode <mode>', 'build mode', 'production')
    .option('--minify', 'minify output', true)
    .option('--sourcemap', 'generate source maps')
    .option('--analyze', 'analyze bundle size')
    .option('--watch', 'watch for changes and rebuild')
    .action(BuildCommand.execute)
}