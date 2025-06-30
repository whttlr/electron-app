/**
 * Plugin Filters Component - Filter and search controls for plugins
 */

import React, { useCallback } from 'react'

export interface PluginFiltersProps {
  filters: {
    status: string
    category: string
    search: string
    author: string
  }
  categories: string[]
  authors: string[]
  onFilterChange: (filters: Partial<{
    status: string
    category: string
    search: string
    author: string
  }>) => void
}

/**
 * Plugin Filters Component
 * Provides filtering and search controls for the plugin list
 */
export const PluginFilters: React.FC<PluginFiltersProps> = ({
  filters,
  categories,
  authors,
  onFilterChange
}) => {
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: event.target.value })
  }, [onFilterChange])

  const handleStatusChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ status: event.target.value })
  }, [onFilterChange])

  const handleCategoryChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ category: event.target.value })
  }, [onFilterChange])

  const handleAuthorChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ author: event.target.value })
  }, [onFilterChange])

  const handleClearFilters = useCallback(() => {
    onFilterChange({
      status: 'all',
      category: 'all',
      search: '',
      author: 'all'
    })
  }, [onFilterChange])

  const hasActiveFilters = filters.status !== 'all' || 
                          filters.category !== 'all' || 
                          filters.search !== '' || 
                          filters.author !== 'all'

  return (
    <div className="plugin-filters">
      {/* Search */}
      <div className="filter-group search-group">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search plugins..."
            value={filters.search}
            onChange={handleSearchChange}
            className="search-input"
          />
          {filters.search && (
            <button
              className="clear-search"
              onClick={() => onFilterChange({ search: '' })}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Status Filter */}
      <div className="filter-group">
        <label htmlFor="status-filter" className="filter-label">
          Status
        </label>
        <select
          id="status-filter"
          value={filters.status}
          onChange={handleStatusChange}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="loading">Loading</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Category Filter */}
      <div className="filter-group">
        <label htmlFor="category-filter" className="filter-label">
          Category
        </label>
        <select
          id="category-filter"
          value={filters.category}
          onChange={handleCategoryChange}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Author Filter */}
      <div className="filter-group">
        <label htmlFor="author-filter" className="filter-label">
          Author
        </label>
        <select
          id="author-filter"
          value={filters.author}
          onChange={handleAuthorChange}
          className="filter-select"
        >
          <option value="all">All Authors</option>
          {authors.map(author => (
            <option key={author} value={author}>
              {author}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="filter-group">
          <button
            className="clear-filters"
            onClick={handleClearFilters}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Active Filter Indicators */}
      {hasActiveFilters && (
        <div className="active-filters">
          {filters.search && (
            <span className="filter-chip">
              Search: "{filters.search}"
              <button
                className="chip-remove"
                onClick={() => onFilterChange({ search: '' })}
              >
                ×
              </button>
            </span>
          )}
          
          {filters.status !== 'all' && (
            <span className="filter-chip">
              Status: {filters.status}
              <button
                className="chip-remove"
                onClick={() => onFilterChange({ status: 'all' })}
              >
                ×
              </button>
            </span>
          )}
          
          {filters.category !== 'all' && (
            <span className="filter-chip">
              Category: {filters.category}
              <button
                className="chip-remove"
                onClick={() => onFilterChange({ category: 'all' })}
              >
                ×
              </button>
            </span>
          )}
          
          {filters.author !== 'all' && (
            <span className="filter-chip">
              Author: {filters.author}
              <button
                className="chip-remove"
                onClick={() => onFilterChange({ author: 'all' })}
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// CSS Styles
const styles = `
.plugin-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.search-group {
  flex: 1;
  min-width: 200px;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.clear-search {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.125rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.clear-search:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
}

.filter-select option {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.clear-filters {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-end;
}

.clear-filters:hover {
  background: var(--bg-quaternary);
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: var(--primary-bg);
  color: var(--primary-color);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  border: 1px solid var(--primary-color);
}

.chip-remove {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0;
  margin: 0;
  line-height: 1;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.chip-remove:hover {
  background: var(--primary-color);
  color: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .plugin-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .search-group {
    min-width: auto;
  }
  
  .filter-select {
    min-width: auto;
  }
  
  .clear-filters {
    align-self: stretch;
  }
  
  .active-filters {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .search-input,
  .filter-select {
    background: var(--bg-tertiary);
    border-color: var(--border-dark);
  }
  
  .search-input:focus,
  .filter-select:focus {
    border-color: var(--primary-light);
    box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .plugin-filters {
    border-width: 2px;
  }
  
  .search-input,
  .filter-select,
  .clear-filters {
    border-width: 2px;
  }
  
  .filter-chip {
    border-width: 2px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .search-input,
  .filter-select,
  .clear-filters,
  .clear-search,
  .chip-remove {
    transition: none;
  }
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}