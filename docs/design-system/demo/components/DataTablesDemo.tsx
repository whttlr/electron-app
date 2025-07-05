import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  StatusBadge,
} from '../../../ui/shared';

export const DataTablesDemo: React.FC = () => {
  return (
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
  );
};