/**
 * Machine Monitor Plugin
 * 
 * A comprehensive machine monitoring plugin that creates its own screen
 * with real-time charts and analytics.
 */

class machinemonitorPlugin {
  constructor(api) {
    this.api = api;
    this.name = 'machine-monitor';
    this.updateInterval = null;
    this.chartData = {
      temperature: [],
      vibration: [],
      speed: [],
      timestamps: []
    };
  }

  async initialize() {
    console.log(`${this.name} plugin initializing...`);
    
    // Register for machine events
    this.api.events.on('machine.status.update', this.handleStatusUpdate.bind(this));
    
    console.log(`${this.name} plugin initialized successfully!`);
  }

  async mount(container) {
    // Create the full monitoring interface
    container.innerHTML = `
      <div style="padding: 20px; height: 100vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h1 style="margin: 0; color: #1890ff;">Machine Monitor</h1>
            <p style="margin: 0; color: #666;">Real-time machine monitoring and analytics</p>
          </div>
          <div style="display: flex; gap: 12px;">
            <button onclick="window.machineMonitor.exportData()" style="padding: 8px 16px; background: #52c41a; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Export Data
            </button>
            <button onclick="window.machineMonitor.resetData()" style="padding: 8px 16px; background: #ff4d4f; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Reset
            </button>
          </div>
        </div>

        <!-- Status Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 8px 0; color: #666;">Machine Status</h3>
            <div id="machine-status" style="font-size: 24px; font-weight: bold; color: #52c41a;">IDLE</div>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 8px 0; color: #666;">Temperature</h3>
            <div id="temperature" style="font-size: 24px; font-weight: bold; color: #1890ff;">22°C</div>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 8px 0; color: #666;">Spindle Speed</h3>
            <div id="spindle-speed" style="font-size: 24px; font-weight: bold; color: #722ed1;">0 RPM</div>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 8px 0; color: #666;">Feed Rate</h3>
            <div id="feed-rate" style="font-size: 24px; font-weight: bold; color: #fa8c16;">0 mm/min</div>
          </div>
        </div>

        <!-- Charts Section -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 16px 0;">Temperature History</h3>
            <canvas id="temperature-chart" width="400" height="200"></canvas>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 16px 0;">Speed History</h3>
            <canvas id="speed-chart" width="400" height="200"></canvas>
          </div>
        </div>

        <!-- Analytics Section -->
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 16px 0;">Session Analytics</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
            <div>
              <div style="color: #666; font-size: 12px;">Total Runtime</div>
              <div id="total-runtime" style="font-size: 18px; font-weight: bold;">00:00:00</div>
            </div>
            <div>
              <div style="color: #666; font-size: 12px;">Avg Temperature</div>
              <div id="avg-temperature" style="font-size: 18px; font-weight: bold;">--°C</div>
            </div>
            <div>
              <div style="color: #666; font-size: 12px;">Max Speed</div>
              <div id="max-speed" style="font-size: 18px; font-weight: bold;">-- RPM</div>
            </div>
            <div>
              <div style="color: #666; font-size: 12px;">Data Points</div>
              <div id="data-points" style="font-size: 18px; font-weight: bold;">0</div>
            </div>
          </div>
        </div>

        <!-- Activity Log -->
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 16px;">
          <h3 style="margin: 0 0 16px 0;">Activity Log</h3>
          <div id="activity-log" style="max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 12px; background: #f5f5f5; padding: 12px; border-radius: 4px;">
            <div style="color: #52c41a;">[${new Date().toLocaleTimeString()}] Machine Monitor started</div>
          </div>
        </div>
      </div>
    `;

    // Make methods available globally for button handlers
    window.machineMonitor = {
      exportData: this.exportData.bind(this),
      resetData: this.resetData.bind(this)
    };

    // Initialize charts
    this.initializeCharts();
    
    // Start data simulation
    this.startDataSimulation();
  }

  initializeCharts() {
    // Simple canvas-based charts
    this.drawChart('temperature-chart', this.chartData.temperature, '#1890ff');
    this.drawChart('speed-chart', this.chartData.speed, '#722ed1');
  }

  drawChart(canvasId, data, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (data.length === 0) {
      ctx.fillStyle = '#ccc';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', width / 2, height / 2);
      return;
    }
    
    // Draw grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw data line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const maxData = Math.max(...data, 1);
    data.forEach((value, index) => {
      const x = (width / (data.length - 1)) * index;
      const y = height - (height * (value / maxData));
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }

  startDataSimulation() {
    let startTime = Date.now();
    
    this.updateInterval = setInterval(() => {
      // Simulate machine data
      const temperature = 20 + Math.random() * 15 + Math.sin(Date.now() / 10000) * 5;
      const speed = Math.random() < 0.3 ? 0 : 1000 + Math.random() * 2000;
      const vibration = Math.random() * 10;
      
      // Update data arrays
      this.chartData.temperature.push(temperature);
      this.chartData.speed.push(speed);
      this.chartData.vibration.push(vibration);
      this.chartData.timestamps.push(new Date());
      
      // Keep only last 50 data points
      if (this.chartData.temperature.length > 50) {
        this.chartData.temperature.shift();
        this.chartData.speed.shift();
        this.chartData.vibration.shift();
        this.chartData.timestamps.shift();
      }
      
      // Update UI
      this.updateDisplay(temperature, speed, startTime);
      
      // Redraw charts
      this.drawChart('temperature-chart', this.chartData.temperature, '#1890ff');
      this.drawChart('speed-chart', this.chartData.speed, '#722ed1');
      
    }, 2000); // Update every 2 seconds
  }

  updateDisplay(temperature, speed, startTime) {
    // Update status cards
    const tempEl = document.getElementById('temperature');
    const speedEl = document.getElementById('spindle-speed');
    const feedEl = document.getElementById('feed-rate');
    const statusEl = document.getElementById('machine-status');
    
    if (tempEl) tempEl.textContent = `${temperature.toFixed(1)}°C`;
    if (speedEl) speedEl.textContent = `${Math.round(speed)} RPM`;
    if (feedEl) feedEl.textContent = `${Math.round(speed * 0.1)} mm/min`;
    if (statusEl) {
      statusEl.textContent = speed > 0 ? 'RUNNING' : 'IDLE';
      statusEl.style.color = speed > 0 ? '#52c41a' : '#faad14';
    }
    
    // Update analytics
    const runtime = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(runtime / 3600);
    const minutes = Math.floor((runtime % 3600) / 60);
    const seconds = runtime % 60;
    
    const avgTemp = this.chartData.temperature.length > 0 
      ? this.chartData.temperature.reduce((a, b) => a + b, 0) / this.chartData.temperature.length 
      : 0;
    const maxSpeed = this.chartData.speed.length > 0 ? Math.max(...this.chartData.speed) : 0;
    
    const runtimeEl = document.getElementById('total-runtime');
    const avgTempEl = document.getElementById('avg-temperature');
    const maxSpeedEl = document.getElementById('max-speed');
    const dataPointsEl = document.getElementById('data-points');
    
    if (runtimeEl) runtimeEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (avgTempEl) avgTempEl.textContent = `${avgTemp.toFixed(1)}°C`;
    if (maxSpeedEl) maxSpeedEl.textContent = `${Math.round(maxSpeed)} RPM`;
    if (dataPointsEl) dataPointsEl.textContent = this.chartData.temperature.length.toString();
    
    // Add activity log entry occasionally
    if (Math.random() < 0.1) {
      this.addLogEntry(speed > 1500 ? `High speed detected: ${Math.round(speed)} RPM` : 
                      temperature > 30 ? `Temperature spike: ${temperature.toFixed(1)}°C` :
                      'System operating normally');
    }
  }

  addLogEntry(message) {
    const logEl = document.getElementById('activity-log');
    if (logEl) {
      const timestamp = new Date().toLocaleTimeString();
      const entry = document.createElement('div');
      entry.style.color = '#666';
      entry.textContent = `[${timestamp}] ${message}`;
      logEl.appendChild(entry);
      
      // Keep only last 20 entries
      while (logEl.children.length > 20) {
        logEl.removeChild(logEl.firstChild);
      }
      
      // Scroll to bottom
      logEl.scrollTop = logEl.scrollHeight;
    }
  }

  exportData() {
    const data = {
      timestamp: new Date().toISOString(),
      chartData: this.chartData,
      summary: {
        totalDataPoints: this.chartData.temperature.length,
        avgTemperature: this.chartData.temperature.reduce((a, b) => a + b, 0) / this.chartData.temperature.length,
        maxSpeed: Math.max(...this.chartData.speed),
        minSpeed: Math.min(...this.chartData.speed.filter(s => s > 0))
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `machine-monitor-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.addLogEntry('Data exported successfully');
  }

  resetData() {
    if (confirm('Are you sure you want to reset all monitoring data?')) {
      this.chartData = {
        temperature: [],
        vibration: [],
        speed: [],
        timestamps: []
      };
      
      this.initializeCharts();
      this.addLogEntry('Monitoring data reset');
    }
  }

  handleStatusUpdate(data) {
    console.log(`${this.name} received status update:`, data);
  }

  async unmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    // Clean up global references
    if (window.machineMonitor) {
      delete window.machineMonitor;
    }
    
    console.log(`${this.name} plugin unmounted`);
  }

  async destroy() {
    this.unmount();
    console.log(`${this.name} plugin destroyed`);
  }
}

// Export the plugin class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = machinemonitorPlugin;
} else {
  window.machinemonitorPlugin = machinemonitorPlugin;
}