import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { NewsletterSubscribeSchema } from '@/lib/validations'
import { rateLimit } from '@/lib/utils/rate-limit'

export async function POST(request: Request) {
  // Strict rate limit: 5 requests per minute
  const rateLimitError = rateLimit(request, 5, 60000)
  if (rateLimitError) return rateLimitError

  try {
    const contentType = request.headers.get('content-type') ?? ''
    let body: unknown
    if (contentType.includes('application/json')) {
      body = await request.json()
    } else {
      const fd = await request.formData()
      body = { email: fd.get('email') }
    }
    const validated = NewsletterSubscribeSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, name, language, frequency } = validated.data

    // Upsert subscriber (handles re-subscription gracefully)
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert(
        {
          email,
          name: name || null,
          language,
          frequency,
          status: 'active',
          subscribe_source: request.headers.get('referer') || 'website',
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        },
        { onConflict: 'email' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'You are subscribed! Thank you for joining Dhaka Chronicles.',
      data,
    })
  } catch (err: any) {
    console.error('[Newsletter Subscribe]', err)
    return NextResponse.json(
      { error: err.message || 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
