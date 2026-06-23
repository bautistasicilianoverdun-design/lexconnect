'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    // 1. Limpiar datos de la app via RPC
    const { error: dataError } = await supabase.rpc('delete_user_data')
    if (dataError) return { success: false, error: `Error limpiando datos: ${dataError.message}` }

    // 2. Verificar que la service role key está configurada
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) return { success: false, error: 'Configuración del servidor incompleta (SERVICE_ROLE_KEY)' }

    // 3. Eliminar de Supabase Auth via Admin API
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    )
    const { error: adminError } = await adminClient.auth.admin.deleteUser(user.id)
    if (adminError) return { success: false, error: `Error eliminando cuenta: ${adminError.message}` }

    // 4. Sign out server-side (limpia cookie). Puede fallar si el usuario ya no existe.
    try { await supabase.auth.signOut() } catch {}

    return { success: true }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error inesperado'
    return { success: false, error: msg }
  }
}
