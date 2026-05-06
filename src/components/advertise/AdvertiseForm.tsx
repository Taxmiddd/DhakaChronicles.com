'use client'

import { useState } from 'react'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'

const BUDGETS = [
  '৳10,000 – ৳25,000 / month',
  '৳25,000 – ৳50,000 / month',
  '৳50,000 – ৳1,00,000 / month',
  '৳1,00,000+ / month',
  'Custom / one-time campaign',
]

export function AdvertiseForm() {
  const [form, setForm] = useState({ name: '', email: '', company: '', budget: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/advertise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDone(true)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}>
        <CheckCircle2 className="w-12 h-12 text-dc-green mx-auto mb-4" />
        <h3 className="font-headline font-bold text-xl mb-2" style={{ color: 'var(--dc-text)' }}>Inquiry Received</h3>
        <p className="text-sm" style={{ color: 'var(--dc-text-muted)' }}>
          Thank you, {form.name}. Our advertising team will be in touch within 1–2 business days.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-7 sm:p-9 space-y-5"
      style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
    >
      <div>
        <h2 className="font-headline font-bold text-2xl mb-1" style={{ color: 'var(--dc-text)' }}>
          Get in Touch
        </h2>
        <p className="text-sm" style={{ color: 'var(--dc-text-muted)' }}>
          Fill in the form and our team will contact you with a tailored proposal.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--dc-text-muted)' }}>
            Your Name *
          </label>
          <input
            required
            className="form-input text-sm"
            placeholder="Rahim Ahmed"
            value={form.name}
            onChange={set('name')}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--dc-text-muted)' }}>
            Email Address *
          </label>
          <input
            required
            type="email"
            className="form-input text-sm"
            placeholder="rahim@company.com"
            value={form.email}
            onChange={set('email')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--dc-text-muted)' }}>
            Company / Brand
          </label>
          <input
            className="form-input text-sm"
            placeholder="Acme Corp"
            value={form.company}
            onChange={set('company')}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--dc-text-muted)' }}>
            Monthly Budget
          </label>
          <select className="form-input text-sm" value={form.budget} onChange={set('budget')}>
            <option value="">— Select a range —</option>
            {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--dc-text-muted)' }}>
          Tell Us About Your Campaign *
        </label>
        <textarea
          required
          rows={4}
          className="form-input text-sm resize-y"
          placeholder="Describe your goals, target audience, campaign duration, or any specific requirements..."
          value={form.message}
          onChange={set('message')}
        />
      </div>

      {error && <p className="text-sm text-dc-red">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
        style={{ background: 'var(--dc-green)' }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {loading ? 'Sending…' : 'Send Inquiry'}
      </button>
    </form>
  )
}
