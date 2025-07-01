import React from 'react'
import { createRoot } from 'react-dom/client'
import { PluginAPI } from '@cnc-jog-controls/plugin-api'
import { MachineStatusMonitor } from './components/MachineStatusMonitor'
import { MachineStatusProvider } from './contexts/MachineStatusContext'
import { SettingsProvider } from './contexts/SettingsContext'
import './styles/index.css'

// Plugin initialization
export default class MachineStatusMonitorPlugin {
  private api: PluginAPI
  private root: any
  private container: HTMLElement | null = null

  constructor(api: PluginAPI) {
    this.api = api
  }

  async initialize(): Promise<void> {
    // Register plugin with the system
    this.api.logger.info('Machine Status Monitor plugin initializing...')

    // Set up event listeners
    this.setupEventListeners()

    // Register commands
    this.registerCommands()

    // Initialize settings
    await this.initializeSettings()
  }

  async mount(container: HTMLElement): Promise<void> {
    this.container = container
    this.root = createRoot(container)

    // Render the React application
    this.root.render(
      <SettingsProvider api={this.api}>
        <MachineStatusProvider api={this.api}>
          <MachineStatusMonitor />
        </MachineStatusProvider>
      </SettingsProvider>
    )

    this.api.logger.info('Machine Status Monitor mounted successfully')
  }

  async unmount(): Promise<void> {
    if (this.root) {
      this.root.unmount()
      this.root = null
    }
    this.container = null
    this.api.logger.info('Machine Status Monitor unmounted')
  }

  async destroy(): Promise<void> {
    // Clean up event listeners
    this.removeEventListeners()

    // Clean up any resources
    this.api.logger.info('Machine Status Monitor destroyed')
  }

  private setupEventListeners(): void {
    // Listen for machine status updates
    this.api.events.on('machine.status.update', this.handleStatusUpdate.bind(this))
    this.api.events.on('machine.alarm', this.handleAlarm.bind(this))
    this.api.events.on('machine.position.update', this.handlePositionUpdate.bind(this))
  }

  private removeEventListeners(): void {
    this.api.events.off('machine.status.update', this.handleStatusUpdate.bind(this))
    this.api.events.off('machine.alarm', this.handleAlarm.bind(this))
    this.api.events.off('machine.position.update', this.handlePositionUpdate.bind(this))
  }

  private registerCommands(): void {
    // Register plugin commands
    this.api.commands.register({
      id: 'machine-status-monitor.reset',
      name: 'Reset Status Monitor',
      description: 'Reset all status monitor data',
      handler: async () => {
        this.api.events.emit('plugin.machine-status-monitor.reset')
        return { success: true }
      }
    })

    this.api.commands.register({
      id: 'machine-status-monitor.export',
      name: 'Export Status History',
      description: 'Export machine status history to CSV',
      handler: async () => {
        // Implementation would export status history
        this.api.events.emit('plugin.machine-status-monitor.export')
        return { success: true }
      }
    })
  }

  private async initializeSettings(): Promise<void> {
    // Load saved settings
    const settings = await this.api.settings.get('machine-status-monitor')
    
    if (!settings) {
      // Set default settings
      await this.api.settings.set('machine-status-monitor', {
        updateInterval: 100,
        showDebugInfo: false,
        alarmNotifications: true
      })
    }
  }

  private handleStatusUpdate(data: any): void {
    this.api.logger.debug('Status update received', data)
  }

  private handleAlarm(data: any): void {
    this.api.logger.warn('Machine alarm received', data)
    
    // Show notification if enabled
    const settings = this.api.settings.getSync('machine-status-monitor')
    if (settings?.alarmNotifications) {
      this.api.notifications.show({
        title: 'Machine Alarm',
        body: data.message || 'An alarm condition has been detected',
        type: 'error'
      })
    }
  }

  private handlePositionUpdate(data: any): void {
    this.api.logger.debug('Position update received', data)
  }
}

// Export plugin metadata
export const metadata = {
  name: 'Machine Status Monitor',
  version: '1.0.0',
  description: 'Real-time machine status monitoring',
  author: 'CNC Jog Controls Team'
}