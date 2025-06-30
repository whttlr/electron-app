/**
 * Plugin Installer Component - Install plugins from various sources
 */

import React, { useState, useCallback } from 'react'

export interface PluginInstallerProps {
  onInstall?: (source: string, identifier: string) => Promise<void>
}

type InstallSource = 'file' | 'url' | 'marketplace' | 'github'

/**
 * Plugin Installer Component
 * Provides interface for installing plugins from different sources
 */
export const PluginInstaller: React.FC<PluginInstallerProps> = ({
  onInstall
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [source, setSource] = useState<InstallSource>('file')
  const [identifier, setIdentifier] = useState('')
  const [installing, setInstalling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInstall = useCallback(async () => {
    if (!identifier.trim()) {
      setError('Please provide a valid identifier')
      return
    }

    setInstalling(true)
    setError(null)

    try {
      if (onInstall) {
        await onInstall(source, identifier.trim())
      }
      setIdentifier('')
      setIsOpen(false)
    } catch (err) {
      setError(`Installation failed: ${err.message}`)
    } finally {
      setInstalling(false)
    }
  }, [source, identifier, onInstall])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setIdentifier('')
    setError(null)
  }, [])

  const getPlaceholder = (): string => {
    switch (source) {
      case 'file':
        return 'Select plugin file (.zip, .tar.gz)'
      case 'url':
        return 'https://example.com/plugin.zip'
      case 'marketplace':
        return 'plugin-name or plugin-id'
      case 'github':
        return 'username/repository'
      default:
        return ''
    }
  }

  const getInstructions = (): string => {
    switch (source) {
      case 'file':
        return 'Select a plugin archive file from your local filesystem'
      case 'url':
        return 'Enter a direct URL to download a plugin archive'
      case 'marketplace':
        return 'Enter the plugin name or ID from the plugin marketplace'
      case 'github':
        return 'Enter the GitHub repository path (username/repository)'
      default:
        return ''
    }
  }

  return (
    <>
      <button
        className="btn btn-primary install-trigger"
        onClick={() => setIsOpen(true)}
      >
        Install Plugin
      </button>

      {isOpen && (
        <div className="plugin-installer-overlay">
          <div className="plugin-installer">
            {/* Header */}
            <div className="installer-header">
              <h2>Install Plugin</h2>
              <button
                className="btn btn-ghost close-btn"
                onClick={handleClose}
              >
                ×
              </button>
            </div>

            {/* Source Selection */}
            <div className="installer-content">
              <div className="source-selection">
                <label className="field-label">Installation Source</label>
                <div className="source-options">
                  <button
                    className={`source-option ${source === 'file' ? 'active' : ''}`}
                    onClick={() => setSource('file')}
                  >
                    <span className="source-icon">📁</span>
                    <span className="source-label">Local File</span>
                  </button>
                  <button
                    className={`source-option ${source === 'url' ? 'active' : ''}`}
                    onClick={() => setSource('url')}
                  >
                    <span className="source-icon">🌐</span>
                    <span className="source-label">Download URL</span>
                  </button>
                  <button
                    className={`source-option ${source === 'marketplace' ? 'active' : ''}`}
                    onClick={() => setSource('marketplace')}
                  >
                    <span className="source-icon">🏪</span>
                    <span className="source-label">Marketplace</span>
                  </button>
                  <button
                    className={`source-option ${source === 'github' ? 'active' : ''}`}
                    onClick={() => setSource('github')}
                  >
                    <span className="source-icon">📦</span>
                    <span className="source-label">GitHub</span>
                  </button>
                </div>
              </div>

              {/* Input Field */}
              <div className="installer-field">
                <label className="field-label">
                  {source === 'file' ? 'Plugin File' :
                   source === 'url' ? 'Download URL' :
                   source === 'marketplace' ? 'Plugin Name/ID' :
                   'GitHub Repository'}
                </label>
                
                {source === 'file' ? (
                  <div className="file-input-container">
                    <input
                      type="file"
                      accept=".zip,.tar.gz,.tgz"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        setIdentifier(file ? file.name : '')
                      }}
                      className="file-input"
                      id="plugin-file"
                    />
                    <label htmlFor="plugin-file" className="file-input-label">
                      {identifier || 'Choose file...'}
                    </label>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={getPlaceholder()}
                    className="installer-input"
                  />
                )}

                <div className="field-instructions">
                  {getInstructions()}
                </div>
              </div>

              {/* Additional Options */}
              <div className="installer-options">
                <div className="option-group">
                  <h3>Installation Options</h3>
                  
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Auto-enable after installation</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Verify plugin signature</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Install as trusted plugin</span>
                  </label>
                </div>

                {source === 'marketplace' && (
                  <div className="option-group">
                    <h3>Marketplace Settings</h3>
                    
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Check for updates automatically</span>
                    </label>
                    
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      <span>Install development version</span>
                    </label>
                  </div>
                )}

                {source === 'github' && (
                  <div className="option-group">
                    <h3>GitHub Settings</h3>
                    
                    <label className="field-label">Branch/Tag</label>
                    <input
                      type="text"
                      placeholder="main (default)"
                      className="installer-input"
                    />
                    
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      <span>Use SSH instead of HTTPS</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="error-banner">
                  <span className="error-icon">⚠️</span>
                  <span className="error-message">{error}</span>
                </div>
              )}

              {/* Security Warning */}
              <div className="security-warning">
                <div className="warning-header">
                  <span className="warning-icon">🔒</span>
                  <span className="warning-title">Security Notice</span>
                </div>
                <p>
                  Only install plugins from trusted sources. Plugins have access to your system 
                  and CNC machine controls. Always verify the source and review permissions before installation.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="installer-actions">
              <button
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={installing}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleInstall}
                disabled={installing || !identifier.trim()}
              >
                {installing ? 'Installing...' : 'Install Plugin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// CSS Styles
const styles = `
.install-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.plugin-installer-overlay {
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

.plugin-installer {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.installer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.installer-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  font-size: 1.5rem;
  padding: 0.25rem 0.5rem;
}

.installer-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.source-selection {
  margin-bottom: 2rem;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.source-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.source-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.source-option:hover {
  border-color: var(--primary-color);
  background: var(--primary-bg);
}

.source-option.active {
  border-color: var(--primary-color);
  background: var(--primary-bg);
  color: var(--primary-color);
}

.source-icon {
  font-size: 1.5rem;
}

.source-label {
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

.installer-field {
  margin-bottom: 2rem;
}

.installer-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.installer-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
}

.file-input-container {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.file-input-label {
  display: block;
  width: 100%;
  padding: 0.75rem;
  border: 2px dashed var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-input-label:hover {
  border-color: var(--primary-color);
  background: var(--primary-bg);
  color: var(--primary-color);
}

.field-instructions {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  line-height: 1.4;
}

.installer-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.option-group {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
}

.option-group h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.checkbox-label:last-child {
  margin-bottom: 0;
}

.checkbox-label input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: var(--primary-color);
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--error-bg);
  border: 1px solid var(--error-color);
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  color: var(--error-text);
}

.security-warning {
  background: var(--warning-bg);
  border: 1px solid var(--warning-color);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.warning-title {
  font-weight: 600;
  color: var(--warning-text);
}

.security-warning p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--warning-text);
  line-height: 1.4;
}

.installer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
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

/* Responsive adjustments */
@media (max-width: 640px) {
  .source-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .installer-actions {
    flex-direction: column;
  }
  
  .installer-actions .btn {
    width: 100%;
  }
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}