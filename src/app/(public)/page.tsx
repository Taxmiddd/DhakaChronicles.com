import type { Metadata } from 'next'
import Link from 'next/link'
import { ArticleCard } from '@/components/article/ArticleCard'
import { NewsletterForm } from '@/components/layout/NewsletterForm'
import { supabaseAdmin } from '@/lib/db/admin'
import AdBanner from '@/components/ui/AdBanner'

export const metadata: Metadata = {
  title: 'Dhaka Chronicles – The Pulse of Bangladesh',
  description: 'Breaking news, in-depth analysis, and stories shaping Bangladesh.',
}

export const revalidate = 60

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

const ARTICLE_SELECT = `
  id, title, slug, excerpt, featured_image_url, published_at,
  reading_time, view_count, is_breaking, is_featured,
  category:categories(name, slug, color),
  author:users!author_id(full_name, avatar_url)
`

async function getHeroArticle(): Promise<ArticleRow | null> {
  try {
    const { data: featured } = await supabaseAdmin
      .from('articles').select(ARTICLE_SELECT)
      .eq('status', 'published').is('deleted_at', null)
      .eq('is_featured', true).order('published_at', { ascending: false })
      .limit(1).single()
    if (featured) return featured as unknown as ArticleRow
    const { data: latest } = await supabaseAdmin
      .from('articles').select(ARTICLE_SELECT)
      .eq('status', 'published').is('deleted_at', null)
      .order('published_at', { ascending: false }).limit(1).single()
    return (latest as unknown as ArticleRow) ?? null
  } catch { return null }
}

async function getLatestArticles(excludeId?: string, limit = 12): Promise<ArticleRow[]> {
  try {
    let q = supabaseAdmin.from('articles').select(ARTICLE_SELECT)
      .eq('status', 'published').is('deleted_at', null)
      .order('published_at', { ascending: false }).limit(limit + 1)
    if (excludeId) q = q.neq('id', excludeId)
    const { data } = await q
    return ((data as unknown as ArticleRow[]) ?? []).slice(0, limit)
  } catch { return [] }
}

async function getTrendingArticles(excludeIds: string[]): Promise<ArticleRow[]> {
  try {
    const { data } = await supabaseAdmin.from('articles').select(ARTICLE_SELECT)
      .eq('status', 'published').is('deleted_at', null)
      .order('view_count', { ascending: false }).limit(15)
    const rows = (data as unknown as ArticleRow[]) ?? []
    return rows.filter(a => !excludeIds.includes(a.id)).slice(0, 5)
  } catch { return [] }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default async function HomePage() {
  const hero = await getHeroArticle()
  const excludedIds = hero ? [hero.id] : []
  const [latest, trending] = await Promise.all([
    getLatestArticles(hero?.id, 12),
    getTrendingArticles(excludedIds),
  ])

  // Split latest into grid (first 3) and list (rest)
  const gridArticles = latest.slice(0, 3)
  const listArticles = latest.slice(3)

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

      {/* ── Hero ── */}
      {hero && (
        <section className="border-b border-dc-border py-8 sm:py-12">
          <Link href={`/news/${hero.slug}`} className="group block">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Text side */}
              <div className="order-2 lg:order-1">
                {hero.category && (
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-dc-text-muted block mb-4">
                    {hero.category.name}
                  </span>
                )}
                <h1 className="font-headline font-black text-3xl sm:text-4xl lg:text-5xl leading-[1.1] text-dc-text mb-5 group-hover:opacity-75 transition-opacity">
                  {hero.title}
                </h1>
                {hero.excerpt && (
                  <p className="text-base sm:text-lg text-dc-text-muted leading-relaxed mb-6 line-clamp-3">
                    {hero.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-widest text-dc-text-muted">
                  {hero.author?.full_name && <span>{hero.author.full_name}</span>}
                  {hero.published_at && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-dc-text-muted" />
                      <span>{formatDate(hero.published_at)}</span>
                    </>
                  )}
                </div>
              </div>
              {/* Image side */}
              <div className="order-1 lg:order-2">
                <div className="aspect-[3/2] overflow-hidden bg-dc-surface-2">
                  {hero.featured_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={hero.featured_image_url}
                      alt={hero.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-dc-surface-2" />
                  )}
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ── Main Grid + Sidebar ── */}
      <div className="flex flex-col xl:flex-row gap-0 xl:gap-16 py-8 sm:py-12">

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0">

          {/* Top Grid — 3 cards */}
          {gridArticles.length > 0 && (
            <section className="border-b border-dc-border pb-10 mb-10">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {gridArticles.map((article) => (
                  <Link key={article.id} href={`/news/${article.slug}`} className="group block">
                    <div className="aspect-[3/2] overflow-hidden bg-dc-surface-2 mb-4">
                      {article.featured_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={article.featured_image_url}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-dc-surface-2" />
                      )}
                    </div>
                    {article.category && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-dc-text-muted block mb-2">
                        {article.category.name}
                      </span>
                    )}
                    <h2 className="font-headline font-bold text-lg leading-snug text-dc-text group-hover:opacity-75 transition-opacity line-clamp-3 mb-2">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-sm text-dc-text-muted line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-dc-text-muted">
                      {formatDate(article.published_at)}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Ad Banner */}
          <AdBanner position="homepage_mid" className="w-full h-[90px] mb-10 border border-dc-border hidden md:block" />

          {/* List feed */}
          {listArticles.length > 0 && (
            <section>
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.18em] text-dc-text-muted mb-6 pb-3 border-b border-dc-border">
                Latest
              </h2>
              <div className="flex flex-col divide-y divide-dc-border">
                {listArticles.map((article, idx) => (
                  <div key={article.id}>
                    {idx === 5 && (
                      <AdBanner position="feed_native" className="w-full h-[90px] my-6 border border-dc-border" />
                    )}
                    <Link href={`/news/${article.slug}`} className="group flex gap-5 py-6 items-start hover:no-underline">
                      <div className="flex-1 min-w-0">
                        {article.category && (
                          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-dc-text-muted block mb-1.5">
                            {article.category.name}
                          </span>
                        )}
                        <h3 className="font-headline font-bold text-base sm:text-lg leading-snug text-dc-text group-hover:opacity-75 transition-opacity line-clamp-2 mb-1">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-sm text-dc-text-muted line-clamp-1 hidden sm:block">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest text-dc-text-muted">
                          {article.author?.full_name && <span>{article.author.full_name}</span>}
                          {article.published_at && (
                            <>
                              {article.author?.full_name && <span className="w-1 h-1 rounded-full bg-dc-text-muted" />}
                              <span>{formatDate(article.published_at)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {article.featured_image_url && (
                        <div className="w-24 h-20 sm:w-32 sm:h-24 shrink-0 overflow-hidden bg-dc-surface-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={article.featured_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* ── Sidebar ── */}
        <aside className="w-full xl:w-[300px] shrink-0 border-t xl:border-t-0 xl:border-l border-dc-border pt-10 xl:pt-0 xl:pl-12">
          <div className="xl:sticky xl:top-[80px] space-y-10">

            {/* Trending */}
            {trending.length > 0 && (
              <section>
                <h3 className="font-headline font-black text-xs uppercase tracking-[0.18em] text-dc-text-muted mb-5 pb-3 border-b border-dc-border">
                  Most Read
                </h3>
                <div className="flex flex-col gap-0 divide-y divide-dc-border">
                  {trending.map((a, i) => (
                    <Link key={a.id} href={`/news/${a.slug}`} className="group flex gap-4 py-4 items-start hover:no-underline">
                      <span className="text-2xl font-black text-dc-surface-2 leading-none mt-0.5 w-5 shrink-0 select-none tabular-nums" style={{ WebkitTextStroke: '1px var(--dc-border)' }}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        {a.category && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-dc-text-muted block mb-1">
                            {a.category.name}
                          </span>
                        )}
                        <h4 className="font-bold text-[13px] leading-snug text-dc-text group-hover:opacity-75 transition-opacity line-clamp-3">
                          {a.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Newsletter */}
            <section>
              <h3 className="font-headline font-black text-xs uppercase tracking-[0.18em] text-dc-text-muted mb-5 pb-3 border-b border-dc-border">
                Newsletter
              </h3>
              <p className="text-sm text-dc-text-muted leading-relaxed mb-5">
                Bangladesh's most vital stories, curated and delivered every morning.
              </p>
              <NewsletterForm variant="default" />
            </section>

            {/* Sidebar Ad */}
            <AdBanner position="sidebar_sticky" className="w-full h-[400px] border border-dc-border" />
          </div>
        </aside>

      </div>
    </div>
  )
}
