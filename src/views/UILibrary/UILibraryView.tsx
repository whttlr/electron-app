import React, { useState } from 'react';
import {
  // Layout Components
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardIcon,
  CardValue,
  CardChange,
  CardActions,
  Grid,
  GridItem,
  Stack,
  Flex,
  DashboardContainer,
  ControlContainer,
  DashboardCard,
  StatusCard,
  
  // Form Components
  Button,
  Input,
  Select,
  Toggle,
  FormField,
  Upload,
  
  // Data Display Components
  Badge,
  StatusBadge,
  Progress,
  CircularProgress,
  MonospaceText,
  StatusIndicatorCard,
  StatusIndicatorGroup,
  CoordinateDisplay,
  CompactCoordinateDisplay,
  Accordion,
  Collapse,
  
  // Feedback Components
  Alert,
  AlertTitle,
  AlertDescription,
  AlertActions,
  AlertBanner,
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
  Tooltip,
  ErrorTooltip,
  WarningTooltip,
  SuccessTooltip,
  InfoTooltip,
  
  // CNC-Specific Components
  JogControls,
  JogSpeedControl,
  JogDistanceControl,
  SafetyControlPanel,
  StatusDashboard,
  ConnectionStatus,
  WorkingAreaPreview,
  MachineDisplay2D,
  
  // Utility Functions
  cn,
  tokens,
  
  // Design Token Helpers
  getButtonVariantStyles,
  getBadgeVariantStyles,
  getCardVariantStyles,
  getProgressVariantStyles
} from '@whttlr/ui-core';

const UILibraryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('primitives');
  
  // Form States
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [numberValue, setNumberValue] = useState(42);
  const [selectValue, setSelectValue] = useState('');
  const [multiSelectValue, setMultiSelectValue] = useState([]);
  const [coordinateValue, setCoordinateValue] = useState(0.5);
  const [precisionValue, setPrecisionValue] = useState(1.234);
  const [toggleValue, setToggleValue] = useState(false);
  
  // Progress States
  const [progressValue, setProgressValue] = useState(65);
  const [circularProgress, setCircularProgress] = useState(35);
  const [loadingStates, setLoadingStates] = useState({
    button: false,
    card: false,
    skeleton: false
  });
  
  // CNC States
  const [position, setPosition] = useState({ x: 10.5, y: 25.0, z: 2.3 });
  const [jogDistance, setJogDistance] = useState(1);
  const [jogSpeed, setJogSpeed] = useState(1000);
  const [isConnected, setIsConnected] = useState(true);
  const [machineStatus, setMachineStatus] = useState('idle');
  
  // Layout States
  const [accordionOpen, setAccordionOpen] = useState(['item1']);
  const [collapseOpen, setCollapseOpen] = useState(false);
  
  // Data States
  const [tableData] = useState([
    { id: 1, name: 'Spindle Motor', status: 'running', temp: 45, load: 78 },
    { id: 2, name: 'X-Axis Drive', status: 'idle', temp: 32, load: 12 },
    { id: 3, name: 'Y-Axis Drive', status: 'idle', temp: 31, load: 8 },
    { id: 4, name: 'Z-Axis Drive', status: 'idle', temp: 29, load: 5 },
  ]);

  const handleJog = (axis: 'x' | 'y' | 'z', direction: 1 | -1) => {
    const distance = jogDistance * direction;
    setPosition(prev => ({
      ...prev,
      [axis]: Math.max(0, prev[axis] + distance) // Ensure no negative values
    }));
  };

  // Helper Data
  const selectOptions = [
    { value: 'option1', label: 'Option 1', description: 'First option' },
    { value: 'option2', label: 'Option 2', description: 'Second option' },
    { value: 'option3', label: 'Option 3', description: 'Third option' },
    { value: 'option4', label: 'Disabled Option', disabled: true }
  ];

  const multiSelectOptions = [
    { value: 'feature1', label: 'Advanced Toolpath' },
    { value: 'feature2', label: 'Real-time Monitoring' },
    { value: 'feature3', label: 'Auto-calibration' },
    { value: 'feature4', label: 'Safety Interlocks' }
  ];

  const accordionItems = [
    { 
      id: 'item1', 
      title: 'Machine Configuration', 
      content: (
        <p style={{ margin: '0', color: tokens.colors.text.secondary }}>
          Configure machine parameters, work area dimensions, and axis limits.
        </p>
      )
    },
    { 
      id: 'item2', 
      title: 'Tool Library', 
      content: (
        <p style={{ margin: '0', color: tokens.colors.text.secondary }}>
          Manage cutting tools, speeds, feeds, and tool change procedures.
        </p>
      )
    },
    { 
      id: 'item3', 
      title: 'Safety Settings', 
      content: (
        <p style={{ margin: '0', color: tokens.colors.text.secondary }}>
          Configure emergency stops, safety zones, and protective systems.
        </p>
      )
    }
  ];

  const workArea = { x: 300, y: 200, z: 50 };

  // Helper Functions
  const toggleLoading = (key: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setTimeout(() => {
      setLoadingStates(prev => ({
        ...prev,
        [key]: false
      }));
    }, 3000);
  };

  return (
    <DashboardContainer>
      <Card variant="dashboard" style={{ marginBottom: '24px' }}>
        <CardHeader>
          <CardTitle style={{ fontSize: '2rem', color: tokens.colors.primary.main }}>
            UI Library Showcase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p style={{ color: tokens.colors.text.secondary, fontSize: '1.1rem' }}>
            A comprehensive showcase of all components available in the CNC Controls UI Library.
            Built with design tokens for consistent theming and optimized for CNC machine interfaces.
          </p>
        </CardContent>
      </Card>

      <div>
        <div style={{ marginBottom: '24px' }}>
          <Button 
            variant={activeTab === 'primitives' ? 'default' : 'outline'}
            onClick={() => setActiveTab('primitives')}
            style={{ marginRight: '8px' }}
          >
            Primitive Components
          </Button>
          <Button 
            variant={activeTab === 'cnc' ? 'default' : 'outline'}
            onClick={() => setActiveTab('cnc')}
            style={{ marginRight: '8px' }}
          >
            CNC Components
          </Button>
          <Button 
            variant={activeTab === 'examples' ? 'default' : 'outline'}
            onClick={() => setActiveTab('examples')}
            style={{ marginRight: '8px' }}
          >
            Real Examples
          </Button>
          <Button 
            variant={activeTab === 'tokens' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tokens')}
          >
            Design Tokens
          </Button>
        </div>

        {activeTab === 'primitives' && (
          <div>
          <Stack spacing={24}>
            {/* Comprehensive Buttons Section */}
            <Card>
              <CardHeader>
                <CardTitle>Button System - Complete Showcase</CardTitle>
                <p style={{ color: tokens.colors.text.secondary, margin: '8px 0 0 0' }}>
                  Full range of button variants, sizes, and interactive states
                </p>
              </CardHeader>
              <CardContent>
                <Stack spacing={24}>
                  {/* All Button Variants */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>All Variants</h4>
                    <Grid cols={4} gap={3}>
                      <Button variant="default">Default</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="tertiary">Tertiary</Button>
                      <Button variant="subtle">Subtle</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="link">Link</Button>
                      <Button variant="white">White</Button>
                      <Button variant="cnc">CNC Style</Button>
                      <Button variant="emergency">Emergency</Button>
                      <Button variant="success">Success</Button>
                      <Button variant="warning">Warning</Button>
                    </Grid>
                  </div>

                  {/* All Button Sizes */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>All Sizes</h4>
                    <Flex gap={12} align="center">
                      <Button size="sm">Small</Button>
                      <Button size="default">Default</Button>
                      <Button size="lg">Large</Button>
                      <Button size="xl">Extra Large</Button>
                      <Button size="icon">⚙</Button>
                      <Button size="iconlg">🔧</Button>
                      <Button size="jog">JOG</Button>
                    </Flex>
                  </div>

                  {/* Interactive States */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Interactive States</h4>
                    <Grid cols={3} gap={4}>
                      <Stack spacing={8}>
                        <Button disabled>Disabled</Button>
                        <Button 
                          loading={loadingStates.button}
                          onClick={() => toggleLoading('button')}
                        >
                          {loadingStates.button ? 'Loading...' : 'Click to Load'}
                        </Button>
                      </Stack>
                      
                      <Stack spacing={8}>
                        <Button leftIcon="🚀">With Left Icon</Button>
                        <Button rightIcon="📊">With Right Icon</Button>
                      </Stack>
                      
                      <Stack spacing={8}>
                        <Button as="a" href="#" variant="link">As Link</Button>
                        <Button variant="emergency" size="lg">EMERGENCY STOP</Button>
                      </Stack>
                    </Grid>
                  </div>

                  {/* CNC-Specific Buttons */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>CNC-Optimized Buttons</h4>
                    <Grid cols={4} gap={3}>
                      <Button variant="cnc" size="jog">X+</Button>
                      <Button variant="cnc" size="jog">X-</Button>
                      <Button variant="cnc" size="jog">Y+</Button>
                      <Button variant="cnc" size="jog">Y-</Button>
                      <Button variant="cnc" size="jog">Z+</Button>
                      <Button variant="cnc" size="jog">Z-</Button>
                      <Button variant="success">START</Button>
                      <Button variant="warning">PAUSE</Button>
                    </Grid>
                  </div>
                </Stack>
              </CardContent>
            </Card>

            {/* Comprehensive Form Components Section */}
            <Card>
              <CardHeader>
                <CardTitle>Form System - Complete Input Library</CardTitle>
                <p style={{ color: tokens.colors.text.secondary, margin: '8px 0 0 0' }}>
                  All input variants, number inputs with CNC-specific formatting, and form validation
                </p>
              </CardHeader>
              <CardContent>
                <Stack spacing={24}>
                  {/* Input Variants */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Input Variants</h4>
                    <Grid cols={2} gap={6}>
                      <Stack spacing={12}>
                        <FormField label="Default Input" required>
                          <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Enter text..."
                          />
                        </FormField>
                        
                        <FormField label="Search Input">
                          <Input
                            variant="search"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search..."
                          />
                        </FormField>
                        
                        <FormField label="Password Input">
                          <Input
                            variant="password"
                            value={passwordValue}
                            onChange={(e) => setPasswordValue(e.target.value)}
                            placeholder="Enter password..."
                          />
                        </FormField>
                        
                        <FormField label="Number Input">
                          <Input
                            variant="number"
                            value={numberValue}
                            onChange={(e) => setNumberValue(Number(e.target.value))}
                            min={0}
                            max={100}
                          />
                        </FormField>
                      </Stack>
                      
                      <Stack spacing={12}>
                        <FormField label="CNC Input" description="Industrial-grade input styling">
                          <Input
                            variant="cnc"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="CNC parameter..."
                          />
                        </FormField>
                        
                        <FormField label="Input with Left Icon">
                          <Input
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search with icon..."
                          />
                        </FormField>
                        
                        <FormField label="Input with Right Addon">
                          <Input
                            value={coordinateValue}
                            onChange={(e) => setCoordinateValue(Number(e.target.value))}
                            placeholder="0.000 mm"
                          />
                        </FormField>
                        
                        <FormField label="Error State" error="This field is required">
                          <Input
                            value=""
                            onChange={() => {}}
                            placeholder="Required field..."
                            error
                          />
                        </FormField>
                      </Stack>
                    </Grid>
                  </div>

                  {/* CNC-Specialized Inputs */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>CNC-Optimized Number Inputs</h4>
                    <Grid cols={2} gap={6}>
                      <Stack spacing={12}>
                        <FormField label="Coordinate Input" description="High-precision coordinate with unit display">
                          <Input
                            type="number"
                            value={coordinateValue}
                            onChange={(e) => setCoordinateValue(Math.max(0, Number(e.target.value) || 0))}
                            placeholder="0.500 mm"
                            step="0.001"
                            min="0"
                            max="1000"
                          />
                        </FormField>
                        
                        <FormField label="Precision Input" description="Ultra-precise numeric input">
                          <Input
                            type="number"
                            value={precisionValue}
                            onChange={(e) => setPrecisionValue(Number(e.target.value) || 0)}
                            placeholder="1.234"
                            step="0.0001"
                            min="0"
                            max="100"
                          />
                        </FormField>
                      </Stack>
                      
                      <Stack spacing={12}>
                        <FormField label="Speed Input (RPM)">
                          <Input
                            type="number"
                            value={jogSpeed}
                            onChange={(e) => setJogSpeed(Number(e.target.value) || 1000)}
                            placeholder="1000 RPM"
                            step="50"
                            min="100"
                            max="5000"
                          />
                        </FormField>
                        
                        <FormField label="Distance Input">
                          <Input
                            type="number"
                            value={jogDistance}
                            onChange={(e) => setJogDistance(Math.max(0.001, Number(e.target.value) || 0.001))}
                            placeholder="1.000 mm"
                            step="0.001"
                            min="0.001"
                            max="1000"
                          />
                        </FormField>
                      </Stack>
                    </Grid>
                  </div>

                  {/* Select Components */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Selection Components</h4>
                    <Grid cols={2} gap={6}>
                      <Stack spacing={12}>
                        <FormField label="Standard Select">
                          <Select
                            value={selectValue}
                            onChange={setSelectValue}
                            options={selectOptions}
                            placeholder="Choose an option..."
                          />
                        </FormField>
                        
                        <FormField label="Multi-Select">
                          <Select
                            value={multiSelectValue}
                            onChange={setMultiSelectValue}
                            options={multiSelectOptions}
                            placeholder="Select multiple..."
                            multiple
                          />
                        </FormField>
                      </Stack>
                      
                      <Stack spacing={12}>
                        <FormField label="Searchable Select">
                          <Select
                            value={selectValue}
                            onChange={setSelectValue}
                            options={selectOptions}
                            placeholder="Search options..."
                            searchable
                          />
                        </FormField>
                        
                        <FormField label="CNC Select Variant">
                          <Select
                            variant="cnc"
                            value={selectValue}
                            onChange={setSelectValue}
                            options={selectOptions}
                            placeholder="CNC-styled select..."
                          />
                        </FormField>
                      </Stack>
                    </Grid>
                  </div>

                  {/* Interactive Controls */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Interactive Controls</h4>
                    <Grid cols={3} gap={6}>
                      <Stack spacing={12}>
                        <FormField label="Toggle Switch">
                          <Toggle
                            checked={toggleValue}
                            onChange={setToggleValue}
                            label="Enable feature"
                          />
                        </FormField>
                        
                        <FormField label="Large Toggle">
                          <Toggle
                            size="lg"
                            checked={toggleValue}
                            onChange={setToggleValue}
                            label="Large toggle"
                          />
                        </FormField>
                      </Stack>
                      
                      <Stack spacing={12}>
                        <FormField label="Custom Control">
                          <Input
                            type="number"
                            value={precisionValue}
                            onChange={(e) => setPrecisionValue(Number(e.target.value) || 0)}
                            placeholder="Enter value"
                            step="1"
                            min="0"
                            max="100"
                          />
                        </FormField>
                        
                        <FormField label="Range Control">
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Input
                              type="number"
                              value={20}
                              onChange={(e) => console.log('Range start:', e.target.value)}
                              placeholder="Min"
                              step="1"
                              min="0"
                              max="100"
                              style={{ flex: 1 }}
                            />
                            <span style={{ color: tokens.colors.text.secondary }}>-</span>
                            <Input
                              type="number"
                              value={80}
                              onChange={(e) => console.log('Range end:', e.target.value)}
                              placeholder="Max"
                              step="1"
                              min="0"
                              max="100"
                              style={{ flex: 1 }}
                            />
                          </div>
                        </FormField>
                      </Stack>
                      
                      <Stack spacing={12}>
                        <FormField label="File Upload">
                          <Upload
                            accept=".gcode,.nc"
                            multiple
                            onUpload={(files) => console.log('Uploaded:', files)}
                          >
                            <Button variant="outline">Upload G-Code Files</Button>
                          </Upload>
                        </FormField>
                      </Stack>
                    </Grid>
                  </div>
                </Stack>
              </CardContent>
            </Card>

            {/* Comprehensive Data Display Section */}
            <Card>
              <CardHeader>
                <CardTitle>Data Display System - Complete Badge & Status Library</CardTitle>
                <p style={{ color: tokens.colors.text.secondary, margin: '8px 0 0 0' }}>
                  All badge variants, status indicators, progress components, and data visualization
                </p>
              </CardHeader>
              <CardContent>
                <Stack spacing={24}>
                  {/* All Badge Variants */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Badge Variants - Complete Collection</h4>
                    <Grid cols={3} gap={6}>
                      <Stack spacing={12}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Solid Filled Badges</h5>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <Badge variant="default">Default</Badge>
                          <Badge variant="secondary">Secondary</Badge>
                          <Badge variant="success">Success</Badge>
                          <Badge variant="warning">Warning</Badge>
                          <Badge variant="destructive">Error</Badge>
                          <Badge variant="info">Info</Badge>
                        </div>
                      </Stack>
                      
                      <Stack spacing={12}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Outline Badges</h5>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <Badge variant="outline-default">Default</Badge>
                          <Badge variant="outline-secondary">Secondary</Badge>
                          <Badge variant="outline-success">Success</Badge>
                          <Badge variant="outline-warning">Warning</Badge>
                          <Badge variant="outline-danger">Danger</Badge>
                          <Badge variant="outline-info">Info</Badge>
                        </div>
                      </Stack>
                      
                      <Stack spacing={12}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Bright Badges</h5>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <Badge variant="bright-default">Default</Badge>
                          <Badge variant="bright-secondary">Secondary</Badge>
                          <Badge variant="bright-success">Success</Badge>
                          <Badge variant="bright-warning">Warning</Badge>
                          <Badge variant="bright-danger">Danger</Badge>
                          <Badge variant="bright-info">Info</Badge>
                        </div>
                      </Stack>
                    </Grid>
                  </div>

                  {/* Badge Sizes and Features */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Badge Sizes & Features</h4>
                    <Grid cols={3} gap={6}>
                      <Stack spacing={12}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Size Variants</h5>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Badge size="sm">Small</Badge>
                          <Badge size="default">Default</Badge>
                          <Badge size="lg">Large</Badge>
                        </div>
                      </Stack>
                      
                      <Stack spacing={12}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>With Indicators</h5>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <Badge showIndicator variant="success">Online</Badge>
                          <Badge showIndicator pulse variant="warning">Warning</Badge>
                          <Badge showIndicator variant="info">Active</Badge>
                        </div>
                      </Stack>
                      
                      <Stack spacing={12}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>CNC Status Badges</h5>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <StatusBadge status="connected" />
                          <StatusBadge status="running" />
                          <StatusBadge status="idle" />
                          <StatusBadge status="error" />
                          <StatusBadge status="warning" />
                        </div>
                      </Stack>
                    </Grid>
                  </div>

                  {/* Progress Components */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Progress Indicators - All Variants</h4>
                    <Grid cols={2} gap={6}>
                      <Stack spacing={12}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Linear Progress Variants</h5>
                        <Stack spacing={8}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.875rem' }}>Default Progress</span>
                              <span style={{ fontSize: '0.875rem', color: tokens.colors.text.secondary }}>{progressValue.toFixed(0)}%</span>
                            </div>
                            <Progress value={progressValue} max={100} />
                          </div>
                          
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.875rem' }}>Success Progress</span>
                              <span style={{ fontSize: '0.875rem', color: tokens.colors.text.secondary }}>{circularProgress.toFixed(0)}%</span>
                            </div>
                            <Progress value={circularProgress} max={100} variant="success" />
                          </div>
                          
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.875rem' }}>Warning Progress</span>
                              <span style={{ fontSize: '0.875rem', color: tokens.colors.text.secondary }}>85%</span>
                            </div>
                            <Progress value={85} max={100} variant="warning" />
                          </div>
                          
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.875rem' }}>Error Progress</span>
                              <span style={{ fontSize: '0.875rem', color: tokens.colors.text.secondary }}>25%</span>
                            </div>
                            <Progress value={25} max={100} variant="destructive" />
                          </div>
                        </Stack>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setProgressValue(Math.random() * 100);
                            setCircularProgress(Math.random() * 100);
                          }}
                        >
                          Randomize Progress Values
                        </Button>
                      </Stack>
                      
                      <Stack spacing={12}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Circular Progress Variants</h5>
                        <Grid cols={2} gap={4}>
                          <div style={{ textAlign: 'center' }}>
                            <CircularProgress value={progressValue} size={80} />
                            <div style={{ fontSize: '0.75rem', color: tokens.colors.text.secondary, marginTop: '8px' }}>
                              Job Progress
                            </div>
                          </div>
                          
                          <div style={{ textAlign: 'center' }}>
                            <CircularProgress value={circularProgress} size={80} variant="success" />
                            <div style={{ fontSize: '0.75rem', color: tokens.colors.text.secondary, marginTop: '8px' }}>
                              Success Rate
                            </div>
                          </div>
                          
                          <div style={{ textAlign: 'center' }}>
                            <CircularProgress value={75} size={80} variant="warning" />
                            <div style={{ fontSize: '0.75rem', color: tokens.colors.text.secondary, marginTop: '8px' }}>
                              Load Level
                            </div>
                          </div>
                          
                          <div style={{ textAlign: 'center' }}>
                            <CircularProgress value={90} size={80} variant="info" />
                            <div style={{ fontSize: '0.75rem', color: tokens.colors.text.secondary, marginTop: '8px' }}>
                              Efficiency
                            </div>
                          </div>
                        </Grid>
                      </Stack>
                    </Grid>
                  </div>

                  {/* Monospace Text and Coordinates */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Monospace Text & Coordinate Display</h4>
                    <Grid cols={2} gap={6}>
                      <Stack spacing={12}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Code Display Variants</h5>
                        <Stack spacing={8}>
                          <MonospaceText variant="code" size="sm">
                            G01 X10.5 Y25.0 Z-2.3 F1000
                          </MonospaceText>
                          <MonospaceText variant="code">
                            M03 S1000 ; Start spindle
                          </MonospaceText>
                          <MonospaceText variant="code" size="lg">
                            G00 X0 Y0 Z5 ; Rapid move to home
                          </MonospaceText>
                        </Stack>
                      </Stack>
                      
                      <Stack spacing={12}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Coordinate Display</h5>
                        <Stack spacing={8}>
                          <MonospaceText variant="coordinates" size="sm">
                            X: {Math.abs(position.x).toFixed(3)} Y: {Math.abs(position.y).toFixed(3)} Z: {Math.abs(position.z).toFixed(3)}
                          </MonospaceText>
                          <MonospaceText variant="coordinates">
                            Position: ({Math.abs(position.x).toFixed(2)}, {Math.abs(position.y).toFixed(2)}, {Math.abs(position.z).toFixed(2)})
                          </MonospaceText>
                          <MonospaceText variant="coordinates" size="lg">
                            MACHINE COORDS: X{Math.abs(position.x).toFixed(3)} Y{Math.abs(position.y).toFixed(3)} Z{Math.abs(position.z).toFixed(3)}
                          </MonospaceText>
                        </Stack>
                      </Stack>
                    </Grid>
                  </div>
                </Stack>
              </CardContent>
            </Card>

            {/* Comprehensive Feedback Section */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback System - Complete Alert & Loading Library</CardTitle>
                <p style={{ color: tokens.colors.text.secondary, margin: '8px 0 0 0' }}>
                  All alert variants, layouts, sizes, and loading state components
                </p>
              </CardHeader>
              <CardContent>
                <Stack spacing={24}>
                  {/* Alert Variants */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Alert Variants - All Types</h4>
                    <Stack spacing={12}>
                      <Alert variant="default" title="Information" description="This is a default informational alert message with standard styling." />
                      <Alert variant="success" title="Operation Successful" description="The CNC machining operation has completed successfully with all quality checks passed." />
                      <Alert variant="warning" title="Warning Notice" description="Tool wear is approaching limits. Consider replacing cutting tool before next operation." />
                      <Alert variant="destructive" title="Critical Error" description="Emergency stop triggered due to spindle overheating. Machine operations halted for safety." />
                      <Alert variant="info" title="System Information" description="Machine diagnostics are running in the background. This may take a few minutes to complete." />
                      <Alert variant="cnc" title="CNC System Alert" description="Specialized alert styling optimized for CNC control interfaces and industrial environments." />
                    </Stack>
                  </div>

                  {/* Alert Sizes and Layouts */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Alert Sizes & Layouts</h4>
                    <Grid cols={3} gap={6}>
                      <Stack spacing={8}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Small Alerts</h5>
                        <Alert variant="success" size="sm" title="Small Success" description="Compact alert for minimal space." />
                        <Alert variant="warning" size="sm" title="Small Warning" description="Warning in compact form." />
                      </Stack>
                      
                      <Stack spacing={8}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Default Size</h5>
                        <Alert variant="info" title="Standard Alert" description="Default sizing for most use cases." />
                      </Stack>
                      
                      <Stack spacing={8}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Large Alerts</h5>
                        <Alert variant="destructive" size="lg" title="Large Error Alert" description="Enhanced visibility for critical messages requiring immediate attention." />
                      </Stack>
                    </Grid>
                  </div>

                  {/* Alert with Actions */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Interactive Alerts with Actions</h4>
                    <Stack spacing={12}>
                      <Alert 
                        variant="warning" 
                        title="Tool Replacement Required"
                        description="Current cutting tool has exceeded recommended usage. Replace before continuing operations."
                        actions={
                          <AlertActions>
                            <Button size="sm" variant="outline">Schedule Replacement</Button>
                            <Button size="sm" variant="warning">Replace Now</Button>
                          </AlertActions>
                        }
                      />
                      
                      <Alert 
                        variant="info" 
                        title="Software Update Available"
                        description="CNC Control System v2.1.3 is available with performance improvements and bug fixes."
                        actions={
                          <AlertActions>
                            <Button size="sm" variant="ghost">Remind Later</Button>
                            <Button size="sm" variant="default">Update Now</Button>
                          </AlertActions>
                        }
                      />
                      
                      <Alert 
                        variant="destructive" 
                        title="Emergency Stop Activated"
                        description="All machine operations have been halted. Clear the workspace and verify safety before resuming."
                        dismissible
                        onDismiss={() => console.log('Alert dismissed')}
                        actions={
                          <AlertActions>
                            <Button size="sm" variant="outline">View Details</Button>
                            <Button size="sm" variant="destructive">Reset Emergency Stop</Button>
                          </AlertActions>
                        }
                      />
                    </Stack>
                  </div>

                  {/* Alert Banners */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Alert Banners</h4>
                    <Stack spacing={8}>
                      <AlertBanner 
                        type="info" 
                        title="System Maintenance"
                        message="Scheduled maintenance will occur tonight at 2:00 AM EST. Plan accordingly."
                        onDismiss={() => console.log('Banner dismissed')}
                      />
                      <AlertBanner 
                        type="success" 
                        message="All systems operational. Machine ready for production."
                        onDismiss={() => console.log('Banner dismissed')}
                      />
                      <AlertBanner 
                        type="warning" 
                        message="Coolant level low - refill recommended before next job."
                        onDismiss={() => console.log('Banner dismissed')}
                      />
                      <AlertBanner 
                        type="error" 
                        title="Connection Lost"
                        message="Lost connection to CNC controller. Check network and USB connections."
                      />
                    </Stack>
                  </div>

                  {/* Loading States */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Loading States & Skeletons</h4>
                    <Grid cols={3} gap={6}>
                      <Stack spacing={8}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Text Skeletons</h5>
                        <Skeleton variant="text" lines={1} />
                        <Skeleton variant="text" lines={2} />
                        <Skeleton variant="text" lines={3} />
                      </Stack>
                      
                      <Stack spacing={8}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Shaped Skeletons</h5>
                        <Skeleton variant="rectangular" width="100%" height="40px" />
                        <Skeleton variant="rectangular" width="80%" height="24px" />
                        <Skeleton variant="rectangular" width="60%" height="16px" />
                      </Stack>
                      
                      <Stack spacing={8}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Complex Skeletons</h5>
                        <SkeletonCard />
                        <SkeletonTable rows={3} />
                      </Stack>
                    </Grid>
                  </div>

                  {/* Loading Controls */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Loading State Controls</h4>
                    <Grid cols={3} gap={4}>
                      <Button 
                        variant="outline" 
                        onClick={() => toggleLoading('skeleton')}
                        loading={loadingStates.skeleton}
                      >
                        {loadingStates.skeleton ? 'Loading...' : 'Trigger Loading'}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => toggleLoading('card')}
                      >
                        Toggle Card Skeleton
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => console.log('Skeleton demo')}
                      >
                        Demo All Skeletons
                      </Button>
                    </Grid>
                  </div>
                </Stack>
              </CardContent>
            </Card>

            {/* Layout Components Section */}
            <Card>
              <CardHeader>
                <CardTitle>Layout System - Grid, Stack, and Containers</CardTitle>
                <p style={{ color: tokens.colors.text.secondary, margin: '8px 0 0 0' }}>
                  Flexible layout components for responsive designs and organized content structure
                </p>
              </CardHeader>
              <CardContent>
                <Stack spacing={24}>
                  {/* Grid System */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Grid System</h4>
                    <Stack spacing={16}>
                      <div>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Auto-fit Grid</h5>
                        <Grid cols="auto-fit" gap={3} style={{ border: '1px dashed ' + tokens.colors.border.primary, padding: '16px', borderRadius: '8px' }}>
                          {[1,2,3,4,5,6].map(i => (
                            <div key={i} style={{ padding: '12px', backgroundColor: tokens.colors.bg.secondary, borderRadius: '6px', textAlign: 'center' }}>
                              Item {i}
                            </div>
                          ))}
                        </Grid>
                      </div>
                      
                      <div>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Fixed Column Grids</h5>
                        <Stack spacing={12}>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: tokens.colors.text.secondary }}>2 Columns:</span>
                            <Grid cols={2} gap={2} style={{ border: '1px dashed ' + tokens.colors.border.primary, padding: '12px', borderRadius: '6px', marginTop: '4px' }}>
                              {[1,2,3,4].map(i => (
                                <div key={i} style={{ padding: '8px', backgroundColor: tokens.colors.bg.secondary, borderRadius: '4px', textAlign: 'center', fontSize: '0.875rem' }}>
                                  Col {i}
                                </div>
                              ))}
                            </Grid>
                          </div>
                          
                          <div>
                            <span style={{ fontSize: '0.8rem', color: tokens.colors.text.secondary }}>4 Columns:</span>
                            <Grid cols={4} gap={2} style={{ border: '1px dashed ' + tokens.colors.border.primary, padding: '12px', borderRadius: '6px', marginTop: '4px' }}>
                              {[1,2,3,4,5,6,7,8].map(i => (
                                <div key={i} style={{ padding: '8px', backgroundColor: tokens.colors.bg.secondary, borderRadius: '4px', textAlign: 'center', fontSize: '0.875rem' }}>
                                  {i}
                                </div>
                              ))}
                            </Grid>
                          </div>
                        </Stack>
                      </div>
                    </Stack>
                  </div>

                  {/* Stack System */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Stack System</h4>
                    <Grid cols={3} gap={6}>
                      <div>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Vertical Stack (Small Spacing)</h5>
                        <Stack spacing={4} style={{ border: '1px dashed ' + tokens.colors.border.primary, padding: '12px', borderRadius: '6px' }}>
                          <div style={{ padding: '8px', backgroundColor: tokens.colors.bg.secondary, borderRadius: '4px' }}>Stack Item 1</div>
                          <div style={{ padding: '8px', backgroundColor: tokens.colors.bg.secondary, borderRadius: '4px' }}>Stack Item 2</div>
                          <div style={{ padding: '8px', backgroundColor: tokens.colors.bg.secondary, borderRadius: '4px' }}>Stack Item 3</div>
                        </Stack>
                      </div>
                      
                      <div>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Vertical Stack (Large Spacing)</h5>
                        <Stack spacing={16} style={{ border: '1px dashed ' + tokens.colors.border.primary, padding: '12px', borderRadius: '6px' }}>
                          <div style={{ padding: '8px', backgroundColor: tokens.colors.bg.secondary, borderRadius: '4px' }}>Stack Item 1</div>
                          <div style={{ padding: '8px', backgroundColor: tokens.colors.bg.secondary, borderRadius: '4px' }}>Stack Item 2</div>
                          <div style={{ padding: '8px', backgroundColor: tokens.colors.bg.secondary, borderRadius: '4px' }}>Stack Item 3</div>
                        </Stack>
                      </div>
                      
                      <div>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Flex Layout</h5>
                        <Flex gap={8} align="center" justify="between" style={{ border: '1px dashed ' + tokens.colors.border.primary, padding: '12px', borderRadius: '6px' }}>
                          <div style={{ padding: '8px', backgroundColor: tokens.colors.bg.secondary, borderRadius: '4px' }}>Left</div>
                          <div style={{ padding: '8px', backgroundColor: tokens.colors.bg.secondary, borderRadius: '4px' }}>Center</div>
                          <div style={{ padding: '8px', backgroundColor: tokens.colors.bg.secondary, borderRadius: '4px' }}>Right</div>
                        </Flex>
                      </div>
                    </Grid>
                  </div>

                  {/* Container Types */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Container Components</h4>
                    <Grid cols={2} gap={6}>
                      <Stack spacing={12}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Dashboard Container</h5>
                        <div style={{ border: '1px dashed ' + tokens.colors.border.primary, borderRadius: '6px', overflow: 'hidden' }}>
                          <DashboardContainer style={{ minHeight: '120px' }}>
                            <Card variant="dashboard" style={{ margin: '0' }}>
                              <CardContent>
                                <p>Dashboard-specific container with optimized spacing and layout for dashboard cards.</p>
                              </CardContent>
                            </Card>
                          </DashboardContainer>
                        </div>
                      </Stack>
                      
                      <Stack spacing={12}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Control Container</h5>
                        <div style={{ border: '1px dashed ' + tokens.colors.border.primary, borderRadius: '6px', overflow: 'hidden' }}>
                          <ControlContainer style={{ minHeight: '120px' }}>
                            <Card variant="cnc" style={{ margin: '0' }}>
                              <CardContent>
                                <p>Control-specific container optimized for CNC control interfaces and precision layouts.</p>
                              </CardContent>
                            </Card>
                          </ControlContainer>
                        </div>
                      </Stack>
                    </Grid>
                  </div>

                  {/* Accordion and Collapse */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Collapsible Components</h4>
                    <Grid cols={2} gap={6}>
                      <Stack spacing={12}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Accordion</h5>
                        <Accordion 
                          items={accordionItems}
                          defaultOpen={accordionOpen}
                          onOpenChange={setAccordionOpen}
                          multiple
                        />
                      </Stack>
                      
                      <Stack spacing={12}>
                        <h5 style={{ margin: '0 0 8px 0', color: tokens.colors.text.secondary, fontSize: '0.875rem' }}>Simple Collapse</h5>
                        <div>
                          <Button 
                            variant="outline" 
                            onClick={() => setCollapseOpen(!collapseOpen)}
                            style={{ marginBottom: '8px' }}
                          >
                            {collapseOpen ? 'Hide' : 'Show'} Advanced Settings
                          </Button>
                          <Collapse open={collapseOpen}>
                            <Card style={{ margin: '0' }}>
                              <CardContent>
                                <Stack spacing={8}>
                                  <FormField label="Advanced Parameter 1">
                                    <Input placeholder="Enter value..." />
                                  </FormField>
                                  <FormField label="Advanced Parameter 2">
                                    <Select options={selectOptions} placeholder="Select option..." />
                                  </FormField>
                                  <FormField label="Precision Setting">
                                    <Input
                                      type="number"
                                      value={1.234}
                                      onChange={(e) => console.log('Precision demo:', e.target.value)}
                                      placeholder="1.234"
                                      step="0.0001"
                                      min="0"
                                      max="10"
                                    />
                                  </FormField>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Collapse>
                        </div>
                      </Stack>
                    </Grid>
                  </div>

                  {/* Card Variants */}
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Card System Variants</h4>
                    <Grid cols={3} gap={4}>
                      <Card variant="default">
                        <CardHeader>
                          <CardTitle>Default Card</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p style={{ margin: '0', fontSize: '0.875rem', color: tokens.colors.text.secondary }}>
                            Standard card variant for general use cases.
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card variant="dashboard">
                        <CardHeader>
                          <CardTitle>Dashboard Card</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p style={{ margin: '0', fontSize: '0.875rem', color: tokens.colors.text.secondary }}>
                            Optimized styling for dashboard layouts.
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card variant="cnc">
                        <CardHeader>
                          <CardTitle>CNC Card</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p style={{ margin: '0', fontSize: '0.875rem', color: tokens.colors.text.secondary }}>
                            Industrial styling for CNC interfaces.
                          </p>
                        </CardContent>
                      </Card>
                      
                      <DashboardCard
                        title="Dashboard Card"
                        value="125.45"
                        unit="mm"
                        change="+2.3%"
                        trend="up"
                        icon={<div style={{ fontSize: '1.25rem' }}>📊</div>}
                      />
                      
                      <StatusCard
                        title="Machine Status"
                        status={isConnected ? "operational" : "offline"}
                        description={isConnected ? "All systems running normally" : "Connection lost"}
                      />
                      
                      <Card>
                        <CardHeader>
                          <CardIcon>⚙️</CardIcon>
                          <CardTitle>Status Card</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardValue>{isConnected ? "Online" : "Offline"}</CardValue>
                          <CardChange>
                            {isConnected ? "+100%" : "Disconnected"}
                          </CardChange>
                        </CardContent>
                        <CardFooter>
                          <CardActions>
                            <Button size="sm" variant="outline">Details</Button>
                          </CardActions>
                        </CardFooter>
                      </Card>
                    </Grid>
                  </div>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
          </div>
        )}

        {activeTab === 'cnc' && (
          <div>
          <Stack spacing={24}>
            {/* CNC Status Components */}
            <Card>
              <CardHeader>
                <CardTitle>CNC Status Components</CardTitle>
              </CardHeader>
              <CardContent>
                <Grid cols={2} gap={6}>
                  <Stack spacing={12}>
                    <ConnectionStatus 
                      isConnected={isConnected}
                      onToggle={() => setIsConnected(!isConnected)}
                    />
                    
                    <StatusIndicatorCard
                      title="Machine Status"
                      status={isConnected ? "connected" : "disconnected"}
                      value={isConnected ? "Ready" : "Offline"}
                    />
                  </Stack>
                  
                  <CoordinateDisplay
                    position={{
                      x: Math.abs(position.x),
                      y: Math.abs(position.y), 
                      z: Math.abs(position.z)
                    }}
                    unit="mm"
                    precision={3}
                    variant="detailed"
                  />
                </Grid>
              </CardContent>
            </Card>

            {/* CNC Controls */}
            <Card>
              <CardHeader>
                <CardTitle>CNC Control Components</CardTitle>
              </CardHeader>
              <CardContent>
                <Grid cols={2} gap={6}>
                  <JogControls
                    onJog={handleJog}
                    jogDistance={jogDistance}
                    onJogDistanceChange={setJogDistance}
                    isConnected={isConnected}
                    availableIncrements={[0.1, 1, 10, 100]}
                  />
                  
                  <SafetyControlPanel
                    isConnected={isConnected}
                    onEmergencyStop={() => console.log('Emergency stop!')}
                    onHomeAll={() => setPosition({ x: 0, y: 0, z: 0 })}
                    onResetAlarms={() => console.log('Reset alarms')}
                  />
                </Grid>
              </CardContent>
            </Card>

            {/* Status Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle>Status Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusDashboard
                  machineStatus={{
                    isConnected,
                    state: isConnected ? 'idle' : 'disconnected',
                    position,
                    feedRate: 1000,
                    spindleSpeed: 0,
                    coolant: false
                  }}
                />
              </CardContent>
            </Card>
          </Stack>
          </div>
        )}

        {activeTab === 'examples' && (
          <div>
          <Stack spacing={24}>
            {/* 3D Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>3D Working Area Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <WorkingAreaPreview
                  currentPosition={position}
                  workArea={workArea}
                  showGrid={true}
                />
              </CardContent>
            </Card>

            {/* 2D Machine Display */}
            <Card>
              <CardHeader>
                <CardTitle>2D Machine Display</CardTitle>
              </CardHeader>
              <CardContent>
                <MachineDisplay2D
                  currentPosition={position}
                  workArea={workArea}
                  showGrid={true}
                  showTrail={false}
                  onSetOrigin={() => console.log('Set origin')}
                  onGoHome={() => setPosition({ x: 0, y: 0, z: 0 })}
                />
              </CardContent>
            </Card>

            {/* Real-world Example: Control Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Control Panel Example</CardTitle>
              </CardHeader>
              <CardContent>
                <Grid cols={3} gap={4}>
                  <Card variant="cnc">
                    <CardHeader>
                      <CardTitle>Position</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CompactCoordinateDisplay
                        position={{
                          x: Math.abs(position.x),
                          y: Math.abs(position.y), 
                          z: Math.abs(position.z)
                        }}
                        unit="mm"
                        precision={3}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card variant="cnc">
                    <CardHeader>
                      <CardTitle>Jog Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Stack spacing={8}>
                        <FormField label="Distance">
                          <Select
                            value={jogDistance.toString()}
                            onChange={(value) => setJogDistance(parseFloat(value))}
                            options={[
                              { value: '0.1', label: '0.1 mm' },
                              { value: '1', label: '1 mm' },
                              { value: '10', label: '10 mm' },
                              { value: '100', label: '100 mm' }
                            ]}
                          />
                        </FormField>
                      </Stack>
                    </CardContent>
                  </Card>
                  
                  <Card variant="cnc">
                    <CardHeader>
                      <CardTitle>Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Stack spacing={8}>
                        <Badge variant={isConnected ? "success" : "destructive"}>
                          {isConnected ? "Connected" : "Disconnected"}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsConnected(!isConnected)}
                        >
                          Toggle Connection
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
          </div>
        )}

        {activeTab === 'tokens' && (
          <div>
          <Stack spacing={24}>
            {/* Color Tokens */}
            <Card>
              <CardHeader>
                <CardTitle>Design Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <Grid cols={2} gap={8}>
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Colors</h4>
                    <Grid cols={4} gap={2}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          backgroundColor: tokens.colors.primary.main,
                          borderRadius: tokens.radius.md,
                          margin: '0 auto 8px'
                        }} />
                        <MonospaceText size="sm">Primary</MonospaceText>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          backgroundColor: tokens.colors.status.success,
                          borderRadius: tokens.radius.md,
                          margin: '0 auto 8px'
                        }} />
                        <MonospaceText size="sm">Success</MonospaceText>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          backgroundColor: tokens.colors.status.warning,
                          borderRadius: tokens.radius.md,
                          margin: '0 auto 8px'
                        }} />
                        <MonospaceText size="sm">Warning</MonospaceText>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          backgroundColor: tokens.colors.status.error,
                          borderRadius: tokens.radius.md,
                          margin: '0 auto 8px'
                        }} />
                        <MonospaceText size="sm">Error</MonospaceText>
                      </div>
                    </Grid>
                  </div>
                  
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', color: tokens.colors.text.primary }}>Spacing Scale</h4>
                    <Stack spacing={8}>
                      {Object.entries(tokens.spacing).map(([key, value]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <MonospaceText size="sm" style={{ minWidth: '40px' }}>{key}:</MonospaceText>
                          <div style={{ 
                            width: value, 
                            height: '16px', 
                            backgroundColor: tokens.colors.primary.main,
                            borderRadius: '2px'
                          }} />
                          <MonospaceText size="sm" style={{ color: tokens.colors.text.secondary }}>
                            {value}
                          </MonospaceText>
                        </div>
                      ))}
                    </Stack>
                  </div>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
          </div>
        )}
      </div>
    </DashboardContainer>
  );
};

export default UILibraryView;