import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('job_openings')
      .select('*')
      .order('display_order', { ascending: true })
    if (error) throw error
    return NextResponse.json({ jobs: data ?? [] })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user || !['founder', 'admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const body = await req.json()
    const { data, error } = await supabaseAdmin
      .from('job_openings')
      .insert([{
        title: body.title,
        department: body.department,
        type: body.type,
        location: body.location,
        description: body.description,
        color: body.color ?? '#00A651',
        is_active: body.is_active ?? true,
        display_order: body.display_order ?? 0,
      }])
      .select()
    if (error) throw error
    return NextResponse.json({ job: data?.[0] }, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
