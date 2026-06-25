'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'

export async function startConversation(caseId: string, lawyerProfileId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const { data: lp } = await supabase
    .from('lawyer_profiles')
    .select('user_id')
    .eq('id', lawyerProfileId)
    .single()

  if (!lp) redirect('/dashboard/mensajes')

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('case_id', caseId)
    .eq('client_id', user.id)
    .eq('lawyer_id', lp.user_id)
    .maybeSingle()

  if (existing) redirect(`/dashboard/mensajes?conv=${existing.id}`)

  const { data: created } = await supabase
    .from('conversations')
    .insert({ case_id: caseId, client_id: user.id, lawyer_id: lp.user_id })
    .select('id')
    .single()

  redirect(`/dashboard/mensajes?conv=${created?.id ?? ''}`)
}

export async function acceptProposal(
  caseId: string,
  proposalId: string,
  lawyerProfileId: string,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  // Accept selected proposal
  await supabase
    .from('case_proposals')
    .update({ status: 'accepted' })
    .eq('id', proposalId)

  // Reject remaining pending proposals for this case
  await supabase
    .from('case_proposals')
    .update({ status: 'rejected' })
    .eq('case_id', caseId)
    .eq('status', 'pending')
    .neq('id', proposalId)

  // Move case to in_progress
  await supabase
    .from('legal_cases')
    .update({ status: 'in_progress' })
    .eq('id', caseId)
    .eq('client_id', user.id)

  // Notificar al abogado que su propuesta fue aceptada
  const { data: caseData } = await supabase
    .from('legal_cases')
    .select('title')
    .eq('id', caseId)
    .single()

  const { data: lp } = await supabase
    .from('lawyer_profiles')
    .select('user_id')
    .eq('id', lawyerProfileId)
    .single()

  if (lp?.user_id && caseData?.title) {
    await createNotification({
      userId: lp.user_id,
      type: 'proposal',
      title: '¡Tu propuesta fue aceptada!',
      body: `El cliente aceptó tu propuesta para el caso: "${caseData.title}"`,
      link: '/dashboard/mensajes',
    })
  }

  // Create or find conversation with accepted lawyer

  if (lp) {
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('case_id', caseId)
      .eq('client_id', user.id)
      .eq('lawyer_id', lp.user_id)
      .maybeSingle()

    const convId = existing?.id ?? (
      await supabase
        .from('conversations')
        .insert({ case_id: caseId, client_id: user.id, lawyer_id: lp.user_id })
        .select('id')
        .single()
    ).data?.id

    if (convId) redirect(`/dashboard/mensajes?conv=${convId}`)
  }

  redirect('/dashboard/mis-casos')
}

export async function rejectProposal(proposalId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('case_proposals')
    .update({ status: 'rejected' })
    .eq('id', proposalId)

  revalidatePath('/dashboard/mis-casos')
}

export async function closeCaseAction(caseId: string) {
  const { closeCase } = await import('@/lib/reviews')
  return closeCase(caseId)
}
