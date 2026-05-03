import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session || !['admin', 'founder'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('story_assignments')
      .select(`
        *,
        assignee:users!story_assignments_assignee_id_fkey(full_name),
        assigned_by_user:users!story_assignments_assigned_by_fkey(full_name),
        category:categories(name, color)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('[Admin Assignments]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
