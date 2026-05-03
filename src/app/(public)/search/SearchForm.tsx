'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search as SearchIcon, ArrowRight } from 'lucide-react'

export default function SearchForm({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = inputRef.current?.value.trim()
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto">
      <SearchIcon
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
        style={{ color: 'var(--dc-text-muted)' }}
      />
      <input
        ref={inputRef}
        type="text"
        defaultValue={initialQuery}
        placeholder="Search for news, articles, or topics..."
        className="w-full rounded-xl py-3.5 pl-12 pr-14 text-base outline-none transition-all"
        style={{
          background: 'var(--dc-surface)',
          border: '2px solid var(--dc-border)',
          color: 'var(--dc-text)',
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = 'var(--dc-green)'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,166,81,0.1)'
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = 'var(--dc-border)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-dc-green text-white hover:bg-dc-green-dark transition-colors"
        aria-label="Search"
      >
        <ArrowRight className="w-5 h-5" />
      </button>
    </form>
  )
}
