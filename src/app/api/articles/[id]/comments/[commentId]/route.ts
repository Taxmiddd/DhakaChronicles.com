import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'

type Params = { params: Promise<{ id: string; commentId: string }> }

const MODERATOR_ROLES = ['admin', 'founder', 'publisher']

// PATCH /api/articles/[id]/comments/[commentId] — moderate a comment
export async function PATCH(request: Request, { params }: Params) {
  const user = await getSession()
  if (!user || !MODERATOR_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { commentId } = await params
  const body = await request.json().catch(() => ({}))
  const { status } = body

  const VALID_STATUSES = ['approved', 'rejected', 'spam', 'pending']
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('comments')
    .update({ status })
    .eq('id', commentId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Keep article comment_count in sync when approving
  if (status === 'approved' && data?.article_id) {
    await supabaseAdmin.rpc('increment_article_stat', {
      article_id: data.article_id,
      field: 'comment_count',
    })
  }

  return NextResponse.json({ success: true, data })
}

// DELETE /api/articles/[id]/comments/[commentId] — soft delete a comment
export async function DELETE(_request: Request, { params }: Params) {
  const user = await getSession()
  if (!user || !MODERATOR_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { commentId } = await params

  const { error } = await supabaseAdmin
    .from('comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', commentId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
