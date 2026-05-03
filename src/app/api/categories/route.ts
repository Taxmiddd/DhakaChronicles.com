import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug, description, color')
      .order('name')

    if (error) throw error

    // Enrich with article counts
    const enriched = await Promise.all(
      (data ?? []).map(async (cat) => {
        const { count } = await supabaseAdmin
          .from('articles')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', cat.id)
          .neq('status', 'deleted')
        return { ...cat, article_count: count ?? 0 }
      })
    )

    return NextResponse.json({ categories: enriched })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, slug, description, color } = body

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({ name: name.trim(), slug: slug.trim(), description: description || null, color: color || null })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ category: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
