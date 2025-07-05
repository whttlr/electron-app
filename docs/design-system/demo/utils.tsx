import React from 'react';
import { notification } from 'antd';
import { Button } from '../../ui/shared';
import {
  CheckCircle,
  Tool,
  AlertTriangle,
  Wifi,
  Clock,
  Download,
  Upload,
  Activity,
} from 'lucide-react';

// Notification handlers
export const showBasicNotification = (type: 'info' | 'success' | 'warning' | 'error') => {
  const messages = {
    info: { message: 'Information', description: 'This is a basic information notification.' },
    success: { message: 'Success', description: 'Operation completed successfully!' },
    warning: { message: 'Warning', description: 'Please check your settings and try again.' },
    error: { message: 'Error', description: 'An error occurred while processing your request.' }
  };
  
  notification[type](messages[type]);
};

export const showCNCNotification = (type: string) => {
  switch (type) {
    case 'jobComplete':
      notification.success({
        message: 'Job Completed',
        description: 'CNC job "part_bracket.gcode" has finished successfully. Quality check passed.',
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        duration: 6,
      });
      break;
    case 'toolChange':
      notification.warning({
        message: 'Tool Change Required',
        description: 'Please insert Tool #5 (6.35mm End Mill) and press continue.',
        icon: <Tool className="w-5 h-5 text-amber-500" />,
        duration: 0, // Don't auto-close
      });
      break;
    case 'emergency':
      notification.error({
        message: 'Emergency Stop Activated',
        description: 'Machine stopped due to safety protocol. Check machine status before resuming.',
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        duration: 0, // Don't auto-close
      });
      break;
    case 'connection':
      notification.info({
        message: 'Connection Restored',
        description: 'Successfully reconnected to CNC machine at /dev/ttyUSB0',
        icon: <Wifi className="w-5 h-5 text-blue-500" />,
      });
      break;
    case 'maintenance':
      notification.warning({
        message: 'Maintenance Due',
        description: 'Tool #3 has reached 80% of its recommended life cycle. Schedule replacement soon.',
        icon: <Clock className="w-5 h-5 text-amber-500" />,
        duration: 8,
      });
      break;
    case 'update':
      notification.info({
        message: 'Software Update Available',
        description: 'Version 2.1.0 is available with improved safety features and bug fixes.',
        icon: <Download className="w-5 h-5 text-blue-500" />,
        btn: (
          <Button size="sm" variant="outline" className="mt-2">
            Download
          </Button>
        ),
        duration: 10,
      });
      break;
  }
};

export const showProgressNotification = () => {
  const key = 'progress-notification';
  notification.info({
    key,
    message: 'Uploading G-Code File',
    description: 'Transferring part_housing.gcode to machine...',
    icon: <Upload className="w-5 h-5 text-blue-500" />,
    duration: 0,
  });

  // Simulate progress updates
  setTimeout(() => {
    notification.info({
      key,
      message: 'Processing G-Code',
      description: 'Validating toolpaths and calculating estimated runtime...',
      icon: <Activity className="w-5 h-5 text-blue-500" />,
      duration: 0,
    });
  }, 2000);

  setTimeout(() => {
    notification.success({
      key,
      message: 'File Ready',
      description: 'G-Code file processed successfully. Ready to start machining.',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      duration: 4,
    });
  }, 4000);
};

// Transfer list data
export const transferData = [
  { key: 'item-1', title: 'Work Area Limit X', description: 'Maximum X-axis travel distance' },
  { key: 'item-2', title: 'Spindle Speed Control', description: 'RPM monitoring and adjustment' },
  { key: 'item-3', title: 'Tool Height Sensor', description: 'Automatic tool length measurement' },
  { key: 'item-4', title: 'Emergency Stop Circuit', description: 'Safety shutdown system' },
  { key: 'item-5', title: 'Coolant System', description: 'Flood and mist coolant control' },
  { key: 'item-6', title: 'Part Probing', description: 'Workpiece surface detection' },
  { key: 'item-7', title: 'Feed Rate Override', description: 'Real-time speed adjustment' },
  { key: 'item-8', title: 'G-Code Validation', description: 'Syntax and safety checking' },
];

// File upload handlers
export const createUploadHandlers = (
  fileList: any[],
  setFileList: (files: any[]) => void
) => {
  const handleUploadChange = (info: any) => {
    let newFileList = [...info.fileList];
    
    // Limit to 5 files
    newFileList = newFileList.slice(-5);
    
    // Update file status
    newFileList = newFileList.map(file => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
    
    setFileList(newFileList);
  };

  const handleUploadRemove = (file: any) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
  };

  const beforeUpload = (file: any) => {
    const isValidType = file.type === 'text/plain' || file.name.endsWith('.gcode') || file.name.endsWith('.nc') || file.name.endsWith('.txt');
    if (!isValidType) {
      notification.error({
        message: 'Invalid File Type',
        description: 'Please upload G-Code files (.gcode, .nc, .txt)',
      });
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      notification.error({
        message: 'File Too Large',
        description: 'File must be smaller than 10MB',
      });
    }
    return isValidType && isLt10M;
  };

  return { handleUploadChange, handleUploadRemove, beforeUpload };
};

// Tour configurations
export const createTourSteps = (refs: Record<string, React.RefObject<any>>) => {
  const basicTourSteps = [
    {
      title: 'Welcome to CNC Controls',
      description: 'This is your CNC machine control interface. Let\'s take a quick tour of the basic components.',
      target: null,
    },
    {
      title: 'Button Components',
      description: 'These are the styled button variants available throughout the application. Each has a specific purpose and visual style.',
      target: () => refs.basicButtonsRef.current,
    },
    {
      title: 'Status Indicators',
      description: 'Status badges show the current state of the machine, connections, and operations in real-time.',
      target: () => refs.statusBadgesRef.current,
    },
    {
      title: 'Input Components',
      description: 'Various input types for configuration, measurements, and data entry with proper validation.',
      target: () => refs.numberInputsRef?.current,
    },
    {
      title: 'Forms & Controls',
      description: 'Complete form components with validation, file uploads, and configuration options.',
      target: () => refs.formsRef.current,
    },
  ];

  const cncTourSteps = [
    {
      title: 'CNC Machine Controls',
      description: 'Control your CNC machine with precision using these jog controls and position displays.',
      target: null,
    },
    {
      title: 'Jog Controls',
      description: 'Use these controls to manually move the machine axes. Set speed and distance for precise positioning.',
      target: () => refs.jogControlsRef.current,
    },
    {
      title: 'Emergency Stop',
      description: 'Critical safety control - immediately stops all machine movement. Always within reach.',
      target: () => refs.emergencyStopRef.current,
    },
    {
      title: 'Position Display',
      description: 'Real-time position feedback shows exact machine coordinates for all axes.',
      target: () => refs.coordinateDisplayRef.current,
    },
    {
      title: 'Status Monitoring',
      description: 'Monitor machine health, connection status, and operational parameters.',
      target: () => refs.statusBadgesRef.current,
    },
  ];

  const advancedTourSteps = [
    {
      title: 'Advanced Features',
      description: 'Explore advanced functionality including forms, popovers, and interactive components.',
      target: null,
    },
    {
      title: 'Form Components',
      description: 'Complex forms with validation, file uploads, and real-time feedback for machine configuration.',
      target: () => refs.formsRef.current,
    },
    {
      title: 'Contextual Information',
      description: 'Popovers provide quick access to common operations and detailed information without navigating away.',
      target: () => refs.popoverRef.current,
    },
    {
      title: 'Progress Indicators',
      description: 'Visual progress bars show the status of operations, jobs, and system metrics in real-time.',
      target: () => refs.progressRef.current,
    },
    {
      title: 'Notifications',
      description: 'System notifications keep you informed of important events, errors, and status changes.',
      target: () => refs.notificationRef.current,
    },
    {
      title: 'Data Transfer',
      description: 'Manage features and configurations with intuitive transfer controls and drag-and-drop functionality.',
      target: () => refs.transferRef.current,
    },
    {
      title: 'File Management',
      description: 'Upload and manage G-Code files with validation, preview, and batch processing capabilities.',
      target: () => refs.uploadRef.current,
    },
  ];

  return { basicTourSteps, cncTourSteps, advancedTourSteps };
};