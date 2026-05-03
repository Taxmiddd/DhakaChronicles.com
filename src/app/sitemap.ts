import { supabaseAdmin } from '@/lib/db/admin'
import { MetadataRoute } from 'next'

export const revalidate = 3600

const BASE = 'https://dhakachronicles.com'

type Freq = MetadataRoute.Sitemap[number]['changeFrequency']

const STATIC: MetadataRoute.Sitemap = (
  [
    { url: BASE,                  freq: 'hourly'  as Freq, priority: 1.0 },
    { url: `${BASE}/news`,        freq: 'hourly'  as Freq, priority: 0.9 },
    { url: `${BASE}/search`,      freq: 'weekly'  as Freq, priority: 0.6 },
    { url: `${BASE}/podcasts`,    freq: 'daily'   as Freq, priority: 0.7 },
    { url: `${BASE}/portfolio`,   freq: 'weekly'  as Freq, priority: 0.6 },
    { url: `${BASE}/advertise`,   freq: 'monthly' as Freq, priority: 0.5 },
    { url: `${BASE}/about`,       freq: 'monthly' as Freq, priority: 0.5 },
    { url: `${BASE}/contact`,     freq: 'monthly' as Freq, priority: 0.5 },
    { url: `${BASE}/careers`,     freq: 'weekly'  as Freq, priority: 0.5 },
    { url: `${BASE}/tips`,        freq: 'monthly' as Freq, priority: 0.4 },
    { url: `${BASE}/privacy`,     freq: 'yearly'  as Freq, priority: 0.2 },
    { url: `${BASE}/terms`,       freq: 'yearly'  as Freq, priority: 0.2 },
    { url: `${BASE}/cookies`,     freq: 'yearly'  as Freq, priority: 0.2 },
  ] as const
).map(({ url, freq, priority }) => ({
  url,
  lastModified: new Date(),
  changeFrequency: freq,
  priority,
}))

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: articles }, { data: categories }] = await Promise.all([
    supabaseAdmin
      .from('articles')
      .select('slug, updated_at, published_at, is_featured')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1000),
    supabaseAdmin
      .from('categories')
      .select('slug, updated_at'),
  ])

  const articlePages: MetadataRoute.Sitemap = (articles ?? []).map(a => ({
    url: `${BASE}/news/${a.slug}`,
    lastModified: new Date(a.updated_at ?? a.published_at ?? Date.now()),
    changeFrequency: 'weekly' as const,
    priority: a.is_featured ? 0.9 : 0.8,
  }))

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map(c => ({
    url: `${BASE}/category/${c.slug}`,
    lastModified: new Date(c.updated_at ?? Date.now()),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [...STATIC, ...categoryPages, ...articlePages]
}
