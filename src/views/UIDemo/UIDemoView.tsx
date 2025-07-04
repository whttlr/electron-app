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

  // Notification handlers
  const showBasicNotification = (type: 'info' | 'success' | 'warning' | 'error') => {
    const messages = {
      info: { message: 'Information', description: 'This is a basic information notification.' },
      success: { message: 'Success', description: 'Operation completed successfully!' },
      warning: { message: 'Warning', description: 'Please check your settings and try again.' },
      error: { message: 'Error', description: 'An error occurred while processing your request.' }
    };
    
    notification[type](messages[type]);
  };

  const showCNCNotification = (type: string) => {
    switch (type) {
      case 'jobComplete':
        notification.success({
          message: 'Job Completed',
          description: 'CNC job "part_bracket.gcode" has finished successfully. Quality check passed.',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          duration: 6,
        });
        break;
      case 'toolChange':
        notification.warning({
          message: 'Tool Change Required',
          description: 'Please insert Tool #5 (6.35mm End Mill) and press continue.',
          icon: <Tool className="w-5 h-5 text-amber-500" />,
          duration: 0, // Don't auto-close
        });
        break;
      case 'emergency':
        notification.error({
          message: 'Emergency Stop Activated',
          description: 'Machine stopped due to safety protocol. Check machine status before resuming.',
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          duration: 0, // Don't auto-close
        });
        break;
      case 'connection':
        notification.info({
          message: 'Connection Restored',
          description: 'Successfully reconnected to CNC machine at /dev/ttyUSB0',
          icon: <Wifi className="w-5 h-5 text-blue-500" />,
        });
        break;
      case 'maintenance':
        notification.warning({
          message: 'Maintenance Due',
          description: 'Tool #3 has reached 80% of its recommended life cycle. Schedule replacement soon.',
          icon: <Clock className="w-5 h-5 text-amber-500" />,
          duration: 8,
        });
        break;
      case 'update':
        notification.info({
          message: 'Software Update Available',
          description: 'Version 2.1.0 is available with improved safety features and bug fixes.',
          icon: <Download className="w-5 h-5 text-blue-500" />,
          btn: (
            <Button size="sm" variant="outline" className="mt-2">
              Download
            </Button>
          ),
          duration: 10,
        });
        break;
    }
  };

  const showProgressNotification = () => {
    const key = 'progress-notification';
    notification.info({
      key,
      message: 'Uploading G-Code File',
      description: 'Transferring part_housing.gcode to machine...',
      icon: <Upload className="w-5 h-5 text-blue-500" />,
      duration: 0,
    });

    // Simulate progress updates
    setTimeout(() => {
      notification.info({
        key,
        message: 'Processing G-Code',
        description: 'Validating toolpaths and calculating estimated runtime...',
        icon: <Activity className="w-5 h-5 text-blue-500" />,
        duration: 0,
      });
    }, 2000);

    setTimeout(() => {
      notification.success({
        key,
        message: 'File Ready',
        description: 'G-Code file processed successfully. Ready to start machining.',
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        duration: 4,
      });
    }, 4000);
  };

  // Transfer list data and handlers
  const transferData = [
    { key: 'item-1', title: 'Work Area Limit X', description: 'Maximum X-axis travel distance' },
    { key: 'item-2', title: 'Spindle Speed Control', description: 'RPM monitoring and adjustment' },
    { key: 'item-3', title: 'Tool Height Sensor', description: 'Automatic tool length measurement' },
    { key: 'item-4', title: 'Emergency Stop Circuit', description: 'Safety shutdown system' },
    { key: 'item-5', title: 'Coolant System', description: 'Flood and mist coolant control' },
    { key: 'item-6', title: 'Part Probing', description: 'Workpiece surface detection' },
    { key: 'item-7', title: 'Feed Rate Override', description: 'Real-time speed adjustment' },
    { key: 'item-8', title: 'G-Code Validation', description: 'Syntax and safety checking' },
  ];

  const handleTransferChange = (newTargetKeys: string[]) => {
    setTransferTargetKeys(newTargetKeys);
  };

  const handleTransferSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    setTransferSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  // File upload handlers
  const handleUploadChange = (info: any) => {
    let newFileList = [...info.fileList];
    
    // Limit to 5 files
    newFileList = newFileList.slice(-5);
    
    // Update file status
    newFileList = newFileList.map(file => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
    
    setFileList(newFileList);
  };

  const handleUploadRemove = (file: any) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
  };

  const beforeUpload = (file: any) => {
    const isValidType = file.type === 'text/plain' || file.name.endsWith('.gcode') || file.name.endsWith('.nc') || file.name.endsWith('.txt');
    if (!isValidType) {
      notification.error({
        message: 'Invalid File Type',
        description: 'Please upload G-Code files (.gcode, .nc, .txt)',
      });
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      notification.error({
        message: 'File Too Large',
        description: 'File must be smaller than 10MB',
      });
    }
    return isValidType && isLt10M;
  };

  // Tour configurations
  const basicTourSteps = [
    {
      title: 'Welcome to CNC Controls',
      description: 'This is your CNC machine control interface. Let\'s take a quick tour of the basic components.',
      target: null,
    },
    {
      title: 'Button Components',
      description: 'These are the styled button variants available throughout the application. Each has a specific purpose and visual style.',
      target: () => basicButtonsRef.current,
    },
    {
      title: 'Status Indicators',
      description: 'Status badges show the current state of your machine. Click on them to change the status and see how they affect other components.',
      target: () => statusBadgesRef.current,
    },
    {
      title: 'Form Controls',
      description: 'Professional forms with validation, number inputs, and various field types for configuring your CNC machine.',
      target: () => formsRef.current,
    },
    {
      title: 'Interactive Help',
      description: 'Popovers provide contextual information and quick actions without cluttering the interface.',
      target: () => popoverRef.current,
    },
    {
      title: 'Tooltips',
      description: 'Quick hover tooltips provide instant contextual help and information throughout the interface.',
      target: () => tooltipRef.current,
    },
    {
      title: 'Progress Indicators',
      description: 'Visual progress bars show the status of operations, jobs, and system metrics in real-time.',
      target: () => progressRef.current,
    },
    {
      title: 'Notifications',
      description: 'System notifications keep users informed of important events, status changes, and required actions.',
      target: () => notificationRef.current,
    },
  ];

  const cncTourSteps = [
    {
      title: 'CNC Machine Operation',
      description: 'Welcome to the CNC-specific controls. These components are designed for safe and precise machine operation.',
      target: null,
    },
    {
      title: 'Jog Controls',
      description: 'Use these controls to manually position your machine. The directional buttons move the machine axes, and you can set speed and distance.',
      target: () => jogControlsRef.current,
    },
    {
      title: 'Position Display',
      description: 'This shows your current machine position in real-time. The coordinates update as you jog the machine.',
      target: () => coordinateDisplayRef.current,
    },
    {
      title: 'Emergency Stop',
      description: 'CRITICAL: This is your emergency stop control. Always ensure you know where this is before operating the machine.',
      target: () => emergencyStopRef.current,
    },
  ];

  const advancedTourSteps = [
    {
      title: 'Advanced Features',
      description: 'Explore advanced functionality including forms, popovers, and interactive components.',
      target: null,
    },
    {
      title: 'Machine Configuration',
      description: 'Complete forms for setting up your CNC machine parameters, work area, and safety settings.',
      target: () => formsRef.current,
    },
    {
      title: 'Status Information',
      description: 'Hover over status badges to see detailed machine information, or click for interactive controls.',
      target: () => statusBadgesRef.current,
    },
    {
      title: 'Quick Actions',
      description: 'Popovers provide quick access to common operations and detailed information without navigating away.',
      target: () => popoverRef.current,
    },
    {
      title: 'Contextual Help',
      description: 'Tooltips offer immediate assistance and explanations for all CNC controls and features.',
      target: () => tooltipRef.current,
    },
    {
      title: 'Operation Progress',
      description: 'Progress indicators track job completion, machine status, and system performance metrics.',
      target: () => progressRef.current,
    },
    {
      title: 'System Alerts',
      description: 'Critical notifications for machine status, safety alerts, maintenance reminders, and job updates.',
      target: () => notificationRef.current,
    },
    {
      title: 'Feature Selection',
      description: 'Use transfer lists to configure which CNC features and sensors are active for your machine setup.',
      target: () => transferRef.current,
    },
    {
      title: 'File Management',
      description: 'Upload G-Code files, CAM programs, and machine configurations with drag-and-drop support.',
      target: () => uploadRef.current,
    },
  ];

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
              {/* Basic Components */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
                  Basic Components
                </h2>
                <Grid cols={2} gap="lg">
                  <AnimatedCard>
                    <Card className="bg-card border-border" ref={basicButtonsRef}>
                      <CardHeader>
                        <CardTitle className="text-card-foreground">Buttons</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex gap-3 flex-wrap">
                            <Button variant="default">Default</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="outline">Outline</Button>
                          </div>
                          <div className="flex gap-3 flex-wrap">
                            <Button variant="success">Success</Button>
                            <Button variant="warning">Warning</Button>
                            <Button variant="destructive">Destructive</Button>
                          </div>
                          <div className="flex gap-3 flex-wrap">
                            <Button variant="cnc">CNC</Button>
                            <Button variant="emergency">Emergency</Button>
                            <Button variant="ghost">Ghost</Button>
                          </div>
                          <div className="flex gap-3 items-center">
                            <Button size="sm">Small</Button>
                            <Button size="default">Default</Button>
                            <Button size="lg">Large</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>

                  <AnimatedCard delay={0.1}>
                    <Card className="bg-card border-border" ref={statusBadgesRef}>
                      <CardHeader>
                        <CardTitle className="text-card-foreground">Badges & Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Filled Badges</h4>
                          <div className="flex gap-2 flex-wrap">
                            <Badge>Default</Badge>
                            <Badge variant="secondary">Secondary</Badge>
                            <Badge variant="success">Success</Badge>
                            <Badge variant="warning">Warning</Badge>
                            <Badge variant="danger">Danger</Badge>
                            <Badge variant="info">Info</Badge>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Outline Badges</h4>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline-default">Default</Badge>
                            <Badge variant="outline-secondary">Secondary</Badge>
                            <Badge variant="outline-success">Success</Badge>
                            <Badge variant="outline-warning">Warning</Badge>
                            <Badge variant="outline-danger">Danger</Badge>
                            <Badge variant="outline-info">Info</Badge>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Status Badges</h4>
                          <div className="space-y-2">
                            <StatusBadge status="connected" />
                            <StatusBadge status="running" />
                            <StatusBadge status="idle" />
                            <StatusBadge status="error" />
                            <StatusBadge status="warning" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                </Grid>
              </section>

              {/* Number Inputs */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
                  Number Inputs
                </h2>
                <Grid cols={2} gap="lg">
                  <AnimatedCard>
                    <Card>
                      <CardHeader>
                        <CardTitle>Standard Number Inputs</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Basic InputNumber</h4>
                          <InputNumber
                            min={0}
                            max={100}
                            defaultValue={50}
                            className="w-full"
                            placeholder="Enter a number"
                          />
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">With Step Controls</h4>
                          <InputNumber
                            min={0}
                            max={1000}
                            step={10}
                            defaultValue={100}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Currency Format</h4>
                          <InputNumber
                            min={0}
                            max={100000}
                            defaultValue={1234.56}
                            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Percentage</h4>
                          <InputNumber
                            min={0}
                            max={100}
                            defaultValue={25}
                            formatter={(value) => `${value}%`}
                            parser={(value) => value!.replace('%', '')}
                            className="w-full"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>

                  <AnimatedCard delay={0.1}>
                    <Card>
                      <CardHeader>
                        <CardTitle>CNC-Specific Inputs</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Coordinate Input</h4>
                          <div className="flex gap-2">
                            <div>
                              <label className="text-xs text-muted-foreground">X</label>
                              <CoordinateInput
                                defaultValue={125.750}
                                min={-1000}
                                max={1000}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Y</label>
                              <CoordinateInput
                                defaultValue={89.250}
                                min={-1000}
                                max={1000}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Z</label>
                              <CoordinateInput
                                defaultValue={15.000}
                                min={-1000}
                                max={1000}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Precision Input (3 decimals)</h4>
                          <PrecisionInput
                            defaultValue={3.142}
                            min={0}
                            max={10}
                            precision={3}
                          />
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">High Precision (5 decimals)</h4>
                          <PrecisionInput
                            defaultValue={0.12345}
                            min={0}
                            max={1}
                            precision={5}
                          />
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Feed Rate (mm/min)</h4>
                          <InputNumber
                            min={1}
                            max={10000}
                            step={100}
                            defaultValue={2500}
                            formatter={(value) => `${value} mm/min`}
                            parser={(value) => value!.replace(' mm/min', '')}
                            className="w-full"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                </Grid>
              </section>

              {/* Forms */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
                  Forms & Input Controls
                </h2>
                <Card ref={formsRef}>
                  <CardHeader>
                    <CardTitle>CNC Machine Configuration Form</CardTitle>
                    <p className="text-sm text-muted-foreground">Complete form example with various input types</p>
                  </CardHeader>
                  <CardContent>
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleFormSubmit}
                      initialValues={{
                        machineName: 'CNC-001',
                        machineType: 'mill',
                        workAreaX: 300,
                        workAreaY: 200,
                        workAreaZ: 100,
                        maxSpeed: 5000,
                        acceleration: 1000,
                        units: 'metric',
                        autoHome: true,
                        safetyEnabled: true,
                        emergencyStopType: 'hardware',
                        operatingHours: dayjs('08:00', 'HH:mm'),
                        maintenanceDate: undefined,
                        priority: 'high',
                        notes: 'High precision milling machine for prototype development',
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
                          
                          <Form.Item
                            label="Machine Name"
                            name="machineName"
                            rules={[{ required: true, message: 'Please enter machine name' }]}
                          >
                            <Input placeholder="Enter machine name" />
                          </Form.Item>

                          <Form.Item
                            label="Machine Type"
                            name="machineType"
                            rules={[{ required: true, message: 'Please select machine type' }]}
                          >
                            <Select placeholder="Select machine type">
                              <Select.Option value="mill">CNC Mill</Select.Option>
                              <Select.Option value="lathe">CNC Lathe</Select.Option>
                              <Select.Option value="router">CNC Router</Select.Option>
                              <Select.Option value="plasma">Plasma Cutter</Select.Option>
                              <Select.Option value="laser">Laser Cutter</Select.Option>
                            </Select>
                          </Form.Item>

                          <Form.Item
                            label="Units"
                            name="units"
                          >
                            <Radio.Group>
                              <Radio value="metric">Metric (mm)</Radio>
                              <Radio value="imperial">Imperial (in)</Radio>
                            </Radio.Group>
                          </Form.Item>

                          <Form.Item
                            label="Priority Level"
                            name="priority"
                          >
                            <Select placeholder="Select priority">
                              <Select.Option value="low">Low Priority</Select.Option>
                              <Select.Option value="medium">Medium Priority</Select.Option>
                              <Select.Option value="high">High Priority</Select.Option>
                              <Select.Option value="critical">Critical</Select.Option>
                            </Select>
                          </Form.Item>
                        </div>

                        {/* Technical Specifications */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-foreground mb-4">Technical Specifications</h3>
                          
                          <div className="grid grid-cols-3 gap-3">
                            <Form.Item
                              label="Work Area X"
                              name="workAreaX"
                              rules={[{ required: true, message: 'Required' }]}
                            >
                              <InputNumber
                                min={1}
                                max={2000}
                                className="w-full"
                                formatter={(value) => `${value} mm`}
                                parser={(value) => value!.replace(' mm', '')}
                              />
                            </Form.Item>

                            <Form.Item
                              label="Work Area Y"
                              name="workAreaY"
                              rules={[{ required: true, message: 'Required' }]}
                            >
                              <InputNumber
                                min={1}
                                max={2000}
                                className="w-full"
                                formatter={(value) => `${value} mm`}
                                parser={(value) => value!.replace(' mm', '')}
                              />
                            </Form.Item>

                            <Form.Item
                              label="Work Area Z"
                              name="workAreaZ"
                              rules={[{ required: true, message: 'Required' }]}
                            >
                              <InputNumber
                                min={1}
                                max={500}
                                className="w-full"
                                formatter={(value) => `${value} mm`}
                                parser={(value) => value!.replace(' mm', '')}
                              />
                            </Form.Item>
                          </div>

                          <Form.Item
                            label="Maximum Speed"
                            name="maxSpeed"
                            rules={[{ required: true, message: 'Please enter maximum speed' }]}
                          >
                            <InputNumber
                              min={100}
                              max={20000}
                              step={100}
                              className="w-full"
                              formatter={(value) => `${value} mm/min`}
                              parser={(value) => value!.replace(' mm/min', '')}
                            />
                          </Form.Item>

                          <Form.Item
                            label="Acceleration"
                            name="acceleration"
                            rules={[{ required: true, message: 'Please enter acceleration' }]}
                          >
                            <InputNumber
                              min={50}
                              max={5000}
                              step={50}
                              className="w-full"
                              formatter={(value) => `${value} mm/s²`}
                              parser={(value) => value!.replace(' mm/s²', '')}
                            />
                          </Form.Item>

                          <Form.Item
                            label="Operating Hours"
                            name="operatingHours"
                          >
                            <TimePicker 
                              format="HH:mm" 
                              className="w-full"
                              placeholder="Select operating hours"
                            />
                          </Form.Item>
                        </div>
                      </div>

                      {/* Safety & Configuration */}
                      <div className="border-t border-border pt-6 mt-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Safety & Configuration</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <Form.Item
                              name="autoHome"
                              valuePropName="checked"
                            >
                              <Checkbox>Auto-home on startup</Checkbox>
                            </Form.Item>

                            <Form.Item
                              name="safetyEnabled"
                              valuePropName="checked"
                            >
                              <Checkbox>Enable safety interlocks</Checkbox>
                            </Form.Item>

                            <Form.Item
                              label="Emergency Stop Type"
                              name="emergencyStopType"
                            >
                              <Radio.Group>
                                <Radio value="hardware">Hardware E-Stop</Radio>
                                <Radio value="software">Software E-Stop</Radio>
                                <Radio value="both">Both</Radio>
                              </Radio.Group>
                            </Form.Item>
                          </div>

                          <div className="space-y-4">
                            <Form.Item
                              label="Maintenance Date"
                              name="maintenanceDate"
                            >
                              <DatePicker 
                                className="w-full"
                                placeholder="Select maintenance date"
                              />
                            </Form.Item>

                            <Form.Item
                              label="Notes"
                              name="notes"
                            >
                              <AntInput.TextArea
                                rows={4}
                                placeholder="Additional notes or comments..."
                              />
                            </Form.Item>
                          </div>
                        </div>
                      </div>

                      {/* Feature Selection & File Management */}
                      <div className="border-t border-border pt-6 mt-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Advanced Configuration</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Feature Selection */}
                          <div className="space-y-4" ref={transferRef}>
                            <h4 className="text-md font-medium text-foreground mb-3">Active Features & Sensors</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Configure which CNC features and sensors are active for your machine setup. 
                              Move items between Available and Active lists.
                            </p>
                            
                            <Transfer
                              dataSource={transferData}
                              targetKeys={transferTargetKeys}
                              selectedKeys={transferSelectedKeys}
                              onChange={handleTransferChange}
                              onSelectChange={handleTransferSelectChange}
                              render={item => (
                                <div className="flex flex-col">
                                  <span className="font-medium text-foreground">{item.title}</span>
                                  <span className="text-xs text-muted-foreground">{item.description}</span>
                                </div>
                              )}
                              titles={['Available Features', 'Active Features']}
                              showSearch
                              searchPlaceholder="Search features..."
                              listStyle={{
                                width: 280,
                                height: 320,
                              }}
                            />
                          </div>

                          {/* File Upload */}
                          <div className="space-y-4" ref={uploadRef}>
                            <h4 className="text-md font-medium text-foreground mb-3">G-Code File Upload</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Upload G-Code files, CAM programs, and configuration files. 
                              Supports drag-and-drop and validates file types.
                            </p>

                            <Upload.Dragger
                              name="files"
                              multiple
                              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                              onChange={handleUploadChange}
                              onRemove={handleUploadRemove}
                              beforeUpload={beforeUpload}
                              fileList={fileList}
                              accept=".gcode,.nc,.txt"
                              className="upload-dragger"
                            >
                              <p className="ant-upload-drag-icon mb-4">
                                <UploadIcon className="w-12 h-12 text-primary mx-auto" />
                              </p>
                              <p className="ant-upload-text text-foreground font-medium mb-2">
                                Click or drag G-Code files to this area to upload
                              </p>
                              <p className="ant-upload-hint text-muted-foreground">
                                Support for .gcode, .nc, and .txt files. Maximum file size: 10MB. 
                                Multiple files supported (up to 5 files).
                              </p>
                            </Upload.Dragger>

                            {fileList.length > 0 && (
                              <div className="mt-4">
                                <h5 className="text-sm font-medium text-foreground mb-2">
                                  Uploaded Files ({fileList.length}/5):
                                </h5>
                                <div className="space-y-2">
                                  {fileList.map((file, index) => (
                                    <div 
                                      key={index}
                                      className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <FileText className="w-5 h-5 text-primary" />
                                        <div>
                                          <p className="text-sm font-medium text-foreground">{file.name}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {file.status === 'done' && (
                                          <Check className="w-4 h-4 text-green-500" />
                                        )}
                                        {file.status === 'error' && (
                                          <X className="w-4 h-4 text-red-500" />
                                        )}
                                        <AntButton
                                          type="text"
                                          size="small"
                                          icon={<X className="w-4 h-4" />}
                                          onClick={() => handleUploadRemove(file)}
                                          className="text-muted-foreground hover:text-destructive"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex gap-3 pt-6 border-t border-border">
                        <Button type="submit" size="lg">
                          Save Configuration
                        </Button>
                        <Button 
                          type="button" 
                          size="lg"
                          onClick={() => form.resetFields()}
                        >
                          Reset Form
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg"
                          onClick={() => console.log('Current values:', form.getFieldsValue())}
                        >
                          Preview Values
                        </Button>
                      </div>
                    </Form>
                  </CardContent>
                </Card>
              </section>

              {/* Popovers */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
                  Popovers & Tooltips
                </h2>
                <div className="space-y-6">
                  {/* Basic Popovers */}
                  <Card ref={popoverRef}>
                    <CardHeader>
                      <CardTitle>Basic Popovers</CardTitle>
                      <p className="text-sm text-muted-foreground">Simple information popovers with different triggers</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4">
                        <Popover
                          content={
                            <div className="p-2 max-w-xs">
                              <p className="text-sm text-foreground">
                                This is a basic popover with some helpful information about this feature.
                              </p>
                            </div>
                          }
                          title="Information"
                          trigger="hover"
                        >
                          <Button variant="outline" className="flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Hover for Info
                          </Button>
                        </Popover>

                        <Popover
                          content={
                            <div className="p-2 max-w-xs">
                              <p className="text-sm text-foreground">
                                Click outside or press escape to close this popover.
                              </p>
                            </div>
                          }
                          title="Click Popover"
                          trigger="click"
                        >
                          <Button variant="secondary" className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Click for Options
                          </Button>
                        </Popover>

                        <Popover
                          content={
                            <div className="p-2 max-w-xs">
                              <p className="text-sm text-foreground">
                                Focus on this input to see the popover appear with helpful context.
                              </p>
                            </div>
                          }
                          title="Input Help"
                          trigger="focus"
                        >
                          <Input placeholder="Focus me for help" className="w-48" />
                        </Popover>
                      </div>
                    </CardContent>
                  </Card>

                  {/* CNC-Specific Popovers */}
                  <Card>
                    <CardHeader>
                      <CardTitle>CNC Machine Status Popovers</CardTitle>
                      <p className="text-sm text-muted-foreground">Contextual information for machine operations</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-foreground">Machine Status</h4>
                          <div className="flex flex-wrap gap-3">
                            <Popover
                              content={
                                <div className="p-3 max-w-sm">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="font-medium text-foreground">Machine Connected</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    CNC-001 is online and ready for operation.
                                  </p>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Connection:</span>
                                      <span className="text-green-400">USB</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Baud Rate:</span>
                                      <span className="text-foreground">115200</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Uptime:</span>
                                      <span className="text-foreground">2h 34m</span>
                                    </div>
                                  </div>
                                </div>
                              }
                              trigger="hover"
                              placement="top"
                            >
                              <StatusBadge status="connected" className="cursor-pointer" />
                            </Popover>

                            <Popover
                              content={
                                <div className="p-3 max-w-sm">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Activity className="w-4 h-4 text-blue-400" />
                                    <span className="font-medium text-foreground">Job Running</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    Currently executing G-code program.
                                  </p>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Progress:</span>
                                      <span className="text-blue-400">67%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Time Remaining:</span>
                                      <span className="text-foreground">12m 30s</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Current Speed:</span>
                                      <span className="text-foreground">2,500 mm/min</span>
                                    </div>
                                  </div>
                                </div>
                              }
                              trigger="hover"
                              placement="top"
                            >
                              <StatusBadge status="running" className="cursor-pointer" />
                            </Popover>

                            <Popover
                              content={
                                <div className="p-3 max-w-sm">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                    <span className="font-medium text-foreground">Emergency Stop Active</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    Machine stopped due to safety protocol activation.
                                  </p>
                                  <div className="space-y-2">
                                    <Button size="sm" variant="destructive" className="w-full">
                                      Reset E-Stop
                                    </Button>
                                    <Button size="sm" variant="outline" className="w-full">
                                      View Error Log
                                    </Button>
                                  </div>
                                </div>
                              }
                              trigger="click"
                              placement="top"
                            >
                              <StatusBadge status="error" className="cursor-pointer" />
                            </Popover>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-foreground">Position Information</h4>
                          <div className="flex flex-wrap gap-3">
                            <Popover
                              content={
                                <div className="p-3 max-w-sm">
                                  <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="font-medium text-foreground">Current Position</span>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                                      <div className="text-center">
                                        <div className="text-muted-foreground">X</div>
                                        <div className="text-foreground">125.750</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-muted-foreground">Y</div>
                                        <div className="text-foreground">89.250</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-muted-foreground">Z</div>
                                        <div className="text-foreground">15.000</div>
                                      </div>
                                    </div>
                                    <Divider className="my-2" />
                                    <div className="space-y-1 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Distance from Home:</span>
                                        <span className="text-foreground">152.3 mm</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Last Movement:</span>
                                        <span className="text-foreground">2.3s ago</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              }
                              trigger="hover"
                              placement="bottom"
                            >
                              <Button variant="outline" className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                X: 125.750
                              </Button>
                            </Popover>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Advanced Popovers */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Advanced Popover Examples</CardTitle>
                      <p className="text-sm text-muted-foreground">Complex popovers with actions and detailed content</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4">
                        <Popover
                          content={
                            <div className="p-4 max-w-sm">
                              <div className="flex items-center gap-2 mb-3">
                                <Tool className="w-5 h-5 text-primary" />
                                <span className="font-semibold text-foreground">Tool Information</span>
                              </div>
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">Tool Number:</span>
                                    <div className="font-mono text-foreground">#5</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Diameter:</span>
                                    <div className="font-mono text-foreground">6.35 mm</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Length:</span>
                                    <div className="font-mono text-foreground">45.2 mm</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Material:</span>
                                    <div className="text-foreground">Carbide</div>
                                  </div>
                                </div>
                                <Divider className="my-2" />
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="flex-1">
                                    Edit Tool
                                  </Button>
                                  <Button size="sm" variant="primary" className="flex-1">
                                    Select Tool
                                  </Button>
                                </div>
                              </div>
                            </div>
                          }
                          trigger="click"
                          placement="bottomLeft"
                        >
                          <Button variant="cnc" className="flex items-center gap-2">
                            <Tool className="w-4 h-4" />
                            Tool #5
                          </Button>
                        </Popover>

                        <Popover
                          content={
                            <div className="p-4 max-w-xs">
                              <div className="flex items-center gap-2 mb-3">
                                <Shield className="w-5 h-5 text-amber-400" />
                                <span className="font-semibold text-foreground">Safety Checklist</span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                  <span className="text-foreground">Emergency stop tested</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                  <span className="text-foreground">Work area clear</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                  <span className="text-foreground">Tool properly secured</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                                  <span className="text-foreground">Safety glasses required</span>
                                </div>
                              </div>
                              <Divider className="my-3" />
                              <Button size="sm" variant="success" className="w-full">
                                Mark as Complete
                              </Button>
                            </div>
                          }
                          trigger="click"
                          placement="bottomRight"
                        >
                          <Button variant="warning" className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Safety Check
                          </Button>
                        </Popover>

                        <Popover
                          content={
                            <div className="p-4 max-w-sm">
                              <div className="flex items-center gap-2 mb-3">
                                <Zap className="w-5 h-5 text-blue-400" />
                                <span className="font-semibold text-foreground">Quick Actions</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <Button size="sm" variant="outline" className="text-xs">
                                  Home All
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs">
                                  Zero XY
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs">
                                  Probe Z
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs">
                                  Tool Change
                                </Button>
                              </div>
                              <Divider className="my-3" />
                              <div className="text-xs text-muted-foreground">
                                Press Ctrl+Click for advanced options
                              </div>
                            </div>
                          }
                          trigger="click"
                          placement="top"
                        >
                          <Button variant="ghost" className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Quick Actions
                          </Button>
                        </Popover>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Tooltips */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
                  Tooltips
                </h2>
                <div className="space-y-6">
                  {/* Basic Tooltips */}
                  <Card ref={tooltipRef}>
                    <CardHeader>
                      <CardTitle>Basic Tooltips</CardTitle>
                      <p className="text-sm text-muted-foreground">Simple hover tooltips with different placements and styles</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Placement Examples */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Tooltip Placements</h4>
                          <div className="grid grid-cols-3 gap-4 max-w-md">
                            <Tooltip title="Top Left" placement="topLeft">
                              <Button variant="outline" className="w-full">TL</Button>
                            </Tooltip>
                            <Tooltip title="Top Center" placement="top">
                              <Button variant="outline" className="w-full">Top</Button>
                            </Tooltip>
                            <Tooltip title="Top Right" placement="topRight">
                              <Button variant="outline" className="w-full">TR</Button>
                            </Tooltip>
                            
                            <Tooltip title="Left Top" placement="leftTop">
                              <Button variant="outline" className="w-full">LT</Button>
                            </Tooltip>
                            <Tooltip title="Click me for more info" placement="top">
                              <Button variant="default" className="w-full">Center</Button>
                            </Tooltip>
                            <Tooltip title="Right Top" placement="rightTop">
                              <Button variant="outline" className="w-full">RT</Button>
                            </Tooltip>
                            
                            <Tooltip title="Bottom Left" placement="bottomLeft">
                              <Button variant="outline" className="w-full">BL</Button>
                            </Tooltip>
                            <Tooltip title="Bottom Center" placement="bottom">
                              <Button variant="outline" className="w-full">Bottom</Button>
                            </Tooltip>
                            <Tooltip title="Bottom Right" placement="bottomRight">
                              <Button variant="outline" className="w-full">BR</Button>
                            </Tooltip>
                          </div>
                        </div>

                        {/* Trigger Examples */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Trigger Types</h4>
                          <div className="flex gap-4 flex-wrap">
                            <Tooltip title="Hover to see this tooltip" trigger="hover">
                              <Button variant="secondary">Hover Trigger</Button>
                            </Tooltip>
                            <Tooltip title="Click to see this tooltip" trigger="click">
                              <Button variant="cnc">Click Trigger</Button>
                            </Tooltip>
                            <Tooltip title="Focus on this element" trigger="focus">
                              <Input placeholder="Focus trigger" className="w-48" />
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* CNC-Specific Tooltips */}
                  <Card>
                    <CardHeader>
                      <CardTitle>CNC Control Tooltips</CardTitle>
                      <p className="text-sm text-muted-foreground">Contextual tooltips for CNC machine operations</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Safety Tooltips */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Safety Controls</h4>
                          <div className="flex gap-3 flex-wrap">
                            <Tooltip 
                              title={
                                <div className="max-w-xs">
                                  <div className="font-semibold text-red-300 mb-1">Emergency Stop</div>
                                  <div className="text-xs text-red-200">
                                    Immediately stops all machine movement. Use in emergency situations only.
                                    Press to activate, twist to release.
                                  </div>
                                </div>
                              }
                              color="red"
                            >
                              <Button variant="emergency" className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                E-Stop
                              </Button>
                            </Tooltip>

                            <Tooltip 
                              title={
                                <div className="max-w-xs">
                                  <div className="font-semibold text-amber-300 mb-1">Home Position</div>
                                  <div className="text-xs text-amber-200">
                                    Move all axes to their home position. Ensure work area is clear before homing.
                                  </div>
                                </div>
                              }
                              color="orange"
                            >
                              <Button variant="warning" className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Home All
                              </Button>
                            </Tooltip>

                            <Tooltip 
                              title={
                                <div className="max-w-xs">
                                  <div className="font-semibold text-green-300 mb-1">Machine Status</div>
                                  <div className="text-xs text-green-200">
                                    Current machine state: Connected and ready for operation.
                                  </div>
                                </div>
                              }
                              color="green"
                            >
                              <StatusBadge status="connected" />
                            </Tooltip>
                          </div>
                        </div>

                        {/* Position Tooltips */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Position Controls</h4>
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3 max-w-md">
                              <Tooltip title="Current X position: 125.750mm" color="blue">
                                <div className="p-3 bg-card border border-border rounded text-center font-mono">
                                  <div className="text-xs text-muted-foreground">X</div>
                                  <div className="text-sm font-semibold">125.750</div>
                                </div>
                              </Tooltip>
                              <Tooltip title="Current Y position: 89.250mm" color="blue">
                                <div className="p-3 bg-card border border-border rounded text-center font-mono">
                                  <div className="text-xs text-muted-foreground">Y</div>
                                  <div className="text-sm font-semibold">89.250</div>
                                </div>
                              </Tooltip>
                              <Tooltip title="Current Z position: 15.000mm" color="blue">
                                <div className="p-3 bg-card border border-border rounded text-center font-mono">
                                  <div className="text-xs text-muted-foreground">Z</div>
                                  <div className="text-sm font-semibold">15.000</div>
                                </div>
                              </Tooltip>
                            </div>
                          </div>
                        </div>

                        {/* Tool Information */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Tool Information</h4>
                          <div className="flex gap-3 flex-wrap">
                            <Tooltip 
                              title={
                                <div className="max-w-sm">
                                  <div className="font-semibold text-primary-light mb-2">Tool #5 - End Mill</div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-muted-foreground">Diameter:</span>
                                      <div className="font-mono">6.35mm</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Length:</span>
                                      <div className="font-mono">45.2mm</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Material:</span>
                                      <div>Carbide</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">RPM Max:</span>
                                      <div className="font-mono">15,000</div>
                                    </div>
                                  </div>
                                </div>
                              }
                              color="purple"
                            >
                              <Button variant="cnc" className="flex items-center gap-2">
                                <Tool className="w-4 h-4" />
                                Tool #5
                              </Button>
                            </Tooltip>

                            <Tooltip 
                              title="Feed rate: 2,500 mm/min - Current cutting speed"
                              color="blue"
                            >
                              <Badge variant="info" className="cursor-help">
                                2,500 mm/min
                              </Badge>
                            </Tooltip>

                            <Tooltip 
                              title="Spindle RPM: 12,000 - Current rotation speed"
                              color="blue" 
                            >
                              <Badge variant="info" className="cursor-help">
                                12,000 RPM
                              </Badge>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Advanced Tooltip Features */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Advanced Tooltip Features</CardTitle>
                      <p className="text-sm text-muted-foreground">Complex tooltips with custom styling and interactive content</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Colored Tooltips */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Colored Tooltips</h4>
                          <div className="flex gap-3 flex-wrap">
                            <Tooltip title="Default color tooltip" color="rgba(0,0,0,0.85)">
                              <Button variant="outline">Default</Button>
                            </Tooltip>
                            <Tooltip title="Success operation completed" color="green">
                              <Button variant="success">Success</Button>
                            </Tooltip>
                            <Tooltip title="Warning: Check settings" color="orange">
                              <Button variant="warning">Warning</Button>
                            </Tooltip>
                            <Tooltip title="Error: Operation failed" color="red">
                              <Button variant="destructive">Error</Button>
                            </Tooltip>
                            <Tooltip title="Information available" color="blue">
                              <Button variant="cnc">Info</Button>
                            </Tooltip>
                            <Tooltip title="Custom purple tooltip" color="purple">
                              <Button variant="secondary">Custom</Button>
                            </Tooltip>
                          </div>
                        </div>

                        {/* Rich Content Tooltips */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Rich Content</h4>
                          <div className="flex gap-3 flex-wrap">
                            <Tooltip 
                              title={
                                <div className="max-w-xs">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Activity className="w-4 h-4 text-blue-400" />
                                    <span className="font-semibold">Machine Status</span>
                                  </div>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span>Status:</span>
                                      <span className="text-green-400">Running</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Progress:</span>
                                      <span>67%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Time Left:</span>
                                      <span>12m 30s</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Temperature:</span>
                                      <span>45.5°C</span>
                                    </div>
                                  </div>
                                </div>
                              }
                            >
                              <div className="flex items-center gap-2 p-3 bg-card border border-border rounded cursor-help hover:border-primary transition-colors">
                                <Activity className="w-5 h-5 text-blue-400" />
                                <span className="text-sm">Machine Status</span>
                              </div>
                            </Tooltip>

                            <Tooltip 
                              title={
                                <div className="max-w-sm">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-amber-400" />
                                    <span className="font-semibold">Quick Actions</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground mb-2">
                                    Available keyboard shortcuts:
                                  </div>
                                  <div className="space-y-1 text-xs font-mono">
                                    <div>Ctrl+H - Home all axes</div>
                                    <div>Ctrl+Z - Zero current position</div>
                                    <div>Space - Emergency stop</div>
                                    <div>Ctrl+R - Reset machine</div>
                                  </div>
                                </div>
                              }
                              color="orange"
                            >
                              <div className="flex items-center gap-2 p-3 bg-card border border-border rounded cursor-help hover:border-primary transition-colors">
                                <Zap className="w-5 h-5 text-amber-400" />
                                <span className="text-sm">Shortcuts</span>
                              </div>
                            </Tooltip>
                          </div>
                        </div>

                        {/* Disabled State */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Disabled Elements</h4>
                          <div className="flex gap-3 flex-wrap">
                            <Tooltip title="This feature is currently disabled">
                              <Button variant="outline" disabled>
                                Disabled Button
                              </Button>
                            </Tooltip>
                            <Tooltip title="Input is disabled due to safety lock">
                              <Input placeholder="Disabled input" disabled className="w-48" />
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Progress Indicators */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
                  Progress Indicators
                </h2>
                <div className="space-y-6">
                  {/* Basic Progress */}
                  <Card ref={progressRef}>
                    <CardHeader>
                      <CardTitle>Basic Progress Bars</CardTitle>
                      <p className="text-sm text-muted-foreground">Standard progress indicators with different styles and colors</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Linear Progress */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Linear Progress</h4>
                          <div className="space-y-4">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Default Progress</div>
                              <Progress percent={67} />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Success Progress</div>
                              <Progress percent={100} status="success" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Error Progress</div>
                              <Progress percent={45} status="exception" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Active Progress</div>
                              <Progress percent={78} status="active" />
                            </div>
                          </div>
                        </div>

                        {/* Progress with Text */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Progress with Custom Text</h4>
                          <div className="space-y-4">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Percentage Display</div>
                              <Progress percent={67} showInfo={true} />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Custom Format</div>
                              <Progress 
                                percent={67} 
                                format={(percent) => `${percent}% Complete`}
                              />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Without Text</div>
                              <Progress percent={89} showInfo={false} />
                            </div>
                          </div>
                        </div>

                        {/* Colored Progress */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Colored Progress Bars</h4>
                          <div className="space-y-4">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Blue (Default)</div>
                              <Progress percent={67} strokeColor="#2563eb" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Green</div>
                              <Progress percent={45} strokeColor="#16a34a" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Purple (Primary)</div>
                              <Progress percent={89} strokeColor="var(--color-primary)" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Gradient</div>
                              <Progress 
                                percent={78} 
                                strokeColor={{
                                  from: '#a855f7',
                                  to: '#c084fc',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* CNC-Specific Progress */}
                  <Card>
                    <CardHeader>
                      <CardTitle>CNC Operation Progress</CardTitle>
                      <p className="text-sm text-muted-foreground">Progress indicators for CNC machine operations and jobs</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Job Progress */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Job Execution</h4>
                          <div className="space-y-4">
                            <div className="p-4 bg-card border border-border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-foreground">Current Job: part_bracket.gcode</span>
                                <span className="text-xs text-muted-foreground">67% Complete</span>
                              </div>
                              <Progress 
                                percent={67} 
                                strokeColor={{
                                  from: '#2563eb',
                                  to: '#1d4ed8',
                                }}
                                trailColor="rgba(255,255,255,0.1)"
                                size="default"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                <span>Elapsed: 24m 15s</span>
                                <span>Remaining: 12m 30s</span>
                              </div>
                            </div>

                            <div className="p-4 bg-card border border-border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-foreground">Homing Sequence</span>
                                <span className="text-xs text-green-400">Complete</span>
                              </div>
                              <Progress 
                                percent={100} 
                                status="success"
                                strokeColor="#16a34a"
                                trailColor="rgba(255,255,255,0.1)"
                                size="small"
                              />
                              <div className="text-xs text-muted-foreground mt-2">
                                All axes successfully homed
                              </div>
                            </div>

                            <div className="p-4 bg-card border border-border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-foreground">Tool Change Operation</span>
                                <span className="text-xs text-red-400">Failed</span>
                              </div>
                              <Progress 
                                percent={45} 
                                status="exception"
                                strokeColor="#dc2626"
                                trailColor="rgba(255,255,255,0.1)"
                                size="small"
                              />
                              <div className="text-xs text-muted-foreground mt-2">
                                Tool sensor timeout - Manual intervention required
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Machine Status Progress */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Machine Status</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Spindle Speed</span>
                                  <span className="text-foreground">12,000 / 15,000 RPM</span>
                                </div>
                                <Progress 
                                  percent={80} 
                                  showInfo={false}
                                  strokeColor="#a855f7"
                                  trailColor="rgba(255,255,255,0.1)"
                                  size="small"
                                />
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Feed Rate</span>
                                  <span className="text-foreground">2,500 / 4,000 mm/min</span>
                                </div>
                                <Progress 
                                  percent={62} 
                                  showInfo={false}
                                  strokeColor="#2563eb"
                                  trailColor="rgba(255,255,255,0.1)"
                                  size="small"
                                />
                              </div>

                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Memory Usage</span>
                                  <span className="text-foreground">456 / 512 MB</span>
                                </div>
                                <Progress 
                                  percent={89} 
                                  showInfo={false}
                                  strokeColor="#ea580c"
                                  trailColor="rgba(255,255,255,0.1)"
                                  size="small"
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Tool Life</span>
                                  <span className="text-foreground">67% Remaining</span>
                                </div>
                                <Progress 
                                  percent={67} 
                                  showInfo={false}
                                  strokeColor="#16a34a"
                                  trailColor="rgba(255,255,255,0.1)"
                                  size="small"
                                />
                              </div>

                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Coolant Level</span>
                                  <span className="text-foreground">Low</span>
                                </div>
                                <Progress 
                                  percent={23} 
                                  showInfo={false}
                                  strokeColor="#dc2626"
                                  trailColor="rgba(255,255,255,0.1)"
                                  size="small"
                                />
                              </div>

                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Temperature</span>
                                  <span className="text-foreground">45.5°C</span>
                                </div>
                                <Progress 
                                  percent={45} 
                                  showInfo={false}
                                  strokeColor="#facc15"
                                  trailColor="rgba(255,255,255,0.1)"
                                  size="small"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Circular Progress */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Circular Progress Indicators</CardTitle>
                      <p className="text-sm text-muted-foreground">Circular progress bars for space-efficient status display</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Basic Circular */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Basic Circular Progress</h4>
                          <div className="flex gap-6 flex-wrap">
                            <div className="text-center">
                              <Progress type="circle" percent={67} />
                              <div className="text-xs text-muted-foreground mt-2">Default</div>
                            </div>
                            <div className="text-center">
                              <Progress type="circle" percent={100} status="success" />
                              <div className="text-xs text-muted-foreground mt-2">Success</div>
                            </div>
                            <div className="text-center">
                              <Progress type="circle" percent={45} status="exception" />
                              <div className="text-xs text-muted-foreground mt-2">Error</div>
                            </div>
                            <div className="text-center">
                              <Progress 
                                type="circle" 
                                percent={89} 
                                strokeColor="var(--color-primary)"
                              />
                              <div className="text-xs text-muted-foreground mt-2">Custom Color</div>
                            </div>
                          </div>
                        </div>

                        {/* Small Circular */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Small Circular Progress</h4>
                          <div className="flex gap-4 flex-wrap">
                            <div className="text-center">
                              <Progress type="circle" percent={67} size={60} />
                              <div className="text-xs text-muted-foreground mt-1">Job 1</div>
                            </div>
                            <div className="text-center">
                              <Progress type="circle" percent={34} size={60} strokeColor="#16a34a" />
                              <div className="text-xs text-muted-foreground mt-1">Job 2</div>
                            </div>
                            <div className="text-center">
                              <Progress type="circle" percent={89} size={60} strokeColor="#ea580c" />
                              <div className="text-xs text-muted-foreground mt-1">Job 3</div>
                            </div>
                            <div className="text-center">
                              <Progress type="circle" percent={100} size={60} status="success" />
                              <div className="text-xs text-muted-foreground mt-1">Job 4</div>
                            </div>
                          </div>
                        </div>

                        {/* Custom Format Circular */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Custom Format Circular</h4>
                          <div className="flex gap-6 flex-wrap">
                            <div className="text-center">
                              <Progress 
                                type="circle" 
                                percent={67} 
                                format={(percent) => `${percent}%`}
                                strokeColor={{
                                  '0%': '#a855f7',
                                  '100%': '#c084fc',
                                }}
                              />
                              <div className="text-xs text-muted-foreground mt-2">Gradient</div>
                            </div>
                            <div className="text-center">
                              <Progress 
                                type="circle" 
                                percent={78} 
                                format={() => '78°C'}
                                strokeColor="#facc15"
                              />
                              <div className="text-xs text-muted-foreground mt-2">Temperature</div>
                            </div>
                            <div className="text-center">
                              <Progress 
                                type="circle" 
                                percent={45} 
                                format={() => '12m'}
                                strokeColor="#2563eb"
                              />
                              <div className="text-xs text-muted-foreground mt-2">Time Remaining</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dashboard Style Progress */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Dashboard Progress</CardTitle>
                      <p className="text-sm text-muted-foreground">Dashboard-style progress indicators with multiple metrics</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Overall Progress Card */}
                        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-blue-300">Overall Progress</h4>
                            <Badge variant="info">67%</Badge>
                          </div>
                          <Progress 
                            percent={67} 
                            strokeColor={{
                              from: '#2563eb',
                              to: '#1d4ed8',
                            }}
                            trailColor="rgba(37, 99, 235, 0.1)"
                            size="default"
                            showInfo={false}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>Started: 09:15 AM</span>
                            <span>ETA: 11:45 AM</span>
                          </div>
                        </div>

                        {/* Quality Card */}
                        <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-green-300">Quality Score</h4>
                            <Badge variant="success">Excellent</Badge>
                          </div>
                          <div className="flex items-center justify-center">
                            <Progress 
                              type="circle" 
                              percent={94} 
                              size={80}
                              strokeColor="#16a34a"
                              trailColor="rgba(22, 163, 74, 0.1)"
                              format={(percent) => `${percent}%`}
                            />
                          </div>
                          <div className="text-center text-xs text-muted-foreground mt-2">
                            Within tolerance
                          </div>
                        </div>

                        {/* Efficiency Card */}
                        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-purple-300">Efficiency</h4>
                            <Badge variant="outline-info">Good</Badge>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Speed</span>
                                <span className="text-purple-300">85%</span>
                              </div>
                              <Progress 
                                percent={85} 
                                showInfo={false}
                                strokeColor="var(--color-primary)"
                                trailColor="rgba(168, 85, 247, 0.1)"
                                size="small"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Accuracy</span>
                                <span className="text-purple-300">92%</span>
                              </div>
                              <Progress 
                                percent={92} 
                                showInfo={false}
                                strokeColor="var(--color-primary)"
                                trailColor="rgba(168, 85, 247, 0.1)"
                                size="small"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Multi-step Progress */}
                      <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                        <h4 className="text-sm font-semibold text-foreground mb-4">Multi-Step Process</h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <Progress type="circle" percent={100} size={40} status="success" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-foreground">1. Initialize Machine</div>
                              <div className="text-xs text-green-400">Complete</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <Progress type="circle" percent={100} size={40} status="success" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-foreground">2. Load Program</div>
                              <div className="text-xs text-green-400">Complete</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <Progress type="circle" percent={67} size={40} strokeColor="var(--color-primary)" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-foreground">3. Execute Machining</div>
                              <div className="text-xs text-blue-400">In Progress - 67%</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <Progress type="circle" percent={0} size={40} strokeColor="rgba(255,255,255,0.3)" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-muted-foreground">4. Quality Check</div>
                              <div className="text-xs text-muted-foreground">Pending</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <Progress type="circle" percent={0} size={40} strokeColor="rgba(255,255,255,0.3)" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-muted-foreground">5. Cleanup</div>
                              <div className="text-xs text-muted-foreground">Pending</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Notifications */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
                  Notifications
                </h2>
                <div className="space-y-6">
                  {/* Basic Notifications */}
                  <Card ref={notificationRef}>
                    <CardHeader>
                      <CardTitle>Basic Notifications</CardTitle>
                      <p className="text-sm text-muted-foreground">Standard notification types with different purposes and styles</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Standard Types */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Standard Notification Types</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Button 
                              variant="outline" 
                              onClick={() => showBasicNotification('info')}
                              className="flex items-center gap-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                            >
                              <Info className="w-4 h-4" />
                              Info
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => showBasicNotification('success')}
                              className="flex items-center gap-2 border-green-500/50 text-green-400 hover:bg-green-500/10"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Success
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => showBasicNotification('warning')}
                              className="flex items-center gap-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              Warning
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => showBasicNotification('error')}
                              className="flex items-center gap-2 border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              Error
                            </Button>
                          </div>
                        </div>

                        {/* Advanced Features */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Advanced Features</h4>
                          <div className="flex gap-3 flex-wrap">
                            <Button 
                              variant="cnc" 
                              onClick={showProgressNotification}
                              className="flex items-center gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              Progress Update
                            </Button>
                            <Button 
                              variant="secondary" 
                              onClick={() => notification.destroy()}
                              className="flex items-center gap-2"
                            >
                              <Power className="w-4 h-4" />
                              Clear All
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* CNC-Specific Notifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle>CNC Machine Notifications</CardTitle>
                      <p className="text-sm text-muted-foreground">Real-world notifications for CNC operations and machine status</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Operation Notifications */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Machine Operations</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <Button 
                              variant="outline" 
                              onClick={() => showCNCNotification('jobComplete')}
                              className="flex items-center gap-2 border-green-500/50 text-green-400 hover:bg-green-500/10"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Job Complete
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => showCNCNotification('toolChange')}
                              className="flex items-center gap-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                            >
                              <Tool className="w-4 h-4" />
                              Tool Change
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => showCNCNotification('emergency')}
                              className="flex items-center gap-2 border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              Emergency Stop
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => showCNCNotification('connection')}
                              className="flex items-center gap-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                            >
                              <Wifi className="w-4 h-4" />
                              Connection
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => showCNCNotification('maintenance')}
                              className="flex items-center gap-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                            >
                              <Clock className="w-4 h-4" />
                              Maintenance
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => showCNCNotification('update')}
                              className="flex items-center gap-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                            >
                              <Download className="w-4 h-4" />
                              Update
                            </Button>
                          </div>
                        </div>

                        {/* Notification Examples Preview */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Example Notification Content</h4>
                          <div className="space-y-3">
                            {/* Success Example */}
                            <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg">
                              <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                                <div className="flex-1">
                                  <div className="font-semibold text-green-300 mb-1">Job Completed</div>
                                  <div className="text-sm text-green-200">
                                    CNC job "part_bracket.gcode" has finished successfully. Quality check passed.
                                  </div>
                                  <div className="text-xs text-green-300 mt-2 opacity-75">
                                    Total time: 36m 42s • 15 parts completed
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Warning Example */}
                            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg">
                              <div className="flex items-start gap-3">
                                <Tool className="w-5 h-5 text-amber-400 mt-0.5" />
                                <div className="flex-1">
                                  <div className="font-semibold text-amber-300 mb-1">Tool Change Required</div>
                                  <div className="text-sm text-amber-200">
                                    Please insert Tool #5 (6.35mm End Mill) and press continue.
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    <Button size="sm" variant="warning" className="text-xs">
                                      Continue
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-xs">
                                      Cancel Job
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Error Example */}
                            <div className="p-4 bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                                <div className="flex-1">
                                  <div className="font-semibold text-red-300 mb-1">Emergency Stop Activated</div>
                                  <div className="text-sm text-red-200">
                                    Machine stopped due to safety protocol. Check machine status before resuming.
                                  </div>
                                  <div className="text-xs text-red-300 mt-2 opacity-75">
                                    Error Code: E001 • Position: X:125.5, Y:89.2, Z:15.0
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Info Example */}
                            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg">
                              <div className="flex items-start gap-3">
                                <Download className="w-5 h-5 text-blue-400 mt-0.5" />
                                <div className="flex-1">
                                  <div className="font-semibold text-blue-300 mb-1">Software Update Available</div>
                                  <div className="text-sm text-blue-200">
                                    Version 2.1.0 is available with improved safety features and bug fixes.
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    <Button size="sm" variant="cnc" className="text-xs">
                                      Download Now
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-xs">
                                      Remind Later
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notification Positions and Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Configuration</CardTitle>
                      <p className="text-sm text-muted-foreground">Notification positioning, timing, and behavior settings</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Position Examples */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Notification Positions</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                notification.config({ placement: 'topLeft' });
                                notification.info({ message: 'Top Left', description: 'Notification positioned at top left' });
                              }}
                              className="text-xs"
                            >
                              Top Left
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                notification.config({ placement: 'top' });
                                notification.info({ message: 'Top Center', description: 'Notification positioned at top center' });
                              }}
                              className="text-xs"
                            >
                              Top Center
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                notification.config({ placement: 'topRight' });
                                notification.info({ message: 'Top Right', description: 'Notification positioned at top right' });
                              }}
                              className="text-xs"
                            >
                              Top Right
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                notification.config({ placement: 'bottomLeft' });
                                notification.info({ message: 'Bottom Left', description: 'Notification positioned at bottom left' });
                              }}
                              className="text-xs"
                            >
                              Bottom Left
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                notification.config({ placement: 'bottom' });
                                notification.info({ message: 'Bottom Center', description: 'Notification positioned at bottom center' });
                              }}
                              className="text-xs"
                            >
                              Bottom Center
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                notification.config({ placement: 'bottomRight' });
                                notification.info({ message: 'Bottom Right', description: 'Notification positioned at bottom right' });
                              }}
                              className="text-xs"
                            >
                              Bottom Right
                            </Button>
                          </div>
                        </div>

                        {/* Duration Examples */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Duration and Behavior</h4>
                          <div className="flex gap-3 flex-wrap">
                            <Button 
                              variant="secondary" 
                              onClick={() => notification.info({
                                message: 'Quick Message',
                                description: 'This notification will auto-close in 2 seconds.',
                                duration: 2,
                              })}
                              className="text-xs"
                            >
                              2s Auto-close
                            </Button>
                            <Button 
                              variant="secondary" 
                              onClick={() => notification.warning({
                                message: 'Important Notice',
                                description: 'This notification stays open until manually closed.',
                                duration: 0,
                              })}
                              className="text-xs"
                            >
                              Manual Close
                            </Button>
                            <Button 
                              variant="secondary" 
                              onClick={() => notification.success({
                                message: 'Extended Message',
                                description: 'This notification will auto-close in 10 seconds for important information.',
                                duration: 10,
                              })}
                              className="text-xs"
                            >
                              10s Extended
                            </Button>
                          </div>
                        </div>

                        {/* Global Configuration */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Global Settings</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-card border border-border rounded">
                              <div className="text-xs text-muted-foreground mb-2">Default Position</div>
                              <div className="text-sm text-foreground">Top Right</div>
                            </div>
                            <div className="p-3 bg-card border border-border rounded">
                              <div className="text-xs text-muted-foreground mb-2">Default Duration</div>
                              <div className="text-sm text-foreground">4.5 seconds</div>
                            </div>
                            <div className="p-3 bg-card border border-border rounded">
                              <div className="text-xs text-muted-foreground mb-2">Max Notifications</div>
                              <div className="text-sm text-foreground">5 visible</div>
                            </div>
                            <div className="p-3 bg-card border border-border rounded">
                              <div className="text-xs text-muted-foreground mb-2">Animation</div>
                              <div className="text-sm text-foreground">Slide in from right</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* CNC Controls */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">CNC Control Components</h2>
                <Grid cols={2} gap="lg">
                  <AnimatedCard>
                    <Card ref={jogControlsRef}>
                      <CardHeader>
                        <CardTitle>Jog Controls</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <JogControls
                          onJog={handleJog}
                          onHome={() => handleZero()}
                          disabled={isEmergencyStopped}
                        />
                      </CardContent>
                    </Card>
                  </AnimatedCard>

                  <AnimatedCard delay={0.1}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Jog Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <JogSpeedControl
                          speed={jogSpeed}
                          onSpeedChange={setJogSpeed}
                        />
                        <JogDistanceControl
                          distance={jogDistance}
                          onDistanceChange={setJogDistance}
                          continuous={continuous}
                          onContinuousChange={setContinuous}
                        />
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                </Grid>
              </section>

              {/* Position Display */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">Position & Status Display</h2>
                <Grid cols={2} gap="lg">
                  <AnimatedCard ref={coordinateDisplayRef}>
                    <CoordinateDisplay
                      workPosition={position}
                      machinePosition={{ x: position.x + 10, y: position.y + 10, z: position.z + 5 }}
                      onZero={handleZero}
                      precision="high"
                    />
                  </AnimatedCard>

                  <AnimatedCard delay={0.1}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Connection & Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <CompactCoordinateDisplay position={position} />
                        <div className="border-t border-border pt-4">
                          <ConnectionStatus
                            isConnected={isConnected}
                            port="/dev/ttyUSB0"
                            baudRate={115200}
                          />
                          <Button
                            onClick={() => setIsConnected(!isConnected)}
                            variant={isConnected ? 'destructive' : 'success'}
                            className="w-full mt-3"
                          >
                            {isConnected ? 'Disconnect' : 'Connect'}
                          </Button>
                        </div>
                        <div className="border-t border-border pt-4">
                          <StatusDashboard
                            status={machineStatus}
                            metrics={{
                              feedRate: 2500,
                              spindleSpeed: 12000,
                              temperature: 45.5,
                              runtime: 3661,
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                </Grid>
              </section>

              {/* Status Indicators */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">Status & Safety</h2>
                <Grid cols={2} gap="lg">
                  <AnimatedCard>
                    <Card>
                      <CardHeader>
                        <CardTitle>Status Indicators</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex gap-3 flex-wrap">
                          <button
                            onClick={() => setMachineStatus('connected')}
                            className="cursor-pointer hover:scale-105 transition-transform"
                          >
                            <StatusIndicator status="connected" />
                          </button>
                          <button
                            onClick={() => setMachineStatus('idle')}
                            className="cursor-pointer hover:scale-105 transition-transform"
                          >
                            <StatusIndicator status="idle" />
                          </button>
                          <button
                            onClick={() => setMachineStatus('running')}
                            className="cursor-pointer hover:scale-105 transition-transform"
                          >
                            <StatusIndicator status="running" />
                          </button>
                          <button
                            onClick={() => setMachineStatus('error')}
                            className="cursor-pointer hover:scale-105 transition-transform"
                          >
                            <StatusIndicator status="error" />
                          </button>
                        </div>
                        <div className="border-t border-border"></div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Click on status indicators above to see different states
                          </p>
                          <select
                            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                            value={machineStatus}
                            onChange={(e) => setMachineStatus(e.target.value as any)}
                          >
                            <option value="connected">Connected</option>
                            <option value="disconnected">Disconnected</option>
                            <option value="idle">Idle</option>
                            <option value="running">Running</option>
                            <option value="error">Error</option>
                            <option value="warning">Warning</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>

                  <AnimatedCard delay={0.1} ref={emergencyStopRef}>
                    <SafetyControlPanel
                      onEmergencyStop={handleEmergencyStop}
                      isEmergencyStopped={isEmergencyStopped}
                      onPause={() => console.log('Pause')}
                      onResume={() => console.log('Resume')}
                    />
                  </AnimatedCard>
                </Grid>
              </section>

              {/* Alerts */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
                  Alerts & Notifications
                </h2>
                <div className="space-y-6">
                  {/* Dynamic Alert Banner */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Dynamic Alert Banner</CardTitle>
                      <p className="text-sm text-muted-foreground">Test different alert types with dismissible banners</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {showAlert && (
                        <AlertBanner
                          type={alertType}
                          title={`${alertType.charAt(0).toUpperCase() + alertType.slice(1)} Alert`}
                          message="This is an example alert message demonstrating the styling. Click the X to dismiss."
                          onDismiss={() => setShowAlert(false)}
                        />
                      )}
                      <div className="flex gap-3 flex-wrap">
                        <Button variant="outline" onClick={() => { setShowAlert(true); setAlertType('info'); }} className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
                          🛈 Show Info
                        </Button>
                        <Button variant="outline" onClick={() => { setShowAlert(true); setAlertType('success'); }} className="border-green-500 text-green-400 hover:bg-green-500/10">
                          ✓ Show Success
                        </Button>
                        <Button variant="outline" onClick={() => { setShowAlert(true); setAlertType('warning'); }} className="border-amber-500 text-amber-400 hover:bg-amber-500/10">
                          ⚠ Show Warning
                        </Button>
                        <Button variant="outline" onClick={() => { setShowAlert(true); setAlertType('error'); }} className="border-red-500 text-red-400 hover:bg-red-500/10">
                          ✕ Show Error
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Static Alert Examples */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Static Alert Examples</CardTitle>
                      <p className="text-sm text-muted-foreground">Various alert types and styles</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert variant="info" className="border-blue-500 bg-blue-500/10">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">🛈</span>
                          <div>
                            <div className="font-medium text-blue-300">Information Alert</div>
                            <div className="mt-1 text-sm text-blue-200">This is an informational message with additional context.</div>
                          </div>
                        </div>
                      </Alert>

                      <Alert variant="success" className="border-green-500 bg-green-500/10">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">✓</span>
                          <div>
                            <div className="font-medium text-green-300">Success Alert</div>
                            <div className="mt-1 text-sm text-green-200">Your operation was completed successfully!</div>
                          </div>
                        </div>
                      </Alert>

                      <Alert variant="warning" className="border-amber-500 bg-amber-500/10">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">⚠</span>
                          <div>
                            <div className="font-medium text-amber-300">Warning Alert</div>
                            <div className="mt-1 text-sm text-amber-200">Please review your settings before proceeding.</div>
                          </div>
                        </div>
                      </Alert>

                      <Alert variant="destructive" className="border-red-500 bg-red-500/10">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">✕</span>
                          <div>
                            <div className="font-medium text-red-300">Error Alert</div>
                            <div className="mt-1 text-sm text-red-200">An error occurred while processing your request.</div>
                          </div>
                        </div>
                      </Alert>
                    </CardContent>
                  </Card>

                  {/* Icon Preview Grid */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Icon Library</CardTitle>
                      <p className="text-sm text-muted-foreground">Available icons from Lucide React</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-8 gap-4">
                        {[
                          { Icon: BarChart3, name: 'BarChart3' },
                          { Icon: TrendingUp, name: 'TrendingUp' },
                          { Icon: Settings, name: 'Settings' },
                          { Icon: Users, name: 'Users' },
                          { Icon: FileText, name: 'FileText' },
                          { Icon: Wrench, name: 'Wrench' },
                          { Icon: HelpCircle, name: 'HelpCircle' },
                          { Icon: User, name: 'User' },
                        ].map(({ Icon, name }, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                            <Icon className="w-6 h-6 text-primary" />
                            <span className="text-xs text-muted-foreground text-center leading-tight">{name}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Layout Components */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
                  Layout & Interactive Cards
                </h2>
                <div className="space-y-2 mb-4">
                  <p className="text-muted-foreground">
                    Interactive dashboard cards with hover effects and animations. Click any card to see the interaction.
                  </p>
                </div>
                <DashboardGrid cols={4} className="gap-3">
                  {[
                    { name: 'Dashboard', Icon: BarChart3, desc: 'Overview' },
                    { name: 'Analytics', Icon: TrendingUp, desc: 'Metrics' },
                    { name: 'Settings', Icon: Settings, desc: 'Config' },
                    { name: 'Users', Icon: Users, desc: 'Manage' },
                    { name: 'Reports', Icon: FileText, desc: 'Data' },
                    { name: 'Tools', Icon: Wrench, desc: 'Utilities' },
                    { name: 'Help', Icon: HelpCircle, desc: 'Support' },
                    { name: 'Profile', Icon: User, desc: 'Account' },
                  ].map((item, i) => (
                    <AnimatedCard key={i} delay={i * 0.05}>
                      <DashboardCard 
                        interactive 
                        onClick={() => console.log(`Clicked ${item.name}`)}
                      >
                        <CardContent className="h-32 flex flex-col items-center justify-center text-center p-4 gap-2">
                          <item.Icon className="w-6 h-6 text-primary flex-shrink-0" />
                          <div className="text-sm font-semibold text-foreground leading-tight">{item.name}</div>
                          <div className="text-xs text-muted-foreground leading-tight">{item.desc}</div>
                        </CardContent>
                      </DashboardCard>
                    </AnimatedCard>
                  ))}
                </DashboardGrid>
              </section>

              {/* Layout Options */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
                  Layout Options
                </h2>
                <div className="space-y-6">
                  {/* Grid Layouts */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Grid Systems</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* 2 Column Grid */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">2 Column Grid</h4>
                        <Grid cols={2} gap="md">
                          <div className="bg-muted/20 border border-border rounded-lg p-4 text-center text-sm text-muted-foreground">
                            Column 1
                          </div>
                          <div className="bg-muted/20 border border-border rounded-lg p-4 text-center text-sm text-muted-foreground">
                            Column 2
                          </div>
                        </Grid>
                      </div>
                      
                      {/* 3 Column Grid */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">3 Column Grid</h4>
                        <Grid cols={3} gap="md">
                          <div className="bg-muted/20 border border-border rounded-lg p-4 text-center text-sm text-muted-foreground">
                            Column 1
                          </div>
                          <div className="bg-muted/20 border border-border rounded-lg p-4 text-center text-sm text-muted-foreground">
                            Column 2
                          </div>
                          <div className="bg-muted/20 border border-border rounded-lg p-4 text-center text-sm text-muted-foreground">
                            Column 3
                          </div>
                        </Grid>
                      </div>
                      
                      {/* 4 Column Grid */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">4 Column Grid</h4>
                        <Grid cols={4} gap="sm">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-muted/20 border border-border rounded-lg p-3 text-center text-xs text-muted-foreground">
                              Col {i}
                            </div>
                          ))}
                        </Grid>
                      </div>
                      
                      {/* Dashboard Grid */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">Dashboard Tiles</h4>
                        <DashboardGrid cols={3} className="gap-4">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <DashboardCard key={i} interactive>
                              <CardContent className="h-24 flex items-center justify-center p-4">
                                <span className="text-base font-semibold text-primary leading-tight">Tile {i}</span>
                              </CardContent>
                            </DashboardCard>
                          ))}
                        </DashboardGrid>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Typography */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
                  Typography
                </h2>
                <div className="space-y-6">
                  {/* Headings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Headings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <h1 className="text-4xl font-bold text-foreground heading">Heading 1 - Main Title</h1>
                        <h2 className="text-3xl font-semibold text-foreground heading">Heading 2 - Section Title</h2>
                        <h3 className="text-2xl font-semibold text-foreground">Heading 3 - Subsection</h3>
                        <h4 className="text-xl font-medium text-foreground">Heading 4 - Component Title</h4>
                        <h5 className="text-lg font-medium text-foreground">Heading 5 - Small Header</h5>
                        <h6 className="text-base font-medium text-foreground">Heading 6 - Smallest Header</h6>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Body Text */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Body Text & Paragraphs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <p className="text-lg text-foreground">
                          Large body text - This is the largest body text size, used for prominent descriptions and introductory content.
                        </p>
                        <p className="text-base text-foreground">
                          Regular body text - This is the standard body text size for most content, providing good readability.
                        </p>
                        <p className="text-sm text-foreground">
                          Small body text - This is smaller text used for captions, labels, and secondary information.
                        </p>
                        <p className="text-xs text-foreground">
                          Extra small text - Used for very minor details, timestamps, and fine print.
                        </p>
                        <p className="text-muted-foreground">
                          Muted text - Used for secondary information with reduced emphasis.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Special Text */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Text Variants & Styles</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <p className="font-bold text-foreground">Bold text for emphasis</p>
                        <p className="font-semibold text-foreground">Semibold text for headings</p>
                        <p className="font-medium text-foreground">Medium weight text</p>
                        <p className="font-normal text-foreground">Normal weight text</p>
                        <p className="font-light text-foreground">Light weight text</p>
                        <p className="italic text-foreground">Italic text for emphasis</p>
                        <p className="underline text-foreground">Underlined text for links</p>
                        <p className="line-through text-muted-foreground">Strikethrough text</p>
                        <p className="font-mono text-sm bg-muted px-2 py-1 rounded text-foreground">
                          Monospace text for code: function() {'{ return true; }'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Color Variants */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Text Colors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-foreground">Primary text color</p>
                        <p className="text-muted-foreground">Muted text color</p>
                        <p className="text-primary">Primary brand color</p>
                        <p className="text-green-400">Success color</p>
                        <p className="text-red-400">Error/danger color</p>
                        <p className="text-amber-400">Warning color</p>
                        <p className="text-blue-400">Info color</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Data Table */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
                  Data Tables
                </h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Machine Status Table</CardTitle>
                    <p className="text-sm text-muted-foreground">Example data table with various cell types and styling</p>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-semibold text-foreground">Machine ID</th>
                            <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                            <th className="text-right py-3 px-4 font-semibold text-foreground">Position (X, Y, Z)</th>
                            <th className="text-right py-3 px-4 font-semibold text-foreground">Speed</th>
                            <th className="text-right py-3 px-4 font-semibold text-foreground">Runtime</th>
                            <th className="text-center py-3 px-4 font-semibold text-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-mono text-sm text-foreground">CNC-001</div>
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status="running" />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-mono text-sm text-foreground">
                                <div>X: 125.750</div>
                                <div>Y: 89.250</div>
                                <div>Z: 15.000</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-sm text-foreground">
                              2,500 mm/min
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-foreground">
                              02:34:15
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex gap-2 justify-center">
                                <Button size="sm" variant="outline">View</Button>
                                <Button size="sm" variant="secondary">Control</Button>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-mono text-sm text-foreground">CNC-002</div>
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status="idle" />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-mono text-sm text-foreground">
                                <div>X: 0.000</div>
                                <div>Y: 0.000</div>
                                <div>Z: 0.000</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-sm text-muted-foreground">
                              --- mm/min
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                              --:--:--
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex gap-2 justify-center">
                                <Button size="sm" variant="outline">View</Button>
                                <Button size="sm" variant="success">Start</Button>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-mono text-sm text-foreground">CNC-003</div>
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status="error" />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-mono text-sm text-foreground">
                                <div>X: 67.125</div>
                                <div>Y: 45.875</div>
                                <div>Z: 8.500</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-sm text-red-400">
                              EMERGENCY
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-foreground">
                              01:15:42
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex gap-2 justify-center">
                                <Button size="sm" variant="outline">View</Button>
                                <Button size="sm" variant="destructive">Reset</Button>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-mono text-sm text-foreground">CNC-004</div>
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status="connected" />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-mono text-sm text-foreground">
                                <div>X: 200.000</div>
                                <div>Y: 150.000</div>
                                <div>Z: 25.750</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-sm text-foreground">
                              1,800 mm/min
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-foreground">
                              00:45:23
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex gap-2 justify-center">
                                <Button size="sm" variant="outline">View</Button>
                                <Button size="sm" variant="warning">Pause</Button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Table Footer */}
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                      <div>Showing 4 of 12 machines</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" disabled>Previous</Button>
                        <Button size="sm" variant="outline">Next</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Sidebar Demo */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
                  Interactive Components
                </h2>
                <Card>
                  <CardContent className="py-8 text-center space-y-4">
                    <p className="text-muted-foreground">
                      Test the sidebar overlay component with smooth animations
                    </p>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setShowSidebar(true)}
                    >
                      Open Sidebar Demo →
                    </Button>
                  </CardContent>
                </Card>
              </section>
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
