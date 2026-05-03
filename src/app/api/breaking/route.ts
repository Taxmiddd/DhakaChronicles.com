import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'

export const revalidate = 60

export async function GET() {
  try {
    const { data } = await supabaseAdmin
      .from('articles')
      .select('id, title, slug')
      .eq('status', 'published')
      .eq('is_breaking', true)
      .order('published_at', { ascending: false })
      .limit(6)

    return NextResponse.json({ articles: data ?? [] })
  } catch {
    return NextResponse.json({ articles: [] })
  }
}
