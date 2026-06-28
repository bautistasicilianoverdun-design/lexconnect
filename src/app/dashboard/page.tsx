import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  FileText, MessageSquare, Star, Clock, ChevronRight,
  TrendingUp, Plus, AlertCircle, Search, BarChart2,
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

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  open:        { label: 'Activo',     className: 'bg-green-100 text-green-700' },
  in_progress: { label: 'En proceso', className: 'bg-blue-100 text-blue-700' },
  closed:      { label: 'Cerrado',    className: 'bg-slate-100 text-slate-600' },
  archived:    { label: 'Archivado',  className: 'bg-slate-100 text-slate-500' },
}

export default async function DashboardHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isLawyer = profileData?.role === 'lawyer' || profileData?.role === 'firm_admin'

  // Onboarding status for lawyers
  let onboardingDone = true
  if (isLawyer) {
    const { data: lp } = await supabase.from('lawyer_profiles').select('id, videocall_link, verification_status').eq('user_id', user.id).maybeSingle()
    const { data: prof } = await supabase.from('profiles').select('bio, city').eq('id', user.id).single()
    const { count: specCount } = await supabase.from('lawyer_specialties').select('*', { count: 'exact', head: true }).eq('lawyer_id', lp?.id ?? '')
    const hasProfile = !!(prof?.bio && prof?.city)
    const hasSpecialties = (specCount ?? 0) > 0
    onboardingDone = hasProfile && hasSpecialties
  }

  const [
    { count: casesCount },
    { count: proposalsCount },
    { count: favoritesCount },
    { data: conversations },
    { data: recentCases },
    { count: myProposalsCount },
  ] = await Promise.all([
    supabase
      .from('legal_cases')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .eq('status', 'open'),
    supabase
      .from('case_proposals')
      .select('legal_cases!inner(client_id)', { count: 'exact', head: true })
      .eq('legal_cases.client_id', user.id),
    supabase
      .from('client_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id),
    isLawyer
      ? supabase.from('conversations').select('lawyer_unread').eq('lawyer_id', user.id)
      : supabase.from('conversations').select('client_unread').eq('client_id', user.id),
    supabase
      .from('legal_cases')
      .select('id, title, status, proposals_count, created_at, legal_categories!category_id(name)')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
    isLawyer
      ? supabase
          .from('case_proposals')
          .select('*', { count: 'exact', head: true })
          .eq('lawyer_id', user.id)
      : Promise.resolve({ count: 0, data: null, error: null }),
  ])

  const unreadMessages = isLawyer
    ? (conversations as { lawyer_unread: number | null }[] | null)?.reduce((sum, c) => sum + (c.lawyer_unread ?? 0), 0) ?? 0
    : (conversations as { client_unread: number | null }[] | null)?.reduce((sum, c) => sum + (c.client_unread ?? 0), 0) ?? 0
  const newProposals = proposalsCount ?? 0

  // Quick links differ by role
  const quickLinks = isLawyer
    ? [
        {
          href: '/dashboard/mis-propuestas',
          label: 'Mis propuestas',
          desc: myProposalsCount ? `${myProposalsCount} propuestas enviadas` : 'Revisa las propuestas que enviaste',
          icon: TrendingUp,
          color: 'bg-purple-50 text-purple-600',
        },
        {
          href: '/dashboard/casos-disponibles',
          label: 'Casos disponibles',
          desc: 'Encontra nuevos casos para proponer',
          icon: Search,
          color: 'bg-blue-50 text-blue-600',
        },
        {
          href: '/dashboard/mensajes',
          label: 'Mensajes',
          desc: unreadMessages > 0 ? `Tenes ${unreadMessages} mensajes sin leer` : 'Sin mensajes nuevos',
          icon: MessageSquare,
          color: 'bg-orange-50 text-orange-600',
        },
        {
          href: '/dashboard/estadisticas',
          label: 'Estadisticas',
          desc: 'Tu rendimiento en la plataforma',
          icon: BarChart2,
          color: 'bg-green-50 text-green-600',
        },
      ]
    : [
        {
          href: '/dashboard/mis-casos',
          label: 'Ver propuestas recibidas',
          desc: newProposals > 0 ? `Tenes ${newProposals} propuestas de abogados` : 'Revisa las propuestas para tus casos',
          icon: TrendingUp,
          color: 'bg-purple-50 text-purple-600',
        },
        {
          href: '/dashboard/mensajes',
          label: 'Mensajes',
          desc: unreadMessages > 0 ? `Tenes ${unreadMessages} mensajes sin leer` : 'Sin mensajes nuevos',
          icon: MessageSquare,
          color: 'bg-orange-50 text-orange-600',
        },
        {
          href: '/dashboard/favoritos',
          label: 'Abogados favoritos',
          desc: `${favoritesCount ?? 0} abogados guardados`,
          icon: Star,
          color: 'bg-amber-50 text-amber-600',
        },
        {
          href: '/abogados',
          label: 'Buscar abogados',
          desc: 'Encontra el profesional ideal para tu caso',
          icon: FileText,
          color: 'bg-blue-50 text-blue-600',
        },
      ]

  return (
    <div className="space-y-6">
      {isLawyer && !onboardingDone && (
        <div className="bg-blue-600 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-white text-sm">Completá tu perfil para aparecer en los resultados</p>
            <p className="text-blue-100 text-xs mt-0.5">Te faltan algunos pasos para que los clientes puedan encontrarte.</p>
          </div>
          <a
            href="/dashboard/onboarding"
            className="shrink-0 px-4 py-2 bg-white text-blue-700 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors"
          >
            Ver pasos pendientes
          </a>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi panel</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {isLawyer ? 'Segui el estado de tus propuestas y actividad' : 'Segui el estado de tus casos y propuestas'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isLawyer ? (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 mb-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{myProposalsCount ?? 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Propuestas enviadas</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 mb-3">
                <MessageSquare className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{unreadMessages}</p>
              <p className="text-xs text-slate-500 mt-0.5">Mensajes no leidos</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 mb-3">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{casesCount ?? 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Casos activos</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 mb-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{newProposals}</p>
              <p className="text-xs text-slate-500 mt-0.5">Propuestas recibidas</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 mb-3">
                <MessageSquare className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{unreadMessages}</p>
              <p className="text-xs text-slate-500 mt-0.5">Mensajes no leidos</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 mb-3">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{favoritesCount ?? 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Abogados favoritos</p>
            </div>
          </>
        )}
      </div>

      {/* Alert propuestas — solo clientes */}
      {!isLawyer && newProposals > 0 && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-900">
              Tenes {newProposals} {newProposals === 1 ? 'propuesta' : 'propuestas'} de abogados
            </p>
            <p className="text-xs text-blue-700 mt-0.5">Revisalas y elige al profesional que mejor se adapte a tu caso.</p>
          </div>
          <Link href="/dashboard/mis-casos" className="shrink-0 text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1">
            Ver <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent cases — solo clientes */}
        {!isLawyer && (
          <div className="bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Mis casos</h2>
              <div className="flex gap-3">
                <Link href="/casos/nuevo" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                  <Plus className="h-3.5 w-3.5" /> Nuevo
                </Link>
                <Link href="/dashboard/mis-casos" className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  Ver todos <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {recentCases && recentCases.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentCases.map((c) => {
                  const status = STATUS_STYLES[c.status] ?? STATUS_STYLES.open
                  const cat = (Array.isArray(c.legal_categories) ? c.legal_categories[0] : c.legal_categories) as { name: string } | null
                  return (
                    <div key={c.id} className="flex items-start gap-3 p-5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 shrink-0">
                        <FileText className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 line-clamp-1">{c.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                            {status.label}
                          </span>
                          {cat && <span className="text-xs text-slate-400">{cat.name}</span>}
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> {c.proposals_count}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {timeAgo(c.created_at)}
                          </span>
                        </div>
                      </div>
                      <Link href={`/casos/${c.id}`}>
                        <ChevronRight className="h-4 w-4 text-slate-300 hover:text-slate-500 mt-1" />
                      </Link>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-400">
                Todavia no publicaste ningun caso.
              </div>
            )}

            <div className="p-5 pt-2">
              <Link
                href="/casos/nuevo"
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" /> Publicar nuevo caso
              </Link>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="space-y-4">
          {quickLinks.map(({ href, label, desc, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-sm transition-shadow group"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Upgrade CTA — solo para clientes */}
      {!isLawyer && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-white text-center sm:text-left">
            <p className="font-bold text-base">Actualizate a Plan Profesional</p>
            <p className="text-blue-100 text-sm mt-1">Publica casos ilimitados, chat prioritario y acceso a la IA de clasificacion.</p>
          </div>
          <Link
            href="/precios"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm"
          >
            Ver planes <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
