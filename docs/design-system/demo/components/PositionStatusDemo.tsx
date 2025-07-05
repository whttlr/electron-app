import React from 'react';
import {
  Grid,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  AnimatedCard,
} from '../../../ui/shared';
import {
  CoordinateDisplay,
  CompactCoordinateDisplay,
  StatusIndicator,
  ConnectionStatus,
  StatusDashboard,
} from '../../../ui/controls';
import { Position, MachineStatus } from '../types';

interface PositionStatusDemoProps {
  coordinateDisplayRef?: React.RefObject<HTMLDivElement>;
  position: Position;
  isConnected: boolean;
  machineStatus: MachineStatus;
  handleZero: (axis?: 'X' | 'Y' | 'Z') => void;
}

export const PositionStatusDemo: React.FC<PositionStatusDemoProps> = ({
  coordinateDisplayRef,
  position,
  isConnected,
  machineStatus,
  handleZero,
}) => {
  return (
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
              <div className="grid grid-cols-2 gap-4">
                <StatusIndicator 
                  status={isConnected ? 'connected' : 'disconnected'}
                  label="Connection"
                />
                <StatusIndicator 
                  status={machineStatus}
                  label="Machine"
                />
              </div>
              <ConnectionStatus 
                isConnected={isConnected}
                portName="/dev/ttyUSB0"
                baudRate={115200}
                lastActivity="2s ago"
              />
            </CardContent>
          </Card>
        </AnimatedCard>
      </Grid>
    </section>
  );
};