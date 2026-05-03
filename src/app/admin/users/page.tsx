'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserPlus, Mail, Users, Trash2, Loader2, X, Save } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface User {
  id: string
  full_name: string
  email: string
  role: 'founder' | 'admin' | 'publisher'
  article_count?: number
  created_at: string
  avatar_url?: string
  bio?: string | null
  twitter_url?: string | null
  linkedin_url?: string | null
  facebook_url?: string | null
  is_active?: boolean
}

const ROLES: User['role'][] = ['founder', 'admin', 'publisher']

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<User['role']>('publisher')
  const [inviteName, setInviteName] = useState('')
  const [inviting, setInviting] = useState(false)
  const [changingRole, setChangingRole] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users ?? data.data ?? [])
      }
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const roleCounts = {
    Founders: users.filter(u => u.role === 'founder').length,
    Admins: users.filter(u => u.role === 'admin').length,
    Publishers: users.filter(u => u.role === 'publisher').length,
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          full_name: inviteName,
          role: inviteRole,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      toast.success('Admin user created successfully')
      setShowInvite(false)
      setInviteEmail('')
      setInviteName('')
      setInviteRole('publisher')
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setInviting(false)
    }
  }

  async function handleRoleChange(userId: string, newRole: User['role']) {
    setChangingRole(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Role updated')
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch {
      toast.error('Failed to update role')
    } finally {
      setChangingRole(null)
    }
  }

  async function handleDelete(userId: string, name: string) {
    if (!confirm(`Remove ${name} from the team? This cannot be undone.`)) return
    setDeleting(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('User removed')
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch {
      toast.error('Failed to remove user')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white">Admin Users</h1>
          <p className="text-dc-muted text-sm mt-1">Manage editorial team access and roles</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="btn-primary gap-2">
          <UserPlus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {Object.entries(roleCounts).map(([label, count]) => (
          <div key={label} className="glass p-5 rounded-xl">
            <p className="text-dc-muted text-sm">{label}</p>
            <p className="text-3xl font-headline font-bold mt-1 text-white">{count}</p>
          </div>
        ))}
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
                <th>User</th>
                <th>Role</th>
                <th>Articles</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-dc-green/10 flex items-center justify-center text-dc-green font-bold text-sm shrink-0">
                        {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.full_name}</p>
                        <p className="text-dc-muted text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value as User['role'])}
                      disabled={changingRole === user.id}
                      className="bg-transparent border border-dc-border text-dc-text text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-dc-green disabled:opacity-50"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r} className="bg-dc-surface capitalize">{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-dc-muted">{user.article_count ?? '—'}</td>
                  <td className="text-dc-muted">
                    {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : '—'}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${user.email}`}
                        className="p-1.5 rounded-lg hover:bg-dc-surface-2 text-dc-muted hover:text-dc-green transition-colors"
                        title="Send email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(user.id, user.full_name)}
                        disabled={deleting === user.id}
                        className="p-1.5 rounded-lg hover:bg-dc-surface-2 text-dc-muted hover:text-dc-red transition-colors disabled:opacity-50"
                        title="Remove user"
                      >
                        {deleting === user.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="py-12 text-center text-dc-muted italic">No users found.</p>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-dc-surface border border-dc-border rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-headline font-bold text-white">Invite Admin User</h3>
              <button onClick={() => setShowInvite(false)} className="p-1 text-dc-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl border border-dc-border p-3 mb-4 flex items-start gap-3 bg-dc-surface-2/30">
              <Users className="w-4 h-4 text-dc-green mt-0.5 shrink-0" />
              <p className="text-xs text-dc-muted leading-relaxed">
                This creates an admin account for editorial team access. For public team profiles, use <span className="text-white">Team Members</span> instead.
              </p>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  required
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="form-input"
                  placeholder="Rahim Uddin"
                />
              </div>
              <div>
                <label className="form-label">Email Address *</label>
                <input
                  required
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="form-input"
                  placeholder="rahim@dhakachronicles.com"
                />
              </div>
              <div>
                <label className="form-label">Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as User['role'])}
                  className="form-input"
                >
                  <option value="publisher">Publisher</option>
                  <option value="admin">Admin</option>
                  <option value="founder">Founder</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInvite(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={inviting} className="btn-primary flex-1 gap-2">
                  {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {inviting ? 'Inviting…' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
