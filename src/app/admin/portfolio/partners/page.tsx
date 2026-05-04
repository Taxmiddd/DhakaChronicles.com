'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit2, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface PortfolioPartner {
  id: string
  name: string
  category: string
  logo_url: string | null
  color: string
  initial: string
  website_url: string | null
  is_active: boolean
  display_order: number
}

const CATEGORIES = ['Fintech', 'Food & Bev.', 'Automotive', 'FMCG', 'Hospitality', 'Conglomerate', 'Lifestyle', 'Entertainment', 'Electronics', 'Fashion', 'Media', 'Tech', 'NGO']

const EMPTY_PARTNER = {
  name: '', category: 'Tech', logo_url: '', color: '#000000', initial: '', website_url: '',
  is_active: true, display_order: 0,
}

export default function AdminPortfolioPartnersPage() {
  const [partners, setPartners] = useState<PortfolioPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_PARTNER)

  const fetchPartners = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/portfolio/partners')
      if (res.ok) {
        const data = await res.json()
        setPartners(data.partners ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPartners() }, [fetchPartners])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingId
        ? `/api/admin/portfolio/partners/${editingId}`
        : '/api/admin/portfolio/partners'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast.success(editingId ? 'Partner updated' : 'Partner created')
        setForm(EMPTY_PARTNER)
        setEditingId(null)
        setShowAdd(false)
        fetchPartners()
      } else {
        toast.error('Failed to save partner')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this partner?')) return
    setDeletingId(id)

    try {
      const res = await fetch(`/api/admin/portfolio/partners/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Partner deleted')
        fetchPartners()
      } else {
        toast.error('Failed to delete partner')
      }
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (partner: PortfolioPartner) => {
    setForm(partner)
    setEditingId(partner.id)
    setShowAdd(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Portfolio Partners</h1>
          <p className="text-sm text-gray-400 mt-1">Manage brand partners displayed on portfolio page</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_PARTNER); setEditingId(null); setShowAdd(!showAdd) }}
          className="flex items-center gap-2 px-4 py-2 bg-dc-green text-white rounded-lg hover:bg-opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSave} className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Brand Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-dc-green focus:outline-none"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-dc-green focus:outline-none"
            >
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input
              type="text"
              placeholder="Initial (e.g., 'bK')"
              value={form.initial}
              onChange={(e) => setForm({ ...form, initial: e.target.value })}
              required
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-dc-green focus:outline-none"
            />
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="h-10 px-2 rounded-lg cursor-pointer"
            />
            <input
              type="url"
              placeholder="Logo URL (optional)"
              value={form.logo_url || ''}
              onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-dc-green focus:outline-none"
            />
            <input
              type="url"
              placeholder="Website URL (optional)"
              value={form.website_url || ''}
              onChange={(e) => setForm({ ...form, website_url: e.target.value })}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-dc-green focus:outline-none"
            />
            <input
              type="number"
              placeholder="Display Order"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) })}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-dc-green focus:outline-none"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-white">Active</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-dc-green text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            <button
              type="button"
              onClick={() => { setShowAdd(false); setForm(EMPTY_PARTNER); setEditingId(null) }}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-dc-green mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partners.map((partner) => (
            <div key={partner.id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ background: partner.color }}
                >
                  {partner.initial}
                </div>
                <div>
                  <p className="text-white font-semibold">{partner.name}</p>
                  <p className="text-xs text-gray-400">{partner.category}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(partner)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(partner.id)}
                  disabled={deletingId === partner.id}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
