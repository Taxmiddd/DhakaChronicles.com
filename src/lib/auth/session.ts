import 'server-only'
import { createSupabaseServerClient } from '@/lib/db/server'
import { supabaseAdmin } from '@/lib/db/admin'
import type { SessionUser } from '@/types'

export async function getSession(): Promise<SessionUser | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Role is in app_metadata when created via our API.
    // Fall back to the users table for accounts created via the Supabase dashboard.
    let role = user.app_metadata?.role as SessionUser['role'] | undefined
    let name = (user.user_metadata?.full_name as string) ?? ''
    let avatar_url = (user.user_metadata?.avatar_url as string) ?? undefined

    if (!role) {
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('role, full_name, avatar_url')
        .eq('id', user.id)
        .single()

      if (profile) {
        role = profile.role as SessionUser['role']
        if (!name) name = profile.full_name ?? ''
        if (!avatar_url) avatar_url = profile.avatar_url ?? undefined

        // Back-fill app_metadata so this extra query doesn't happen next time
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          app_metadata: { role },
        })
      }
    }

    if (!role) return null

    return { id: user.id, email: user.email!, name, role, avatar_url }
  } catch {
    return null
  }
}

export async function deleteSession() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
}
