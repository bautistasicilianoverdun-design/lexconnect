import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminVerificationTable } from '@/components/dashboard/admin-verification-table'
import { AdminUsersTable } from '@/components/dashboard/admin-users-table'
import { AdminCasesTable } from '@/components/dashboard/admin-cases-table'
import { AdminSubscriptionsTable } from '@/components/dashboard/admin-subscriptions-table'

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

  // Parallel queries for all data
  const [
    { count: totalUsers },
    { count: totalLawyers },
    { count: totalClients },
    { count: totalCases },
    { count: totalProposals },
    { count: activeSubs },
    { data: verifications },
    { data: users },
    { data: cases },
    { data: subscriptions },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'lawyer'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('legal_cases').select('*', { count: 'exact', head: true }),
    supabase.from('case_proposals').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('lawyer_profiles').select(`
      id, verification_status, verification_notes, bar_association,
      matricula_tomo, matricula_folio, verification_submitted_at,
      verification_documents, profiles!user_id(full_name)
    `).in('verification_status', ['pending', 'rejected', 'verified'])
      .order('verification_submitted_at', { ascending: false, nullsFirst: false })
      .limit(100),
    supabase.from('profiles').select('id, full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.from('legal_cases').select(`
      id, title, status, urgency, created_at, proposals_count, views_count,
      legal_categories!category_id(name),
      profiles!client_id(full_name)
    `).order('created_at', { ascending: false }).limit(50),
    supabase.from('subscriptions').select(`
      id, plan_type, status, amount, current_period_end, created_at,
      profiles!user_id(full_name)
    `).order('created_at', { ascending: false }).limit(50),
  ])

  const pendingVerif = verifications?.filter(v => v.verification_status === 'pending').length ?? 0
  const verifiedVerif = verifications?.filter(v => v.verification_status === 'verified').length ?? 0

  const stats = [
    { label: 'Usuarios totales', value: totalUsers ?? 0, color: '#1F6C9F' },
    { label: 'Abogados', value: totalLawyers ?? 0, color: '#346538' },
    { label: 'Clientes', value: totalClients ?? 0, color: '#956400' },
    { label: 'Casos publicados', value: totalCases ?? 0, color: '#6B21A8' },
    { label: 'Propuestas', value: totalProposals ?? 0, color: '#9F2F2D' },
    { label: 'Suscripciones activas', value: activeSubs ?? 0, color: '#346538' },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel de administracion</h1>
        <p className="text-sm text-slate-500 mt-1">Vision general de la plataforma</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-[#EAEAEA] rounded-xl p-4">
            <p className="text-2xl font-bold text-slate-900">{s.value.toLocaleString('es-AR')}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Verificaciones pendientes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Verificaciones de matricula
          </h2>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#FBF3DB', color: '#956400' }}>
              {pendingVerif} pendientes
            </span>
            <span className="px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#EDF3EC', color: '#346538' }}>
              {verifiedVerif} verificados
            </span>
          </div>
        </div>
        <AdminVerificationTable records={verifications ?? []} />
      </div>

      {/* Usuarios */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Usuarios recientes</h2>
        <AdminUsersTable users={users ?? []} />
      </div>

      {/* Casos */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Casos recientes</h2>
        <AdminCasesTable cases={cases ?? []} />
      </div>

      {/* Suscripciones */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Suscripciones</h2>
        <AdminSubscriptionsTable subscriptions={subscriptions ?? []} />
      </div>
    </div>
  )
}
