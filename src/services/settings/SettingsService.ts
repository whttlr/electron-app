import { databaseService } from '../database';

export interface MachineSettings {
  name: string;
  workArea: {
    x: number;
    y: number;
    z: number;
  };
  units: 'metric' | 'imperial';
  homePosition: {
    x: number;
    y: number;
    z: number;
  };
}

export interface JogSettings {
  defaultSpeed: number;
  acceleration: number;
  maxSpeed: number;
  distances: number[];
}

export interface UISettings {
  theme: 'light' | 'dark';
  language: string;
  showGrid: boolean;
  showCoordinates: boolean;
  autoConnect: boolean;
}

export interface ConnectionSettings {
  port: string;
  baudRate: number;
  timeout: number;
}

export interface AppSettings {
  machine: MachineSettings;
  jog: JogSettings;
  ui: UISettings;
  connection: ConnectionSettings;
}

export class SettingsService {
  private static instance: SettingsService;

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  private constructor() {}

  async getAllSettings(): Promise<AppSettings | null> {
    try {
      const appState = await databaseService.getAppState();
      if (!appState) {
        // Return defaults if no app state exists
        return {
          machine: this.getDefaultMachineSettings(),
          jog: this.getDefaultJogSettings(),
          ui: this.getDefaultUISettings(),
          connection: this.getDefaultConnectionSettings(),
        };
      }

      // Parse stored JSON settings or use defaults
      const machineSettings = appState.machineSettings
        ? JSON.parse(appState.machineSettings)
        : this.getDefaultMachineSettings();

      // Ensure units from direct field override JSON setting
      machineSettings.units = appState.machineUnits as 'metric' | 'imperial';

      const jogSettings = appState.jogSettings
        ? JSON.parse(appState.jogSettings)
        : this.getDefaultJogSettings();

      const connectionSettings = appState.connectionSettings
        ? JSON.parse(appState.connectionSettings)
        : this.getDefaultConnectionSettings();

      return {
        machine: machineSettings,
        jog: jogSettings,
        ui: {
          theme: appState.theme as 'light' | 'dark',
          language: appState.language,
          showGrid: appState.showGrid ?? true,
          showCoordinates: appState.showCoordinates ?? true,
          autoConnect: appState.autoConnect ?? false,
        },
        connection: connectionSettings,
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return null;
    }
  }

  async saveSettings(settings: Partial<AppSettings>, changedBy: string = 'user'): Promise<void> {
    try {
      const currentAppState = await databaseService.getAppState();

      // Track changes for audit
      const changes: Array<{ key: string; oldValue: any; newValue: any }> = [];

      // Prepare update data
      const updateData: any = {};

      if (settings.machine) {
        const oldMachineSettings = currentAppState?.machineSettings
          ? JSON.parse(currentAppState.machineSettings)
          : this.getDefaultMachineSettings();

        updateData.machineUnits = settings.machine.units;
        updateData.machineSettings = JSON.stringify(settings.machine);

        changes.push({
          key: 'machine',
          oldValue: oldMachineSettings,
          newValue: settings.machine,
        });
      }

      if (settings.jog) {
        const oldJogSettings = currentAppState?.jogSettings
          ? JSON.parse(currentAppState.jogSettings)
          : this.getDefaultJogSettings();

        updateData.jogSettings = JSON.stringify(settings.jog);

        changes.push({
          key: 'jog',
          oldValue: oldJogSettings,
          newValue: settings.jog,
        });
      }

      if (settings.connection) {
        const oldConnectionSettings = currentAppState?.connectionSettings
          ? JSON.parse(currentAppState.connectionSettings)
          : this.getDefaultConnectionSettings();

        updateData.connectionSettings = JSON.stringify(settings.connection);

        changes.push({
          key: 'connection',
          oldValue: oldConnectionSettings,
          newValue: settings.connection,
        });
      }

      if (settings.ui) {
        if (settings.ui.theme !== undefined) {
          changes.push({
            key: 'ui.theme',
            oldValue: currentAppState?.theme,
            newValue: settings.ui.theme,
          });
          updateData.theme = settings.ui.theme;
        }

        if (settings.ui.language !== undefined) {
          changes.push({
            key: 'ui.language',
            oldValue: currentAppState?.language,
            newValue: settings.ui.language,
          });
          updateData.language = settings.ui.language;
        }

        if (settings.ui.showGrid !== undefined) {
          changes.push({
            key: 'ui.showGrid',
            oldValue: currentAppState?.showGrid ?? true,
            newValue: settings.ui.showGrid,
          });
          updateData.showGrid = settings.ui.showGrid;
        }

        if (settings.ui.showCoordinates !== undefined) {
          changes.push({
            key: 'ui.showCoordinates',
            oldValue: currentAppState?.showCoordinates ?? true,
            newValue: settings.ui.showCoordinates,
          });
          updateData.showCoordinates = settings.ui.showCoordinates;
        }

        if (settings.ui.autoConnect !== undefined) {
          changes.push({
            key: 'ui.autoConnect',
            oldValue: currentAppState?.autoConnect ?? false,
            newValue: settings.ui.autoConnect,
          });
          updateData.autoConnect = settings.ui.autoConnect;
        }
      }

      // Update app state
      if (Object.keys(updateData).length > 0) {
        await databaseService.updateAppState(updateData);
      }

      // Record changes in audit log
      for (const change of changes) {
        await databaseService.trackSettingChange(
          change.key,
          change.oldValue,
          change.newValue,
          changedBy as 'user' | 'system' | 'plugin',
        );
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSettingHistory(key?: string, limit: number = 50): Promise<any[]> {
    try {
      return await databaseService.getSettingHistory({ key, limit });
    } catch (error) {
      console.error('Error loading setting history:', error);
      return [];
    }
  }

  async resetToDefaults(): Promise<void> {
    const defaultSettings: AppSettings = {
      machine: this.getDefaultMachineSettings(),
      jog: this.getDefaultJogSettings(),
      ui: this.getDefaultUISettings(),
      connection: this.getDefaultConnectionSettings(),
    };

    await this.saveSettings(defaultSettings, 'system');
  }

  private getDefaultMachineSettings(): MachineSettings {
    return {
      name: 'CNC Router',
      workArea: { x: 300, y: 200, z: 50 },
      units: 'metric',
      homePosition: { x: 0, y: 0, z: 0 },
    };
  }

  private getDefaultJogSettings(): JogSettings {
    return {
      defaultSpeed: 1000,
      acceleration: 500,
      maxSpeed: 5000,
      distances: [0.1, 1, 10, 50],
    };
  }

  private getDefaultUISettings(): UISettings {
    return {
      theme: 'light',
      language: 'en',
      showGrid: true,
      showCoordinates: true,
      autoConnect: false,
    };
  }

  private getDefaultConnectionSettings(): ConnectionSettings {
    return {
      port: '/dev/ttyUSB0',
      baudRate: 115200,
      timeout: 5000,
    };
  }
}

export const settingsService = SettingsService.getInstance();
