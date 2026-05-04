import { supabaseAdmin } from '@/lib/db/admin'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/** GET /api/polls/[id] — get poll details + options (public) */
export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params

  const { data: poll, error } = await supabaseAdmin
    .from('polls')
    .select(`
      *,
      options:poll_options(*)
    `)
    .eq('id', id)
    .single()

  if (error || !poll) {
    return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
  }

  // Hide exact vote counts if poll is active and show_results_before_vote is false
  // For simplicity, we just return everything here, and the frontend will obscure if needed,
  // OR we strip vote counts if the user hasn't voted. To truly secure it, we'd check if user voted.
  return NextResponse.json({ poll })
}

/** PATCH /api/polls/[id] — update poll (admin/founder/publisher) */
export async function PATCH(req: Request, { params }: RouteParams) {
  const user = await getSession()
  if (!user || !['founder', 'admin', 'publisher'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const allowed = ['is_active', 'question', 'question_bn', 'ends_at', 'starts_at']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('polls')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ poll: data })
}

/** DELETE /api/polls/[id] — delete a poll (admin/founder) */
export async function DELETE(_req: Request, { params }: RouteParams) {
  const user = await getSession()
  if (!user || !['founder', 'admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const { error } = await supabaseAdmin.from('polls').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ deleted: true })
}
