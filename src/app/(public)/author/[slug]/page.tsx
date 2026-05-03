import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import { ExternalLink, BookOpen, Eye, Clock } from 'lucide-react'
import { supabaseAdmin } from '@/lib/db/admin'
import { slugify, timeAgo, formatViewCount } from '@/lib/utils'

export const revalidate = 3600

const BASE = 'https://dhakachronicles.com'

const ROLE_LABELS: Record<string, string> = {
  founder: 'Founder & Editor-in-Chief',
  admin:   'Editor',
  publisher: 'Staff Reporter',
}

type Props = { params: Promise<{ slug: string }> }

type AuthorRow = {
  id: string
  full_name: string | null
  role: string | null
  avatar_url: string | null
  bio: string | null
  twitter_url: string | null
  linkedin_url: string | null
  facebook_url: string | null
}

type ArticleRow = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image_url: string | null
  published_at: string | null
  reading_time: number | null
  view_count: number
  category: { name: string; slug: string; color: string | null } | null
}

async function getAuthor(slug: string): Promise<AuthorRow | null> {
  const { data } = await supabaseAdmin
    .from('users')
    .select('id, full_name, role, avatar_url, bio, twitter_url, linkedin_url, facebook_url')
    .eq('is_active', true)

  return (
    (data as AuthorRow[] | null)?.find(u => slugify(u.full_name ?? '') === slug) ?? null
  )
}

async function getAuthorArticles(authorId: string): Promise<ArticleRow[]> {
  const { data } = await supabaseAdmin
    .from('articles')
    .select('id, title, slug, excerpt, featured_image_url, published_at, reading_time, view_count, category:categories(name, slug, color)')
    .eq('author_id', authorId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(24)

  return (data as unknown as ArticleRow[]) ?? []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author) return { title: 'Author Not Found | Dhaka Chronicles' }

  const url = `${BASE}/author/${slug}`
  const description = author.bio ?? `Read articles by ${author.full_name} on Dhaka Chronicles.`

  return {
    title: `${author.full_name} — Dhaka Chronicles`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'profile',
      url,
      siteName: 'Dhaka Chronicles',
      title: `${author.full_name} — Dhaka Chronicles`,
      description,
      images: author.avatar_url
        ? [{ url: author.avatar_url, width: 400, height: 400, alt: author.full_name ?? '' }]
        : [{ url: `${BASE}/og-default.png`, width: 1200, height: 630, alt: 'Dhaka Chronicles' }],
    },
  }
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author) notFound()

  const articles = await getAuthorArticles(author.id)
  const totalViews = articles.reduce((sum, a) => sum + (a.view_count ?? 0), 0)
  const roleLabel = ROLE_LABELS[author.role ?? ''] ?? 'Journalist'

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.full_name,
    url: `${BASE}/author/${slug}`,
    image: author.avatar_url ?? undefined,
    jobTitle: roleLabel,
    worksFor: {
      '@type': 'NewsMediaOrganization',
      name: 'Dhaka Chronicles',
      url: BASE,
    },
    description: author.bio ?? undefined,
    sameAs: [author.twitter_url, author.linkedin_url, author.facebook_url].filter(Boolean),
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Script
        id={`author-person-jsonld-${slug}`}
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      {/* ── Author header ── */}
      <div
        className="flex flex-col sm:flex-row gap-8 items-start mb-12 pb-12"
        style={{ borderBottom: '1px solid var(--dc-border)' }}
      >
        {/* Avatar */}
        {author.avatar_url ? (
          <Image
            src={author.avatar_url}
            alt={author.full_name ?? 'Author'}
            width={120}
            height={120}
            priority
            className="rounded-full object-cover shrink-0"
            style={{ border: '3px solid var(--dc-border)' }}
          />
        ) : (
          <div
            className="w-[120px] h-[120px] rounded-full bg-dc-green flex items-center justify-center font-black text-white text-4xl shrink-0"
          >
            {(author.full_name ?? 'DC').substring(0, 2).toUpperCase()}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--dc-green)' }}
          >
            {roleLabel}
          </span>

          <h1
            className="font-headline font-black text-3xl sm:text-4xl mt-1 mb-4"
            style={{ color: 'var(--dc-text)' }}
          >
            {author.full_name}
          </h1>

          {author.bio && (
            <p
              className="text-base leading-relaxed mb-5 max-w-2xl"
              style={{ color: 'var(--dc-text-muted)' }}
            >
              {author.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mb-5">
            <div>
              <p className="text-2xl font-black" style={{ color: 'var(--dc-text)' }}>
                {articles.length}
              </p>
              <p className="text-xs uppercase tracking-widest mt-0.5" style={{ color: 'var(--dc-text-muted)' }}>
                Articles
              </p>
            </div>
            {totalViews > 0 && (
              <div>
                <p className="text-2xl font-black" style={{ color: 'var(--dc-text)' }}>
                  {formatViewCount(totalViews)}
                </p>
                <p className="text-xs uppercase tracking-widest mt-0.5" style={{ color: 'var(--dc-text-muted)' }}>
                  Total Views
                </p>
              </div>
            )}
          </div>

          {/* Social links */}
          {(author.twitter_url || author.linkedin_url || author.facebook_url) && (
            <div className="flex flex-wrap gap-4">
              {author.twitter_url && (
                <a
                  href={author.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-semibold hover:text-dc-green transition-colors"
                  style={{ color: 'var(--dc-text-muted)' }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Twitter / X
                </a>
              )}
              {author.linkedin_url && (
                <a
                  href={author.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-semibold hover:text-dc-green transition-colors"
                  style={{ color: 'var(--dc-text-muted)' }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
              )}
              {author.facebook_url && (
                <a
                  href={author.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-semibold hover:text-dc-green transition-colors"
                  style={{ color: 'var(--dc-text-muted)' }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Facebook
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Articles ── */}
      <h2
        className="font-headline font-bold text-xl mb-6"
        style={{ color: 'var(--dc-text)' }}
      >
        Articles by {author.full_name}
      </h2>

      {articles.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--dc-text-muted)' }}>
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No published articles yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(a => (
            <Link
              key={a.id}
              href={`/news/${a.slug}`}
              className="group flex flex-col rounded-xl overflow-hidden transition-shadow hover:shadow-lg"
              style={{ background: 'var(--dc-surface)', border: '1px solid var(--dc-border)' }}
            >
              {a.featured_image_url && (
                <div className="relative w-full aspect-video overflow-hidden">
                  <Image
                    src={a.featured_image_url}
                    alt={a.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}

              <div className="p-4 flex flex-col flex-1">
                {a.category && (
                  <span
                    className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: a.category.color ?? 'var(--dc-green)' }}
                  >
                    {a.category.name}
                  </span>
                )}

                <h3
                  className="font-headline font-bold text-base leading-snug mb-2 line-clamp-2 group-hover:text-dc-green transition-colors"
                  style={{ color: 'var(--dc-text)' }}
                >
                  {a.title}
                </h3>

                {a.excerpt && (
                  <p
                    className="text-sm leading-relaxed line-clamp-2 mb-3 flex-1"
                    style={{ color: 'var(--dc-text-muted)' }}
                  >
                    {a.excerpt}
                  </p>
                )}

                <div
                  className="flex items-center gap-3 text-xs mt-auto pt-3"
                  style={{
                    color: 'var(--dc-text-muted)',
                    borderTop: '1px solid var(--dc-border)',
                  }}
                >
                  {a.published_at && <span>{timeAgo(a.published_at)}</span>}
                  {a.reading_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {a.reading_time} min
                    </span>
                  )}
                  {a.view_count > 0 && (
                    <span className="flex items-center gap-1 ml-auto">
                      <Eye className="w-3 h-3" />
                      {formatViewCount(a.view_count)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
