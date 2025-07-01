import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import express from 'express'
import { WebSocketServer } from 'ws'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import chokidar from 'chokidar'
import path from 'path'
import fs from 'fs-extra'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { WebpackConfigBuilder } from '../utils/webpack-config'
import { PluginValidator } from '../utils/plugin-validator'
import { Logger } from '../utils/logger'
import { ConfigManager } from '../utils/config-manager'
import { PluginLoader } from '../utils/plugin-loader'

interface DevOptions {
  port: string | number
  host: string
  open: boolean
  watch: boolean
  poll: boolean
  hot: boolean
}

interface DevServerInfo {
  port: number
  host: string
  protocol: 'http' | 'https'
  url: string
}

export class DevCommand {
  private static logger: Logger
  private static config: ConfigManager
  private static validator: PluginValidator
  private static pluginLoader: PluginLoader
  private static wsServer: WebSocketServer | null = null
  private static watchers: chokidar.FSWatcher[] = []

  static async execute(options: DevOptions): Promise<void> {
    this.logger = new Logger(options)
    this.config = new ConfigManager()
    this.validator = new PluginValidator(this.logger)
    this.pluginLoader = new PluginLoader(this.logger)

    try {
      // Verify we're in a plugin project
      await this.verifyPluginProject()

      // Validate plugin configuration
      await this.validatePlugin()

      // Setup development server
      const serverInfo = await this.setupDevServer(options)

      // Setup file watching
      if (options.watch) {
        await this.setupFileWatching(options)
      }

      // Setup hot reload
      if (options.hot) {
        await this.setupHotReload(serverInfo)
      }

      // Show development info
      this.showDevInfo(serverInfo, options)

      // Handle graceful shutdown
      this.setupGracefulShutdown()

    } catch (error) {
      this.logger.error('Development server failed to start:', error.message)
      if (this.logger.isDebug()) {
        this.logger.debug(error.stack)
      }
      process.exit(1)
    }
  }

  private static async verifyPluginProject(): Promise<void> {
    const spinner = ora('Verifying plugin project...').start()

    try {
      // Check for package.json
      const packageJsonPath = path.resolve('package.json')
      if (!await fs.pathExists(packageJsonPath)) {
        throw new Error('No package.json found. Are you in a plugin project directory?')
      }

      // Check for plugin manifest
      const manifestPath = path.resolve('src/manifest.json')
      if (!await fs.pathExists(manifestPath)) {
        throw new Error('No plugin manifest found at src/manifest.json')
      }

      // Check for main entry point
      const packageJson = await fs.readJson(packageJsonPath)
      const mainFile = packageJson.main || 'src/index.ts'
      const mainPath = path.resolve(mainFile)
      
      if (!await fs.pathExists(mainPath)) {
        throw new Error(`Main entry point not found: ${mainFile}`)
      }

      spinner.succeed('Plugin project verified')

    } catch (error) {
      spinner.fail('Plugin project verification failed')
      throw error
    }
  }

  private static async validatePlugin(): Promise<void> {
    const spinner = ora('Validating plugin configuration...').start()

    try {
      const validationResult = await this.validator.validateProject('.')
      
      if (!validationResult.isValid) {
        spinner.warn('Plugin validation completed with issues')
        
        // Show errors
        if (validationResult.errors.length > 0) {
          this.logger.error('\nValidation Errors:')
          validationResult.errors.forEach(error => {
            this.logger.error(`  - ${error.message} (${error.file}:${error.line})`)
          })
        }

        // Show warnings
        if (validationResult.warnings.length > 0) {
          this.logger.warn('\nValidation Warnings:')
          validationResult.warnings.forEach(warning => {
            this.logger.warn(`  - ${warning.message} (${warning.file}:${warning.line})`)
          })
        }

        // Continue with warnings, but fail on errors
        if (validationResult.errors.length > 0) {
          throw new Error('Plugin validation failed. Please fix errors before continuing.')
        }
      } else {
        spinner.succeed('Plugin validation passed')
      }

    } catch (error) {
      spinner.fail('Plugin validation failed')
      throw error
    }
  }

  private static async setupDevServer(options: DevOptions): Promise<DevServerInfo> {
    const spinner = ora('Starting development server...').start()

    try {
      // Build webpack configuration
      const configBuilder = new WebpackConfigBuilder()
      const webpackConfig = await configBuilder.buildDevConfig({
        mode: 'development',
        hot: options.hot,
        devtool: 'eval-source-map',
        entry: './src/index.ts',
        output: {
          path: path.resolve('dist'),
          filename: 'index.js'
        }
      })

      // Create webpack compiler
      const compiler = webpack(webpackConfig)

      // Setup dev server configuration
      const port = parseInt(options.port as string) || 3001
      const host = options.host || 'localhost'

      const devServerConfig: WebpackDevServer.Configuration = {
        host,
        port,
        hot: options.hot,
        liveReload: !options.hot,
        open: options.open,
        compress: true,
        historyApiFallback: true,
        static: {
          directory: path.resolve('src/assets'),
          publicPath: '/assets'
        },
        client: {
          logging: 'warn',
          overlay: {
            errors: true,
            warnings: false
          },
          progress: true
        },
        devMiddleware: {
          publicPath: '/',
          stats: 'minimal'
        },
        setupMiddlewares: (middlewares, devServer) => {
          // Add plugin API proxy
          middlewares.unshift({
            name: 'plugin-api-proxy',
            middleware: createProxyMiddleware('/api/plugin', {
              target: 'http://localhost:8080', // Main CNC app API
              changeOrigin: true,
              pathRewrite: {
                '^/api/plugin': '/api'
              }
            })
          })

          // Add plugin loader middleware
          middlewares.unshift({
            name: 'plugin-loader',
            path: '/plugin',
            middleware: async (req, res, next) => {
              try {
                const plugin = await this.pluginLoader.loadDevelopmentPlugin('.')
                res.json({
                  status: 'success',
                  plugin: {
                    name: plugin.manifest.name,
                    version: plugin.manifest.version,
                    loaded: true
                  }
                })
              } catch (error) {
                res.status(500).json({
                  status: 'error',
                  message: error.message
                })
              }
            }
          })

          return middlewares
        }
      }

      // Create and start dev server
      const devServer = new WebpackDevServer(devServerConfig, compiler)
      
      await devServer.start()

      const protocol = devServerConfig.https ? 'https' : 'http'
      const url = `${protocol}://${host}:${port}`

      spinner.succeed(`Development server started at ${chalk.cyan(url)}`)

      return {
        port,
        host,
        protocol,
        url
      }

    } catch (error) {
      spinner.fail('Failed to start development server')
      throw error
    }
  }

  private static async setupFileWatching(options: DevOptions): Promise<void> {
    const spinner = ora('Setting up file watching...').start()

    try {
      const watchOptions: chokidar.WatchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/dist/**',
          '**/coverage/**',
          '**/.git/**',
          '**/*.log'
        ],
        persistent: true,
        ignoreInitial: true
      }

      if (options.poll) {
        watchOptions.usePolling = true
        watchOptions.interval = 300
      }

      // Watch source files
      const srcWatcher = chokidar.watch('src/**/*', watchOptions)
      this.watchers.push(srcWatcher)

      srcWatcher.on('change', async (filePath) => {
        this.logger.info(`File changed: ${chalk.cyan(filePath)}`)
        
        try {
          // Re-validate if manifest changed
          if (filePath.endsWith('manifest.json')) {
            await this.validator.validateManifest(filePath)
            this.notifyClients('manifest-changed', { file: filePath })
          }

          // Notify clients of change
          this.notifyClients('file-changed', { file: filePath })

        } catch (error) {
          this.logger.error(`Validation error in ${filePath}:`, error.message)
          this.notifyClients('validation-error', {
            file: filePath,
            error: error.message
          })
        }
      })

      srcWatcher.on('add', (filePath) => {
        this.logger.info(`File added: ${chalk.green(filePath)}`)
        this.notifyClients('file-added', { file: filePath })
      })

      srcWatcher.on('unlink', (filePath) => {
        this.logger.info(`File removed: ${chalk.red(filePath)}`)
        this.notifyClients('file-removed', { file: filePath })
      })

      // Watch package.json
      const packageWatcher = chokidar.watch('package.json', watchOptions)
      this.watchers.push(packageWatcher)

      packageWatcher.on('change', async () => {
        this.logger.info('Package configuration changed, restarting...')
        // In a real implementation, this might trigger a restart
        this.notifyClients('package-changed', {})
      })

      spinner.succeed('File watching enabled')

    } catch (error) {
      spinner.fail('Failed to setup file watching')
      throw error
    }
  }

  private static async setupHotReload(serverInfo: DevServerInfo): Promise<void> {
    const spinner = ora('Setting up hot reload...').start()

    try {
      // Create WebSocket server for hot reload
      this.wsServer = new WebSocketServer({
        port: serverInfo.port + 1000, // Use offset port for WebSocket
        host: serverInfo.host
      })

      this.wsServer.on('connection', (ws) => {
        this.logger.debug('Hot reload client connected')

        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message.toString())
            this.handleClientMessage(data, ws)
          } catch (error) {
            this.logger.debug('Invalid WebSocket message:', message.toString())
          }
        })

        ws.on('close', () => {
          this.logger.debug('Hot reload client disconnected')
        })

        // Send initial connection message
        ws.send(JSON.stringify({
          type: 'connected',
          serverInfo
        }))
      })

      spinner.succeed(`Hot reload enabled on port ${serverInfo.port + 1000}`)

    } catch (error) {
      spinner.fail('Failed to setup hot reload')
      throw error
    }
  }

  private static handleClientMessage(data: any, ws: any): void {
    switch (data.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }))
        break

      case 'get-status':
        ws.send(JSON.stringify({
          type: 'status',
          data: {
            server: 'running',
            plugin: 'loaded',
            watching: this.watchers.length > 0
          }
        }))
        break

      case 'reload-plugin':
        this.reloadPlugin()
        break

      default:
        this.logger.debug('Unknown client message type:', data.type)
    }
  }

  private static notifyClients(type: string, data: any): void {
    if (this.wsServer) {
      const message = JSON.stringify({ type, data, timestamp: Date.now() })
      
      this.wsServer.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(message)
        }
      })
    }
  }

  private static async reloadPlugin(): Promise<void> {
    try {
      this.logger.info('Reloading plugin...')
      
      // Re-validate plugin
      await this.validatePlugin()
      
      // Reload plugin in development environment
      const plugin = await this.pluginLoader.reloadPlugin('.')
      
      this.notifyClients('plugin-reloaded', {
        name: plugin.manifest.name,
        version: plugin.manifest.version
      })
      
      this.logger.success('Plugin reloaded successfully')

    } catch (error) {
      this.logger.error('Plugin reload failed:', error.message)
      this.notifyClients('reload-error', { error: error.message })
    }
  }

  private static showDevInfo(serverInfo: DevServerInfo, options: DevOptions): void {
    this.logger.info('')
    this.logger.success('🚀 Development server is ready!')
    this.logger.info('')
    this.logger.info('Server Information:')
    this.logger.info(`  Local:   ${chalk.cyan(serverInfo.url)}`)
    this.logger.info(`  Network: ${chalk.cyan(`${serverInfo.protocol}://${this.getNetworkAddress()}:${serverInfo.port}`)}`)
    
    if (options.hot) {
      this.logger.info(`  Hot Reload: ${chalk.cyan(`ws://${serverInfo.host}:${serverInfo.port + 1000}`)}`)
    }
    
    this.logger.info('')
    this.logger.info('Development Features:')
    this.logger.info(`  Hot Reload: ${options.hot ? chalk.green('✓') : chalk.gray('✗')}`)
    this.logger.info(`  File Watching: ${options.watch ? chalk.green('✓') : chalk.gray('✗')}`)
    this.logger.info(`  Auto Open: ${options.open ? chalk.green('✓') : chalk.gray('✗')}`)
    
    this.logger.info('')
    this.logger.info('Available Commands:')
    this.logger.info('  Press r to reload the plugin')
    this.logger.info('  Press o to open in browser')
    this.logger.info('  Press c to clear console')
    this.logger.info('  Press q to quit')
    this.logger.info('')

    // Setup keyboard input handling
    this.setupKeyboardHandling(serverInfo)
  }

  private static setupKeyboardHandling(serverInfo: DevServerInfo): void {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true)
      process.stdin.resume()
      process.stdin.setEncoding('utf8')

      process.stdin.on('data', (key) => {
        const keyStr = key.toString()

        switch (keyStr) {
          case 'r':
            this.reloadPlugin()
            break

          case 'o':
            this.openBrowser(serverInfo.url)
            break

          case 'c':
            console.clear()
            this.showDevInfo(serverInfo, { 
              hot: true, 
              watch: true, 
              open: false,
              host: serverInfo.host,
              port: serverInfo.port
            })
            break

          case 'q':
          case '\u0003': // Ctrl+C
            this.gracefulShutdown()
            break
        }
      })
    }
  }

  private static openBrowser(url: string): void {
    const open = require('open')
    open(url).catch((error: Error) => {
      this.logger.warn('Failed to open browser:', error.message)
    })
  }

  private static getNetworkAddress(): string {
    const os = require('os')
    const interfaces = os.networkInterfaces()
    
    for (const name of Object.keys(interfaces)) {
      for (const interface_ of interfaces[name]) {
        if (interface_.family === 'IPv4' && !interface_.internal) {
          return interface_.address
        }
      }
    }
    
    return 'localhost'
  }

  private static setupGracefulShutdown(): void {
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGUSR2']
    
    signals.forEach((signal) => {
      process.on(signal, () => {
        this.gracefulShutdown()
      })
    })
  }

  private static gracefulShutdown(): void {
    this.logger.info('\n👋 Shutting down development server...')

    // Close WebSocket server
    if (this.wsServer) {
      this.wsServer.close()
    }

    // Close file watchers
    this.watchers.forEach(watcher => {
      watcher.close()
    })

    // Reset terminal
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false)
    }

    this.logger.success('Development server stopped')
    process.exit(0)
  }
}

// Add to commander program
export function addDevCommand(program: Command): void {
  program
    .command('dev')
    .description('start development server with hot reload')
    .option('-p, --port <port>', 'development server port', '3001')
    .option('-h, --host <host>', 'development server host', 'localhost')
    .option('--open', 'open browser automatically')
    .option('--watch', 'watch for file changes', true)
    .option('--poll', 'use polling for file watching')
    .option('--hot', 'enable hot module replacement', true)
    .action(DevCommand.execute)
}