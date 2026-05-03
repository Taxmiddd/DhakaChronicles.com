import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}))

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

  // Supabase sends its own reset email — no custom email needed
  await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  // Always return 200 to prevent email enumeration
  return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
}
