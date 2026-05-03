'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface BreakingArticle {
  id: string
  title: string
  slug: string
}

export default function BreakingNewsTicker() {
  const [articles, setArticles] = useState<BreakingArticle[]>([])

  useEffect(() => {
    fetch('/api/breaking')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.articles?.length) setArticles(d.articles) })
      .catch(() => {})
  }, [])

  if (articles.length === 0) return null

  // Duplicate items for seamless looping
  const items = [...articles, ...articles]

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        background: '#DC2626',
        borderBottom: '1px solid rgba(0,0,0,0.15)',
      }}
      role="marquee"
      aria-label="Breaking news"
    >
      <div className="flex items-center h-9">
        {/* Label */}
        <div
          className="shrink-0 flex items-center gap-2 px-4 h-full z-10"
          style={{ background: '#991B1B', borderRight: '1px solid rgba(255,255,255,0.15)' }}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="text-white text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
            Breaking
          </span>
        </div>

        {/* Scrolling ticker */}
        <div className="relative flex-1 overflow-hidden">
          <div className="ticker-animate flex items-center gap-0">
            {items.map((article, i) => (
              <span key={`${article.id}-${i}`} className="flex items-center shrink-0">
                <Link
                  href={`/news/${article.slug}`}
                  className="text-white text-[13px] font-semibold hover:underline whitespace-nowrap px-4 transition-opacity hover:opacity-80"
                >
                  {article.title}
                </Link>
                <span className="text-white/40 text-lg select-none">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
