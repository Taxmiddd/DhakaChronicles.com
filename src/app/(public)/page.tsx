import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, TrendingUp, Filter, Hash, Star } from 'lucide-react'
import { ArticleCard } from '@/components/article/ArticleCard'
import { CityWidgets } from '@/components/widgets/CityWidgets'
import AdBanner from '@/components/ui/AdBanner'
import { NewsletterForm } from '@/components/layout/NewsletterForm'
import { supabaseAdmin } from '@/lib/db/admin'
import { getCategoryColor } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Dhaka Chronicles – The Pulse of Bangladesh',
  description: 'Breaking news, in-depth analysis, and stories shaping Bangladesh.',
}

export const revalidate = 60

// ── Data types ──────────────────────────────────────────────────────────────

interface ArticleRow {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image_url: string | null
  published_at: string | null
  reading_time: number | null
  view_count: number
  is_breaking: boolean
  is_featured: boolean
  category: { name: string; slug: string; color: string | null } | null
  author: { full_name: string | null; avatar_url: string | null } | null
}

interface CategoryRow {
  id: string
  name: string
  slug: string
  color: string | null
  display_order: number
  article_count: number
}

const ARTICLE_SELECT = `
  id, title, slug, excerpt, featured_image_url, published_at,
  reading_time, view_count, is_breaking, is_featured,
  category:categories(name, slug, color),
  author:users!author_id(full_name, avatar_url)
`

// ── Data fetching ────────────────────────────────────────────────────────────

async function getHeroArticle(): Promise<ArticleRow | null> {
  try {
    const { data: featured } = await supabaseAdmin
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('status', 'published')
      .is('deleted_at', null)
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .single()
    if (featured) return featured as unknown as ArticleRow

    const { data: latest } = await supabaseAdmin
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .limit(1)
      .single()
    return (latest as unknown as ArticleRow) ?? null
  } catch { return null }
}

async function getFeaturedArticles(excludeId?: string): Promise<ArticleRow[]> {
  try {
    let query = supabaseAdmin
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .limit(excludeId ? 4 : 3)
    if (excludeId) query = query.neq('id', excludeId)
    const { data } = await query
    return ((data as unknown as ArticleRow[]) ?? []).slice(0, 3)
  } catch { return [] }
}

async function getLatestArticles(): Promise<ArticleRow[]> {
  try {
    const { data } = await supabaseAdmin
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .limit(12)
    return (data as unknown as ArticleRow[]) ?? []
  } catch { return [] }
}

async function getTrendingArticles(excludeIds: string[]): Promise<ArticleRow[]> {
  try {
    const { data } = await supabaseAdmin
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('view_count', { ascending: false })
      .limit(10)
    const rows = (data as unknown as ArticleRow[]) ?? []
    return rows.filter(a => !excludeIds.includes(a.id)).slice(0, 6)
  } catch { return [] }
}

async function getCategories(): Promise<CategoryRow[]> {
  try {
    const { data } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug, color, display_order')
      .order('display_order', { ascending: true })
      .limit(12)
    if (!data || data.length === 0) return []

    const ids = (data as CategoryRow[]).map(c => c.id)
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

    return (data as CategoryRow[]).map(c => ({ ...c, article_count: counts[c.id] ?? 0 }))
  } catch { return [] }
}

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Politics', slug: 'politics', color: '#F42A41', display_order: 0, article_count: 0 },
  { id: '2', name: 'Business', slug: 'business', color: '#DC1A2C', display_order: 1, article_count: 0 },
  { id: '3', name: 'Sports', slug: 'sports', color: '#F59E0B', display_order: 2, article_count: 0 },
  { id: '4', name: 'Culture', slug: 'culture', color: '#8B5CF6', display_order: 3, article_count: 0 },
  { id: '5', name: 'Technology', slug: 'technology', color: '#06B6D4', display_order: 4, article_count: 0 },
  { id: '6', name: 'Education', slug: 'education', color: '#EC4899', display_order: 5, article_count: 0 },
]

export default async function HomePage() {
  const hero = await getHeroArticle()
  const featured = await getFeaturedArticles(hero?.id)
  const excludedIds = [hero?.id, ...featured.map(a => a.id)].filter(Boolean) as string[]
  const [latest, trending, categories] = await Promise.all([
    getLatestArticles(),
    getTrendingArticles(excludedIds),
    getCategories(),
  ])

  const displayCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      
      {/* ── 3-Column Dashboard Layout ── */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ── LEFT COLUMN: Navigation & Widgets ── */}
        <aside className="w-full lg:w-[260px] shrink-0 space-y-6 hidden lg:block">
          <div className="sticky top-[88px] space-y-6">
            
            <div className="bg-dc-surface border border-dc-border rounded-2xl p-5 shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-dc-text-muted mb-4 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" /> Explore
              </h3>
              <nav className="flex flex-col gap-1.5">
                <Link href="/" className="px-3 py-2 rounded-lg bg-dc-surface-2 text-dc-text font-bold text-sm flex items-center justify-between group">
                  <span className="flex items-center gap-2"><Star className="w-4 h-4 text-dc-red" /> For You</span>
                </Link>
                <Link href="/news" className="px-3 py-2 rounded-lg hover:bg-dc-surface-2 text-dc-text-muted hover:text-dc-text font-semibold text-sm transition-colors">
                  Latest Feed
                </Link>
                <div className="h-px bg-dc-border my-2" />
                {displayCategories.map(cat => (
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
          
          <AdBanner position="homepage_banner" className="w-full h-[90px] mb-6 rounded-2xl border border-dc-border hidden md:block" />

          {/* Main Hero Card */}
          {hero && (
            <div className="mb-6 group cursor-pointer relative overflow-hidden rounded-3xl border border-dc-border shadow-sm">
              <Link href={`/news/${hero.slug}`} className="absolute inset-0 z-20" aria-label={hero.title}></Link>
              <div className="aspect-[16/10] sm:aspect-[21/9] w-full relative bg-dc-surface-2">
                {hero.featured_image_url && (
                  <img src={hero.featured_image_url} alt={hero.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2.5 py-1 rounded bg-dc-red text-white text-[10px] font-black uppercase tracking-widest">
                      Top Story
                    </span>
                    {hero.category && (
                      <span className="text-xs font-bold text-white uppercase tracking-wider opacity-90">
                        {hero.category.name}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-headline font-black text-white leading-[1.15] mb-3 group-hover:text-gray-200 transition-colors">
                    {hero.title}
                  </h1>
                  {hero.excerpt && (
                    <p className="text-sm sm:text-base text-gray-300 line-clamp-2 max-w-3xl">
                      {hero.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <AdBanner position="homepage_mid" className="w-full h-[90px] mb-6 rounded-2xl border border-dc-border hidden md:block" />

          <div className="flex items-center gap-3 mb-6 pt-4">
            <h2 className="text-2xl font-headline font-black text-dc-text">The Pulse</h2>
            <div className="h-px bg-dc-border flex-1" />
          </div>

          <div className="flex flex-col gap-5">
            {latest.map((article, idx) => (
              <div key={article.id}>
                {idx === 4 && <AdBanner position="feed_native" className="w-full h-[90px] mb-5 rounded-2xl border border-dc-border" />}
                {idx === 8 && <AdBanner position="category_banner" className="w-full h-[90px] mb-5 rounded-2xl border border-dc-border" />}
                
                <ArticleCard variant="list" {...article} className="bg-dc-surface border border-dc-border hover:border-dc-border/80 shadow-sm rounded-2xl p-4 sm:p-5 transition-all hover:shadow-md" />
              </div>
            ))}
          </div>

        </main>

        {/* ── RIGHT COLUMN: Context & Sidebar ── */}
        <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 space-y-6">
          <div className="sticky top-[88px] space-y-6">
            
            {/* Top Stories Leaderboard */}
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

            {/* Newsletter Mini Widget */}
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
