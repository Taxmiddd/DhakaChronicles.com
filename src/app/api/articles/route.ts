import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'
import { ArticleSchema } from '@/lib/validations'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '50')
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('articles')
      .select(`
        id, title, slug, status, published_at, created_at,
        author:users!author_id(full_name),
        category:categories!category_id(name)
      `)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data, count })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = ArticleSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = validated.data

    // If publishing, set published_at
    let published_at = null
    if (data.status === 'published') {
      published_at = new Date().toISOString()
    }

    const { data: newArticle, error } = await supabaseAdmin
      .from('articles')
      .insert({
        ...data,
        author_id: user.id,
        published_at,
        view_count: 0,
        unique_view_count: 0,
        share_count: 0,
        comment_count: 0,
        version: 1,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data: newArticle })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
