import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { categoryApi } from '../api/categories'
import {
  FolderOpen,
  Plus,
  Globe,
  Lock,
  Edit2,
  Trash2,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  EyeOff,
} from 'lucide-react'
import './AgentCategories.css'

function AgentCategories() {
  const [sharedCats, setSharedCats] = useState([])
  const [personalCats, setPersonalCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [toast, setToast] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setError('')
    try {
      const [sharedRes, personalRes] = await Promise.all([
        categoryApi.shared(),
        categoryApi.personalList(),
      ])
      setSharedCats(sharedRes.data?.data ?? [])
      // Filter out disabled personal categories
      const personal = (personalRes.data?.data ?? []).filter(c => !c.isDisabled)
      setPersonalCats(personal)
    } catch (e) {
      setError(e.message || 'Failed to load categories')
      console.error('Failed to load categories', e)
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  function startCreate() {
    setEditingId(null)
    setFormName('')
    setFormDesc('')
    setShowForm(true)
  }

  function startEdit(cat) {
    setEditingId(cat.id)
    setFormName(cat.name)
    setFormDesc(cat.description ?? '')
    setShowForm(true)
  }

  async function submitForm() {
    if (!formName.trim()) return showToast('Name is required', 'error')
    try {
      if (editingId) {
        await categoryApi.updatePersonal(editingId, {
          name: formName.trim(),
          description: formDesc.trim(),
        })
        showToast('Category updated')
      } else {
        await categoryApi.createPersonal({
          name: formName.trim(),
          description: formDesc.trim(),
        })
        showToast('Category created')
      }
      setShowForm(false)
      setEditingId(null)
      loadData()
    } catch (e) {
      showToast(e.message || 'Operation failed', 'error')
    }
  }

  async function toggleDisabled(id) {
    try {
      await categoryApi.togglePersonal(id)
      showToast('Category toggled')
      loadData()
    } catch (e) {
      showToast(e.message || 'Toggle failed', 'error')
    }
  }

  async function remove(id) {
    try {
      await categoryApi.removePersonal(id)
      showToast('Category deleted')
      loadData()
    } catch (e) {
      showToast(e.message || 'Delete failed', 'error')
    }
  }

  function renderSection(title, cats, icon) {
    if (!cats.length) return null
    return (
      <div className="agent-categories-section">
        <h2>{title}</h2>
        <div className="agent-categories-grid">
          {cats.map((cat, i) => (
            <motion.div
              key={cat.id}
              className="agent-category-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="agent-category-icon">
                {icon}
              </div>
              <div>
                <h3>{cat.name}</h3>
                {cat.description && <p>{cat.description}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  function renderPersonal(cats) {
    if (!cats.length) return null
    return (
      <div className="agent-categories-section">
        <h2>My Personal Categories</h2>
        <div className="agent-categories-list">
          {cats.map((cat, i) => (
            <motion.div
              key={cat.id}
              className="agent-category-card-full"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="agent-category-main">
                <div className="agent-category-icon"><Lock size={18} /></div>
                <div className="agent-category-info">
                  <h3>{cat.name}</h3>
                  {cat.description && <p>{cat.description}</p>}
                  <span className="agent-badge personal"><Lock size={11} /> Personal</span>
                </div>
              </div>
              <div className="agent-category-actions">
                {editingId === cat.id ? (
                  <>
                    <input className="edit-name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Category name" />
                    <input className="edit-desc" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Description" />
                    <button className="action-btn save" onClick={submitForm} title="Save"><Save size={15} /></button>
                    <button className="action-btn cancel" onClick={() => { setShowForm(false); setEditingId(null) }} title="Cancel"><X size={15} /></button>
                  </>
                ) : (
                  <>
                    <button className="action-btn" onClick={() => startEdit(cat)} title="Edit"><Edit2 size={15} /></button>
                    <button className="action-btn toggle" onClick={() => toggleDisabled(cat.id)} title="Disable"><EyeOff size={15} /></button>
                    <button className="action-btn danger" onClick={() => remove(cat.id)} title="Delete"><Trash2 size={15} /></button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="agent-categories">
      <div className="agent-categories-header">
        <div>
          <h1>Categories</h1>
          <p>Browse shared categories and manage your own personal ones.</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="agent-categories-add-btn"
          onClick={startCreate}
        >
          <Plus size={17} /> Add Personal
        </motion.button>
      </div>

      {loading ? (
        <div className="agent-categories-loading">Loading...</div>
      ) : error ? (
        <div className="alert alert-danger">{error} <button className="btn btn-sm" onClick={loadData}>Retry</button></div>
      ) : (
        <>
          {renderSection('Shared Categories', sharedCats, <Globe size={18} />)}
          {renderPersonal(personalCats)}

          {(sharedCats.length === 0 && personalCats.length === 0) && (
            <div className="agent-categories-empty">
              <AlertCircle size={36} />
              <p>No categories available yet.</p>
            </div>
          )}

          {personalCats.length === 0 && sharedCats.length > 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No personal categories yet. Create one to get started.</p>
          )}
        </>
      )}

      <AnimatePresence>
        {showForm && !loading && editingId === null && (
          <>
            <div className="agent-categories-backdrop" onClick={() => setShowForm(false)}></div>
            <motion.div
              className="agent-categories-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="agent-categories-form-inner">
                <h3>New Personal Category</h3>
                <input className="form-input" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Category name *" />
                <input className="form-input" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Description" />
                <div className="form-actions">
                  <button className="btn-primary" onClick={submitForm}>Create</button>
                  <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            className={`toast ${toast.type}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AgentCategories
