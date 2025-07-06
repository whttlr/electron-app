import React, { useState } from 'react';
import {
  Card, Button, Space, Input, Upload, Progress, Alert, message,
} from 'antd';
import {
  PlayCircleOutlined, PauseCircleOutlined, StopOutlined, UploadOutlined,
} from '@ant-design/icons';
import { useJobTracking } from '../job-tracking/useJobTracking';
import { useMachineConfig } from '../machine-config/useMachineConfig';

/**
 * Example component showing how to integrate job tracking with G-code execution
 * This demonstrates the pattern for starting jobs and tracking progress
 */
export const GcodeExecutionExample: React.FC = () => {
  const {
    startJob, currentJob, pauseJob, resumeJob, completeJob, updateProgress, logPosition,
  } = useJobTracking();
  const { activeConfiguration } = useMachineConfig();

  const [jobName, setJobName] = useState('');
  const [gcodeFile, setGcodeFile] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Example function to start a CNC job
  const handleStartJob = async () => {
    if (!jobName.trim()) {
      message.error('Please enter a job name');
      return;
    }

    if (!activeConfiguration) {
      message.error('No active machine configuration found');
      return;
    }

    try {
      // Start the job in the database
      await startJob({
        job_name: jobName,
        gcode_file: gcodeFile || undefined,
        machine_config_id: activeConfiguration.id,
      });

      // Start the "execution" simulation
      setIsExecuting(true);
      simulateGcodeExecution();

      message.success('Job started successfully');
    } catch (error) {
      message.error('Failed to start job');
    }
  };

  // Example function to simulate G-code execution with progress updates
  const simulateGcodeExecution = () => {
    let progress = 0;
    let x = 0; let y = 0; let
      z = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 10;

      // Simulate machine movement
      x += (Math.random() - 0.5) * 10;
      y += (Math.random() - 0.5) * 10;
      z += (Math.random() - 0.5) * 2;

      // Update progress and log position
      updateProgress(Math.min(progress, 100));
      logPosition(x, y, z);

      // Complete when we reach 100%
      if (progress >= 100) {
        clearInterval(interval);
        setIsExecuting(false);
        completeJob('completed');
        message.success('Job completed successfully!');
      }
    }, 500); // Update every 500ms

    // Store interval so we can clear it if needed
    return interval;
  };

  const handleFileUpload = (file: File) => {
    setGcodeFile(file.name);
    return false; // Prevent auto upload
  };

  return (
    <Card title="G-code Execution Example" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        {!currentJob ? (
          // Job setup form
          <div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                placeholder="Enter job name (e.g., Logo Engraving)"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                style={{ marginBottom: 8 }}
              />

              <Upload
                beforeUpload={handleFileUpload}
                accept=".gcode,.nc"
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>
                  Select G-code File (Optional)
                </Button>
              </Upload>

              {gcodeFile && (
                <Alert
                  message={`Selected file: ${gcodeFile}`}
                  type="info"
                  style={{ marginTop: 8 }}
                />
              )}

              {activeConfiguration ? (
                <Alert
                  message={`Active Machine: ${activeConfiguration.name}`}
                  type="success"
                  style={{ marginTop: 8 }}
                />
              ) : (
                <Alert
                  message="No active machine configuration"
                  description="Please configure a machine first"
                  type="warning"
                  style={{ marginTop: 8 }}
                />
              )}

              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleStartJob}
                disabled={!activeConfiguration || !jobName.trim()}
                style={{ marginTop: 8 }}
              >
                Start Job
              </Button>
            </Space>
          </div>
        ) : (
          // Job execution controls
          <div>
            <Alert
              message={`Executing: ${currentJob.job_name}`}
              description={`Status: ${currentJob.status} | Machine: ${activeConfiguration?.name}`}
              type="info"
              style={{ marginBottom: 16 }}
            />

            <Progress
              percent={currentJob.progress || 0}
              status={currentJob.status === 'failed' ? 'exception' : 'active'}
              style={{ marginBottom: 16 }}
            />

            <Space>
              {currentJob.status === 'running' && (
                <Button
                  icon={<PauseCircleOutlined />}
                  onClick={pauseJob}
                  disabled={!isExecuting}
                >
                  Pause
                </Button>
              )}

              {currentJob.status === 'paused' && (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={resumeJob}
                >
                  Resume
                </Button>
              )}

              <Button
                danger
                icon={<StopOutlined />}
                onClick={() => completeJob('cancelled')}
              >
                Cancel
              </Button>
            </Space>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default GcodeExecutionExample;
