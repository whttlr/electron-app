/**
 * G-code Snippets Plugin
 * 
 * A productivity plugin for managing and inserting common G-code snippets.
 * This plugin demonstrates modal placement and practical CNC workflow tools.
 */

class gcodesnippetsPlugin {
  constructor(api) {
    this.api = api;
    this.name = 'gcode-snippets';
    this.snippets = this.loadSnippets();
  }

  async initialize() {
    console.log(`${this.name} plugin initializing...`);
    
    // Load saved snippets
    this.snippets = this.loadSnippets();
    
    console.log(`${this.name} plugin initialized successfully!`);
  }

  async mount(container) {
    // Create the snippet manager interface
    container.innerHTML = `
      <div style="width: 600px; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #1890ff;">G-code Snippets</h2>
          <div>
            <button onclick="window.gcodeSnippets.addSnippet()" style="padding: 6px 12px; background: #52c41a; color: white; border: none; border-radius: 4px; margin-right: 8px; cursor: pointer;">
              Add Snippet
            </button>
            <button onclick="window.gcodeSnippets.importSnippets()" style="padding: 6px 12px; background: #1890ff; color: white; border: none; border-radius: 4px; margin-right: 8px; cursor: pointer;">
              Import
            </button>
            <button onclick="window.gcodeSnippets.exportSnippets()" style="padding: 6px 12px; background: #722ed1; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Export
            </button>
          </div>
        </div>

        <!-- Categories -->
        <div style="margin-bottom: 16px;">
          <div style="margin-bottom: 8px; font-weight: bold;">Categories:</div>
          <div id="category-tabs" style="display: flex; gap: 8px; margin-bottom: 16px;">
            <button class="category-tab active" onclick="window.gcodeSnippets.showCategory('all')" data-category="all">All</button>
            <button class="category-tab" onclick="window.gcodeSnippets.showCategory('movement')" data-category="movement">Movement</button>
            <button class="category-tab" onclick="window.gcodeSnippets.showCategory('tools')" data-category="tools">Tools</button>
            <button class="category-tab" onclick="window.gcodeSnippets.showCategory('setup')" data-category="setup">Setup</button>
            <button class="category-tab" onclick="window.gcodeSnippets.showCategory('custom')" data-category="custom">Custom</button>
          </div>
        </div>

        <!-- Search -->
        <div style="margin-bottom: 16px;">
          <input 
            type="text" 
            id="snippet-search" 
            placeholder="Search snippets..." 
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
            oninput="window.gcodeSnippets.filterSnippets(this.value)"
          />
        </div>

        <!-- Snippets List -->
        <div id="snippets-container" style="max-height: 400px; overflow-y: auto; border: 1px solid #f0f0f0; border-radius: 4px;">
          <!-- Snippets will be populated here -->
        </div>

        <!-- Selected Code Display -->
        <div style="margin-top: 16px;">
          <div style="margin-bottom: 8px; font-weight: bold;">Selected Code:</div>
          <textarea 
            id="selected-code" 
            style="width: 100%; height: 120px; font-family: monospace; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"
            placeholder="Select a snippet to view its code..."
            readonly
          ></textarea>
          <div style="margin-top: 8px; display: flex; gap: 8px;">
            <button onclick="window.gcodeSnippets.copyToClipboard()" style="padding: 6px 12px; background: #fa8c16; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Copy to Clipboard
            </button>
            <button onclick="window.gcodeSnippets.sendToMachine()" style="padding: 6px 12px; background: #52c41a; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Send to Machine
            </button>
            <button onclick="window.gcodeSnippets.insertIntoEditor()" style="padding: 6px 12px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Insert into Editor
            </button>
          </div>
        </div>
      </div>

      <style>
        .category-tab {
          padding: 6px 12px;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .category-tab:hover {
          background: #e6f7ff;
          border-color: #1890ff;
        }
        .category-tab.active {
          background: #1890ff;
          color: white;
          border-color: #1890ff;
        }
        .snippet-item {
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background 0.2s;
        }
        .snippet-item:hover {
          background: #f5f5f5;
        }
        .snippet-item.selected {
          background: #e6f7ff;
          border-left: 3px solid #1890ff;
        }
        .snippet-title {
          font-weight: bold;
          margin-bottom: 4px;
        }
        .snippet-description {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }
        .snippet-code {
          font-family: monospace;
          font-size: 11px;
          color: #722ed1;
          background: #f9f9f9;
          padding: 2px 4px;
          border-radius: 2px;
        }
      </style>
    `;

    // Make methods available globally
    window.gcodeSnippets = {
      showCategory: this.showCategory.bind(this),
      filterSnippets: this.filterSnippets.bind(this),
      selectSnippet: this.selectSnippet.bind(this),
      addSnippet: this.addSnippet.bind(this),
      editSnippet: this.editSnippet.bind(this),
      deleteSnippet: this.deleteSnippet.bind(this),
      copyToClipboard: this.copyToClipboard.bind(this),
      sendToMachine: this.sendToMachine.bind(this),
      insertIntoEditor: this.insertIntoEditor.bind(this),
      importSnippets: this.importSnippets.bind(this),
      exportSnippets: this.exportSnippets.bind(this)
    };

    this.currentCategory = 'all';
    this.selectedSnippet = null;
    
    // Render initial snippets
    this.renderSnippets();
  }

  loadSnippets() {
    const saved = this.api.storage.get('snippets');
    if (saved) {
      return JSON.parse(saved);
    }

    // Default snippets
    return [
      {
        id: 'home-all',
        title: 'Home All Axes',
        description: 'Home all axes to their reference position',
        category: 'setup',
        code: 'G28'
      },
      {
        id: 'rapid-move',
        title: 'Rapid Positioning',
        description: 'Move rapidly to X0 Y0',
        category: 'movement',
        code: 'G0 X0 Y0'
      },
      {
        id: 'linear-move',
        title: 'Linear Interpolation',
        description: 'Move in a straight line at feed rate',
        category: 'movement',
        code: 'G1 X10 Y10 F1000'
      },
      {
        id: 'spindle-on',
        title: 'Spindle On CW',
        description: 'Start spindle clockwise at 1000 RPM',
        category: 'tools',
        code: 'M3 S1000'
      },
      {
        id: 'spindle-off',
        title: 'Spindle Off',
        description: 'Stop spindle rotation',
        category: 'tools',
        code: 'M5'
      },
      {
        id: 'coolant-on',
        title: 'Coolant On',
        description: 'Turn on flood coolant',
        category: 'tools',
        code: 'M8'
      },
      {
        id: 'coolant-off',
        title: 'Coolant Off',
        description: 'Turn off coolant',
        category: 'tools',
        code: 'M9'
      },
      {
        id: 'tool-change',
        title: 'Tool Change',
        description: 'Change to tool number 1',
        category: 'tools',
        code: 'M6 T1'
      },
      {
        id: 'absolute-mode',
        title: 'Absolute Positioning',
        description: 'Set coordinate system to absolute mode',
        category: 'setup',
        code: 'G90'
      },
      {
        id: 'relative-mode',
        title: 'Incremental Positioning',
        description: 'Set coordinate system to incremental mode',
        category: 'setup',
        code: 'G91'
      },
      {
        id: 'program-end',
        title: 'Program End',
        description: 'End program and rewind',
        category: 'setup',
        code: 'M30'
      }
    ];
  }

  saveSnippets() {
    this.api.storage.set('snippets', JSON.stringify(this.snippets));
  }

  renderSnippets() {
    const container = document.getElementById('snippets-container');
    if (!container) return;

    let filteredSnippets = this.snippets;
    
    // Filter by category
    if (this.currentCategory !== 'all') {
      filteredSnippets = filteredSnippets.filter(s => s.category === this.currentCategory);
    }

    // Filter by search
    const searchTerm = document.getElementById('snippet-search')?.value.toLowerCase();
    if (searchTerm) {
      filteredSnippets = filteredSnippets.filter(s => 
        s.title.toLowerCase().includes(searchTerm) ||
        s.description.toLowerCase().includes(searchTerm) ||
        s.code.toLowerCase().includes(searchTerm)
      );
    }

    if (filteredSnippets.length === 0) {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #666;">
          <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
          <div>No snippets found</div>
          <div style="font-size: 12px; margin-top: 8px;">Try a different category or search term</div>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredSnippets.map(snippet => `
      <div class="snippet-item" onclick="window.gcodeSnippets.selectSnippet('${snippet.id}')" data-id="${snippet.id}">
        <div class="snippet-title">${snippet.title}</div>
        <div class="snippet-description">${snippet.description}</div>
        <div class="snippet-code">${snippet.code}</div>
        <div style="margin-top: 4px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: #999; text-transform: uppercase;">${snippet.category}</span>
          <div>
            <button onclick="event.stopPropagation(); window.gcodeSnippets.editSnippet('${snippet.id}')" style="font-size: 12px; padding: 2px 6px; background: #fa8c16; color: white; border: none; border-radius: 2px; margin-right: 4px; cursor: pointer;">Edit</button>
            <button onclick="event.stopPropagation(); window.gcodeSnippets.deleteSnippet('${snippet.id}')" style="font-size: 12px; padding: 2px 6px; background: #ff4d4f; color: white; border: none; border-radius: 2px; cursor: pointer;">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  showCategory(category) {
    this.currentCategory = category;
    
    // Update tab appearance
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.category === category) {
        tab.classList.add('active');
      }
    });

    this.renderSnippets();
  }

  filterSnippets(searchTerm) {
    this.renderSnippets();
  }

  selectSnippet(snippetId) {
    const snippet = this.snippets.find(s => s.id === snippetId);
    if (!snippet) return;

    this.selectedSnippet = snippet;

    // Update visual selection
    document.querySelectorAll('.snippet-item').forEach(item => {
      item.classList.remove('selected');
      if (item.dataset.id === snippetId) {
        item.classList.add('selected');
      }
    });

    // Show code in textarea
    const codeArea = document.getElementById('selected-code');
    if (codeArea) {
      codeArea.value = snippet.code;
    }
  }

  addSnippet() {
    const title = prompt('Snippet title:');
    if (!title) return;

    const description = prompt('Snippet description:');
    if (!description) return;

    const code = prompt('G-code:');
    if (!code) return;

    const category = prompt('Category (movement, tools, setup, custom):', 'custom');

    const snippet = {
      id: Date.now().toString(),
      title,
      description,
      category: category || 'custom',
      code
    };

    this.snippets.push(snippet);
    this.saveSnippets();
    this.renderSnippets();
  }

  editSnippet(snippetId) {
    const snippet = this.snippets.find(s => s.id === snippetId);
    if (!snippet) return;

    const title = prompt('Snippet title:', snippet.title);
    if (title === null) return;

    const description = prompt('Snippet description:', snippet.description);
    if (description === null) return;

    const code = prompt('G-code:', snippet.code);
    if (code === null) return;

    const category = prompt('Category:', snippet.category);
    if (category === null) return;

    snippet.title = title;
    snippet.description = description;
    snippet.code = code;
    snippet.category = category;

    this.saveSnippets();
    this.renderSnippets();
  }

  deleteSnippet(snippetId) {
    if (!confirm('Delete this snippet?')) return;

    this.snippets = this.snippets.filter(s => s.id !== snippetId);
    this.saveSnippets();
    this.renderSnippets();

    // Clear selection if deleted snippet was selected
    if (this.selectedSnippet?.id === snippetId) {
      this.selectedSnippet = null;
      const codeArea = document.getElementById('selected-code');
      if (codeArea) codeArea.value = '';
    }
  }

  copyToClipboard() {
    if (!this.selectedSnippet) {
      alert('Please select a snippet first');
      return;
    }

    navigator.clipboard.writeText(this.selectedSnippet.code).then(() => {
      alert('Code copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const codeArea = document.getElementById('selected-code');
      if (codeArea) {
        codeArea.select();
        document.execCommand('copy');
        alert('Code copied to clipboard!');
      }
    });
  }

  sendToMachine() {
    if (!this.selectedSnippet) {
      alert('Please select a snippet first');
      return;
    }

    // Send command via API
    this.api.machine.sendCommand(this.selectedSnippet.code);
    alert(`Sent to machine: ${this.selectedSnippet.code}`);
  }

  insertIntoEditor() {
    if (!this.selectedSnippet) {
      alert('Please select a snippet first');
      return;
    }

    // This would integrate with a G-code editor if available
    console.log('Insert into editor:', this.selectedSnippet.code);
    alert(`Insert into editor: ${this.selectedSnippet.code}\n(Editor integration not implemented)`);
  }

  exportSnippets() {
    const data = {
      version: '1.0',
      exported: new Date().toISOString(),
      snippets: this.snippets
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gcode-snippets-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importSnippets() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.snippets && Array.isArray(data.snippets)) {
            // Add imported snippets with new IDs to avoid conflicts
            const importedSnippets = data.snippets.map(snippet => ({
              ...snippet,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
            }));
            
            this.snippets.push(...importedSnippets);
            this.saveSnippets();
            this.renderSnippets();
            alert(`Imported ${importedSnippets.length} snippets successfully!`);
          } else {
            throw new Error('Invalid file format');
          }
        } catch (error) {
          alert('Failed to import snippets. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  async unmount() {
    // Clean up global references
    if (window.gcodeSnippets) {
      delete window.gcodeSnippets;
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
  module.exports = gcodesnippetsPlugin;
} else {
  window.gcodesnippetsPlugin = gcodesnippetsPlugin;
}