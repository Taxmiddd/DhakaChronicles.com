import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/server'
import { LoginSchema } from '@/lib/validations'
import { supabaseAdmin } from '@/lib/db/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = LoginSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 })
    }

    const { email, password } = validated.data
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    // Update last login timestamp
    await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id)

    return NextResponse.json({ success: true, redirect: '/admin/dashboard' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
