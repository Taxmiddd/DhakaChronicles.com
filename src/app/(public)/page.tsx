import type { Metadata } from 'next'
import Link from 'next/link'
import { TrendingUp, ChevronRight, Mail } from 'lucide-react'
import { ArticleCard } from '@/components/article/ArticleCard'
import { CityWidgets } from '@/components/widgets/CityWidgets'
import AdBanner from '@/components/ui/AdBanner'
import { NewsletterForm } from '@/components/layout/NewsletterForm'
import { supabaseAdmin } from '@/lib/db/admin'

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
    // Prefer a featured article; fall back to the most-recent published one
    const { data: featured } = await supabaseAdmin
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .single()
    if (featured) return featured as unknown as ArticleRow

    const { data: latest } = await supabaseAdmin
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('status', 'published')
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
      .order('published_at', { ascending: false })
      .limit(excludeId ? 4 : 3)
    if (excludeId) query = query.neq('id', excludeId)
    const { data } = await query
    return ((data as unknown as ArticleRow[]) ?? []).slice(0, 3)
  } catch { return [] }
}

async function getLatestArticles(excludeIds: string[]): Promise<ArticleRow[]> {
  try {
    let query = supabaseAdmin
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(excludeIds.length > 0 ? 12 : 8)
    const { data } = await query
    const rows = (data as unknown as ArticleRow[]) ?? []
    return rows.filter(a => !excludeIds.includes(a.id)).slice(0, 8)
  } catch { return [] }
}

async function getTrendingArticles(excludeIds: string[]): Promise<ArticleRow[]> {
  try {
    const { data } = await supabaseAdmin
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(10)
    const rows = (data as unknown as ArticleRow[]) ?? []
    return rows.filter(a => !excludeIds.includes(a.id)).slice(0, 5)
  } catch { return [] }
}

async function getCategories(): Promise<CategoryRow[]> {
  try {
    const { data } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug, color, display_order')
      .order('display_order', { ascending: true })
      .limit(8)
    if (!data || data.length === 0) return []

    // Get article counts per category
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

// ── Fallback data (when DB is empty) ─────────────────────────────────────────

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Politics', slug: 'politics', color: '#F42A41', display_order: 0, article_count: 0 },
  { id: '2', name: 'Business', slug: 'business', color: '#00A651', display_order: 1, article_count: 0 },
  { id: '3', name: 'Sports', slug: 'sports', color: '#F59E0B', display_order: 2, article_count: 0 },
  { id: '4', name: 'Culture', slug: 'culture', color: '#8B5CF6', display_order: 3, article_count: 0 },
  { id: '5', name: 'Technology', slug: 'technology', color: '#06B6D4', display_order: 4, article_count: 0 },
  { id: '6', name: 'Education', slug: 'education', color: '#EC4899', display_order: 5, article_count: 0 },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const hero = await getHeroArticle()
  const featured = await getFeaturedArticles(hero?.id)
  const excludedIds = [hero?.id, ...featured.map(a => a.id)].filter(Boolean) as string[]
  const [latest, trending, categories] = await Promise.all([
    getLatestArticles(excludedIds),
    getTrendingArticles(excludedIds),
    getCategories(),
  ])

  const displayCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

      {/* ── City Widgets ── */}
      <CityWidgets />

      {/* ── Mobile category quick-nav ── */}
      <div className="sm:hidden -mx-4 mb-5 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 px-4 pb-1 pt-1">
          {displayCategories.map(cat => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
              style={{
                background: `${cat.color ?? '#00A651'}15`,
                color: cat.color ?? '#00A651',
                border: `1px solid ${cat.color ?? '#00A651'}30`,
              }}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Hero + Featured ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
        {/* Hero */}
        <div className="lg:col-span-2">
          {hero ? (
            <ArticleCard variant="hero" {...hero} />
          ) : (
            <div className="aspect-[16/9] sm:aspect-[2/1] rounded-2xl flex items-center justify-center" style={{ background: 'var(--dc-surface)' }}>
              <div className="text-center px-6">
                <p className="font-headline font-bold text-xl mb-2" style={{ color: 'var(--dc-text)' }}>Welcome to Dhaka Chronicles</p>
                <p style={{ color: 'var(--dc-text-muted)' }} className="text-sm">Bangladesh&apos;s trusted news source. Articles will appear here once published.</p>
              </div>
            </div>
          )}
        </div>

        {/* Featured sidebar */}
        <div className="flex flex-col gap-3">
          {featured.length > 0 ? (
            featured.map(a => <ArticleCard key={a.id} variant="featured" {...a} />)
          ) : (
            <div className="flex-1 rounded-xl flex items-center justify-center p-6" style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}>
              <p className="text-sm text-center" style={{ color: 'var(--dc-text-muted)' }}>Featured stories will appear here</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Mobile square ad pair — phone only, renders nothing when no ads ── */}
      <div className="sm:hidden flex gap-3 mb-6">
        <AdBanner position="mobile_square_1" className="flex-1 aspect-square rounded-xl" />
        <AdBanner position="mobile_square_2" className="flex-1 aspect-square rounded-xl" />
      </div>

      {/* ── Homepage banner ad ── */}
      <AdBanner position="homepage_banner" className="w-full h-[60px] sm:h-[90px] mb-8" />

      {/* ── Latest + Trending ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

        {/* Latest stories */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-heading">Latest Stories</h2>
            <Link
              href="/news"
              className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all text-dc-green"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {latest.length > 0 ? (
            <div>
              {latest.slice(0, 4).map(a => (
                <ArticleCard key={a.id} variant="list" {...a} />
              ))}
              {/* Native feed ad between articles */}
              <div style={{ borderTop: '1px solid var(--dc-border)' }}>
                <AdBanner position="feed_native" variant="native" />
              </div>
              {latest.slice(4).map(a => (
                <ArticleCard key={a.id} variant="list" {...a} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-xl" style={{ border: '1px dashed var(--dc-border)' }}>
              <p style={{ color: 'var(--dc-text-muted)' }}>No articles published yet.</p>
            </div>
          )}
        </div>

        {/* Trending + Newsletter */}
        <aside className="space-y-6">
          {/* Trending */}
          <div className="glass p-5 rounded-xl">
            <h3 className="font-headline font-bold text-base flex items-center gap-2 mb-5" style={{ color: 'var(--dc-text)' }}>
              <TrendingUp className="w-4 h-4 text-dc-green" />
              Most Read
            </h3>
            {trending.length > 0 ? (
              <ol className="space-y-4">
                {trending.map((item, i) => (
                  <li key={item.id}>
                    <Link
                      href={`/news/${item.slug}`}
                      className="group flex items-start gap-3"
                    >
                      <span
                        className="text-2xl font-headline font-black leading-none w-8 shrink-0 select-none"
                        style={{ color: 'var(--dc-border)' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <p
                          className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-dc-green transition-colors"
                          style={{ color: 'var(--dc-text)' }}
                        >
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: 'var(--dc-text-muted)' }}>
                          {item.category && <span>{item.category.name}</span>}
                          {item.view_count > 0 && (
                            <>
                              <span>·</span>
                              <span>{item.view_count.toLocaleString()} views</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm" style={{ color: 'var(--dc-text-muted)' }}>
                Trending articles will appear here.
              </p>
            )}
          </div>

          {/* Newsletter */}
          <div className="glass p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-dc-green" />
              <h3 className="font-headline font-bold text-sm" style={{ color: 'var(--dc-text)' }}>
                Morning Briefing
              </h3>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--dc-text-muted)' }}>
              Top 5 stories in your inbox at 7 AM daily.
            </p>
            <NewsletterForm />
          </div>
        </aside>
      </div>

      {/* ── Explore by Section ── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-heading">Explore by Section</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {displayCategories.slice(0, 6).map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-2.5 p-4 rounded-xl text-center transition-all hover:shadow-md overflow-hidden relative"
              style={{
                background: 'var(--dc-surface)',
                border: '1px solid var(--dc-border)',
                borderTopColor: cat.color ?? '#00A651',
                borderTopWidth: '3px',
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: `${cat.color ?? '#00A651'}15` }}
              >
                <span
                  className="w-4 h-4 rounded-full transition-transform group-hover:scale-110"
                  style={{ background: cat.color ?? '#00A651' }}
                />
              </div>
              <div>
                <p
                  className="font-bold text-sm transition-colors"
                  style={{ color: cat.color ?? 'var(--dc-text)' }}
                >
                  {cat.name}
                </p>
                {cat.article_count > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--dc-text-muted)' }}>
                    {cat.article_count} {cat.article_count === 1 ? 'story' : 'stories'}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
