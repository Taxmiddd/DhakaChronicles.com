import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'

export const revalidate = 0

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const position = searchParams.get('position')

  if (!position) return NextResponse.json(null)

  try {
    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('ads')
      .select('id, image_url, link_url, title, client_name')
      .eq('is_active', true)
      .eq('position', position)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .limit(10)

    if (error || !data || data.length === 0) return NextResponse.json(null)

    const ad = data[Math.floor(Math.random() * data.length)]
    return NextResponse.json(ad, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json(null)
  }
}
