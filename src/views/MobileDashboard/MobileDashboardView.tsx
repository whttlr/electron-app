/**
 * MobileDashboardView Component
 * 
 * Mobile-optimized dashboard for CNC control systems. Features adaptive
 * layouts, touch-optimized interactions, and industrial-grade monitoring
 * capabilities for tablets and mobile devices.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { useResponsive } from '@/ui/theme/responsive';
import { OrientationAdapter } from '@/ui/components/OrientationAdapter/OrientationAdapter';
import { TouchButton } from '@/ui/components/TouchOptimized/TouchButton';
import { pwaManager } from '@/utils/pwa';
import { offlineSyncManager } from '@/utils/offline-sync';
import {
  Activity,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Thermometer,
  Zap,
  Eye,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Play,
  Pause,
  Home,
  Target,
  MoreHorizontal,
} from 'lucide-react';

interface DashboardMetrics {
  machineStatus: {
    state: 'idle' | 'running' | 'paused' | 'alarm' | 'error' | 'homing';
    uptime: number;
    lastUpdate: number;
  };
  position: {
    x: number;
    y: number;
    z: number;
    units: 'mm' | 'in';
  };
  performance: {
    feedRate: number;
    spindleSpeed: number;
    loadPercentage: number;
    temperature: number;
  };
  connectivity: {
    isConnected: boolean;
    signalStrength: number;
    lastSync: number;
    queuedItems: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    batteryLevel?: number;
  };
  currentJob?: {
    id: string;
    name: string;
    progress: number;
    startTime: number;
    estimatedCompletion: number;
  };
  alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
}

export interface MobileDashboardViewProps {
  /** Dashboard metrics data */
  metrics?: DashboardMetrics;
  /** Refresh interval in milliseconds */
  refreshInterval?: number;
  /** Enable real-time updates */
  realTimeUpdates?: boolean;
  /** Show system metrics */
  showSystemMetrics?: boolean;
  /** Navigation callbacks */
  onNavigateToControls?: () => void;
  onNavigateToJobs?: () => void;
  onNavigateToSettings?: () => void;
  /** Quick action callbacks */
  onQuickHome?: () => void;
  onQuickStop?: () => void;
  onEmergencyStop?: () => void;
  /** Data refresh callback */
  onRefreshData?: () => Promise<void>;
}

export const MobileDashboardView: React.FC<MobileDashboardViewProps> = ({
  metrics,
  refreshInterval = 1000,
  realTimeUpdates = true,
  showSystemMetrics = true,
  onNavigateToControls,
  onNavigateToJobs,
  onNavigateToSettings,
  onQuickHome,
  onQuickStop,
  onEmergencyStop,
  onRefreshData,
}) => {
  const { orientation, breakpoint, isTouchDevice } = useResponsive();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState(offlineSyncManager.getStatus());

  // Default metrics
  const defaultMetrics: DashboardMetrics = {
    machineStatus: {
      state: 'idle',
      uptime: 0,
      lastUpdate: Date.now(),
    },
    position: { x: 0, y: 0, z: 0, units: 'mm' },
    performance: {
      feedRate: 0,
      spindleSpeed: 0,
      loadPercentage: 0,
      temperature: 22,
    },
    connectivity: {
      isConnected: false,
      signalStrength: 0,
      lastSync: Date.now(),
      queuedItems: 0,
    },
    system: {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
    },
    alerts: [],
  };

  const currentMetrics = metrics || defaultMetrics;

  // Auto-refresh data
  useEffect(() => {
    if (!realTimeUpdates) return;

    const interval = setInterval(async () => {
      if (onRefreshData) {
        try {
          await onRefreshData();
          setLastRefresh(Date.now());
        } catch (error) {
          console.error('Failed to refresh dashboard data:', error);
        }
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [realTimeUpdates, refreshInterval, onRefreshData]);

  // Monitor sync status
  useEffect(() => {
    const updateSyncStatus = () => {
      setSyncStatus(offlineSyncManager.getStatus());
    };

    offlineSyncManager.addEventListener(updateSyncStatus);
    const interval = setInterval(updateSyncStatus, 5000);

    return () => {
      offlineSyncManager.removeEventListener(updateSyncStatus);
      clearInterval(interval);
    };
  }, []);

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefreshData?.();
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, onRefreshData]);

  // Format time
  const formatTime = useCallback((timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }, []);

  // Format duration
  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Status card component
  const StatusCard: React.FC<{
    id: string;
    title: string;
    icon: React.ReactNode;
    value: string | number;
    subtitle?: string;
    status?: 'success' | 'warning' | 'error' | 'info';
    expandable?: boolean;
    children?: React.ReactNode;
    action?: {
      label: string;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'warning' | 'error';
    };
  }> = ({ id, title, icon, value, subtitle, status = 'info', expandable, children, action }) => {
    const isExpanded = expandedCard === id;
    
    const statusColors = {
      success: 'border-green-500/30 bg-green-500/10',
      warning: 'border-yellow-500/30 bg-yellow-500/10',
      error: 'border-red-500/30 bg-red-500/10',
      info: 'border-blue-500/30 bg-blue-500/10',
    };

    return (
      <div className={cn(
        'bg-gray-800 rounded-lg border-2 transition-all duration-200',
        statusColors[status],
        expandable && 'cursor-pointer',
        isExpanded && 'ring-2 ring-blue-400'
      )}>
        <div 
          className="p-4"
          onClick={expandable ? () => setExpandedCard(isExpanded ? null : id) : undefined}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{icon}</div>
              <div>
                <h3 className="font-medium text-white">{title}</h3>
                <div className="text-2xl font-bold text-white mt-1">{value}</div>
                {subtitle && (
                  <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
            
            {expandable && (
              <MoreHorizontal size={16} className="text-gray-400" />
            )}
          </div>

          {action && (
            <div className="mt-3">
              <TouchButton
                variant={action.variant || 'secondary'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                fullWidth
              >
                {action.label}
              </TouchButton>
            </div>
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && children && (
          <div className="border-t border-gray-600 p-4">
            {children}
          </div>
        )}
      </div>
    );
  };

  // Quick actions component
  const QuickActions: React.FC = () => (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="font-medium text-white mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <TouchButton
          variant="primary"
          size="md"
          onClick={onNavigateToControls}
          icon={<Target size={16} />}
        >
          Controls
        </TouchButton>
        <TouchButton
          variant="secondary"
          size="md"
          onClick={onQuickHome}
          icon={<Home size={16} />}
        >
          Home
        </TouchButton>
        <TouchButton
          variant="secondary"
          size="md"
          onClick={onNavigateToJobs}
          icon={<Play size={16} />}
        >
          Jobs
        </TouchButton>
        <TouchButton
          variant="warning"
          size="md"
          onClick={onQuickStop}
          icon={<Pause size={16} />}
        >
          Stop
        </TouchButton>
      </div>
    </div>
  );

  // Alerts component
  const AlertsCard: React.FC = () => (
    <StatusCard
      id="alerts"
      title="System Alerts"
      icon={<AlertTriangle className={cn(
        currentMetrics.alerts.length > 0 ? 'text-red-400' : 'text-green-400'
      )} />}
      value={currentMetrics.alerts.length}
      subtitle={currentMetrics.alerts.length > 0 ? 'Issues detected' : 'All systems normal'}
      status={currentMetrics.alerts.length > 0 ? 'error' : 'success'}
      expandable={currentMetrics.alerts.length > 0}
    >
      <div className="space-y-2">
        {currentMetrics.alerts.slice(0, 3).map((alert) => (
          <div key={alert.id} className="flex items-start gap-2 p-2 bg-gray-700 rounded">
            <AlertTriangle size={14} className={cn(
              alert.type === 'error' && 'text-red-400',
              alert.type === 'warning' && 'text-yellow-400',
              alert.type === 'info' && 'text-blue-400'
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">{alert.message}</p>
              <p className="text-xs text-gray-400">{formatTime(alert.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </StatusCard>
  );

  // Portrait layout
  const PortraitLayout: React.FC = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center gap-2">
          <TouchButton
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            icon={<RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />}
          />
          <TouchButton
            variant="ghost"
            size="sm"
            onClick={onNavigateToSettings}
            icon={<Settings size={16} />}
          />
        </div>
      </div>

      {/* Connection status banner */}
      {!syncStatus.isOnline && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <WifiOff size={16} className="text-red-400" />
            <span className="text-red-200 text-sm">
              Offline mode - {syncStatus.queueSize} items queued for sync
            </span>
          </div>
        </div>
      )}

      {/* Machine status */}
      <StatusCard
        id="machine"
        title="Machine Status"
        icon={<Activity className={cn(
          currentMetrics.machineStatus.state === 'running' && 'text-green-400',
          currentMetrics.machineStatus.state === 'idle' && 'text-blue-400',
          currentMetrics.machineStatus.state === 'alarm' && 'text-red-400',
          currentMetrics.machineStatus.state === 'error' && 'text-red-400'
        )} />}
        value={currentMetrics.machineStatus.state.toUpperCase()}
        subtitle={`Uptime: ${formatDuration(currentMetrics.machineStatus.uptime)}`}
        status={
          currentMetrics.machineStatus.state === 'running' ? 'success' :
          currentMetrics.machineStatus.state === 'idle' ? 'info' : 'error'
        }
        action={
          currentMetrics.machineStatus.state === 'alarm' || currentMetrics.machineStatus.state === 'error'
            ? { label: 'Reset', onClick: () => {}, variant: 'warning' }
            : undefined
        }
      />

      {/* Current job */}
      {currentMetrics.currentJob && (
        <StatusCard
          id="job"
          title="Current Job"
          icon={<Play className="text-green-400" />}
          value={`${currentMetrics.currentJob.progress}%`}
          subtitle={currentMetrics.currentJob.name}
          status="success"
          expandable
        >
          <div className="space-y-3">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentMetrics.currentJob.progress}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Started:</span>
                <div className="text-white">{formatTime(currentMetrics.currentJob.startTime)}</div>
              </div>
              <div>
                <span className="text-gray-400">ETA:</span>
                <div className="text-white">{formatTime(currentMetrics.currentJob.estimatedCompletion)}</div>
              </div>
            </div>
          </div>
        </StatusCard>
      )}

      {/* Position */}
      <StatusCard
        id="position"
        title="Current Position"
        icon={<Target className="text-blue-400" />}
        value={`X:${currentMetrics.position.x.toFixed(1)} Y:${currentMetrics.position.y.toFixed(1)} Z:${currentMetrics.position.z.toFixed(1)}`}
        subtitle={currentMetrics.position.units}
        status="info"
      />

      {/* Performance metrics */}
      <div className="grid grid-cols-2 gap-4">
        <StatusCard
          id="feedrate"
          title="Feed Rate"
          icon={<Gauge className="text-green-400" />}
          value={currentMetrics.performance.feedRate}
          subtitle="mm/min"
          status="success"
        />
        <StatusCard
          id="spindle"
          title="Spindle"
          icon={<Zap className="text-yellow-400" />}
          value={currentMetrics.performance.spindleSpeed}
          subtitle="RPM"
          status="warning"
        />
      </div>

      {/* System metrics */}
      {showSystemMetrics && (
        <div className="grid grid-cols-2 gap-4">
          <StatusCard
            id="cpu"
            title="CPU"
            icon={<Cpu className="text-blue-400" />}
            value={`${currentMetrics.system.cpuUsage}%`}
            status={currentMetrics.system.cpuUsage > 80 ? 'warning' : 'info'}
          />
          <StatusCard
            id="memory"
            title="Memory"
            icon={<HardDrive className="text-purple-400" />}
            value={`${currentMetrics.system.memoryUsage}%`}
            status={currentMetrics.system.memoryUsage > 80 ? 'warning' : 'info'}
          />
        </div>
      )}

      {/* Alerts */}
      <AlertsCard />

      {/* Quick actions */}
      <QuickActions />

      {/* Last update */}
      <div className="text-center text-sm text-gray-400">
        Last updated: {formatTime(lastRefresh)}
      </div>
    </div>
  );

  // Landscape layout - more compact, two columns
  const LandscapeLayout: React.FC = () => (
    <div className="grid grid-cols-2 gap-6 h-full">
      {/* Left column */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">CNC Dashboard</h1>
          <div className="flex items-center gap-2">
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              icon={<RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />}
            />
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={onNavigateToSettings}
              icon={<Settings size={14} />}
            />
          </div>
        </div>

        {/* Machine status */}
        <StatusCard
          id="machine"
          title="Machine Status"
          icon={<Activity className={cn(
            currentMetrics.machineStatus.state === 'running' && 'text-green-400',
            currentMetrics.machineStatus.state === 'idle' && 'text-blue-400',
            currentMetrics.machineStatus.state === 'alarm' && 'text-red-400'
          )} />}
          value={currentMetrics.machineStatus.state.toUpperCase()}
          subtitle={`Uptime: ${formatDuration(currentMetrics.machineStatus.uptime)}`}
          status={currentMetrics.machineStatus.state === 'running' ? 'success' : 'info'}
        />

        {/* Position */}
        <StatusCard
          id="position"
          title="Position"
          icon={<Target className="text-blue-400" />}
          value={`${currentMetrics.position.x.toFixed(1)}, ${currentMetrics.position.y.toFixed(1)}, ${currentMetrics.position.z.toFixed(1)}`}
          subtitle={currentMetrics.position.units}
          status="info"
        />

        {/* Performance metrics */}
        <div className="grid grid-cols-2 gap-3">
          <StatusCard
            id="feedrate"
            title="Feed"
            icon={<Gauge className="text-green-400" />}
            value={currentMetrics.performance.feedRate}
            subtitle="mm/min"
            status="success"
          />
          <StatusCard
            id="spindle"
            title="Spindle"
            icon={<Zap className="text-yellow-400" />}
            value={currentMetrics.performance.spindleSpeed}
            subtitle="RPM"
            status="warning"
          />
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Current job */}
        {currentMetrics.currentJob && (
          <StatusCard
            id="job"
            title="Current Job"
            icon={<Play className="text-green-400" />}
            value={`${currentMetrics.currentJob.progress}%`}
            subtitle={currentMetrics.currentJob.name}
            status="success"
          />
        )}

        {/* Quick actions */}
        <QuickActions />

        {/* System metrics */}
        {showSystemMetrics && (
          <div className="grid grid-cols-2 gap-3">
            <StatusCard
              id="cpu"
              title="CPU"
              icon={<Cpu className="text-blue-400" />}
              value={`${currentMetrics.system.cpuUsage}%`}
              status={currentMetrics.system.cpuUsage > 80 ? 'warning' : 'info'}
            />
            <StatusCard
              id="memory"
              title="Memory"
              icon={<HardDrive className="text-purple-400" />}
              value={`${currentMetrics.system.memoryUsage}%`}
              status={currentMetrics.system.memoryUsage > 80 ? 'warning' : 'info'}
            />
          </div>
        )}

        {/* Alerts */}
        <AlertsCard />

        {/* Last update */}
        <div className="text-center text-sm text-gray-400">
          Last updated: {formatTime(lastRefresh)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto max-w-6xl">
        <OrientationAdapter
          layout={{
            portrait: <PortraitLayout />,
            landscape: <LandscapeLayout />,
            transition: 'fade',
          }}
          showControls={true}
          enableFullscreen={true}
        />
      </div>
    </div>
  );
};

export default MobileDashboardView;