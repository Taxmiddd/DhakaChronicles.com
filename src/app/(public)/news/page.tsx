import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ArticleCard } from '@/components/article/ArticleCard'
import AdBanner from '@/components/ui/AdBanner'
import { supabaseAdmin } from '@/lib/db/admin'

export const revalidate = 120

const ARTICLE_SELECT = `
  id, title, slug, excerpt, featured_image_url, published_at,
  reading_time, view_count, is_breaking, is_featured,
  category:categories(name, slug, color),
  author:users(full_name, avatar_url)
`

async function getAllArticles(page = 1, perPage = 12) {
  try {
    const from = (page - 1) * perPage
    const to = from + perPage - 1
    const { data, count } = await supabaseAdmin
      .from('articles')
      .select(ARTICLE_SELECT, { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, to)
    return { articles: data ?? [], total: count ?? 0 }
  } catch { return { articles: [], total: 0 } }
}

async function getCategories() {
  try {
    const { data } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug, color')
      .order('display_order', { ascending: true })
      .limit(10)
    return data ?? []
  } catch { return [] }
}

export const metadata: Metadata = {
  title: 'All News – Dhaka Chronicles',
  description: 'Latest news and updates from Bangladesh',
}

export default async function NewsPage() {
  const [{ articles, total }, categories] = await Promise.all([
    getAllArticles(),
    getCategories(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

      {/* Page header */}
      <div className="mb-8 py-10 rounded-2xl px-6 text-center relative overflow-hidden" style={{ background: 'var(--dc-surface)' }}>
        <h1
          className="font-headline font-black text-4xl sm:text-5xl mb-3"
          style={{ color: 'var(--dc-text)' }}
        >
          All News
        </h1>
        <p className="text-base" style={{ color: 'var(--dc-text-muted)' }}>
          Stay updated with the latest stories from Dhaka Chronicles
        </p>
        <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--dc-green)' }}>
          {total} {total === 1 ? 'story' : 'stories'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Article list */}
        <div className="lg:col-span-2">
          {articles.length === 0 ? (
            <div className="py-20 text-center rounded-xl" style={{ border: '1px dashed var(--dc-border)' }}>
              <p className="font-headline text-lg mb-2" style={{ color: 'var(--dc-text)' }}>
                No articles yet
              </p>
              <p className="text-sm" style={{ color: 'var(--dc-text-muted)' }}>
                Check back soon for fresh stories.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* First article: grid card (larger) */}
              <ArticleCard key={articles[0].id} variant="grid" {...(articles[0] as any)} />

              {/* Rest: list cards with native ad injected after 3rd */}
              <div className="divide-y" style={{ borderColor: 'var(--dc-border)' }}>
                {articles.slice(1, 4).map(a => (
                  <ArticleCard key={a.id} variant="list" {...(a as any)} />
                ))}
                {articles.length > 4 && (
                  <AdBanner position="feed_native" variant="native" />
                )}
                {articles.slice(4).map(a => (
                  <ArticleCard key={a.id} variant="list" {...(a as any)} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
          {/* News banner ad */}
          <AdBanner position="news_banner" className="w-full h-[250px]" />

          {categories.length > 0 && (
            <div className="glass p-5 rounded-xl">
              <h3
                className="font-headline font-bold text-base mb-4"
                style={{ color: 'var(--dc-text)' }}
              >
                Browse by Category
              </h3>
              <div className="space-y-1">
                {categories.map(c => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group hover:bg-dc-surface-2"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: c.color ?? '#00A651' }}
                      />
                      <span
                        className="text-sm font-medium group-hover:text-dc-green transition-colors"
                        style={{ color: 'var(--dc-text)' }}
                      >
                        {c.name}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-dc-text-muted group-hover:text-dc-green transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
