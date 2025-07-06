import React, { useState } from 'react';

// Import components from ui-library
import {
  Button,
  Badge,
  Card,
  Alert,
  Progress,
  JogControls,
  CoordinateDisplay,
  CompactCoordinateDisplay,
  StatusIndicator,
  ConnectionStatus,
  StatusDashboard,
  SafetyControlPanel,
} from '@whttlr/ui-core';

// Import remaining local components
import {
  JogSpeedControl,
  JogDistanceControl,
  PageTransition,
  SectionTransition,
  StaggerChildren,
  AnimatedCard,
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
  DataTable,
} from './components/ui';

// Test component to validate all imports
export const ComponentTest: React.FC = () => {
  const [position, setPosition] = useState({ x: 10.5, y: -5.25, z: 2.0 });
  const [jogSpeed, setJogSpeed] = useState(100);
  const [jogDistance, setJogDistance] = useState(1);
  const [isConnected, setIsConnected] = useState(true);
  const [machineStatus, setMachineStatus] = useState<'idle' | 'running' | 'error' | 'warning'>('idle');
  const [isEmergencyStopped, setIsEmergencyStopped] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [coordinateValue, setCoordinateValue] = useState(10.025);
  const [precisionValue, setPrecisionValue] = useState(0.0001);

  const { notifications, addNotification, dismissNotification } = useNotifications();

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
    } else {
      setPosition({ x: 0, y: 0, z: 0 });
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

  return (
    <PageTransition mode="fade">
      <DashboardContainer>
        <div className="p-6 space-y-6">
          <h1 className="text-3xl font-bold">Component Test Suite</h1>

          {/* Test all primitive components */}
          <DashboardCard title="Primitive Components Test">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="cnc">CNC</Button>
                <Button variant="emergency">Emergency</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
              </div>

              <div className="flex gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
              </div>

              <Alert variant="info">
                <h5 className="mb-1 font-medium leading-none tracking-tight">Test Alert</h5>
                <div className="text-sm">All components are loading correctly!</div>
              </Alert>
            </div>
          </DashboardCard>

          {/* Test CNC components */}
          <Grid cols={3} gap="lg">
            <JogControls
              onJog={handleJog}
              onZero={handleZero}
              disabled={isEmergencyStopped}
            />

            <CoordinateDisplay
              position={position}
              units="mm"
              precision={3}
            />

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

            <StatusDashboard
              connectionStatus={isConnected ? 'connected' : 'disconnected'}
              machineStatus={machineStatus}
            />

            <SafetyControlPanel
              isEmergencyStopped={isEmergencyStopped}
              onEmergencyStop={handleEmergencyStop}
              onReset={handleReset}
              disabled={false}
            />

            <Card className="p-4">
              <h4 className="text-lg font-semibold mb-4">Compact Position</h4>
              <CompactCoordinateDisplay
                position={position}
                units="mm"
                precision={3}
              />
            </Card>
          </Grid>

          {/* Test specialized inputs */}
          <DashboardCard title="Specialized Inputs Test">
            <Grid cols={2} gap="lg">
              <CoordinateInput
                value={coordinateValue}
                onChange={setCoordinateValue}
                label="X Position"
                units="mm"
                precision={3}
                min={-100}
                max={100}
              />

              <PrecisionInput
                value={precisionValue}
                onChange={setPrecisionValue}
                label="Fine Adjustment"
                precision={4}
                min={0}
                max={1}
                showStepButtons={true}
              />
            </Grid>
          </DashboardCard>

          {/* Test progress and status */}
          <DashboardCard title="Progress & Status Test">
            <div className="space-y-4">
              <div className="flex gap-4">
                <StatusIndicator status="connected" />
                <StatusIndicator status="running" />
                <StatusIndicator status="error" />
                <StatusIndicator status="warning" />
                <ConnectionStatus isConnected={isConnected} />
              </div>

              <div className="space-y-2">
                <Progress value={75} max={100} variant="default" />
                <Progress value={90} max={100} variant="success" />
                <Progress value={45} max={100} variant="warning" />
                <Progress value={25} max={100} variant="danger" />
              </div>

              <div className="flex justify-center">
                <CircularProgress value={68} max={100} variant="info" size={120} />
              </div>
            </div>
          </DashboardCard>

          {/* Test data table */}
          <DashboardCard title="Data Table Test">
            <DataTable
              data={sampleJobData}
              columns={tableColumns}
              sortable={true}
              pagination={true}
              pageSize={5}
            />
          </DashboardCard>

          {/* Test controls */}
          <DashboardCard title="Interactive Controls Test">
            <div className="flex gap-4">
              <Button
                variant={isConnected ? 'success' : 'outline'}
                onClick={() => setIsConnected(!isConnected)}
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
              >
                Change Status: {machineStatus.toUpperCase()}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowSidebar(true)}
              >
                Open Sidebar
              </Button>

              <Button
                onClick={() => addNotification({
                  type: 'success',
                  title: 'Test Notification',
                  message: 'All components are working correctly!',
                  duration: 3000,
                })}
              >
                Test Notification
              </Button>
            </div>
          </DashboardCard>

        </div>

        {/* Test sidebar */}
        <Sidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          title="Test Sidebar"
          position="right"
          width="lg"
        >
          <div className="p-6">
            <h4 className="text-lg font-semibold mb-4">Sidebar Content</h4>
            <p>All sidebar functionality is working correctly!</p>
            <Button variant="default" className="w-full mt-4">
              Close Sidebar
            </Button>
          </div>
        </Sidebar>

        {/* Test notifications */}
        <NotificationContainer
          notifications={notifications}
          onDismiss={dismissNotification}
          position="top-right"
        />

      </DashboardContainer>
    </PageTransition>
  );
};

export default ComponentTest;
