'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit2, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface PortfolioService {
  id: string
  icon_name: string
  title: string
  description: string
  is_active: boolean
  display_order: number
}

const ICON_OPTIONS = [
  'FileText', 'Monitor', 'Mail', 'Trophy', 'Mic', 'Share2', 'Layers',
  'Users', 'BarChart2', 'TrendingUp', 'Award', 'Target', 'Zap', 'Star',
]

const EMPTY_SERVICE = {
  icon_name: 'FileText', title: '', description: '', is_active: true, display_order: 0,
}

export default function AdminPortfolioServicesPage() {
  const [services, setServices] = useState<PortfolioService[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_SERVICE)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/portfolio/services')
      if (res.ok) {
        const data = await res.json()
        setServices(data.services ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchServices() }, [fetchServices])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingId
        ? `/api/admin/portfolio/services/${editingId}`
        : '/api/admin/portfolio/services'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast.success(editingId ? 'Service updated' : 'Service created')
        setForm(EMPTY_SERVICE)
        setEditingId(null)
        setShowAdd(false)
        fetchServices()
      } else {
        toast.error('Failed to save service')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return
    setDeletingId(id)

    try {
      const res = await fetch(`/api/admin/portfolio/services/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Service deleted')
        fetchServices()
      } else {
        toast.error('Failed to delete service')
      }
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (service: PortfolioService) => {
    setForm(service)
    setEditingId(service.id)
    setShowAdd(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Portfolio Services</h1>
          <p className="text-sm text-gray-400 mt-1">Manage services displayed on portfolio page</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_SERVICE); setEditingId(null); setShowAdd(!showAdd) }}
          className="flex items-center gap-2 px-4 py-2 bg-dc-green text-white rounded-lg hover:bg-opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSave} className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <select
              value={form.icon_name}
              onChange={(e) => setForm({ ...form, icon_name: e.target.value })}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-dc-green focus:outline-none"
            >
              {ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
            </select>
            <input
              type="text"
              placeholder="Service Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-dc-green focus:outline-none"
            />
            <textarea
              placeholder="Service Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={3}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-dc-green focus:outline-none resize-none"
            />
            <div className="grid grid-cols-2 gap-4">
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
              onClick={() => { setShowAdd(false); setForm(EMPTY_SERVICE); setEditingId(null) }}
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
        <div className="space-y-3">
          {services.map((service, i) => (
            <div key={service.id} className="bg-gray-800 rounded-lg p-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                  <p className="text-white font-semibold">{service.title}</p>
                  {!service.is_active && <span className="text-xs px-2 py-0.5 rounded bg-red-900/30 text-red-400">Inactive</span>}
                </div>
                <p className="text-sm text-gray-400">{service.description}</p>
                <p className="text-xs text-gray-500 mt-1">Icon: {service.icon_name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  disabled={deletingId === service.id}
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
