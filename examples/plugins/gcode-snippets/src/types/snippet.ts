export interface SnippetVariable {
  name: string
  default: string
  description: string
  type?: 'string' | 'number' | 'boolean'
  options?: string[]
  min?: number
  max?: number
}

export interface Snippet {
  id: string
  name: string
  description: string
  category: string
  code: string
  tags: string[]
  variables?: SnippetVariable[]
  favorite: boolean
  createdAt: Date
  updatedAt: Date
  usageCount: number
  lastUsed?: Date
}

export interface SnippetCategory {
  name: string
  count: number
  color?: string
}

export interface CreateSnippetData {
  name: string
  description: string
  category: string
  code: string
  tags: string[]
  variables?: SnippetVariable[]
}

export interface UpdateSnippetData extends Partial<CreateSnippetData> {
  favorite?: boolean
}

export interface SnippetFilter {
  category?: string
  tags?: string[]
  favorite?: boolean
  searchTerm?: string
}

export interface SnippetStats {
  totalSnippets: number
  favoriteSnippets: number
  categoriesCount: number
  mostUsedSnippet?: Snippet
  recentlyCreated: Snippet[]
  recentlyUsed: Snippet[]
}