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
  JogControls,
  JogSpeedControl,
  JogDistanceControl,
} from '../../../ui/controls';
import { Position } from '../types';

interface CNCControlsDemoProps {
  jogControlsRef?: React.RefObject<HTMLDivElement>;
  position: Position;
  jogSpeed: number;
  jogDistance: number;
  continuous: boolean;
  isEmergencyStopped: boolean;
  handleJog: (axis: 'X' | 'Y' | 'Z', direction: number) => void;
  handleZero: (axis?: 'X' | 'Y' | 'Z') => void;
  setJogSpeed: (speed: number) => void;
  setJogDistance: (distance: number) => void;
  setContinuous: (continuous: boolean) => void;
}

export const CNCControlsDemo: React.FC<CNCControlsDemoProps> = ({
  jogControlsRef,
  position,
  jogSpeed,
  jogDistance,
  continuous,
  isEmergencyStopped,
  handleJog,
  handleZero,
  setJogSpeed,
  setJogDistance,
  setContinuous,
}) => {
  return (
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
  );
};