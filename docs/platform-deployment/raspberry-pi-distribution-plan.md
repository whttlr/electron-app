# Raspberry Pi Distribution Strategy Plan

## Overview
Evaluate and plan the optimal approach for distributing the CNC control application to Raspberry Pi devices, considering performance, resource constraints, and deployment strategies.

## Raspberry Pi Environment Analysis

### Hardware Considerations
```typescript
interface RaspberryPiSpecs {
  // Current Pi Models (2024)
  models: {
    'Pi 5': {
      cpu: 'Quad-core Cortex-A76 @ 2.4GHz'
      ram: '4GB/8GB LPDDR4X'
      architecture: 'ARM64'
      performance: 'Excellent for desktop apps'
      electronSupport: 'Full support'
      recommendedFor: 'Primary CNC controller'
    }
    
    'Pi 4': {
      cpu: 'Quad-core Cortex-A72 @ 1.8GHz'
      ram: '2GB/4GB/8GB LPDDR4'
      architecture: 'ARM64'
      performance: 'Good for lightweight desktop'
      electronSupport: 'Supported with optimization'
      recommendedFor: 'Budget CNC controller'
    }
    
    'Pi Zero 2 W': {
      cpu: 'Quad-core Cortex-A53 @ 1GHz'
      ram: '512MB LPDDR2'
      architecture: 'ARM64'
      performance: 'Limited for desktop apps'
      electronSupport: 'Not recommended'
      recommendedFor: 'Headless/web interface only'
    }
  }
  
  // I/O Capabilities
  interfaces: {
    gpio: '40-pin GPIO header'
    usb: 'USB 3.0 ports for CNC connections'
    ethernet: 'Gigabit Ethernet'
    wifi: '802.11ac dual-band'
    display: 'Dual 4K HDMI output'
    storage: 'microSD + USB/SSD options'
  }
  
  // Operating Systems
  supportedOS: {
    'Raspberry Pi OS': 'Official Debian-based (recommended)'
    'Ubuntu': 'Full Ubuntu Desktop/Server'
    'DietPi': 'Lightweight optimization'
    'Custom': 'Buildroot/Yocto embedded'
  }
}
```

### Performance Benchmarks
```typescript
interface PerformanceBenchmarks {
  // Application startup times
  startup: {
    electron: '8-15 seconds (Pi 4), 4-8 seconds (Pi 5)'
    tauri: '2-4 seconds (Pi 4), 1-2 seconds (Pi 5)'
    native: '1-2 seconds (Pi 4), <1 second (Pi 5)'
    web: '<1 second (any Pi with browser)'
  }
  
  // Memory usage
  memory: {
    electron: '150-300MB base + app memory'
    tauri: '50-100MB base + app memory'
    native: '20-50MB total'
    web: '50-150MB (browser dependent)'
  }
  
  // Real-time performance
  realTime: {
    serialLatency: '<1ms (native), 1-5ms (Electron)'
    uiResponseTime: '16ms target (60fps)'
    gcodeProcessing: 'Depends on file size and complexity'
  }
}
```

## Distribution Strategy Options

### Option 1: Electron on Raspberry Pi (Traditional Approach)

#### **Feasibility Assessment**
```typescript
interface ElectronOnPi {
  // Compatibility
  compatibility: {
    architecture: 'ARM64 fully supported'
    nodeVersion: 'v18+ recommended'
    electronVersion: 'v25+ with ARM64 prebuilts'
    nativeModules: 'May require compilation'
  }
  
  // Performance characteristics
  performance: {
    acceptable: ['Pi 4 (4GB+)', 'Pi 5 (any RAM)']
    marginal: ['Pi 4 (2GB)']
    notRecommended: ['Pi Zero', 'Pi 3', 'Pi 4 (1GB)']
  }
  
  // Resource requirements
  resources: {
    minimumRAM: '2GB (4GB recommended)'
    storageSpace: '1-2GB for app + dependencies'
    cpuUsage: '15-30% idle, 40-80% during operations'
    thermalConsiderations: 'May require cooling under load'
  }
  
  // Advantages
  advantages: [
    'Familiar development workflow',
    'Existing codebase works with minimal changes',
    'Full desktop application experience',
    'Native serial port access',
    'Complete file system access'
  ]
  
  // Disadvantages
  disadvantages: [
    'High memory usage',
    'Slower startup times',
    'Large application bundle',
    'May struggle on lower-end Pi models',
    'Chromium overhead on ARM'
  ]
}
```

#### **Electron Pi Optimization Strategies**
```typescript
// Raspberry Pi specific optimizations
const electronPiConfig = {
  // Build configuration
  build: {
    target: 'linux-arm64',
    compression: 'maximum',
    nativeOptimization: true,
    minimizeBundle: true
  },
  
  // Runtime optimizations
  runtime: {
    hardwareAcceleration: false, // Often problematic on Pi
    backgroundThrottling: true,
    v8Flags: [
      '--max-old-space-size=1024', // Limit memory for Pi 4 2GB
      '--gc-interval=100',          // More frequent GC
      '--optimize-for-size'         // Optimize for memory over speed
    ],
    windowOptions: {
      webSecurity: true,
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      spellcheck: false,
      backgroundMaterial: 'none' // Reduce GPU usage
    }
  },
  
  // Pi-specific features
  piOptimizations: {
    disableAnimations: true,
    reducePolling: true,
    limitConcurrency: true,
    useHardwareSerial: true, // Direct GPIO serial access
    enableGPUMemorySplit: '64MB' // Minimal GPU memory
  }
}
```

### Option 2: Tauri on Raspberry Pi (Recommended)

#### **Tauri Pi Advantages**
```typescript
interface TauriOnPi {
  // Performance benefits
  performance: {
    memoryUsage: '50-70% less than Electron',
    startupTime: '60-80% faster than Electron',
    cpuUsage: '30-50% less than Electron',
    bundleSize: '90% smaller than Electron'
  }
  
  // Pi-specific benefits
  piOptimizations: {
    nativePerformance: 'Rust backend runs at native speed',
    armOptimization: 'Rust compiler optimizes for ARM',
    resourceEfficiency: 'Better suited for Pi constraints',
    systemIntegration: 'Direct system API access'
  }
  
  // Architecture advantages
  architecture: {
    rustBackend: 'Serial port handling in native Rust',
    webFrontend: 'React UI with minimal overhead',
    ipcEfficiency: 'Fast inter-process communication',
    memoryManagement: 'Rust memory safety without GC'
  }
  
  // Compatibility
  compatibility: {
    raspberryPiOS: 'Full support',
    ubuntu: 'Full support',
    armArchitecture: 'Native ARM64 compilation',
    crossCompilation: 'Build on x64 for ARM64'
  }
}
```

#### **Tauri Pi Build Configuration**
```rust
// Cargo.toml optimizations for Pi
[profile.release]
lto = true                    # Link-time optimization
codegen-units = 1            # Single codegen unit for size
panic = "abort"              # Smaller binary size
strip = true                 # Strip debug symbols

[target.aarch64-unknown-linux-gnu]
linker = "aarch64-linux-gnu-gcc"
rustflags = [
  "-C", "target-cpu=cortex-a72",  # Pi 4 optimization
  "-C", "target-feature=+neon",   # SIMD instructions
]

# Pi-specific dependencies
[dependencies]
tokio = { version = "1", features = ["rt", "time", "io-util", "net"] }
serialport = { version = "4", features = ["serde"] }
sysinfo = "0.29"             # System monitoring
gpio-cdev = "0.5"            # Direct GPIO access (optional)
```

### Option 3: Web Application with Pi Server (Hybrid Approach)

#### **Pi as Dedicated CNC Server**
```typescript
interface PiServerArchitecture {
  // Server components (running on Pi)
  server: {
    // Core CNC control server
    cncServer: {
      language: 'Rust' | 'Go' | 'Node.js'
      responsibilities: [
        'Serial port communication',
        'G-code processing and streaming',
        'Machine state management',
        'Safety monitoring',
        'File management'
      ]
      apis: [
        'REST API for commands',
        'WebSocket for real-time updates',
        'File upload/download endpoints',
        'Status streaming'
      ]
    }
    
    // Web server
    webServer: {
      staticFiles: 'React build artifacts'
      reverseProxy: 'nginx for performance'
      ssl: 'Let\'s Encrypt for HTTPS'
      compression: 'gzip/brotli for assets'
    }
    
    // System services
    systemServices: {
      autoStart: 'systemd service'
      monitoring: 'Health checks and recovery'
      logging: 'Structured logging to disk'
      updates: 'OTA update mechanism'
    }
  }
  
  // Client interfaces
  clients: {
    // Web browser (primary)
    web: {
      devices: ['Desktop', 'Tablet', 'Phone', 'Other Pi']
      technologies: ['React', 'WebRTC for video', 'WebSocket']
      features: ['Full CNC control', 'Real-time monitoring', 'File management']
    }
    
    // Mobile app (secondary)
    mobile: {
      type: 'PWA or React Native'
      features: ['Remote monitoring', 'Basic controls', 'Notifications']
      connectivity: 'WiFi or cellular to Pi'
    }
    
    // Desktop app (optional)
    desktop: {
      type: 'Electron or Tauri wrapper around web interface'
      features: ['Offline file editing', 'Enhanced file management']
    }
  }
  
  // Communication protocols
  communication: {
    realTime: 'WebSocket for position updates and status'
    commands: 'REST API for G-code commands and configuration'
    files: 'HTTP upload/download with progress'
    streaming: 'Server-sent events for logs and notifications'
  }
}
```

#### **Pi Server Implementation**
```rust
// High-performance Rust server for Pi
use axum::{Router, response::Json, extract::ws::WebSocket};
use tokio_serial::{SerialPort, SerialPortBuilderExt};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct MachineState {
    position: Position,
    status: String,
    active_wcs: String,
    feed_rate: f64,
    spindle_speed: f64,
}

// Main CNC server
struct CNCServer {
    serial_port: Box<dyn SerialPort>,
    machine_state: Arc<Mutex<MachineState>>,
    clients: Arc<Mutex<Vec<WebSocket>>>,
}

impl CNCServer {
    // Real-time position updates via WebSocket
    async fn broadcast_position_update(&self, position: Position) {
        let message = serde_json::to_string(&position).unwrap();
        let clients = self.clients.lock().await;
        
        for client in clients.iter() {
            let _ = client.send(Message::Text(message.clone())).await;
        }
    }
    
    // G-code command processing
    async fn execute_gcode(&self, gcode: String) -> Result<(), CNCError> {
        // Validate G-code
        let validated = self.validate_gcode(&gcode)?;
        
        // Send to machine
        self.serial_port.write_all(validated.as_bytes()).await?;
        
        // Wait for response and update state
        let response = self.read_machine_response().await?;
        self.update_machine_state(response).await;
        
        Ok(())
    }
}

// REST API endpoints
async fn jog_machine(
    Json(command): Json<JogCommand>
) -> Result<Json<MachineState>, CNCError> {
    // Process jog command
    let gcode = format!("G91 G01 {}{} F{}", command.axis, command.distance, command.speed);
    cnc_server.execute_gcode(gcode).await?;
    
    Ok(Json(cnc_server.get_state().await))
}

// WebSocket handler for real-time updates
async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(app_state): State<AppState>
) -> Response {
    ws.on_upgrade(|socket| handle_websocket(socket, app_state))
}
```

### Option 4: Native Pi Application (Maximum Performance)

#### **Direct Pi Development**
```typescript
interface NativePiApp {
  // Technology options
  technologies: {
    // Rust with GUI framework
    rust: {
      frameworks: ['egui', 'iced', 'gtk-rs', 'fltk-rs']
      advantages: ['Maximum performance', 'Memory safety', 'Cross-compilation']
      complexity: 'Medium-High'
      uiQuality: 'Good (but not web-level polish)'
    }
    
    // Go with GUI framework
    go: {
      frameworks: ['fyne', 'gio', 'gtk3']
      advantages: ['Simple deployment', 'Good performance', 'Easy concurrency']
      complexity: 'Medium'
      uiQuality: 'Good'
    }
    
    // C++ with Qt
    cpp: {
      frameworks: ['Qt', 'GTK']
      advantages: ['Ultimate performance', 'Rich UI capabilities']
      complexity: 'High'
      uiQuality: 'Excellent'
    }
    
    // Python with GUI (least recommended)
    python: {
      frameworks: ['PyQt', 'tkinter', 'Kivy']
      advantages: ['Rapid development', 'Easy to modify']
      complexity: 'Low'
      uiQuality: 'Basic'
      performance: 'Poor for real-time operations'
    }
  }
  
  // Performance characteristics
  performance: {
    memory: '20-50MB total application',
    startup: '<1 second on any Pi model',
    realTime: 'Sub-millisecond serial response',
    cpu: '5-15% during normal operation'
  }
  
  // Development complexity
  complexity: {
    initialDevelopment: 'High (complete rewrite)',
    maintenance: 'Medium (single platform)',
    uiDevelopment: 'High (custom UI components)',
    testing: 'Medium (fewer integration points)'
  }
}
```

## Recommended Distribution Strategy

### Primary Recommendation: Tauri + Pi Server Hybrid

#### **Architecture Overview**
```
┌─────────────────────────────────────────────────────────────┐
│                     Raspberry Pi                            │
├─────────────────────────┬───────────────────────────────────┤
│     Tauri Desktop App   │         CNC Server (Rust)        │
│  ┌─────────────────────┐│  ┌─────────────────────────────────┐│
│  │   React Frontend    ││  │     Serial Communication       ││
│  │   - Local UI        ││  │     G-code Processing          ││
│  │   - Configuration   ││  │     Machine State              ││
│  │   - File Management ││  │     Safety Monitoring          ││
│  └─────────────────────┘│  └─────────────────────────────────┘│
├─────────────────────────┴───────────────────────────────────┤
│                    Shared Core Logic                        │
│              (Rust crates for CNC operations)               │
└─────────────────────────────────────────────────────────────┘
         │                              │
         │ IPC                          │ Network APIs
         │                              │
    ┌─────────┐                   ┌─────────────┐
    │ Display │                   │   Remote    │
    │ Monitor │                   │  Clients    │
    └─────────┘                   └─────────────┘
```

#### **Implementation Strategy**
```typescript
// Deployment package structure
pi-distribution/
├── install/
│   ├── setup.sh                    # Automated installation script
│   ├── systemd/
│   │   ├── cnc-server.service      # CNC server service
│   │   └── cnc-desktop.service     # Desktop app service (optional)
│   ├── nginx/
│   │   └── cnc-proxy.conf          # Reverse proxy configuration
│   └── udev/
│       └── 99-cnc-serial.rules     # Serial port permissions
├── binaries/
│   ├── cnc-server                  # Rust server binary (ARM64)
│   ├── cnc-desktop                 # Tauri app binary (ARM64)
│   └── web-assets/                 # Static web files
├── config/
│   ├── default-machine.json        # Default machine configuration
│   ├── default-wcs.json           # Default work coordinate systems
│   └── server-config.toml          # Server configuration
├── scripts/
│   ├── start-cnc.sh               # Startup script
│   ├── update-cnc.sh              # Update script
│   └── backup-config.sh           # Configuration backup
└── docs/
    ├── installation.md             # Installation guide
    ├── configuration.md            # Configuration guide
    └── troubleshooting.md          # Common issues
```

### Build and Cross-Compilation Setup

#### **GitHub Actions for Pi Builds**
```yaml
name: Build for Raspberry Pi

on:
  push:
    tags: ['v*']
  pull_request:
    branches: [main]

jobs:
  build-pi:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        target: [aarch64-unknown-linux-gnu]
        
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.target }}
          
      - name: Install cross-compilation tools
        run: |
          sudo apt-get update
          sudo apt-get install -y gcc-aarch64-linux-gnu
          
      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Build frontend
        run: |
          cd frontend
          npm install
          npm run build
          
      - name: Build Tauri app for Pi
        run: |
          cd desktop
          npm install
          npm run tauri build -- --target ${{ matrix.target }}
          
      - name: Build CNC server for Pi
        run: |
          cd server
          cargo build --release --target ${{ matrix.target }}
          
      - name: Create distribution package
        run: |
          mkdir -p dist/pi-distribution
          cp target/${{ matrix.target }}/release/cnc-server dist/pi-distribution/
          cp target/${{ matrix.target }}/release/cnc-desktop dist/pi-distribution/
          cp -r scripts/* dist/pi-distribution/
          tar -czf cnc-control-pi-${{ github.ref_name }}.tar.gz -C dist pi-distribution
          
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: pi-distribution
          path: cnc-control-pi-*.tar.gz
```

#### **Cross-Compilation Configuration**
```toml
# .cargo/config.toml
[target.aarch64-unknown-linux-gnu]
linker = "aarch64-linux-gnu-gcc"

[build]
target = "aarch64-unknown-linux-gnu"

# Build script optimization
[env]
CC_aarch64_unknown_linux_gnu = "aarch64-linux-gnu-gcc"
CXX_aarch64_unknown_linux_gnu = "aarch64-linux-gnu-g++"
AR_aarch64_unknown_linux_gnu = "aarch64-linux-gnu-ar"
CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_LINKER = "aarch64-linux-gnu-gcc"
```

### Pi-Specific Installation Process

#### **Automated Installation Script**
```bash
#!/bin/bash
# install-cnc-pi.sh - Automated CNC control installation for Raspberry Pi

set -e

# Configuration
CNC_USER="cnc"
CNC_HOME="/opt/cnc-control"
SERVICE_NAME="cnc-server"
VERSION="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if running on Raspberry Pi
check_raspberry_pi() {
    if ! grep -q "Raspberry Pi" /proc/cpuinfo; then
        error "This script is designed for Raspberry Pi only"
    fi
    
    # Check ARM64 architecture
    if [ "$(uname -m)" != "aarch64" ]; then
        warn "64-bit OS recommended for better performance"
    fi
}

# Install system dependencies
install_dependencies() {
    log "Installing system dependencies..."
    
    sudo apt-get update
    sudo apt-get install -y \
        curl \
        nginx \
        udev \
        systemd \
        libssl-dev \
        pkg-config \
        libudev-dev
}

# Create CNC user and directories
setup_user() {
    log "Setting up CNC user and directories..."
    
    # Create CNC user if it doesn't exist
    if ! id "$CNC_USER" &>/dev/null; then
        sudo useradd -r -m -d "$CNC_HOME" -s /bin/bash "$CNC_USER"
        sudo usermod -a -G dialout,gpio "$CNC_USER"  # Serial and GPIO access
    fi
    
    # Create directories
    sudo mkdir -p "$CNC_HOME"/{bin,config,logs,data,web}
    sudo chown -R "$CNC_USER:$CNC_USER" "$CNC_HOME"
}

# Install CNC binaries
install_binaries() {
    log "Installing CNC control binaries..."
    
    # Download latest release
    local download_url="https://github.com/your-org/cnc-control/releases/download/${VERSION}/cnc-control-pi-${VERSION}.tar.gz"
    
    wget -O "/tmp/cnc-control-pi.tar.gz" "$download_url"
    
    # Extract to CNC home
    sudo tar -xzf "/tmp/cnc-control-pi.tar.gz" -C "$CNC_HOME" --strip-components=1
    sudo chown -R "$CNC_USER:$CNC_USER" "$CNC_HOME"
    sudo chmod +x "$CNC_HOME/bin"/*
    
    # Clean up
    rm "/tmp/cnc-control-pi.tar.gz"
}

# Configure systemd services
setup_services() {
    log "Setting up systemd services..."
    
    # CNC server service
    sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null <<EOF
[Unit]
Description=CNC Control Server
After=network.target
Wants=network.target

[Service]
Type=simple
User=$CNC_USER
Group=$CNC_USER
WorkingDirectory=$CNC_HOME
ExecStart=$CNC_HOME/bin/cnc-server
Restart=always
RestartSec=5
Environment=RUST_LOG=info
Environment=CNC_CONFIG_PATH=$CNC_HOME/config

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict
ReadWritePaths=$CNC_HOME

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
}

# Configure nginx reverse proxy
setup_nginx() {
    log "Configuring nginx reverse proxy..."
    
    sudo tee /etc/nginx/sites-available/cnc-control > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    
    # Web interface
    location / {
        root $CNC_HOME/web;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API endpoints
    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # WebSocket for real-time updates
    location /ws {
        proxy_pass http://127.0.0.1:8080/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }
}
EOF

    # Enable site and restart nginx
    sudo ln -sf /etc/nginx/sites-available/cnc-control /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo systemctl enable nginx
    sudo systemctl restart nginx
}

# Configure udev rules for serial ports
setup_udev() {
    log "Setting up udev rules for serial ports..."
    
    sudo tee /etc/udev/rules.d/99-cnc-serial.rules > /dev/null <<EOF
# Allow CNC user access to serial ports
SUBSYSTEM=="tty", GROUP="dialout", MODE="0664"
SUBSYSTEM=="usb", ATTRS{idVendor}=="2341", GROUP="dialout", MODE="0664"  # Arduino
SUBSYSTEM=="usb", ATTRS{idVendor}=="1a86", GROUP="dialout", MODE="0664"  # CH340
EOF

    sudo udevadm control --reload-rules
    sudo udevadm trigger
}

# Start services
start_services() {
    log "Starting CNC control services..."
    
    sudo systemctl start "$SERVICE_NAME"
    sudo systemctl start nginx
    
    # Check service status
    if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
        log "CNC server started successfully"
    else
        error "Failed to start CNC server"
    fi
}

# Display completion message
show_completion() {
    local pi_ip=$(hostname -I | awk '{print $1}')
    
    echo
    log "Installation completed successfully!"
    echo
    echo "Access your CNC control interface at:"
    echo "  Local:   http://localhost"
    echo "  Network: http://${pi_ip}"
    echo
    echo "Service management commands:"
    echo "  Status:  sudo systemctl status $SERVICE_NAME"
    echo "  Logs:    sudo journalctl -fu $SERVICE_NAME"
    echo "  Restart: sudo systemctl restart $SERVICE_NAME"
    echo
    echo "Configuration files are located in: $CNC_HOME/config"
    echo "Log files are located in: $CNC_HOME/logs"
    echo
}

# Main installation process
main() {
    log "Starting CNC Control installation for Raspberry Pi..."
    
    check_raspberry_pi
    install_dependencies
    setup_user
    install_binaries
    setup_services
    setup_nginx
    setup_udev
    start_services
    show_completion
}

# Run main function
main "$@"
```

### Performance Optimization for Pi

#### **Memory and CPU Optimization**
```rust
// Pi-specific optimizations in Rust server
use tokio::runtime::Builder;
use std::thread;

// Optimize Tokio runtime for Pi
fn create_pi_optimized_runtime() -> tokio::runtime::Runtime {
    let num_cores = thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(1);
    
    // Use fewer threads on Pi to reduce context switching
    let worker_threads = match num_cores {
        1 => 1,           // Pi Zero
        2..=4 => 2,       // Pi 4
        _ => num_cores / 2 // Pi 5 or future models
    };
    
    Builder::new_multi_thread()
        .worker_threads(worker_threads)
        .max_blocking_threads(2)          // Limit blocking threads
        .thread_stack_size(1024 * 1024)  // Smaller stack size
        .enable_all()
        .build()
        .expect("Failed to create runtime")
}

// Memory pool for frequent allocations
use object_pool::Pool;

lazy_static! {
    static ref GCODE_BUFFER_POOL: Pool<Vec<u8>> = Pool::new(32, || Vec::with_capacity(1024));
    static ref POSITION_POOL: Pool<Position> = Pool::new(16, || Position::default());
}

// Pi-specific serial port configuration
fn configure_serial_for_pi(port_path: &str) -> Result<Box<dyn SerialPort>, Error> {
    SerialPortBuilder::new(port_path)
        .baud_rate(115200)
        .data_bits(DataBits::Eight)
        .parity(Parity::None)
        .stop_bits(StopBits::One)
        .flow_control(FlowControl::None)
        .timeout(Duration::from_millis(10))  // Shorter timeout for responsiveness
        .open()
}
```

### Testing on Raspberry Pi

#### **Pi Testing Strategy**
```typescript
interface PiTestingStrategy {
  // Development testing
  development: {
    // Cross-compilation testing
    crossCompile: {
      target: 'aarch64-unknown-linux-gnu'
      testInDocker: 'Use ARM64 Docker containers'
      qemuEmulation: 'QEMU for initial testing'
    }
    
    // Real hardware testing
    realHardware: {
      models: ['Pi 4 (4GB)', 'Pi 5 (8GB)']
      testCases: [
        'Application startup and shutdown',
        'Serial port communication',
        'Memory usage under load',
        'CPU usage during operations',
        'Thermal performance',
        'Network connectivity',
        'File operations',
        'Real-time response'
      ]
    }
  }
  
  // Performance benchmarks
  benchmarks: {
    memory: 'Maximum memory usage under typical load'
    cpu: 'CPU usage during G-code streaming'
    latency: 'Serial communication latency'
    throughput: 'G-code processing throughput'
    startup: 'Application startup time'
    network: 'Web interface response time'
  }
  
  // Load testing
  loadTesting: {
    longRunning: '24+ hour continuous operation'
    largeFiles: 'Process large G-code files (>10MB)'
    multipleClients: 'Multiple simultaneous web connections'
    memoryLeaks: 'Monitor for memory leaks over time'
    thermalThrottling: 'Performance under thermal limits'
  }
}
```

## Migration Path from Current Setup

### Phase 1: Proof of Concept (1-2 weeks)
- [ ] Set up cross-compilation for ARM64
- [ ] Build basic Tauri app for Pi
- [ ] Test core functionality on Pi 4/5
- [ ] Benchmark performance vs desktop
- [ ] Validate serial port communication

### Phase 2: Core Implementation (3-4 weeks)
- [ ] Port core CNC logic to Rust server
- [ ] Implement web API endpoints
- [ ] Create WebSocket real-time communication
- [ ] Build Pi-optimized frontend
- [ ] Add system service configuration

### Phase 3: Pi-Specific Features (2-3 weeks)
- [ ] GPIO integration for hardware controls
- [ ] Pi camera integration (optional)
- [ ] Power management and recovery
- [ ] Automatic updates and maintenance
- [ ] Performance monitoring and alerts

### Phase 4: Distribution and Testing (2-3 weeks)
- [ ] Create automated installation package
- [ ] Set up CI/CD for Pi builds
- [ ] Comprehensive testing on real hardware
- [ ] Documentation and user guides
- [ ] Beta testing with Pi users

## Benefits Summary

### Technical Benefits
- **Resource Efficiency**: Tauri uses 50-70% less memory than Electron
- **Performance**: Native Rust backend for critical CNC operations
- **Reliability**: System service with automatic restart and monitoring
- **Scalability**: Web interface accessible from multiple devices
- **Maintainability**: Single codebase with Pi-specific optimizations

### User Benefits
- **Cost Effective**: Run on affordable Pi hardware ($50-100)
- **Dedicated Device**: Pi becomes dedicated CNC controller
- **Remote Access**: Control CNC from any device on network
- **Always On**: Headless operation with web interface
- **Expandable**: GPIO pins for custom hardware integration

### Business Benefits
- **Lower Barrier to Entry**: Affordable hardware for users
- **Broader Market**: Targets maker/hobbyist community
- **Edge Computing**: Reduces dependence on external connectivity
- **Customization**: Open platform for community modifications
- **Competitive Advantage**: Native Pi support differentiates product

**Conclusion**: Tauri + Pi Server hybrid approach provides the best balance of performance, resource efficiency, and functionality for Raspberry Pi deployment while maintaining the quality and features of the desktop application.