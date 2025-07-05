import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
  DashboardContainer,
  Grid,
  DashboardGrid,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  DashboardCard,
  Input,
  CoordinateInput,
  PrecisionInput,
  Badge,
  StatusBadge,
  Alert,
  AlertBanner,
  PageTransition,
  SectionTransition,
  StaggerChildren,
  AnimatedCard,
  Sidebar,
} from '../../ui/shared';
import { BasicComponentsDemo, NumberInputsDemo, CNCControlsDemo, PositionStatusDemo, FormsDemo, LayoutDemo, TypographyDemo, DataTablesDemo, PopoverTooltipsDemo, ProgressDemo, NotificationsDemo, AlertsDemo, RemainingControlsDemo } from './components';
import { InputNumber, Form, Select, Switch, Checkbox, Radio, DatePicker, TimePicker, Popover, Divider, Tour, Tooltip, Progress, notification, Input as AntInput, Transfer, Upload, Button as AntButton } from 'antd';
import {
  JogControls,
  JogSpeedControl,
  JogDistanceControl,
  CoordinateDisplay,
  CompactCoordinateDisplay,
  StatusIndicator,
  ConnectionStatus,
  StatusDashboard,
  SafetyControlPanel,
} from '../../ui/controls';
import {
  BarChart3,
  TrendingUp,
  Settings,
  Users,
  FileText,
  Wrench,
  HelpCircle,
  User,
  Info,
  AlertTriangle,
  CheckCircle,
  Zap,
  Activity,
  Shield,
  Wrench as Tool,
  MapPin,
  Play,
  Book,
  Target,
  MousePointer,
  Bell,
  BellRing,
  Clock,
  Wifi,
  WifiOff,
  Download,
  Upload as UploadIcon,
  Power,
  PowerOff,
  X,
  Check,
} from 'lucide-react';
import { 
  showBasicNotification, 
  showCNCNotification, 
  showProgressNotification, 
  transferData, 
  createUploadHandlers,
  createTourSteps 
} from './utils';

// Removed Ant Design components

export const UIDemoView: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [jogSpeed, setJogSpeed] = useState(100);
  const [jogDistance, setJogDistance] = useState(1);
  const [continuous, setContinuous] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [machineStatus, setMachineStatus] = useState<'connected' | 'disconnected' | 'idle' | 'running' | 'error' | 'warning'>('idle');
  const [isEmergencyStopped, setIsEmergencyStopped] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [showAlert, setShowAlert] = useState(true);
  const [form] = Form.useForm();
  const [tourOpen, setTourOpen] = useState(false);
  const [tourType, setTourType] = useState<'basic' | 'cnc' | 'advanced'>('basic');

  // Transfer list state
  const [transferTargetKeys, setTransferTargetKeys] = useState<string[]>(['item-2', 'item-4']);
  const [transferSelectedKeys, setTransferSelectedKeys] = useState<string[]>([]);

  // File upload state
  const [fileList, setFileList] = useState<any[]>([]);

  // Tour target refs
  const basicButtonsRef = React.useRef(null);
  const statusBadgesRef = React.useRef(null);
  const jogControlsRef = React.useRef(null);
  const emergencyStopRef = React.useRef(null);
  const coordinateDisplayRef = React.useRef(null);
  const formsRef = React.useRef(null);
  const popoverRef = React.useRef(null);
  const tooltipRef = React.useRef(null);
  const progressRef = React.useRef(null);
  const notificationRef = React.useRef(null);
  const transferRef = React.useRef(null);
  const uploadRef = React.useRef(null);

  const handleJog = (axis: 'X' | 'Y' | 'Z', direction: number) => {
    setPosition((prev) => ({
      ...prev,
      [axis.toLowerCase()]: prev[axis.toLowerCase() as keyof typeof prev] + (direction * jogDistance),
    }));
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
  };

  const handleReset = () => {
    setIsEmergencyStopped(false);
    setMachineStatus('idle');
  };

  const handleFormSubmit = (values: any) => {
    console.log('Form submitted with values:', values);
    // Simulate form submission
    alert('Form submitted successfully! Check console for values.');
  };

  // Upload handlers from utils
  const { handleUploadChange, handleUploadRemove, beforeUpload } = createUploadHandlers(fileList, setFileList);

  const handleTransferChange = (newTargetKeys: string[]) => {
    setTransferTargetKeys(newTargetKeys);
  };

  const handleTransferSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    setTransferSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  // Tour configurations from utils
  const tourRefs = {
    basicButtonsRef,
    statusBadgesRef,
    formsRef,
    popoverRef,
    tooltipRef,
    progressRef,
    notificationRef,
    transferRef,
    uploadRef,
    jogControlsRef,
    coordinateDisplayRef,
    emergencyStopRef,
  };
  
  const { basicTourSteps, cncTourSteps, advancedTourSteps } = createTourSteps(tourRefs);

  const getCurrentTourSteps = () => {
    switch (tourType) {
      case 'basic': return basicTourSteps;
      case 'cnc': return cncTourSteps;
      case 'advanced': return advancedTourSteps;
      default: return basicTourSteps;
    }
  };

  const startTour = (type: 'basic' | 'cnc' | 'advanced') => {
    setTourType(type);
    setTourOpen(true);
  };

  return (
    <PageTransition mode="fade">
      <div className="p-6 min-h-screen bg-background text-foreground">
        <DashboardContainer>
          <SectionTransition>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between p-6 rounded-lg bg-card border border-border">
              <div>
                <h1 className="text-3xl font-bold text-foreground heading mb-2">
                  UI Component Demo
                </h1>
                <p className="text-muted-foreground text-lg">
                  Showcasing the new modern component library with Luro AI design
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="success">
                  v2.0
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => console.log('Theme toggle clicked')}
                  className="cursor-pointer"
                >
                  Toggle Theme
                </Button>
              </div>
            </div>

            {/* Tour Controls */}
            <div className="mb-8 p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Interactive Tours</h2>
              <p className="text-muted-foreground mb-4">
                Take a guided tour to learn about different aspects of the CNC control interface
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="default" 
                  onClick={() => startTour('basic')}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Basic Components Tour
                </Button>
                <Button 
                  variant="cnc" 
                  onClick={() => startTour('cnc')}
                  className="flex items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  CNC Operations Tour
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => startTour('advanced')}
                  className="flex items-center gap-2"
                >
                  <Book className="w-4 h-4" />
                  Advanced Features Tour
                </Button>
              </div>
            </div>

            {/* Component Sections */}
            <StaggerChildren className="space-y-12">
              <BasicComponentsDemo 
                basicButtonsRef={basicButtonsRef}
                statusBadgesRef={statusBadgesRef}
              />

              <NumberInputsDemo />

              <FormsDemo
                formsRef={formsRef}
                transferRef={transferRef}
                uploadRef={uploadRef}
                form={form}
                transferTargetKeys={transferTargetKeys}
                transferSelectedKeys={transferSelectedKeys}
                fileList={fileList}
                transferData={transferData}
                handleFormSubmit={handleFormSubmit}
                handleTransferChange={handleTransferChange}
                handleTransferSelectChange={handleTransferSelectChange}
                handleUploadChange={handleUploadChange}
                handleUploadRemove={handleUploadRemove}
                beforeUpload={beforeUpload}
              />

              <PopoverTooltipsDemo />

              <ProgressDemo progressRef={progressRef} />

              <NotificationsDemo />

              <RemainingControlsDemo
                jogControlsRef={jogControlsRef}
                coordinateDisplayRef={coordinateDisplayRef}
                emergencyStopRef={emergencyStopRef}
                position={position}
                jogSpeed={jogSpeed}
                jogDistance={jogDistance}
                continuous={continuous}
                isConnected={isConnected}
                machineStatus={machineStatus}
                isEmergencyStopped={isEmergencyStopped}
                setShowSidebar={setShowSidebar}
                handleJog={handleJog}
                handleZero={handleZero}
                setJogSpeed={setJogSpeed}
                setJogDistance={setJogDistance}
                setContinuous={setContinuous}
                setIsEmergencyStopped={setIsEmergencyStopped}
                setIsConnected={setIsConnected}
                setMachineStatus={setMachineStatus}
                handleEmergencyStop={handleEmergencyStop}
              />

              <AlertsDemo />

              <LayoutDemo />

              <TypographyDemo />

              <DataTablesDemo />

            </StaggerChildren>
          </SectionTransition>
        </DashboardContainer>

        {/* Tour Component */}
        <Tour
          open={tourOpen}
          onClose={() => setTourOpen(false)}
          steps={getCurrentTourSteps()}
          indicatorsRender={(current, total) => (
            <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
              {current + 1} / {total}
            </span>
          )}
        />

        {/* Sidebar */}
        <Sidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          title="Settings Sidebar"
          position="right"
        >
          <div className="p-6 space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Theme Settings</h4>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Theme switching will be available when fully integrated.
              </p>
            </div>
            <div className="border-t border-border my-4"></div>
            <p className="text-foreground">This is an example sidebar component with smooth animations.</p>
          </div>
        </Sidebar>
      </div>
    </PageTransition>
  );
};
