'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, User, Tag, Clock, AlertCircle, Loader2, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'

interface AssignmentUser { id: string; full_name: string }
interface Category { id: string; name: string; color: string }

interface Assignment {
  id: string
  title: string
  description: string | null
  notes: string | null
  status: 'proposed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  priority: number
  deadline: string | null
  assignee: AssignmentUser | null
  category: { id: string; name: string; color: string } | null
  created_at: string
}

const STATUSES = ['proposed', 'assigned', 'in_progress', 'completed', 'cancelled'] as const
const FILTER_TABS = ['all', 'proposed', 'assigned', 'in_progress', 'completed'] as const

const STATUS_COLORS: Record<string, string> = {
  proposed: 'bg-blue-500/10 text-blue-400',
  assigned: 'bg-purple-500/10 text-purple-400',
  in_progress: 'bg-amber-500/10 text-amber-400',
  completed: 'bg-dc-green/10 text-dc-green',
  cancelled: 'bg-dc-red/10 text-dc-red',
}

function priorityLabel(p: number) {
  return p === 1 ? 'High' : p === 2 ? 'Medium' : 'Low'
}
function priorityColor(p: number) {
  return p === 1 ? 'text-dc-red' : p === 2 ? 'text-amber-400' : 'text-dc-green'
}

const EMPTY_FORM = {
  title: '',
  description: '',
  notes: '',
  status: 'proposed' as Assignment['status'],
  priority: 3,
  deadline: '',
  assignee_id: '',
  category_id: '',
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [users, setUsers] = useState<AssignmentUser[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Assignment | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/assignments').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([asgn, usr, cats]) => {
      if (asgn.success) setAssignments(asgn.data)
      if (usr.users) setUsers(usr.users)
      if (cats.categories) setCategories(cats.categories)
      else if (Array.isArray(cats)) setCategories(cats)
    }).catch(() => toast.error('Failed to load data')).finally(() => setIsLoading(false))
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setShowModal(true)
  }

  const openEdit = (a: Assignment) => {
    setEditing(a)
    setForm({
      title: a.title,
      description: a.description ?? '',
      notes: a.notes ?? '',
      status: a.status,
      priority: a.priority,
      deadline: a.deadline ? a.deadline.slice(0, 10) : '',
      assignee_id: a.assignee?.id ?? '',
      category_id: a.category?.id ?? '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const payload = {
        ...(editing ? { id: editing.id } : {}),
        title: form.title.trim(),
        description: form.description.trim() || null,
        notes: form.notes.trim() || null,
        status: form.status,
        priority: form.priority,
        deadline: form.deadline || null,
        assignee_id: form.assignee_id || null,
        category_id: form.category_id || null,
      }

      const res = await fetch('/api/admin/assignments', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save')

      if (editing) {
        setAssignments(prev => prev.map(a => a.id === editing.id ? json.data : a))
        toast.success('Assignment updated')
      } else {
        setAssignments(prev => [json.data, ...prev])
        toast.success('Assignment created')
      }
      setShowModal(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (a: Assignment, status: Assignment['status']) => {
    const res = await fetch('/api/admin/assignments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: a.id, status }),
    })
    const json = await res.json()
    if (json.success) {
      setAssignments(prev => prev.map(x => x.id === a.id ? json.data : x))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/assignments?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setAssignments(prev => prev.filter(a => a.id !== id))
      toast.success('Assignment deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = assignments.filter(a => filter === 'all' || a.status === filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white">Story Assignments</h1>
          <p className="text-dc-text-muted text-sm mt-1">Track and manage editorial tasks.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Create Assignment
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {FILTER_TABS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize whitespace-nowrap ${
              filter === f ? 'bg-dc-green text-white shadow-lg' : 'bg-dc-surface text-dc-text-muted hover:bg-dc-surface-2'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-dc-green" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-dc-text-muted">
          <p className="text-lg font-semibold">No assignments found</p>
          <p className="text-sm mt-1">Create your first story assignment to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(a => (
            <div
              key={a.id}
              className="glass group p-5 rounded-xl border border-dc-border hover:border-dc-green/30 transition-all flex flex-col h-full"
              style={{ background: 'var(--dc-surface-dark)', borderColor: 'var(--dc-border-dark)' }}
            >
              {/* Status + Priority row */}
              <div className="flex justify-between items-start mb-3">
                <div className="relative">
                  <select
                    value={a.status}
                    onChange={e => handleStatusChange(a, e.target.value as Assignment['status'])}
                    className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded appearance-none cursor-pointer border-0 outline-none ${STATUS_COLORS[a.status]}`}
                    style={{ background: 'transparent' }}
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s} style={{ background: '#111', color: '#fff', textTransform: 'none', fontWeight: 400 }}>
                        {s.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold flex items-center gap-1 ${priorityColor(a.priority)}`}>
                    <AlertCircle className="w-3 h-3" />
                    {priorityLabel(a.priority)}
                  </span>
                  <button
                    onClick={() => openEdit(a)}
                    className="p-1 rounded hover:bg-dc-surface-2 text-dc-text-muted hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                    className="p-1 rounded hover:bg-dc-red/10 text-dc-text-muted hover:text-dc-red transition-colors"
                    title="Delete"
                  >
                    {deletingId === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <h3 className="text-white font-bold text-lg mb-2 leading-tight group-hover:text-dc-green transition-colors line-clamp-2">
                {a.title}
              </h3>
              <p className="text-dc-text-muted text-sm mb-4 line-clamp-3 flex-grow">
                {a.description || 'No description provided.'}
              </p>

              <div className="pt-4 border-t border-dc-border space-y-3 mt-auto" style={{ borderColor: 'var(--dc-border-dark)' }}>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-dc-text">
                    <User className="w-3.5 h-3.5 text-dc-green" />
                    <span>{a.assignee?.full_name || 'Unassigned'}</span>
                  </div>
                  {a.category && (
                    <div className="flex items-center gap-2 text-dc-text-muted">
                      <Tag className="w-3.5 h-3.5" style={{ color: a.category.color }} />
                      <span>{a.category.name}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-dc-text-muted">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{a.deadline ? format(new Date(a.deadline), 'MMM d, yyyy') : 'No deadline'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div
            className="w-full max-w-lg rounded-2xl p-6 space-y-5 relative max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--dc-surface-dark)', border: '1px solid var(--dc-border-dark)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-white text-xl">
                {editing ? 'Edit Assignment' : 'New Assignment'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-dc-text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="form-label">Title <span className="text-dc-red">*</span></label>
              <input
                className="form-input"
                placeholder="Story title or task"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-input min-h-[80px] resize-none"
                placeholder="Brief on what needs to be covered…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as Assignment['status'] }))}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Priority</label>
                <select
                  className="form-input"
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
                >
                  <option value={1}>High</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Assign To</label>
                <select
                  className="form-input"
                  value={form.assignee_id}
                  onChange={e => setForm(f => ({ ...f, assignee_id: e.target.value }))}
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={form.category_id}
                  onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                >
                  <option value="">None</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Deadline</label>
              <input
                type="date"
                className="form-input"
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              />
            </div>

            <div>
              <label className="form-label">Internal Notes</label>
              <textarea
                className="form-input min-h-[60px] resize-none"
                placeholder="Notes for the assignee…"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
