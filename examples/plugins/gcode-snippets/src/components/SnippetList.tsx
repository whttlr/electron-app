import React from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Edit, 
  Trash2, 
  Copy, 
  Star, 
  Code,
  Tag,
  Clock
} from 'lucide-react'
import { Snippet } from '../types/snippet'
import clsx from 'clsx'

interface SnippetListProps {
  snippets: Snippet[]
  view: 'grid' | 'list'
  selectedSnippet: string | null
  onSelectSnippet: (id: string) => void
  onEditSnippet: (id: string) => void
  onDeleteSnippet: (id: string) => void
  onDuplicateSnippet: (id: string) => void
  onToggleFavorite: (id: string) => void
  onExecuteSnippet: (id: string) => void
}

export const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  view,
  selectedSnippet,
  onSelectSnippet,
  onEditSnippet,
  onDeleteSnippet,
  onDuplicateSnippet,
  onToggleFavorite,
  onExecuteSnippet
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  if (view === 'grid') {
    return (
      <motion.div
        className="snippet-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {snippets.map((snippet) => (
          <motion.div
            key={snippet.id}
            variants={itemVariants}
            className={clsx('snippet-card', {
              'snippet-card--selected': selectedSnippet === snippet.id
            })}
            onClick={() => onSelectSnippet(snippet.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="snippet-card__header">
              <div className="snippet-card__title">
                {snippet.favorite && (
                  <Star className="favorite-icon" size={16} />
                )}
                <span>{snippet.name}</span>
              </div>
              <div className="snippet-card__actions">
                <button
                  className="btn btn--icon btn--small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onExecuteSnippet(snippet.id)
                  }}
                  title="Execute snippet"
                >
                  <Play size={14} />
                </button>
                <button
                  className="btn btn--icon btn--small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditSnippet(snippet.id)
                  }}
                  title="Edit snippet"
                >
                  <Edit size={14} />
                </button>
              </div>
            </div>

            <div className="snippet-card__content">
              <p className="snippet-card__description">
                {snippet.description}
              </p>
              
              <div className="snippet-card__code">
                <Code size={16} />
                <span>{snippet.code.split('\n').length} lines</span>
              </div>

              <div className="snippet-card__meta">
                <span className="category-badge">
                  {snippet.category}
                </span>
                {snippet.tags.length > 0 && (
                  <div className="tags">
                    <Tag size={12} />
                    <span>{snippet.tags.slice(0, 2).join(', ')}</span>
                    {snippet.tags.length > 2 && (
                      <span className="tag-count">+{snippet.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="snippet-card__footer">
              <div className="snippet-card__updated">
                <Clock size={12} />
                <span>{formatDate(snippet.updatedAt)}</span>
              </div>
              
              <div className="snippet-card__menu">
                <button
                  className="btn btn--icon btn--small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(snippet.id)
                  }}
                  title={snippet.favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star size={14} className={clsx({ 'star-filled': snippet.favorite })} />
                </button>
                <button
                  className="btn btn--icon btn--small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicateSnippet(snippet.id)
                  }}
                  title="Duplicate snippet"
                >
                  <Copy size={14} />
                </button>
                <button
                  className="btn btn--icon btn--small btn--danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSnippet(snippet.id)
                  }}
                  title="Delete snippet"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      className="snippet-list"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {snippets.map((snippet) => (
        <motion.div
          key={snippet.id}
          variants={itemVariants}
          className={clsx('snippet-item', {
            'snippet-item--selected': selectedSnippet === snippet.id
          })}
          onClick={() => onSelectSnippet(snippet.id)}
        >
          <div className="snippet-item__content">
            <div className="snippet-item__header">
              <div className="snippet-item__title">
                {snippet.favorite && (
                  <Star className="favorite-icon" size={16} />
                )}
                <span>{snippet.name}</span>
                <span className="category-badge">{snippet.category}</span>
              </div>
              <div className="snippet-item__actions">
                <button
                  className="btn btn--icon btn--small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onExecuteSnippet(snippet.id)
                  }}
                  title="Execute snippet"
                >
                  <Play size={16} />
                </button>
                <button
                  className="btn btn--icon btn--small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditSnippet(snippet.id)
                  }}
                  title="Edit snippet"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="btn btn--icon btn--small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(snippet.id)
                  }}
                  title={snippet.favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star size={16} className={clsx({ 'star-filled': snippet.favorite })} />
                </button>
                <button
                  className="btn btn--icon btn--small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicateSnippet(snippet.id)
                  }}
                  title="Duplicate snippet"
                >
                  <Copy size={16} />
                </button>
                <button
                  className="btn btn--icon btn--small btn--danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSnippet(snippet.id)
                  }}
                  title="Delete snippet"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="snippet-item__description">
              {snippet.description}
            </p>

            <div className="snippet-item__meta">
              <div className="snippet-item__stats">
                <span>
                  <Code size={14} />
                  {snippet.code.split('\n').length} lines
                </span>
                <span>
                  <Clock size={14} />
                  {formatDate(snippet.updatedAt)}
                </span>
              </div>

              {snippet.tags.length > 0 && (
                <div className="tags">
                  {snippet.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

function formatDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}