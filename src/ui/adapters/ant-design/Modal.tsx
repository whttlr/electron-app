/**
 * Advanced Modal and Dialog System
 * 
 * Enhanced modal components with animations, customizable layouts,
 * and CNC-specific dialog implementations.
 */

import React, { useState, useEffect } from 'react';
import { Modal as AntModal, Button, Space, Alert, Divider, Progress } from 'antd';
import { ModalProps as AntModalProps } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../shared/utils';
import { Form, FormItem } from './Form';
import { Input, CoordinateInput } from './Input';
import { Select } from './Select';
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  HomeOutlined,
} from '@ant-design/icons';

// ============================================================================
// TYPES
// ============================================================================

export interface ModalConfig {
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  type?: 'default' | 'info' | 'success' | 'warning' | 'error';
  actions?: ModalAction[];
  closable?: boolean;
  maskClosable?: boolean;
  width?: number | string;
  centered?: boolean;
  destroyOnClose?: boolean;
}

export interface ModalAction {
  label: string;
  type?: 'default' | 'primary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void | Promise<void>;
}

export interface ConfirmDialogOptions {
  title: string;
  content: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  okText?: string;
  cancelText?: string;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
}

// ============================================================================
// ENHANCED MODAL COMPONENT
// ============================================================================

export interface EnhancedModalProps extends Omit<AntModalProps, 'onOk' | 'onCancel'> {
  config: ModalConfig;
  onClose?: () => void;
  className?: string;
}

export const EnhancedModal: React.FC<EnhancedModalProps> = ({
  config,
  onClose,
  className,
  ...props
}) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  
  const handleActionClick = async (action: ModalAction, index: number) => {
    if (action.loading || action.disabled) return;
    
    setLoading(prev => ({ ...prev, [index]: true }));
    
    try {
      await action.onClick();
    } catch (error) {
      console.error('Modal action error:', error);
    } finally {
      setLoading(prev => ({ ...prev, [index]: false }));
    }
  };
  
  const getTypeIcon = () => {
    if (config.icon) return config.icon;
    
    switch (config.type) {
      case 'success':
        return <CheckCircleOutlined className="text-green-500 text-xl" />;
      case 'warning':
        return <WarningOutlined className="text-amber-500 text-xl" />;
      case 'error':
        return <ExclamationCircleOutlined className="text-red-500 text-xl" />;
      case 'info':
        return <InfoCircleOutlined className="text-blue-500 text-xl" />;
      default:
        return null;
    }
  };
  
  const getTypeColor = () => {
    switch (config.type) {
      case 'success':
        return 'border-green-500';
      case 'warning':
        return 'border-amber-500';
      case 'error':
        return 'border-red-500';
      case 'info':
        return 'border-blue-500';
      default:
        return 'border-border';
    }
  };
  
  return (
    <AntModal
      {...props}
      title={
        <div className="flex items-center space-x-3">
          {getTypeIcon()}
          <span className="text-lg font-semibold">{config.title}</span>
        </div>
      }
      footer={
        config.actions && config.actions.length > 0 ? (
          <Space>
            {config.actions.map((action, index) => (
              <Button
                key={index}
                type={action.type}
                loading={loading[index] || action.loading}
                disabled={action.disabled}
                onClick={() => handleActionClick(action, index)}
              >
                {action.label}
              </Button>
            ))}
          </Space>
        ) : null
      }
      onCancel={onClose}
      closable={config.closable !== false}
      maskClosable={config.maskClosable !== false}
      width={config.width}
      centered={config.centered}
      destroyOnClose={config.destroyOnClose}
      className={cn('enhanced-modal', getTypeColor(), className)}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {config.content}
      </motion.div>
    </AntModal>
  );
};

// ============================================================================
// MODAL MANAGER
// ============================================================================

class ModalManager {
  private modals: Map<string, { config: ModalConfig; visible: boolean }> = new Map();
  private listeners: Set<() => void> = new Set();
  
  private notify() {
    this.listeners.forEach(listener => listener());
  }
  
  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  public show(id: string, config: ModalConfig) {
    this.modals.set(id, { config, visible: true });
    this.notify();
  }
  
  public hide(id: string) {
    const modal = this.modals.get(id);
    if (modal) {
      modal.visible = false;
      this.notify();
    }
  }
  
  public destroy(id: string) {
    this.modals.delete(id);
    this.notify();
  }
  
  public getModals() {
    return Array.from(this.modals.entries()).map(([id, modal]) => ({
      id,
      ...modal,
    }));
  }
  
  public confirm(options: ConfirmDialogOptions) {
    const id = `confirm-${Date.now()}`;
    
    const config: ModalConfig = {
      title: options.title,
      content: options.content,
      type: options.type || 'info',
      actions: [
        {
          label: options.cancelText || 'Cancel',
          type: 'default',
          onClick: () => {
            options.onCancel?.();
            this.hide(id);
          },
        },
        {
          label: options.okText || 'OK',
          type: options.type === 'error' ? 'danger' : 'primary',
          onClick: async () => {
            await options.onOk?.();
            this.hide(id);
          },
        },
      ],
      width: 416,
      centered: true,
    };
    
    this.show(id, config);
    return id;
  }
}

export const modalManager = new ModalManager();

// ============================================================================
// MODAL PROVIDER
// ============================================================================

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState(modalManager.getModals());
  
  useEffect(() => {
    const unsubscribe = modalManager.subscribe(() => {
      setModals(modalManager.getModals());
    });
    
    return unsubscribe;
  }, []);
  
  return (
    <>
      {children}
      
      <AnimatePresence>
        {modals.map(({ id, config, visible }) => (
          visible && (
            <EnhancedModal
              key={id}
              open={visible}
              config={config}
              onClose={() => modalManager.hide(id)}
            />
          )
        ))}
      </AnimatePresence>
    </>
  );
};

// ============================================================================
// CNC-SPECIFIC DIALOGS
// ============================================================================

/**
 * Emergency Stop Confirmation Dialog
 */
export const showEmergencyStopDialog = (onConfirm: () => void) => {
  return modalManager.confirm({
    title: 'Emergency Stop',
    content: (
      <div className="space-y-4">
        <Alert
          message="WARNING: This will immediately stop all machine operations!"
          description="The spindle will stop, all movement will halt, and the current job will be terminated. This action cannot be undone."
          type="error"
          showIcon
        />
        <p className="text-foreground">
          Are you sure you want to activate the emergency stop?
        </p>
      </div>
    ),
    type: 'error',
    okText: 'EMERGENCY STOP',
    cancelText: 'Cancel',
    onOk: onConfirm,
  });
};

/**
 * Home Machine Dialog
 */
export interface HomeMachineDialogProps {
  onHome: (axes: ('X' | 'Y' | 'Z')[]) => Promise<void>;
  onClose: () => void;
}

export const showHomeMachineDialog = (onHome: (axes: ('X' | 'Y' | 'Z')[]) => Promise<void>) => {
  const id = `home-machine-${Date.now()}`;
  
  const HomeMachineContent: React.FC = () => {
    const [selectedAxes, setSelectedAxes] = useState<('X' | 'Y' | 'Z')[]>(['X', 'Y', 'Z']);
    const [isHoming, setIsHoming] = useState(false);
    
    const handleHome = async () => {
      setIsHoming(true);
      try {
        await onHome(selectedAxes);
        modalManager.hide(id);
      } catch (error) {
        console.error('Homing failed:', error);
      } finally {
        setIsHoming(false);
      }
    };
    
    return (
      <div className="space-y-4">
        <Alert
          message="Machine Homing"
          description="Homing will move the machine to its reference position. Ensure the machine is clear of obstructions."
          type="info"
          showIcon
        />
        
        <div>
          <p className="font-medium mb-2">Select axes to home:</p>
          <Space>
            {(['X', 'Y', 'Z'] as const).map(axis => (
              <Button
                key={axis}
                type={selectedAxes.includes(axis) ? 'primary' : 'default'}
                onClick={() => {
                  if (selectedAxes.includes(axis)) {
                    setSelectedAxes(selectedAxes.filter(a => a !== axis));
                  } else {
                    setSelectedAxes([...selectedAxes, axis]);
                  }
                }}
              >
                {axis} Axis
              </Button>
            ))}
          </Space>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button onClick={() => modalManager.hide(id)}>Cancel</Button>
          <Button
            type="primary"
            icon={<HomeOutlined />}
            loading={isHoming}
            disabled={selectedAxes.length === 0}
            onClick={handleHome}
          >
            Home {selectedAxes.length === 3 ? 'All Axes' : selectedAxes.join(', ')}
          </Button>
        </div>
      </div>
    );
  };
  
  modalManager.show(id, {
    title: 'Home Machine',
    content: <HomeMachineContent />,
    icon: <HomeOutlined className="text-blue-500 text-xl" />,
    width: 500,
    centered: true,
  });
  
  return id;
};

/**
 * Job Progress Dialog
 */
export interface JobProgressDialogProps {
  jobName: string;
  progress: number;
  currentOperation: string;
  estimatedTimeRemaining: number;
  onPause: () => void;
  onStop: () => void;
  onClose: () => void;
}

export const showJobProgressDialog = (props: Omit<JobProgressDialogProps, 'onClose'>) => {
  const id = `job-progress-${Date.now()}`;
  
  const JobProgressContent: React.FC = () => {
    const [isPaused, setIsPaused] = useState(false);
    
    const handlePause = () => {
      props.onPause();
      setIsPaused(!isPaused);
    };
    
    const handleStop = () => {
      modalManager.confirm({
        title: 'Stop Job',
        content: 'Are you sure you want to stop the current job? This action cannot be undone.',
        type: 'warning',
        okText: 'Stop Job',
        onOk: () => {
          props.onStop();
          modalManager.hide(id);
        },
      });
    };
    
    const formatTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">{props.jobName}</h3>
          <div className="text-sm text-secondary-400 mb-4">
            Current Operation: {props.currentOperation}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Progress</span>
            <span className="text-sm font-mono">{Math.round(props.progress)}%</span>
          </div>
          <Progress percent={props.progress} status="active" />
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span>Estimated Time Remaining:</span>
          <span className="font-mono">{formatTime(props.estimatedTimeRemaining)}</span>
        </div>
        
        <Divider />
        
        <div className="flex justify-center space-x-2">
          <Button
            icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
            onClick={handlePause}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            danger
            icon={<StopOutlined />}
            onClick={handleStop}
          >
            Stop Job
          </Button>
        </div>
      </div>
    );
  };
  
  modalManager.show(id, {
    title: 'Job in Progress',
    content: <JobProgressContent />,
    icon: <PlayCircleOutlined className="text-blue-500 text-xl" />,
    width: 400,
    centered: true,
    closable: false,
    maskClosable: false,
  });
  
  return id;
};

/**
 * Quick Position Dialog
 */
export const showQuickPositionDialog = (
  currentPosition: { x: number; y: number; z: number },
  onGoto: (position: { x: number; y: number; z: number }) => Promise<void>
) => {
  const id = `quick-position-${Date.now()}`;
  
  const QuickPositionContent: React.FC = () => {
    const [form] = Form.useForm();
    const [isMoving, setIsMoving] = useState(false);
    
    const handleGoto = async (values: any) => {
      setIsMoving(true);
      try {
        await onGoto({
          x: parseFloat(values.x) || 0,
          y: parseFloat(values.y) || 0,
          z: parseFloat(values.z) || 0,
        });
        modalManager.hide(id);
      } catch (error) {
        console.error('Move failed:', error);
      } finally {
        setIsMoving(false);
      }
    };
    
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleGoto}
        initialValues={currentPosition}
      >
        <div className="grid grid-cols-3 gap-4 mb-4">
          <FormItem name="x" label="X Position">
            <CoordinateInput axis="X" units="mm" />
          </FormItem>
          <FormItem name="y" label="Y Position">
            <CoordinateInput axis="Y" units="mm" />
          </FormItem>
          <FormItem name="z" label="Z Position">
            <CoordinateInput axis="Z" units="mm" />
          </FormItem>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button onClick={() => modalManager.hide(id)}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isMoving}>
            Move to Position
          </Button>
        </div>
      </Form>
    );
  };
  
  modalManager.show(id, {
    title: 'Go to Position',
    content: <QuickPositionContent />,
    width: 400,
    centered: true,
  });
  
  return id;
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  EnhancedModal,
  ModalProvider,
  modalManager,
  showEmergencyStopDialog,
  showHomeMachineDialog,
  showJobProgressDialog,
  showQuickPositionDialog,
};

export type {
  ModalConfig,
  ModalAction,
  ConfirmDialogOptions,
  EnhancedModalProps,
  HomeMachineDialogProps,
  JobProgressDialogProps,
};
