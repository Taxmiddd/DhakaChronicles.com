import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('ad_packages')
      .select('*')
      .order('display_order', { ascending: true })
    if (error) throw error
    return NextResponse.json({ packages: data ?? [] })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user || !['founder', 'admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const body = await req.json()
    const features = Array.isArray(body.features)
      ? body.features
      : (typeof body.features === 'string'
          ? body.features.split('\n').map((f: string) => f.trim()).filter(Boolean)
          : [])
    const { data, error } = await supabaseAdmin
      .from('ad_packages')
      .insert([{
        name: body.name,
        price: body.price,
        period: body.period ?? '/month',
        description: body.description,
        features,
        is_highlighted: body.is_highlighted ?? false,
        cta_label: body.cta_label ?? 'Get Started',
        is_active: body.is_active ?? true,
        display_order: body.display_order ?? 0,
      }])
      .select()
    if (error) throw error
    return NextResponse.json({ package: data?.[0] }, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
