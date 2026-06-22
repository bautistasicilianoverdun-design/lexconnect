'use server'

import { createClient } from '@/lib/supabase/server'

type PublishResult =
  | { success: true }
  | { success: false; error: string }

export async function publishCase(payload: {
  title: string
  description: string
  category: string
  province: string
  urgency: string
  visibility: string
}): Promise<PublishResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'not_authenticated' }

  // Garantizar que el perfil existe (el trigger puede no haber corrido)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!existingProfile) {
    const fullName =
      (user.user_metadata?.full_name as string | undefined) ||
      [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(' ') ||
      user.email?.split('@')[0] ||
      'Usuario'

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: user.id, full_name: fullName, role: 'client' })

    if (profileError) return { success: false, error: profileError.message }
  }

  const [{ data: cat }, { data: prov }] = await Promise.all([
    supabase.from('legal_categories').select('id').eq('slug', payload.category).maybeSingle(),
    supabase.from('provinces').select('id').eq('name', payload.province).maybeSingle(),
  ])

  const { error } = await supabase.from('legal_cases').insert({
    client_id:   user.id,
    title:       payload.title.trim(),
    description: payload.description.trim(),
    category_id: cat?.id ?? null,
    province_id: prov?.id ?? null,
    urgency:     payload.urgency,
    visibility:  payload.visibility,
    status:      'open',
  })

  if (error) return { success: false, error: error.message }

  return { success: true }
}
