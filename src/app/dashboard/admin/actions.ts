'use server'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

export async function updateVerificationStatus(
  lawyerProfileId: string,
  status: 'verified' | 'rejected' | 'pending',
  note: string,
) {
  const supabase = await createClient()

  // Auth check — only admins
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (p?.role !== 'admin') return { error: 'Sin permisos' }

  // Update status
  const { error } = await supabase
    .from('lawyer_profiles')
    .update({ verification_status: status, verification_notes: note })
    .eq('id', lawyerProfileId)

  if (error) return { error: error.message }

  // Get lawyer user_id to notify
  const { data: lp } = await supabase
    .from('lawyer_profiles')
    .select('user_id')
    .eq('id', lawyerProfileId)
    .single()

  if (lp?.user_id) {
    if (status === 'verified') {
      await createNotification({
        userId: lp.user_id,
        type: 'system',
        title: '¡Tu matrícula fue verificada!',
        body: 'Tu matrícula profesional fue verificada exitosamente. Ya aparecés con el sello de verificación en tu perfil.',
        link: '/dashboard/perfil',
      })
    } else if (status === 'rejected') {
      await createNotification({
        userId: lp.user_id,
        type: 'system',
        title: 'Verificación de matrícula rechazada',
        body: note || 'Tu solicitud de verificación fue rechazada. Revisá los datos ingresados.',
        link: '/dashboard/verificacion',
      })
    } else if (status === 'pending') {
      await createNotification({
        userId: lp.user_id,
        type: 'system',
        title: 'Solicitud de verificación reabierta',
        body: 'Tu solicitud de verificación fue puesta nuevamente en revisión.',
        link: '/dashboard/verificacion',
      })
    }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function setUserSuspended(
  userId: string,
  suspended: boolean,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }
  const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (p?.role !== 'admin') return { success: false, error: 'Sin permisos' }

  const { error } = await supabase
    .from('profiles')
    .update({ suspended })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function setUserRole(
  userId: string,
  role: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }
  const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (p?.role !== 'admin') return { success: false, error: 'Sin permisos' }

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/admin')
  return { success: true }
}
