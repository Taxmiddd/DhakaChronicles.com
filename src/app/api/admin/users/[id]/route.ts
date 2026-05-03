import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/admin'
import { getSession } from '@/lib/auth/session'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const currentUser = await getSession()
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (currentUser.role !== 'founder' && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { role } = body

    const validRoles = ['founder', 'admin', 'publisher']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Update role in Supabase Auth app_metadata
    await supabaseAdmin.auth.admin.updateUserById(id, {
      app_metadata: { role },
    })

    // Update profile table
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', id)
      .select('id, full_name, email, role')
      .single()

    if (error) throw error

    return NextResponse.json({ user: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const currentUser = await getSession()
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (currentUser.role !== 'founder') {
      return NextResponse.json({ error: 'Only founders can remove users' }, { status: 403 })
    }

    const { id } = await params

    if (id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete from Supabase Auth (cascades to profile via trigger or we delete manually)
    await supabaseAdmin.auth.admin.deleteUser(id)
    await supabaseAdmin.from('users').delete().eq('id', id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
