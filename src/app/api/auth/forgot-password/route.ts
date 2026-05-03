import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/server'
import { rateLimit } from '@/lib/utils/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  // Protect email credits from reset-link abuse
  const rateLimitError = rateLimit(req, 3, 15 * 60 * 1000, 'auth-forgot-password')
  if (rateLimitError) return rateLimitError

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
