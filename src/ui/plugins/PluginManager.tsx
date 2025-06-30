/**
 * Plugin Manager UI Component - Main interface for plugin management
 */

import React, { useState, useEffect, useCallback } from 'react'
import { PluginManagerState, PluginRegistryEntry } from '../../core/plugins/types/plugin-types'
import { PluginCard } from './PluginCard'
import { PluginDetails } from './PluginDetails'
import { PluginInstaller } from './PluginInstaller'
import { PluginFilters } from './PluginFilters'
import { PluginMetrics } from './PluginMetrics'
import { usePluginManager } from '../../hooks/usePluginManager'

export interface PluginManagerProps {
  className?: string
  onPluginSelect?: (plugin: PluginRegistryEntry) => void
  showMetrics?: boolean
  showInstaller?: boolean
}

export interface PluginFilterState {
  status: string
  category: string
  search: string
  author: string
}

/**
 * Plugin Manager Component
 * Provides comprehensive plugin management interface
 */
export const PluginManager: React.FC<PluginManagerProps> = ({
  className = '',
  onPluginSelect,
  showMetrics = true,
  showInstaller = true
}) => {
  const {
    plugins,
    state,
    diagnostics,
    loadPlugin,
    unloadPlugin,
    reloadPlugin,
    updateConfiguration,
    discoverPlugins,
    getPluginStatus
  } = usePluginManager()

  const [selectedPlugin, setSelectedPlugin] = useState<PluginRegistryEntry | null>(null)
  const [view, setView] = useState<'list' | 'grid' | 'details'>('grid')
  const [filters, setFilters] = useState<PluginFilterState>({
    status: 'all',
    category: 'all',
    search: '',
    author: 'all'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter plugins based on current filters
  const filteredPlugins = plugins.filter(plugin => {
    if (filters.status !== 'all' && plugin.lifecycle.status !== filters.status) {
      return false
    }

    if (filters.category !== 'all' && plugin.manifest.metadata.category !== filters.category) {
      return false
    }

    if (filters.author !== 'all' && plugin.manifest.metadata.author.name !== filters.author) {
      return false
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const searchableText = [
        plugin.manifest.metadata.name,
        plugin.manifest.metadata.description,
        ...plugin.manifest.metadata.keywords
      ].join(' ').toLowerCase()
      
      if (!searchableText.includes(searchTerm)) {
        return false
      }
    }

    return true
  })

  const handlePluginSelect = useCallback((plugin: PluginRegistryEntry) => {
    setSelectedPlugin(plugin)
    onPluginSelect?.(plugin)
  }, [onPluginSelect])

  const handlePluginAction = useCallback(async (
    action: 'load' | 'unload' | 'reload',
    pluginName: string
  ) => {
    setLoading(true)
    setError(null)

    try {
      switch (action) {
        case 'load':
          await loadPlugin(pluginName)
          break
        case 'unload':
          await unloadPlugin(pluginName)
          break
        case 'reload':
          await reloadPlugin(pluginName)
          break
      }
    } catch (err) {
      setError(`Failed to ${action} plugin: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [loadPlugin, unloadPlugin, reloadPlugin])

  const handleDiscoverPlugins = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await discoverPlugins()
    } catch (err) {
      setError(`Failed to discover plugins: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [discoverPlugins])

  const handleFilterChange = useCallback((newFilters: Partial<PluginFilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Get unique categories and authors for filter options
  const categories = Array.from(new Set(plugins.map(p => p.manifest.metadata.category)))
  const authors = Array.from(new Set(plugins.map(p => p.manifest.metadata.author.name)))

  return (
    <div className={`plugin-manager ${className}`}>
      {/* Header */}
      <div className="plugin-manager-header">
        <div className="header-content">
          <h2>Plugin Manager</h2>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={handleDiscoverPlugins}
              disabled={loading}
            >
              {loading ? 'Discovering...' : 'Discover Plugins'}
            </button>
            {showInstaller && (
              <PluginInstaller />
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="system-status">
          <div className="status-item">
            <span className="label">Total Plugins:</span>
            <span className="value">{state.totalPlugins}</span>
          </div>
          <div className="status-item">
            <span className="label">Active:</span>
            <span className="value active">{state.activePlugins}</span>
          </div>
          <div className="status-item">
            <span className="label">Loading:</span>
            <span className="value loading">{state.loadingPlugins}</span>
          </div>
          <div className="status-item">
            <span className="label">Errors:</span>
            <span className="value error">{state.errorPlugins}</span>
          </div>
          <div className="status-item">
            <span className="label">Health:</span>
            <span className={`value health-${state.systemHealth}`}>
              {state.systemHealth}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
          <button
            className="error-close"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Metrics */}
      {showMetrics && diagnostics && (
        <PluginMetrics diagnostics={diagnostics} />
      )}

      {/* Filters and View Controls */}
      <div className="plugin-controls">
        <PluginFilters
          filters={filters}
          categories={categories}
          authors={authors}
          onFilterChange={handleFilterChange}
        />

        <div className="view-controls">
          <button
            className={`view-btn ${view === 'grid' ? 'active' : ''}`}
            onClick={() => setView('grid')}
            title="Grid View"
          >
            ⊞
          </button>
          <button
            className={`view-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
            title="List View"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Plugin List/Grid */}
      <div className={`plugin-container view-${view}`}>
        {filteredPlugins.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔌</div>
            <h3>No plugins found</h3>
            <p>
              {filters.search || filters.status !== 'all' || filters.category !== 'all'
                ? 'No plugins match your current filters.'
                : 'No plugins are currently installed or discovered.'
              }
            </p>
            {!filters.search && filters.status === 'all' && filters.category === 'all' && (
              <button
                className="btn btn-primary"
                onClick={handleDiscoverPlugins}
                disabled={loading}
              >
                Discover Plugins
              </button>
            )}
          </div>
        ) : (
          <div className="plugin-grid">
            {filteredPlugins.map(plugin => (
              <PluginCard
                key={plugin.manifest.metadata.name}
                plugin={plugin}
                onSelect={() => handlePluginSelect(plugin)}
                onAction={handlePluginAction}
                loading={loading}
                selected={selectedPlugin?.manifest.metadata.name === plugin.manifest.metadata.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Plugin Details Panel */}
      {selectedPlugin && view !== 'details' && (
        <PluginDetails
          plugin={selectedPlugin}
          onClose={() => setSelectedPlugin(null)}
          onAction={handlePluginAction}
          onConfigurationUpdate={(config) => 
            updateConfiguration(selectedPlugin.manifest.metadata.name, config)
          }
        />
      )}
    </div>
  )
}

// CSS Styles
const styles = `
.plugin-manager {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.plugin-manager-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-content h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.system-status {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.status-item .label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.status-item .value {
  font-size: 1.25rem;
  font-weight: 600;
}

.status-item .value.active {
  color: var(--success-color);
}

.status-item .value.loading {
  color: var(--warning-color);
}

.status-item .value.error {
  color: var(--error-color);
}

.status-item .value.health-healthy {
  color: var(--success-color);
}

.status-item .value.health-degraded {
  color: var(--warning-color);
}

.status-item .value.health-critical {
  color: var(--error-color);
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--error-bg);
  border: 1px solid var(--error-color);
  border-radius: 0.375rem;
  margin: 1rem;
  color: var(--error-text);
}

.error-close {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--error-text);
  opacity: 0.7;
}

.error-close:hover {
  opacity: 1;
}

.plugin-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.view-controls {
  display: flex;
  gap: 0.25rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  overflow: hidden;
}

.view-btn {
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.view-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.view-btn.active {
  background: var(--primary-color);
  color: white;
}

.plugin-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.plugin-grid {
  display: grid;
  gap: 1rem;
}

.view-grid .plugin-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.view-list .plugin-grid {
  grid-template-columns: 1fr;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  max-width: 400px;
  line-height: 1.5;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  background: var(--bg-tertiary);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.btn-primary {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.btn.btn-primary:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.btn.btn-secondary {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}