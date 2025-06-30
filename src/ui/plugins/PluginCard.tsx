/**
 * Plugin Card Component - Individual plugin display card
 */

import React, { useState, useCallback } from 'react'
import { PluginRegistryEntry, PluginStatus } from '../../core/plugins/types/plugin-types'

export interface PluginCardProps {
  plugin: PluginRegistryEntry
  selected?: boolean
  loading?: boolean
  onSelect: () => void
  onAction: (action: 'load' | 'unload' | 'reload', pluginName: string) => Promise<void>
}

/**
 * Plugin Card Component
 * Displays plugin information and provides quick actions
 */
export const PluginCard: React.FC<PluginCardProps> = ({
  plugin,
  selected = false,
  loading = false,
  onSelect,
  onAction
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { manifest, lifecycle, verified } = plugin
  const { metadata } = manifest
  const { status, lastError, metrics } = lifecycle

  const handleAction = useCallback(async (action: 'load' | 'unload' | 'reload') => {
    setActionLoading(action)
    try {
      await onAction(action, metadata.name)
    } finally {
      setActionLoading(null)
    }
  }, [onAction, metadata.name])

  const getStatusColor = (status: PluginStatus): string => {
    switch (status) {
      case 'active': return 'var(--success-color)'
      case 'loading': return 'var(--warning-color)'
      case 'error': return 'var(--error-color)'
      case 'inactive': return 'var(--text-secondary)'
      default: return 'var(--text-secondary)'
    }
  }

  const getStatusIcon = (status: PluginStatus): string => {
    switch (status) {
      case 'active': return '●'
      case 'loading': return '◐'
      case 'error': return '●'
      case 'inactive': return '○'
      default: return '○'
    }
  }

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Unknown'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const canLoad = status === 'inactive' || status === 'error'
  const canUnload = status === 'active'
  const canReload = status === 'active' || status === 'error'

  return (
    <div
      className={`plugin-card ${selected ? 'selected' : ''} ${status}`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="plugin-header">
        <div className="plugin-title">
          <div className="plugin-name">
            <span className="name-text">{metadata.name}</span>
            {verified && (
              <span className="verified-badge" title="Verified Plugin">
                ✓
              </span>
            )}
          </div>
          <div className="plugin-version">v{metadata.version}</div>
        </div>
        
        <div className="plugin-status">
          <span
            className="status-indicator"
            style={{ color: getStatusColor(status) }}
            title={`Status: ${status}`}
          >
            {getStatusIcon(status)}
          </span>
          <span className="status-text">{status}</span>
        </div>
      </div>

      {/* Description */}
      <div className="plugin-description">
        {metadata.description || 'No description available'}
      </div>

      {/* Metadata */}
      <div className="plugin-metadata">
        <div className="metadata-item">
          <span className="label">Category:</span>
          <span className="value category-badge">{metadata.category}</span>
        </div>
        <div className="metadata-item">
          <span className="label">Author:</span>
          <span className="value">{metadata.author.name}</span>
        </div>
        {lifecycle.loadedAt && (
          <div className="metadata-item">
            <span className="label">Loaded:</span>
            <span className="value">{formatDate(lifecycle.loadedAt)}</span>
          </div>
        )}
      </div>

      {/* Metrics */}
      {status === 'active' && metrics && (
        <div className="plugin-metrics">
          <div className="metric-item">
            <span className="metric-label">Memory:</span>
            <span className="metric-value">{formatSize(metrics.memoryUsage)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">API Calls:</span>
            <span className="metric-value">{metrics.apiCalls}</span>
          </div>
          {metrics.errors > 0 && (
            <div className="metric-item error">
              <span className="metric-label">Errors:</span>
              <span className="metric-value">{metrics.errors}</span>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {lastError && (
        <div className="plugin-error">
          <div className="error-header">
            <span className="error-icon">⚠️</span>
            <span className="error-title">Last Error</span>
          </div>
          <div className="error-message">{lastError.message}</div>
          <div className="error-time">
            {formatDate(lastError.timestamp)}
          </div>
        </div>
      )}

      {/* Tags */}
      {metadata.keywords.length > 0 && (
        <div className="plugin-tags">
          {metadata.keywords.slice(0, 3).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
          {metadata.keywords.length > 3 && (
            <span className="tag more">+{metadata.keywords.length - 3}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="plugin-actions">
        {canLoad && (
          <button
            className="action-btn load"
            onClick={(e) => {
              e.stopPropagation()
              handleAction('load')
            }}
            disabled={loading || actionLoading === 'load'}
            title="Load Plugin"
          >
            {actionLoading === 'load' ? '⟳' : '▶'}
          </button>
        )}
        
        {canUnload && (
          <button
            className="action-btn unload"
            onClick={(e) => {
              e.stopPropagation()
              handleAction('unload')
            }}
            disabled={loading || actionLoading === 'unload'}
            title="Unload Plugin"
          >
            {actionLoading === 'unload' ? '⟳' : '⏸'}
          </button>
        )}
        
        {canReload && (
          <button
            className="action-btn reload"
            onClick={(e) => {
              e.stopPropagation()
              handleAction('reload')
            }}
            disabled={loading || actionLoading === 'reload'}
            title="Reload Plugin"
          >
            {actionLoading === 'reload' ? '⟳' : '↻'}
          </button>
        )}

        <button
          className="action-btn details"
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          title="View Details"
        >
          ⓘ
        </button>
      </div>
    </div>
  )
}

// CSS Styles
const styles = `
.plugin-card {
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.plugin-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.plugin-card.selected {
  border-color: var(--primary-color);
  background: var(--primary-bg);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
}

.plugin-card.active {
  border-left: 4px solid var(--success-color);
}

.plugin-card.error {
  border-left: 4px solid var(--error-color);
}

.plugin-card.loading {
  border-left: 4px solid var(--warning-color);
}

.plugin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.plugin-title {
  flex: 1;
}

.plugin-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.name-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.verified-badge {
  background: var(--success-color);
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 1rem;
  font-weight: 500;
}

.plugin-version {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-family: monospace;
}

.plugin-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
}

.status-indicator {
  font-size: 1rem;
}

.status-text {
  text-transform: capitalize;
  color: var(--text-secondary);
  font-weight: 500;
}

.plugin-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plugin-metadata {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metadata-item .label {
  color: var(--text-secondary);
  font-weight: 500;
}

.metadata-item .value {
  color: var(--text-primary);
}

.category-badge {
  background: var(--bg-tertiary);
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
  text-transform: capitalize;
}

.plugin-metrics {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 0.375rem;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.metric-item.error .metric-value {
  color: var(--error-color);
  font-weight: 600;
}

.metric-label {
  color: var(--text-secondary);
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.metric-value {
  color: var(--text-primary);
  font-weight: 500;
}

.plugin-error {
  background: var(--error-bg);
  border: 1px solid var(--error-color);
  border-radius: 0.375rem;
  padding: 0.5rem;
  margin-bottom: 0.75rem;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.375rem;
}

.error-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--error-text);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.error-message {
  font-size: 0.75rem;
  color: var(--error-text);
  line-height: 1.3;
  margin-bottom: 0.25rem;
}

.error-time {
  font-size: 0.625rem;
  color: var(--error-text);
  opacity: 0.8;
}

.plugin-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.tag {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 500;
  text-transform: lowercase;
}

.tag.more {
  background: var(--primary-bg);
  color: var(--primary-color);
  font-weight: 600;
}

.plugin-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
  margin-top: auto;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-quaternary);
  color: var(--text-primary);
  transform: scale(1.05);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-btn.load:hover {
  background: var(--success-bg);
  color: var(--success-color);
  border-color: var(--success-color);
}

.action-btn.unload:hover {
  background: var(--warning-bg);
  color: var(--warning-color);
  border-color: var(--warning-color);
}

.action-btn.reload:hover {
  background: var(--info-bg);
  color: var(--info-color);
  border-color: var(--info-color);
}

.action-btn.details:hover {
  background: var(--primary-bg);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.action-btn:disabled .action-btn-icon {
  animation: spin 1s linear infinite;
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}