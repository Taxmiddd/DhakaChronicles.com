'use client'

import { useState, useEffect } from 'react'
import { Save, Globe, Bell, Shield, Palette, Database, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Settings {
  site_name: string
  tagline: string
  site_url: string
  contact_email: string
  breaking_news_enabled: boolean
  bangla_enabled: boolean
  articles_per_page: number
  notify_on_review: boolean
  notify_on_publish: boolean
  notify_on_new_user: boolean
  session_timeout_minutes: number
  max_login_attempts: number
  cloudinary_cloud_name: string
  fb_page_id: string
}

const DEFAULTS: Settings = {
  site_name: 'Dhaka Chronicles',
  tagline: 'The Pulse of Bangladesh',
  site_url: 'https://dhakachronicles.com',
  contact_email: 'editor@dhakachronicles.com',
  breaking_news_enabled: true,
  bangla_enabled: true,
  articles_per_page: 30,
  notify_on_review: true,
  notify_on_publish: true,
  notify_on_new_user: true,
  session_timeout_minutes: 60,
  max_login_attempts: 5,
  cloudinary_cloud_name: '',
  fb_page_id: '',
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors relative ${on ? 'bg-dc-green' : 'bg-dc-surface-2'}`}
      aria-pressed={on}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${on ? 'left-7' : 'left-1'}`} />
    </button>
  )
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({ ...DEFAULTS })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.settings && Object.keys(data.settings).length > 0) {
          setSettings(s => ({ ...s, ...data.settings }))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings(s => ({ ...s, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      toast.success('Settings saved')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-dc-green" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-headline font-bold text-white">Settings</h1>
        <p className="text-dc-text-muted text-sm mt-1">Configure your publication preferences</p>
      </div>

      <div className="space-y-6">

        {/* Site Identity */}
        <section className="glass p-6 rounded-xl space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-5 h-5 text-dc-green" />
            <h2 className="font-headline font-bold text-white">Site Identity</h2>
          </div>
          <div>
            <label className="form-label">Publication Name</label>
            <input className="form-input" value={settings.site_name} onChange={e => set('site_name', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Tagline</label>
            <input className="form-input" value={settings.tagline} onChange={e => set('tagline', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Site URL</label>
            <input className="form-input" value={settings.site_url} onChange={e => set('site_url', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Contact Email</label>
            <input className="form-input" type="email" value={settings.contact_email} onChange={e => set('contact_email', e.target.value)} />
          </div>
        </section>

        {/* Content Settings */}
        <section className="glass p-6 rounded-xl space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="w-5 h-5 text-dc-green" />
            <h2 className="font-headline font-bold text-white">Content Settings</h2>
          </div>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white font-medium">Breaking News Ticker</p>
              <p className="text-dc-text-muted text-sm">Show animated breaking news banner on homepage</p>
            </div>
            <Toggle on={settings.breaking_news_enabled} onToggle={() => set('breaking_news_enabled', !settings.breaking_news_enabled)} />
          </label>
          <div className="divider" />
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white font-medium">Bangla Language Support</p>
              <p className="text-dc-text-muted text-sm">Enable dual-language content publishing (EN / BN)</p>
            </div>
            <Toggle on={settings.bangla_enabled} onToggle={() => set('bangla_enabled', !settings.bangla_enabled)} />
          </label>
          <div>
            <label className="form-label">Articles per Page</label>
            <select
              className="form-input w-40"
              value={settings.articles_per_page}
              onChange={e => set('articles_per_page', Number(e.target.value))}
            >
              {[10, 20, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </section>

        {/* Notifications */}
        <section className="glass p-6 rounded-xl space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-5 h-5 text-dc-green" />
            <h2 className="font-headline font-bold text-white">Notifications</h2>
          </div>
          {([
            { label: 'New article submitted for review', key: 'notify_on_review' as const },
            { label: 'Article published', key: 'notify_on_publish' as const },
            { label: 'New user registered', key: 'notify_on_new_user' as const },
          ]).map(item => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={e => set(item.key, e.target.checked)}
                className="w-4 h-4 accent-dc-green"
              />
              <span className="text-dc-text text-sm">{item.label}</span>
            </label>
          ))}
        </section>

        {/* Security */}
        <section className="glass p-6 rounded-xl space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-dc-green" />
            <h2 className="font-headline font-bold text-white">Security</h2>
          </div>
          <div>
            <label className="form-label">Session Timeout (minutes)</label>
            <input
              className="form-input w-32"
              type="number"
              min={5}
              max={1440}
              value={settings.session_timeout_minutes}
              onChange={e => set('session_timeout_minutes', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="form-label">Max Login Attempts</label>
            <input
              className="form-input w-32"
              type="number"
              min={1}
              max={20}
              value={settings.max_login_attempts}
              onChange={e => set('max_login_attempts', Number(e.target.value))}
            />
          </div>
        </section>

        {/* Integrations */}
        <section className="glass p-6 rounded-xl space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-dc-green" />
            <h2 className="font-headline font-bold text-white">Integrations</h2>
          </div>
          <div>
            <label className="form-label">Cloudinary Cloud Name</label>
            <input
              className="form-input font-mono"
              placeholder="your-cloud-name"
              value={settings.cloudinary_cloud_name}
              onChange={e => set('cloudinary_cloud_name', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Facebook Page ID (for sync)</label>
            <input
              className="form-input font-mono"
              placeholder="100000000000000"
              value={settings.fb_page_id}
              onChange={e => set('fb_page_id', e.target.value)}
            />
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-8 py-3 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
