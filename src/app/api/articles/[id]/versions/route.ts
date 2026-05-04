import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/** GET /api/articles/[id]/versions — list version history */
export async function GET(_req: Request, { params }: RouteParams) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('article_versions')
    .select(`
      id,
      version,
      title,
      content,
      change_summary,
      created_at,
      editor:users(full_name, role)
    `)
    .eq('article_id', id)
    .order('version', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ versions: data ?? [] })
}

/** POST /api/articles/[id]/versions — save current state as a new version */
export async function POST(req: Request, { params }: RouteParams) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { changeSummary } = await req.json().catch(() => ({}))

  // Fetch current article state
  const { data: article, error: fetchErr } = await supabaseAdmin
    .from('articles')
    .select('title, content, version')
    .eq('id', id)
    .single()

  if (fetchErr || !article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  const nextVersion = (article.version ?? 1) + 1

  // Save the snapshot
  const { data: version, error: insertErr } = await supabaseAdmin
    .from('article_versions')
    .insert({
      article_id: id,
      version: article.version ?? 1,
      title: article.title,
      content: article.content,
      edited_by: user.id,
      change_summary: changeSummary ?? 'Manual snapshot',
    })
    .select()
    .single()

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  // Bump article version counter
  await supabaseAdmin.from('articles').update({ version: nextVersion }).eq('id', id)

  return NextResponse.json({ success: true, version }, { status: 201 })
}
