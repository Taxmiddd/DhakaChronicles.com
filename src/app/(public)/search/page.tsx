import type { Metadata } from 'next'
import Link from 'next/link'
import { Search as SearchIcon, Clock } from 'lucide-react'
import { supabaseAdmin } from '@/lib/db/admin'
import { timeAgo } from '@/lib/utils'
import SearchForm from './SearchForm'

export const metadata: Metadata = {
  title: 'Search – Dhaka Chronicles',
  description: 'Search for news, articles, and topics from Dhaka Chronicles.',
}

const POPULAR_TOPICS = [
  'Elections', 'Cricket', 'Economy', 'Metro Rail', 'Climate Change', 'Technology',
]

interface ArticleResult {
  id: string
  title: string
  slug: string
  excerpt: string | null
  published_at: string | null
  reading_time: number | null
  category: { name: string; slug: string; color: string | null } | null
}

async function searchArticles(q: string): Promise<ArticleResult[]> {
  if (!q.trim()) return []
  try {
    // Use Supabase full-text search via ilike for broad compatibility
    const { data } = await supabaseAdmin
      .from('articles')
      .select(`
        id, title, slug, excerpt, published_at, reading_time,
        category:categories(name, slug, color)
      `)
      .eq('status', 'published')
      .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
      .order('published_at', { ascending: false })
      .limit(20)
    return (data as unknown as ArticleResult[]) ?? []
  } catch { return [] }
}

type Props = { searchParams: Promise<{ q?: string }> }

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const results = query ? await searchArticles(query) : []

  return (
    <div
      className="max-w-3xl mx-auto px-4 sm:px-6 py-10 min-h-[60vh]"
    >
      {/* Heading */}
      <div className="text-center mb-8">
        <h1
          className="font-headline font-black text-3xl sm:text-4xl mb-6"
          style={{ color: 'var(--dc-text)' }}
        >
          Search Dhaka Chronicles
        </h1>
        <SearchForm initialQuery={query} />
      </div>

      {/* Results */}
      {query && (
        <div>
          <p className="text-sm mb-5" style={{ color: 'var(--dc-text-muted)' }}>
            {results.length > 0
              ? `${results.length} result${results.length !== 1 ? 's' : ''} for `
              : 'No results for '}
            <span className="font-semibold" style={{ color: 'var(--dc-text)' }}>&ldquo;{query}&rdquo;</span>
          </p>

          {results.length > 0 ? (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--dc-border)' }}
            >
              {results.map((article, i) => {
                const catColor = article.category?.color ?? '#00A651'
                return (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="group block px-5 py-5 transition-colors hover:bg-dc-surface"
                    style={{
                      borderBottom: i < results.length - 1 ? '1px solid var(--dc-border)' : 'none',
                      background: 'var(--background)',
                    }}
                  >
                    {article.category && (
                      <span
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: catColor }}
                      >
                        {article.category.name}
                      </span>
                    )}
                    <h2
                      className="font-headline font-bold text-lg leading-snug mt-1 mb-2 group-hover:text-dc-green transition-colors"
                      style={{ color: 'var(--dc-text)' }}
                    >
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--dc-text-muted)' }}>
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--dc-text-muted)' }}>
                      {article.published_at && <span>{timeAgo(article.published_at)}</span>}
                      {article.reading_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.reading_time} min read
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div
              className="py-16 text-center rounded-xl"
              style={{ border: '1px dashed var(--dc-border)' }}
            >
              <SearchIcon className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--dc-border)' }} />
              <p className="font-semibold mb-1" style={{ color: 'var(--dc-text)' }}>No articles found</p>
              <p className="text-sm" style={{ color: 'var(--dc-text-muted)' }}>
                Try different keywords or browse our sections below.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Popular topics (shown when no active search) */}
      {!query && (
        <div className="mt-8 text-center">
          <p className="text-sm mb-4 font-medium" style={{ color: 'var(--dc-text-muted)' }}>
            Popular topics
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_TOPICS.map(topic => (
              <Link
                key={topic}
                href={`/search?q=${encodeURIComponent(topic)}`}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:text-dc-green hover:border-dc-green"
                style={{
                  border: '1px solid var(--dc-border)',
                  background: 'var(--dc-surface)',
                  color: 'var(--dc-text-muted)',
                }}
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
