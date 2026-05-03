'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'

export function NewsletterForm({ variant = 'default' }: { variant?: 'default' | 'dark' }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message ?? "You're subscribed!")
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error ?? 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error — please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 text-dc-green py-2">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    )
  }

  const inputClass = variant === 'dark'
    ? 'flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-dc-green focus:bg-white/15 transition-all min-w-0'
    : 'form-input flex-1 text-sm min-w-0'

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="shrink-0 bg-dc-green hover:bg-dc-green-dark text-white rounded-lg px-4 py-2.5 transition-colors disabled:opacity-60 flex items-center gap-2 text-sm font-semibold"
          aria-label="Subscribe"
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-xs text-dc-red">{message}</p>
      )}
    </form>
  )
}
