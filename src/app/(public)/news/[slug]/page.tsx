import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
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
import { slugify } from '@/lib/utils'

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
      .from('articles').select(ARTICLE_SELECT)
      .eq('slug', slug).eq('status', 'published').is('deleted_at', null).single()
    return data
  } catch { return null }
}

async function getRelatedArticles(categoryId: string, excludeId: string) {
  try {
    const { data } = await supabaseAdmin
      .from('articles')
      .select('id, title, slug, featured_image_url, published_at, category:categories(name, slug, color)')
      .eq('status', 'published').eq('category_id', categoryId).neq('id', excludeId)
      .order('published_at', { ascending: false }).limit(4)
    return (data ?? []) as any[]
  } catch { return [] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: 'Not Found' }
  const author = (article as any).author
  const url = `${BASE}/news/${slug}`
  return {
    title: article.title,
    description: article.excerpt ?? article.title,
    alternates: { canonical: url },
    authors: author?.full_name ? [{ name: author.full_name }] : undefined,
    openGraph: {
      type: 'article', url, siteName: 'Dhaka Chronicles', locale: 'en_US',
      title: article.title, description: article.excerpt ?? undefined,
      publishedTime: article.published_at ?? undefined,
      modifiedTime: (article as any).updated_at ?? article.published_at ?? undefined,
      authors: author?.full_name ? [author.full_name] : undefined,
      images: article.featured_image_url
        ? [{ url: article.featured_image_url, width: 1200, height: 630, alt: article.title }]
        : [{ url: `${BASE}/og-default.png`, width: 1200, height: 630, alt: 'Dhaka Chronicles' }],
    },
  }
}

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const related = article.category_id
    ? await getRelatedArticles(article.category_id, article.id)
    : []

  const categoryName = (article as any).category?.name ?? 'News'
  const categorySlug = (article as any).category?.slug ?? ''
  const author = (article as any).author
  const contentHtml = renderTipTap((article as any).content)

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
      <JsonLd article={article as any} />
      <ViewTracker articleId={article.id} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 py-5 text-[11px] font-semibold uppercase tracking-widest text-dc-text-muted border-b border-dc-border mb-8">
        <Link href="/" className="hover:text-dc-text transition-colors">Home</Link>
        <span>/</span>
        {categorySlug && (
          <>
            <Link href={`/category/${categorySlug}`} className="hover:text-dc-text transition-colors">{categoryName}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-dc-text truncate max-w-[200px]">{article.title}</span>
      </nav>

      <div className="flex flex-col xl:flex-row gap-0 xl:gap-16">

        {/* ── Article Column ── */}
        <main className="flex-1 min-w-0 max-w-[720px]">
          <article>

            {/* Category label */}
            {categoryName && (
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-dc-text-muted block mb-4">
                {categoryName}
              </span>
            )}

            {/* Headline */}
            <h1 className="font-headline font-black text-3xl sm:text-4xl lg:text-5xl leading-[1.1] text-dc-text mb-5">
              {article.title}
            </h1>

            {/* Excerpt / dek */}
            {article.excerpt && (
              <p className="text-lg sm:text-xl text-dc-text-muted leading-relaxed mb-6 border-l-2 border-dc-border pl-4">
                {article.excerpt}
              </p>
            )}

            {/* Byline */}
            <div className="flex flex-wrap items-center gap-4 py-5 border-t border-b border-dc-border mb-8">
              {author && (
                <Link href={`/author/${slugify(author.full_name ?? '')}`} className="group flex items-center gap-3">
                  {author.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={author.avatar_url}
                      alt={author.full_name ?? 'Author'}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-dc-surface-2 flex items-center justify-center font-bold text-dc-text-muted text-xs shrink-0">
                      {(author.full_name ?? 'DC').substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm text-dc-text group-hover:opacity-75 transition-opacity leading-tight">
                      {author.full_name}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-dc-text-muted">
                      Staff Reporter
                    </p>
                  </div>
                </Link>
              )}
              <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-widest text-dc-text-muted ml-auto">
                {article.published_at && <span>{formatDate(article.published_at)}</span>}
                {article.reading_time && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-dc-text-muted" />
                    <span>{article.reading_time} min read</span>
                  </>
                )}
              </div>
            </div>

            {/* Hero Image */}
            {article.featured_image_url && (
              <div className="aspect-[3/2] overflow-hidden bg-dc-surface-2 mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.featured_image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Inline Ad */}
            <AdBanner position="article_inline" className="w-full h-[90px] mb-8 border border-dc-border" />

            {/* Article Body */}
            <div
              className="prose-dc"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {(article as any).article_type === 'live' && (
              <div className="mt-12">
                <LiveBlogFeed articleId={article.id} />
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-8 border-t border-dc-border">
              <ShareButtons slug={slug} title={article.title} />
            </div>

            {/* Reactions */}
            <div className="mt-6 pt-6 border-t border-dc-border">
              <ArticleReactions articleId={article.id} />
            </div>

            {/* Author bio */}
            {author?.bio && (
              <div className="mt-10 p-6 bg-dc-surface border border-dc-border flex gap-5">
                {author.avatar_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={author.avatar_url}
                    alt={author.full_name ?? ''}
                    className="w-14 h-14 rounded-full object-cover shrink-0"
                  />
                )}
                <div>
                  <h4 className="font-bold text-sm text-dc-text mb-1">{author.full_name}</h4>
                  <p className="text-sm text-dc-text-muted leading-relaxed">{author.bio}</p>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="mt-12 pt-8 border-t border-dc-border">
              <CommentsSection articleId={article.id} allowComments={(article as any).allow_comments ?? true} />
            </div>

          </article>
        </main>

        {/* ── Sidebar ── */}
        <aside className="w-full xl:w-[300px] shrink-0 border-t xl:border-t-0 xl:border-l border-dc-border pt-10 xl:pt-0 xl:pl-12">
          <div className="xl:sticky xl:top-[80px] space-y-10">

            {/* Newsletter */}
            <section>
              <h3 className="font-headline font-black text-xs uppercase tracking-[0.18em] text-dc-text-muted mb-5 pb-3 border-b border-dc-border">
                Newsletter
              </h3>
              <p className="text-sm text-dc-text-muted leading-relaxed mb-5">
                Bangladesh's most vital stories, delivered every morning.
              </p>
              <NewsletterForm variant="default" />
            </section>

            {/* Related */}
            {related.length > 0 && (
              <section>
                <h3 className="font-headline font-black text-xs uppercase tracking-[0.18em] text-dc-text-muted mb-5 pb-3 border-b border-dc-border">
                  Related Stories
                </h3>
                <div className="flex flex-col divide-y divide-dc-border">
                  {related.map((r: any) => (
                    <Link key={r.id} href={`/news/${r.slug}`} className="group py-4 block hover:no-underline">
                      {r.featured_image_url && (
                        <div className="aspect-[3/2] overflow-hidden bg-dc-surface-2 mb-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={r.featured_image_url}
                            alt={r.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      {r.category && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-dc-text-muted block mb-1">
                          {r.category.name}
                        </span>
                      )}
                      <h4 className="font-bold text-[13px] text-dc-text group-hover:opacity-75 transition-opacity line-clamp-3 leading-snug">
                        {r.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <AdBanner position="article_sidebar" className="w-full h-[400px] border border-dc-border" />
          </div>
        </aside>
      </div>
    </div>
  )
}
