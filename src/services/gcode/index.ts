/**
 * G-Code Execution Service
 * Handles G-code command execution, history tracking, and file management
 */

import apiClient from '../api/api-client';
import { bundledApiSupabaseService } from '../bundled-api-supabase';
import { configManagementService } from '../bundled-api-supabase/config-management';

export interface GCodeCommand {
  id: string
  command: string
  timestamp: string
  status: 'pending' | 'executing' | 'completed' | 'failed'
  response?: string
  error?: string
  executionTime?: number
}

export interface GCodeFile {
  id: string
  name: string
  content: string
  size: number
  lineCount: number
  uploadedAt: string
  lastExecuted?: string
}

export interface GCodeExecution {
  id: string
  fileId?: string
  fileName?: string
  commands: GCodeCommand[]
  startTime: string
  endTime?: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  totalCommands: number
  completedCommands: number
  failedCommands: number
  machineConfigId?: string
}

export interface MachineStatus {
  state: string
  position: { x: number; y: number; z: number }
  workPosition: { x: number; y: number; z: number }
  feedRate: number
  spindleSpeed: number
  temperature?: number
  lastUpdate: string
}

export class GCodeService {
  private static instance: GCodeService;

  private commandHistory: GCodeCommand[] = [];

  private executionHistory: GCodeExecution[] = [];

  private currentExecution: GCodeExecution | null = null;

  private machineStatus: MachineStatus | null = null;

  private statusListeners: ((status: MachineStatus) => void)[] = [];

  private executionListeners: ((execution: GCodeExecution | null) => void)[] = [];

  private statusPollingInterval: NodeJS.Timeout | null = null;

  static getInstance(): GCodeService {
    if (!GCodeService.instance) {
      GCodeService.instance = new GCodeService();
    }
    return GCodeService.instance;
  }

  /**
   * Initialize the G-code service
   */
  async initialize(): Promise<void> {
    try {
      // Load command history from database
      await this.loadCommandHistory();

      // Load execution history
      await this.loadExecutionHistory();

      // Start machine status polling
      this.startStatusPolling();

      console.log('✅ G-code service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize G-code service:', error);
    }
  }

  /**
   * Execute a single G-code command
   */
  async executeCommand(commandText: string): Promise<GCodeCommand> {
    const command: GCodeCommand = {
      id: this.generateId(),
      command: commandText.trim(),
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    // Add to history immediately
    this.commandHistory.unshift(command);

    try {
      command.status = 'executing';
      const startTime = Date.now();

      const response = await apiClient.sendGcode(command.command);

      command.status = 'completed';
      command.response = response.message || 'OK';
      command.executionTime = Date.now() - startTime;

      console.log(`✅ Command executed: ${command.command}`);
    } catch (error) {
      command.status = 'failed';
      command.error = error instanceof Error ? error.message : 'Execution failed';
      console.error(`❌ Command failed: ${command.command}`, error);
    }

    // Save to database
    await this.saveCommandToDatabase(command);

    return command;
  }

  /**
   * Execute multiple G-code commands
   */
  async executeCommands(commands: string[]): Promise<GCodeExecution> {
    const execution: GCodeExecution = {
      id: this.generateId(),
      commands: [],
      startTime: new Date().toISOString(),
      status: 'running',
      totalCommands: commands.length,
      completedCommands: 0,
      failedCommands: 0,
    };

    this.currentExecution = execution;
    this.executionHistory.unshift(execution);
    this.notifyExecutionListeners();

    try {
      for (const commandText of commands) {
        if (execution.status === 'cancelled') {
          break;
        }

        const command = await this.executeCommand(commandText);
        execution.commands.push(command);

        if (command.status === 'completed') {
          execution.completedCommands++;
        } else if (command.status === 'failed') {
          execution.failedCommands++;
        }
      }

      execution.endTime = new Date().toISOString();
      execution.status = execution.failedCommands > 0 ? 'failed' : 'completed';
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date().toISOString();
      console.error('❌ Execution failed:', error);
    }

    this.currentExecution = null;
    this.notifyExecutionListeners();

    // Save execution to database
    await this.saveExecutionToDatabase(execution);

    return execution;
  }

  /**
   * Execute G-code file
   */
  async executeFile(file: GCodeFile): Promise<GCodeExecution> {
    const commands = file.content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith(';') && !line.startsWith('('));

    const execution = await this.executeCommands(commands);
    execution.fileId = file.id;
    execution.fileName = file.name;

    // Update file last executed timestamp
    file.lastExecuted = new Date().toISOString();

    return execution;
  }

  /**
   * Cancel current execution
   */
  async cancelExecution(): Promise<void> {
    if (this.currentExecution) {
      this.currentExecution.status = 'cancelled';
      this.currentExecution.endTime = new Date().toISOString();
      this.currentExecution = null;
      this.notifyExecutionListeners();
    }
  }

  /**
   * Upload G-code file
   */
  async uploadFile(file: File): Promise<GCodeFile> {
    try {
      const content = await this.readFileContent(file);
      const lines = content.split('\n');

      const gcodeFile: GCodeFile = {
        id: this.generateId(),
        name: file.name,
        content,
        size: file.size,
        lineCount: lines.length,
        uploadedAt: new Date().toISOString(),
      };

      // Save to API server
      await apiClient.uploadGcodeFile(file);

      return gcodeFile;
    } catch (error) {
      console.error('❌ Failed to upload file:', error);
      throw error;
    }
  }

  /**
   * Get machine status
   */
  async getMachineStatus(): Promise<MachineStatus | null> {
    try {
      const status = await apiClient.getMachineStatus();

      this.machineStatus = {
        state: status.state || 'Unknown',
        position: status.position || { x: 0, y: 0, z: 0 },
        workPosition: status.workPosition || { x: 0, y: 0, z: 0 },
        feedRate: status.feedRate || 0,
        spindleSpeed: status.spindleSpeed || 0,
        temperature: status.temperature,
        lastUpdate: new Date().toISOString(),
      };

      this.notifyStatusListeners();
      return this.machineStatus;
    } catch (error) {
      console.error('❌ Failed to get machine status:', error);
      return null;
    }
  }

  /**
   * Get command history
   */
  getCommandHistory(): GCodeCommand[] {
    return [...this.commandHistory];
  }

  /**
   * Get execution history
   */
  getExecutionHistory(): GCodeExecution[] {
    return [...this.executionHistory];
  }

  /**
   * Get current execution
   */
  getCurrentExecution(): GCodeExecution | null {
    return this.currentExecution;
  }

  /**
   * Get current machine status
   */
  getCurrentMachineStatus(): MachineStatus | null {
    return this.machineStatus;
  }

  /**
   * Add status listener
   */
  addStatusListener(callback: (status: MachineStatus) => void): void {
    this.statusListeners.push(callback);
  }

  /**
   * Remove status listener
   */
  removeStatusListener(callback: (status: MachineStatus) => void): void {
    this.statusListeners = this.statusListeners.filter((listener) => listener !== callback);
  }

  /**
   * Add execution listener
   */
  addExecutionListener(callback: (execution: GCodeExecution | null) => void): void {
    this.executionListeners.push(callback);
  }

  /**
   * Remove execution listener
   */
  removeExecutionListener(callback: (execution: GCodeExecution | null) => void): void {
    this.executionListeners = this.executionListeners.filter((listener) => listener !== callback);
  }

  /**
   * Start machine status polling
   */
  private startStatusPolling(): void {
    if (this.statusPollingInterval) {
      clearInterval(this.statusPollingInterval);
    }

    this.statusPollingInterval = setInterval(async () => {
      await this.getMachineStatus();
    }, 1000); // Poll every second
  }

  /**
   * Stop machine status polling
   */
  stopStatusPolling(): void {
    if (this.statusPollingInterval) {
      clearInterval(this.statusPollingInterval);
      this.statusPollingInterval = null;
    }
  }

  /**
   * Load command history from database
   */
  private async loadCommandHistory(): Promise<void> {
    try {
      const history = await configManagementService.getPreference('gcode_command_history');
      if (history && Array.isArray(history)) {
        this.commandHistory = history.slice(0, 100); // Keep last 100 commands
      }
    } catch (error) {
      console.error('Failed to load command history:', error);
    }
  }

  /**
   * Load execution history from database
   */
  private async loadExecutionHistory(): Promise<void> {
    try {
      const history = await configManagementService.getPreference('gcode_execution_history');
      if (history && Array.isArray(history)) {
        this.executionHistory = history.slice(0, 50); // Keep last 50 executions
      }
    } catch (error) {
      console.error('Failed to load execution history:', error);
    }
  }

  /**
   * Save command to database
   */
  private async saveCommandToDatabase(command: GCodeCommand): Promise<void> {
    try {
      // Keep only the latest 100 commands
      const historyToSave = [command, ...this.commandHistory.slice(0, 99)];
      await configManagementService.setPreference('gcode_command_history', historyToSave);
    } catch (error) {
      console.error('Failed to save command to database:', error);
    }
  }

  /**
   * Save execution to database
   */
  private async saveExecutionToDatabase(execution: GCodeExecution): Promise<void> {
    try {
      // Also create a job entry in the database
      await bundledApiSupabaseService.createJob({
        job_name: execution.fileName || `Execution ${execution.id}`,
        gcode_file: execution.fileName,
        status: execution.status === 'completed' ? 'completed'
          : execution.status === 'failed' ? 'failed' : 'pending',
        start_time: execution.startTime,
        end_time: execution.endTime,
        position_log: execution.commands.map((cmd) => ({
          timestamp: cmd.timestamp,
          x: 0,
          y: 0,
          z: 0, // Would be populated from actual machine status
        })),
      });

      // Save to preferences as well
      const historyToSave = [execution, ...this.executionHistory.slice(0, 49)];
      await configManagementService.setPreference('gcode_execution_history', historyToSave);
    } catch (error) {
      console.error('Failed to save execution to database:', error);
    }
  }

  /**
   * Notify status listeners
   */
  private notifyStatusListeners(): void {
    if (this.machineStatus) {
      this.statusListeners.forEach((callback) => {
        try {
          callback(this.machineStatus!);
        } catch (error) {
          console.error('Error in status listener:', error);
        }
      });
    }
  }

  /**
   * Notify execution listeners
   */
  private notifyExecutionListeners(): void {
    this.executionListeners.forEach((callback) => {
      try {
        callback(this.currentExecution);
      } catch (error) {
        console.error('Error in execution listener:', error);
      }
    });
  }

  /**
   * Read file content as text
   */
  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup service
   */
  cleanup(): void {
    this.stopStatusPolling();
    this.statusListeners = [];
    this.executionListeners = [];
  }
}

// Export singleton instance
export const gcodeService = GCodeService.getInstance();
