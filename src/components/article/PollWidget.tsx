'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { BarChart2, CheckCircle2 } from 'lucide-react'

interface PollOption {
  id: string
  option_text: string
  vote_count: number
}

interface Poll {
  id: string
  question: string
  total_votes: number
  is_active: boolean
  options: PollOption[]
}

export default function PollWidget({ pollId }: { pollId: string }) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const storageKey = `dc_poll_${pollId}`

  const fetchPoll = useCallback(async () => {
    try {
      const res = await fetch(`/api/polls/${pollId}`)
      if (res.ok) {
        const data = await res.json()
        setPoll(data.poll)
      }
    } finally {
      setLoading(false)
    }
  }, [pollId])

  useEffect(() => {
    fetchPoll()
    const saved = localStorage.getItem(storageKey)
    if (saved) setVotedOptionId(saved)
  }, [fetchPoll, storageKey])

  async function handleVote(optionId: string) {
    if (!poll?.is_active || votedOptionId || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option_id: optionId })
      })

      if (res.ok) {
        setVotedOptionId(optionId)
        localStorage.setItem(storageKey, optionId)
        toast.success('Your vote has been recorded')
        
        // Optimistic update of counts
        setPoll(prev => {
          if (!prev) return prev
          return {
            ...prev,
            total_votes: prev.total_votes + 1,
            options: prev.options.map(o => 
              o.id === optionId ? { ...o, vote_count: o.vote_count + 1 } : o
            )
          }
        })
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit vote')
        // If they already voted on another device but same IP, just show results
        if (data.error?.includes('already voted')) {
           setVotedOptionId('external_vote')
           localStorage.setItem(storageKey, 'external_vote')
        }
      }
    } catch {
      toast.error('Network error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="animate-pulse bg-white/5 rounded-xl h-64 w-full my-8"></div>
  if (!poll) return null

  const showResults = !!votedOptionId || !poll.is_active

  return (
    <div className="my-10 bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="bg-[#DC1A2C]/10 px-6 py-4 border-b border-[#DC1A2C]/20 flex items-center gap-3">
        <BarChart2 className="w-5 h-5 text-[#DC1A2C]" />
        <h3 className="font-bold font-headline text-white tracking-wide uppercase text-sm">Reader Poll</h3>
      </div>
      
      <div className="p-6 sm:p-8">
        <h4 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-tight">
          {poll.question}
        </h4>

        <div className="space-y-4">
          {poll.options.map(opt => {
            const percentage = poll.total_votes > 0 ? Math.round((opt.vote_count / poll.total_votes) * 100) : 0
            const isSelected = votedOptionId === opt.id

            return (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                disabled={showResults || isSubmitting}
                className={`w-full relative overflow-hidden rounded-xl border transition-all duration-300 text-left
                  ${showResults 
                    ? isSelected ? 'border-[#DC1A2C] bg-[#DC1A2C]/5' : 'border-white/5 bg-white/5 opacity-80'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 cursor-pointer'
                  }
                `}
              >
                {/* Result Bar Background */}
                {showResults && (
                  <div 
                    className={`absolute top-0 left-0 bottom-0 transition-all duration-1000 ease-out
                      ${isSelected ? 'bg-[#DC1A2C]/20' : 'bg-white/5'}
                    `}
                    style={{ width: `${percentage}%` }}
                  />
                )}
                
                <div className="relative z-10 flex justify-between items-center px-5 py-4">
                  <div className="flex items-center gap-3 pr-4">
                    {showResults && isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#DC1A2C] shrink-0" />
                    )}
                    <span className={`font-medium ${showResults && isSelected ? 'text-[#DC1A2C]' : 'text-gray-200'}`}>
                      {opt.option_text}
                    </span>
                  </div>
                  
                  {showResults && (
                    <span className={`font-bold tabular-nums ${isSelected ? 'text-[#DC1A2C]' : 'text-gray-400'}`}>
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex justify-between items-center text-xs text-gray-500 font-medium uppercase tracking-wider">
          <span>{poll.total_votes.toLocaleString()} votes</span>
          {!poll.is_active && <span className="text-red-400">Poll Closed</span>}
        </div>
      </div>
    </div>
  )
}
