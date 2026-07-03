'use server'

import { createClient } from '@/lib/supabase/server'
import { classifyCase } from '@/lib/ai/classify-case'

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
  preferredLawyerSlug?: string
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

  const { data: inserted, error } = await supabase
    .from('legal_cases')
    .insert({
      client_id:   user.id,
      title:       payload.title.trim(),
      description: payload.description.trim(),
      category_id: cat?.id ?? null,
      province_id: prov?.id ?? null,
      urgency:     payload.urgency,
      visibility:  payload.visibility,
      status:      'open',
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  // AI classification — runs after insert, failure doesn't block publish
  if (inserted?.id && process.env.OPENAI_API_KEY) {
    const classification = await classifyCase({
      title:       payload.title.trim(),
      description: payload.description.trim(),
      urgency:     payload.urgency,
    })

    if (classification) {
      const { data: aiCat } = await supabase
        .from('legal_categories')
        .select('id')
        .eq('slug', classification.category_slug)
        .maybeSingle()

      await supabase
        .from('legal_cases')
        .update({
          ai_category_id: aiCat?.id ?? null,
          ai_urgency:     classification.urgency,
          ai_summary:     classification.summary,
        })
        .eq('id', inserted.id)
    }
  }

  // Notificar al abogado preferido si se pasó un slug
  if (inserted?.id && payload.preferredLawyerSlug) {
    const { data: lp } = await supabase
      .from('lawyer_profiles')
      .select('user_id, profiles!user_id(full_name)')
      .eq('slug', payload.preferredLawyerSlug)
      .maybeSingle()

    if (lp?.user_id) {
      await supabase.from('notifications').insert({
        user_id: lp.user_id,
        type:    'new_case',
        title:   'Un cliente te eligió para su caso',
        body:    `"${payload.title.trim()}" — revisalo en Casos disponibles`,
        link:    `/casos/${inserted.id}`,
      })
    }
  }

  return { success: true }
}
