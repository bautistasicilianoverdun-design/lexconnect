'use server'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

// ------------------------------------------------------------------
// Close a case and trigger mutual review window
// ------------------------------------------------------------------
export async function closeCase(caseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verify user is the client of this case
  const { data: caso } = await supabase
    .from('legal_cases')
    .select('id, title, client_id, status')
    .eq('id', caseId)
    .eq('client_id', user.id)
    .single()

  if (!caso) return { error: 'Caso no encontrado' }
  if (caso.status === 'closed') return { error: 'El caso ya está cerrado' }

  // Get accepted proposal to find the lawyer
  const { data: proposal } = await supabase
    .from('case_proposals')
    .select('lawyer_id, lawyer_profiles!lawyer_id(user_id, profiles!user_id(full_name))')
    .eq('case_id', caseId)
    .eq('status', 'accepted')
    .maybeSingle()

  const lawyerProfileData = proposal?.lawyer_profiles
  const lawyerProfile = Array.isArray(lawyerProfileData) ? lawyerProfileData[0] : lawyerProfileData
  const lawyerUserId = lawyerProfile?.user_id ?? null
  const lawyerProfilesData = lawyerProfile?.profiles
  const lawyerProfileInfo = Array.isArray(lawyerProfilesData) ? lawyerProfilesData[0] : lawyerProfilesData
  const lawyerName = (lawyerProfileInfo as { full_name: string } | null)?.full_name ?? 'el abogado'

  // Close the case
  await supabase
    .from('legal_cases')
    .update({ status: 'closed' })
    .eq('id', caseId)
    .eq('client_id', user.id)

  const revealDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  // Notify client to review lawyer
  await createNotification({
    userId: user.id,
    type: 'review',
    title: 'Califica tu experiencia',
    body: `El caso "${caso.title}" fue cerrado. Tenes 7 días para calificar a ${lawyerName}.`,
    link: '/dashboard/valoraciones',
  })

  // Notify lawyer to review client (if lawyer exists)
  if (lawyerUserId) {
    await createNotification({
      userId: lawyerUserId,
      type: 'review',
      title: 'Califica al cliente',
      body: `El caso "${caso.title}" fue cerrado. Tenes 7 días para calificar al cliente.`,
      link: '/dashboard/valoraciones',
    })
  }

  revalidatePath('/dashboard/mis-casos')
  return { success: true, revealDeadline, lawyerUserId }
}

// ------------------------------------------------------------------
// Submit a review
// ------------------------------------------------------------------
export async function submitReview({
  caseId,
  revieweeId,
  reviewerRole,
  lawyerId,
  rating,
  comment,
  ratingCommunication,
  ratingExpertise,
  ratingValue,
  ratingResponsiveness,
}: {
  caseId: string
  revieweeId: string
  reviewerRole: 'client' | 'lawyer'
  lawyerId?: string | null
  rating: number
  comment: string
  ratingCommunication?: number
  ratingExpertise?: number
  ratingValue?: number
  ratingResponsiveness?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Check case is closed
  const { data: caso } = await supabase
    .from('legal_cases')
    .select('status, title')
    .eq('id', caseId)
    .single()

  if (!caso || caso.status !== 'closed') {
    return { error: 'Solo se puede valorar casos cerrados' }
  }

  // Check if user already reviewed this case
  const { data: existing } = await supabase
    .from('reviews')
    .select('id, is_locked')
    .eq('case_id', caseId)
    .eq('reviewer_id', user.id)
    .maybeSingle()

  if (existing?.is_locked) {
    return { error: 'La valoración ya fue bloqueada y no puede modificarse' }
  }

  const revealDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  if (existing) {
    // Update existing
    await supabase
      .from('reviews')
      .update({
        rating,
        comment,
        rating_communication: ratingCommunication ?? null,
        rating_expertise: ratingExpertise ?? null,
        rating_value: ratingValue ?? null,
        rating_responsiveness: ratingResponsiveness ?? null,
      })
      .eq('id', existing.id)
  } else {
    // Insert new
    await supabase
      .from('reviews')
      .insert({
        case_id: caseId,
        reviewer_id: user.id,
        reviewer_role: reviewerRole,
        reviewee_id: revieweeId,
        lawyer_id: lawyerId ?? null,
        rating,
        comment,
        rating_communication: ratingCommunication ?? null,
        rating_expertise: ratingExpertise ?? null,
        rating_value: ratingValue ?? null,
        rating_responsiveness: ratingResponsiveness ?? null,
        is_revealed: false,
        is_locked: false,
        is_visible: false,
        reveal_deadline: revealDeadline,
      })
  }

  // Try to reveal both reviews if partner already submitted
  await supabase.rpc('reveal_mutual_reviews', { p_case_id: caseId })

  // Also lock expired reviews
  await supabase.rpc('lock_expired_reviews')

  revalidatePath('/dashboard/valoraciones')
  return { success: true }
}

// ------------------------------------------------------------------
// Fetch pending reviews for current user
// ------------------------------------------------------------------
export async function getPendingReviews() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get closed cases where user is involved and hasn't reviewed yet
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isLawyer = profile?.role === 'lawyer' || profile?.role === 'firm_admin'

  // Cases where user already reviewed
  const { data: myReviews } = await supabase
    .from('reviews')
    .select('case_id')
    .eq('reviewer_id', user.id)

  const reviewedCaseIds = (myReviews ?? []).map(r => r.case_id).filter(Boolean) as string[]

  if (isLawyer) {
    // Lawyer: closed cases where their proposal was accepted
    const { data: proposals } = await supabase
      .from('case_proposals')
      .select(`
        case_id,
        legal_cases!case_id(id, title, client_id, status, profiles!client_id(full_name))
      `)
      .eq('status', 'accepted')

    return (proposals ?? [])
      .map(p => {
        const caseData = Array.isArray(p.legal_cases) ? p.legal_cases[0] : p.legal_cases
        return caseData
      })
      .filter(c => c && c.status === 'closed' && !reviewedCaseIds.includes(c.id))
  } else {
    // Client: their closed cases
    const { data: cases } = await supabase
      .from('legal_cases')
      .select(`
        id, title, client_id, status,
        case_proposals!case_id(
          lawyer_id,
          lawyer_profiles!lawyer_id(user_id, profiles!user_id(full_name))
        )
      `)
      .eq('client_id', user.id)
      .eq('status', 'closed')

    return (cases ?? []).filter(c => !reviewedCaseIds.includes(c.id))
  }
}
