import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { rateLimit } from '@/lib/utils/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Protect search queries from high-frequency scraping
  const rateLimitError = rateLimit(request, 60, 60000, 'search-read')
  if (rateLimitError) return rateLimitError

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const category = searchParams.get('category')
  const type = searchParams.get('type')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const offset = (page - 1) * limit

  if (!q || q.length < 2) {
    return NextResponse.json({ success: true, data: [], total: 0 })
  }

  let query = supabaseAdmin
    .from('articles')
    .select('id, title, slug, excerpt, featured_image_url, category_id, author_id, published_at, reading_time, view_count, is_breaking', { count: 'exact' })
    .eq('status', 'published')
    .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category) query = query.eq('category_id', category)
  if (type) query = query.eq('article_type', type)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    data: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
    query: q,
  })
}
