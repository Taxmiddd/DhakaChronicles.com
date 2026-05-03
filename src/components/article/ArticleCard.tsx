import Link from 'next/link'
import { Clock, Eye } from 'lucide-react'
import { timeAgo, formatViewCount } from '@/lib/utils'

interface ArticleCardProps {
  id: string
  title: string
  excerpt?: string | null
  slug: string
  featured_image_url?: string | null
  published_at?: string | null
  reading_time?: number | null
  view_count?: number
  is_breaking?: boolean
  is_featured?: boolean
  category?: {
    name: string
    slug: string
    color?: string | null
  } | null
  author?: {
    full_name?: string | null
    avatar_url?: string | null
  } | null
  variant?: 'hero' | 'featured' | 'list' | 'grid'
  className?: string
}

const FALLBACK_COLORS: Record<string, string> = {
  Politics: '#F42A41', Business: '#00A651', Sports: '#F59E0B',
  Culture: '#8B5CF6', Technology: '#06B6D4', Education: '#EC4899',
}

function getCatColor(cat?: { name: string; color?: string | null } | null) {
  if (!cat) return '#00A651'
  return cat.color || FALLBACK_COLORS[cat.name] || '#00A651'
}

function CategoryBadge({ category }: { category: ArticleCardProps['category'] }) {
  if (!category) return null
  const color = getCatColor(category)
  return (
    <span
      className="text-xs font-bold uppercase tracking-widest"
      style={{ color }}
    >
      {category.name}
    </span>
  )
}

function ImagePlaceholder({ color }: { color: string }) {
  return (
    <div
      className="w-full h-full"
      style={{ background: `${color}15` }}
    />
  )
}

/* ── Hero variant: full-width, image with dark overlay ── */
function HeroCard({ article }: { article: ArticleCardProps }) {
  const catColor = getCatColor(article.category)
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group relative block overflow-hidden rounded-2xl"
      style={{ background: '#111' }}
    >
      <div className="aspect-[16/9] sm:aspect-[2/1] relative overflow-hidden">
        {article.featured_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div style={{ background: `${catColor}25`, width: '100%', height: '100%' }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
        <div className="flex items-center gap-3 mb-3">
          {article.is_breaking && (
            <span className="inline-block bg-dc-red text-white text-xs font-black uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
              Breaking
            </span>
          )}
          <CategoryBadge category={article.category} />
        </div>
        <h2 className="font-headline font-bold text-white text-2xl sm:text-3xl leading-tight mb-3 group-hover:text-dc-green transition-colors line-clamp-3">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-white/70 text-sm sm:text-base line-clamp-2 mb-4 hidden sm:block">
            {article.excerpt}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
          {article.author?.full_name && (
            <span className="font-semibold text-white/90">{article.author.full_name}</span>
          )}
          {article.published_at && <span>{timeAgo(article.published_at)}</span>}
          {article.reading_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.reading_time} min read
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

/* ── Featured variant: horizontal thumbnail + text ── */
function FeaturedCard({ article }: { article: ArticleCardProps }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group article-card flex gap-3 p-3 hover:no-underline"
    >
      <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0 relative" style={{ background: `${getCatColor(article.category)}15` }}>
        {article.featured_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImagePlaceholder color={getCatColor(article.category)} />
        )}
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <CategoryBadge category={article.category} />
        <h3
          className="font-headline font-bold text-sm leading-snug mt-1 line-clamp-2 transition-colors group-hover:text-dc-green"
          style={{ color: 'var(--dc-text)' }}
        >
          {article.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: 'var(--dc-text-muted)' }}>
          {article.published_at && <span>{timeAgo(article.published_at)}</span>}
          {article.reading_time && (
            <>
              <span>·</span>
              <span>{article.reading_time} min</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

/* ── List variant: text-first, divider style ── */
function ListCard({ article }: { article: ArticleCardProps }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex items-start gap-4 py-4 border-b hover:no-underline"
      style={{ borderColor: 'var(--dc-border)' }}
    >
      <div className="flex-1 min-w-0">
        <CategoryBadge category={article.category} />
        <h3
          className="font-headline font-semibold text-base leading-snug mt-1 group-hover:text-dc-green transition-colors"
          style={{ color: 'var(--dc-text)' }}
        >
          {article.title}
        </h3>
        <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--dc-text-muted)' }}>
          {article.published_at && <span>{timeAgo(article.published_at)}</span>}
          {article.reading_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.reading_time} min
            </span>
          )}
          {article.view_count !== undefined && article.view_count > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatViewCount(article.view_count)}
            </span>
          )}
        </div>
      </div>
      {article.featured_image_url && (
        <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </Link>
  )
}

/* ── Grid variant: image top, text below ── */
function GridCard({ article }: { article: ArticleCardProps }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group article-card block overflow-hidden hover:no-underline"
    >
      <div className="aspect-[4/3] overflow-hidden" style={{ background: `${getCatColor(article.category)}15` }}>
        {article.featured_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder color={getCatColor(article.category)} />
        )}
      </div>
      <div className="p-4">
        <CategoryBadge category={article.category} />
        <h3
          className="font-headline font-bold text-base leading-snug mt-1.5 line-clamp-2 group-hover:text-dc-green transition-colors"
          style={{ color: 'var(--dc-text)' }}
        >
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm line-clamp-2 mt-1.5" style={{ color: 'var(--dc-text-muted)' }}>
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: 'var(--dc-text-muted)' }}>
          {article.published_at && <span>{timeAgo(article.published_at)}</span>}
          {article.reading_time && (
            <>
              <span>·</span>
              <span>{article.reading_time} min read</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

export function ArticleCard({ variant = 'grid', ...article }: ArticleCardProps) {
  switch (variant) {
    case 'hero':     return <HeroCard article={article} />
    case 'featured': return <FeaturedCard article={article} />
    case 'list':     return <ListCard article={article} />
    case 'grid':
    default:         return <GridCard article={article} />
  }
}
