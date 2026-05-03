import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { supabaseAdmin } from '@/lib/db/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSession()
  if (!user || !['admin', 'founder'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data, error } = await supabaseAdmin
      .from('article_views')
      .select('referrer, device_type')
      .gte('viewed_at', since)

    if (error) throw error

    const sourceCounts = new Map<string, number>()
    const deviceCounts = new Map<string, number>()

    function normalizeSource(referrer: string | null): string {
      if (!referrer) return 'Direct'
      try {
        const host = new URL(referrer).hostname.toLowerCase()
        if (host.includes('facebook')) return 'Facebook'
        if (host.includes('google')) return 'Google'
        if (host.includes('twitter') || host.includes('x.com') || host.includes('t.co')) return 'Twitter'
        if (host.includes('instagram')) return 'Instagram'
        if (host.includes('youtube')) return 'YouTube'
        if (host.includes('bing')) return 'Bing'
        return 'Other'
      } catch {
        return 'Other'
      }
    }

    function normalizeDevice(deviceType: string | null): string {
      const value = (deviceType ?? '').toLowerCase()
      if (value === 'mobile') return 'Mobile'
      if (value === 'tablet') return 'Tablet'
      if (value === 'desktop') return 'Desktop'
      return 'Desktop'
    }

    for (const row of data ?? []) {
      const source = normalizeSource(row.referrer)
      const device = normalizeDevice(row.device_type)
      sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1)
      deviceCounts.set(device, (deviceCounts.get(device) ?? 0) + 1)
    }

    const total = (data ?? []).length || 1
    const sources = Array.from(sourceCounts.entries())
      .map(([source, count]) => ({
        source,
        count,
        visits: count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    const devices = Array.from(deviceCounts.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ success: true, data: { sources, devices } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
