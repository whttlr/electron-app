import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  StatusBadge,
  Input,
  Badge,
} from '../../../ui/shared';
import { Popover, Divider, Tooltip } from 'antd';
import {
  Info,
  Settings,
  CheckCircle,
  Activity,
  AlertTriangle,
  Tool,
  Shield,
  Zap,
  MapPin,
} from 'lucide-react';

export const PopoverTooltipsDemo: React.FC = () => {
  const popoverRef = React.useRef(null);
  const tooltipRef = React.useRef(null);

  return (
    <>
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
    </>
  );
};