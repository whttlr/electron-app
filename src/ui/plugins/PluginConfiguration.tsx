/**
 * Plugin Configuration Component - Plugin configuration editor
 */

import React, { useState, useCallback, useEffect } from 'react'
import { PluginRegistryEntry } from '../../core/plugins/types/plugin-types'

export interface PluginConfigurationProps {
  plugin: PluginRegistryEntry
  onUpdate: (config: any) => Promise<void>
}

/**
 * Plugin Configuration Component
 * Provides a form-based editor for plugin configuration
 */
export const PluginConfiguration: React.FC<PluginConfigurationProps> = ({
  plugin,
  onUpdate
}) => {
  const { manifest, lifecycle } = plugin
  const { configuration: configSchema } = manifest
  const currentConfig = lifecycle.configuration || {}

  const [config, setConfig] = useState(currentConfig)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Track changes
  useEffect(() => {
    const configChanged = JSON.stringify(config) !== JSON.stringify(currentConfig)
    setHasChanges(configChanged)
  }, [config, currentConfig])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError(null)

    try {
      await onUpdate(config)
      setHasChanges(false)
    } catch (err) {
      setError(`Failed to save configuration: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }, [config, onUpdate])

  const handleReset = useCallback(() => {
    setConfig(currentConfig)
    setError(null)
  }, [currentConfig])

  const handleResetToDefaults = useCallback(() => {
    setConfig(configSchema.defaults || {})
    setError(null)
  }, [configSchema])

  const handleFieldChange = useCallback((path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev }
      const keys = path.split('.')
      let current = newConfig

      // Navigate to the parent of the field
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }

      // Set the value
      current[keys[keys.length - 1]] = value
      return newConfig
    })
    setError(null)
  }, [])

  const getFieldValue = useCallback((path: string): any => {
    const keys = path.split('.')
    let current = config

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }

    return current
  }, [config])

  const renderField = useCallback((
    fieldName: string,
    fieldSchema: any,
    path: string = fieldName
  ) => {
    const value = getFieldValue(path)
    const fieldType = fieldSchema.type || 'string'
    const required = fieldSchema.required || false
    const description = fieldSchema.description || ''

    switch (fieldType) {
      case 'boolean':
        return (
          <div key={path} className="config-field">
            <label className="field-label">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => handleFieldChange(path, e.target.checked)}
                className="field-checkbox"
              />
              <span className="field-name">
                {fieldName}
                {required && <span className="required">*</span>}
              </span>
            </label>
            {description && (
              <div className="field-description">{description}</div>
            )}
          </div>
        )

      case 'number':
        return (
          <div key={path} className="config-field">
            <label className="field-label">
              <span className="field-name">
                {fieldName}
                {required && <span className="required">*</span>}
              </span>
            </label>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleFieldChange(path, parseFloat(e.target.value) || 0)}
              className="field-input"
              min={fieldSchema.minimum}
              max={fieldSchema.maximum}
              step={fieldSchema.step || 1}
              required={required}
            />
            {description && (
              <div className="field-description">{description}</div>
            )}
          </div>
        )

      case 'string':
        if (fieldSchema.enum) {
          return (
            <div key={path} className="config-field">
              <label className="field-label">
                <span className="field-name">
                  {fieldName}
                  {required && <span className="required">*</span>}
                </span>
              </label>
              <select
                value={value || ''}
                onChange={(e) => handleFieldChange(path, e.target.value)}
                className="field-select"
                required={required}
              >
                <option value="">Select...</option>
                {fieldSchema.enum.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {description && (
                <div className="field-description">{description}</div>
              )}
            </div>
          )
        }

        return (
          <div key={path} className="config-field">
            <label className="field-label">
              <span className="field-name">
                {fieldName}
                {required && <span className="required">*</span>}
              </span>
            </label>
            {fieldSchema.multiline ? (
              <textarea
                value={value || ''}
                onChange={(e) => handleFieldChange(path, e.target.value)}
                className="field-textarea"
                rows={4}
                placeholder={fieldSchema.placeholder}
                required={required}
              />
            ) : (
              <input
                type="text"
                value={value || ''}
                onChange={(e) => handleFieldChange(path, e.target.value)}
                className="field-input"
                placeholder={fieldSchema.placeholder}
                pattern={fieldSchema.pattern}
                required={required}
              />
            )}
            {description && (
              <div className="field-description">{description}</div>
            )}
          </div>
        )

      case 'object':
        return (
          <div key={path} className="config-field config-group">
            <div className="group-header">
              <span className="group-name">
                {fieldName}
                {required && <span className="required">*</span>}
              </span>
              {description && (
                <div className="field-description">{description}</div>
              )}
            </div>
            <div className="group-content">
              {fieldSchema.properties && Object.entries(fieldSchema.properties).map(([subFieldName, subFieldSchema]) =>
                renderField(subFieldName, subFieldSchema as any, `${path}.${subFieldName}`)
              )}
            </div>
          </div>
        )

      case 'array':
        const arrayValue = value || []
        return (
          <div key={path} className="config-field config-array">
            <label className="field-label">
              <span className="field-name">
                {fieldName}
                {required && <span className="required">*</span>}
              </span>
            </label>
            <div className="array-items">
              {arrayValue.map((item: any, index: number) => (
                <div key={index} className="array-item">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newArray = [...arrayValue]
                      newArray[index] = e.target.value
                      handleFieldChange(path, newArray)
                    }}
                    className="field-input"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newArray = arrayValue.filter((_: any, i: number) => i !== index)
                      handleFieldChange(path, newArray)
                    }}
                    className="array-remove"
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newArray = [...arrayValue, '']
                  handleFieldChange(path, newArray)
                }}
                className="array-add"
              >
                Add Item
              </button>
            </div>
            {description && (
              <div className="field-description">{description}</div>
            )}
          </div>
        )

      default:
        return (
          <div key={path} className="config-field">
            <label className="field-label">
              <span className="field-name">
                {fieldName}
                {required && <span className="required">*</span>}
              </span>
            </label>
            <input
              type="text"
              value={JSON.stringify(value || '')}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  handleFieldChange(path, parsed)
                } catch {
                  handleFieldChange(path, e.target.value)
                }
              }}
              className="field-input"
              placeholder="JSON value"
              required={required}
            />
            {description && (
              <div className="field-description">{description}</div>
            )}
          </div>
        )
    }
  }, [getFieldValue, handleFieldChange])

  if (!configSchema || !configSchema.properties) {
    return (
      <div className="tab-panel">
        <div className="no-configuration">
          <div className="no-config-icon">⚙️</div>
          <h3>No Configuration Available</h3>
          <p>This plugin does not provide configuration options.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tab-panel">
      <div className="configuration-editor">
        {/* Header */}
        <div className="config-header">
          <h3>Plugin Configuration</h3>
          <div className="config-actions">
            <button
              className="btn btn-secondary"
              onClick={handleResetToDefaults}
              disabled={saving}
            >
              Reset to Defaults
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={saving || !hasChanges}
            >
              Reset Changes
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
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

        {/* Changes Indicator */}
        {hasChanges && (
          <div className="changes-banner">
            <span className="changes-icon">●</span>
            <span className="changes-message">You have unsaved changes</span>
          </div>
        )}

        {/* Configuration Form */}
        <div className="config-form">
          {Object.entries(configSchema.properties).map(([fieldName, fieldSchema]) =>
            renderField(fieldName, fieldSchema as any)
          )}
        </div>

        {/* Configuration Preview */}
        <details className="config-preview">
          <summary>Configuration Preview (JSON)</summary>
          <pre className="config-json">
            {JSON.stringify(config, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}

// CSS Styles
const styles = `
.configuration-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.config-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.config-actions {
  display: flex;
  gap: 0.5rem;
}

.error-banner,
.changes-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.error-banner {
  background: var(--error-bg);
  border: 1px solid var(--error-color);
  color: var(--error-text);
}

.changes-banner {
  background: var(--warning-bg);
  border: 1px solid var(--warning-color);
  color: var(--warning-text);
}

.changes-icon {
  color: var(--warning-color);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.error-close {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
}

.error-close:hover {
  opacity: 1;
}

.config-form {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.config-field {
  margin-bottom: 1.5rem;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
  cursor: pointer;
}

.field-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.required {
  color: var(--error-color);
  font-weight: 600;
}

.field-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  line-height: 1.4;
}

.field-input,
.field-textarea,
.field-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.field-input:focus,
.field-textarea:focus,
.field-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
}

.field-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: var(--primary-color);
}

.config-group {
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
}

.group-header {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.group-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.group-content {
  margin-left: 1rem;
}

.config-array {
  
}

.array-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.array-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.array-remove {
  background: var(--error-color);
  color: white;
  border: none;
  border-radius: 0.25rem;
  width: 2rem;
  height: 2rem;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.array-remove:hover {
  background: var(--error-hover);
  transform: scale(1.05);
}

.array-add {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.2s ease;
}

.array-add:hover {
  background: var(--primary-hover);
}

.config-preview {
  margin-top: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
}

.config-preview summary {
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  cursor: pointer;
  font-weight: 500;
  color: var(--text-primary);
  user-select: none;
}

.config-preview summary:hover {
  background: var(--bg-tertiary);
}

.config-json {
  margin: 0;
  padding: 1rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-family: monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  overflow-x: auto;
  border-top: 1px solid var(--border-color);
}

.no-configuration {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-secondary);
}

.no-config-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-configuration h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.no-configuration p {
  margin: 0;
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
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}