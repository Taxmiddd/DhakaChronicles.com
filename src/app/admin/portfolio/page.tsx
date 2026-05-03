'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

interface PortfolioItem {
  id: string
  brand_name: string
  project_name: string
  category: string
  description: string
  outcome: string | null
  logo_url: string | null
  featured_image_url: string | null
  external_link: string | null
  is_published: boolean
  display_order: number
  created_at: string
}

const CATEGORIES = ['Fashion', 'F&B', 'Tech', 'Lifestyle', 'Corporate', 'Media', 'NGO']

const EMPTY_FORM = {
  brand_name: '', project_name: '', category: 'Fashion', description: '', outcome: '',
  logo_url: '', featured_image_url: '', external_link: '', is_published: true, display_order: 0,
}

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/portfolio')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowAdd(false)
  }

  function handleEdit(item: PortfolioItem) {
    setForm({
      brand_name: item.brand_name,
      project_name: item.project_name,
      category: item.category,
      description: item.description,
      outcome: item.outcome ?? '',
      logo_url: item.logo_url ?? '',
      featured_image_url: item.featured_image_url ?? '',
      external_link: item.external_link ?? '',
      is_published: item.is_published,
      display_order: item.display_order,
    })
    setEditingId(item.id)
    setShowAdd(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingId ? `/api/admin/portfolio/${editingId}` : '/api/admin/portfolio'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Operation failed')
      toast.success(editingId ? 'Item updated' : 'Item created')
      resetForm()
      fetchItems()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this portfolio item?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/portfolio/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Item deleted')
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {
      toast.error('Failed to delete item')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white">Portfolio</h1>
          <p className="text-dc-muted text-sm mt-1">Manage brand collaborations and case studies.</p>
        </div>
        <button
          onClick={() => showAdd ? resetForm() : setShowAdd(true)}
          className="btn-primary gap-2"
        >
          {showAdd ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Item</>}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-5">
          <h2 className="font-headline font-bold text-white border-b border-dc-border pb-3">
            {editingId ? 'Edit Item' : 'New Portfolio Item'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="form-label">Brand Name *</label>
              <input required value={form.brand_name} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))} className="form-input" />
            </div>
            <div>
              <label className="form-label">Project Name *</label>
              <input required value={form.project_name} onChange={e => setForm(f => ({ ...f, project_name: e.target.value }))} className="form-input" />
            </div>
            <div>
              <label className="form-label">Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="form-input">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">External Link</label>
              <input value={form.external_link} onChange={e => setForm(f => ({ ...f, external_link: e.target.value }))} className="form-input" placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Description *</label>
              <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="form-input resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Outcome / Results</label>
              <input value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))} className="form-input" placeholder="e.g. 50% increase in engagement" />
            </div>
            <div>
              <label className="form-label">Logo URL</label>
              <input value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} className="form-input" />
            </div>
            <div>
              <label className="form-label">Featured Image URL</label>
              <input value={form.featured_image_url} onChange={e => setForm(f => ({ ...f, featured_image_url: e.target.value }))} className="form-input" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4 accent-dc-green" />
                <span className="text-sm text-dc-text">Published</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="form-label mb-0">Display Order</span>
                <input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))} className="form-input w-20 text-sm" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-dc-border">
            <button type="button" onClick={resetForm} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? 'Saving…' : editingId ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-dc-green" /></div>
      ) : items.length === 0 ? (
        <div className="glass p-12 rounded-xl text-center">
          <p className="text-dc-muted">No portfolio items yet. Add your first brand collaboration.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="glass rounded-xl overflow-hidden flex flex-col group">
              {item.featured_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.featured_image_url} alt={item.project_name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-dc-surface-2 flex items-center justify-center text-dc-muted text-sm">No Image</div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-bold text-dc-green uppercase">{item.category}</span>
                  {item.is_published
                    ? <CheckCircle2 className="w-4 h-4 text-dc-green" />
                    : <XCircle className="w-4 h-4 text-dc-muted" />}
                </div>
                <h3 className="font-headline font-bold text-white text-lg leading-snug">{item.project_name}</h3>
                <p className="text-dc-muted text-sm mb-3">by {item.brand_name}</p>
                {item.outcome && (
                  <p className="text-xs text-dc-green bg-dc-green/10 rounded px-2 py-1 mb-3 inline-block">{item.outcome}</p>
                )}
                <div className="mt-auto flex justify-between items-center border-t border-dc-border pt-3">
                  <span className="text-xs text-dc-muted">Order: {item.display_order}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(item)} className="p-1.5 text-dc-muted hover:text-dc-green hover:bg-dc-surface-2 rounded transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="p-1.5 text-dc-muted hover:text-dc-red hover:bg-dc-red/10 rounded transition-colors disabled:opacity-50">
                      {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
