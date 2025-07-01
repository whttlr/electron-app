#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { CreateCommand } from './commands/create'
import { BuildCommand } from './commands/build'
import { DevCommand } from './commands/dev'
import { TestCommand } from './commands/test'
import { ValidateCommand } from './commands/validate'
import { PackageCommand } from './commands/package'
import { PublishCommand } from './commands/publish'
import { ConfigCommand } from './commands/config'
import { ListCommand } from './commands/list'
import { InstallCommand } from './commands/install'
import { UninstallCommand } from './commands/uninstall'
import { UpdateCommand } from './commands/update'
import { DoctorCommand } from './commands/doctor'
import { LoginCommand } from './commands/login'
import { LogoutCommand } from './commands/logout'
import { TemplateCommand } from './commands/template'
import { InitCommand } from './commands/init'
import { CleanCommand } from './commands/clean'
import { InfoCommand } from './commands/info'

const program = new Command()

// CLI Information
program
  .name('cnc-plugin')
  .description('CNC Jog Controls Plugin Development CLI')
  .version('1.0.0')
  .option('-v, --verbose', 'enable verbose logging')
  .option('--debug', 'enable debug mode')
  .option('--silent', 'suppress output')

// Global error handling
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error.message)
  if (program.opts().debug) {
    console.error(error.stack)
  }
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason)
  if (program.opts().debug) {
    console.error(reason)
  }
  process.exit(1)
})

// Commands

// Plugin Creation and Initialization
program
  .command('create <name>')
  .description('create a new plugin project')
  .option('-t, --template <template>', 'plugin template to use', 'basic')
  .option('-d, --directory <dir>', 'target directory', '.')
  .option('--no-install', 'skip npm install')
  .option('--no-git', 'skip git initialization')
  .action(CreateCommand.execute)

program
  .command('init')
  .description('initialize plugin project in current directory')
  .option('-t, --template <template>', 'plugin template to use', 'basic')
  .option('--force', 'overwrite existing files')
  .action(InitCommand.execute)

// Development Commands
program
  .command('dev')
  .description('start development server with hot reload')
  .option('-p, --port <port>', 'development server port', '3001')
  .option('-h, --host <host>', 'development server host', 'localhost')
  .option('--open', 'open browser automatically')
  .option('--watch', 'watch for file changes')
  .option('--poll', 'use polling for file watching')
  .option('--hot', 'enable hot module replacement')
  .action(DevCommand.execute)

program
  .command('build')
  .description('build plugin for production')
  .option('-o, --output <dir>', 'output directory', 'dist')
  .option('--mode <mode>', 'build mode', 'production')
  .option('--minify', 'minify output')
  .option('--sourcemap', 'generate source maps')
  .option('--analyze', 'analyze bundle size')
  .option('--watch', 'watch for changes and rebuild')
  .action(BuildCommand.execute)

// Testing Commands
program
  .command('test')
  .description('run plugin tests')
  .option('--watch', 'watch for changes and re-run tests')
  .option('--coverage', 'generate coverage report')
  .option('--verbose', 'verbose test output')
  .option('--silent', 'minimal test output')
  .option('--bail', 'stop on first test failure')
  .option('--updateSnapshot', 'update test snapshots')
  .action(TestCommand.execute)

// Validation and Quality
program
  .command('validate')
  .description('validate plugin configuration and code')
  .option('--manifest', 'validate manifest only')
  .option('--typescript', 'type check TypeScript files')
  .option('--lint', 'run ESLint')
  .option('--security', 'run security checks')
  .option('--performance', 'run performance analysis')
  .action(ValidateCommand.execute)

program
  .command('doctor')
  .description('diagnose common issues and environment problems')
  .option('--fix', 'attempt to fix issues automatically')
  .action(DoctorCommand.execute)

// Packaging and Distribution
program
  .command('package')
  .description('package plugin for distribution')
  .option('-o, --output <file>', 'output file path')
  .option('--format <format>', 'package format (zip|tar)', 'zip')
  .option('--include <patterns>', 'additional files to include')
  .option('--exclude <patterns>', 'files to exclude')
  .option('--sign', 'sign the package')
  .action(PackageCommand.execute)

program
  .command('publish')
  .description('publish plugin to marketplace')
  .option('--registry <url>', 'plugin registry URL')
  .option('--tag <tag>', 'version tag', 'latest')
  .option('--dry-run', 'simulate publish without actually publishing')
  .option('--public', 'publish as public plugin')
  .option('--private', 'publish as private plugin')
  .action(PublishCommand.execute)

// Plugin Management
program
  .command('install <plugin>')
  .description('install a plugin from marketplace or file')
  .option('--version <version>', 'specific version to install')
  .option('--force', 'force installation even if already installed')
  .option('--dev', 'install as development dependency')
  .option('--global', 'install globally')
  .action(InstallCommand.execute)

program
  .command('uninstall <plugin>')
  .description('uninstall a plugin')
  .option('--global', 'uninstall from global location')
  .action(UninstallCommand.execute)

program
  .command('update [plugins...]')
  .description('update plugins to latest versions')
  .option('--all', 'update all installed plugins')
  .option('--global', 'update global plugins')
  .option('--check', 'check for updates without installing')
  .action(UpdateCommand.execute)

program
  .command('list')
  .description('list installed plugins')
  .option('--global', 'list global plugins')
  .option('--outdated', 'show outdated plugins')
  .option('--json', 'output as JSON')
  .option('--tree', 'show dependency tree')
  .action(ListCommand.execute)

program
  .command('info <plugin>')
  .description('show plugin information')
  .option('--version <version>', 'specific version info')
  .option('--json', 'output as JSON')
  .action(InfoCommand.execute)

// Configuration Management
program
  .command('config')
  .description('manage CLI configuration')
  .option('list', 'list all configuration')
  .option('get <key>', 'get configuration value')
  .option('set <key> <value>', 'set configuration value')
  .option('delete <key>', 'delete configuration key')
  .option('reset', 'reset to default configuration')
  .action(ConfigCommand.execute)

// Template Management
program
  .command('template')
  .description('manage plugin templates')
  .option('list', 'list available templates')
  .option('install <template>', 'install template')
  .option('uninstall <template>', 'uninstall template')
  .option('update [templates...]', 'update templates')
  .action(TemplateCommand.execute)

// Authentication
program
  .command('login')
  .description('authenticate with plugin registry')
  .option('--registry <url>', 'registry URL')
  .option('--token <token>', 'authentication token')
  .action(LoginCommand.execute)

program
  .command('logout')
  .description('logout from plugin registry')
  .option('--registry <url>', 'registry URL')
  .action(LogoutCommand.execute)

// Utility Commands
program
  .command('clean')
  .description('clean build artifacts and cache')
  .option('--all', 'clean everything including node_modules')
  .option('--cache', 'clean cache only')
  .option('--dist', 'clean dist folder only')
  .action(CleanCommand.execute)

// Help and Examples
program
  .command('examples')
  .description('show usage examples')
  .action(() => {
    console.log(chalk.cyan('CNC Plugin CLI Examples:'))
    console.log('')
    console.log(chalk.yellow('Create a new plugin:'))
    console.log('  cnc-plugin create my-awesome-plugin --template typescript')
    console.log('')
    console.log(chalk.yellow('Start development server:'))
    console.log('  cnc-plugin dev --open --hot')
    console.log('')
    console.log(chalk.yellow('Build for production:'))
    console.log('  cnc-plugin build --minify --sourcemap')
    console.log('')
    console.log(chalk.yellow('Run tests with coverage:'))
    console.log('  cnc-plugin test --coverage')
    console.log('')
    console.log(chalk.yellow('Validate plugin:'))
    console.log('  cnc-plugin validate --typescript --lint --security')
    console.log('')
    console.log(chalk.yellow('Package for distribution:'))
    console.log('  cnc-plugin package --format zip --sign')
    console.log('')
    console.log(chalk.yellow('Publish to marketplace:'))
    console.log('  cnc-plugin publish --public')
    console.log('')
    console.log(chalk.green('For more help on any command, use:'))
    console.log('  cnc-plugin <command> --help')
  })

// Custom help
program.on('--help', () => {
  console.log('')
  console.log(chalk.cyan('Documentation:'))
  console.log('  https://docs.cnc-jog-controls.com/plugins/')
  console.log('')
  console.log(chalk.cyan('Examples:'))
  console.log('  cnc-plugin examples')
  console.log('')
  console.log(chalk.cyan('Issues:'))
  console.log('  https://github.com/cnc-jog-controls/plugin-cli/issues')
})

// Parse command line arguments
program.parse()

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp()
  console.log('')
  console.log(chalk.cyan('Get started by creating a new plugin:'))
  console.log(chalk.white('  cnc-plugin create my-plugin'))
  console.log('')
  console.log(chalk.cyan('Or see usage examples:'))
  console.log(chalk.white('  cnc-plugin examples'))
}