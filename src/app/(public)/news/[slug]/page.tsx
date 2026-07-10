import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, Eye, ChevronRight, BookOpen, Home, Hash, Star } from 'lucide-react'
import CommentsSection from '@/components/article/CommentsSection'
import ViewTracker from '@/components/article/ViewTracker'
import ArticleReactions from '@/components/article/ArticleReactions'
import ShareButtons from '@/components/article/ShareButtons'
import JsonLd from '@/components/seo/JsonLd'
import LiveBlogFeed from '@/components/article/LiveBlogFeed'
import AdBanner from '@/components/ui/AdBanner'
import { NewsletterForm } from '@/components/layout/NewsletterForm'
import { supabaseAdmin } from '@/lib/db/admin'
import { renderTipTap } from '@/lib/utils/tiptap'
import { timeAgo, formatViewCount, slugify, getCategoryColor } from '@/lib/utils'

export const revalidate = 60

const BASE = 'https://dhakachronicles.com'

const ARTICLE_SELECT = `
  id, title, slug, excerpt, content, featured_image_url, published_at, updated_at,
  reading_time, view_count, is_breaking, is_featured, article_type,
  allow_comments, category_id,
  category:categories(name, slug, color),
  author:users!author_id(full_name, role, avatar_url, bio, twitter_url, linkedin_url, facebook_url)
`

type Props = { params: Promise<{ slug: string }> }

async function getArticle(slug: string) {
  try {
    const { data } = await supabaseAdmin
      .from('articles')
      .select(ARTICLE_SELECT)
      .eq('slug', slug)
      .eq('status', 'published')
      .is('deleted_at', null)
      .single()
    return data
  } catch { return null }
}

async function getRelatedArticles(categoryId: string, excludeId: string) {
  try {
    const { data } = await supabaseAdmin
      .from('articles')
      .select('id, title, slug, featured_image_url, published_at, category:categories(name, slug, color)')
      .eq('status', 'published')
      .eq('category_id', categoryId)
      .neq('id', excludeId)
      .order('published_at', { ascending: false })
      .limit(4)
    return (data ?? []) as any[]
  } catch { return [] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: 'Not Found | Dhaka Chronicles' }
  const author = (article as any).author
  const url = `${BASE}/news/${slug}`
  return {
    title: `${article.title} – Dhaka Chronicles`,
    description: article.excerpt ?? article.title,
    alternates: { canonical: url },
    authors: author?.full_name ? [{ name: author.full_name }] : undefined,
    openGraph: {
      type: 'article',
      url,
      siteName: 'Dhaka Chronicles',
      locale: 'en_US',
      title: article.title,
      description: article.excerpt ?? undefined,
      publishedTime: article.published_at ?? undefined,
      modifiedTime: (article as any).updated_at ?? article.published_at ?? undefined,
      authors: author?.full_name ? [author.full_name] : undefined,
      images: article.featured_image_url
        ? [{ url: article.featured_image_url, width: 1200, height: 630, alt: article.title }]
        : [{ url: `${BASE}/og-default.png`, width: 1200, height: 630, alt: 'Dhaka Chronicles' }],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const related = article.category_id
    ? await getRelatedArticles(article.category_id, article.id)
    : []

  const categoryName = (article as any).category?.name ?? 'News'
  const catColor = getCategoryColor((article as any).category?.color)
  const author = (article as any).author
  const contentHtml = renderTipTap((article as any).content)

  const authorTitle = (role?: string) => {
    if (!role || role === 'founder' || role === 'admin') return 'Staff Reporter'
    return 'Staff Reporter'
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <JsonLd article={article as any} />
      <ViewTracker articleId={article.id} />

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ── LEFT COLUMN: Minimized Navigation ── */}
        <aside className="w-full lg:w-[80px] shrink-0 hidden lg:block">
          <div className="sticky top-[88px] flex flex-col items-center gap-4">
            <Link href="/" className="w-12 h-12 rounded-full bg-dc-surface border border-dc-border flex items-center justify-center text-dc-text-muted hover:text-dc-red hover:border-dc-red/50 transition-all shadow-sm" aria-label="Home">
              <Home className="w-5 h-5" />
            </Link>
            <Link href="/news" className="w-12 h-12 rounded-full bg-dc-surface border border-dc-border flex items-center justify-center text-dc-text-muted hover:text-dc-red hover:border-dc-red/50 transition-all shadow-sm" aria-label="Latest Feed">
              <Star className="w-5 h-5" />
            </Link>
            {(article as any).category && (
              <Link href={`/category/${(article as any).category.slug}`} className="w-12 h-12 rounded-full bg-dc-surface border border-dc-border flex items-center justify-center text-dc-text-muted hover:border-dc-red/50 transition-all shadow-sm" aria-label={categoryName}>
                <Hash className="w-5 h-5" style={{ color: catColor }} />
              </Link>
            )}
            <div className="h-10 w-px bg-dc-border my-2" />
            <div className="rotate-90 text-[10px] font-black uppercase tracking-widest text-dc-text-muted whitespace-nowrap mt-10">
              Share Article
            </div>
            {/* Minimal Share block */}
            <div className="flex flex-col gap-3 mt-10">
               <ShareButtons slug={slug} title={article.title} />
            </div>
          </div>
        </aside>

        {/* ── CENTER COLUMN: The Article ── */}
        <main className="flex-1 min-w-0">
          
          <article className="bg-dc-surface rounded-3xl border border-dc-border overflow-hidden shadow-sm">
            {/* Cinematic Hero Image */}
            <div className="relative aspect-video w-full bg-dc-surface-2">
              {article.featured_image_url ? (
                <img src={article.featured_image_url} alt={article.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image src="/dc-logo-black.svg" alt="Dhaka Chronicles" width={120} height={32} className="opacity-10 dark:invert" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                {(article as any).is_breaking && (
                  <span className="inline-block bg-dc-red text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded mb-4">
                    Breaking
                  </span>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
                    {categoryName}
                  </span>
                </div>
                <h1 className="font-headline font-black text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.1] mb-4 drop-shadow-md">
                  {article.title}
                </h1>
                {article.excerpt && (
                  <p className="text-lg sm:text-xl text-gray-300 leading-snug max-w-3xl drop-shadow">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 sm:p-10">
              
              {/* Meta bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-dc-border">
                {author && (
                  <Link href={`/author/${slugify(author.full_name ?? '')}`} className="flex items-center gap-3 group">
                    {author.avatar_url ? (
                      <img src={author.avatar_url} alt={author.full_name ?? 'Author'} className="w-12 h-12 rounded-full object-cover border border-dc-border" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-dc-red flex items-center justify-center font-black text-white text-sm shrink-0">
                        {(author.full_name ?? 'DC').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm text-dc-text group-hover:text-dc-red transition-colors">
                        {author.full_name}
                      </p>
                      <p className="text-xs text-dc-text-muted capitalize">
                        {authorTitle(author.role)}
                      </p>
                    </div>
                  </Link>
                )}
                
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-dc-text-muted">
                  {article.published_at && (
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {timeAgo(article.published_at)}</span>
                  )}
                  {article.reading_time && (
                    <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {article.reading_time}m read</span>
                  )}
                  <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {formatViewCount(article.view_count)} views</span>
                </div>
              </div>

              {/* Tiptap Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none 
                prose-headings:font-headline prose-headings:font-black prose-headings:text-dc-text
                prose-p:text-dc-text-muted prose-p:leading-relaxed
                prose-a:text-dc-red prose-a:no-underline hover:prose-a:underline
                prose-strong:text-dc-text
                prose-blockquote:border-dc-red prose-blockquote:bg-dc-surface-2 prose-blockquote:px-5 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                prose-img:rounded-xl prose-img:border prose-img:border-dc-border"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />

              {(article as any).article_type === 'live' && (
                <div className="mt-12">
                  <LiveBlogFeed articleId={article.id} />
                </div>
              )}

              <div className="lg:hidden mt-8 pt-8 border-t border-dc-border">
                <ShareButtons slug={slug} title={article.title} />
              </div>

              <div className="mt-8 pt-8 border-t border-dc-border">
                <ArticleReactions articleId={article.id} />
              </div>

              {/* Author bio box */}
              {author && author.bio && (
                <div className="mt-10 p-6 rounded-2xl bg-dc-surface-2 border border-dc-border flex gap-5">
                  <div className="shrink-0">
                    <img src={author.avatar_url || '/dc-logo-black.svg'} alt={author.full_name ?? ''} className="w-16 h-16 rounded-full object-cover border border-dc-border" />
                  </div>
                  <div>
                    <h4 className="font-bold text-dc-text mb-1">{author.full_name}</h4>
                    <p className="text-sm text-dc-text-muted leading-relaxed">{author.bio}</p>
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="mt-12 pt-8 border-t border-dc-border">
                <CommentsSection articleId={article.id} allowComments={(article as any).allow_comments ?? true} />
              </div>

            </div>
          </article>
        </main>

        {/* ── RIGHT COLUMN: Context & Sidebar ── */}
        <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 space-y-6">
          <div className="sticky top-[88px] space-y-6">
            
            {/* Newsletter */}
            <div className="bg-[#141414] rounded-2xl p-6 shadow-sm border border-dc-border relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-dc-red/20 blur-[50px] pointer-events-none" />
              <div className="relative z-10">
                <h3 className="font-headline font-black text-white text-xl mb-2">Join the Elite</h3>
                <p className="text-xs text-gray-400 mb-5">Bangladesh's most vital stories, delivered straight to you.</p>
                <NewsletterForm variant="dark" />
              </div>
            </div>

            {/* Related stories */}
            {related.length > 0 && (
              <div className="bg-dc-surface border border-dc-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <h3 className="font-headline font-black text-lg text-dc-text mb-6">
                  Related Stories
                </h3>
                <div className="flex flex-col gap-5">
                  {related.map(r => {
                    const rColor = getCategoryColor(r.category?.color)
                    return (
                      <Link key={r.id} href={`/news/${r.slug}`} className="group flex gap-4 items-start">
                        <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 border border-dc-border relative bg-dc-surface-2">
                          {r.featured_image_url && (
                            <img src={r.featured_image_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          )}
                        </div>
                        <div className="flex-1">
                          {r.category && (
                            <span className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: rColor }}>
                              {r.category.name}
                            </span>
                          )}
                          <h4 className="font-bold text-[13px] text-dc-text group-hover:text-dc-red transition-colors line-clamp-3 leading-snug">{r.title}</h4>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            <AdBanner position="article_sidebar" className="w-full h-[600px] rounded-2xl overflow-hidden border border-dc-border" />
          </div>
        </aside>
      </div>
    </div>
  )
}
