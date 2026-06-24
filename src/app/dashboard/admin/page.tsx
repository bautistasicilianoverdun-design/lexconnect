import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users, FileText, Briefcase, CheckCircle2, Clock,
  XCircle, AlertCircle, TrendingUp, Shield,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} ${days === 1 ? 'dia' : 'dias'}`
}

const VERIFICATION_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-700' },
  verified: { label: 'Verificado', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rechazado', className: 'bg-red-100 text-red-700' },
  suspended: { label: 'Suspendido', className: 'bg-slate-100 text-slate-500' },
}

const CASE_STATUS: Record<string, { label: string; className: string }> = {
  open: { label: 'Abierto', className: 'bg-green-100 text-green-700' },
  in_progress: { label: 'En proceso', className: 'bg-blue-100 text-blue-700' },
  closed: { label: 'Cerrado', className: 'bg-slate-100 text-slate-600' },
  archived: { label: 'Archivado', className: 'bg-slate-100 text-slate-500' },
}

function StatCard({ icon: Icon, label, value, color = 'blue' }: {
  icon: React.ElementType
  label: string
  value: number | string
  color?: 'blue' | 'green' | 'amber' | 'red'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Shield className="h-16 w-16 text-slate-200" />
        <p className="font-semibold text-slate-700">Acceso restringido</p>
        <p className="text-sm text-slate-400">Solo los administradores pueden ver esta pagina.</p>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">Volver al inicio</Link>
      </div>
    )
  }

  // Fetch stats
  const [
    { count: totalUsers },
    { count: totalLawyers },
    { count: pendingLawyers },
    { count: totalCases },
    { count: openCases },
    { count: totalProposals },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('lawyer_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('lawyer_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    supabase.from('legal_cases').select('*', { count: 'exact', head: true }),
    supabase.from('legal_cases').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('case_proposals').select('*', { count: 'exact', head: true }),
  ])

  // Recent data
  const { data: recentLawyers } = await supabase
    .from('lawyer_profiles')
    .select(`
      id, verification_status, created_at, plan,
      profiles!user_id(full_name, city)
    `)
    .order('created_at', { ascending: false })
    .limit(8)

  const { data: recentCases } = await supabase
    .from('legal_cases')
    .select(`
      id, title, status, urgency, created_at, proposals_count,
      profiles!client_id(full_name),
      legal_categories!category_id(name)
    `)
    .order('created_at', { ascending: false })
    .limit(8)

  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, full_name, role, city, created_at')
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel de administracion</h1>
        <p className="text-sm text-slate-500 mt-0.5">Vista general de la plataforma LexConnect AR</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Usuarios totales" value={totalUsers ?? 0} color="blue" />
        <StatCard icon={Briefcase} label="Abogados registrados" value={totalLawyers ?? 0} color="green" />
        <StatCard icon={AlertCircle} label="Abogados pendientes" value={pendingLawyers ?? 0} color="amber" />
        <StatCard icon={FileText} label="Casos publicados" value={totalCases ?? 0} color="blue" />
        <StatCard icon={TrendingUp} label="Casos abiertos" value={openCases ?? 0} color="green" />
        <StatCard icon={CheckCircle2} label="Propuestas enviadas" value={totalProposals ?? 0} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent lawyers */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Abogados recientes</h2>
            {(pendingLawyers ?? 0) > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                {pendingLawyers} pendientes
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {recentLawyers?.map((lawyer) => {
              const p = (Array.isArray(lawyer.profiles) ? lawyer.profiles[0] : lawyer.profiles) as { full_name: string; city: string | null } | null
              const status = VERIFICATION_STATUS[lawyer.verification_status] ?? VERIFICATION_STATUS.pending
              return (
                <div key={lawyer.id} className="px-6 py-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">
                    {p?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{p?.full_name ?? 'Sin nombre'}</p>
                    <p className="text-xs text-slate-400">{p?.city ?? ''} · {timeAgo(lawyer.created_at)}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${status.className}`}>
                    {status.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent cases */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Casos recientes</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {recentCases?.map((c) => {
              const client = (Array.isArray(c.profiles) ? c.profiles[0] : c.profiles) as { full_name: string } | null
              const cat = (Array.isArray(c.legal_categories) ? c.legal_categories[0] : c.legal_categories) as { name: string } | null
              const status = CASE_STATUS[c.status] ?? CASE_STATUS.open
              return (
                <div key={c.id} className="px-6 py-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-1 flex-1">{c.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
                    {client && <span>{client.full_name}</span>}
                    {cat && <span>{cat.name}</span>}
                    <span>{c.proposals_count} propuestas</span>
                    <span>{timeAgo(c.created_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Usuarios recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Ciudad</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentUsers?.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-900">{u.full_name}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'lawyer' ? 'bg-blue-100 text-blue-700'
                      : u.role === 'admin' ? 'bg-purple-100 text-purple-700'
                      : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role === 'lawyer' ? 'Abogado' : u.role === 'admin' ? 'Admin' : u.role === 'firm_admin' ? 'Estudio' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500">{u.city ?? '—'}</td>
                  <td className="px-6 py-3 text-slate-400">{timeAgo(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
