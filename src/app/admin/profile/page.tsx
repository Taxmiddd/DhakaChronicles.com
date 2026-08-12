'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { User, Lock, Save, Loader2, Camera } from 'lucide-react'

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
        <Loader2 className="w-8 h-8 animate-spin text-[#a1a1aa]" />
      </div>
    )
  }

  const initials = profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'DC'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-headline font-bold text-[#fafafa]">My Profile</h1>
        <p className="text-[#a1a1aa] text-sm mt-0.5">Manage your personal information and account security.</p>
      </div>

      {/* Avatar Card */}
      <div className="admin-card p-5">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-[#fafafa]">{initials}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
              <Camera className="w-3 h-3 text-[#a1a1aa]" />
            </div>
          </div>
          <div>
            <p className="font-semibold text-[#fafafa] text-base">{profile.full_name || 'Your Name'}</p>
            <p className="text-[#a1a1aa] text-sm">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[rgba(255,255,255,0.08)]">
        {(['profile', 'security'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px transition-colors capitalize ${
              activeTab === tab
                ? 'border-[#fafafa] text-[#fafafa]'
                : 'border-transparent text-[#a1a1aa] hover:text-[#d4d4d8]'
            }`}
          >
            {tab === 'profile' ? <User className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {tab === 'profile' ? 'Personal Info' : 'Security'}
          </button>
        ))}
      </div>

      {activeTab === 'profile' ? (
        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div className="admin-card p-6 space-y-5">
            <h2 className="font-semibold text-[#fafafa] text-sm border-b border-[rgba(255,255,255,0.08)] pb-3">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="admin-label">Full Name *</label>
                <input
                  required
                  value={profile.full_name}
                  onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                  className="admin-input"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="admin-label">Email Address</label>
                <input
                  disabled
                  value={profile.email}
                  className="admin-input opacity-40 cursor-not-allowed"
                />
                <p className="text-xs text-[#52525b] mt-1">Email cannot be changed.</p>
              </div>
              <div>
                <label className="admin-label">Phone Number</label>
                <input
                  value={profile.phone}
                  onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                  className="admin-input"
                  placeholder="+880 1X XX XXXXXX"
                />
              </div>
              <div>
                <label className="admin-label">Avatar URL</label>
                <input
                  value={profile.avatar_url}
                  onChange={e => setProfile(p => ({ ...p, avatar_url: e.target.value }))}
                  className="admin-input"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <label className="admin-label">Bio</label>
              <textarea
                value={profile.bio}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                rows={4}
                className="admin-input resize-y"
                placeholder="Tell your readers about yourself..."
              />
            </div>
          </div>

          <div className="admin-card p-6 space-y-4">
            <h2 className="font-semibold text-[#fafafa] text-sm border-b border-[rgba(255,255,255,0.08)] pb-3">Social Links</h2>
            {(['facebook_url', 'twitter_url', 'linkedin_url'] as const).map(field => (
              <div key={field}>
                <label className="admin-label capitalize">{field.replace('_url', '').replace('_', ' ')} URL</label>
                <input
                  value={profile[field]}
                  onChange={e => setProfile(p => ({ ...p, [field]: e.target.value }))}
                  className="admin-input"
                  placeholder="https://..."
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#fafafa] text-[#09090b] font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-white transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div className="admin-card p-6 max-w-lg space-y-4">
            <h2 className="font-semibold text-[#fafafa] text-sm border-b border-[rgba(255,255,255,0.08)] pb-3">Change Password</h2>
            <div>
              <label className="admin-label">Current Password *</label>
              <input
                required
                type="password"
                value={passwords.current_password}
                onChange={e => setPasswords(p => ({ ...p, current_password: e.target.value }))}
                className="admin-input"
              />
            </div>
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
              <div className="space-y-4">
                <div>
                  <label className="admin-label">New Password *</label>
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={passwords.new_password}
                    onChange={e => setPasswords(p => ({ ...p, new_password: e.target.value }))}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Confirm New Password *</label>
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={passwords.confirm_password}
                    onChange={e => setPasswords(p => ({ ...p, confirm_password: e.target.value }))}
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#fafafa] text-[#09090b] font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-white transition-colors disabled:opacity-50">
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
