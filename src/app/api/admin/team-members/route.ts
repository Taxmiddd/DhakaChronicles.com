import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data: members, error } = await supabaseAdmin
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ members })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'founder' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const {
    full_name,
    role: member_role,
    bio,
    avatar_url,
    twitter_url,
    linkedin_url,
    facebook_url,
    is_active = true,
  } = body

  if (!full_name || !member_role) {
    return NextResponse.json(
      { error: 'Missing required fields: full_name, role' },
      { status: 400 }
    )
  }

  const { data: member, error } = await supabaseAdmin
    .from('team_members')
    .insert([{
      full_name,
      role: member_role,
      bio: bio || null,
      avatar_url: avatar_url || null,
      twitter_url: twitter_url || null,
      linkedin_url: linkedin_url || null,
      facebook_url: facebook_url || null,
      is_active,
    }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ member }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'founder' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const memberId = req.nextUrl.searchParams.get('id')
  if (!memberId) {
    return NextResponse.json({ error: 'Missing team member ID' }, { status: 400 })
  }

  const body = await req.json()
  const { data: member, error } = await supabaseAdmin
    .from('team_members')
    .update(body)
    .eq('id', memberId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ member })
}

export async function DELETE(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'founder' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const memberId = req.nextUrl.searchParams.get('id')
  if (!memberId) {
    return NextResponse.json({ error: 'Missing team member ID' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('team_members')
    .delete()
    .eq('id', memberId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
