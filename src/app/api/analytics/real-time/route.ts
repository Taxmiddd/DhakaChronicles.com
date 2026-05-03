import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { supabaseAdmin } from '@/lib/db/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSession()
  if (!user || !['admin', 'founder'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const since = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: views, error } = await supabaseAdmin
      .from('article_views')
      .select('article_id, user_id, session_id, ip_address')
      .gte('viewed_at', since)

    if (error) throw error

    const viewerSet = new Set<string>()
    const perArticle = new Map<string, Set<string>>()

    for (const view of views ?? []) {
      const viewerKey = view.user_id ?? view.session_id ?? view.ip_address
      if (!viewerKey) continue
      viewerSet.add(viewerKey)

      const articleId = view.article_id
      if (!articleId) continue
      if (!perArticle.has(articleId)) perArticle.set(articleId, new Set<string>())
      perArticle.get(articleId)!.add(viewerKey)
    }

    const topArticleIds = Array.from(perArticle.entries())
      .map(([article_id, users]) => ({ article_id, active_users: users.size }))
      .sort((a, b) => b.active_users - a.active_users)
      .slice(0, 5)

    const ids = topArticleIds.map((row) => row.article_id)
    const { data: articles } = ids.length
      ? await supabaseAdmin.from('articles').select('id, slug').in('id', ids)
      : { data: [] as Array<{ id: string; slug: string | null }> }

    const slugMap = new Map((articles ?? []).map((a) => [a.id, a.slug]))
    const top_active_pages = topArticleIds.map((row) => ({
      path: `/news/${slugMap.get(row.article_id) ?? row.article_id}`,
      active_users: row.active_users,
    }))

    return NextResponse.json({
      success: true,
      data: {
        active_visitors: viewerSet.size,
        top_active_pages,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
