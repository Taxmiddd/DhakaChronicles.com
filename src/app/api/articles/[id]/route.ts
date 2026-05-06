import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'
import { ArticleSchema } from '@/lib/validations'

type Params = { params: Promise<{ id: string }> }

// GET single article by ID (admin)
export async function GET(_req: Request, { params }: Params) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data })
}

// PATCH update article
export async function PATCH(request: Request, { params }: Params) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Non-admin roles may only edit their own articles
  if (!['admin', 'founder'].includes(user.role)) {
    const { data: existing } = await supabaseAdmin
      .from('articles')
      .select('author_id')
      .eq('id', id)
      .single()
    if (!existing || existing.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const body = await request.json()

  // Partial parse — allow partial updates
  const validated = ArticleSchema.partial().safeParse(body)
  if (!validated.success) {
    return NextResponse.json(
      { success: false, error: validated.error.issues[0].message },
      { status: 400 }
    )
  }

  const data = validated.data

  // Normalize empty strings to null for DB
  const normalizedData = {
    ...data,
    category_id: data.category_id || null,
    published_at: data.published_at || null,
    featured_image_url: data.featured_image_url || null,
  }

  let updatePayload: Record<string, unknown> = {
    ...normalizedData,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
    last_edited_at: new Date().toISOString(),
  }

  if (data.status === 'published') {
    // Check if it was previously not published
    const { data: existing } = await supabaseAdmin
      .from('articles')
      .select('status, published_at')
      .eq('id', id)
      .single()

    if (existing && existing.status !== 'published') {
      updatePayload.published_at = new Date().toISOString()
    }
  }

  const { data: updated, error } = await supabaseAdmin
    .from('articles')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: updated })
}

// DELETE article (soft delete)
export async function DELETE(_req: Request, { params }: Params) {
  const user = await getSession()
  if (!user || !['admin', 'founder'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const { error } = await supabaseAdmin
    .from('articles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
