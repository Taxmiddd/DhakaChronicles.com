'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, ChevronDown, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Comment {
  id: string
  content: string
  author_name: string
  user_id: string | null
  created_at: string
  upvotes: number
  replies?: Comment[]
}

interface CommentsProps {
  articleId: string
  allowComments?: boolean
}

export default function CommentsSection({ articleId, allowComments = true }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const [form, setForm] = useState({ name: '', email: '', content: '' })

  useEffect(() => {
    fetchComments()
  }, [articleId])

  async function fetchComments() {
    setLoading(true)
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`)
      if (res.ok) {
        const json = await res.json()
        setComments(json.data || [])
        setTotal(json.total || 0)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.content.trim()) return
    setSubmitting(true)
    setNotification(null)

    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article_id: articleId,
          parent_id: replyTo || undefined,
          content: form.content,
          author_name: form.name || undefined,
          author_email: form.email || undefined,
        }),
      })

      const json = await res.json()

      if (!res.ok) throw new Error(json.error)

      setNotification({ type: 'success', msg: json.message })
      setForm({ name: '', email: '', content: '' })
      setReplyTo(null)
      fetchComments()
    } catch (err: any) {
      setNotification({ type: 'error', msg: err.message || 'Failed to submit comment.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (!allowComments) {
    return (
      <div className="mt-10 pt-8 border-t border-dc-border text-center text-dc-text-muted text-sm py-8">
        Comments are disabled for this article.
      </div>
    )
  }

  return (
    <section id="comments" className="mt-10 pt-8 border-t border-dc-border">
      <h2 className="font-headline font-bold text-white text-xl mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-dc-red" />
        Discussion
        {total > 0 && (
          <span className="text-sm font-normal text-dc-text-muted ml-1">({total})</span>
        )}
      </h2>

      {/* Comment Form */}
      <div className="glass p-5 rounded-xl mb-8">
        <h3 className="text-white font-semibold text-sm mb-4">
          {replyTo ? (
            <span className="flex items-center gap-2">
              Replying to comment
              <button onClick={() => setReplyTo(null)} className="text-dc-red text-xs hover:underline ml-1">
                Cancel
              </button>
            </span>
          ) : 'Leave a comment'}
        </h3>

        {notification && (
          <div className={`flex items-start gap-2 p-3 rounded-lg mb-4 text-sm ${
            notification.type === 'success'
              ? 'bg-dc-red/10 text-dc-red border border-dc-red/20'
              : 'bg-dc-red/10 text-dc-red border border-dc-red/20'
          }`}>
            {notification.type === 'success'
              ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            {notification.msg}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="form-input text-sm"
            />
            <input
              type="email"
              placeholder="Email (optional, not shown)"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="form-input text-sm"
            />
          </div>
          <textarea
            placeholder="Share your thoughts..."
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={4}
            className="form-input text-sm resize-none"
            required
          />
          <div className="flex items-center justify-between">
            <p className="text-dc-text-muted text-xs">
              Comments are moderated. Be respectful.
            </p>
            <button
              type="submit"
              disabled={submitting || !form.content.trim()}
              className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {submitting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />}
              Post Comment
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-dc-text-muted gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-dc-text-muted">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onReply={(id) => {
                setReplyTo(id)
                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function CommentCard({ comment, onReply }: { comment: Comment; onReply: (id: string) => void }) {
  const [showReplies, setShowReplies] = useState(true)
  const replyCount = comment.replies?.length || 0

  return (
    <div className="group">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-dc-surface-2 flex items-center justify-center shrink-0 text-dc-text-muted">
          <User className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-semibold text-white text-sm">
              {comment.author_name || 'Anonymous'}
            </span>
            <span className="text-dc-text-muted text-xs">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-dc-text text-sm mt-1 leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => onReply(comment.id)}
              className="text-xs text-dc-text-muted hover:text-dc-red transition-colors"
            >
              Reply
            </button>
            {replyCount > 0 && (
              <button
                onClick={() => setShowReplies(v => !v)}
                className="text-xs text-dc-text-muted hover:text-white transition-colors flex items-center gap-1"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showReplies ? 'rotate-180' : ''}`} />
                {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {/* Nested replies */}
          {showReplies && replyCount > 0 && (
            <div className="mt-3 pl-4 border-l border-dc-border space-y-3">
              {comment.replies!.map(reply => (
                <div key={reply.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-dc-surface-2 flex items-center justify-center shrink-0 text-dc-text-muted">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-white text-sm">
                        {reply.author_name || 'Anonymous'}
                      </span>
                      <span className="text-dc-text-muted text-xs">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-dc-text text-sm mt-0.5 leading-relaxed">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

