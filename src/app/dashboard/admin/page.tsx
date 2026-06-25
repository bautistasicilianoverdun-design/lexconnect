import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminVerificationTable } from '@/components/dashboard/admin-verification-table'

export const metadata = { title: 'Administracion — LexConnect' }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch all lawyer profiles pending verification or recently verified/rejected
  const { data: pending } = await supabase
    .from('lawyer_profiles')
    .select(`
      id, verification_status, verification_notes, bar_association,
      matricula_tomo, matricula_folio, verification_submitted_at,
      verification_documents,
      profiles!user_id(full_name, email)
    `)
    .in('verification_status', ['pending', 'rejected', 'verified'])
    .order('verification_submitted_at', { ascending: false, nullsFirst: false })
    .limit(100)

  // Stats
  const pendingCount = pending?.filter(p => p.verification_status === 'pending').length ?? 0
  const verifiedCount = pending?.filter(p => p.verification_status === 'verified').length ?? 0
  const rejectedCount = pending?.filter(p => p.verification_status === 'rejected').length ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel de administracion</h1>
        <p className="text-sm text-slate-500 mt-1">Revision de matriculas y verificaciones de abogados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pendientes', value: pendingCount, bg: '#FBF3DB', text: '#956400' },
          { label: 'Verificados', value: verifiedCount, bg: '#EDF3EC', text: '#346538' },
          { label: 'Rechazados', value: rejectedCount, bg: '#FDEBEC', text: '#9F2F2D' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#EAEAEA] rounded-xl p-5">
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: s.text }}
              />
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <AdminVerificationTable records={pending ?? []} />
    </div>
  )
}
