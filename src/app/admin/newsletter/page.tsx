'use client'

import { useState, useEffect } from 'react'
import { Send, Users, Mail, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { TipTapEditor } from '@/components/admin/TipTapEditor'

interface Subscriber {
  id: string
  email: string
  name: string | null
  status: string
}

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState<Record<string, unknown>>({ type: 'doc', content: [] })
  const [isSending, setIsSending] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('newsletter_draft')
    if (saved) {
      try {
        const draft = JSON.parse(saved)
        if (draft.subject) setSubject(draft.subject)
        if (draft.content) setContent(draft.content)
      } catch {}
    }
  }, [])

  const handleSaveDraft = () => {
    setIsSavingDraft(true)
    try {
      localStorage.setItem('newsletter_draft', JSON.stringify({ subject, content }))
      toast.success('Draft saved')
    } catch {
      toast.error('Failed to save draft')
    } finally {
      setIsSavingDraft(false)
    }
  }

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const res = await fetch('/api/admin/subscribers')
        const data = await res.json()
        if (data.success) {
          setSubscribers(data.data)
        }
      } catch (err) {
        toast.error('Failed to load subscribers')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscribers()
  }, [])

  const handleSend = async () => {
    if (!subject || !content) {
      toast.error('Subject and content are required')
      return
    }

    setIsSending(true)
    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, content })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Newsletter sent to ${subscribers.length} subscribers!`)
        setSubject('')
        setContent({ type: 'doc', content: [] })
        localStorage.removeItem('newsletter_draft')
      } else {
        toast.error(data.error || 'Failed to send newsletter')
      }
    } catch (err) {
      toast.error('Error sending newsletter')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-dc-green" />
            Newsletter Composer
          </h1>
          <p className="text-dc-text-muted text-sm mt-1">Compose and send updates to your audience.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-dc-surface px-4 py-2 rounded-lg border border-dc-border">
          <Users className="w-5 h-5 text-dc-green" />
          <div>
            <p className="text-xs text-dc-text-muted uppercase font-bold tracking-tighter">Active Subscribers</p>
            <p className="text-lg font-bold text-white leading-none">{isLoading ? '...' : subscribers.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-xl space-y-5">
            <div>
              <label className="form-label" htmlFor="subject">Email Subject</label>
              <input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="form-input text-lg"
                placeholder="Weekly Dhaka Chronicles Digest..."
              />
            </div>

            <div>
              <label className="form-label">Newsletter Content</label>
              <TipTapEditor
                content={content}
                onChange={setContent}
                placeholder="Share the latest stories and insights..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button onClick={handleSaveDraft} disabled={isSavingDraft} className="btn-ghost flex items-center gap-2">
                {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>
              <button 
                onClick={handleSend}
                disabled={isSending || isLoading}
                className="btn-primary flex items-center gap-2"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send to {subscribers.length} Subscribers
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-xl">
            <h3 className="font-headline font-bold text-white mb-4 border-b border-dc-border pb-2">Recent Subscribers</h3>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-dc-green" /></div>
            ) : subscribers.length === 0 ? (
              <p className="text-sm text-dc-text-muted italic">No subscribers yet.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {subscribers.slice(0, 10).map((sub) => (
                  <div key={sub.id} className="p-3 bg-dc-surface-2 rounded-lg border border-dc-border">
                    <p className="text-sm font-bold text-white truncate">{sub.email}</p>
                    <p className="text-xs text-dc-text-muted">{sub.name || 'Anonymous Subscriber'}</p>
                  </div>
                ))}
                {subscribers.length > 10 && (
                  <p className="text-xs text-center text-dc-text-muted mt-2">Plus {subscribers.length - 10} more...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
