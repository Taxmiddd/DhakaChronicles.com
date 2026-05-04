'use client'

/*
 * SQL — run once in Supabase SQL editor to create the ads table:
 *
 * CREATE TABLE IF NOT EXISTS ads (
 *   id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   created_at       timestamptz DEFAULT now(),
 *   updated_at       timestamptz DEFAULT now(),
 *   client_name      text NOT NULL,
 *   title            text NOT NULL,
 *   image_url        text NOT NULL,
 *   link_url         text NOT NULL,
 *   position         text NOT NULL DEFAULT 'article_sidebar',
 *   size             text NOT NULL DEFAULT 'sidebar-tall',
 *   is_active        boolean DEFAULT true,
 *   starts_at        timestamptz,
 *   ends_at          timestamptz,
 *   click_count      integer DEFAULT 0,
 *   impression_count integer DEFAULT 0
 * );
 */

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Plus, Trash2, Edit3, ToggleLeft, ToggleRight,
  MousePointerClick, X, Check, Megaphone, ExternalLink,
} from 'lucide-react'

type AdPosition =
  | 'homepage_banner' | 'article_sidebar' | 'article_inline' | 'category_banner'
  | 'feed_native' | 'sticky_mobile' | 'before_footer' | 'widget_mid' | 'widget_right'
type AdSize = 'banner' | 'bite-sized' | 'sidebar-tall' | 'native' | 'auto' | 'square-1000'

interface Ad {
  id: string
  created_at: string
  client_name: string
  title: string
  image_url: string
  link_url: string
  position: AdPosition
  size: AdSize
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  click_count: number
  impression_count: number
}

const POSITIONS: { value: AdPosition; label: string }[] = [
  { value: 'homepage_banner',  label: 'Homepage Banner'        },
  { value: 'widget_mid',       label: 'Homepage Widget (Mid)'  },
  { value: 'widget_right',     label: 'Homepage Widget (Right)'},
  { value: 'article_sidebar',  label: 'Article Sidebar'        },
  { value: 'article_inline',   label: 'Article Inline'         },
  { value: 'category_banner',  label: 'Category Banner'        },
  { value: 'feed_native',      label: 'Feed Native'            },
  { value: 'sticky_mobile',    label: 'Sticky Mobile'          },
  { value: 'before_footer',    label: 'Before Footer'          },
]

const SIZES: { value: AdSize; label: string; note: string }[] = [
  { value: 'auto',         label: 'Free / Auto',  note: 'Adapts to image dimensions' },
  { value: 'square-1000',  label: 'Square',       note: '1000×1000'                  },
  { value: 'banner',       label: 'Leaderboard',  note: '728×90 / 320×50'            },
  { value: 'bite-sized',   label: 'Bite-Sized',   note: '320×50 compact'             },
  { value: 'sidebar-tall', label: 'Half Page',    note: '300×600'                    },
  { value: 'native',       label: 'Native Card',  note: 'Blends with feed'           },
]

const POSITION_COLOR: Record<AdPosition, string> = {
  homepage_banner:  '#00A651',
  widget_mid:       '#10B981',
  widget_right:     '#34D399',
  article_sidebar:  '#06B6D4',
  article_inline:   '#8B5CF6',
  category_banner:  '#F59E0B',
  feed_native:      '#F42A41',
  sticky_mobile:    '#EC4899',
  before_footer:    '#0EA5E9',
}

const EMPTY: Omit<Ad, 'id' | 'created_at' | 'click_count' | 'impression_count'> = {
  client_name: '',
  title: '',
  image_url: '',
  link_url: '',
  position: 'article_sidebar',
  size: 'sidebar-tall',
  is_active: true,
  starts_at: null,
  ends_at: null,
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Ad | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [formPositions, setFormPositions] = useState<AdPosition[]>(['article_sidebar'])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filterPos, setFilterPos] = useState<AdPosition | 'all'>('all')

  useEffect(() => { fetchAds() }, [])

  async function fetchAds() {
    setLoading(true)
    const res = await fetch('/api/admin/ads')
    const json = await res.json()
    setAds(json.ads ?? [])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm({ ...EMPTY })
    setFormPositions(['article_sidebar'])
    setError('')
    setShowForm(true)
  }

  function openEdit(ad: Ad) {
    setEditing(ad)
    setForm({
      client_name: ad.client_name,
      title: ad.title,
      image_url: ad.image_url,
      link_url: ad.link_url,
      position: ad.position,
      size: ad.size,
      is_active: ad.is_active,
      starts_at: ad.starts_at,
      ends_at: ad.ends_at,
    })
    setFormPositions([ad.position])
    setError('')
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.client_name || !form.title || !form.image_url || !form.link_url) {
      setError('Please fill in all required fields.')
      return
    }
    setSaving(true)
    setError('')

    if (editing) {
      const res = await fetch(`/api/admin/ads/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Save failed'); setSaving(false); return }
    } else {
      if (formPositions.length === 0) {
        setError('Select at least one placement.')
        setSaving(false)
        return
      }
      for (const pos of formPositions) {
        const res = await fetch('/api/admin/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, position: pos }),
        })
        const json = await res.json()
        if (!res.ok) { setError(json.error ?? `Failed for ${pos}`); setSaving(false); return }
      }
    }

    setShowForm(false)
    fetchAds()
    setSaving(false)
  }

  async function toggleActive(ad: Ad) {
    await fetch(`/api/admin/ads/${ad.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !ad.is_active }),
    })
    setAds(prev => prev.map(a => a.id === ad.id ? { ...a, is_active: !a.is_active } : a))
  }

  async function handleDelete(ad: Ad) {
    if (!confirm(`Delete "${ad.title}"?`)) return
    await fetch(`/api/admin/ads/${ad.id}`, { method: 'DELETE' })
    setAds(prev => prev.filter(a => a.id !== ad.id))
  }

  const filtered = filterPos === 'all' ? ads : ads.filter(a => a.position === filterPos)
  const activeCount = ads.filter(a => a.is_active).length
  const totalClicks = ads.reduce((s, a) => s + (a.click_count ?? 0), 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white mb-1">Ad Manager</h1>
          <p className="text-sm text-dc-muted">Manage display advertisements across the site.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 shrink-0"
          style={{ background: 'var(--dc-green)' }}
        >
          <Plus className="w-4 h-4" />
          New Ad
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Ads',    value: ads.length },
          { label: 'Active',       value: activeCount },
          { label: 'Total Clicks', value: totalClicks.toLocaleString() },
        ].map(s => (
          <div
            key={s.label}
            className="p-4 rounded-xl"
            style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
          >
            <p className="text-2xl font-black text-white font-headline">{s.value}</p>
            <p className="text-xs text-dc-muted mt-0.5 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Position filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterPos('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterPos === 'all' ? 'bg-dc-green text-white' : 'text-dc-muted border border-dc-border'}`}
        >
          All
        </button>
        {POSITIONS.map(p => (
          <button
            key={p.value}
            onClick={() => setFilterPos(p.value)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
            style={
              filterPos === p.value
                ? { background: POSITION_COLOR[p.value], borderColor: POSITION_COLOR[p.value], color: '#fff' }
                : { color: POSITION_COLOR[p.value], borderColor: `${POSITION_COLOR[p.value]}40`, background: `${POSITION_COLOR[p.value]}12` }
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Ad list */}
      {loading ? (
        <div className="py-20 text-center text-dc-muted text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Megaphone className="w-10 h-10 mx-auto mb-3 text-dc-muted opacity-30" />
          <p className="text-dc-muted text-sm">No ads yet. Click <strong>New Ad</strong> to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ad => (
            <div
              key={ad.id}
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
            >
              {/* Thumbnail */}
              <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--dc-surface-2)' }}>
                {ad.image_url && (
                  <Image
                    src={ad.image_url}
                    alt={ad.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{
                      background: `${POSITION_COLOR[ad.position]}18`,
                      color: POSITION_COLOR[ad.position],
                    }}
                  >
                    {POSITIONS.find(p => p.value === ad.position)?.label ?? ad.position}
                  </span>
                  {!ad.is_active && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 text-dc-muted">
                      Paused
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-white truncate">{ad.title}</p>
                <p className="text-xs text-dc-muted truncate">{ad.client_name}</p>
              </div>

              {/* Clicks */}
              <div className="hidden sm:flex items-center gap-1 text-xs text-dc-muted shrink-0">
                <MousePointerClick className="w-3.5 h-3.5" />
                {(ad.click_count ?? 0).toLocaleString()}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={ad.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-white/5 text-dc-muted hover:text-white transition-colors"
                  title="Preview link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => toggleActive(ad)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  title={ad.is_active ? 'Pause' : 'Activate'}
                  style={{ color: ad.is_active ? 'var(--dc-green)' : 'var(--dc-muted)' }}
                >
                  {ad.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEdit(ad)}
                  className="p-2 rounded-lg hover:bg-white/5 text-dc-muted hover:text-white transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(ad)}
                  className="p-2 rounded-lg hover:bg-dc-red/10 text-dc-muted hover:text-dc-red transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 space-y-5"
            style={{ background: '#111', border: '1px solid var(--dc-border)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-lg text-white">
                {editing ? 'Edit Ad' : 'New Ad'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-dc-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Client name */}
              <Field label="Client Name *">
                <input
                  className="form-input text-sm"
                  value={form.client_name}
                  onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                  placeholder="Acme Corp"
                />
              </Field>

              {/* Internal title */}
              <Field label="Internal Title *">
                <input
                  className="form-input text-sm"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Q1 Campaign – Leaderboard"
                />
              </Field>

              {/* Image URL */}
              <Field label="Ad Image URL *" hint="Upload to Cloudinary/Supabase first, paste URL here">
                <input
                  className="form-input text-sm"
                  value={form.image_url}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://…/banner.jpg"
                />
                {form.image_url && (
                  <div className="relative mt-2 w-full h-24 rounded-lg overflow-hidden" style={{ background: 'var(--dc-surface-2)' }}>
                    <Image src={form.image_url} alt="Preview" fill className="object-contain" unoptimized />
                  </div>
                )}
              </Field>

              {/* Destination URL */}
              <Field label="Destination URL *">
                <input
                  className="form-input text-sm"
                  value={form.link_url}
                  onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                  placeholder="https://example.com/landing"
                />
              </Field>

              {/* Position / Placements */}
              {editing ? (
                <Field label="Position *">
                  <select
                    className="form-input text-sm"
                    value={form.position}
                    onChange={e => setForm(f => ({ ...f, position: e.target.value as AdPosition }))}
                  >
                    {POSITIONS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </Field>
              ) : (
                <Field label="Placements *" hint="Pick every position where this ad should appear — one row is created per placement">
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {POSITIONS.map(p => {
                      const checked = formPositions.includes(p.value)
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() =>
                            setFormPositions(prev =>
                              checked ? prev.filter(v => v !== p.value) : [...prev, p.value]
                            )
                          }
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all border"
                          style={
                            checked
                              ? { background: `${POSITION_COLOR[p.value]}20`, borderColor: POSITION_COLOR[p.value], color: POSITION_COLOR[p.value] }
                              : { background: 'transparent', borderColor: 'var(--dc-border)', color: 'var(--dc-text-muted)' }
                          }
                        >
                          <span
                            className="w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center"
                            style={checked ? { background: POSITION_COLOR[p.value] } : { border: '1px solid var(--dc-border)' }}
                          >
                            {checked && <Check className="w-2.5 h-2.5 text-white" />}
                          </span>
                          {p.label}
                        </button>
                      )
                    })}
                  </div>
                  {formPositions.length > 1 && (
                    <p className="text-[10px] text-dc-green mt-2">
                      {formPositions.length} placements selected — {formPositions.length} ad rows will be created.
                    </p>
                  )}
                </Field>
              )}

              {/* Size */}
              <Field label="Ad Size *">
                <select
                  className="form-input text-sm"
                  value={form.size}
                  onChange={e => setForm(f => ({ ...f, size: e.target.value as AdSize }))}
                >
                  {SIZES.map(s => (
                    <option key={s.value} value={s.value}>{s.label} ({s.note})</option>
                  ))}
                </select>
              </Field>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date (optional)">
                  <input
                    type="datetime-local"
                    className="form-input text-sm"
                    value={form.starts_at ? form.starts_at.slice(0, 16) : ''}
                    onChange={e => setForm(f => ({ ...f, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                  />
                </Field>
                <Field label="End Date (optional)">
                  <input
                    type="datetime-local"
                    className="form-input text-sm"
                    value={form.ends_at ? form.ends_at.slice(0, 16) : ''}
                    onChange={e => setForm(f => ({ ...f, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                  />
                </Field>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  className="flex items-center gap-2 text-sm font-semibold"
                  style={{ color: form.is_active ? 'var(--dc-green)' : 'var(--dc-muted)' }}
                >
                  {form.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  {form.is_active ? 'Active' : 'Paused'}
                </button>
              </div>

              {/* Error */}
              {error && <p className="text-sm text-dc-red">{error}</p>}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: 'var(--dc-green)' }}
                >
                  <Check className="w-4 h-4" />
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Ad'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-dc-muted border border-dc-border hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-dc-muted uppercase tracking-widest">{label}</label>
      {hint && <p className="text-[10px] text-dc-muted/60">{hint}</p>}
      {children}
    </div>
  )
}
