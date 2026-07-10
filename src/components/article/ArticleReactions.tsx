'use client'

import { useCallback, useEffect, useState } from 'react'

type ReactionType = 'like' | 'love' | 'insightful' | 'sad' | 'angry'

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'insightful', emoji: '💡', label: 'Insightful' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😠', label: 'Angry' },
]

interface ArticleReactionsProps {
  articleId: string
}

export default function ArticleReactions({ articleId }: ArticleReactionsProps) {
  const [counts, setCounts] = useState<Record<ReactionType, number>>({
    like: 0, love: 0, insightful: 0, sad: 0, angry: 0,
  })
  const [selected, setSelected] = useState<ReactionType | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)

  const storageKey = `dc_reaction_${articleId}`

  const fetchReactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/articles/${articleId}/reactions`)
      if (res.ok) {
        const data = await res.json()
        setCounts(data.reactions)
      }
    } finally {
      setLoading(false)
    }
  }, [articleId])

  useEffect(() => {
    fetchReactions()
    const saved = localStorage.getItem(storageKey) as ReactionType | null
    if (saved) setSelected(saved)
  }, [fetchReactions, storageKey])

  async function react(type: ReactionType) {
    if (pending) return
    setPending(true)

    const prev = selected
    const newSelected = selected === type ? null : type

    // Optimistic update
    setCounts((c) => {
      const next = { ...c }
      if (prev) next[prev] = Math.max(0, next[prev] - 1)
      if (newSelected) next[newSelected] = next[newSelected] + 1
      return next
    })
    setSelected(newSelected)
    if (newSelected) localStorage.setItem(storageKey, newSelected)
    else localStorage.removeItem(storageKey)

    try {
      await fetch(`/api/articles/${articleId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction: type }),
      })
    } catch {
      // Revert on error
      setCounts((c) => {
        const next = { ...c }
        if (newSelected) next[newSelected] = Math.max(0, next[newSelected] - 1)
        if (prev) next[prev] = next[prev] + 1
        return next
      })
      setSelected(prev)
    } finally {
      setPending(false)
    }
  }

  if (loading) return null

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="border border-white/10 rounded-xl p-5 bg-white/[0.02]">
      <p className="text-sm text-gray-400 mb-4 font-medium">
        How did this article make you feel?{' '}
        {total > 0 && <span className="text-gray-500">({total.toLocaleString()} reactions)</span>}
      </p>
      <div className="flex flex-wrap gap-3">
        {REACTIONS.map(({ type, emoji, label }) => {
          const isActive = selected === type
          return (
            <button
              key={type}
              id={`reaction-${type}-btn`}
              onClick={() => react(type)}
              disabled={pending}
              title={label}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 select-none
                ${isActive
                  ? 'border-[#DC1A2C] bg-[#DC1A2C]/15 text-[#DC1A2C] scale-105 shadow-sm'
                  : 'border-white/10 bg-transparent text-gray-400 hover:border-white/30 hover:text-white hover:bg-white/5'
                }`}
            >
              <span className="text-lg leading-none">{emoji}</span>
              <span>{label}</span>
              {counts[type] > 0 && (
                <span className={`text-xs ${isActive ? 'text-[#DC1A2C]' : 'text-gray-500'}`}>
                  {counts[type]}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
