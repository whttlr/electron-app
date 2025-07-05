import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Alert,
  AlertBanner,
} from '../../../ui/shared';
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

export const AlertsDemo: React.FC = () => {
  const [showAlert, setShowAlert] = useState(true);
  const [alertType, setAlertType] = useState<'info' | 'success' | 'warning' | 'error'>('info');

  return (
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
  );
};