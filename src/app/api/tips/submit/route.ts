import { supabaseAdmin } from '@/lib/db/admin'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/utils/rate-limit'

export const dynamic = 'force-dynamic'

/** POST /api/tips/submit — public news tip submission */
export async function POST(req: Request) {
  // Prevent automated tip-spam
  const rateLimitError = rateLimit(req, 8, 10 * 60 * 1000, 'tips-submit')
  if (rateLimitError) return rateLimitError

  const body = await req.json().catch(() => ({}))
  const { subject, description, tipsterName, tipsterEmail, tipsterPhone, location, isAnonymous } = body

  if (!subject || !description) {
    return NextResponse.json({ error: 'Subject and description are required' }, { status: 400 })
  }

  if (subject.length > 200) {
    return NextResponse.json({ error: 'Subject must be 200 characters or less' }, { status: 400 })
  }

  if (description.length > 5000) {
    return NextResponse.json({ error: 'Description must be 5000 characters or less' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('news_tips').insert({
    subject: subject.trim(),
    description: description.trim(),
    tipster_name: isAnonymous ? null : (tipsterName?.trim() ?? null),
    tipster_email: isAnonymous ? null : (tipsterEmail?.trim() ?? null),
    tipster_phone: isAnonymous ? null : (tipsterPhone?.trim() ?? null),
    location: location?.trim() ?? null,
    is_anonymous: Boolean(isAnonymous),
    status: 'new',
    priority: 'medium',
    submitted_at: new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, message: 'Your tip has been received. Thank you!' }, { status: 201 })
}
