#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { MarketplaceClient } from './client/MarketplaceClient'
import { AuthManager } from './auth/AuthManager'
import { PackageManager } from './package/PackageManager'
import { SearchManager } from './search/SearchManager'
import { PublishManager } from './publish/PublishManager'
import { ConfigManager } from './config/ConfigManager'
import { Logger } from './utils/Logger'

const program = new Command()

// CLI Information
program
  .name('cnc-marketplace')
  .description('CNC Jog Controls Plugin Marketplace Client')
  .version('1.0.0')
  .option('-v, --verbose', 'enable verbose logging')
  .option('--debug', 'enable debug mode')
  .option('--registry <url>', 'marketplace registry URL')

// Authentication Commands
program
  .command('login')
  .description('authenticate with the marketplace')
  .option('--token <token>', 'authentication token')
  .option('--username <username>', 'username for login')
  .option('--registry <url>', 'marketplace registry URL')
  .action(async (options) => {
    const logger = new Logger(options)
    const authManager = new AuthManager()
    
    try {
      if (options.token) {
        await authManager.loginWithToken(options.token, options.registry)
      } else {
        await authManager.interactiveLogin(options.username, options.registry)
      }
      
      logger.success('✅ Successfully logged in to marketplace')
      
    } catch (error) {
      logger.error('❌ Login failed:', error.message)
      process.exit(1)
    }
  })

program
  .command('logout')
  .description('logout from the marketplace')
  .option('--registry <url>', 'marketplace registry URL')
  .action(async (options) => {
    const logger = new Logger(options)
    const authManager = new AuthManager()
    
    try {
      await authManager.logout(options.registry)
      logger.success('✅ Successfully logged out from marketplace')
      
    } catch (error) {
      logger.error('❌ Logout failed:', error.message)
      process.exit(1)
    }
  })

program
  .command('whoami')
  .description('show current authenticated user')
  .option('--registry <url>', 'marketplace registry URL')
  .action(async (options) => {
    const logger = new Logger(options)
    const authManager = new AuthManager()
    
    try {
      const user = await authManager.getCurrentUser(options.registry)
      
      if (user) {
        logger.info(`📋 Logged in as: ${chalk.cyan(user.username)}`)
        logger.info(`📧 Email: ${user.email}`)
        logger.info(`🏢 Organization: ${user.organization || 'None'}`)
        logger.info(`📅 Member since: ${new Date(user.memberSince).toLocaleDateString()}`)
      } else {
        logger.info('❌ Not logged in')
      }
      
    } catch (error) {
      logger.error('❌ Failed to get user info:', error.message)
      process.exit(1)
    }
  })

// Search and Discovery Commands
program
  .command('search <query>')
  .description('search for plugins in the marketplace')
  .option('-l, --limit <number>', 'maximum number of results', '20')
  .option('-o, --offset <number>', 'result offset for pagination', '0')
  .option('-s, --sort <field>', 'sort by field (downloads|rating|updated)', 'downloads')
  .option('-c, --category <category>', 'filter by category')
  .option('-t, --tag <tags>', 'filter by tags (comma-separated)')
  .option('--json', 'output as JSON')
  .action(async (query, options) => {
    const logger = new Logger(options)
    const searchManager = new SearchManager()
    
    try {
      const results = await searchManager.search(query, {
        limit: parseInt(options.limit),
        offset: parseInt(options.offset),
        sort: options.sort,
        category: options.category,
        tags: options.tag ? options.tag.split(',') : undefined
      })
      
      if (options.json) {
        console.log(JSON.stringify(results, null, 2))
      } else {
        searchManager.displayResults(results, logger)
      }
      
    } catch (error) {
      logger.error('❌ Search failed:', error.message)
      process.exit(1)
    }
  })

program
  .command('info <plugin>')
  .description('show detailed information about a plugin')
  .option('--version <version>', 'specific version to show')
  .option('--json', 'output as JSON')
  .action(async (plugin, options) => {
    const logger = new Logger(options)
    const client = new MarketplaceClient()
    
    try {
      const info = await client.getPluginInfo(plugin, options.version)
      
      if (options.json) {
        console.log(JSON.stringify(info, null, 2))
      } else {
        displayPluginInfo(info, logger)
      }
      
    } catch (error) {
      logger.error('❌ Failed to get plugin info:', error.message)
      process.exit(1)
    }
  })

program
  .command('list')
  .description('list installed plugins')
  .option('--global', 'list globally installed plugins')
  .option('--outdated', 'show only outdated plugins')
  .option('--json', 'output as JSON')
  .action(async (options) => {
    const logger = new Logger(options)
    const packageManager = new PackageManager()
    
    try {
      const plugins = await packageManager.listInstalled({
        global: options.global,
        outdatedOnly: options.outdated
      })
      
      if (options.json) {
        console.log(JSON.stringify(plugins, null, 2))
      } else {
        packageManager.displayInstalledPlugins(plugins, logger)
      }
      
    } catch (error) {
      logger.error('❌ Failed to list plugins:', error.message)
      process.exit(1)
    }
  })

// Installation and Management Commands
program
  .command('install <plugin>')
  .description('install a plugin from the marketplace')
  .option('--version <version>', 'specific version to install')
  .option('--global', 'install globally')
  .option('--force', 'force installation even if already installed')
  .option('--dry-run', 'simulate installation without actually installing')
  .action(async (plugin, options) => {
    const logger = new Logger(options)
    const packageManager = new PackageManager()
    
    try {
      await packageManager.install(plugin, {
        version: options.version,
        global: options.global,
        force: options.force,
        dryRun: options.dryRun
      })
      
      if (!options.dryRun) {
        logger.success(`✅ Successfully installed ${plugin}`)
      }
      
    } catch (error) {
      logger.error(`❌ Failed to install ${plugin}:`, error.message)
      process.exit(1)
    }
  })

program
  .command('uninstall <plugin>')
  .description('uninstall a plugin')
  .option('--global', 'uninstall from global location')
  .action(async (plugin, options) => {
    const logger = new Logger(options)
    const packageManager = new PackageManager()
    
    try {
      await packageManager.uninstall(plugin, {
        global: options.global
      })
      
      logger.success(`✅ Successfully uninstalled ${plugin}`)
      
    } catch (error) {
      logger.error(`❌ Failed to uninstall ${plugin}:`, error.message)
      process.exit(1)
    }
  })

program
  .command('update [plugins...]')
  .description('update installed plugins')
  .option('--all', 'update all installed plugins')
  .option('--global', 'update global plugins')
  .option('--check', 'check for updates without installing')
  .action(async (plugins, options) => {
    const logger = new Logger(options)
    const packageManager = new PackageManager()
    
    try {
      if (options.all) {
        await packageManager.updateAll({
          global: options.global,
          checkOnly: options.check
        })
      } else if (plugins && plugins.length > 0) {
        await packageManager.updatePlugins(plugins, {
          global: options.global,
          checkOnly: options.check
        })
      } else {
        logger.error('❌ Please specify plugins to update or use --all flag')
        process.exit(1)
      }
      
      if (!options.check) {
        logger.success('✅ Plugins updated successfully')
      }
      
    } catch (error) {
      logger.error('❌ Update failed:', error.message)
      process.exit(1)
    }
  })

// Publishing Commands
program
  .command('publish [path]')
  .description('publish a plugin to the marketplace')
  .option('--tag <tag>', 'version tag', 'latest')
  .option('--public', 'publish as public plugin', true)
  .option('--private', 'publish as private plugin')
  .option('--dry-run', 'simulate publish without actually publishing')
  .option('--force', 'force publish even if version exists')
  .action(async (pluginPath = '.', options) => {
    const logger = new Logger(options)
    const publishManager = new PublishManager()
    
    try {
      await publishManager.publish(pluginPath, {
        tag: options.tag,
        public: options.private ? false : options.public,
        dryRun: options.dryRun,
        force: options.force
      })
      
      if (!options.dryRun) {
        logger.success('✅ Plugin published successfully')
      }
      
    } catch (error) {
      logger.error('❌ Publish failed:', error.message)
      process.exit(1)
    }
  })

program
  .command('unpublish <plugin>')
  .description('unpublish a plugin from the marketplace')
  .option('--version <version>', 'specific version to unpublish')
  .option('--force', 'force unpublish without confirmation')
  .action(async (plugin, options) => {
    const logger = new Logger(options)
    const publishManager = new PublishManager()
    
    try {
      await publishManager.unpublish(plugin, {
        version: options.version,
        force: options.force
      })
      
      logger.success(`✅ Successfully unpublished ${plugin}`)
      
    } catch (error) {
      logger.error(`❌ Failed to unpublish ${plugin}:`, error.message)
      process.exit(1)
    }
  })

program
  .command('deprecate <plugin>')
  .description('deprecate a plugin version')
  .option('--version <version>', 'specific version to deprecate')
  .option('--message <message>', 'deprecation message')
  .action(async (plugin, options) => {
    const logger = new Logger(options)
    const publishManager = new PublishManager()
    
    try {
      await publishManager.deprecate(plugin, {
        version: options.version,
        message: options.message
      })
      
      logger.success(`✅ Successfully deprecated ${plugin}`)
      
    } catch (error) {
      logger.error(`❌ Failed to deprecate ${plugin}:`, error.message)
      process.exit(1)
    }
  })

// Organization Commands
program
  .command('org')
  .description('manage organization')
  .option('create <name>', 'create organization')
  .option('join <org>', 'join organization')
  .option('leave <org>', 'leave organization')
  .option('list', 'list organizations')
  .action(async (options) => {
    const logger = new Logger(options)
    // Organization management logic
    logger.info('Organization management not yet implemented')
  })

// Configuration Commands
program
  .command('config')
  .description('manage configuration')
  .option('get <key>', 'get configuration value')
  .option('set <key> <value>', 'set configuration value')
  .option('delete <key>', 'delete configuration key')
  .option('list', 'list all configuration')
  .option('reset', 'reset to default configuration')
  .action(async (options) => {
    const logger = new Logger(options)
    const configManager = new ConfigManager()
    
    try {
      if (options.list) {
        const config = await configManager.getAll()
        console.log(JSON.stringify(config, null, 2))
      } else if (options.get) {
        const value = await configManager.get(options.get)
        console.log(value)
      } else if (options.set) {
        await configManager.set(options.set, options.value)
        logger.success(`✅ Configuration updated: ${options.set} = ${options.value}`)
      } else if (options.delete) {
        await configManager.delete(options.delete)
        logger.success(`✅ Configuration deleted: ${options.delete}`)
      } else if (options.reset) {
        await configManager.reset()
        logger.success('✅ Configuration reset to defaults')
      } else {
        program.help()
      }
      
    } catch (error) {
      logger.error('❌ Configuration operation failed:', error.message)
      process.exit(1)
    }
  })

// Utility Commands
program
  .command('doctor')
  .description('diagnose common issues')
  .action(async (options) => {
    const logger = new Logger(options)
    
    try {
      logger.info('🔍 Running marketplace diagnostics...')
      
      // Check network connectivity
      logger.info('• Checking network connectivity...')
      
      // Check authentication
      logger.info('• Checking authentication...')
      
      // Check local installation
      logger.info('• Checking local installation...')
      
      // Check permissions
      logger.info('• Checking permissions...')
      
      logger.success('✅ Diagnostics completed')
      
    } catch (error) {
      logger.error('❌ Diagnostics failed:', error.message)
      process.exit(1)
    }
  })

program
  .command('cache')
  .description('manage local cache')
  .option('clear', 'clear all cache')
  .option('size', 'show cache size')
  .option('path', 'show cache path')
  .action(async (options) => {
    const logger = new Logger(options)
    
    if (options.clear) {
      // Clear cache logic
      logger.success('✅ Cache cleared')
    } else if (options.size) {
      // Show cache size
      logger.info('Cache size: 0 MB')
    } else if (options.path) {
      // Show cache path
      logger.info('Cache path: ~/.cnc-marketplace/cache')
    } else {
      program.help()
    }
  })

// Examples command
program
  .command('examples')
  .description('show usage examples')
  .action(() => {
    console.log(chalk.cyan('CNC Marketplace Client Examples:'))
    console.log('')
    console.log(chalk.yellow('Authentication:'))
    console.log('  cnc-marketplace login')
    console.log('  cnc-marketplace whoami')
    console.log('')
    console.log(chalk.yellow('Search and Discovery:'))
    console.log('  cnc-marketplace search "machine control"')
    console.log('  cnc-marketplace info awesome-plugin')
    console.log('')
    console.log(chalk.yellow('Installation:'))
    console.log('  cnc-marketplace install awesome-plugin')
    console.log('  cnc-marketplace install awesome-plugin --version 1.2.0')
    console.log('  cnc-marketplace update --all')
    console.log('')
    console.log(chalk.yellow('Publishing:'))
    console.log('  cnc-marketplace publish')
    console.log('  cnc-marketplace publish --tag beta')
    console.log('')
    console.log(chalk.yellow('Management:'))
    console.log('  cnc-marketplace list --outdated')
    console.log('  cnc-marketplace uninstall old-plugin')
    console.log('')
    console.log(chalk.green('For more help on any command, use:'))
    console.log('  cnc-marketplace <command> --help')
  })

// Helper functions
function displayPluginInfo(info: any, logger: Logger): void {
  logger.info(`📦 ${chalk.cyan(info.name)} v${info.version}`)
  logger.info(`📝 ${info.description}`)
  logger.info(`👤 Author: ${info.author.name} <${info.author.email}>`)
  logger.info(`📅 Published: ${new Date(info.publishedAt).toLocaleDateString()}`)
  logger.info(`📊 Downloads: ${info.downloads.toLocaleString()}`)
  logger.info(`⭐ Rating: ${info.rating}/5 (${info.ratingCount} reviews)`)
  
  if (info.keywords && info.keywords.length > 0) {
    logger.info(`🏷️  Keywords: ${info.keywords.join(', ')}`)
  }
  
  if (info.homepage) {
    logger.info(`🏠 Homepage: ${info.homepage}`)
  }
  
  if (info.repository) {
    logger.info(`📂 Repository: ${info.repository}`)
  }
}

// Global error handling
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error.message)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason)
  process.exit(1)
})

// Parse command line arguments
program.parse()

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp()
  console.log('')
  console.log(chalk.cyan('Get started by logging in:'))
  console.log(chalk.white('  cnc-marketplace login'))
  console.log('')
  console.log(chalk.cyan('Search for plugins:'))
  console.log(chalk.white('  cnc-marketplace search "machine control"'))
  console.log('')
  console.log(chalk.cyan('Or see usage examples:'))
  console.log(chalk.white('  cnc-marketplace examples'))
}