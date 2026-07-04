import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VerificationForm } from '@/components/dashboard/verification-form'

export const metadata = { title: 'Verificación de matrícula — LexConnect' }

export default async function VerificacionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'lawyer') redirect('/dashboard')

  const { data: lp } = await supabase
    .from('lawyer_profiles')
    .select(
      'id, verification_status, verification_notes, bar_association, matricula_tomo, matricula_folio, verification_submitted_at, verification_documents'
    )
    .eq('user_id', user.id)
    .single()

  // Extract last name from full_name
  const lastName = profile?.full_name?.split(' ')[0] ?? ''

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verificación de matrícula</h1>
        <p className="text-sm text-slate-500 mt-1">
          Verificamos tu matrícula contra el directorio oficial del colegio de abogados correspondiente.
        </p>
      </div>

      <VerificationForm
        lawyerProfileId={lp?.id ?? null}
        userId={user.id}
        lastName={lastName}
        currentStatus={(lp?.verification_status as string) ?? 'pending'}
        currentNotes={lp?.verification_notes ?? null}
        currentBarAssociation={lp?.bar_association ?? null}
        currentTomo={lp?.matricula_tomo ?? null}
        currentFolio={lp?.matricula_folio ?? null}
        submittedAt={lp?.verification_submitted_at ?? null}
        existingDocuments={(lp?.verification_documents as string[]) ?? []}
      />
    </div>
  )
}
