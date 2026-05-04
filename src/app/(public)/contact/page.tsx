'use client'

import { useState } from 'react'
import { Mail, MessageSquare, Send, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send message')
      setSubmitted(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-dc-green">Contact</span>
        <h1 className="font-headline font-black text-dc-text text-4xl mt-2 mb-3">Get in Touch</h1>
        <p className="text-dc-text-muted text-lg">
          Press enquiries, tips, corrections, or general feedback — we read everything.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Mail, label: 'General', value: 'hello@dhakachronicles.com', href: 'mailto:hello@dhakachronicles.com' },
          { icon: MessageSquare, label: 'Tips', value: 'tips@dhakachronicles.com', href: 'mailto:tips@dhakachronicles.com' },
          { icon: Mail, label: 'Press', value: 'press@dhakachronicles.com', href: 'mailto:press@dhakachronicles.com' },
        ].map(item => (
          <a key={item.label} href={item.href}
            className="glass p-5 rounded-xl hover:border-dc-green/30 border border-transparent transition-all group">
            <item.icon className="w-5 h-5 text-dc-green mb-3" />
            <p className="text-dc-text-muted text-xs uppercase tracking-wider mb-1">{item.label}</p>
            <p className="text-dc-text text-sm font-medium group-hover:text-dc-green transition-colors">{item.value}</p>
          </a>
        ))}
      </div>

      {submitted ? (
        <div className="glass p-10 rounded-2xl text-center">
          <CheckCircle className="w-14 h-14 text-dc-green mx-auto mb-4" />
          <h2 className="font-headline font-bold text-dc-text text-xl mb-2">Message Sent!</h2>
          <p className="text-dc-text-muted">We'll get back to you within 24–48 hours.</p>
          <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
            className="btn-ghost mt-6 px-5 py-2">
            Send Another
          </button>
        </div>
      ) : (
        <div className="glass p-8 rounded-2xl">
          <h2 className="font-headline font-bold text-dc-text text-xl mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="name">Full Name</label>
                <input id="name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="form-input" placeholder="Your name" />
              </div>
              <div>
                <label className="form-label" htmlFor="email">Email Address</label>
                <input id="email" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="form-input" placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <label className="form-label" htmlFor="subject">Subject</label>
              <input id="subject" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="form-input" placeholder="What is this regarding?" />
            </div>
            <div>
              <label className="form-label" htmlFor="message">Message</label>
              <textarea id="message" required rows={6} value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="form-input resize-none" placeholder="Tell us more..." />
            </div>
            <button type="submit" disabled={loading} className="btn-primary px-6 py-3 flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Message
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
