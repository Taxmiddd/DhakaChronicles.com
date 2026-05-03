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
    // In a real scenario, this might be a SQL view or RPC function to aggregate author stats.
    // Here we'll fetch authors and their article counts as a basic example.
    const { data: authors, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, role')
      .in('role', ['admin', 'founder', 'publisher'])

    if (error) throw error

    // Fetch aggregate views per author (simplified, would normally join or use RPC)
    const { data: articles, error: articlesError } = await supabaseAdmin
      .from('articles')
      .select('author_id, view_count, id')
      .eq('status', 'published')

    if (articlesError) throw articlesError

    const authorStats = authors.map(author => {
      const authorArticles = articles.filter(a => a.author_id === author.id)
      const totalViews = authorArticles.reduce((sum, article) => sum + (article.view_count || 0), 0)
      return {
        id: author.id,
        full_name: author.full_name,
        role: author.role,
        articles_published: authorArticles.length,
        total_views: totalViews
      }
    })

    return NextResponse.json({ success: true, data: authorStats })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
