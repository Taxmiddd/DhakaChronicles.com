import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'
import { rateLimit } from '@/lib/utils/rate-limit'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  // Protect analytics writes from spam bursts
  const rateLimitError = rateLimit(request, 120, 60000, 'article-view-track')
  if (rateLimitError) return rateLimitError

  const { id } = await params
  const user = await getSession()

  try {
    const body = await request.json().catch(() => ({}))
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''

    // Detect device type from user agent
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent)
    const isTablet = /tablet|ipad/i.test(userAgent)
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

    // Insert view event
    await supabaseAdmin.from('article_views').insert({
      article_id: id,
      user_id: user?.id || null,
      session_id: body.session_id || null,
      ip_address: ip,
      user_agent: userAgent,
      referrer: referer,
      device_type: deviceType,
      viewed_at: new Date().toISOString(),
    })

    // Increment view_count on articles table
    await supabaseAdmin
      .from('articles')
      .select('view_count')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          supabaseAdmin
            .from('articles')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', id)
        }
      })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
