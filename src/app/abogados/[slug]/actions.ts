'use server'

import { createClient } from '@/lib/supabase/server'

export async function checkFavorite(lawyerProfileId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('client_favorites')
    .select('client_id')
    .eq('client_id', user.id)
    .eq('lawyer_id', lawyerProfileId)
    .maybeSingle()

  return !!data
}

export async function toggleFavorite(
  lawyerProfileId: string,
  currentlySaved: boolean,
): Promise<{ saved: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { saved: false, error: 'not_authenticated' }

  if (currentlySaved) {
    await supabase
      .from('client_favorites')
      .delete()
      .eq('client_id', user.id)
      .eq('lawyer_id', lawyerProfileId)
    return { saved: false }
  }

  // Garantizar que el perfil existe antes de insertar
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('id', user.id).maybeSingle()

  if (!profile) {
    const fullName =
      (user.user_metadata?.full_name as string | undefined) ||
      user.email?.split('@')[0] ||
      'Usuario'
    await supabase.from('profiles').insert({ id: user.id, full_name: fullName, role: 'client' })
  }

  const { error } = await supabase
    .from('client_favorites')
    .insert({ client_id: user.id, lawyer_id: lawyerProfileId })

  if (error) return { saved: false, error: error.message }
  return { saved: true }
}
