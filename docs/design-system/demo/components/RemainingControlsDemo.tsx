import React from 'react';
import {
  Grid,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  AnimatedCard,
  Button,
} from '../../../ui/shared';
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
} from '../../../ui/controls';
import { Position } from '../types';
import { Power, Sidebar, BarChart3, HelpCircle } from 'lucide-react';

interface RemainingControlsDemoProps {
  jogControlsRef?: React.RefObject<HTMLDivElement>;
  coordinateDisplayRef?: React.RefObject<HTMLDivElement>;
  position: Position;
  jogSpeed: number;
  jogDistance: number;
  continuous: boolean;
  isConnected: boolean;
  machineStatus: 'connected' | 'disconnected' | 'idle' | 'running' | 'error' | 'warning';
  isEmergencyStopped: boolean;
  setShowSidebar: (show: boolean) => void;
  handleJog: (axis: 'X' | 'Y' | 'Z', direction: number) => void;
  handleZero: (axis?: 'X' | 'Y' | 'Z') => void;
  setJogSpeed: (speed: number) => void;
  setJogDistance: (distance: number) => void;
  setContinuous: (continuous: boolean) => void;
  setIsEmergencyStopped: (stopped: boolean) => void;
}

export const RemainingControlsDemo: React.FC<RemainingControlsDemoProps> = ({
  jogControlsRef,
  coordinateDisplayRef,
  position,
  jogSpeed,
  jogDistance,
  continuous,
  isConnected,
  machineStatus,
  isEmergencyStopped,
  setShowSidebar,
  handleJog,
  handleZero,
  setJogSpeed,
  setJogDistance,
  setContinuous,
  setIsEmergencyStopped,
}) => {
  return (
    <>
      {/* CNC Control Components */}
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

      {/* Position & Status Display */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-6 heading">Position & Status Display</h2>
        <Grid cols={2} gap="lg">
          <AnimatedCard ref={coordinateDisplayRef}>
            <Card>
              <CardHeader>
                <CardTitle>Coordinate Display</CardTitle>
              </CardHeader>
              <CardContent>
                <CoordinateDisplay position={position} />
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle>Compact Display</CardTitle>
              </CardHeader>
              <CardContent>
                <CompactCoordinateDisplay position={position} />
              </CardContent>
            </Card>
          </AnimatedCard>
        </Grid>
      </section>

      {/* Status & Safety */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-6 heading">Status & Safety</h2>
        <Grid cols={2} gap="lg">
          <AnimatedCard>
            <Card>
              <CardHeader>
                <CardTitle>Status Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatusIndicator 
                  label="Machine" 
                  status={machineStatus} 
                />
                <ConnectionStatus 
                  isConnected={isConnected}
                  port="USB"
                  baudRate={115200}
                />
                <StatusDashboard 
                  machineStatus={machineStatus}
                  position={position}
                  isConnected={isConnected}
                />
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle>Safety Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <SafetyControlPanel
                  isEmergencyStopped={isEmergencyStopped}
                  onEmergencyStop={() => setIsEmergencyStopped(!isEmergencyStopped)}
                  onReset={() => setIsEmergencyStopped(false)}
                  onHome={() => handleZero()}
                />
              </CardContent>
            </Card>
          </AnimatedCard>
        </Grid>
      </section>

      {/* Interactive Components */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
          Interactive Components
        </h2>
        <Grid cols={2} gap="lg">
          <AnimatedCard>
            <Card>
              <CardHeader>
                <CardTitle>System Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="cnc" className="w-full flex items-center gap-2">
                  <Power className="w-4 h-4" />
                  Power Controls
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={() => setShowSidebar(true)}
                >
                  <Sidebar className="w-4 h-4" />
                  Show Sidebar
                </Button>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="secondary" className="w-full flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </Button>
                <Button variant="ghost" className="w-full flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Help & Support
                </Button>
              </CardContent>
            </Card>
          </AnimatedCard>
        </Grid>
      </section>
    </>
  );
};