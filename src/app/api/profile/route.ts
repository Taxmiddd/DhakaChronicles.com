import { supabaseAdmin } from '@/lib/db/admin'
import { createSupabaseServerClient } from '@/lib/db/server'
import { getSession } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, role, avatar_url, bio, phone, facebook_url, twitter_url, linkedin_url')
    .eq('id', session.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ profile: data })
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { full_name, bio, phone, avatar_url, facebook_url, twitter_url, linkedin_url, new_password } = body

  // If changing password, update via Supabase Auth
  if (new_password) {
    if (new_password.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }
    const supabase = await createSupabaseServerClient()
    const { error: pwError } = await supabase.auth.updateUser({ password: new_password })
    if (pwError) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 400 })
    }
  }

  // Sync name/avatar into Supabase Auth user_metadata
  if (full_name !== undefined || avatar_url !== undefined) {
    const meta: Record<string, string> = {}
    if (full_name !== undefined) meta.full_name = full_name
    if (avatar_url !== undefined) meta.avatar_url = avatar_url
    await supabaseAdmin.auth.admin.updateUserById(session.id, { user_metadata: meta })
  }

  // Update profile table
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (full_name  !== undefined) updateData.full_name  = full_name
  if (bio        !== undefined) updateData.bio        = bio
  if (phone      !== undefined) updateData.phone      = phone
  if (avatar_url !== undefined) updateData.avatar_url = avatar_url
  if (facebook_url !== undefined) updateData.facebook_url = facebook_url
  if (twitter_url  !== undefined) updateData.twitter_url  = twitter_url
  if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updateData)
    .eq('id', session.id)
    .select('id, email, full_name, role, avatar_url, bio, phone, facebook_url, twitter_url, linkedin_url')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, profile: data })
}
