import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import path from 'path'
import fs from 'fs-extra'
import { TemplateManager } from '../utils/template-manager'
import { ProjectGenerator } from '../utils/project-generator'
import { GitManager } from '../utils/git-manager'
import { NpmManager } from '../utils/npm-manager'
import { ValidationUtils } from '../utils/validation'
import { Logger } from '../utils/logger'

interface CreateOptions {
  template: string
  directory: string
  install: boolean
  git: boolean
}

interface ProjectInfo {
  name: string
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
}

export class CreateCommand {
  static async execute(name: string, options: CreateOptions): Promise<void> {
    const logger = new Logger(options)
    
    try {
      // Validate plugin name
      if (!ValidationUtils.isValidPluginName(name)) {
        logger.error('Invalid plugin name. Plugin names must:')
        logger.error('- Start with a letter or underscore')
        logger.error('- Contain only letters, numbers, underscores, and hyphens')
        logger.error('- Be between 3 and 50 characters long')
        process.exit(1)
      }

      // Check if directory already exists
      const targetDir = path.resolve(options.directory, name)
      if (await fs.pathExists(targetDir)) {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `Directory ${chalk.cyan(name)} already exists. Overwrite?`,
            default: false
          }
        ])

        if (!overwrite) {
          logger.info('Operation cancelled')
          process.exit(0)
        }

        await fs.remove(targetDir)
      }

      // Gather project information
      const projectInfo = await this.gatherProjectInfo(name, options)
      
      // Initialize template manager
      const templateManager = new TemplateManager()
      
      // Verify template exists
      if (!await templateManager.hasTemplate(options.template)) {
        logger.error(`Template "${options.template}" not found`)
        
        const availableTemplates = await templateManager.listTemplates()
        if (availableTemplates.length > 0) {
          logger.info('Available templates:')
          availableTemplates.forEach(template => {
            logger.info(`  - ${template.name}: ${template.description}`)
          })
        }
        process.exit(1)
      }

      // Create project
      const spinner = ora('Creating plugin project...').start()
      
      try {
        // Generate project from template
        const generator = new ProjectGenerator(templateManager, logger)
        await generator.generateProject(targetDir, options.template, projectInfo)
        
        spinner.succeed('Plugin project created successfully!')

        // Initialize git repository
        if (options.git) {
          const gitSpinner = ora('Initializing git repository...').start()
          try {
            const gitManager = new GitManager(targetDir, logger)
            await gitManager.init()
            await gitManager.addInitialCommit()
            gitSpinner.succeed('Git repository initialized')
          } catch (error) {
            gitSpinner.warn('Git initialization failed (continuing anyway)')
            logger.debug(`Git error: ${error.message}`)
          }
        }

        // Install dependencies
        if (options.install) {
          const installSpinner = ora('Installing dependencies...').start()
          try {
            const npmManager = new NpmManager(targetDir, logger)
            await npmManager.install()
            installSpinner.succeed('Dependencies installed successfully')
          } catch (error) {
            installSpinner.fail('Failed to install dependencies')
            logger.error('You can install them manually later by running:')
            logger.error(`  cd ${name} && npm install`)
          }
        }

        // Show success message and next steps
        this.showSuccessMessage(name, targetDir, options)

      } catch (error) {
        spinner.fail('Failed to create plugin project')
        throw error
      }

    } catch (error) {
      logger.error('Plugin creation failed:', error.message)
      if (logger.isDebug()) {
        logger.debug(error.stack)
      }
      process.exit(1)
    }
  }

  private static async gatherProjectInfo(name: string, options: CreateOptions): Promise<ProjectInfo> {
    const questions = [
      {
        type: 'input',
        name: 'displayName',
        message: 'Plugin display name:',
        default: name.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        validate: (input: string) => input.trim().length > 0 || 'Display name is required'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Plugin description:',
        default: `A CNC Jog Controls plugin for ${name}`,
        validate: (input: string) => input.trim().length > 0 || 'Description is required'
      },
      {
        type: 'input',
        name: 'authorName',
        message: 'Author name:',
        default: process.env.USER || process.env.USERNAME || '',
        validate: (input: string) => input.trim().length > 0 || 'Author name is required'
      },
      {
        type: 'input',
        name: 'authorEmail',
        message: 'Author email:',
        validate: (input: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return emailRegex.test(input) || 'Valid email is required'
        }
      },
      {
        type: 'input',
        name: 'authorUrl',
        message: 'Author URL (optional):',
        default: ''
      },
      {
        type: 'list',
        name: 'license',
        message: 'License:',
        choices: [
          { name: 'MIT', value: 'MIT' },
          { name: 'Apache-2.0', value: 'Apache-2.0' },
          { name: 'GPL-3.0', value: 'GPL-3.0' },
          { name: 'BSD-3-Clause', value: 'BSD-3-Clause' },
          { name: 'ISC', value: 'ISC' },
          { name: 'Other', value: 'other' }
        ],
        default: 'MIT'
      },
      {
        type: 'input',
        name: 'customLicense',
        message: 'Custom license:',
        when: (answers: any) => answers.license === 'other',
        validate: (input: string) => input.trim().length > 0 || 'License is required'
      },
      {
        type: 'checkbox',
        name: 'keywords',
        message: 'Keywords (select relevant ones):',
        choices: [
          { name: 'cnc', checked: true },
          { name: 'machining', checked: false },
          { name: 'gcode', checked: false },
          { name: 'automation', checked: false },
          { name: 'toolpath', checked: false },
          { name: 'visualization', checked: false },
          { name: 'control', checked: false },
          { name: 'monitoring', checked: false },
          { name: 'optimization', checked: false },
          { name: 'workflow', checked: false }
        ]
      },
      {
        type: 'input',
        name: 'additionalKeywords',
        message: 'Additional keywords (comma-separated):',
        default: '',
        filter: (input: string) => input.split(',').map(k => k.trim()).filter(k => k.length > 0)
      },
      {
        type: 'list',
        name: 'category',
        message: 'Plugin category:',
        choices: [
          { name: 'Productivity - Enhance workflow and efficiency', value: 'productivity' },
          { name: 'Automation - Automate repetitive tasks', value: 'automation' },
          { name: 'Visualization - 2D/3D visualization and graphics', value: 'visualization' },
          { name: 'Integration - Connect with external systems', value: 'integration' },
          { name: 'Development - Development and debugging tools', value: 'development' },
          { name: 'Monitoring - Machine and process monitoring', value: 'monitoring' },
          { name: 'Processing - Data and G-code processing', value: 'processing' },
          { name: 'Utilities - General utilities and helpers', value: 'utilities' }
        ],
        default: 'productivity'
      },
      {
        type: 'input',
        name: 'version',
        message: 'Initial version:',
        default: '1.0.0',
        validate: (input: string) => {
          const semverRegex = /^\d+\.\d+\.\d+(-[\w.]+)?$/
          return semverRegex.test(input) || 'Valid semantic version is required (e.g., 1.0.0)'
        }
      },
      {
        type: 'input',
        name: 'repository',
        message: 'Repository URL (optional):',
        default: ''
      }
    ]

    const answers = await inquirer.prompt(questions)

    return {
      name,
      displayName: answers.displayName,
      description: answers.description,
      author: {
        name: answers.authorName,
        email: answers.authorEmail,
        url: answers.authorUrl || undefined
      },
      license: answers.license === 'other' ? answers.customLicense : answers.license,
      keywords: [
        ...answers.keywords,
        ...(answers.additionalKeywords || [])
      ],
      category: answers.category,
      version: answers.version,
      repository: answers.repository || undefined
    }
  }

  private static showSuccessMessage(name: string, targetDir: string, options: CreateOptions): void {
    const logger = new Logger(options)
    
    logger.success(`\n🎉 Plugin "${name}" created successfully!`)
    logger.info(`\n📁 Project created at: ${chalk.cyan(targetDir)}`)
    
    logger.info('\n🚀 Next steps:')
    logger.info(`  1. cd ${chalk.cyan(name)}`)
    
    if (!options.install) {
      logger.info('  2. npm install')
      logger.info('  3. npm run dev')
    } else {
      logger.info('  2. npm run dev')
    }
    
    logger.info('\n📚 Available commands:')
    logger.info('  npm run dev         - Start development server with hot reload')
    logger.info('  npm run build       - Build plugin for production')
    logger.info('  npm test            - Run tests')
    logger.info('  npm run lint        - Run ESLint')
    logger.info('  npm run validate    - Validate plugin configuration')
    logger.info('  npm run package     - Package plugin for distribution')
    
    logger.info('\n📖 Documentation:')
    logger.info('  Plugin Guide: https://docs.cnc-jog-controls.com/plugins/getting-started/')
    logger.info('  API Reference: https://docs.cnc-jog-controls.com/plugins/api-reference/')
    logger.info('  Examples: https://docs.cnc-jog-controls.com/plugins/examples/')
    
    logger.info('\n💬 Get help:')
    logger.info('  GitHub Issues: https://github.com/cnc-jog-controls/plugin-cli/issues')
    logger.info('  Discord: https://discord.gg/cnc-jog-controls')
    logger.info('  CLI Help: cnc-plugin --help')
    
    logger.info(`\n✨ Happy plugin development! ✨`)
  }
}

// Add to commander program
export function addCreateCommand(program: Command): void {
  program
    .command('create <name>')
    .description('create a new plugin project')
    .option('-t, --template <template>', 'plugin template to use', 'basic')
    .option('-d, --directory <dir>', 'target directory', '.')
    .option('--no-install', 'skip npm install')
    .option('--no-git', 'skip git initialization')
    .action(CreateCommand.execute)
}