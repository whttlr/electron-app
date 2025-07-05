import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from '../../../ui/shared';
import { notification } from 'antd';
import {
  Info,
  CheckCircle,
  AlertTriangle,
  Tool,
  Upload,
  Power,
  Wifi,
  Clock,
  Download,
} from 'lucide-react';

export const NotificationsDemo: React.FC = () => {
  const notificationRef = React.useRef(null);

  // Notification helper functions
  const showBasicNotification = (type: 'info' | 'success' | 'warning' | 'error') => {
    const messages = {
      info: { message: 'Information', description: 'This is an informational message.' },
      success: { message: 'Success', description: 'Operation completed successfully!' },
      warning: { message: 'Warning', description: 'Please check your settings.' },
      error: { message: 'Error', description: 'Something went wrong. Please try again.' }
    };
    
    notification[type](messages[type]);
  };

  const showProgressNotification = () => {
    const key = 'updatable';
    notification.open({
      key,
      message: 'Uploading G-code',
      description: 'Uploading part_bracket.gcode...',
      duration: 0,
    });
    
    setTimeout(() => {
      notification.open({
        key,
        message: 'Upload Complete',
        description: 'G-code file uploaded successfully!',
        duration: 2,
      });
    }, 2000);
  };

  const showCNCNotification = (type: string) => {
    const notifications = {
      jobComplete: {
        type: 'success',
        message: 'Job Completed',
        description: 'CNC job "part_bracket.gcode" has finished successfully. Quality check passed.',
      },
      toolChange: {
        type: 'warning',
        message: 'Tool Change Required',
        description: 'Please insert Tool #5 (6.35mm End Mill) and press continue.',
        duration: 0,
      },
      emergency: {
        type: 'error',
        message: 'Emergency Stop Activated',
        description: 'Machine stopped due to safety protocol. Check machine status before resuming.',
        duration: 0,
      },
      connection: {
        type: 'info',
        message: 'Connection Status',
        description: 'Successfully connected to CNC-001 via USB.',
      },
      maintenance: {
        type: 'warning',
        message: 'Maintenance Required',
        description: 'Scheduled maintenance is due. Please service the machine.',
      },
      update: {
        type: 'info',
        message: 'Software Update Available',
        description: 'Version 2.1.0 is available with improved safety features.',
      }
    };

    const notif = notifications[type as keyof typeof notifications];
    if (notif) {
      (notification as any)[notif.type]({
        message: notif.message,
        description: notif.description,
        duration: notif.duration || 4.5,
      });
    }
  };

  return (
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
  );
};