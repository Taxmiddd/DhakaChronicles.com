'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Pin, Clock, Loader2 } from 'lucide-react'

interface Update {
  id: string
  content: string | { type: 'doc', content: any[] }
  is_pinned: boolean
  created_at: string
  author?: { full_name: string }
}

export default function LiveBlogFeed({ articleId }: { articleId: string }) {
  const [updates, setUpdates] = useState<Update[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch(`/api/live-blogs/${articleId}`)
        const data = await res.json()
        if (data.success) {
          setUpdates(data.data)
        }
      } catch (err) {
        console.error('Failed to load live updates')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUpdates()

    // Real-time polling every 30s
    const interval = setInterval(fetchUpdates, 30000)
    return () => clearInterval(interval)
  }, [articleId])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 border-t border-dc-border mt-12">
        <Loader2 className="w-8 h-8 animate-spin text-dc-red" />
      </div>
    )
  }

  if (updates.length === 0) return null

  return (
    <div className="mt-12 pt-8 border-t border-dc-border">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-4 h-4 rounded-full bg-dc-red animate-pulse"></div>
        <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-widest">Live Updates</h2>
      </div>

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-dc-border">
        {updates.map((update, idx) => {
          let textContent = ''
          if (typeof update.content === 'object' && update.content.content) {
            try { textContent = update.content.content[0]?.content[0]?.text || '' } catch { textContent = '' }
          } else if (typeof update.content === 'string') {
            textContent = update.content
          }

          return (
            <div key={update.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Timeline dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-dc-surface bg-dc-surface-2 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                {update.is_pinned ? (
                  <Pin className="w-4 h-4 text-dc-red" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-dc-text-muted"></div>
                )}
              </div>
              
              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass p-5 rounded-xl border border-dc-border shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-dc-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {format(new Date(update.created_at), 'h:mm a')}
                  </span>
                  {update.is_pinned && <span className="text-[10px] uppercase tracking-wider font-bold text-dc-red border border-dc-red/30 bg-dc-red/10 px-2 py-0.5 rounded">Pinned</span>}
                </div>
                <p className="text-white whitespace-pre-wrap leading-relaxed">{textContent}</p>
                {update.author?.full_name && (
                  <p className="text-xs text-dc-text-muted mt-3 pt-3 border-t border-dc-border/50">â€” {update.author.full_name}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

