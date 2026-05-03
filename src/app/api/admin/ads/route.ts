import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'

export async function GET() {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'founder' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabaseAdmin
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ ads: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'founder' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { client_name, title, image_url, link_url, position, size, is_active, starts_at, ends_at } = body

    if (!client_name || !title || !image_url || !link_url || !position || !size) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('ads')
      .insert({ client_name, title, image_url, link_url, position, size, is_active: is_active ?? true, starts_at: starts_at ?? null, ends_at: ends_at ?? null, click_count: 0, impression_count: 0 })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ ad: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
