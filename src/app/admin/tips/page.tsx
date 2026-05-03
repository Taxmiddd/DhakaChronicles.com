'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Lightbulb, Loader2, Save } from 'lucide-react'

interface Tip {
  id: string
  subject: string
  description: string
  tipster_name: string | null
  tipster_email: string | null
  tipster_phone: string | null
  is_anonymous: boolean
  location: string | null
  status: string
  priority: string
  internal_notes: string | null
  submitted_at: string
}

const STATUS_OPTIONS = ['new', 'reviewing', 'investigating', 'published', 'spam']

const STATUS_COLOR: Record<string, string> = {
  new: 'bg-dc-green/10 text-dc-green border-dc-green/20',
  reviewing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  investigating: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  published: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  spam: 'bg-dc-muted/10 text-dc-muted border-dc-border',
}

export default function AdminTipsQueue() {
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('new')
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  const fetchTips = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/tips?status=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setTips(data.tips ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchTips() }, [fetchTips])

  async function updateStatus(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/tips/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Status → ${newStatus}`)
      if (selectedTip?.id === id) setSelectedTip(prev => prev ? { ...prev, status: newStatus } : null)
      if (filter !== 'all' && filter !== newStatus) {
        setTips(prev => prev.filter(t => t.id !== id))
        if (selectedTip?.id === id) setSelectedTip(null)
      } else {
        setTips(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  async function saveNotes() {
    if (!selectedTip) return
    setSavingNotes(true)
    try {
      const res = await fetch(`/api/admin/tips/${selectedTip.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internal_notes: notes }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      toast.success('Notes saved')
      setSelectedTip(data.tip ?? { ...selectedTip, internal_notes: notes })
      setTips(prev => prev.map(t => t.id === selectedTip.id ? { ...t, internal_notes: notes } : t))
    } catch {
      toast.error('Failed to save notes')
    } finally {
      setSavingNotes(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-dc-green" /> News Tips Queue
          </h1>
          <p className="text-dc-muted text-sm mt-1">Review and action reader-submitted news tips.</p>
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="form-input w-44 text-sm"
        >
          <option value="all">All Tips</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-5 h-[calc(100vh-200px)]">
        {/* List */}
        <div className="w-80 glass rounded-xl flex flex-col overflow-hidden shrink-0">
          <div className="overflow-y-auto flex-1 p-2 space-y-1 scrollbar-none">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-dc-muted gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-dc-green" /> Loading…
              </div>
            ) : tips.length === 0 ? (
              <div className="p-6 text-center text-dc-muted">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No tips in this queue.</p>
              </div>
            ) : (
              tips.map(tip => (
                <button
                  key={tip.id}
                  onClick={() => { setSelectedTip(tip); setNotes(tip.internal_notes ?? '') }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedTip?.id === tip.id
                      ? 'bg-dc-green/10 border-dc-green/40'
                      : 'bg-transparent border-transparent hover:bg-dc-surface-2'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <h3 className="font-semibold text-white text-sm line-clamp-1 flex-1">{tip.subject}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border capitalize font-bold shrink-0 ${STATUS_COLOR[tip.status] ?? 'bg-dc-surface-2 text-dc-muted border-dc-border'}`}>
                      {tip.status}
                    </span>
                  </div>
                  <p className="text-xs text-dc-muted mb-1">
                    {format(new Date(tip.submitted_at), 'MMM d, h:mm a')}
                  </p>
                  <p className="text-xs text-dc-text line-clamp-2">{tip.description}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="flex-1 glass rounded-xl overflow-hidden flex flex-col min-w-0">
          {selectedTip ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-dc-border shrink-0">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-xl font-headline font-bold text-white">{selectedTip.subject}</h2>
                  <select
                    value={selectedTip.status}
                    onChange={e => updateStatus(selectedTip.id, e.target.value)}
                    className="form-input text-sm w-44 shrink-0"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-dc-muted">
                  <span><strong className="text-dc-text">Date:</strong> {format(new Date(selectedTip.submitted_at), 'MMMM d, yyyy h:mm a')}</span>
                  <span>
                    <strong className="text-dc-text">From:</strong>{' '}
                    {selectedTip.is_anonymous ? 'Anonymous' : `${selectedTip.tipster_name ?? 'N/A'} <${selectedTip.tipster_email ?? 'no email'}>`}
                  </span>
                  {selectedTip.tipster_phone && <span><strong className="text-dc-text">Phone:</strong> {selectedTip.tipster_phone}</span>}
                  {selectedTip.location && <span><strong className="text-dc-text">Location:</strong> {selectedTip.location}</span>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-dc-muted uppercase tracking-wider mb-3">Description</h3>
                  <div className="glass p-4 rounded-lg text-dc-text whitespace-pre-wrap leading-relaxed text-sm">
                    {selectedTip.description}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-dc-muted uppercase tracking-wider mb-3">Internal Notes</h3>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add private notes for the investigative team..."
                    className="form-input resize-y min-h-[120px] mb-3"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={saveNotes}
                      disabled={savingNotes}
                      className="btn-primary gap-2 text-sm"
                    >
                      {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {savingNotes ? 'Saving…' : 'Save Notes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-dc-muted flex-col gap-3">
              <Lightbulb className="w-12 h-12 opacity-20" />
              <p>Select a tip to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
