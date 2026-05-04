import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('portfolio_services')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ services: data ?? [] })
  } catch (err) {
    console.error('Error fetching portfolio services:', err)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user || !['founder', 'admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { data, error } = await supabaseAdmin
      .from('portfolio_services')
      .insert([{
        icon_name: body.icon_name,
        title: body.title,
        description: body.description,
        is_active: body.is_active ?? true,
        display_order: body.display_order ?? 0,
      }])
      .select()

    if (error) throw error
    return NextResponse.json({ service: data?.[0] }, { status: 201 })
  } catch (err) {
    console.error('Error creating portfolio service:', err)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
