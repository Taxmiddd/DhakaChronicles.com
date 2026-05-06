import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, Eye, ChevronRight, BookOpen } from 'lucide-react'
import CommentsSection from '@/components/article/CommentsSection'
import ViewTracker from '@/components/article/ViewTracker'
import ArticleReactions from '@/components/article/ArticleReactions'
import ShareButtons from '@/components/article/ShareButtons'
import JsonLd from '@/components/seo/JsonLd'
import LiveBlogFeed from '@/components/article/LiveBlogFeed'
import AdBanner from '@/components/ui/AdBanner'
import { supabaseAdmin } from '@/lib/db/admin'
import { renderTipTap } from '@/lib/utils/tiptap'
import { timeAgo, formatViewCount, slugify } from '@/lib/utils'

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
      .limit(3)
    return (data ?? []) as unknown as {
      id: string
      title: string
      slug: string
      featured_image_url: string | null
      published_at: string | null
      category: { name: string; slug: string; color: string | null } | null
    }[]
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
  const catColor = (article as any).category?.color ?? '#00A651'
  const author = (article as any).author
  const contentHtml = renderTipTap((article as any).content)

  const authorTitle = (role?: string) => {
    if (!role || role === 'founder' || role === 'admin') return 'Staff Reporter'
    return 'Staff Reporter'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <JsonLd article={article as any} />
      <ViewTracker articleId={article.id} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── Article body ── */}
        <article className="lg:col-span-2 min-w-0">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs mb-5" style={{ color: 'var(--dc-text-muted)' }}>
            <Link href="/" className="hover:text-dc-green transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            {(article as any).category && (
              <>
                <Link
                  href={`/category/${(article as any).category.slug}`}
                  className="hover:text-dc-green transition-colors"
                >
                  {categoryName}
                </Link>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="truncate max-w-[180px]" style={{ color: 'var(--dc-text)' }}>
              {article.title}
            </span>
          </nav>

          {/* Breaking badge */}
          {(article as any).is_breaking && (
            <span className="inline-block bg-dc-red text-white text-xs font-black uppercase tracking-widest px-2.5 py-0.5 rounded-sm mb-3">
              Breaking
            </span>
          )}

          {/* Category */}
          <span className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: catColor }}>
            {categoryName}
          </span>

          {/* Title */}
          <h1
            className="font-headline font-black text-3xl sm:text-4xl leading-tight mb-4"
            style={{ color: 'var(--dc-text)' }}
          >
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-lg leading-relaxed mb-5" style={{ color: 'var(--dc-text-muted)' }}>
              {article.excerpt}
            </p>
          )}

          {/* Meta bar */}
          <div
            className="flex flex-wrap items-center gap-4 py-4 mb-6"
            style={{ borderTop: '1px solid var(--dc-border)', borderBottom: '1px solid var(--dc-border)' }}
          >
            {/* Author */}
            {author ? (
              <Link
                href={`/author/${slugify(author.full_name ?? '')}`}
                className="flex items-center gap-3 group"
              >
                {author.avatar_url ? (
                  <Image
                    src={author.avatar_url}
                    alt={author.full_name ?? 'Author'}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-dc-green flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {(author.full_name ?? 'DC').substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm group-hover:text-dc-green transition-colors" style={{ color: 'var(--dc-text)' }}>
                    {author.full_name}
                  </p>
                  <p className="text-xs capitalize" style={{ color: 'var(--dc-text-muted)' }}>
                    {authorTitle(author.role)}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dc-green flex items-center justify-center font-bold text-white text-sm shrink-0">
                  DC
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--dc-text)' }}>Dhaka Chronicles</p>
                  <p className="text-xs" style={{ color: 'var(--dc-text-muted)' }}>Staff Reporter</p>
                </div>
              </div>
            )}

            {/* Meta stats */}
            <div className="flex flex-wrap items-center gap-3 ml-auto text-xs" style={{ color: 'var(--dc-text-muted)' }}>
              {article.published_at && (
                <span>{timeAgo(article.published_at)}</span>
              )}
              {(article as any).reading_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {(article as any).reading_time} min read
                </span>
              )}
              {(article as any).view_count > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {formatViewCount((article as any).view_count)}
                </span>
              )}
            </div>
          </div>

          {/* Hero image */}
          {(article as any).article_type === 'video' && article.featured_image_url ? (
            <div className="w-full aspect-video rounded-xl overflow-hidden mb-8 bg-black">
              <iframe
                src={article.featured_image_url}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : article.featured_image_url ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8">
              <Image
                src={article.featured_image_url}
                alt={article.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
              />
            </div>
          ) : null}

          {/* Article content */}
          {contentHtml ? (
            <div
              className="prose-dc mb-8"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          ) : (
            <div className="py-8 mb-8 text-center rounded-xl" style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}>
              <BookOpen className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--dc-text-muted)' }} />
              <p style={{ color: 'var(--dc-text-muted)' }}>Article content not available.</p>
            </div>
          )}

          {/* Live blog */}
          {(article as any).article_type === 'live_blog' && (
            <LiveBlogFeed articleId={article.id} />
          )}

          {/* ── Mobile: related stories horizontal scroll ── */}
          {related.length > 0 && (
            <div className="lg:hidden mt-8 -mx-4">
              <h3
                className="px-4 font-headline font-bold text-sm mb-3 uppercase tracking-wide"
                style={{ color: 'var(--dc-text-muted)' }}
              >
                Related Stories
              </h3>
              <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-2">
                {related.map(r => {
                  const rColor = r.category?.color ?? '#00A651'
                  return (
                    <Link key={r.id} href={`/news/${r.slug}`} className="group shrink-0 w-[172px]">
                      <div
                        className="w-full h-[100px] rounded-xl overflow-hidden mb-2"
                        style={{ background: `${rColor}15` }}
                      >
                        {r.featured_image_url && (
                          <img
                            src={r.featured_image_url}
                            alt={r.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      {r.category && (
                        <span className="text-[10px] font-bold uppercase" style={{ color: rColor }}>
                          {r.category.name}
                        </span>
                      )}
                      <p
                        className="text-xs font-semibold leading-tight mt-0.5 line-clamp-2 group-hover:text-dc-green transition-colors"
                        style={{ color: 'var(--dc-text)' }}
                      >
                        {r.title}
                      </p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Mobile bite-sized ad strip ── */}
          <div className="lg:hidden mt-4">
            <AdBanner position="article_inline" variant="bite" className="w-full h-[50px]" />
          </div>

          {/* Share */}
          <div className="pt-6 border-t" style={{ borderColor: 'var(--dc-border)' }}>
            <ShareButtons slug={slug} title={article.title} />
          </div>

          {/* Reactions */}
          <div className="mt-4">
            <ArticleReactions articleId={article.id} />
          </div>

          {/* Author bio */}
          {author && (
            <div
              className="mt-8 p-5 rounded-xl flex gap-4"
              style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
            >
              <Link href={`/author/${slugify(author.full_name ?? '')}`} className="shrink-0">
                {author.avatar_url ? (
                  <Image
                    src={author.avatar_url}
                    alt={author.full_name ?? 'Author'}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full object-cover hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-dc-green flex items-center justify-center font-bold text-white text-lg">
                    {(author.full_name ?? 'DC').substring(0, 2).toUpperCase()}
                  </div>
                )}
              </Link>
              <div className="min-w-0">
                <Link
                  href={`/author/${slugify(author.full_name ?? '')}`}
                  className="font-bold hover:text-dc-green transition-colors"
                  style={{ color: 'var(--dc-text)' }}
                >
                  {author.full_name}
                </Link>
                <p className="text-sm capitalize" style={{ color: 'var(--dc-text-muted)' }}>
                  {authorTitle(author.role)}
                </p>
                {author.bio && (
                  <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--dc-text-muted)' }}>
                    {author.bio}
                  </p>
                )}
                {(author.twitter_url || author.linkedin_url || author.facebook_url) && (
                  <div className="flex gap-3 mt-3 text-xs font-semibold" style={{ color: 'var(--dc-text-muted)' }}>
                    {author.twitter_url && (
                      <a href={author.twitter_url} target="_blank" rel="noopener noreferrer" className="hover:text-dc-green transition-colors">
                        Twitter / X
                      </a>
                    )}
                    {author.linkedin_url && (
                      <a href={author.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-dc-green transition-colors">
                        LinkedIn
                      </a>
                    )}
                    {author.facebook_url && (
                      <a href={author.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:text-dc-green transition-colors">
                        Facebook
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="mt-10">
            <CommentsSection articleId={article.id} allowComments={(article as any).allow_comments ?? true} />
          </div>
        </article>

        {/* ── Sidebar ── */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">

          {/* Related stories */}
          {related.length > 0 && (
            <div
              className="p-5 rounded-xl"
              style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
            >
              <h3 className="font-headline font-bold text-base mb-4" style={{ color: 'var(--dc-text)' }}>
                Related Stories
              </h3>
              <div className="space-y-4">
                {related.map(r => {
                  const rColor = r.category?.color ?? '#00A651'
                  return (
                    <Link key={r.id} href={`/news/${r.slug}`} className="group flex gap-3">
                      <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0" style={{ background: `${rColor}15` }}>
                        {r.featured_image_url ? (
                          <Image
                            src={r.featured_image_url}
                            alt={r.title}
                            width={80}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        {r.category && (
                          <span className="text-xs font-bold uppercase" style={{ color: rColor }}>
                            {r.category.name}
                          </span>
                        )}
                        <p
                          className="text-sm font-semibold leading-snug mt-0.5 line-clamp-2 group-hover:text-dc-green transition-colors"
                          style={{ color: 'var(--dc-text)' }}
                        >
                          {r.title}
                        </p>
                        {r.published_at && (
                          <p className="text-xs mt-1" style={{ color: 'var(--dc-text-muted)' }}>
                            {timeAgo(r.published_at)}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sidebar ad */}
          <AdBanner position="article_sidebar" className="w-full h-[300px] sm:h-[600px]" />

          {/* Newsletter */}
          <div
            className="p-5 rounded-xl"
            style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
          >
            <h3 className="font-headline font-bold text-sm mb-1" style={{ color: 'var(--dc-text)' }}>
              Morning Briefing
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--dc-text-muted)' }}>
              Top stories delivered at 7 AM daily.
            </p>
            <form action="/api/newsletter/subscribe" method="POST" className="space-y-2.5">
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                className="form-input text-sm"
              />
              <button type="submit" className="btn-primary w-full py-2.5 text-sm">
                Subscribe Free
              </button>
            </form>
          </div>

          {/* Inline ad below newsletter */}
          <AdBanner position="article_inline" className="w-full h-[250px]" />
        </aside>
      </div>
    </div>
  )
}
