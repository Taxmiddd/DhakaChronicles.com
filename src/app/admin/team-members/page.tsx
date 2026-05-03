'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserPlus, Loader2, X, Save, Edit2, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface TeamMember {
  id: string
  full_name: string
  role: string
  bio?: string | null
  avatar_url?: string | null
  twitter_url?: string | null
  linkedin_url?: string | null
  facebook_url?: string | null
  is_active: boolean
  display_order: number
  created_at: string
}

const ROLE_LABELS: Record<string, string> = {
  founder: 'Founder & Editor-in-Chief',
  admin: 'Editor',
  publisher: 'Staff Reporter',
  photographer: 'Photographer',
  videographer: 'Videographer',
  designer: 'Designer',
}

export default function AdminTeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    role: 'publisher',
    bio: '',
    avatar_url: '',
    twitter_url: '',
    linkedin_url: '',
    facebook_url: '',
    is_active: true,
  })

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/team-members')
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members ?? [])
      }
    } catch {
      toast.error('Failed to load team members')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleOpenModal = (member?: TeamMember) => {
    if (member) {
      setFormData({
        full_name: member.full_name,
        role: member.role,
        bio: member.bio || '',
        avatar_url: member.avatar_url || '',
        twitter_url: member.twitter_url || '',
        linkedin_url: member.linkedin_url || '',
        facebook_url: member.facebook_url || '',
        is_active: member.is_active,
      })
      setEditingId(member.id)
    } else {
      setFormData({
        full_name: '',
        role: 'publisher',
        bio: '',
        avatar_url: '',
        twitter_url: '',
        linkedin_url: '',
        facebook_url: '',
        is_active: true,
      })
      setEditingId(null)
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const method = editingId ? 'PATCH' : 'POST'
      const url = editingId
        ? `/api/admin/team-members?id=${editingId}`
        : '/api/admin/team-members'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')

      toast.success(editingId ? 'Team member updated' : 'Team member created')
      handleCloseModal()
      fetchMembers()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove "${name}" from team? This cannot be undone.`)) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/team-members?id=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Team member removed')
      setMembers(prev => prev.filter(m => m.id !== id))
    } catch {
      toast.error('Failed to remove team member')
    } finally {
      setDeleting(null)
    }
  }

  async function handleToggleActive(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/admin/team-members?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !current }),
      })
      if (!res.ok) throw new Error('Failed')
      setMembers(prev =>
        prev.map(m => (m.id === id ? { ...m, is_active: !current } : m))
      )
      toast.success(!current ? 'Member visible on /team' : 'Member hidden from /team')
    } catch {
      toast.error('Failed to update member')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white">Team Members</h1>
          <p className="text-dc-muted text-sm mt-1">Manage public team profiles displayed on /team page</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary gap-2">
          <UserPlus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-dc-green" />
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="dc-table">
            <thead>
              <tr>
                <th style={{ width: '30px' }}></th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="text-dc-muted cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.full_name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-dc-green/10 flex items-center justify-center text-dc-green font-bold text-sm shrink-0">
                          {member.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                      <p className="text-white font-medium">{member.full_name}</p>
                    </div>
                  </td>
                  <td className="text-dc-muted text-sm">{ROLE_LABELS[member.role] || member.role}</td>
                  <td>
                    <span
                      className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full font-bold cursor-pointer ${
                        member.is_active
                          ? 'bg-dc-green/10 text-dc-green'
                          : 'bg-dc-surface-2 text-dc-muted'
                      }`}
                      onClick={() => handleToggleActive(member.id, member.is_active)}
                      title="Click to toggle visibility"
                    >
                      {member.is_active ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="text-dc-muted text-sm">
                    {member.created_at ? format(new Date(member.created_at), 'MMM d, yyyy') : '—'}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(member)}
                        className="p-1.5 rounded-lg hover:bg-dc-surface-2 text-dc-muted hover:text-dc-green transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id, member.full_name)}
                        disabled={deleting === member.id}
                        className="p-1.5 rounded-lg hover:bg-dc-surface-2 text-dc-muted hover:text-dc-red transition-colors disabled:opacity-50"
                        title="Remove"
                      >
                        {deleting === member.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && (
            <p className="py-12 text-center text-dc-muted italic">No team members yet. Add your first one!</p>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-dc-surface border border-dc-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-headline font-bold text-white">
                {editingId ? 'Edit Team Member' : 'Add Team Member'}
              </h3>
              <button onClick={handleCloseModal} className="p-1 text-dc-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="form-input"
                    placeholder="Rahim Uddin"
                  />
                </div>
                <div>
                  <label className="form-label">Role *</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="form-input"
                  >
                    <option value="founder">Founder & Editor-in-Chief</option>
                    <option value="admin">Editor</option>
                    <option value="publisher">Staff Reporter</option>
                    <option value="photographer">Photographer</option>
                    <option value="videographer">Videographer</option>
                    <option value="designer">Designer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="form-input min-h-[100px] resize-none"
                  placeholder="Short bio to display on /team page..."
                />
              </div>

              <div>
                <label className="form-label">Avatar URL</label>
                <input
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  className="form-input"
                  placeholder="https://..."
                />
                {formData.avatar_url && (
                  <img
                    src={formData.avatar_url}
                    alt="Preview"
                    className="w-16 h-16 rounded-lg mt-2 object-cover border border-dc-border"
                  />
                )}
              </div>

              <div>
                <label className="form-label text-xs text-dc-muted mb-2 block">Social Links (Optional)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="form-label text-xs">Twitter</label>
                    <input
                      value={formData.twitter_url}
                      onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                      className="form-input text-sm"
                      placeholder="https://x.com/..."
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">LinkedIn</label>
                    <input
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      className="form-input text-sm"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Facebook</label>
                    <input
                      value={formData.facebook_url}
                      onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                      className="form-input text-sm"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center justify-between rounded-xl border border-dc-border p-3 cursor-pointer">
                <div>
                  <p className="text-sm text-white font-medium">Show on /team page</p>
                  <p className="text-xs text-dc-muted">Member will be publicly visible</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    formData.is_active ? 'bg-dc-green' : 'bg-dc-surface-2'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      formData.is_active ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </label>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving…' : editingId ? 'Update' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
