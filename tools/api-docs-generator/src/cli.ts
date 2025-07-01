#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { ApiDocumentationGenerator } from './generator/ApiDocumentationGenerator'
import { TypeScriptAnalyzer } from './analyzer/TypeScriptAnalyzer'
import { MarkdownRenderer } from './renderer/MarkdownRenderer'
import { InteractiveGenerator } from './generator/InteractiveGenerator'
import { ConfigManager } from './utils/ConfigManager'
import { Logger } from './utils/Logger'

const program = new Command()

// CLI Information
program
  .name('cnc-api-docs')
  .description('Generate comprehensive API documentation for CNC Jog Controls plugins')
  .version('1.0.0')
  .option('-v, --verbose', 'enable verbose logging')
  .option('--debug', 'enable debug mode')
  .option('--silent', 'suppress output')

// Generate command
program
  .command('generate [source]')
  .description('generate API documentation from TypeScript source')
  .option('-o, --output <dir>', 'output directory', 'docs/api')
  .option('-c, --config <file>', 'configuration file', 'api-docs.config.js')
  .option('-f, --format <format>', 'output format (markdown|html|json)', 'markdown')
  .option('-t, --template <template>', 'documentation template', 'default')
  .option('--include <patterns>', 'file patterns to include')
  .option('--exclude <patterns>', 'file patterns to exclude')
  .option('--private', 'include private members')
  .option('--internal', 'include internal members')
  .option('--examples', 'generate usage examples')
  .option('--interactive', 'generate interactive documentation')
  .action(async (source = 'src', options) => {
    const logger = new Logger(options)
    
    try {
      logger.info('🚀 Starting API documentation generation...')
      
      const generator = new ApiDocumentationGenerator({
        sourceDir: source,
        outputDir: options.output,
        format: options.format,
        template: options.template,
        includePrivate: options.private,
        includeInternal: options.internal,
        generateExamples: options.examples,
        interactive: options.interactive,
        includePatterns: options.include ? options.include.split(',') : undefined,
        excludePatterns: options.exclude ? options.exclude.split(',') : undefined,
        configFile: options.config
      })
      
      await generator.generate()
      
      logger.success('✨ API documentation generated successfully!')
      logger.info(`📁 Output directory: ${chalk.cyan(options.output)}`)
      
    } catch (error) {
      logger.error('❌ Documentation generation failed:', error.message)
      if (logger.isDebug()) {
        logger.debug(error.stack)
      }
      process.exit(1)
    }
  })

// Interactive command
program
  .command('interactive')
  .description('interactive documentation generator with live preview')
  .option('-p, --port <port>', 'preview server port', '3002')
  .option('-o, --output <dir>', 'output directory', 'docs/api')
  .option('--watch', 'watch for file changes', true)
  .action(async (options) => {
    const logger = new Logger(options)
    
    try {
      logger.info('🎯 Starting interactive documentation generator...')
      
      const generator = new InteractiveGenerator({
        port: parseInt(options.port),
        outputDir: options.output,
        watch: options.watch
      })
      
      await generator.start()
      
    } catch (error) {
      logger.error('❌ Interactive generator failed:', error.message)
      process.exit(1)
    }
  })

// Analyze command
program
  .command('analyze [source]')
  .description('analyze TypeScript source and show API structure')
  .option('--json', 'output as JSON')
  .option('--tree', 'show hierarchical tree view')
  .option('--stats', 'show statistics')
  .action(async (source = 'src', options) => {
    const logger = new Logger(options)
    
    try {
      logger.info('🔍 Analyzing TypeScript source...')
      
      const analyzer = new TypeScriptAnalyzer()
      const analysis = await analyzer.analyzeProject(source)
      
      if (options.json) {
        console.log(JSON.stringify(analysis, null, 2))
      } else if (options.tree) {
        analyzer.printTreeView(analysis)
      } else if (options.stats) {
        analyzer.printStatistics(analysis)
      } else {
        analyzer.printSummary(analysis)
      }
      
    } catch (error) {
      logger.error('❌ Analysis failed:', error.message)
      process.exit(1)
    }
  })

// Init command
program
  .command('init')
  .description('initialize API documentation configuration')
  .option('-f, --force', 'overwrite existing configuration')
  .action(async (options) => {
    const logger = new Logger(options)
    
    try {
      logger.info('⚙️ Initializing API documentation configuration...')
      
      const configManager = new ConfigManager()
      await configManager.initializeConfig(options.force)
      
      logger.success('✅ Configuration initialized successfully!')
      logger.info('📝 Edit api-docs.config.js to customize documentation generation')
      
    } catch (error) {
      logger.error('❌ Configuration initialization failed:', error.message)
      process.exit(1)
    }
  })

// Validate command
program
  .command('validate [source]')
  .description('validate API documentation completeness and quality')
  .option('--coverage', 'show documentation coverage')
  .option('--missing', 'show missing documentation')
  .option('--quality', 'check documentation quality')
  .action(async (source = 'src', options) => {
    const logger = new Logger(options)
    
    try {
      logger.info('✅ Validating API documentation...')
      
      const analyzer = new TypeScriptAnalyzer()
      const validation = await analyzer.validateDocumentation(source, {
        checkCoverage: options.coverage,
        showMissing: options.missing,
        checkQuality: options.quality
      })
      
      if (validation.isValid) {
        logger.success('✨ Documentation validation passed!')
      } else {
        logger.warn('⚠️ Documentation validation found issues:')
        validation.issues.forEach(issue => {
          logger.warn(`  - ${issue.message} (${issue.file}:${issue.line})`)
        })
      }
      
      if (options.coverage) {
        logger.info(`📊 Documentation coverage: ${validation.coverage}%`)
      }
      
    } catch (error) {
      logger.error('❌ Validation failed:', error.message)
      process.exit(1)
    }
  })

// Serve command
program
  .command('serve [docs]')
  .description('serve generated documentation with live preview')
  .option('-p, --port <port>', 'server port', '3003')
  .option('-o, --open', 'open browser automatically')
  .action(async (docs = 'docs/api', options) => {
    const logger = new Logger(options)
    
    try {
      logger.info('🌐 Starting documentation server...')
      
      const { DocumentationServer } = await import('./server/DocumentationServer')
      const server = new DocumentationServer({
        docsDir: docs,
        port: parseInt(options.port),
        openBrowser: options.open
      })
      
      await server.start()
      
    } catch (error) {
      logger.error('❌ Server failed to start:', error.message)
      process.exit(1)
    }
  })

// Export command
program
  .command('export [docs]')
  .description('export documentation to various formats')
  .option('-f, --format <format>', 'export format (pdf|docx|html)', 'pdf')
  .option('-o, --output <file>', 'output file')
  .option('--theme <theme>', 'export theme', 'default')
  .action(async (docs = 'docs/api', options) => {
    const logger = new Logger(options)
    
    try {
      logger.info(`📄 Exporting documentation to ${options.format.toUpperCase()}...`)
      
      const { DocumentationExporter } = await import('./exporter/DocumentationExporter')
      const exporter = new DocumentationExporter({
        docsDir: docs,
        format: options.format,
        outputFile: options.output,
        theme: options.theme
      })
      
      const outputFile = await exporter.export()
      
      logger.success(`✅ Documentation exported to: ${chalk.cyan(outputFile)}`)
      
    } catch (error) {
      logger.error('❌ Export failed:', error.message)
      process.exit(1)
    }
  })

// Examples command
program
  .command('examples')
  .description('show usage examples')
  .action(() => {
    console.log(chalk.cyan('CNC API Documentation Generator Examples:'))
    console.log('')
    console.log(chalk.yellow('Generate basic documentation:'))
    console.log('  cnc-api-docs generate src --output docs/api')
    console.log('')
    console.log(chalk.yellow('Generate with examples and interactive features:'))
    console.log('  cnc-api-docs generate src --examples --interactive')
    console.log('')
    console.log(chalk.yellow('Start interactive generator:'))
    console.log('  cnc-api-docs interactive --port 3002 --watch')
    console.log('')
    console.log(chalk.yellow('Analyze project structure:'))
    console.log('  cnc-api-docs analyze src --tree --stats')
    console.log('')
    console.log(chalk.yellow('Validate documentation coverage:'))
    console.log('  cnc-api-docs validate src --coverage --missing')
    console.log('')
    console.log(chalk.yellow('Serve documentation with live preview:'))
    console.log('  cnc-api-docs serve docs/api --port 3003 --open')
    console.log('')
    console.log(chalk.yellow('Export to PDF:'))
    console.log('  cnc-api-docs export docs/api --format pdf --output api-docs.pdf')
    console.log('')
    console.log(chalk.green('For more help on any command, use:'))
    console.log('  cnc-api-docs <command> --help')
  })

// Global error handling
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error.message)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason)
  process.exit(1)
})

// Custom help
program.on('--help', () => {
  console.log('')
  console.log(chalk.cyan('Documentation:'))
  console.log('  https://docs.cnc-jog-controls.com/plugins/api-docs/')
  console.log('')
  console.log(chalk.cyan('Examples:'))
  console.log('  cnc-api-docs examples')
  console.log('')
  console.log(chalk.cyan('Issues:'))
  console.log('  https://github.com/cnc-jog-controls/api-docs-generator/issues')
})

// Parse command line arguments
program.parse()

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp()
  console.log('')
  console.log(chalk.cyan('Get started by initializing configuration:'))
  console.log(chalk.white('  cnc-api-docs init'))
  console.log('')
  console.log(chalk.cyan('Then generate documentation:'))
  console.log(chalk.white('  cnc-api-docs generate src'))
  console.log('')
  console.log(chalk.cyan('Or see usage examples:'))
  console.log(chalk.white('  cnc-api-docs examples'))
}