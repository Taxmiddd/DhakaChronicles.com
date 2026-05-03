'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Send, CheckCircle, Loader2 } from 'lucide-react'

export default function SubmitTipPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [form, setForm] = useState({
    subject: '',
    description: '',
    tipsterName: '',
    tipsterEmail: '',
    tipsterPhone: '',
    location: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/tips/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, isAnonymous }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
        toast.success('Your tip has been submitted securely.')
      } else {
        toast.error(data.error ?? 'Failed to submit tip')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-20 h-20 bg-dc-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-dc-green" />
        </div>
        <h1 className="font-headline font-bold text-dc-text text-3xl mb-4">Tip Received</h1>
        <p className="text-dc-text-muted text-lg mb-8">
          Thank you for sharing your information with our newsroom. Our investigative team will review your tip.
        </p>
        <Link href="/" className="btn-primary inline-flex">Return to Homepage</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-dc-green">Newsroom</span>
        <h1 className="font-headline font-black text-dc-text text-4xl mt-2 mb-4">Send a News Tip</h1>
        <p className="text-dc-text-muted text-lg">
          Do you have a story that needs to be told? Share your tip with the Dhaka Chronicles investigative team.
          We take your privacy seriously.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl space-y-5">
        <div>
          <label className="form-label" htmlFor="subject">Subject <span className="text-dc-red">*</span></label>
          <input
            id="subject"
            required
            maxLength={200}
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Brief summary of the tip"
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="description">Description <span className="text-dc-red">*</span></label>
          <textarea
            id="description"
            required
            rows={6}
            maxLength={5000}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Provide as much detail as possible. Who, what, when, where, and why?"
            className="form-input resize-y"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="location">Location (Optional)</label>
          <input
            id="location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="City, neighbourhood, or specific location"
            className="form-input"
          />
        </div>

        <div className="border-t border-dc-border pt-5">
          <label className="flex items-start gap-3 p-4 rounded-xl cursor-pointer select-none"
            style={{ background: 'var(--dc-surface-2)' }}>
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#00A651] cursor-pointer"
            />
            <span>
              <strong className="block text-dc-text text-sm font-semibold">Submit anonymously</strong>
              <span className="text-dc-text-muted text-sm">We will not collect or store your contact information.</span>
            </span>
          </label>

          {!isAnonymous && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="form-label" htmlFor="tipsterName">Name</label>
                <input id="tipsterName" value={form.tipsterName}
                  onChange={(e) => setForm({ ...form, tipsterName: e.target.value })}
                  className="form-input" placeholder="Your name" />
              </div>
              <div>
                <label className="form-label" htmlFor="tipsterEmail">Email</label>
                <input id="tipsterEmail" type="email" value={form.tipsterEmail}
                  onChange={(e) => setForm({ ...form, tipsterEmail: e.target.value })}
                  className="form-input" placeholder="your@email.com" />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label" htmlFor="tipsterPhone">Phone Number</label>
                <input id="tipsterPhone" type="tel" value={form.tipsterPhone}
                  onChange={(e) => setForm({ ...form, tipsterPhone: e.target.value })}
                  className="form-input" placeholder="+880..." />
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {loading ? 'Submitting securely...' : 'Submit News Tip'}
        </button>
      </form>
    </div>
  )
}
