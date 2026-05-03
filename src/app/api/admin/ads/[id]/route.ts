import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'

type Ctx = { params: Promise<{ id: string }> }

async function authorize() {
  const user = await getSession()
  if (!user) return null
  if (user.role !== 'founder' && user.role !== 'admin') return null
  return user
}

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const user = await authorize()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    const allowed = ['client_name', 'title', 'image_url', 'link_url', 'position', 'size', 'is_active', 'starts_at', 'ends_at']
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    const { data, error } = await supabaseAdmin
      .from('ads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ ad: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  try {
    const user = await authorize()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const { error } = await supabaseAdmin.from('ads').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
