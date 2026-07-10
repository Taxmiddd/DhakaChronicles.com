import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, TrendingUp, Filter, Hash, Star } from 'lucide-react'
import { ArticleCard } from '@/components/article/ArticleCard'
import { CityWidgets } from '@/components/widgets/CityWidgets'
import AdBanner from '@/components/ui/AdBanner'
import { NewsletterForm } from '@/components/layout/NewsletterForm'
import { supabaseAdmin } from '@/lib/db/admin'
import { getCategoryColor } from '@/lib/utils'

export const revalidate = 60

const ARTICLE_SELECT = `
  id, title, slug, excerpt, featured_image_url, published_at,
  reading_time, view_count, is_breaking, is_featured,
  category:categories(name, slug, color),
  author:users!author_id(full_name, avatar_url)
`

async function getAllArticles(page = 1, perPage = 12) {
  try {
    const from = (page - 1) * perPage
    const to = from + perPage - 1
    const { data, count } = await supabaseAdmin
      .from('articles')
      .select(ARTICLE_SELECT, { count: 'exact' })
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .range(from, to)
    return { articles: data ?? [], total: count ?? 0 }
  } catch { return { articles: [], total: 0 } }
}

async function getCategories() {
  try {
    const { data } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug, color, display_order')
      .order('display_order', { ascending: true })
      .limit(12)
    if (!data || data.length === 0) return []
    const ids = data.map(c => c.id)
    const counts: Record<string, number> = {}
    await Promise.all(
      ids.map(async (catId) => {
        const { count } = await supabaseAdmin
          .from('articles')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', catId)
          .eq('status', 'published')
        counts[catId] = count ?? 0
      })
    )
    return data.map(c => ({ ...c, article_count: counts[c.id] ?? 0 }))
  } catch { return [] }
}

async function getTrendingArticles(): Promise<any[]> {
  try {
    const { data } = await supabaseAdmin
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('view_count', { ascending: false })
      .limit(6)
    return data ?? []
  } catch { return [] }
}

export const metadata: Metadata = {
  title: 'All News – Dhaka Chronicles',
  description: 'Latest news and updates from Bangladesh',
}

export default async function NewsPage() {
  const [{ articles, total }, categories, trending] = await Promise.all([
    getAllArticles(),
    getCategories(),
    getTrendingArticles(),
  ])

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ── LEFT COLUMN: Navigation & Widgets ── */}
        <aside className="w-full lg:w-[260px] shrink-0 space-y-6 hidden lg:block">
          <div className="sticky top-[88px] space-y-6">
            <div className="bg-dc-surface border border-dc-border rounded-2xl p-5 shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-dc-text-muted mb-4 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" /> Explore
              </h3>
              <nav className="flex flex-col gap-1.5">
                <Link href="/" className="px-3 py-2 rounded-lg hover:bg-dc-surface-2 text-dc-text-muted hover:text-dc-text font-semibold text-sm transition-colors group">
                  <span className="flex items-center gap-2"><Star className="w-4 h-4 text-dc-text-muted group-hover:text-dc-text" /> For You</span>
                </Link>
                <Link href="/news" className="px-3 py-2 rounded-lg bg-dc-surface-2 text-dc-text font-bold text-sm flex items-center justify-between transition-colors">
                  Latest Feed
                </Link>
                <div className="h-px bg-dc-border my-2" />
                {categories.map(cat => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="px-3 py-2 rounded-lg hover:bg-dc-surface-2 text-dc-text-muted hover:text-dc-text font-semibold text-sm transition-colors flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <Hash className="w-4 h-4 opacity-50" style={{ color: getCategoryColor(cat.color) }} /> 
                      {cat.name}
                    </span>
                    <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-dc-surface border border-dc-border px-1.5 py-0.5 rounded">
                      {cat.article_count}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
            <CityWidgets />
          </div>
        </aside>

        {/* ── CENTER COLUMN: The Pulse Feed ── */}
        <main className="flex-1 min-w-0">
          <div className="mb-8 py-10 rounded-3xl px-6 text-center relative overflow-hidden border border-dc-border" style={{ background: 'var(--dc-surface-2)' }}>
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-dc-text opacity-5 blur-[100px] pointer-events-none" />
            <h1 className="font-headline font-black text-4xl sm:text-5xl mb-3 text-dc-text relative z-10">
              Latest Feed
            </h1>
            <p className="text-base text-dc-text-muted relative z-10">
              Real-time dispatches from Dhaka Chronicles
            </p>
            <p className="mt-2 text-xs font-bold text-dc-text-muted tracking-widest uppercase relative z-10">
              {total} Stories Total
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {articles.length === 0 ? (
              <div className="py-20 text-center rounded-2xl border border-dashed border-dc-border">
                <p className="font-headline text-lg mb-2 text-dc-text">No articles yet</p>
              </div>
            ) : (
              articles.map((article, idx) => (
                <div key={article.id}>
                  {idx === 4 && <AdBanner position="feed_native" className="w-full h-[90px] mb-5 rounded-2xl border border-dc-border" />}
                  <ArticleCard variant="list" {...article as any} className="bg-dc-surface border border-dc-border hover:border-dc-border/80 shadow-sm rounded-2xl p-4 sm:p-5 transition-all hover:shadow-md" />
                </div>
              ))
            )}
          </div>
        </main>

        {/* ── RIGHT COLUMN: Context & Sidebar ── */}
        <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 space-y-6">
          <div className="sticky top-[88px] space-y-6">
            <div className="bg-dc-surface border border-dc-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-dc-red/5 blur-[40px] pointer-events-none" />
              <h3 className="font-headline font-black text-lg text-dc-text mb-6 flex items-center gap-2 relative z-10">
                <TrendingUp className="w-5 h-5 text-dc-red" /> Trending Now
              </h3>
              <div className="flex flex-col gap-5 relative z-10">
                {trending.map((a, i) => (
                  <Link key={a.id} href={`/news/${a.slug}`} className="group flex gap-4 items-start">
                    <span className="text-4xl font-black text-dc-border group-hover:text-dc-red transition-colors leading-none -mt-1 w-6 text-center">{i + 1}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-[13px] text-dc-text group-hover:text-dc-red transition-colors line-clamp-3 leading-snug">{a.title}</h4>
                      <p className="text-[11px] text-dc-text-muted mt-2 font-semibold tracking-wide uppercase flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: getCategoryColor(a.category?.color) }} />
                        {a.category?.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-[#141414] rounded-2xl p-6 shadow-sm border border-dc-border relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-dc-red/20 blur-[50px] pointer-events-none" />
              <div className="relative z-10">
                <h3 className="font-headline font-black text-white text-xl mb-2">Stay Informed</h3>
                <p className="text-xs text-gray-400 mb-5">Bangladesh's most vital stories, delivered straight to you.</p>
                <NewsletterForm variant="dark" />
              </div>
            </div>

            <AdBanner position="sidebar_sticky" className="w-full h-[600px] rounded-2xl overflow-hidden border border-dc-border" />
          </div>
        </aside>

      </div>
    </div>
  )
}
