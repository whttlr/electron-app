import chalk from 'chalk'
import { MarketplaceClient, SearchResult, PluginSearchItem } from '../client/MarketplaceClient'
import { Logger } from '../utils/Logger'

export interface SearchOptions {
  limit?: number
  offset?: number
  sort?: 'downloads' | 'rating' | 'updated' | 'created' | 'name'
  category?: string
  tags?: string[]
  author?: string
  license?: string
  minRating?: number
  includeDeprecated?: boolean
}

export interface SearchFilters {
  category?: string
  tags?: string[]
  author?: string
  license?: string
  minRating?: number
  dateRange?: {
    from?: string
    to?: string
  }
}

export class SearchManager {
  private client: MarketplaceClient
  private logger: Logger

  constructor() {
    this.client = new MarketplaceClient()
    this.logger = new Logger()
  }

  /**
   * Search for plugins with advanced filtering
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    try {
      this.logger.info(`🔍 Searching for "${query}"...`)

      const searchResult = await this.client.searchPlugins(query, {
        limit: options.limit || 20,
        offset: options.offset || 0,
        sort: options.sort || 'downloads',
        category: options.category,
        tags: options.tags
      })

      // Apply additional client-side filters
      if (options.author || options.license || options.minRating || !options.includeDeprecated) {
        searchResult.plugins = this.applyClientFilters(searchResult.plugins, options)
        searchResult.total = searchResult.plugins.length
      }

      this.logger.info(`📊 Found ${searchResult.total} plugins`)
      return searchResult

    } catch (error) {
      this.logger.error('Search failed:', error.message)
      throw error
    }
  }

  /**
   * Get popular plugins
   */
  async getPopular(limit: number = 10): Promise<PluginSearchItem[]> {
    const result = await this.search('', {
      limit,
      sort: 'downloads'
    })
    return result.plugins
  }

  /**
   * Get recently updated plugins
   */
  async getRecentlyUpdated(limit: number = 10): Promise<PluginSearchItem[]> {
    const result = await this.search('', {
      limit,
      sort: 'updated'
    })
    return result.plugins
  }

  /**
   * Get plugins by category
   */
  async getByCategory(category: string, options: SearchOptions = {}): Promise<SearchResult> {
    return await this.search('', {
      ...options,
      category
    })
  }

  /**
   * Get plugins by author
   */
  async getByAuthor(author: string, options: SearchOptions = {}): Promise<SearchResult> {
    return await this.search('', {
      ...options,
      author
    })
  }

  /**
   * Get plugin suggestions based on keywords
   */
  async getSuggestions(partialQuery: string, limit: number = 5): Promise<string[]> {
    if (partialQuery.length < 2) {
      return []
    }

    try {
      const result = await this.search(partialQuery, { limit: limit * 3 })
      
      // Extract unique plugin names and keywords
      const suggestions = new Set<string>()
      
      result.plugins.forEach(plugin => {
        if (plugin.name.toLowerCase().includes(partialQuery.toLowerCase())) {
          suggestions.add(plugin.name)
        }
        
        plugin.keywords.forEach(keyword => {
          if (keyword.toLowerCase().includes(partialQuery.toLowerCase())) {
            suggestions.add(keyword)
          }
        })
      })

      return Array.from(suggestions).slice(0, limit)

    } catch (error) {
      this.logger.debug('Failed to get suggestions:', error.message)
      return []
    }
  }

  /**
   * Display search results in formatted output
   */
  displayResults(searchResult: SearchResult, logger: Logger): void {
    if (searchResult.plugins.length === 0) {
      logger.info('No plugins found matching your search criteria')
      return
    }

    logger.info(`\n📦 Found ${searchResult.total} plugins:\n`)

    searchResult.plugins.forEach((plugin, index) => {
      const number = chalk.gray(`${searchResult.offset + index + 1}.`)
      const name = chalk.cyan.bold(plugin.name)
      const version = chalk.gray(`v${plugin.version}`)
      const author = chalk.green(`by ${plugin.author.name}`)
      
      console.log(`${number} ${name} ${version} ${author}`)
      
      if (plugin.description) {
        console.log(`   ${chalk.gray(plugin.description)}`)
      }
      
      // Display stats
      const stats = []
      if (plugin.downloads > 0) {
        stats.push(`${plugin.downloads.toLocaleString()} downloads`)
      }
      if (plugin.rating > 0) {
        const stars = '★'.repeat(Math.round(plugin.rating))
        stats.push(`${stars} ${plugin.rating}/5`)
      }
      stats.push(`updated ${this.formatDate(plugin.publishedAt)}`)
      
      if (stats.length > 0) {
        console.log(`   ${chalk.gray(stats.join(' • '))}`)
      }
      
      // Display keywords/tags
      if (plugin.keywords.length > 0) {
        const keywords = plugin.keywords.slice(0, 5).map(k => chalk.blue(`#${k}`)).join(' ')
        console.log(`   ${keywords}`)
      }
      
      console.log('')
    })

    // Pagination info
    if (searchResult.total > searchResult.plugins.length) {
      const remaining = searchResult.total - (searchResult.offset + searchResult.plugins.length)
      logger.info(chalk.gray(`Showing ${searchResult.plugins.length} of ${searchResult.total} results (${remaining} more available)`))
    }
  }

  /**
   * Display compact search results
   */
  displayCompactResults(searchResult: SearchResult, logger: Logger): void {
    if (searchResult.plugins.length === 0) {
      logger.info('No plugins found')
      return
    }

    const { table } = require('table')
    
    const data = [
      ['Name', 'Version', 'Author', 'Downloads', 'Rating', 'Updated']
    ]

    searchResult.plugins.forEach(plugin => {
      const rating = plugin.rating > 0 ? `${plugin.rating}/5` : 'N/A'
      
      data.push([
        plugin.name,
        plugin.version,
        plugin.author.name,
        plugin.downloads.toLocaleString(),
        rating,
        this.formatDate(plugin.publishedAt)
      ])
    })

    console.log(table(data))
  }

  /**
   * Apply client-side filters to search results
   */
  private applyClientFilters(plugins: PluginSearchItem[], options: SearchOptions): PluginSearchItem[] {
    return plugins.filter(plugin => {
      // Filter by author
      if (options.author && !plugin.author.name.toLowerCase().includes(options.author.toLowerCase())) {
        return false
      }
      
      // Filter by minimum rating
      if (options.minRating && plugin.rating < options.minRating) {
        return false
      }
      
      // Add more filters as needed
      
      return true
    })
  }

  /**
   * Format date for display
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'today'
    } else if (diffDays === 1) {
      return 'yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return months === 1 ? '1 month ago' : `${months} months ago`
    } else {
      const years = Math.floor(diffDays / 365)
      return years === 1 ? '1 year ago' : `${years} years ago`
    }
  }

  /**
   * Advanced search with multiple criteria
   */
  async advancedSearch(criteria: {
    query?: string
    filters: SearchFilters
    sorting: {
      field: 'downloads' | 'rating' | 'updated' | 'created' | 'name'
      direction: 'asc' | 'desc'
    }
    pagination: {
      page: number
      limit: number
    }
  }): Promise<SearchResult> {
    const offset = (criteria.pagination.page - 1) * criteria.pagination.limit
    
    return await this.search(criteria.query || '', {
      limit: criteria.pagination.limit,
      offset,
      sort: criteria.sorting.field,
      category: criteria.filters.category,
      tags: criteria.filters.tags,
      author: criteria.filters.author,
      minRating: criteria.filters.minRating
    })
  }

  /**
   * Get search facets/aggregations
   */
  async getSearchFacets(query: string = ''): Promise<{
    categories: { name: string; count: number }[]
    authors: { name: string; count: number }[]
    licenses: { name: string; count: number }[]
    tags: { name: string; count: number }[]
  }> {
    // This would typically come from the server API
    // For now, return mock data structure
    return {
      categories: [],
      authors: [],
      licenses: [],
      tags: []
    }
  }
}