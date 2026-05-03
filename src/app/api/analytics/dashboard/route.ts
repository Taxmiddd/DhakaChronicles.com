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
    const now = new Date()
    const activeSince = new Date(now.getTime() - 5 * 60 * 1000).toISOString()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const todayIso = startOfToday.toISOString()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [articlesCount, usersCount, articlesData, recentViews, viewsLast7Days] = await Promise.all([
      supabaseAdmin.from('articles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('articles').select('view_count, status, published_at'),
      supabaseAdmin
        .from('article_views')
        .select('user_id, session_id, ip_address')
        .gte('viewed_at', activeSince),
      supabaseAdmin
        .from('article_views')
        .select('viewed_at')
        .gte('viewed_at', sevenDaysAgo),
    ])

    if (articlesData.error) throw articlesData.error
    if (recentViews.error) throw recentViews.error
    if (viewsLast7Days.error) throw viewsLast7Days.error

    const articleRows = articlesData.data ?? []
    const totalViews = articleRows.reduce((sum, row) => sum + (row.view_count || 0), 0)
    const pendingReview = articleRows.filter((row) => row.status === 'review').length
    const publishedToday = articleRows.filter(
      (row) => row.status === 'published' && !!row.published_at && row.published_at >= todayIso
    ).length

    const activeVisitors = new Set<string>()
    for (const view of recentViews.data ?? []) {
      const key = view.user_id ?? view.session_id ?? view.ip_address
      if (key) activeVisitors.add(key)
    }

    const dailyViewsMap = new Map<string, number>()
    for (const view of viewsLast7Days.data ?? []) {
      if (!view.viewed_at) continue
      const date = new Date(view.viewed_at)
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
      dailyViewsMap.set(key, (dailyViewsMap.get(key) ?? 0) + 1)
    }

    const viewsByDay = Array.from({ length: 7 }, (_, idx) => {
      const date = new Date(now)
      date.setUTCDate(now.getUTCDate() - (6 - idx))
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        views: dailyViewsMap.get(key) ?? 0,
      }
    })

    const viewsToday = viewsByDay[viewsByDay.length - 1]?.views ?? 0
    const viewsThisWeek = viewsByDay.reduce((sum, row) => sum + row.views, 0)

    return NextResponse.json({
      success: true,
      data: {
        total_articles: articlesCount.count || 0,
        total_views: totalViews,
        total_users: usersCount.count || 0,
        active_now: activeVisitors.size,
        views_today: viewsToday,
        views_this_week: viewsThisWeek,
        published_today: publishedToday,
        pending_review: pendingReview,
        views_last_7_days: viewsByDay,
        recent_activity: []
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
