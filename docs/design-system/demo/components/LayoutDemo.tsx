import React from 'react';
import {
  Grid,
  DashboardGrid,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  DashboardCard,
  AnimatedCard,
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

export const LayoutDemo: React.FC = () => {
  return (
    <>
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
        <DashboardGrid cols={4} className="gap-3" style={{gap: '12px'}}>
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
    </>
  );
};