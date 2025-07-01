import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload,
  Settings,
  Code,
  Play,
  Edit,
  Trash2,
  Copy,
  Star
} from 'lucide-react'
import { SnippetList } from './SnippetList'
import { SnippetEditor } from './SnippetEditor'
import { SnippetPreview } from './SnippetPreview'
import { QuickPicker } from './QuickPicker'
import { CategoryFilter } from './CategoryFilter'
import { SettingsPanel } from './SettingsPanel'
import { useSnippets } from '../hooks/useSnippets'
import { useSettings } from '../hooks/useSettings'
import clsx from 'clsx'

export const GCodeSnippets: React.FC = () => {
  const {
    snippets,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    duplicateSnippet,
    toggleFavorite,
    executeSnippet,
    exportSnippets,
    importSnippets
  } = useSnippets()

  const { settings } = useSettings()

  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null)
  const [editingSnippet, setEditingSnippet] = useState<string | null>(null)
  const [showQuickPicker, setShowQuickPicker] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  // Filter snippets based on search and category
  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = !searchTerm || 
      snippet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = !selectedCategory || snippet.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleCreateSnippet = () => {
    const newSnippet = createSnippet({
      name: 'New Snippet',
      description: 'A new G-code snippet',
      category: settings.defaultCategory,
      code: '// Add your G-code here',
      tags: []
    })
    setEditingSnippet(newSnippet.id)
  }

  const handleEditSnippet = (snippetId: string) => {
    setEditingSnippet(snippetId)
    setSelectedSnippet(null)
  }

  const handleDeleteSnippet = async (snippetId: string) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      await deleteSnippet(snippetId)
      if (selectedSnippet === snippetId) {
        setSelectedSnippet(null)
      }
      if (editingSnippet === snippetId) {
        setEditingSnippet(null)
      }
    }
  }

  const handleSaveSnippet = async (snippetData: any) => {
    if (editingSnippet) {
      await updateSnippet(editingSnippet, snippetData)
      setEditingSnippet(null)
    }
  }

  return (
    <div className="gcode-snippets">
      <header className="snippets-header">
        <div className="header-left">
          <h1>G-Code Snippets</h1>
          <span className="snippet-count">{filteredSnippets.length} snippets</span>
        </div>
        
        <div className="header-actions">
          <button
            className="btn btn--icon"
            onClick={() => setShowQuickPicker(true)}
            title="Quick Insert (Ctrl+Shift+I)"
          >
            <Search size={18} />
          </button>
          
          <button
            className="btn btn--icon"
            onClick={handleCreateSnippet}
            title="Create New Snippet"
          >
            <Plus size={18} />
          </button>
          
          <button
            className="btn btn--icon"
            onClick={exportSnippets}
            title="Export Snippets"
          >
            <Download size={18} />
          </button>
          
          <button
            className="btn btn--icon"
            onClick={importSnippets}
            title="Import Snippets"
          >
            <Upload size={18} />
          </button>
          
          <button
            className="btn btn--icon"
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <div className="snippets-toolbar">
        <div className="search-container">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search snippets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="view-toggle">
          <button
            className={clsx('btn btn--small', { 'btn--active': view === 'grid' })}
            onClick={() => setView('grid')}
          >
            Grid
          </button>
          <button
            className={clsx('btn btn--small', { 'btn--active': view === 'list' })}
            onClick={() => setView('list')}
          >
            List
          </button>
        </div>
      </div>

      <div className="snippets-content">
        <div className="snippets-main">
          <SnippetList
            snippets={filteredSnippets}
            view={view}
            selectedSnippet={selectedSnippet}
            onSelectSnippet={setSelectedSnippet}
            onEditSnippet={handleEditSnippet}
            onDeleteSnippet={handleDeleteSnippet}
            onDuplicateSnippet={duplicateSnippet}
            onToggleFavorite={toggleFavorite}
            onExecuteSnippet={executeSnippet}
          />
        </div>

        <AnimatePresence>
          {selectedSnippet && (
            <motion.div
              className="snippets-sidebar"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SnippetPreview
                snippet={snippets.find(s => s.id === selectedSnippet)!}
                onEdit={() => handleEditSnippet(selectedSnippet)}
                onDelete={() => handleDeleteSnippet(selectedSnippet)}
                onDuplicate={() => duplicateSnippet(selectedSnippet)}
                onToggleFavorite={() => toggleFavorite(selectedSnippet)}
                onExecute={() => executeSnippet(selectedSnippet)}
                onClose={() => setSelectedSnippet(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Dialogs */}
      <AnimatePresence>
        {editingSnippet && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingSnippet(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <SnippetEditor
                snippet={snippets.find(s => s.id === editingSnippet)}
                categories={categories}
                onSave={handleSaveSnippet}
                onCancel={() => setEditingSnippet(null)}
              />
            </motion.div>
          </motion.div>
        )}

        {showQuickPicker && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuickPicker(false)}
          >
            <motion.div
              className="modal-content modal-content--small"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <QuickPicker
                snippets={snippets}
                onSelectSnippet={(snippet) => {
                  executeSnippet(snippet.id)
                  setShowQuickPicker(false)
                }}
                onClose={() => setShowQuickPicker(false)}
              />
            </motion.div>
          </motion.div>
        )}

        {showSettings && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <SettingsPanel
                onClose={() => setShowSettings(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredSnippets.length === 0 && (
        <div className="empty-state">
          <Code size={64} className="empty-icon" />
          <h3>No snippets found</h3>
          <p>
            {searchTerm || selectedCategory
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first G-code snippet to get started'
            }
          </p>
          {!searchTerm && !selectedCategory && (
            <button className="btn btn--primary" onClick={handleCreateSnippet}>
              <Plus size={16} />
              Create First Snippet
            </button>
          )}
        </div>
      )}
    </div>
  )
}