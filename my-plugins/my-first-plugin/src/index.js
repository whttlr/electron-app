/**
 * CNC Jog Controls Plugin
 * 
 * This is a basic plugin template. You can modify this file to add your
 * custom functionality to the CNC Jog Controls application.
 */

class myfirstpluginPlugin {
  constructor(api) {
    this.api = api;
    this.name = 'my-first-plugin';
  }

  // Called when the plugin is loaded
  async initialize() {
    console.log(`${this.name} plugin initializing...`);
    
    // Register any commands or event listeners here
    this.api.events.on('machine.status.update', this.handleStatusUpdate.bind(this));
    
    console.log(`${this.name} plugin initialized successfully!`);
  }

  // Called when the plugin UI should be mounted
  async mount(container) {
    container.innerHTML = `
      <div style="padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
        <h2>${this.name} Plugin</h2>
        <p>This is a basic plugin template.</p>
        <p>Edit <code>src/index.js</code> to customize this plugin.</p>
        <button onclick="alert('Hello from ${this.name}!')">Test Button</button>
      </div>
    `;
  }

  // Called when the plugin should be unmounted
  async unmount() {
    console.log(`${this.name} plugin unmounted`);
  }

  // Example event handler
  handleStatusUpdate(data) {
    console.log(`${this.name} received status update:`, data);
  }

  // Called when the plugin is being destroyed
  async destroy() {
    console.log(`${this.name} plugin destroyed`);
  }
}

// Export the plugin class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = myfirstpluginPlugin;
} else {
  window.myfirstpluginPlugin = myfirstpluginPlugin;
}
