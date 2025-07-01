import React from 'react'
import { createRoot } from 'react-dom/client'
import { PluginAPI } from '@cnc-jog-controls/plugin-api'
import { GCodeSnippets } from './components/GCodeSnippets'
import { SnippetsProvider } from './contexts/SnippetsContext'
import { SettingsProvider } from './contexts/SettingsContext'
import './styles/index.css'

// Plugin initialization
export default class GCodeSnippetsPlugin {
  private api: PluginAPI
  private root: any
  private container: HTMLElement | null = null

  constructor(api: PluginAPI) {
    this.api = api
  }

  async initialize(): Promise<void> {
    this.api.logger.info('G-Code Snippets plugin initializing...')

    // Register plugin commands
    this.registerCommands()

    // Initialize default snippets if none exist
    await this.initializeDefaultSnippets()

    // Set up keyboard shortcuts
    this.setupKeyboardShortcuts()
  }

  async mount(container: HTMLElement): Promise<void> {
    this.container = container
    this.root = createRoot(container)

    this.root.render(
      <SettingsProvider api={this.api}>
        <SnippetsProvider api={this.api}>
          <GCodeSnippets />
        </SnippetsProvider>
      </SettingsProvider>
    )

    this.api.logger.info('G-Code Snippets mounted successfully')
  }

  async unmount(): Promise<void> {
    if (this.root) {
      this.root.unmount()
      this.root = null
    }
    this.container = null
    this.api.logger.info('G-Code Snippets unmounted')
  }

  async destroy(): Promise<void> {
    this.api.logger.info('G-Code Snippets destroyed')
  }

  private registerCommands(): void {
    // Insert snippet command
    this.api.commands.register({
      id: 'gcode-snippets.insert',
      name: 'Insert G-Code Snippet',
      description: 'Insert a G-code snippet at cursor position',
      handler: async (args: { snippetId: string }) => {
        const snippets = await this.api.storage.get('gcode-snippets.snippets') || []
        const snippet = snippets.find((s: any) => s.id === args.snippetId)
        
        if (snippet) {
          this.api.events.emit('editor.insert', { 
            text: snippet.code,
            format: true 
          })
          return { success: true, message: `Inserted snippet: ${snippet.name}` }
        }
        
        return { success: false, message: 'Snippet not found' }
      }
    })

    // Quick snippet command
    this.api.commands.register({
      id: 'gcode-snippets.quick-insert',
      name: 'Quick Insert Snippet',
      description: 'Show quick snippet picker',
      handler: async () => {
        this.api.events.emit('plugin.gcode-snippets.show-quick-picker')
        return { success: true }
      }
    })

    // Export snippets
    this.api.commands.register({
      id: 'gcode-snippets.export',
      name: 'Export Snippets',
      description: 'Export all snippets to file',
      handler: async () => {
        const snippets = await this.api.storage.get('gcode-snippets.snippets') || []
        const exportData = {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          snippets
        }
        
        this.api.files.saveAs('gcode-snippets.json', JSON.stringify(exportData, null, 2))
        return { success: true, message: `Exported ${snippets.length} snippets` }
      }
    })

    // Import snippets
    this.api.commands.register({
      id: 'gcode-snippets.import',
      name: 'Import Snippets',
      description: 'Import snippets from file',
      handler: async () => {
        try {
          const file = await this.api.files.openFile({
            accept: '.json',
            multiple: false
          })
          
          if (file) {
            const content = await file.text()
            const importData = JSON.parse(content)
            
            if (importData.snippets && Array.isArray(importData.snippets)) {
              const existingSnippets = await this.api.storage.get('gcode-snippets.snippets') || []
              const mergedSnippets = [...existingSnippets, ...importData.snippets]
              
              await this.api.storage.set('gcode-snippets.snippets', mergedSnippets)
              this.api.events.emit('plugin.gcode-snippets.refresh')
              
              return { 
                success: true, 
                message: `Imported ${importData.snippets.length} snippets` 
              }
            }
          }
          
          return { success: false, message: 'Invalid file format' }
        } catch (error) {
          return { success: false, message: `Import failed: ${error.message}` }
        }
      }
    })
  }

  private setupKeyboardShortcuts(): void {
    // Register keyboard shortcuts
    this.api.keyboard.register({
      key: 'ctrl+shift+g',
      description: 'Open G-Code Snippets',
      handler: () => {
        this.api.events.emit('plugin.gcode-snippets.focus')
      }
    })

    this.api.keyboard.register({
      key: 'ctrl+shift+i',
      description: 'Quick Insert Snippet',
      handler: () => {
        this.api.events.emit('plugin.gcode-snippets.show-quick-picker')
      }
    })
  }

  private async initializeDefaultSnippets(): Promise<void> {
    const existingSnippets = await this.api.storage.get('gcode-snippets.snippets')
    
    if (!existingSnippets || existingSnippets.length === 0) {
      const defaultSnippets = [
        {
          id: 'home-all',
          name: 'Home All Axes',
          description: 'Home all machine axes',
          category: 'Homing',
          code: 'G28 ; Home all axes',
          tags: ['homing', 'setup']
        },
        {
          id: 'spindle-on',
          name: 'Spindle On',
          description: 'Start spindle at specified speed',
          category: 'Spindle',
          code: 'M3 S{speed} ; Start spindle at {speed} RPM',
          tags: ['spindle', 'start'],
          variables: [{ name: 'speed', default: '1000', description: 'Spindle speed in RPM' }]
        },
        {
          id: 'spindle-off',
          name: 'Spindle Off',
          description: 'Stop spindle',
          category: 'Spindle',
          code: 'M5 ; Stop spindle',
          tags: ['spindle', 'stop']
        },
        {
          id: 'coolant-on',
          name: 'Coolant On',
          description: 'Turn on flood coolant',
          category: 'Coolant',
          code: 'M8 ; Coolant on',
          tags: ['coolant']
        },
        {
          id: 'probe-z',
          name: 'Z Probe',
          description: 'Probe Z axis to find work surface',
          category: 'Probing',
          code: `G21 ; Set units to mm
G91 ; Relative positioning
G38.2 Z-{probe_distance} F{probe_speed} ; Probe down
G90 ; Absolute positioning
G10 L20 P1 Z{tool_offset} ; Set work coordinate
G0 Z{retract_height} ; Retract`,
          tags: ['probe', 'setup'],
          variables: [
            { name: 'probe_distance', default: '25', description: 'Maximum probe distance' },
            { name: 'probe_speed', default: '100', description: 'Probe feed rate' },
            { name: 'tool_offset', default: '0', description: 'Tool length offset' },
            { name: 'retract_height', default: '5', description: 'Retraction height' }
          ]
        },
        {
          id: 'safe-start',
          name: 'Safe Start Sequence',
          description: 'Standard program start sequence',
          category: 'Program',
          code: `G21 ; Set units to mm
G90 ; Absolute positioning
G94 ; Feed rate per minute
G17 ; XY plane selection
G40 G49 G80 ; Cancel cutter compensation and cycles
M5 ; Ensure spindle is off
M9 ; Ensure coolant is off
G28 ; Home all axes`,
          tags: ['setup', 'safety', 'start']
        },
        {
          id: 'safe-end',
          name: 'Safe End Sequence',
          description: 'Standard program end sequence',
          category: 'Program',
          code: `M5 ; Stop spindle
M9 ; Turn off coolant
G28 ; Return to home position
M30 ; Program end and rewind`,
          tags: ['end', 'safety', 'finish']
        }
      ]

      await this.api.storage.set('gcode-snippets.snippets', defaultSnippets)
      this.api.logger.info('Initialized default G-code snippets')
    }
  }
}

// Export plugin metadata
export const metadata = {
  name: 'G-Code Snippets',
  version: '1.0.0',
  description: 'Manage and insert G-code snippets',
  author: 'CNC Jog Controls Team'
}