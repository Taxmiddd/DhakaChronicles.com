'use client'

import { useState } from 'react'
import { Save, Globe, Bell, Shield, Palette, Database } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('Dhaka Chronicles')
  const [tagline, setTagline] = useState('The Pulse of Bangladesh')
  const [breakingEnabled, setBreakingEnabled] = useState(true)
  const [banglaEnabled, setBanglaEnabled] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    toast.success('Settings saved successfully')
    setSaving(false)
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
            <input className="form-input" value={siteName} onChange={e => setSiteName(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Tagline</label>
            <input className="form-input" value={tagline} onChange={e => setTagline(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Site URL</label>
            <input className="form-input" defaultValue="https://dhakachronicles.com" />
          </div>
          <div>
            <label className="form-label">Contact Email</label>
            <input className="form-input" type="email" defaultValue="editor@dhakachronicles.com" />
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
            <button
              onClick={() => setBreakingEnabled(v => !v)}
              className={`w-12 h-6 rounded-full transition-colors relative ${breakingEnabled ? 'bg-dc-green' : 'bg-dc-surface-2'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${breakingEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </label>
          <div className="divider" />
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white font-medium">Bangla Language Support</p>
              <p className="text-dc-text-muted text-sm">Enable dual-language content publishing (EN / BN)</p>
            </div>
            <button
              onClick={() => setBanglaEnabled(v => !v)}
              className={`w-12 h-6 rounded-full transition-colors relative ${banglaEnabled ? 'bg-dc-green' : 'bg-dc-surface-2'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${banglaEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </label>
          <div>
            <label className="form-label">Articles per Page</label>
            <select className="form-input w-40" defaultValue="30">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
            </select>
          </div>
        </section>

        {/* Notifications */}
        <section className="glass p-6 rounded-xl space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-5 h-5 text-dc-green" />
            <h2 className="font-headline font-bold text-white">Notifications</h2>
          </div>
          {[
            { label: 'New article submitted for review', key: 'review' },
            { label: 'Article published', key: 'publish' },
            { label: 'New user registered', key: 'user' },
          ].map(item => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-dc-green" />
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
            <input className="form-input w-32" type="number" defaultValue={60} />
          </div>
          <div>
            <label className="form-label">Max Login Attempts</label>
            <input className="form-input w-32" type="number" defaultValue={5} />
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
            <input className="form-input font-mono" placeholder="your-cloud-name" />
          </div>
          <div>
            <label className="form-label">Mailchimp API Key</label>
            <input className="form-input font-mono" placeholder="xxxxxxxxxxxxxxxx-us21" type="password" />
          </div>
          <div>
            <label className="form-label">Facebook Page ID (for sync)</label>
            <input className="form-input font-mono" placeholder="100000000000000" />
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-8 py-3"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
