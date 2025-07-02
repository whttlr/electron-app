// Command History Service
// Tracks and manages command execution history

import { databaseService } from '../database/DatabaseService';
import { CommandRecord } from '@whttlr/plugin-types';

export class CommandHistoryService {
  private static instance: CommandHistoryService | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): CommandHistoryService {
    if (!CommandHistoryService.instance) {
      CommandHistoryService.instance = new CommandHistoryService();
    }
    return CommandHistoryService.instance;
  }

  /**
   * Record a command execution
   */
  public async recordCommand(
    command: string,
    type: 'gcode' | 'jog' | 'macro' | 'system',
    source: 'user' | 'plugin' | 'system' | 'macro',
    options?: {
      pluginId?: string;
      positionBefore?: { x: number; y: number; z: number };
      feedRate?: number;
      spindleSpeed?: number;
    },
  ): Promise<string> {
    const commandRecord = await databaseService.addCommandHistory({
      command,
      type,
      source,
      pluginId: options?.pluginId,
      status: 'success', // Will be updated when command completes
      positionBefore: options?.positionBefore,
      feedRate: options?.feedRate,
      spindleSpeed: options?.spindleSpeed,
    });

    return commandRecord.id;
  }

  /**
   * Update command with execution results
   */
  public async updateCommandResult(
    commandId: string,
    result: {
      status: 'success' | 'error' | 'cancelled';
      duration?: number;
      error?: string;
      response?: string;
      positionAfter?: { x: number; y: number; z: number };
    },
  ): Promise<void> {
    // Note: This would require an update method in DatabaseService
    // For now, we'll just log the result
    console.log(`Command ${commandId} completed:`, result);
  }

  /**
   * Get command history with optional filters
   */
  public async getHistory(
    limit = 100,
    offset = 0,
    filters?: {
      type?: 'gcode' | 'jog' | 'macro' | 'system';
      source?: 'user' | 'plugin' | 'system' | 'macro';
      pluginId?: string;
      status?: 'success' | 'error' | 'cancelled';
      from?: Date;
      to?: Date;
    },
  ): Promise<CommandRecord[]> {
    return await databaseService.getCommandHistory(limit, offset, filters);
  }

  /**
   * Get recent commands (last 50)
   */
  public async getRecentCommands(): Promise<CommandRecord[]> {
    return this.getHistory(50, 0);
  }

  /**
   * Get commands by plugin
   */
  public async getPluginCommands(pluginId: string, limit = 100): Promise<CommandRecord[]> {
    return this.getHistory(limit, 0, { pluginId });
  }

  /**
   * Get failed commands
   */
  public async getFailedCommands(limit = 50): Promise<CommandRecord[]> {
    return this.getHistory(limit, 0, { status: 'error' });
  }

  /**
   * Clear old command history
   */
  public async clearOldHistory(olderThanDays = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    return await databaseService.clearCommandHistory(cutoffDate);
  }

  /**
   * Get command statistics
   */
  public async getStatistics(): Promise<{
    totalCommands: number;
    successCount: number;
    errorCount: number;
    byType: Record<string, number>;
    bySource: Record<string, number>;
  }> {
    const allCommands = await this.getHistory(10000); // Get a large sample

    const stats = {
      totalCommands: allCommands.length,
      successCount: allCommands.filter((c) => c.status === 'success').length,
      errorCount: allCommands.filter((c) => c.status === 'error').length,
      byType: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
    };

    // Count by type
    allCommands.forEach((command) => {
      stats.byType[command.type] = (stats.byType[command.type] || 0) + 1;
      stats.bySource[command.source] = (stats.bySource[command.source] || 0) + 1;
    });

    return stats;
  }

  /**
   * Helper method to track jog commands
   */
  public async recordJogCommand(
    axis: 'x' | 'y' | 'z',
    distance: number,
    feedRate: number,
    currentPosition: { x: number; y: number; z: number },
    source: 'user' | 'plugin' = 'user',
    pluginId?: string,
  ): Promise<string> {
    const command = `G91 G1 ${axis.toUpperCase()}${distance} F${feedRate} G90`;

    return this.recordCommand(command, 'jog', source, {
      pluginId,
      positionBefore: currentPosition,
      feedRate,
    });
  }

  /**
   * Helper method to track G-code commands
   */
  public async recordGCodeCommand(
    gcode: string,
    currentPosition?: { x: number; y: number; z: number },
    source: 'user' | 'plugin' = 'user',
    pluginId?: string,
  ): Promise<string> {
    return this.recordCommand(gcode, 'gcode', source, {
      pluginId,
      positionBefore: currentPosition,
    });
  }

  /**
   * Helper method to track system commands
   */
  public async recordSystemCommand(
    command: string,
    source: 'user' | 'system' = 'system',
  ): Promise<string> {
    return this.recordCommand(command, 'system', source);
  }
}

// Export singleton instance
export const commandHistoryService = CommandHistoryService.getInstance();
