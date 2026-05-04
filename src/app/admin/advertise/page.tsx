'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit2, Loader2, Save, X, CheckCircle2, Star } from 'lucide-react'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdPackage {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: string[]
  is_highlighted: boolean
  cta_label: string
  is_active: boolean
  display_order: number
}

interface MediaStat {
  id: string
  icon_name: string
  value: string
  label: string
  is_active: boolean
  display_order: number
}

interface PartnerLogo {
  id: string
  name: string
  logo_url: string
  website_url: string | null
  is_active: boolean
  display_order: number
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const INPUT = 'w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-dc-green focus:outline-none text-sm'
const LABEL = 'block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1'
const ICON_OPTIONS = ['Users', 'Globe', 'BarChart2', 'Zap', 'TrendingUp', 'Eye', 'Mail', 'Star', 'Award', 'Activity']

// ── Ad Packages panel ─────────────────────────────────────────────────────────

function PackagesPanel() {
  const [packages, setPackages] = useState<AdPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', price: '', period: '/month', description: '',
    features: '', is_highlighted: false, cta_label: 'Get Started',
    is_active: true, display_order: 0,
  })

  const fetchPackages = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/advertise/packages')
      if (res.ok) setPackages((await res.json()).packages ?? [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPackages() }, [fetchPackages])

  function resetForm() {
    setForm({ name: '', price: '', period: '/month', description: '', features: '', is_highlighted: false, cta_label: 'Get Started', is_active: true, display_order: 0 })
    setEditingId(null)
    setShowForm(false)
  }

  function handleEdit(pkg: AdPackage) {
    setForm({
      name: pkg.name, price: pkg.price, period: pkg.period,
      description: pkg.description, features: (pkg.features ?? []).join('\n'),
      is_highlighted: pkg.is_highlighted, cta_label: pkg.cta_label,
      is_active: pkg.is_active, display_order: pkg.display_order,
    })
    setEditingId(pkg.id)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        features: form.features.split('\n').map(f => f.trim()).filter(Boolean),
      }
      const url = editingId ? `/api/admin/advertise/packages/${editingId}` : '/api/admin/advertise/packages'
      const res = await fetch(url, { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error()
      toast.success(editingId ? 'Package updated' : 'Package created')
      resetForm()
      fetchPackages()
    } catch { toast.error('Failed to save package') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this package?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/advertise/packages/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Package deleted')
      setPackages(prev => prev.filter(p => p.id !== id))
    } catch { toast.error('Failed to delete') }
    finally { setDeletingId(null) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{packages.length} package{packages.length !== 1 ? 's' : ''}</p>
        <button onClick={() => showForm ? resetForm() : setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-dc-green text-white rounded-lg text-sm hover:bg-opacity-90">
          {showForm ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5" /> Add Package</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-gray-800 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm border-b border-gray-700 pb-3">{editingId ? 'Edit Package' : 'New Package'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Package Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={INPUT} placeholder="e.g. Premium" />
            </div>
            <div>
              <label className={LABEL}>CTA Button Label</label>
              <input value={form.cta_label} onChange={e => setForm(f => ({ ...f, cta_label: e.target.value }))} className={INPUT} placeholder="Get Started" />
            </div>
            <div>
              <label className={LABEL}>Price *</label>
              <input required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={INPUT} placeholder="৳35,000 or Custom" />
            </div>
            <div>
              <label className={LABEL}>Period</label>
              <input value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} className={INPUT} placeholder="/month" />
            </div>
            <div className="md:col-span-2">
              <label className={LABEL}>Description *</label>
              <input required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={INPUT} placeholder="Brief description of the package" />
            </div>
            <div className="md:col-span-2">
              <label className={LABEL}>Features (one per line) *</label>
              <textarea required rows={4} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} className={`${INPUT} resize-none`} placeholder={'Banner ad (728×90)\nUp to 50,000 impressions/month\nMonthly performance report'} />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_highlighted} onChange={e => setForm(f => ({ ...f, is_highlighted: e.target.checked }))} className="w-4 h-4 accent-dc-green" />
                <span className="text-sm text-white">Highlighted (Most Popular)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-dc-green" />
                <span className="text-sm text-white">Active</span>
              </label>
              <div className="flex items-center gap-2">
                <label className={`${LABEL} mb-0`}>Order</label>
                <input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} className="w-16 bg-gray-700 text-white px-2 py-1.5 rounded text-sm border border-gray-600 focus:outline-none" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-gray-700">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-dc-green text-white rounded-lg text-sm disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-dc-green" /></div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No packages yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map(pkg => (
            <div key={pkg.id} className={`bg-gray-800 rounded-xl p-4 flex flex-col relative ${pkg.is_highlighted ? 'ring-2 ring-dc-green' : ''}`}>
              {pkg.is_highlighted && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-dc-green rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                  <Star className="w-2.5 h-2.5" /> Popular
                </div>
              )}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white font-bold">{pkg.name}</p>
                  <p className="text-dc-green font-black text-lg">{pkg.price}<span className="text-xs text-gray-400 font-normal">{pkg.period}</span></p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${pkg.is_active ? 'bg-dc-green/10 text-dc-green' : 'bg-gray-700 text-gray-400'}`}>
                  {pkg.is_active ? 'Active' : 'Hidden'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{pkg.description}</p>
              <ul className="space-y-1 flex-1 mb-4">
                {(pkg.features ?? []).map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-300">
                    <CheckCircle2 className="w-3 h-3 text-dc-green shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <div className="flex gap-1 pt-3 border-t border-gray-700">
                <button onClick={() => handleEdit(pkg)} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(pkg.id)} disabled={deletingId === pkg.id} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
                  {deletingId === pkg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Media Stats panel ─────────────────────────────────────────────────────────

function StatsPanel() {
  const [stats, setStats] = useState<MediaStat[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState({ icon_name: 'Users', value: '', label: '', is_active: true, display_order: 0 })

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/advertise/stats')
      if (res.ok) setStats((await res.json()).stats ?? [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  function resetForm() {
    setForm({ icon_name: 'Users', value: '', label: '', is_active: true, display_order: 0 })
    setEditingId(null)
    setShowForm(false)
  }

  function handleEdit(stat: MediaStat) {
    setForm({ icon_name: stat.icon_name, value: stat.value, label: stat.label, is_active: stat.is_active, display_order: stat.display_order })
    setEditingId(stat.id)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingId ? `/api/admin/advertise/stats/${editingId}` : '/api/admin/advertise/stats'
      const res = await fetch(url, { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      toast.success(editingId ? 'Stat updated' : 'Stat created')
      resetForm()
      fetchStats()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this stat?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/advertise/stats/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Stat deleted')
      setStats(prev => prev.filter(s => s.id !== id))
    } catch { toast.error('Failed to delete') }
    finally { setDeletingId(null) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{stats.length} stat{stats.length !== 1 ? 's' : ''}</p>
        <button onClick={() => showForm ? resetForm() : setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-dc-green text-white rounded-lg text-sm hover:bg-opacity-90">
          {showForm ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5" /> Add Stat</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-gray-800 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={LABEL}>Icon</label>
              <select value={form.icon_name} onChange={e => setForm(f => ({ ...f, icon_name: e.target.value }))} className={INPUT}>
                {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Value *</label>
              <input required value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className={INPUT} placeholder="500K+" />
            </div>
            <div>
              <label className={LABEL}>Label *</label>
              <input required value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className={INPUT} placeholder="Monthly Readers" />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-dc-green" />
                <span className="text-sm text-white">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-dc-green text-white rounded-lg text-sm disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-dc-green" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(stat => (
            <div key={stat.id} className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-dc-green">{stat.icon_name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${stat.is_active ? 'bg-dc-green/10 text-dc-green' : 'bg-gray-700 text-gray-400'}`}>
                  {stat.is_active ? 'On' : 'Off'}
                </span>
              </div>
              <p className="text-white font-black text-xl">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <div className="flex gap-1 mt-3 pt-2 border-t border-gray-700">
                <button onClick={() => handleEdit(stat)} className="p-1 text-gray-400 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(stat.id)} disabled={deletingId === stat.id} className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50">
                  {deletingId === stat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
          {stats.length === 0 && !loading && <p className="col-span-4 text-center py-8 text-gray-400 text-sm">No stats yet.</p>}
        </div>
      )}
    </div>
  )
}

// ── Partner Logos panel ───────────────────────────────────────────────────────

function LogosPanel() {
  const [logos, setLogos] = useState<PartnerLogo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', logo_url: '', website_url: '', is_active: true, display_order: 0 })

  const fetchLogos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/advertise/partner-logos')
      if (res.ok) setLogos((await res.json()).logos ?? [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchLogos() }, [fetchLogos])

  function resetForm() {
    setForm({ name: '', logo_url: '', website_url: '', is_active: true, display_order: 0 })
    setEditingId(null)
    setShowForm(false)
  }

  function handleEdit(logo: PartnerLogo) {
    setForm({ name: logo.name, logo_url: logo.logo_url, website_url: logo.website_url ?? '', is_active: logo.is_active, display_order: logo.display_order })
    setEditingId(logo.id)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingId ? `/api/admin/advertise/partner-logos/${editingId}` : '/api/admin/advertise/partner-logos'
      const res = await fetch(url, { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      toast.success(editingId ? 'Logo updated' : 'Logo added')
      resetForm()
      fetchLogos()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this logo?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/advertise/partner-logos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Logo removed')
      setLogos(prev => prev.filter(l => l.id !== id))
    } catch { toast.error('Failed to delete') }
    finally { setDeletingId(null) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{logos.length} logo{logos.length !== 1 ? 's' : ''} — shown on the Advertise page</p>
        <button onClick={() => showForm ? resetForm() : setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-dc-green text-white rounded-lg text-sm hover:bg-opacity-90">
          {showForm ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5" /> Add Logo</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-gray-800 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Brand Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={INPUT} placeholder="e.g. bKash" />
            </div>
            <div>
              <label className={LABEL}>Website URL (optional)</label>
              <input value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} className={INPUT} placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className={LABEL}>Logo URL *</label>
              <input required value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} className={INPUT} placeholder="https://cdn.example.com/logo.png" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-dc-green" />
                <span className="text-sm text-white">Active</span>
              </label>
              <div className="flex items-center gap-2">
                <label className={`${LABEL} mb-0`}>Order</label>
                <input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} className="w-16 bg-gray-700 text-white px-2 py-1.5 rounded text-sm border border-gray-600 focus:outline-none" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-dc-green text-white rounded-lg text-sm disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : editingId ? 'Update' : 'Add'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-dc-green" /></div>
      ) : logos.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No partner logos yet. Add logos to show them on the Advertise page.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {logos.map(logo => (
            <div key={logo.id} className="bg-gray-800 rounded-xl p-4 flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo.logo_url} alt={logo.name} className="h-10 w-auto object-contain max-w-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <div className="text-center">
                <p className="text-white text-xs font-semibold">{logo.name}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${logo.is_active ? 'bg-dc-green/10 text-dc-green' : 'bg-gray-700 text-gray-400'}`}>
                  {logo.is_active ? 'Active' : 'Hidden'}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(logo)} className="p-1 text-gray-400 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(logo.id)} disabled={deletingId === logo.id} className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50">
                  {deletingId === logo.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = 'packages' | 'stats' | 'logos'

const TABS: { id: Tab; label: string }[] = [
  { id: 'packages', label: 'Ad Packages' },
  { id: 'stats', label: 'Media Stats' },
  { id: 'logos', label: 'Partner Logos' },
]

export default function AdminAdvertisePage() {
  const [tab, setTab] = useState<Tab>('packages')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Advertise</h1>
        <p className="text-sm text-gray-400 mt-1">Manage ad packages, media stats, and partner logos on the advertise page</p>
      </div>

      <div className="flex gap-1 bg-gray-800 rounded-lg p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-dc-green text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'packages' && <PackagesPanel />}
      {tab === 'stats' && <StatsPanel />}
      {tab === 'logos' && <LogosPanel />}
    </div>
  )
}
