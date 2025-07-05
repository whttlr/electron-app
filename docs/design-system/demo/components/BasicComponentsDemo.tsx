import React from 'react';
import {
  Grid,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  StatusBadge,
  AnimatedCard,
} from '../../../ui/shared';

interface BasicComponentsDemoProps {
  basicButtonsRef?: React.RefObject<HTMLDivElement>;
  statusBadgesRef?: React.RefObject<HTMLDivElement>;
}

export const BasicComponentsDemo: React.FC<BasicComponentsDemoProps> = ({
  basicButtonsRef,
  statusBadgesRef,
}) => {
  return (
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
  );
};