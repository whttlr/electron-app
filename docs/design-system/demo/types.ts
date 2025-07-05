export type MachineStatus = 'connected' | 'disconnected' | 'idle' | 'running' | 'error' | 'warning';
export type AlertType = 'info' | 'success' | 'warning' | 'error';
export type TourType = 'basic' | 'cnc' | 'advanced';

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface UIDemoState {
  position: Position;
  jogSpeed: number;
  jogDistance: number;
  continuous: boolean;
  isConnected: boolean;
  machineStatus: MachineStatus;
  isEmergencyStopped: boolean;
  showSidebar: boolean;
  alertType: AlertType;
  showAlert: boolean;
  tourOpen: boolean;
  tourType: TourType;
  transferTargetKeys: string[];
  transferSelectedKeys: string[];
  fileList: any[];
}

export interface DemoRefs {
  basicButtonsRef: React.RefObject<HTMLDivElement>;
  statusBadgesRef: React.RefObject<HTMLDivElement>;
  jogControlsRef: React.RefObject<HTMLDivElement>;
  emergencyStopRef: React.RefObject<HTMLDivElement>;
  coordinateDisplayRef: React.RefObject<HTMLDivElement>;
  formsRef: React.RefObject<HTMLDivElement>;
  popoverRef: React.RefObject<HTMLDivElement>;
  tooltipRef: React.RefObject<HTMLDivElement>;
  progressRef: React.RefObject<HTMLDivElement>;
  notificationRef: React.RefObject<HTMLDivElement>;
  transferRef: React.RefObject<HTMLDivElement>;
  uploadRef: React.RefObject<HTMLDivElement>;
}

export interface DemoActions {
  handleJog: (axis: 'X' | 'Y' | 'Z', direction: number) => void;
  handleZero: (axis?: 'X' | 'Y' | 'Z') => void;
  handleEmergencyStop: () => void;
  handleReset: () => void;
  handleFormSubmit: (values: any) => void;
  showBasicNotification: (type: 'info' | 'success' | 'warning' | 'error') => void;
  showCNCNotification: (type: string) => void;
  handleTransferChange: (newTargetKeys: string[], direction: string, moveKeys: string[]) => void;
  handleTransferSelectChange: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
  handleUploadChange: (info: any) => void;
  handleUploadRemove: (file: any) => void;
  beforeUpload: (file: any) => boolean;
}