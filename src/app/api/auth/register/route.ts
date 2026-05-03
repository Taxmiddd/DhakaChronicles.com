import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { RegisterSchema } from '@/lib/validations'

export async function POST(request: Request) {
  // Self-registration is disabled. Accounts are created by admins via /admin/users.
  // To bootstrap the very first founder account, send this header with the value from BOOTSTRAP_SECRET.
  const bootstrapKey = request.headers.get('x-bootstrap-key')
  if (bootstrapKey !== process.env.BOOTSTRAP_SECRET) {
    return NextResponse.json({ error: 'Registration is closed.' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const validated = RegisterSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 })
    }

    const { name, email, password, role } = validated.data

    // Create in Supabase Auth (email_confirm: true skips the verification email)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role },
      user_metadata: { full_name: name },
    })

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message || 'Failed to create user' }, { status: 400 })
    }

    // Sync profile row
    await supabaseAdmin.from('users').upsert({
      id: data.user.id,
      email,
      full_name: name,
      role,
      is_active: true,
    })

    return NextResponse.json({ success: true, data: { id: data.user.id, email, name, role } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
