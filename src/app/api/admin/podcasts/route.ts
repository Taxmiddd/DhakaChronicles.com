import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'

async function auth() {
  const session = await getSession()
  if (!session || !['founder', 'admin', 'publisher'].includes(session.role)) return null
  return session
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let query = supabaseAdmin
    .from('podcasts')
    .select('*, author:users(full_name)')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ podcasts: data ?? [] })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    title, description, audio_url, cover_image_url,
    episode_number, season = 1, duration_seconds,
    status = 'draft', published_at,
    spotify_url, apple_url, youtube_url,
  } = body

  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('podcasts')
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      audio_url: audio_url?.trim() || null,
      cover_image_url: cover_image_url?.trim() || null,
      episode_number: episode_number ? Number(episode_number) : null,
      season: Number(season) || 1,
      duration_seconds: duration_seconds ? Number(duration_seconds) : null,
      status,
      published_at: status === 'published' ? (published_at || new Date().toISOString()) : null,
      spotify_url: spotify_url?.trim() || null,
      apple_url: apple_url?.trim() || null,
      youtube_url: youtube_url?.trim() || null,
      author_id: session.id,
    })
    .select('*, author:users(full_name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ podcast: data })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...fields } = body
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const allowed = [
    'title', 'description', 'audio_url', 'cover_image_url',
    'episode_number', 'season', 'duration_seconds', 'status',
    'published_at', 'spotify_url', 'apple_url', 'youtube_url',
  ]

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in fields) update[key] = fields[key] ?? null
  }
  if (fields.status === 'published' && !fields.published_at) {
    update.published_at = new Date().toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('podcasts')
    .update(update)
    .eq('id', id)
    .select('*, author:users(full_name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ podcast: data })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || !['founder', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabaseAdmin.from('podcasts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
