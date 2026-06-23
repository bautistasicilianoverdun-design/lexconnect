'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // 1. Borrar datos de la app (mensajes, conversaciones, reviews, reportes)
  const { error: dataError } = await supabase.rpc('delete_user_data')
  if (dataError) return { success: false, error: dataError.message }

  // 2. Usar Admin API para borrar correctamente de Supabase Auth
  //    (limpia estado interno, rate limits, e identities — DELETE directo a auth.users no lo hace)
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: adminError } = await adminClient.auth.admin.deleteUser(user.id)
  if (adminError) return { success: false, error: adminError.message }

  // Sign out server-side (clears cookie). Ignore errors — user is already deleted.
  try { await supabase.auth.signOut() } catch {}

  return { success: true }
}
