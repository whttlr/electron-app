/**
 * MobileControlsView Component
 *
 * Mobile-optimized CNC control interface designed for tablets and phones.
 * Features touch-optimized controls, adaptive layouts, and industrial-grade
 * usability for shop floor environments.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { pwaManager } from '@/utils/pwa';
import {
  Play,
  Pause,
  Square,
  AlertTriangle,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Eye,
  EyeOff,
  Settings,
  MoreVertical,
  Home,
  Target,
  Gauge,
  Activity,
} from 'lucide-react';
import { useResponsive } from '@/ui/theme/responsive';
import { TouchJogControls } from '@/ui/components/TouchOptimized/TouchJogControls';
import { TouchButton } from '@/ui/components/TouchOptimized/TouchButton';
import { MobileNavigationBar } from '@/ui/components/MobileNavigation/MobileNavigationBar';

interface MachineStatus {
  connected: boolean;
  state: 'idle' | 'running' | 'paused' | 'alarm' | 'error' | 'homing';
  position: {
    x: number;
    y: number;
    z: number;
  };
  workingArea: {
    width: number;
    height: number;
    depth: number;
    units: 'mm' | 'in';
  };
  feedRate: number;
  spindleSpeed: number;
  currentJob?: {
    id: string;
    name: string;
    progress: number;
    remainingTime: number;
  };
}

interface MobileControlsViewProps {
  /** Machine status data */
  machineStatus?: MachineStatus;
  /** Whether controls are in emergency mode */
  emergencyMode?: boolean;
  /** Connection handlers */
  onConnect?: () => void;
  onDisconnect?: () => void;
  /** Machine control handlers */
  onJog?: (axis: 'X' | 'Y' | 'Z', direction: 1 | -1, distance: number) => void;
  onHome?: (axes: Array<'X' | 'Y' | 'Z'>) => void;
  onEmergencyStop?: () => void;
  onStartJob?: () => void;
  onPauseJob?: () => void;
  onStopJob?: () => void;
  /** Settings handler */
  onOpenSettings?: () => void;
}

export const MobileControlsView: React.FC<MobileControlsViewProps> = ({
  machineStatus,
  emergencyMode = false,
  onConnect,
  onDisconnect,
  onJog,
  onHome,
  onEmergencyStop,
  onStartJob,
  onPauseJob,
  onStopJob,
  onOpenSettings,
}) => {
  const { orientation, breakpoint, isTouchDevice } = useResponsive();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedTab, setSelectedTab] = useState<'controls' | 'status' | 'job'>('controls');
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Default machine status
  const defaultMachineStatus: MachineStatus = {
    connected: false,
    state: 'idle',
    position: { x: 0, y: 0, z: 0 },
    workingArea: {
      width: 300, height: 300, depth: 100, units: 'mm',
    },
    feedRate: 1000,
    spindleSpeed: 12000,
  };

  const status = machineStatus || defaultMachineStatus;

  // Monitor online status
  useEffect(() => {
    const unsubscribe = pwaManager.onOfflineStatusChange(setIsOnline);
    return unsubscribe;
  }, []);

  // Monitor battery level
  useEffect(() => {
    const updateBatteryLevel = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setBatteryLevel(battery.level);

          battery.addEventListener('levelchange', () => {
            setBatteryLevel(battery.level);
          });
        } catch (error) {
          console.log('Battery API not available');
        }
      }
    };

    updateBatteryLevel();
  }, []);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Handle vibration feedback
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Emergency stop with feedback
  const handleEmergencyStop = useCallback(() => {
    vibrate([200, 100, 200, 100, 200]);
    onEmergencyStop?.();
  }, [onEmergencyStop, vibrate]);

  // Job control handlers
  const handleStartJob = useCallback(() => {
    vibrate(100);
    onStartJob?.();
  }, [onStartJob, vibrate]);

  const handlePauseJob = useCallback(() => {
    vibrate([100, 50, 100]);
    onPauseJob?.();
  }, [onPauseJob, vibrate]);

  const handleStopJob = useCallback(() => {
    vibrate([200, 100, 200]);
    onStopJob?.();
  }, [onStopJob, vibrate]);

  // Status indicator component
  const StatusIndicator: React.FC<{
    status: 'connected' | 'disconnected' | 'error' | 'warning';
    label: string;
    value?: string | number;
  }> = ({ status, label, value }) => (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
      <div className={cn(
        'w-3 h-3 rounded-full',
        status === 'connected' && 'bg-green-500 animate-pulse',
        status === 'disconnected' && 'bg-red-500',
        status === 'error' && 'bg-red-500 animate-pulse',
        status === 'warning' && 'bg-yellow-500 animate-pulse',
      )} />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400">{label}</div>
        {value && (
          <div className="text-sm font-medium text-white truncate">{value}</div>
        )}
      </div>
    </div>
  );

  // System status bar
  const SystemStatusBar: React.FC = () => (
    <div className="bg-gray-900 border-b border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-1">
            {isOnline ? (
              <Wifi size={16} className="text-green-400" />
            ) : (
              <WifiOff size={16} className="text-red-400" />
            )}
            <span className="text-xs text-gray-400">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Machine connection */}
          <div className="flex items-center gap-1">
            <div className={cn(
              'w-2 h-2 rounded-full',
              status.connected ? 'bg-green-400' : 'bg-red-400',
            )} />
            <span className="text-xs text-gray-400">
              {status.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Battery level */}
          {batteryLevel !== null && (
            <div className="flex items-center gap-1">
              <Battery size={16} className={cn(
                batteryLevel > 0.2 ? 'text-green-400' : 'text-red-400',
              )} />
              <span className="text-xs text-gray-400">
                {Math.round(batteryLevel * 100)}%
              </span>
            </div>
          )}

          {/* Fullscreen toggle */}
          <TouchButton
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            icon={isFullscreen ? <EyeOff size={16} /> : <Eye size={16} />}
            className="text-gray-400"
          />

          {/* Settings */}
          <TouchButton
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            icon={<Settings size={16} />}
            className="text-gray-400"
          />
        </div>
      </div>
    </div>
  );

  // Tab content components
  const ControlsTab: React.FC = () => (
    <div className="space-y-4">
      {/* Emergency stop */}
      <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
        <TouchButton
          variant="error"
          size="touch-lg"
          fullWidth
          onClick={handleEmergencyStop}
          className="text-white font-bold"
          hapticFeedback={true}
        >
          <AlertTriangle size={24} />
          <span className="ml-2">EMERGENCY STOP</span>
        </TouchButton>
      </div>

      {/* Jog controls */}
      <TouchJogControls
        position={status.position}
        workingArea={status.workingArea}
        onJog={onJog || (() => {})}
        onHome={onHome || (() => {})}
        disabled={!status.connected || emergencyMode}
        compact={breakpoint === 'xs'}
        enableContinuousJog={true}
        enableGestures={isTouchDevice}
      />

      {/* Advanced controls toggle */}
      <TouchButton
        variant="ghost"
        size="md"
        fullWidth
        onClick={() => setShowAdvancedControls(!showAdvancedControls)}
        icon={<MoreVertical size={16} />}
      >
        {showAdvancedControls ? 'Hide' : 'Show'} Advanced Controls
      </TouchButton>

      {/* Advanced controls */}
      {showAdvancedControls && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <TouchButton
              variant="secondary"
              size="md"
              onClick={() => onHome?.(['X', 'Y', 'Z'])}
              disabled={!status.connected}
              icon={<Home size={16} />}
            >
              Home All
            </TouchButton>
            <TouchButton
              variant="secondary"
              size="md"
              onClick={() => { /* Set work origin */ }}
              disabled={!status.connected}
              icon={<Target size={16} />}
            >
              Set Origin
            </TouchButton>
          </div>
        </div>
      )}
    </div>
  );

  const StatusTab: React.FC = () => (
    <div className="space-y-4">
      {/* Machine state */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3">Machine Status</h3>
        <div className="space-y-3">
          <StatusIndicator
            status={status.connected ? 'connected' : 'disconnected'}
            label="Connection"
            value={status.connected ? 'Connected' : 'Disconnected'}
          />
          <StatusIndicator
            status={status.state === 'alarm' || status.state === 'error' ? 'error' : 'connected'}
            label="State"
            value={status.state.charAt(0).toUpperCase() + status.state.slice(1)}
          />
          <StatusIndicator
            status="connected"
            label="Feed Rate"
            value={`${status.feedRate} mm/min`}
          />
          <StatusIndicator
            status="connected"
            label="Spindle Speed"
            value={`${status.spindleSpeed} RPM`}
          />
        </div>
      </div>

      {/* Current position */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3">Current Position</h3>
        <div className="grid grid-cols-3 gap-3">
          {(['X', 'Y', 'Z'] as const).map((axis) => (
            <div key={axis} className="text-center">
              <div className="text-sm text-gray-400 mb-1">{axis}-Axis</div>
              <div className="text-2xl font-mono text-white">
                {status.position[axis.toLowerCase() as keyof typeof status.position].toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">{status.workingArea.units}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Working area */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3">Working Area</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Width (X):</span>
            <span className="text-white">{status.workingArea.width} {status.workingArea.units}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Height (Y):</span>
            <span className="text-white">{status.workingArea.height} {status.workingArea.units}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Depth (Z):</span>
            <span className="text-white">{status.workingArea.depth} {status.workingArea.units}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const JobTab: React.FC = () => (
    <div className="space-y-4">
      {status.currentJob ? (
        <>
          {/* Current job info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-3">Current Job</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Job Name:</span>
                <span className="text-white font-medium">{status.currentJob.name}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress:</span>
                  <span className="text-white">{status.currentJob.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${status.currentJob.progress}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Remaining Time:</span>
                <span className="text-white">{Math.floor(status.currentJob.remainingTime / 60)}:{(status.currentJob.remainingTime % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {/* Job controls */}
          <div className="grid grid-cols-2 gap-3">
            <TouchButton
              variant={status.state === 'running' ? 'warning' : 'primary'}
              size="touch"
              onClick={status.state === 'running' ? handlePauseJob : handleStartJob}
              disabled={!status.connected || emergencyMode}
              icon={status.state === 'running' ? <Pause size={20} /> : <Play size={20} />}
            >
              {status.state === 'running' ? 'Pause' : 'Start'}
            </TouchButton>
            <TouchButton
              variant="error"
              size="touch"
              onClick={handleStopJob}
              disabled={!status.connected || status.state === 'idle'}
              icon={<Square size={20} />}
            >
              Stop
            </TouchButton>
          </div>
        </>
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Activity size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-white mb-2">No Active Job</h3>
          <p className="text-gray-400 mb-4">Load a job to begin machining</p>
          <TouchButton
            variant="primary"
            size="md"
            onClick={() => { /* Open job loader */ }}
            disabled={!status.connected}
          >
            Load Job
          </TouchButton>
        </div>
      )}
    </div>
  );

  // Main tab navigation
  const TabNavigation: React.FC = () => (
    <div className="flex bg-gray-800 rounded-lg p-1 mb-4">
      {[
        { id: 'controls', label: 'Controls', icon: <Gauge size={16} /> },
        { id: 'status', label: 'Status', icon: <Activity size={16} /> },
        { id: 'job', label: 'Job', icon: <Play size={16} /> },
      ].map((tab) => (
        <TouchButton
          key={tab.id}
          variant={selectedTab === tab.id ? 'primary' : 'ghost'}
          size="md"
          onClick={() => setSelectedTab(tab.id as any)}
          className="flex-1"
          icon={tab.icon}
        >
          {tab.label}
        </TouchButton>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* System status bar */}
      <SystemStatusBar />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          {/* Emergency banner */}
          {emergencyMode && (
            <div className="bg-red-600 border border-red-500 rounded-lg p-4 mb-4 animate-pulse">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} />
                <div>
                  <h3 className="font-bold">EMERGENCY MODE ACTIVE</h3>
                  <p className="text-sm opacity-90">All machine operations are disabled</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab navigation */}
          <TabNavigation />

          {/* Tab content */}
          <div className="min-h-96">
            {selectedTab === 'controls' && <ControlsTab />}
            {selectedTab === 'status' && <StatusTab />}
            {selectedTab === 'job' && <JobTab />}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <MobileNavigationBar
        showMachineStatus={true}
        machineConnected={status.connected}
        emergencyMode={emergencyMode}
        onEmergencyStop={handleEmergencyStop}
      />
    </div>
  );
};

export default MobileControlsView;
