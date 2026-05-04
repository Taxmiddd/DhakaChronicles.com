import { supabaseAdmin } from '@/lib/db/admin'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/utils/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const rateLimitError = rateLimit(req, 5, 10 * 60 * 1000, 'contact')
  if (rateLimitError) return rateLimitError

  const body = await req.json().catch(() => ({}))
  const { name, email, subject, message } = body

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  if (message.length > 5000) {
    return NextResponse.json({ error: 'Message must be 5000 characters or less' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('contact_messages').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
    submitted_at: new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, message: 'Your message has been received. We\'ll be in touch soon.' }, { status: 201 })
}
