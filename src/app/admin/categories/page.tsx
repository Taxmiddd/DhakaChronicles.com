'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, Tag, X, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  article_count?: number
}

const DEFAULT_COLORS = [
  '#F42A41', '#00A651', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#EC4899', '#10B981', '#3B82F6',
]

const EMPTY_FORM = { name: '', slug: '', description: '', color: '#00A651' }

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories ?? data.data ?? [])
      }
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      color: cat.color ?? '#00A651',
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  function handleNameChange(name: string) {
    setForm(f => ({
      ...f,
      name,
      slug: editing ? f.slug : slugify(name),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const url = editing ? `/api/categories/${editing.id}` : '/api/categories'
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      toast.success(editing ? 'Category updated' : 'Category created')
      closeModal()
      fetchCategories()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? Articles in this category will become uncategorized.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Category deleted')
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch {
      toast.error('Failed to delete category')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white">Categories</h1>
          <p className="text-dc-muted text-sm mt-1">Organise content into editorial sections</p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-dc-green" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="glass p-6 rounded-xl group hover:border-white/15 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color ?? '#00A651'}20`, border: `1px solid ${cat.color ?? '#00A651'}40` }}
                  >
                    <Tag className="w-5 h-5" style={{ color: cat.color ?? '#00A651' }} />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-white">{cat.name}</h3>
                    <p className="text-xs text-dc-muted">/{cat.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg hover:bg-dc-surface-2 text-dc-muted hover:text-dc-green transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deleting === cat.id}
                    className="p-1.5 rounded-lg hover:bg-dc-surface-2 text-dc-muted hover:text-dc-red transition-colors disabled:opacity-50"
                  >
                    {deleting === cat.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-dc-muted text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                {cat.description || <span className="italic opacity-50">No description</span>}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-dc-muted">{cat.article_count ?? 0} articles</span>
                <div className="h-1 flex-1 mx-3 rounded-full bg-dc-surface-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min((cat.article_count ?? 0) / 2.5, 100)}%`, backgroundColor: cat.color ?? '#00A651' }}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={openCreate}
            className="glass p-6 rounded-xl border-dashed hover:bg-dc-surface-2/50 transition-all flex flex-col items-center justify-center gap-3 text-dc-muted hover:text-white min-h-[160px]"
          >
            <div className="w-10 h-10 rounded-full bg-dc-surface-2 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Add Category</span>
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-dc-surface border border-dc-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-headline font-bold text-white">
                {editing ? 'Edit Category' : 'New Category'}
              </h3>
              <button onClick={closeModal} className="p-1 text-dc-muted hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Politics"
                />
              </div>
              <div>
                <label className="form-label">URL Slug *</label>
                <input
                  required
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                  className="form-input font-mono text-sm"
                  placeholder="e.g. politics"
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="form-input min-h-[80px] resize-y"
                  placeholder="Brief description of this section..."
                />
              </div>
              <div>
                <label className="form-label">Color</label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex gap-2 flex-wrap">
                    {DEFAULT_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, color }))}
                        className="w-7 h-7 rounded-full border-2 transition-all"
                        style={{
                          backgroundColor: color,
                          borderColor: form.color === color ? '#fff' : 'transparent',
                          transform: form.color === color ? 'scale(1.2)' : 'scale(1)',
                        }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={form.color}
                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer border border-dc-border bg-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
