'use client'

import { useState, useEffect, useCallback } from 'react'
import { Send, Clock, Pin, Trash2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Update {
  id: string
  content: { type: 'doc', content: any[] } | string
  is_pinned: boolean
  created_at: string
  author?: { full_name: string }
}

export function LiveBlogEditor({ articleId }: { articleId: string }) {
  const [updates, setUpdates] = useState<Update[]>([])
  const [newUpdate, setNewUpdate] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchUpdates = async () => {
    try {
      const res = await fetch(`/api/live-blogs/${articleId}`)
      const data = await res.json()
      if (data.success) {
        setUpdates(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (articleId) fetchUpdates()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId])

  const handleDelete = useCallback(async (updateId: string) => {
    if (!confirm('Delete this live update?')) return
    setDeletingId(updateId)
    try {
      const res = await fetch(`/api/live-blogs/${articleId}?updateId=${updateId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setUpdates(prev => prev.filter(u => u.id !== updateId))
        toast.success('Update deleted')
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch {
      toast.error('Error deleting update')
    } finally {
      setDeletingId(null)
    }
  }, [articleId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUpdate.trim()) return

    setIsSubmitting(true)
    try {
      // Simplified approach: treating content as raw text for rapid updates,
      // though schema requires JSONB. We'll wrap it in standard TipTap JSON structure.
      const tiptapContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: newUpdate }]
          }
        ]
      }

      const res = await fetch(`/api/live-blogs/${articleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: tiptapContent, isPinned })
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Live update published!')
        setNewUpdate('')
        setIsPinned(false)
        fetchUpdates()
      } else {
        toast.error(data.error || 'Failed to post update')
      }
    } catch (err) {
      toast.error('Error posting update')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="glass p-6 rounded-xl space-y-6">
      <div className="flex items-center gap-2 border-b border-dc-border pb-4">
        <div className="w-3 h-3 rounded-full bg-dc-red animate-pulse"></div>
        <h3 className="font-headline font-bold text-white text-lg">Live Updates Console</h3>
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newUpdate}
          onChange={(e) => setNewUpdate(e.target.value)}
          placeholder="Write a rapid live update..."
          className="form-input min-h-[100px] resize-y"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-dc-text">
            <input 
              type="checkbox" 
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 accent-dc-green bg-dc-surface border-dc-border rounded" 
            />
            <Pin className="w-4 h-4 text-dc-muted" /> Pin this update
          </label>
          <button 
            type="submit" 
            disabled={isSubmitting || !newUpdate.trim()}
            className="btn-primary py-2 px-4 flex items-center gap-2 text-sm"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Blast Update
          </button>
        </div>
      </form>

      {/* Feed */}
      <div className="space-y-4 pt-4">
        <h4 className="text-sm font-bold text-dc-text-muted uppercase tracking-wider">Recent Updates</h4>
        
        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-dc-green" /></div>
        ) : updates.length === 0 ? (
          <p className="text-sm text-dc-text-muted italic">No live updates posted yet.</p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {updates.map(update => {
              // Extract text from TipTap JSON structure safely
              let textContent = ''
              if (typeof update.content === 'object' && update.content.content) {
                try {
                  textContent = update.content.content[0]?.content[0]?.text || 'Media Update'
                } catch { textContent = 'Media Update' }
              } else if (typeof update.content === 'string') {
                textContent = update.content
              }

              return (
                <div key={update.id} className="p-4 bg-dc-surface-2 rounded-lg border border-dc-border relative group">
                  {update.is_pinned && (
                    <div className="absolute -top-2.5 -right-2.5 bg-dc-green text-white p-1 rounded-full shadow-lg">
                      <Pin className="w-3 h-3" />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-dc-text-muted flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {format(new Date(update.created_at), 'h:mm a')}
                    </span>
                    <button
                      onClick={() => handleDelete(update.id)}
                      disabled={deletingId === update.id}
                      className="text-dc-muted hover:text-dc-red opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      {deletingId === update.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Trash2 className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-sm text-white whitespace-pre-wrap">{textContent}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
