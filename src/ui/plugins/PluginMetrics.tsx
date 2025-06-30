/**
 * Plugin Metrics Component - Displays system-wide plugin metrics and diagnostics
 */

import React, { useState, useMemo } from 'react'

export interface PluginDiagnostics {
  state: {
    totalPlugins: number
    activePlugins: number
    loadingPlugins: number
    errorPlugins: number
    systemHealth: 'healthy' | 'degraded' | 'critical'
  }
  plugins: Array<{
    name: string
    status: string
    version: string
    memoryUsage: number
    lastActivity: Date
  }>
  loadingQueue: string[]
  dependencyGraph: Array<[string, string[]]>
  api: {
    registeredPlugins: number
    totalAPICalls: number
    activeRateLimits: number
    activeCalls: number
    topAPIUsers: Array<{ plugin: string; calls: number }>
    recentErrors: Array<{
      plugin: string
      method: string
      errors: number
      lastCall: Date
    }>
  }
  security: {
    totalPlugins: number
    trustedPlugins: number
    blockedPlugins: number
    activeMonitors: number
    recentViolations: Array<{
      type: string
      severity: string
      description: string
      timestamp: Date
    }>
    sandboxes: number
  }
}

export interface PluginMetricsProps {
  diagnostics: PluginDiagnostics
  className?: string
  compact?: boolean
}

/**
 * Plugin Metrics Component
 * Displays comprehensive plugin system metrics and diagnostics
 */
export const PluginMetrics: React.FC<PluginMetricsProps> = ({
  diagnostics,
  className = '',
  compact = false
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'performance' | 'security' | 'api'>('overview')

  const { state, plugins, api, security } = diagnostics

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    const totalMemory = plugins.reduce((sum, plugin) => sum + plugin.memoryUsage, 0)
    const averageMemory = plugins.length > 0 ? totalMemory / plugins.length : 0
    
    const activePlugins = plugins.filter(p => p.status === 'active')
    const errorRate = plugins.length > 0 ? (plugins.filter(p => p.status === 'error').length / plugins.length) * 100 : 0
    
    return {
      totalMemory,
      averageMemory,
      activePlugins: activePlugins.length,
      errorRate
    }
  }, [plugins])

  // Security risk assessment
  const securityRisk = useMemo(() => {
    const violationCount = security.recentViolations.length
    const criticalViolations = security.recentViolations.filter(v => v.severity === 'critical').length
    const blockedRate = security.totalPlugins > 0 ? (security.blockedPlugins / security.totalPlugins) * 100 : 0
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    
    if (criticalViolations > 0 || blockedRate > 10) {
      riskLevel = 'high'
    } else if (violationCount > 5 || blockedRate > 5) {
      riskLevel = 'medium'
    }
    
    return { riskLevel, violationCount, criticalViolations, blockedRate }
  }, [security])

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const getHealthColor = (health: string): string => {
    switch (health) {
      case 'healthy': return 'var(--success-color)'
      case 'degraded': return 'var(--warning-color)'
      case 'critical': return 'var(--error-color)'
      default: return 'var(--text-secondary)'
    }
  }

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'low': return 'var(--success-color)'
      case 'medium': return 'var(--warning-color)'
      case 'high': return 'var(--error-color)'
      default: return 'var(--text-secondary)'
    }
  }

  if (compact) {
    return (
      <div className={`plugin-metrics-compact ${className}`}>
        <div className="metrics-row">
          <div className="metric-item">
            <span className="metric-value">{state.totalPlugins}</span>
            <span className="metric-label">Total</span>
          </div>
          <div className="metric-item">
            <span className="metric-value" style={{ color: getHealthColor('healthy') }}>
              {state.activePlugins}
            </span>
            <span className="metric-label">Active</span>
          </div>
          <div className="metric-item">
            <span className="metric-value" style={{ color: getHealthColor('degraded') }}>
              {state.errorPlugins}
            </span>
            <span className="metric-label">Errors</span>
          </div>
          <div className="metric-item">
            <span className="metric-value" style={{ color: getHealthColor(state.systemHealth) }}>
              {state.systemHealth}
            </span>
            <span className="metric-label">Health</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`plugin-metrics ${className}`}>
      {/* Section Tabs */}
      <div className="metrics-tabs">
        <button
          className={`tab-button ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeSection === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveSection('performance')}
        >
          Performance
        </button>
        <button
          className={`tab-button ${activeSection === 'security' ? 'active' : ''}`}
          onClick={() => setActiveSection('security')}
        >
          Security
          {securityRisk.riskLevel !== 'low' && (
            <span className={`risk-indicator ${securityRisk.riskLevel}`}>
              {securityRisk.riskLevel === 'high' ? '!' : '⚠'}
            </span>
          )}
        </button>
        <button
          className={`tab-button ${activeSection === 'api' ? 'active' : ''}`}
          onClick={() => setActiveSection('api')}
        >
          API
        </button>
      </div>

      {/* Content */}
      <div className="metrics-content">
        {activeSection === 'overview' && (
          <div className="metrics-section">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <h3>System Status</h3>
                  <span 
                    className="health-indicator"
                    style={{ color: getHealthColor(state.systemHealth) }}
                  >
                    {state.systemHealth.toUpperCase()}
                  </span>
                </div>
                <div className="metric-stats">
                  <div className="stat-row">
                    <span className="stat-label">Total Plugins:</span>
                    <span className="stat-value">{state.totalPlugins}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Active:</span>
                    <span className="stat-value active">{state.activePlugins}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Loading:</span>
                    <span className="stat-value loading">{state.loadingPlugins}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Errors:</span>
                    <span className="stat-value error">{state.errorPlugins}</span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h3>Resource Usage</h3>
                </div>
                <div className="metric-stats">
                  <div className="stat-row">
                    <span className="stat-label">Total Memory:</span>
                    <span className="stat-value">{formatBytes(performanceMetrics.totalMemory)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Average Memory:</span>
                    <span className="stat-value">{formatBytes(performanceMetrics.averageMemory)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">API Calls:</span>
                    <span className="stat-value">{formatNumber(api.totalAPICalls)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Active Calls:</span>
                    <span className="stat-value">{api.activeCalls}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'performance' && (
          <div className="metrics-section">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <h3>Memory Usage</h3>
                </div>
                <div className="metric-stats">
                  <div className="stat-row">
                    <span className="stat-label">Total:</span>
                    <span className="stat-value">{formatBytes(performanceMetrics.totalMemory)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Average per Plugin:</span>
                    <span className="stat-value">{formatBytes(performanceMetrics.averageMemory)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Error Rate:</span>
                    <span className="stat-value error">{performanceMetrics.errorRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h3>Top Memory Users</h3>
                </div>
                <div className="plugin-list">
                  {plugins
                    .filter(p => p.status === 'active')
                    .sort((a, b) => b.memoryUsage - a.memoryUsage)
                    .slice(0, 5)
                    .map(plugin => (
                      <div key={plugin.name} className="plugin-item">
                        <span className="plugin-name">{plugin.name}</span>
                        <span className="plugin-memory">{formatBytes(plugin.memoryUsage)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'security' && (
          <div className="metrics-section">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <h3>Security Status</h3>
                  <span 
                    className="risk-indicator"
                    style={{ color: getRiskColor(securityRisk.riskLevel) }}
                  >
                    {securityRisk.riskLevel.toUpperCase()} RISK
                  </span>
                </div>
                <div className="metric-stats">
                  <div className="stat-row">
                    <span className="stat-label">Trusted Plugins:</span>
                    <span className="stat-value">{security.trustedPlugins}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Blocked Plugins:</span>
                    <span className="stat-value error">{security.blockedPlugins}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Active Sandboxes:</span>
                    <span className="stat-value">{security.sandboxes}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Recent Violations:</span>
                    <span className="stat-value warning">{securityRisk.violationCount}</span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h3>Recent Security Events</h3>
                </div>
                <div className="violation-list">
                  {security.recentViolations.slice(0, 5).map((violation, index) => (
                    <div key={index} className={`violation-item ${violation.severity}`}>
                      <div className="violation-header">
                        <span className="violation-type">{violation.type}</span>
                        <span className="violation-severity">{violation.severity}</span>
                      </div>
                      <div className="violation-description">{violation.description}</div>
                      <div className="violation-time">
                        {violation.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  {security.recentViolations.length === 0 && (
                    <div className="no-violations">No recent security violations</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'api' && (
          <div className="metrics-section">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <h3>API Statistics</h3>
                </div>
                <div className="metric-stats">
                  <div className="stat-row">
                    <span className="stat-label">Registered Plugins:</span>
                    <span className="stat-value">{api.registeredPlugins}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Total API Calls:</span>
                    <span className="stat-value">{formatNumber(api.totalAPICalls)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Active Rate Limits:</span>
                    <span className="stat-value">{api.activeRateLimits}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Active Calls:</span>
                    <span className="stat-value">{api.activeCalls}</span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h3>Top API Users</h3>
                </div>
                <div className="api-users-list">
                  {api.topAPIUsers.slice(0, 5).map(user => (
                    <div key={user.plugin} className="api-user-item">
                      <span className="user-name">{user.plugin}</span>
                      <span className="user-calls">{formatNumber(user.calls)} calls</span>
                    </div>
                  ))}
                </div>
              </div>

              {api.recentErrors.length > 0 && (
                <div className="metric-card">
                  <div className="metric-header">
                    <h3>Recent API Errors</h3>
                  </div>
                  <div className="error-list">
                    {api.recentErrors.slice(0, 3).map((error, index) => (
                      <div key={index} className="error-item">
                        <div className="error-header">
                          <span className="error-plugin">{error.plugin}</span>
                          <span className="error-count">{error.errors} errors</span>
                        </div>
                        <div className="error-method">{error.method}</div>
                        <div className="error-time">
                          Last: {error.lastCall.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// CSS Styles
const styles = `
.plugin-metrics {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
}

.plugin-metrics-compact {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  padding: 0.75rem;
}

.metrics-row {
  display: flex;
  gap: 1.5rem;
  justify-content: space-around;
  align-items: center;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.metric-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  font-weight: 500;
}

.metrics-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-tertiary);
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
  background: rgba(var(--primary-rgb), 0.1);
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

.risk-indicator {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 1rem;
  font-weight: 600;
  text-transform: uppercase;
}

.risk-indicator.medium {
  background: var(--warning-bg);
  color: var(--warning-color);
}

.risk-indicator.high {
  background: var(--error-bg);
  color: var(--error-color);
}

.metrics-content {
  padding: 1.5rem;
}

.metrics-section {
  min-height: 200px;
}

.metrics-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.metric-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.metric-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.health-indicator {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: var(--bg-tertiary);
}

.metric-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.stat-value.active {
  color: var(--success-color);
}

.stat-value.loading {
  color: var(--warning-color);
}

.stat-value.error {
  color: var(--error-color);
}

.stat-value.warning {
  color: var(--warning-color);
}

.plugin-list,
.api-users-list,
.error-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.plugin-item,
.api-user-item,
.error-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.plugin-name,
.user-name {
  font-weight: 500;
  color: var(--text-primary);
}

.plugin-memory,
.user-calls {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-family: monospace;
}

.error-item {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.error-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}

.error-plugin {
  font-weight: 500;
  color: var(--text-primary);
}

.error-count {
  font-size: 0.75rem;
  color: var(--error-color);
  font-weight: 600;
}

.error-method {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-family: monospace;
}

.error-time {
  font-size: 0.625rem;
  color: var(--text-secondary);
}

.violation-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.violation-item {
  padding: 0.75rem;
  border-radius: 0.375rem;
  border-left: 3px solid;
}

.violation-item.low {
  background: var(--info-bg);
  border-color: var(--info-color);
}

.violation-item.medium {
  background: var(--warning-bg);
  border-color: var(--warning-color);
}

.violation-item.high,
.violation-item.critical {
  background: var(--error-bg);
  border-color: var(--error-color);
}

.violation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.375rem;
}

.violation-type {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  text-transform: capitalize;
}

.violation-severity {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 600;
  text-transform: uppercase;
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.violation-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 0.375rem;
}

.violation-time {
  font-size: 0.625rem;
  color: var(--text-secondary);
}

.no-violations {
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  padding: 2rem 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-row {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .metric-item {
    flex: 1;
    min-width: 80px;
  }
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}