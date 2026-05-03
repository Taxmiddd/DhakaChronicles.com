'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, BarChart2, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface PollOption {
  id?: string
  option_text: string
  vote_count?: number
}

interface Poll {
  id: string
  question: string
  is_active: boolean
  total_votes: number
  created_at: string
  options?: PollOption[]
}

export default function AdminPollsPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<PollOption[]>([{ option_text: '' }, { option_text: '' }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => { fetchPolls() }, [])

  async function fetchPolls() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/polls')
      if (res.ok) {
        const data = await res.json()
        setPolls(data.polls ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const validOptions = options.filter(o => o.option_text.trim())
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options: validOptions, is_active: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create poll')
      toast.success('Poll created')
      setShowAdd(false)
      setQuestion('')
      setOptions([{ option_text: '' }, { option_text: '' }])
      fetchPolls()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this poll?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/polls/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Poll deleted')
      setPolls(prev => prev.filter(p => p.id !== id))
    } catch {
      toast.error('Failed to delete poll')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleToggleActive(poll: Poll) {
    try {
      const res = await fetch(`/api/polls/${poll.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !poll.is_active }),
      })
      if (!res.ok) throw new Error()
      setPolls(prev => prev.map(p => p.id === poll.id ? { ...p, is_active: !p.is_active } : p))
      toast.success(poll.is_active ? 'Poll closed' : 'Poll activated')
    } catch {
      toast.error('Failed to update poll')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-dc-green" /> Polls
          </h1>
          <p className="text-dc-muted text-sm mt-1">Manage interactive polls for your readers.</p>
        </div>
        <button onClick={() => setShowAdd(v => !v)} className="btn-primary gap-2">
          {showAdd ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Create Poll</>}
        </button>
      </div>

      {/* Create Form */}
      {showAdd && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-headline font-bold text-white mb-5">New Poll</h2>
          <form onSubmit={handleCreate} className="space-y-5 max-w-2xl">
            <div>
              <label className="form-label">Question *</label>
              <input
                required
                value={question}
                onChange={e => setQuestion(e.target.value)}
                className="form-input"
                placeholder="What is your opinion on...?"
              />
            </div>
            <div>
              <label className="form-label">Options</label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      required={i < 2}
                      value={opt.option_text}
                      onChange={e => {
                        const next = [...options]
                        next[i].option_text = e.target.value
                        setOptions(next)
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="form-input flex-1"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                        className="p-2 text-dc-red hover:bg-dc-red/10 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setOptions([...options, { option_text: '' }])}
                className="mt-2 text-sm text-dc-green hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add option
              </button>
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
              {isSubmitting ? 'Creating…' : 'Create Poll'}
            </button>
          </form>
        </div>
      )}

      {/* Polls List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-dc-green" />
        </div>
      ) : polls.length === 0 ? (
        <div className="glass p-12 rounded-xl text-center">
          <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-20 text-dc-muted" />
          <p className="text-dc-muted">No polls yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map(poll => (
            <div key={poll.id} className="glass rounded-xl p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3 gap-3">
                <h3 className="font-headline font-bold text-white leading-snug flex-1">{poll.question}</h3>
                <button
                  onClick={() => handleToggleActive(poll)}
                  className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold border transition-colors ${
                    poll.is_active
                      ? 'bg-dc-green/10 text-dc-green border-dc-green/20 hover:bg-dc-green/20'
                      : 'bg-dc-surface-2 text-dc-muted border-dc-border hover:bg-dc-surface'
                  }`}
                >
                  {poll.is_active ? 'Active' : 'Closed'}
                </button>
              </div>

              <div className="space-y-2 mb-4 flex-1">
                {poll.options?.map(opt => {
                  const pct = poll.total_votes > 0 ? Math.round(((opt.vote_count ?? 0) / poll.total_votes) * 100) : 0
                  return (
                    <div key={opt.id} className="relative bg-dc-surface-2 rounded overflow-hidden">
                      <div className="absolute inset-0 bg-dc-green/20 rounded" style={{ width: `${pct}%` }} />
                      <div className="relative flex justify-between p-2 text-sm">
                        <span className="text-dc-text">{opt.option_text}</span>
                        <span className="text-dc-muted font-mono">{pct}% ({opt.vote_count ?? 0})</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between items-center text-xs text-dc-muted border-t border-dc-border pt-3 mt-auto">
                <span>{poll.total_votes} total votes</span>
                <div className="flex items-center gap-3">
                  <span>{format(new Date(poll.created_at), 'MMM d, yyyy')}</span>
                  <button
                    onClick={() => handleDelete(poll.id)}
                    disabled={deletingId === poll.id}
                    className="text-dc-muted hover:text-dc-red transition-colors disabled:opacity-50"
                  >
                    {deletingId === poll.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
