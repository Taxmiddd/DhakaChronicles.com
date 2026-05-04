import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'
import { CommentSchema } from '@/lib/validations'

type Params = { params: Promise<{ id: string }> }

// GET comments for an article
export async function GET(request: Request, { params }: Params) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'approved'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  const { data, error, count } = await supabaseAdmin
    .from('comments')
    .select('*', { count: 'exact' })
    .eq('article_id', id)
    .eq('status', status)
    .is('parent_id', null) // top-level comments only
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch replies for each top-level comment
  const commentsWithReplies = await Promise.all(
    (data || []).map(async (comment) => {
      const { data: replies } = await supabaseAdmin
        .from('comments')
        .select('*')
        .eq('parent_id', comment.id)
        .eq('status', 'approved')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      return { ...comment, replies: replies || [] }
    })
  )

  return NextResponse.json({
    success: true,
    data: commentsWithReplies,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  })
}

// POST new comment
import { rateLimit } from '@/lib/utils/rate-limit'

export async function POST(request: Request, { params }: Params) {
  // Strict rate limit: 10 comments per minute per IP
  const rateLimitError = rateLimit(request, 10, 60000, 'article-comments-create')
  if (rateLimitError) return rateLimitError

  const { id } = await params
  const user = await getSession()
  const body = await request.json()

  const validated = CommentSchema.safeParse({ ...body, article_id: id })
  if (!validated.success) {
    return NextResponse.json(
      { error: validated.error.issues[0].message },
      { status: 400 }
    )
  }

  const data = validated.data

  // Guests need name + email, logged-in users do not
  if (!user && (!data.author_name || !data.author_email)) {
    return NextResponse.json(
      { error: 'Name and email are required for guest comments.' },
      { status: 400 }
    )
  }

  // Get IP address for rate limiting and spam detection
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  // Auto-approve comments from authenticated admins/founders, pending for others
  const autoApprove = user && ['admin', 'founder'].includes(user.role)

  const { data: comment, error } = await supabaseAdmin
    .from('comments')
    .insert({
      article_id: id,
      parent_id: data.parent_id || null,
      user_id: user?.id || null,
      author_name: user ? user.name : data.author_name,
      author_email: user ? user.email : data.author_email,
      author_ip: ip,
      content: data.content,
      status: autoApprove ? 'approved' : 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Increment comment count on article if approved
  if (autoApprove) {
    await supabaseAdmin.rpc('increment_article_stat', {
      article_id: id,
      field: 'comment_count',
    })
  }

  return NextResponse.json({
    success: true,
    data: comment,
    message: autoApprove
      ? 'Comment posted!'
      : 'Comment submitted and awaiting moderation.',
  })
}
