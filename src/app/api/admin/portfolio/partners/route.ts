import { supabaseAdmin } from '@/lib/db/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('portfolio_partners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error

    return NextResponse.json({ partners: data || [] })
  } catch (err) {
    console.error('Error fetching partners:', err)
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('portfolio_partners')
      .insert([{
        name: body.name,
        category: body.category,
        logo_url: body.logo_url || null,
        color: body.color,
        initial: body.initial,
        website_url: body.website_url || null,
        is_active: body.is_active ?? true,
        display_order: body.display_order ?? 0,
      }])
      .select()

    if (error) throw error

    return NextResponse.json({ partner: data?.[0] }, { status: 201 })
  } catch (err) {
    console.error('Error creating partner:', err)
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 })
  }
}
