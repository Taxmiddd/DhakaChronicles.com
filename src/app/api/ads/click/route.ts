import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ ok: false })

  try {
    // Fetch current count then increment — avoids needing an RPC
    const { data } = await supabaseAdmin
      .from('ads')
      .select('click_count')
      .eq('id', id)
      .single()

    if (data) {
      await supabaseAdmin
        .from('ads')
        .update({ click_count: (data.click_count ?? 0) + 1 })
        .eq('id', id)
    }
  } catch {
    // fire-and-forget, silently ignore errors
  }

  return NextResponse.json({ ok: true })
}
