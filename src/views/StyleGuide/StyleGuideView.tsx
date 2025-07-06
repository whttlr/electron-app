import React, { useState } from 'react';

// UI Library Components - now using ui-library packages
import {
  Settings,
  Activity,
  Zap,
  Target,
  Play,
  Pause,
  Power,
  Wifi,
  WifiOff,
  Bell,
  BellRing,
  Clock,
  Book,
  MousePointer,
  Download,
  Upload,
} from 'lucide-react';

// Primitive components from ui-core
import {
  Button,
  Badge,
  Card,
  Alert,
  Progress,
} from '@whttlr/ui-core';

// CNC-specific components from ui-core (CNC components are part of core)
import {
  JogControls,
  CoordinateDisplay,
  CompactCoordinateDisplay,
  StatusIndicator,
  ConnectionStatus,
  StatusDashboard,
  SafetyControlPanel,
} from '@whttlr/ui-core';

// Note: Some components may not be available yet in ui-library
// Temporarily keeping local imports for components that haven't been migrated:
import {
  JogSpeedControl,
  JogDistanceControl,
  SectionTransition,
  StaggerChildren,
  CoordinateInput,
  PrecisionInput,
  DashboardContainer,
  Grid,
  DashboardGrid,
  DashboardCard,
  Sidebar,
  CircularProgress,
  NotificationContainer,
  useNotifications,
  AnimatedCard,
  PageTransition,
  DataTable,
} from '../../components/ui';

// Icons

export const StyleGuideView: React.FC = () => {
  // CNC Machine State
  const [position, setPosition] = useState({ x: 12.456, y: -5.789, z: 2.100 });
  const [jogSpeed, setJogSpeed] = useState(100);
  const [jogDistance, setJogDistance] = useState(1);
  const [isConnected, setIsConnected] = useState(true);
  const [machineStatus, setMachineStatus] = useState<'idle' | 'running' | 'error' | 'warning'>('idle');
  const [isEmergencyStopped, setIsEmergencyStopped] = useState(false);

  // UI State
  const [showSidebar, setShowSidebar] = useState(false);
  const [coordinateValue, setCoordinateValue] = useState(10.025);
  const [precisionValue, setPrecisionValue] = useState(0.0001);

  // Notifications
  const { notifications, addNotification, dismissNotification } = useNotifications();

  // CNC Control Handlers
  const handleJog = (axis: 'X' | 'Y' | 'Z', direction: number) => {
    setPosition((prev) => ({
      ...prev,
      [axis.toLowerCase()]: prev[axis.toLowerCase() as keyof typeof prev] + (direction * jogDistance),
    }));

    addNotification({
      type: 'info',
      title: 'Jog Command',
      message: `Moved ${axis} axis ${direction > 0 ? '+' : ''}${direction * jogDistance}mm`,
      duration: 2000,
    });
  };

  const handleZero = (axis?: 'X' | 'Y' | 'Z') => {
    if (axis) {
      setPosition((prev) => ({ ...prev, [axis.toLowerCase()]: 0 }));
      addNotification({
        type: 'success',
        title: 'Zero Set',
        message: `${axis} axis zeroed`,
        duration: 2000,
      });
    } else {
      setPosition({ x: 0, y: 0, z: 0 });
      addNotification({
        type: 'success',
        title: 'All Axes Zeroed',
        message: 'All axes have been set to zero',
        duration: 3000,
      });
    }
  };

  const handleEmergencyStop = () => {
    setIsEmergencyStopped(true);
    setMachineStatus('error');
    addNotification({
      type: 'error',
      title: 'EMERGENCY STOP',
      message: 'Machine has been emergency stopped for safety',
      duration: 0,
    });
  };

  const handleReset = () => {
    setIsEmergencyStopped(false);
    setMachineStatus('idle');
    addNotification({
      type: 'success',
      title: 'System Reset',
      message: 'Machine is ready for operation',
      duration: 3000,
    });
  };

  // Sample data for DataTable
  const sampleJobData = [
    {
      id: 1, name: 'Part_001.gcode', status: 'Completed', duration: '0:45:32', material: 'Aluminum',
    },
    {
      id: 2, name: 'Part_002.gcode', status: 'Running', duration: '0:12:45', material: 'Steel',
    },
    {
      id: 3, name: 'Part_003.gcode', status: 'Queued', duration: '--:--:--', material: 'Plastic',
    },
    {
      id: 4, name: 'Part_004.gcode', status: 'Failed', duration: '0:05:12', material: 'Aluminum',
    },
  ];

  const tableColumns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Job Name', accessor: 'name' as const },
    {
      header: 'Status',
      accessor: (row: typeof sampleJobData[0]) => (
        <Badge variant={
          row.status === 'Completed' ? 'success'
            : row.status === 'Running' ? 'info'
              : row.status === 'Failed' ? 'danger' : 'secondary'
        }>
          {row.status}
        </Badge>
      ),
    },
    { header: 'Duration', accessor: 'duration' as const },
    { header: 'Material', accessor: 'material' as const },
  ];

  const showNotification = (type: 'info' | 'success' | 'warning' | 'error') => {
    const messages = {
      info: { title: 'Information', message: 'This is an informational message' },
      success: { title: 'Success!', message: 'Operation completed successfully' },
      warning: { title: 'Warning', message: 'Please check your settings' },
      error: { title: 'Error', message: 'Something went wrong' },
    };

    addNotification({
      type,
      ...messages[type],
      duration: 4000,
    });
  };

  return (
    <PageTransition mode="fade">
      <DashboardContainer>
        <SectionTransition>
          {/* Header */}
          <DashboardCard className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  CNC UI Component Library
                </h1>
                <p className="text-muted-foreground text-lg">
                  Complete showcase of CNC control components with interactive features
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="success">v2.0 Complete</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSidebar(true)}
                  iconl={<Settings className="w-4 h-4" />}
                >
                  Settings
                </Button>
              </div>
            </div>
          </DashboardCard>

          <StaggerChildren className="space-y-8">

            {/* CNC Control Section */}
            <AnimatedCard>
              <DashboardCard title="CNC Machine Controls">
                <Grid cols={3} gap="lg">
                  {/* Jog Controls */}
                  <JogControls
                    onJog={handleJog}
                    onZero={handleZero}
                    disabled={isEmergencyStopped}
                  />

                  {/* Position Display */}
                  <CoordinateDisplay
                    position={position}
                    units="mm"
                    precision={3}
                  />

                  {/* Speed & Distance Controls */}
                  <div className="space-y-4">
                    <JogSpeedControl
                      speed={jogSpeed}
                      onSpeedChange={setJogSpeed}
                      disabled={isEmergencyStopped}
                    />
                    <JogDistanceControl
                      distance={jogDistance}
                      onDistanceChange={setJogDistance}
                      disabled={isEmergencyStopped}
                    />
                  </div>

                  {/* Status Dashboard */}
                  <StatusDashboard
                    connectionStatus={isConnected ? 'connected' : 'disconnected'}
                    machineStatus={machineStatus}
                  />

                  {/* Safety Controls */}
                  <SafetyControlPanel
                    isEmergencyStopped={isEmergencyStopped}
                    onEmergencyStop={handleEmergencyStop}
                    onReset={handleReset}
                    disabled={false}
                  />

                  {/* Compact Position Display */}
                  <Card className="p-4">
                    <h4 className="text-lg font-semibold mb-4">Compact Position</h4>
                    <CompactCoordinateDisplay
                      position={position}
                      units="mm"
                      precision={3}
                    />
                  </Card>
                </Grid>
              </DashboardCard>
            </AnimatedCard>

            {/* Primitive Components */}
            <AnimatedCard>
              <DashboardCard title="Primitive Components">
                <div className="space-y-6">

                  {/* Buttons */}
                  <div>
                    <h4 className="text-lg font-medium text-foreground mb-4">Buttons</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="default">Default</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="cnc" iconl={<Target className="w-4 h-4" />}>CNC Action</Button>
                      <Button variant="emergency" iconl={<Power className="w-4 h-4" />}>Emergency</Button>
                      <Button variant="success" iconl={<Activity className="w-4 h-4" />}>Success</Button>
                      <Button variant="warning" iconl={<Zap className="w-4 h-4" />}>Warning</Button>
                      <Button size="sm">Small</Button>
                      <Button size="lg">Large</Button>
                      <Button disabled>Disabled</Button>
                    </div>
                  </div>

                  {/* Badges & Status Indicators */}
                  <div>
                    <h4 className="text-lg font-medium text-foreground mb-4">Badges & Status</h4>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="default">Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                        <Badge variant="success">Success</Badge>
                        <Badge variant="warning">Warning</Badge>
                        <Badge variant="danger">Danger</Badge>
                        <Badge variant="info">Info</Badge>
                        <Badge variant="outline-success">Outline Success</Badge>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <StatusIndicator status="connected" />
                        <StatusIndicator status="running" />
                        <StatusIndicator status="error" />
                        <StatusIndicator status="warning" />
                        <ConnectionStatus isConnected={isConnected} />
                      </div>
                    </div>
                  </div>

                  {/* Alerts */}
                  <div>
                    <h4 className="text-lg font-medium text-foreground mb-4">Alerts</h4>
                    <div className="space-y-3">
                      <Alert variant="info">
                        <h5 className="mb-1 font-medium leading-none tracking-tight">Information</h5>
                        <div className="text-sm">Machine is ready for operation</div>
                      </Alert>
                      <Alert variant="success">
                        <h5 className="mb-1 font-medium leading-none tracking-tight">Success</h5>
                        <div className="text-sm">Job completed successfully</div>
                      </Alert>
                      <Alert variant="warning">
                        <h5 className="mb-1 font-medium leading-none tracking-tight">Warning</h5>
                        <div className="text-sm">Low coolant level detected</div>
                      </Alert>
                      <Alert variant="destructive">
                        <h5 className="mb-1 font-medium leading-none tracking-tight">Error</h5>
                        <div className="text-sm">Emergency stop activated</div>
                      </Alert>
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </AnimatedCard>

            {/* Specialized Inputs */}
            <AnimatedCard>
              <DashboardCard title="Specialized Input Components">
                <Grid cols={2} gap="lg">
                  <div>
                    <h4 className="text-lg font-medium mb-4">Coordinate Input</h4>
                    <CoordinateInput
                      value={coordinateValue}
                      onChange={setCoordinateValue}
                      label="X Position"
                      units="mm"
                      precision={3}
                      min={-100}
                      max={100}
                    />
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-4">Precision Input</h4>
                    <PrecisionInput
                      value={precisionValue}
                      onChange={setPrecisionValue}
                      label="Fine Adjustment"
                      precision={4}
                      min={0}
                      max={1}
                      showStepButtons={true}
                    />
                  </div>
                </Grid>
              </DashboardCard>
            </AnimatedCard>

            {/* Progress & Notifications */}
            <AnimatedCard>
              <DashboardCard title="Progress & Notifications">
                <Grid cols={2} gap="lg">
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">Progress Indicators</h4>
                    <Progress value={75} max={100} variant="default" />
                    <Progress value={90} max={100} variant="success" />
                    <Progress value={45} max={100} variant="warning" />
                    <Progress value={25} max={100} variant="danger" />

                    <div className="flex justify-center mt-6">
                      <CircularProgress value={68} max={100} variant="info" size={120} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">Notification System</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" onClick={() => showNotification('info')}>
                        <Bell className="w-4 h-4 mr-2" />
                        Info
                      </Button>
                      <Button size="sm" variant="success" onClick={() => showNotification('success')}>
                        Success
                      </Button>
                      <Button size="sm" variant="warning" onClick={() => showNotification('warning')}>
                        Warning
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => showNotification('error')}>
                        Error
                      </Button>
                    </div>
                  </div>
                </Grid>
              </DashboardCard>
            </AnimatedCard>

            {/* Data Table */}
            <AnimatedCard>
              <DashboardCard title="Data Management">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Job History Table</h4>
                  <DataTable
                    data={sampleJobData}
                    columns={tableColumns}
                    sortable={true}
                    pagination={true}
                    pageSize={5}
                  />
                </div>
              </DashboardCard>
            </AnimatedCard>

            {/* Interactive Demo */}
            <AnimatedCard>
              <DashboardCard title="Interactive Controls Demo">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <Button
                      variant={isConnected ? 'success' : 'outline'}
                      onClick={() => setIsConnected(!isConnected)}
                      iconl={isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                    >
                      {isConnected ? 'Connected' : 'Connect'}
                    </Button>

                    <Button
                      variant="cnc"
                      onClick={() => setMachineStatus(
                        machineStatus === 'idle' ? 'running'
                          : machineStatus === 'running' ? 'warning'
                            : machineStatus === 'warning' ? 'error' : 'idle',
                      )}
                      iconl={<Activity className="w-4 h-4" />}
                    >
                      Change Status: {machineStatus.toUpperCase()}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setShowSidebar(true)}
                      iconl={<MousePointer className="w-4 h-4" />}
                    >
                      Open Sidebar
                    </Button>
                  </div>
                </div>
              </DashboardCard>
            </AnimatedCard>

          </StaggerChildren>
        </SectionTransition>

        {/* Sidebar Component */}
        <Sidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          title="Component Settings"
          position="right"
          width="lg"
        >
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4">Theme Configuration</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dark Mode</span>
                  <Badge variant="success">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Animations</span>
                  <Badge variant="info">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sound Effects</span>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-lg font-semibold mb-4">Machine Settings</h4>
              <div className="space-y-4">
                <CoordinateInput
                  value={100}
                  onChange={() => {}}
                  label="Max Speed"
                  units="mm/min"
                  precision={0}
                />
                <CoordinateInput
                  value={200}
                  onChange={() => {}}
                  label="Work Area X"
                  units="mm"
                  precision={0}
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <Button variant="default" className="w-full">
                Save Settings
              </Button>
            </div>
          </div>
        </Sidebar>

        {/* Notification Container */}
        <NotificationContainer
          notifications={notifications}
          onDismiss={dismissNotification}
          position="top-right"
        />

      </DashboardContainer>
    </PageTransition>
  );
};
