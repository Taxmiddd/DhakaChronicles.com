'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { User, Lock, Save, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    bio: '',
    phone: '',
    avatar_url: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
  })

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.profile) {
          const p = data.profile
          setProfile({
            full_name: p.full_name ?? '',
            email: p.email ?? '',
            bio: p.bio ?? '',
            phone: p.phone ?? '',
            avatar_url: p.avatar_url ?? '',
            facebook_url: p.facebook_url ?? '',
            twitter_url: p.twitter_url ?? '',
            linkedin_url: p.linkedin_url ?? '',
          })
        }
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profile.full_name,
          bio: profile.bio,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          facebook_url: profile.facebook_url,
          twitter_url: profile.twitter_url,
          linkedin_url: profile.linkedin_url,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      toast.success('Profile updated')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('New passwords do not match')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwords.current_password,
          new_password: passwords.new_password,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      toast.success('Password changed')
      setPasswords({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-dc-green" />
      </div>
    )
  }

  const initials = profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'DC'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold text-white">My Profile</h1>
        <p className="text-dc-muted text-sm mt-1">Manage your personal information and account security.</p>
      </div>

      {/* Avatar preview */}
      <div className="glass rounded-xl p-5 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-dc-green/20 border border-dc-green/30 flex items-center justify-center shrink-0 overflow-hidden">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-dc-green">{initials}</span>
          )}
        </div>
        <div>
          <p className="text-white font-headline font-bold text-lg">{profile.full_name || 'Your Name'}</p>
          <p className="text-dc-muted text-sm">{profile.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-dc-border">
        {(['profile', 'security'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px transition-colors capitalize ${
              activeTab === tab ? 'border-dc-green text-dc-green' : 'border-transparent text-dc-muted hover:text-white'
            }`}
          >
            {tab === 'profile' ? <User className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {tab === 'profile' ? 'Personal Info' : 'Security'}
          </button>
        ))}
      </div>

      {activeTab === 'profile' ? (
        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div className="glass p-6 rounded-xl space-y-5">
            <h2 className="font-headline font-bold text-white border-b border-dc-border pb-3">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  required
                  value={profile.full_name}
                  onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input
                  disabled
                  value={profile.email}
                  className="form-input opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-dc-muted mt-1">Email cannot be changed.</p>
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input
                  value={profile.phone}
                  onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                  className="form-input"
                  placeholder="+880 1X XX XXXXXX"
                />
              </div>
              <div>
                <label className="form-label">Avatar URL</label>
                <input
                  value={profile.avatar_url}
                  onChange={e => setProfile(p => ({ ...p, avatar_url: e.target.value }))}
                  className="form-input"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <label className="form-label">Bio</label>
              <textarea
                value={profile.bio}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                rows={4}
                className="form-input resize-y"
                placeholder="Tell your readers about yourself..."
              />
            </div>
          </div>

          <div className="glass p-6 rounded-xl space-y-4">
            <h2 className="font-headline font-bold text-white border-b border-dc-border pb-3">Social Links</h2>
            {(['facebook_url', 'twitter_url', 'linkedin_url'] as const).map(field => (
              <div key={field}>
                <label className="form-label capitalize">{field.replace('_url', '').replace('_', ' ')} URL</label>
                <input
                  value={profile[field]}
                  onChange={e => setProfile(p => ({ ...p, [field]: e.target.value }))}
                  className="form-input"
                  placeholder="https://..."
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary gap-2 px-6 py-3">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div className="glass p-6 rounded-xl max-w-lg space-y-4">
            <h2 className="font-headline font-bold text-white border-b border-dc-border pb-3">Change Password</h2>
            <div>
              <label className="form-label">Current Password *</label>
              <input
                required
                type="password"
                value={passwords.current_password}
                onChange={e => setPasswords(p => ({ ...p, current_password: e.target.value }))}
                className="form-input"
              />
            </div>
            <div className="divider" />
            <div>
              <label className="form-label">New Password *</label>
              <input
                required
                type="password"
                minLength={8}
                value={passwords.new_password}
                onChange={e => setPasswords(p => ({ ...p, new_password: e.target.value }))}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Confirm New Password *</label>
              <input
                required
                type="password"
                minLength={8}
                value={passwords.confirm_password}
                onChange={e => setPasswords(p => ({ ...p, confirm_password: e.target.value }))}
                className="form-input"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving} className="btn-primary gap-2 px-6 py-3">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {saving ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
