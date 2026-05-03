import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'

export async function GET() {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'founder' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    const enriched = await Promise.all(
      (data ?? []).map(async (u) => {
        const { count } = await supabaseAdmin
          .from('articles')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', u.id)
          .neq('status', 'deleted')
        return { ...u, article_count: count ?? 0 }
      })
    )

    return NextResponse.json({ users: enriched })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getSession()
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (currentUser.role !== 'founder' && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email, full_name, role = 'publisher' } = body

    if (!email?.trim() || !full_name?.trim()) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })
    }

    const validRoles = ['founder', 'admin', 'publisher']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'

    // Create in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: tempPassword,
      email_confirm: true,
      app_metadata: { role },
      user_metadata: {
        full_name: full_name.trim(),
      },
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Failed to create user' }, { status: 400 })
    }

    // Sync profile row (admin users only, no team profile data)
    await supabaseAdmin.from('users').upsert({
      id: authData.user.id,
      email: email.toLowerCase().trim(),
      full_name: full_name.trim(),
      role,
      is_active: true,
    })

    return NextResponse.json({ user: authData.user, temp_password: tempPassword })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
