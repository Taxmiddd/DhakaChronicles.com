import { ImageResponse } from 'next/og'
import { supabaseAdmin } from '@/lib/db/admin'

export const runtime = 'nodejs'
export const alt = 'Article — Dhaka Chronicles'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Props = { params: Promise<{ slug: string }> }

export default async function ArticleOGImage({ params }: Props) {
  const { slug } = await params

  const { data: article } = await supabaseAdmin
    .from('articles')
    .select('title, excerpt, featured_image_url, published_at, category:categories(name, color), author:users(full_name)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  const title = article?.title ?? 'Dhaka Chronicles'
  const category = (article?.category as unknown as { name: string; color: string | null } | null)
  const author = (article?.author as unknown as { full_name: string | null } | null)
  const catColor = category?.color ?? '#00A651'
  const pubDate = article?.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0a0a0a',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background image if available */}
        {article?.featured_image_url && (
          <img
            src={article.featured_image_url}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.25,
            }}
          />
        )}

        {/* Dark overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(10,10,10,0.97) 55%, rgba(10,10,10,0.6) 100%)',
          }}
        />

        {/* Left accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '6px',
            background: catColor,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px 72px',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                opacity: 0.5,
              }}
            >
              DHAKA CHRONICLES
            </div>
            {category && (
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: catColor,
                  background: `${catColor}25`,
                  padding: '6px 14px',
                  borderRadius: 999,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {category.name}
              </div>
            )}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 80 ? 40 : title.length > 50 ? 48 : 56,
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              maxWidth: 820,
            }}
          >
            {title}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {author?.full_name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: catColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 900,
                    color: '#fff',
                  }}
                >
                  {author.full_name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ fontSize: 16, color: '#9CA3AF', fontWeight: 600 }}>
                  {author.full_name}
                </div>
              </div>
            )}
            {pubDate && (
              <div style={{ fontSize: 15, color: '#6B7280' }}>{pubDate}</div>
            )}
            <div
              style={{
                marginLeft: 'auto',
                fontSize: 15,
                color: '#00A651',
                fontWeight: 700,
              }}
            >
              dhakachronicles.com
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
