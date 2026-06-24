'use server'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'

export async function sendProposal({
  caseId,
  lawyerProfileId,
  message,
}: {
  caseId: string
  lawyerProfileId: string
  message: string
}) {
  const supabase = await createClient()

  const { error } = await supabase.from('case_proposals').insert({
    case_id: caseId,
    lawyer_id: lawyerProfileId,
    message,
    fee_type: 'to_discuss',
    status: 'pending',
  })

  if (error) return { error: error.message }

  // Notificar al cliente dueño del caso
  const { data: caseData } = await supabase
    .from('legal_cases')
    .select('title, client_id')
    .eq('id', caseId)
    .single()

  const { data: lawyerData } = await supabase
    .from('lawyer_profiles')
    .select('profiles!user_id(full_name)')
    .eq('id', lawyerProfileId)
    .single()

  const profiles = lawyerData?.profiles
  const lawyerName =
    (Array.isArray(profiles) ? profiles[0]?.full_name : (profiles as { full_name: string } | null | undefined)?.full_name) ?? 'Un abogado'

  if (caseData?.client_id) {
    await createNotification({
      userId: caseData.client_id,
      type: 'proposal',
      title: 'Nueva propuesta recibida',
      body: `${lawyerName} envió una propuesta para tu caso: "${c