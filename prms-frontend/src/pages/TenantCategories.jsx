import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { categoryApi } from '../api/categories'
import {
  FolderOpen,
  Plus,
  Globe,
  Trash2,
  Edit2,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  EyeOff,
} from 'lucide-react'
import './TenantCategories.css'

function TenantCategories() {
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
    setLoading(true)
    try {
      const [sharedRes, personalRes] = await Promise.all([
        categoryApi.shared(),
        categoryApi.personalList(),
      ])
      // Only show enabled shared categories
      const shared = (sharedRes.data?.data ?? []).filter(c => !c.isDisabled)
      setSharedCats(shared)
      // Only show enabled personal categories
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

  function startEdit(cat) {
    setEditingId(cat.id)
    setFormName(cat.name)
    setFormDesc(cat.description ?? '')
    setShowForm(true)
  }

  function startCreate() {
    setEditingId(null)
    setFormName('')
    setFormDesc('')
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

  /* ---------- shared section (read-only cards) ---------- */
  function SharedSection() {
    if (!sharedCats.length) {
      return (
        <div className="tenant-categories-section">
          <h2>
            <Globe size={16} /> Shared Categories
          </h2>
          <div className="tenant-categories-empty-row">
            <Globe size={28} />
            <p>No shared categories available yet.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="tenant-categories-section">
        <h2>
          <Globe size={16} /> Shared Categories
        </h2>
        <div className="tenant-categories-grid">
          {sharedCats.map((cat, i) => (
            <motion.div
              key={cat.id}
              className="tenant-shared-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="tenant-card-icon shared">
                <Globe size={18} />
              </div>
              <div className="tenant-card-info">
                <h3>{cat.name}</h3>
                {cat.description && <p>{cat.description}</p>}
                <span className="tenant-badge shared-badge">
                  <Globe size={10} /> Shared
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  /* ---------- personal section (editable rows) ---------- */
  function PersonalSection() {
    return (
      <div className="tenant-categories-section">
        <div className="tenant-section-header">
          <h2>My Categories</h2>
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="tenant-add-btn"
            onClick={startCreate}
          >
            <Plus size={15} /> Add
          </motion.button>
        </div>

        {!personalCats.length && !showForm ? (
          <div className="tenant-categories-empty-row">
            <FolderOpen size={28} />
            <p>No personal categories yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="tenant-personal-list">
            {personalCats.map((cat, i) => (
              <motion.div
                key={cat.id}
                className="tenant-personal-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="tenant-personal-main">
                  <div className="tenant-card-icon personal">
                    <FolderOpen size={18} />
                  </div>
                  <div className="tenant-card-info">
                    <h3>{cat.name}</h3>
                    {cat.description && <p>{cat.description}</p>}
                  </div>
                </div>

                {editingId === cat.id ? (
                  <div className="tenant-edit-row">
                    <input
                      className="edit-input"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Category name"
                    />
                    <input
                      className="edit-input"
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Description"
                    />
                    <button className="action-btn save" onClick={submitForm} title="Save">
                      <Save size={15} />
                    </button>
                    <button
                      className="action-btn cancel"
                      onClick={() => { setShowForm(false); setEditingId(null) }}
                      title="Cancel"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="tenant-personal-actions">
                    <button
                      className="action-btn"
                      onClick={() => startEdit(cat)}
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="action-btn toggle"
                      onClick={() => toggleDisabled(cat.id)}
                      title="Disable / Enable"
                    >
                      <EyeOff size={15} />
                    </button>
                    <button
                      className="action-btn danger"
                      onClick={() => remove(cat.id)}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Inline create form (modal overlay when list exists, inline when empty) */}
        <AnimatePresence>
          {showForm && editingId === null && (
            <motion.div
              className="tenant-inline-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <h3>New Personal Category</h3>
              <input
                className="form-input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Category name *"
                autoFocus
              />
              <input
                className="form-input"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Description (optional)"
              />
              <div className="form-actions">
                <button className="btn-primary" onClick={submitForm}>
                  <Save size={15} /> Create
                </button>
                <button className="btn-secondary" onClick={() => setShowForm(false)}>
                  <X size={15} /> Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  /* ---------- both empty ---------- */
  function EmptyState() {
    if (personalCats.length || sharedCats.length) return null
    return (
      <div className="tenant-categories-empty">
        <AlertCircle size={36} />
        <p>No categories available yet. Create a personal one to get started.</p>
      </div>
    )
  }

  return (
    <div className="tenant-categories">
      <div className="tenant-categories-header">
        <div>
          <h1>Categories</h1>
          <p>View shared categories and manage your own personal ones.</p>
        </div>
      </div>

      {loading ? (
        <div className="tenant-categories-loading">Loading categories...</div>
      ) : error ? (
        <div className="alert alert-danger">
          {error}{' '}
          <button className="btn btn-sm" onClick={loadData}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <SharedSection />
          <PersonalSection />
        </>
      )}

      <EmptyState />

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

export default TenantCategories
