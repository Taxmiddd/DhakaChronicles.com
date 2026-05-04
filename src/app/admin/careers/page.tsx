'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit2, Loader2, Save, X, MapPin, Clock, Briefcase } from 'lucide-react'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Job {
  id: string
  title: string
  department: string
  type: string
  location: string
  description: string
  color: string
  is_active: boolean
  display_order: number
}

interface Perk {
  id: string
  icon_name: string
  title: string
  description: string
  is_active: boolean
  display_order: number
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEPARTMENTS = ['Editorial', 'Engineering', 'Growth', 'Design', 'Business', 'Operations']
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Full-time / Remote', 'Part-time / Contract']
const ICON_OPTIONS = ['Heart', 'Code2', 'Briefcase', 'PenTool', 'TrendingUp', 'Zap', 'Users', 'Globe', 'Star', 'Award']

const EMPTY_JOB = {
  title: '', department: 'Editorial', type: 'Full-time',
  location: 'Dhaka, Bangladesh', description: '', color: '#00A651',
  is_active: true, display_order: 0,
}

const EMPTY_PERK = {
  icon_name: 'Heart', title: '', description: '', is_active: true, display_order: 0,
}

// ── Input styles ──────────────────────────────────────────────────────────────

const INPUT = 'w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-dc-green focus:outline-none text-sm'
const LABEL = 'block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1'

// ── Jobs CRUD panel ───────────────────────────────────────────────────────────

function JobsPanel() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_JOB)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/careers/jobs')
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  function resetForm() {
    setForm(EMPTY_JOB)
    setEditingId(null)
    setShowForm(false)
  }

  function handleEdit(job: Job) {
    setForm({
      title: job.title,
      department: job.department,
      type: job.type,
      location: job.location,
      description: job.description,
      color: job.color,
      is_active: job.is_active,
      display_order: job.display_order,
    })
    setEditingId(job.id)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingId ? `/api/admin/careers/jobs/${editingId}` : '/api/admin/careers/jobs'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success(editingId ? 'Job updated' : 'Job created')
      resetForm()
      fetchJobs()
    } catch {
      toast.error('Failed to save job')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this job opening?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/careers/jobs/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Job deleted')
      setJobs(prev => prev.filter(j => j.id !== id))
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{jobs.length} opening{jobs.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => showForm ? resetForm() : setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-dc-green text-white rounded-lg text-sm hover:bg-opacity-90"
        >
          {showForm ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5" /> Add Job</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-gray-800 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm border-b border-gray-700 pb-3">
            {editingId ? 'Edit Job Opening' : 'New Job Opening'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={LABEL}>Job Title *</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={INPUT} placeholder="e.g. Staff Reporter — Politics" />
            </div>
            <div>
              <label className={LABEL}>Department</label>
              <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className={INPUT}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={INPUT}>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className={INPUT} placeholder="Dhaka, Bangladesh" />
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className={LABEL}>Accent Color</label>
                <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="h-9 w-full rounded-lg cursor-pointer border border-gray-600" />
              </div>
              <div>
                <label className={LABEL}>Order</label>
                <input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} className={`${INPUT} w-20`} />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={LABEL}>Description *</label>
              <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={`${INPUT} resize-none`} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-dc-green" />
              <span className="text-sm text-white">Active (visible on site)</span>
            </label>
          </div>
          <div className="flex gap-2 pt-2 border-t border-gray-700">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-dc-green text-white rounded-lg text-sm hover:bg-opacity-90 disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-dc-green" /></div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No job openings yet.</div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-gray-800 rounded-xl p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: `${job.color}20` }}>
                <Briefcase className="w-5 h-5" style={{ color: job.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{job.title}</p>
                    <p className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: job.color }}>{job.department}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${job.is_active ? 'bg-dc-green/10 text-dc-green' : 'bg-gray-700 text-gray-400'}`}>
                    {job.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.type}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{job.description}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => handleEdit(job)} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(job.id)} disabled={deletingId === job.id} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
                  {deletingId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Perks CRUD panel ──────────────────────────────────────────────────────────

function PerksPanel() {
  const [perks, setPerks] = useState<Perk[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_PERK)

  const fetchPerks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/careers/perks')
      if (res.ok) {
        const data = await res.json()
        setPerks(data.perks ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPerks() }, [fetchPerks])

  function resetForm() {
    setForm(EMPTY_PERK)
    setEditingId(null)
    setShowForm(false)
  }

  function handleEdit(perk: Perk) {
    setForm({
      icon_name: perk.icon_name,
      title: perk.title,
      description: perk.description,
      is_active: perk.is_active,
      display_order: perk.display_order,
    })
    setEditingId(perk.id)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingId ? `/api/admin/careers/perks/${editingId}` : '/api/admin/careers/perks'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success(editingId ? 'Perk updated' : 'Perk created')
      resetForm()
      fetchPerks()
    } catch {
      toast.error('Failed to save perk')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this perk?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/careers/perks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Perk deleted')
      setPerks(prev => prev.filter(p => p.id !== id))
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{perks.length} perk{perks.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => showForm ? resetForm() : setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-dc-green text-white rounded-lg text-sm hover:bg-opacity-90"
        >
          {showForm ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5" /> Add Perk</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-gray-800 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm border-b border-gray-700 pb-3">
            {editingId ? 'Edit Perk' : 'New Perk'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Title *</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={INPUT} placeholder="e.g. Mission-driven" />
            </div>
            <div>
              <label className={LABEL}>Icon Name</label>
              <select value={form.icon_name} onChange={e => setForm(f => ({ ...f, icon_name: e.target.value }))} className={INPUT}>
                {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={LABEL}>Description *</label>
              <input required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={INPUT} placeholder="Short benefit description" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-dc-green" />
                <span className="text-sm text-white">Active</span>
              </label>
              <div className="flex items-center gap-2">
                <label className={`${LABEL} mb-0`}>Order</label>
                <input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} className="w-16 bg-gray-700 text-white px-2 py-1.5 rounded text-sm border border-gray-600 focus:border-dc-green focus:outline-none" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-gray-700">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-dc-green text-white rounded-lg text-sm hover:bg-opacity-90 disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-dc-green" /></div>
      ) : perks.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No perks yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {perks.map(perk => (
            <div key={perk.id} className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-dc-green">{perk.icon_name}</span>
                  <p className="text-white font-semibold text-sm mt-0.5">{perk.title}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${perk.is_active ? 'bg-dc-green/10 text-dc-green' : 'bg-gray-700 text-gray-400'}`}>
                  {perk.is_active ? 'On' : 'Off'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{perk.description}</p>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(perk)} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(perk.id)} disabled={deletingId === perk.id} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
                  {deletingId === perk.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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

type Tab = 'jobs' | 'perks'

export default function AdminCareersPage() {
  const [tab, setTab] = useState<Tab>('jobs')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Careers</h1>
        <p className="text-sm text-gray-400 mt-1">Manage job openings and company perks on the careers page</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800 rounded-lg p-1 w-fit">
        {(['jobs', 'perks'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-md text-sm font-semibold capitalize transition-all ${
              tab === t ? 'bg-dc-green text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t === 'jobs' ? 'Job Openings' : 'Company Perks'}
          </button>
        ))}
      </div>

      {tab === 'jobs' ? <JobsPanel /> : <PerksPanel />}
    </div>
  )
}
