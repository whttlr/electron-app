import React, { useState } from 'react';
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

            {/* Component Sections */}
            <StaggerChildren className="space-y-12">
              {/* Basic Components */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
                  Basic Components
                </h2>
                <Grid cols={2} gap="lg">
                  <AnimatedCard>
                    <Card className="bg-card border-border">
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
                    <Card className="bg-card border-border">
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

              {/* CNC Controls */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 heading">CNC Control Components</h2>
                <Grid cols={2} gap="lg">
                  <AnimatedCard>
                    <Card>
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
                  <AnimatedCard>
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
                          <StatusIndicator status="connected" />
                          <StatusIndicator status="idle" />
                          <StatusIndicator status="running" />
                          <StatusIndicator status="error" />
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

                  <AnimatedCard delay={0.1}>
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
