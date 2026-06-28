'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { error: dataError } = await supabase.rpc('delete_user_data')
    if (dataError) return { success: false, error: `Error limpiando datos: ${dataError.message}` }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) return { success: false, error: 'Configuración del servidor incompleta (SERVICE_ROLE_KEY)' }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    )
    const { error: adminError } = await adminClient.auth.admin.deleteUser(user.id)
    if (adminError) return { success: false, error: `Error eliminando cuenta: ${adminError.message}` }

    try { await supabase.auth.signOut() } catch {}
    return { success: true }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error inesperado'
    return { success: false, error: msg }
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return { success: false, error: 'No autenticado' }

    // Verify current password by signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })
    if (signInError) return { success: false, error: 'La contraseña actual es incorrecta' }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) return { success: false, error: updateError.message }

    return { success: true }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error inesperado'
    return { success: false, error: msg }
  }
}

export async function saveNotificationPrefs(prefs: {
  notify_proposals: boolean
  notify_messages: boolean
  notify_system: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { error } = await supabase
      .from('profiles')
      .update(prefs)
      .eq('id', user.id)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error inesperado'
    return { success: false, error: msg }
  }
}

export async function savePrivacyPrefs(prefs: {
  profile_public: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { error } = await supabase
      .from('profiles')
      .update(prefs)
      .eq('id', user.id)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error inesperado'
    return { success: false, error: msg }
  }
}
