import { supabaseAdmin } from '@/lib/db/admin'

export const revalidate = 1800

const siteUrl = 'https://dhakachronicles.com'

export async function GET() {
  // Google News Sitemap covers articles published in the last 2 days
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('title, title_bn, slug, published_at, categories(name)')
    .eq('status', 'published')
    .gte('published_at', twoDaysAgo)
    .order('published_at', { ascending: false })
    .limit(1000)

  const items = (articles || [])
    .map((a) => {
      const pubDate = a.published_at
        ? new Date(a.published_at).toISOString()
        : new Date().toISOString()

      const esc = (s: string) =>
        s.replace(/[<>&'"]/g, (c) =>
          ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' } as Record<string, string>)[c] ?? c
        )

      const catArr = (a as { categories?: { name: string }[] | { name: string } | null }).categories
      const catName = Array.isArray(catArr)
        ? catArr[0]?.name ?? 'General'
        : (catArr as { name: string } | null)?.name ?? 'General'

      return `  <url>
    <loc>${siteUrl}/news/${esc(a.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>Dhaka Chronicles</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${esc(a.title)}</news:title>
      <news:keywords>${esc(catName)}</news:keywords>
    </news:news>
  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=1800',
    },
  })
}
