import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'

async function requireFounderOrAdmin() {
  const session = await getSession()
  if (!session || !['founder', 'admin'].includes(session.role)) return null
  return session
}

export async function GET() {
  const session = await getSession()
  if (!session || !['founder', 'admin', 'publisher'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data ?? {} })
}

export async function PATCH(req: NextRequest) {
  const session = await requireFounderOrAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()

  const allowed = [
    'site_name', 'tagline', 'site_url', 'contact_email',
    'breaking_news_enabled', 'bangla_enabled', 'articles_per_page',
    'notify_on_review', 'notify_on_publish', 'notify_on_new_user',
    'session_timeout_minutes', 'max_login_attempts',
    'cloudinary_cloud_name', 'fb_page_id',
  ]

  const update: Record<string, unknown> = { id: 1, updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .upsert(update, { onConflict: 'id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data })
}
