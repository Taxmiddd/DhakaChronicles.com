import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { name, slug, description, color } = body

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({ name, slug, description: description || null, color: color || null })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ category: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    // Unset category_id on articles in this category
    await supabaseAdmin
      .from('articles')
      .update({ category_id: null })
      .eq('category_id', id)

    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
