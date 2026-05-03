import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}))

  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  // The user must already have an active session from the reset link
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return NextResponse.json({ error: 'Failed to update password. The reset link may have expired.' }, { status: 400 })
  }

  return NextResponse.json({ message: 'Password updated successfully. You can now log in.' })
}
