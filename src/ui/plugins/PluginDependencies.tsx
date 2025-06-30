/**
 * Plugin Dependencies Component - Display plugin dependencies and dependents
 */

import React from 'react'
import { PluginRegistryEntry } from '../../core/plugins/types/plugin-types'

export interface PluginDependenciesProps {
  plugin: PluginRegistryEntry
}

/**
 * Plugin Dependencies Component
 * Shows plugin dependencies and what depends on this plugin
 */
export const PluginDependencies: React.FC<PluginDependenciesProps> = ({
  plugin
}) => {
  const { manifest, lifecycle } = plugin
  const { technical } = manifest
  const dependencies = technical.dependencies || {}
  const peerDependencies = technical.peerDependencies || {}
  const dependents = lifecycle.dependents || []

  const hasDependencies = Object.keys(dependencies).length > 0
  const hasPeerDependencies = Object.keys(peerDependencies).length > 0
  const hasDependents = dependents.length > 0

  const getVersionRange = (version: string): { type: string; range: string; color: string } => {
    if (version.startsWith('^')) {
      return { type: 'Compatible', range: version, color: 'var(--success-color)' }
    } else if (version.startsWith('~')) {
      return { type: 'Approximate', range: version, color: 'var(--warning-color)' }
    } else if (version.includes('||')) {
      return { type: 'Multiple', range: version, color: 'var(--info-color)' }
    } else if (version === '*') {
      return { type: 'Any', range: version, color: 'var(--text-secondary)' }
    } else {
      return { type: 'Exact', range: version, color: 'var(--error-color)' }
    }
  }

  if (!hasDependencies && !hasPeerDependencies && !hasDependents) {
    return (
      <div className="tab-panel">
        <div className="no-dependencies">
          <div className="no-deps-icon">🔗</div>
          <h3>No Dependencies</h3>
          <p>This plugin has no dependencies and nothing depends on it.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tab-panel">
      <div className="dependencies-container">
        {/* Runtime Dependencies */}
        {hasDependencies && (
          <div className="dependency-section">
            <div className="section-header">
              <h3>Dependencies</h3>
              <span className="dependency-count">{Object.keys(dependencies).length}</span>
            </div>
            <p className="section-description">
              These plugins are required for this plugin to function properly.
            </p>
            
            <div className="dependency-list">
              {Object.entries(dependencies).map(([name, version]) => {
                const versionInfo = getVersionRange(version as string)
                return (
                  <div key={name} className="dependency-item">
                    <div className="dependency-info">
                      <div className="dependency-name">{name}</div>
                      <div className="dependency-details">
                        <span 
                          className="version-type"
                          style={{ color: versionInfo.color }}
                        >
                          {versionInfo.type}
                        </span>
                        <span className="version-range">{versionInfo.range}</span>
                      </div>
                    </div>
                    <div className="dependency-actions">
                      <button className="dependency-action" title="View Plugin">
                        👁️
                      </button>
                      <button className="dependency-action" title="Check Status">
                        📊
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Peer Dependencies */}
        {hasPeerDependencies && (
          <div className="dependency-section">
            <div className="section-header">
              <h3>Peer Dependencies</h3>
              <span className="dependency-count">{Object.keys(peerDependencies).length}</span>
            </div>
            <p className="section-description">
              These plugins should be present in the same environment, but are not automatically installed.
            </p>
            
            <div className="dependency-list">
              {Object.entries(peerDependencies).map(([name, version]) => {
                const versionInfo = getVersionRange(version as string)
                return (
                  <div key={name} className="dependency-item peer">
                    <div className="dependency-info">
                      <div className="dependency-name">{name}</div>
                      <div className="dependency-details">
                        <span 
                          className="version-type"
                          style={{ color: versionInfo.color }}
                        >
                          {versionInfo.type}
                        </span>
                        <span className="version-range">{versionInfo.range}</span>
                      </div>
                    </div>
                    <div className="dependency-status">
                      <span className="status-indicator optional">Optional</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Dependents */}
        {hasDependents && (
          <div className="dependency-section">
            <div className="section-header">
              <h3>Dependents</h3>
              <span className="dependency-count">{dependents.length}</span>
            </div>
            <p className="section-description">
              These plugins depend on this plugin and may be affected if this plugin is unloaded.
            </p>
            
            <div className="dependency-list">
              {dependents.map((dependent) => (
                <div key={dependent} className="dependency-item dependent">
                  <div className="dependency-info">
                    <div className="dependency-name">{dependent}</div>
                    <div className="dependency-details">
                      <span className="dependent-note">Requires this plugin</span>
                    </div>
                  </div>
                  <div className="dependency-actions">
                    <button className="dependency-action" title="View Plugin">
                      👁️
                    </button>
                    <button className="dependency-action warning" title="May be affected">
                      ⚠️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dependency Graph Visualization */}
        <div className="dependency-section">
          <div className="section-header">
            <h3>Dependency Graph</h3>
          </div>
          <p className="section-description">
            Visual representation of this plugin's place in the dependency tree.
          </p>
          
          <div className="dependency-graph">
            <div className="graph-container">
              <div className="graph-node current">
                <div className="node-name">{manifest.metadata.name}</div>
                <div className="node-version">v{manifest.metadata.version}</div>
              </div>
              
              {hasDependencies && (
                <div className="graph-section dependencies">
                  <div className="graph-label">Dependencies</div>
                  <div className="graph-nodes">
                    {Object.keys(dependencies).slice(0, 3).map((dep) => (
                      <div key={dep} className="graph-node dependency">
                        <div className="node-name">{dep}</div>
                      </div>
                    ))}
                    {Object.keys(dependencies).length > 3 && (
                      <div className="graph-node more">
                        +{Object.keys(dependencies).length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {hasDependents && (
                <div className="graph-section dependents">
                  <div className="graph-label">Dependents</div>
                  <div className="graph-nodes">
                    {dependents.slice(0, 3).map((dep) => (
                      <div key={dep} className="graph-node dependent">
                        <div className="node-name">{dep}</div>
                      </div>
                    ))}
                    {dependents.length > 3 && (
                      <div className="graph-node more">
                        +{dependents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Engine Requirements */}
        {technical.engines && Object.keys(technical.engines).length > 0 && (
          <div className="dependency-section">
            <div className="section-header">
              <h3>Engine Requirements</h3>
            </div>
            <p className="section-description">
              Runtime engine version requirements for this plugin.
            </p>
            
            <div className="engine-list">
              {Object.entries(technical.engines).map(([engine, version]) => (
                <div key={engine} className="engine-item">
                  <div className="engine-name">{engine}</div>
                  <div className="engine-version">{version as string}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// CSS Styles
const styles = `
.dependencies-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dependency-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.dependency-count {
  background: var(--primary-bg);
  color: var(--primary-color);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  min-width: 1.5rem;
  text-align: center;
}

.section-description {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.dependency-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dependency-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.dependency-item:hover {
  border-color: var(--primary-color);
  background: var(--primary-bg);
}

.dependency-item.peer {
  border-left: 3px solid var(--warning-color);
}

.dependency-item.dependent {
  border-left: 3px solid var(--info-color);
}

.dependency-info {
  flex: 1;
}

.dependency-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.dependency-details {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
}

.version-type {
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  background: var(--bg-tertiary);
}

.version-range {
  color: var(--text-secondary);
  font-family: monospace;
}

.dependent-note {
  color: var(--text-secondary);
  font-style: italic;
}

.dependency-actions {
  display: flex;
  gap: 0.25rem;
}

.dependency-action {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.dependency-action:hover {
  background: var(--bg-quaternary);
  transform: scale(1.05);
}

.dependency-action.warning:hover {
  background: var(--warning-bg);
  border-color: var(--warning-color);
}

.dependency-status {
  display: flex;
  align-items: center;
}

.status-indicator {
  font-size: 0.625rem;
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-indicator.optional {
  background: var(--warning-bg);
  color: var(--warning-color);
}

.dependency-graph {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  padding: 1.5rem;
}

.graph-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.graph-node {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  text-align: center;
  min-width: 120px;
  transition: all 0.2s ease;
}

.graph-node.current {
  border-color: var(--primary-color);
  background: var(--primary-bg);
  color: var(--primary-color);
  font-weight: 600;
}

.graph-node.dependency {
  border-color: var(--success-color);
  background: var(--success-bg);
}

.graph-node.dependent {
  border-color: var(--info-color);
  background: var(--info-bg);
}

.graph-node.more {
  border-style: dashed;
  color: var(--text-secondary);
  font-style: italic;
}

.node-name {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.node-version {
  font-size: 0.625rem;
  color: var(--text-secondary);
  font-family: monospace;
}

.graph-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.graph-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.graph-nodes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  max-width: 100%;
}

.engine-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.engine-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
}

.engine-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  text-transform: capitalize;
}

.engine-version {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-family: monospace;
}

.no-dependencies {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-secondary);
}

.no-deps-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-dependencies h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.no-dependencies p {
  margin: 0;
  line-height: 1.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dependency-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .dependency-actions {
    align-self: flex-end;
  }
  
  .graph-nodes {
    flex-direction: column;
    align-items: center;
  }
  
  .engine-list {
    grid-template-columns: 1fr;
  }
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}