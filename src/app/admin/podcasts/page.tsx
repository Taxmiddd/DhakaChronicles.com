'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Mic, Play, Loader2, Pencil, Trash2, X,
  ExternalLink, Radio, Clock, Hash,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import Image from 'next/image'

interface Podcast {
  id: string
  title: string
  description: string | null
  audio_url: string | null
  cover_image_url: string | null
  episode_number: number | null
  season: number
  duration_seconds: number | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  spotify_url: string | null
  apple_url: string | null
  youtube_url: string | null
  author: { full_name: string } | null
  created_at: string
}

const STATUS_COLORS = {
  draft: 'bg-slate-500/10 text-slate-400',
  published: 'bg-dc-green/10 text-dc-green',
  archived: 'bg-amber-500/10 text-amber-400',
}

const EMPTY_FORM = {
  title: '',
  description: '',
  audio_url: '',
  cover_image_url: '',
  episode_number: '',
  season: '1',
  duration_seconds: '',
  status: 'draft' as Podcast['status'],
  spotify_url: '',
  apple_url: '',
  youtube_url: '',
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Podcast | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/admin/podcasts?status=${filter}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.podcasts) setPodcasts(data.podcasts) })
      .catch(() => toast.error('Failed to load podcasts'))
      .finally(() => setIsLoading(false))
  }, [filter])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setShowModal(true)
  }

  const openEdit = (p: Podcast) => {
    setEditing(p)
    setForm({
      title: p.title,
      description: p.description ?? '',
      audio_url: p.audio_url ?? '',
      cover_image_url: p.cover_image_url ?? '',
      episode_number: p.episode_number?.toString() ?? '',
      season: p.season?.toString() ?? '1',
      duration_seconds: p.duration_seconds?.toString() ?? '',
      status: p.status,
      spotify_url: p.spotify_url ?? '',
      apple_url: p.apple_url ?? '',
      youtube_url: p.youtube_url ?? '',
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
        audio_url: form.audio_url.trim() || null,
        cover_image_url: form.cover_image_url.trim() || null,
        episode_number: form.episode_number ? Number(form.episode_number) : null,
        season: Number(form.season) || 1,
        duration_seconds: form.duration_seconds ? Number(form.duration_seconds) : null,
        status: form.status,
        spotify_url: form.spotify_url.trim() || null,
        apple_url: form.apple_url.trim() || null,
        youtube_url: form.youtube_url.trim() || null,
      }

      const res = await fetch('/api/admin/podcasts', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save')

      if (editing) {
        setPodcasts(prev => prev.map(p => p.id === editing.id ? json.podcast : p))
        toast.success('Episode updated')
      } else {
        setPodcasts(prev => [json.podcast, ...prev])
        toast.success('Episode created')
      }
      setShowModal(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this episode?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/podcasts?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setPodcasts(prev => prev.filter(p => p.id !== id))
      toast.success('Episode deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const counts = {
    all: podcasts.length,
    published: podcasts.filter(p => p.status === 'published').length,
    draft: podcasts.filter(p => p.status === 'draft').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white">Podcasts</h1>
          <p className="text-dc-text-muted text-sm mt-1">Manage podcast episodes and audio content.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Episode
        </button>
      </div>

      {/* Stats tabs */}
      <div className="grid grid-cols-3 gap-4">
        {(['all', 'published', 'draft'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="glass p-4 rounded-xl text-left transition-all"
            style={{
              border: `1px solid ${filter === s ? 'var(--dc-green)' : 'var(--dc-border-dark)'}`,
              opacity: filter === s ? 1 : 0.7,
            }}
          >
            <p className="text-xs text-dc-text-muted uppercase tracking-widest font-bold mb-1 capitalize">{s}</p>
            <p className="text-2xl font-headline font-bold text-white">{counts[s]}</p>
          </button>
        ))}
      </div>

      {/* Episodes */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-dc-green" /></div>
      ) : podcasts.length === 0 ? (
        <div className="text-center py-24 text-dc-text-muted">
          <Mic className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">No episodes yet</p>
          <p className="text-sm mt-1">Create your first podcast episode to get started.</p>
          <button onClick={openCreate} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Episode
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {podcasts.map(p => (
            <div
              key={p.id}
              className="glass rounded-xl p-4 flex gap-4 items-start"
              style={{ border: '1px solid var(--dc-border-dark)' }}
            >
              {/* Cover */}
              <div
                className="w-16 h-16 rounded-lg shrink-0 overflow-hidden flex items-center justify-center"
                style={{ background: 'var(--dc-surface-2-dark)' }}
              >
                {p.cover_image_url ? (
                  <div className="relative w-full h-full">
                    <Image src={p.cover_image_url} alt={p.title} fill className="object-cover" sizes="64px" unoptimized />
                  </div>
                ) : (
                  <Radio className="w-6 h-6 text-dc-green opacity-60" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded ${STATUS_COLORS[p.status]}`}>
                    {p.status}
                  </span>
                  {p.episode_number != null && (
                    <span className="text-[10px] text-dc-text-muted flex items-center gap-0.5">
                      <Hash className="w-2.5 h-2.5" />Ep {p.episode_number} · S{p.season}
                    </span>
                  )}
                  {p.duration_seconds && (
                    <span className="text-[10px] text-dc-text-muted flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />{formatDuration(p.duration_seconds)}
                    </span>
                  )}
                </div>
                <h3 className="text-white font-bold text-base leading-snug truncate">{p.title}</h3>
                {p.description && (
                  <p className="text-dc-text-muted text-xs mt-1 line-clamp-1">{p.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {p.audio_url && (
                    <a href={p.audio_url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-dc-green flex items-center gap-0.5 hover:underline">
                      <Play className="w-2.5 h-2.5" /> Audio
                    </a>
                  )}
                  {p.spotify_url && (
                    <a href={p.spotify_url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-dc-text-muted hover:text-white flex items-center gap-0.5">
                      <ExternalLink className="w-2.5 h-2.5" /> Spotify
                    </a>
                  )}
                  {p.apple_url && (
                    <a href={p.apple_url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-dc-text-muted hover:text-white flex items-center gap-0.5">
                      <ExternalLink className="w-2.5 h-2.5" /> Apple
                    </a>
                  )}
                  {p.youtube_url && (
                    <a href={p.youtube_url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-dc-text-muted hover:text-white flex items-center gap-0.5">
                      <ExternalLink className="w-2.5 h-2.5" /> YouTube
                    </a>
                  )}
                  <span className="text-[10px] text-dc-text-muted ml-auto">
                    {format(new Date(p.published_at ?? p.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(p)}
                  className="p-2 rounded-lg text-dc-text-muted hover:text-white transition-colors"
                  style={{ background: 'transparent' }}
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="p-2 rounded-lg text-dc-text-muted hover:text-dc-red transition-colors"
                  title="Delete"
                >
                  {deletingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div
            className="w-full max-w-xl rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--dc-surface-dark)', border: '1px solid var(--dc-border-dark)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-white text-xl">
                {editing ? 'Edit Episode' : 'New Episode'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-dc-text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="form-label">Title <span className="text-dc-red">*</span></label>
              <input
                className="form-input"
                placeholder="Episode title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-input min-h-[72px] resize-none"
                placeholder="Episode summary…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="form-label">Episode #</label>
                <input type="number" className="form-input" placeholder="1" min={1}
                  value={form.episode_number}
                  onChange={e => setForm(f => ({ ...f, episode_number: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Season</label>
                <input type="number" className="form-input" placeholder="1" min={1}
                  value={form.season}
                  onChange={e => setForm(f => ({ ...f, season: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Duration (s)</label>
                <input type="number" className="form-input" placeholder="1800" min={0}
                  value={form.duration_seconds}
                  onChange={e => setForm(f => ({ ...f, duration_seconds: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as Podcast['status'] }))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="form-label">Audio URL</label>
              <input className="form-input font-mono text-sm" placeholder="https://…/episode.mp3"
                value={form.audio_url}
                onChange={e => setForm(f => ({ ...f, audio_url: e.target.value }))} />
            </div>

            <div>
              <label className="form-label">Cover Image URL</label>
              <input className="form-input font-mono text-sm" placeholder="https://res.cloudinary.com/…"
                value={form.cover_image_url}
                onChange={e => setForm(f => ({ ...f, cover_image_url: e.target.value }))} />
            </div>

            <div>
              <label className="form-label">Spotify URL</label>
              <input className="form-input font-mono text-sm" placeholder="https://open.spotify.com/episode/…"
                value={form.spotify_url}
                onChange={e => setForm(f => ({ ...f, spotify_url: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Apple Podcasts URL</label>
              <input className="form-input font-mono text-sm" placeholder="https://podcasts.apple.com/…"
                value={form.apple_url}
                onChange={e => setForm(f => ({ ...f, apple_url: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">YouTube URL</label>
              <input className="form-input font-mono text-sm" placeholder="https://youtube.com/watch?v=…"
                value={form.youtube_url}
                onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))} />
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
