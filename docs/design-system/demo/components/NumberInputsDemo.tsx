import React from 'react';
import { InputNumber } from 'antd';
import {
  Grid,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CoordinateInput,
  PrecisionInput,
  AnimatedCard,
} from '../../../ui/shared';

export const NumberInputsDemo: React.FC = () => {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
        Number Inputs
      </h2>
      <Grid cols={2} gap="lg">
        <AnimatedCard>
          <Card>
            <CardHeader>
              <CardTitle>Standard Number Inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Basic InputNumber</h4>
                <InputNumber
                  min={0}
                  max={100}
                  defaultValue={50}
                  className="w-full"
                  placeholder="Enter a number"
                />
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">With Step Controls</h4>
                <InputNumber
                  min={0}
                  max={1000}
                  step={10}
                  defaultValue={100}
                  className="w-full"
                />
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Currency Format</h4>
                <InputNumber
                  min={0}
                  max={100000}
                  defaultValue={1234.56}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  className="w-full"
                />
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Percentage</h4>
                <InputNumber
                  min={0}
                  max={100}
                  defaultValue={25}
                  formatter={(value) => `${value}%`}
                  parser={(value) => value!.replace('%', '')}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>CNC-Specific Inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Coordinate Input</h4>
                <div className="flex gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">X</label>
                    <CoordinateInput
                      defaultValue={125.750}
                      min={-1000}
                      max={1000}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Y</label>
                    <CoordinateInput
                      defaultValue={89.250}
                      min={-1000}
                      max={1000}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Z</label>
                    <CoordinateInput
                      defaultValue={15.000}
                      min={-1000}
                      max={1000}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Precision Input (3 decimals)</h4>
                <PrecisionInput
                  defaultValue={3.142}
                  min={0}
                  max={10}
                  precision={3}
                />
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">High Precision (5 decimals)</h4>
                <PrecisionInput
                  defaultValue={0.12345}
                  min={0}
                  max={1}
                  precision={5}
                />
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Feed Rate (mm/min)</h4>
                <InputNumber
                  min={1}
                  max={10000}
                  step={100}
                  defaultValue={2500}
                  formatter={(value) => `${value} mm/min`}
                  parser={(value) => value!.replace(' mm/min', '')}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </Grid>
    </section>
  );
};