import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from '../../../ui/shared';
import { Progress } from 'antd';

export const ProgressDemo: React.FC = () => {
  const progressRef = React.useRef(null);

  return (
    <section>
      <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
        Progress Indicators
      </h2>
      <div className="space-y-6">
        {/* Basic Progress */}
        <Card ref={progressRef}>
          <CardHeader>
            <CardTitle>Basic Progress Bars</CardTitle>
            <p className="text-sm text-muted-foreground">Standard progress indicators with different styles and colors</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Linear Progress */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Linear Progress</h4>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Default Progress</div>
                    <Progress percent={67} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Success Progress</div>
                    <Progress percent={100} status="success" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Error Progress</div>
                    <Progress percent={45} status="exception" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Active Progress</div>
                    <Progress percent={78} status="active" />
                  </div>
                </div>
              </div>

              {/* Progress with Text */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Progress with Custom Text</h4>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Percentage Display</div>
                    <Progress percent={67} showInfo={true} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Custom Format</div>
                    <Progress 
                      percent={67} 
                      format={(percent) => `${percent}% Complete`}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Without Text</div>
                    <Progress percent={89} showInfo={false} />
                  </div>
                </div>
              </div>

              {/* Colored Progress */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Colored Progress Bars</h4>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Blue (Default)</div>
                    <Progress percent={67} strokeColor="#2563eb" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Green</div>
                    <Progress percent={45} strokeColor="#16a34a" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Purple (Primary)</div>
                    <Progress percent={89} strokeColor="var(--color-primary)" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Gradient</div>
                    <Progress 
                      percent={78} 
                      strokeColor={{
                        from: '#a855f7',
                        to: '#c084fc',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CNC-Specific Progress */}
        <Card>
          <CardHeader>
            <CardTitle>CNC Operation Progress</CardTitle>
            <p className="text-sm text-muted-foreground">Progress indicators for CNC machine operations and jobs</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Job Progress */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Job Execution</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Current Job: part_bracket.gcode</span>
                      <span className="text-xs text-muted-foreground">67% Complete</span>
                    </div>
                    <Progress 
                      percent={67} 
                      strokeColor={{
                        from: '#2563eb',
                        to: '#1d4ed8',
                      }}
                      trailColor="rgba(255,255,255,0.1)"
                      size="default"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Elapsed: 24m 15s</span>
                      <span>Remaining: 12m 30s</span>
                    </div>
                  </div>

                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Homing Sequence</span>
                      <span className="text-xs text-green-400">Complete</span>
                    </div>
                    <Progress 
                      percent={100} 
                      status="success"
                      strokeColor="#16a34a"
                      trailColor="rgba(255,255,255,0.1)"
                      size="small"
                    />
                    <div className="text-xs text-muted-foreground mt-2">
                      All axes successfully homed
                    </div>
                  </div>

                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Tool Change Operation</span>
                      <span className="text-xs text-red-400">Failed</span>
                    </div>
                    <Progress 
                      percent={45} 
                      status="exception"
                      strokeColor="#dc2626"
                      trailColor="rgba(255,255,255,0.1)"
                      size="small"
                    />
                    <div className="text-xs text-muted-foreground mt-2">
                      Tool sensor timeout - Manual intervention required
                    </div>
                  </div>
                </div>
              </div>

              {/* Machine Status Progress */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Machine Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Spindle Speed</span>
                        <span className="text-foreground">12,000 / 15,000 RPM</span>
                      </div>
                      <Progress 
                        percent={80} 
                        showInfo={false}
                        strokeColor="#a855f7"
                        trailColor="rgba(255,255,255,0.1)"
                        size="small"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Feed Rate</span>
                        <span className="text-foreground">2,500 / 4,000 mm/min</span>
                      </div>
                      <Progress 
                        percent={62} 
                        showInfo={false}
                        strokeColor="#2563eb"
                        trailColor="rgba(255,255,255,0.1)"
                        size="small"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Memory Usage</span>
                        <span className="text-foreground">456 / 512 MB</span>
                      </div>
                      <Progress 
                        percent={89} 
                        showInfo={false}
                        strokeColor="#ea580c"
                        trailColor="rgba(255,255,255,0.1)"
                        size="small"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Tool Life</span>
                        <span className="text-foreground">67% Remaining</span>
                      </div>
                      <Progress 
                        percent={67} 
                        showInfo={false}
                        strokeColor="#16a34a"
                        trailColor="rgba(255,255,255,0.1)"
                        size="small"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Coolant Level</span>
                        <span className="text-foreground">Low</span>
                      </div>
                      <Progress 
                        percent={23} 
                        showInfo={false}
                        strokeColor="#dc2626"
                        trailColor="rgba(255,255,255,0.1)"
                        size="small"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Temperature</span>
                        <span className="text-foreground">45.5°C</span>
                      </div>
                      <Progress 
                        percent={45} 
                        showInfo={false}
                        strokeColor="#facc15"
                        trailColor="rgba(255,255,255,0.1)"
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Circular Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Circular Progress Indicators</CardTitle>
            <p className="text-sm text-muted-foreground">Circular progress bars for space-efficient status display</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Circular */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Basic Circular Progress</h4>
                <div className="flex gap-6 flex-wrap">
                  <div className="text-center">
                    <Progress type="circle" percent={67} />
                    <div className="text-xs text-muted-foreground mt-2">Default</div>
                  </div>
                  <div className="text-center">
                    <Progress type="circle" percent={100} status="success" />
                    <div className="text-xs text-muted-foreground mt-2">Success</div>
                  </div>
                  <div className="text-center">
                    <Progress type="circle" percent={45} status="exception" />
                    <div className="text-xs text-muted-foreground mt-2">Error</div>
                  </div>
                  <div className="text-center">
                    <Progress 
                      type="circle" 
                      percent={89} 
                      strokeColor="var(--color-primary)"
                    />
                    <div className="text-xs text-muted-foreground mt-2">Custom Color</div>
                  </div>
                </div>
              </div>

              {/* Small Circular */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Small Circular Progress</h4>
                <div className="flex gap-4 flex-wrap">
                  <div className="text-center">
                    <Progress type="circle" percent={67} size={60} />
                    <div className="text-xs text-muted-foreground mt-1">Job 1</div>
                  </div>
                  <div className="text-center">
                    <Progress type="circle" percent={34} size={60} strokeColor="#16a34a" />
                    <div className="text-xs text-muted-foreground mt-1">Job 2</div>
                  </div>
                  <div className="text-center">
                    <Progress type="circle" percent={89} size={60} strokeColor="#ea580c" />
                    <div className="text-xs text-muted-foreground mt-1">Job 3</div>
                  </div>
                  <div className="text-center">
                    <Progress type="circle" percent={100} size={60} status="success" />
                    <div className="text-xs text-muted-foreground mt-1">Job 4</div>
                  </div>
                </div>
              </div>

              {/* Custom Format Circular */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Custom Format Circular</h4>
                <div className="flex gap-6 flex-wrap">
                  <div className="text-center">
                    <Progress 
                      type="circle" 
                      percent={67} 
                      format={(percent) => `${percent}%`}
                      strokeColor={{
                        '0%': '#a855f7',
                        '100%': '#c084fc',
                      }}
                    />
                    <div className="text-xs text-muted-foreground mt-2">Gradient</div>
                  </div>
                  <div className="text-center">
                    <Progress 
                      type="circle" 
                      percent={78} 
                      format={() => '78°C'}
                      strokeColor="#facc15"
                    />
                    <div className="text-xs text-muted-foreground mt-2">Temperature</div>
                  </div>
                  <div className="text-center">
                    <Progress 
                      type="circle" 
                      percent={45} 
                      format={() => '12m'}
                      strokeColor="#2563eb"
                    />
                    <div className="text-xs text-muted-foreground mt-2">Time Remaining</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Style Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Progress</CardTitle>
            <p className="text-sm text-muted-foreground">Dashboard-style progress indicators with multiple metrics</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Overall Progress Card */}
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-blue-300">Overall Progress</h4>
                  <Badge variant="info">67%</Badge>
                </div>
                <Progress 
                  percent={67} 
                  strokeColor={{
                    from: '#2563eb',
                    to: '#1d4ed8',
                  }}
                  trailColor="rgba(37, 99, 235, 0.1)"
                  size="default"
                  showInfo={false}
                />
                <div className="text-xs text-blue-200 mt-2">
                  Current job is 67% complete
                </div>
              </div>

              {/* Efficiency Card */}
              <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-green-300">Efficiency</h4>
                  <Badge variant="success">89%</Badge>
                </div>
                <Progress 
                  percent={89} 
                  strokeColor={{
                    from: '#16a34a',
                    to: '#15803d',
                  }}
                  trailColor="rgba(22, 163, 74, 0.1)"
                  size="default"
                  showInfo={false}
                />
                <div className="text-xs text-green-200 mt-2">
                  Above target efficiency
                </div>
              </div>

              {/* Quality Card */}
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-purple-300">Quality Score</h4>
                  <Badge variant="secondary">94%</Badge>
                </div>
                <Progress 
                  percent={94} 
                  strokeColor={{
                    from: '#a855f7',
                    to: '#9333ea',
                  }}
                  trailColor="rgba(168, 85, 247, 0.1)"
                  size="default"
                  showInfo={false}
                />
                <div className="text-xs text-purple-200 mt-2">
                  Excellent quality maintained
                </div>
              </div>

              {/* Machine Health */}
              <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-amber-300">Machine Health</h4>
                  <Badge variant="warning">76%</Badge>
                </div>
                <Progress 
                  percent={76} 
                  strokeColor={{
                    from: '#f59e0b',
                    to: '#d97706',
                  }}
                  trailColor="rgba(245, 158, 11, 0.1)"
                  size="default"
                  showInfo={false}
                />
                <div className="text-xs text-amber-200 mt-2">
                  Maintenance suggested soon
                </div>
              </div>

              {/* Utilization */}
              <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-cyan-300">Utilization</h4>
                  <Badge variant="info">82%</Badge>
                </div>
                <Progress 
                  percent={82} 
                  strokeColor={{
                    from: '#06b6d4',
                    to: '#0891b2',
                  }}
                  trailColor="rgba(6, 182, 212, 0.1)"
                  size="default"
                  showInfo={false}
                />
                <div className="text-xs text-cyan-200 mt-2">
                  Good resource utilization
                </div>
              </div>

              {/* Productivity */}
              <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-emerald-300">Productivity</h4>
                  <Badge variant="success">91%</Badge>
                </div>
                <Progress 
                  percent={91} 
                  strokeColor={{
                    from: '#10b981',
                    to: '#059669',
                  }}
                  trailColor="rgba(16, 185, 129, 0.1)"
                  size="default"
                  showInfo={false}
                />
                <div className="text-xs text-emerald-200 mt-2">
                  High productivity achieved
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};