/**
 * Plugin Details Component - Detailed plugin information and configuration
 */

import React, { useState, useCallback } from 'react'
import { PluginRegistryEntry } from '../../core/plugins/types/plugin-types'
import { PluginConfiguration } from './PluginConfiguration'
import { PluginDependencies } from './PluginDependencies'
import { PluginPermissions } from './PluginPermissions'
import { PluginMetadata } from './PluginMetadata'
import { PluginLogs } from './PluginLogs'

export interface PluginDetailsProps {
  plugin: PluginRegistryEntry
  onClose: () => void
  onAction: (action: 'load' | 'unload' | 'reload', pluginName: string) => Promise<void>
  onConfigurationUpdate: (config: any) => Promise<void>
}

type DetailTab = 'overview' | 'configuration' | 'dependencies' | 'permissions' | 'logs' | 'metadata'

/**
 * Plugin Details Component
 * Provides comprehensive plugin information and management
 */
export const PluginDetails: React.FC<PluginDetailsProps> = ({
  plugin,
  onClose,
  onAction,
  onConfigurationUpdate
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { manifest, lifecycle, verified } = plugin
  const { metadata, technical, capabilities, configuration: configSchema } = manifest
  const { status, lastError, metrics, configuration } = lifecycle

  const handleAction = useCallback(async (action: 'load' | 'unload' | 'reload') => {
    setActionLoading(action)
    try {
      await onAction(action, metadata.name)
    } finally {
      setActionLoading(null)
    }
  }, [onAction, metadata.name])

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'var(--success-color)'
      case 'loading': return 'var(--warning-color)'
      case 'error': return 'var(--error-color)'
      case 'inactive': return 'var(--text-secondary)'
      default: return 'var(--text-secondary)'
    }
  }

  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Unknown'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const canLoad = status === 'inactive' || status === 'error'
  const canUnload = status === 'active'
  const canReload = status === 'active' || status === 'error'

  const tabs: { id: DetailTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'configuration', label: 'Configuration' },
    { id: 'dependencies', label: 'Dependencies', count: Object.keys(technical.dependencies || {}).length },
    { id: 'permissions', label: 'Permissions', count: capabilities.permissions.length },
    { id: 'logs', label: 'Logs' },
    { id: 'metadata', label: 'Metadata' }
  ]

  return (
    <div className="plugin-details-overlay">
      <div className="plugin-details">
        {/* Header */}
        <div className="details-header">
          <div className="header-content">
            <div className="plugin-title">
              <div className="title-row">
                <h2>{metadata.name}</h2>
                {verified && (
                  <span className="verified-badge">✓ Verified</span>
                )}
                <span className="version-badge">v{metadata.version}</span>
              </div>
              <div className="plugin-subtitle">
                <span 
                  className="status-indicator"
                  style={{ color: getStatusColor(status) }}
                >
                  {status}
                </span>
                <span className="separator">•</span>
                <span className="category">{metadata.category}</span>
                <span className="separator">•</span>
                <span className="author">by {metadata.author.name}</span>
              </div>
            </div>

            <div className="header-actions">
              {canLoad && (
                <button
                  className="btn btn-success"
                  onClick={() => handleAction('load')}
                  disabled={actionLoading === 'load'}
                >
                  {actionLoading === 'load' ? 'Loading...' : 'Load Plugin'}
                </button>
              )}
              
              {canUnload && (
                <button
                  className="btn btn-warning"
                  onClick={() => handleAction('unload')}
                  disabled={actionLoading === 'unload'}
                >
                  {actionLoading === 'unload' ? 'Unloading...' : 'Unload Plugin'}
                </button>
              )}
              
              {canReload && (
                <button
                  className="btn btn-secondary"
                  onClick={() => handleAction('reload')}
                  disabled={actionLoading === 'reload'}
                >
                  {actionLoading === 'reload' ? 'Reloading...' : 'Reload Plugin'}
                </button>
              )}

              <button
                className="btn btn-ghost close-btn"
                onClick={onClose}
                title="Close Details"
              >
                ×
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="plugin-description">
            {metadata.description || 'No description available'}
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-label">Runtime</span>
              <span className="stat-value">{technical.runtime}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">API Level</span>
              <span className="stat-value">{capabilities.apiLevel}</span>
            </div>
            {lifecycle.loadedAt && (
              <div className="stat-item">
                <span className="stat-label">Loaded</span>
                <span className="stat-value">{formatDate(lifecycle.loadedAt)}</span>
              </div>
            )}
            {metrics && (
              <>
                <div className="stat-item">
                  <span className="stat-label">Memory</span>
                  <span className="stat-value">{formatSize(metrics.memoryUsage)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">API Calls</span>
                  <span className="stat-value">{metrics.apiCalls}</span>
                </div>
                {metrics.errors > 0 && (
                  <div className="stat-item error">
                    <span className="stat-label">Errors</span>
                    <span className="stat-value">{metrics.errors}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Error Display */}
        {lastError && (
          <div className="error-banner">
            <div className="error-header">
              <span className="error-icon">⚠️</span>
              <span className="error-title">Plugin Error</span>
              <span className="error-time">{formatDate(lastError.timestamp)}</span>
            </div>
            <div className="error-message">{lastError.message}</div>
            {lastError.stack && (
              <details className="error-stack">
                <summary>Stack Trace</summary>
                <pre>{lastError.stack}</pre>
              </details>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="details-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="tab-count">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="details-content">
          {activeTab === 'overview' && (
            <div className="tab-panel">
              <div className="overview-grid">
                <div className="overview-section">
                  <h3>Basic Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Name:</span>
                      <span className="value">{metadata.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Version:</span>
                      <span className="value">{metadata.version}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Category:</span>
                      <span className="value">{metadata.category}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Author:</span>
                      <span className="value">{metadata.author.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">License:</span>
                      <span className="value">{metadata.license}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Runtime:</span>
                      <span className="value">{technical.runtime}</span>
                    </div>
                  </div>
                </div>

                <div className="overview-section">
                  <h3>Capabilities</h3>
                  <div className="capabilities-list">
                    <div className="capability-item">
                      <span className="label">API Level:</span>
                      <span className="value api-level">{capabilities.apiLevel}</span>
                    </div>
                    <div className="capability-item">
                      <span className="label">Features:</span>
                      <div className="feature-tags">
                        {capabilities.features.map(feature => (
                          <span key={feature.type} className="feature-tag">
                            {feature.type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="capability-item">
                      <span className="label">Hooks:</span>
                      <div className="hook-tags">
                        {capabilities.hooks.map(hook => (
                          <span key={hook.type} className="hook-tag">
                            {hook.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {metadata.keywords.length > 0 && (
                  <div className="overview-section">
                    <h3>Keywords</h3>
                    <div className="keywords">
                      {metadata.keywords.map(keyword => (
                        <span key={keyword} className="keyword-tag">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(metadata.homepage || metadata.repository) && (
                  <div className="overview-section">
                    <h3>Links</h3>
                    <div className="links">
                      {metadata.homepage && (
                        <a
                          href={metadata.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-item"
                        >
                          🏠 Homepage
                        </a>
                      )}
                      {metadata.repository && (
                        <a
                          href={typeof metadata.repository === 'string' ? metadata.repository : metadata.repository.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-item"
                        >
                          📦 Repository
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'configuration' && (
            <PluginConfiguration
              plugin={plugin}
              onUpdate={onConfigurationUpdate}
            />
          )}

          {activeTab === 'dependencies' && (
            <PluginDependencies plugin={plugin} />
          )}

          {activeTab === 'permissions' && (
            <PluginPermissions plugin={plugin} />
          )}

          {activeTab === 'logs' && (
            <PluginLogs plugin={plugin} />
          )}

          {activeTab === 'metadata' && (
            <PluginMetadata plugin={plugin} />
          )}
        </div>
      </div>
    </div>
  )
}

// CSS Styles
const styles = `
.plugin-details-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.plugin-details {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.details-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.plugin-title {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.title-row h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.verified-badge {
  background: var(--success-color);
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-weight: 500;
}

.version-badge {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-family: monospace;
  font-weight: 500;
}

.plugin-subtitle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.status-indicator {
  font-weight: 600;
  text-transform: capitalize;
}

.separator {
  opacity: 0.5;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.close-btn {
  font-size: 1.5rem;
  padding: 0.25rem 0.5rem;
}

.plugin-description {
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.quick-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-item.error .stat-value {
  color: var(--error-color);
  font-weight: 600;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  font-weight: 500;
}

.stat-value {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
}

.error-banner {
  margin: 1rem 1.5rem 0;
  background: var(--error-bg);
  border: 1px solid var(--error-color);
  border-radius: 0.5rem;
  padding: 1rem;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.error-title {
  font-weight: 600;
  color: var(--error-text);
  flex: 1;
}

.error-time {
  font-size: 0.75rem;
  color: var(--error-text);
  opacity: 0.8;
}

.error-message {
  color: var(--error-text);
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.error-stack {
  margin-top: 0.5rem;
}

.error-stack summary {
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--error-text);
  opacity: 0.8;
}

.error-stack pre {
  margin-top: 0.5rem;
  font-size: 0.625rem;
  color: var(--error-text);
  opacity: 0.7;
  overflow-x: auto;
}

.details-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.tab-button {
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.tab-button.active {
  color: var(--primary-color);
  background: var(--primary-bg);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-color);
}

.tab-count {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 1rem;
  font-weight: 600;
}

.tab-button.active .tab-count {
  background: var(--primary-color);
  color: white;
}

.details-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.tab-panel {
  height: 100%;
}

.overview-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.overview-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
}

.overview-section h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.info-grid {
  display: grid;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.375rem 0;
  border-bottom: 1px solid var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-item .value {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
}

.capabilities-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.capability-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.capability-item .label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.api-level {
  background: var(--primary-bg);
  color: var(--primary-color);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
}

.feature-tags,
.hook-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.feature-tag,
.hook-tag {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.keyword-tag {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
}

.links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-item {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.375rem 0;
  border-bottom: 1px solid var(--border-color);
  transition: color 0.2s ease;
}

.link-item:hover {
  color: var(--primary-hover);
}

.link-item:last-child {
  border-bottom: none;
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

.btn.btn-success {
  background: var(--success-color);
  border-color: var(--success-color);
  color: white;
}

.btn.btn-success:hover {
  background: var(--success-hover);
  border-color: var(--success-hover);
}

.btn.btn-warning {
  background: var(--warning-color);
  border-color: var(--warning-color);
  color: white;
}

.btn.btn-warning:hover {
  background: var(--warning-hover);
  border-color: var(--warning-hover);
}

.btn.btn-secondary {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}

.btn.btn-ghost {
  background: transparent;
  border-color: transparent;
}

.btn.btn-ghost:hover {
  background: var(--bg-tertiary);
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}