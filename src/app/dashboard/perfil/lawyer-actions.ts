'use server'

import { createClient } from '@/lib/supabase/server'

export type LawyerProfilePayload = {
  license_number: string
  license_province_id: number | null
  university: string
  graduation_year: number | null
  response_time_hours: number | null
  accepts_new_clients: boolean
  specialties: Array<{ category_id: string; is_primary: boolean; years_experience: number | null }>
}

export async function saveLawyerProfile(
  payload: LawyerProfilePayload,
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'not_authenticated' }

  // lawyer_profiles.id is auto-UUID; user's auth ID goes in user_id column
  const { data: lpData, error: lpError } = await supabase
    .from('lawyer_profiles')
    .update({
      license_number: payload.license_number,
      license_province_id: payload.license_province_id || null,
      university: payload.university || null,
      graduation_year: payload.graduation_year || null,
      response_time_hours: payload.response_time_hours || null,
      accepts_new_clients: payload.accepts_new_clients,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select('id')
    .single()

  if (lpError) return { success: false, error: lpError.message }
  if (!lpData) return { success: false, error: 'Perfil de abogado no encontrado' }

  const lawyerProfileId = lpData.id

  // lawyer_specialties.lawyer_id references lawyer_profiles(id), not auth.uid()
  await supabase.from('lawyer_specialties').delete().eq('lawyer_id', lawyerProfileId)

  if (payload.specialties.length > 0) {
    const { error: specError } = await supabase
      .from('lawyer_specialties')
      .insert(
        payload.specialties.map((s) => ({
          lawyer_id: lawyerProfileId,
          category_id: s.category_id,
          is_primary: s.is_primary,
          years_experience: s.years_experience,
        })),
      )
    if (specError) return { success: false, error: specError.message }
  }

  return { success: true }
}
