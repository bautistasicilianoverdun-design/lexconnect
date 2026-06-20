import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  FileText, MessageSquare, Star, Clock, ChevronRight,
  TrendingUp, Plus, Eye, AlertCircle,
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
  return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  open: { label: 'Activo', className: 'bg-green-100 text-green-700' },
  in_progress: { label: 'En proceso', className: 'bg-blue-100 text-blue-700' },
  closed: { label: 'Cerrado', className: 'bg-slate-100 text-slate-600' },
  archived: { label: 'Archivado', className: 'bg-slate-100 text-slate-500' },
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export default async function DashboardHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const [
    { count: casesCount },
    { count: proposalsCount },
    { count: favoritesCount },
    { data: conversations },
    { data: recentCases },
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
    supabase
      .from('conversations')
      .select('client_unread')
      .eq('client_id', user.id),
    supabase
      .from('legal_cases')
      .select('id, title, status, proposals_count, created_at, legal_categories(name)')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const unreadMessages = conversations?.reduce((sum, c) => sum + (c.client_unread ?? 0), 0) ?? 0
  const newProposals = (proposalsCount ?? 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi panel</h1>
        <p className="text-sm text-slate-500 mt-0.5">Seguí el estado de tus casos y propuestas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Casos activos', value: casesCount ?? 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Propuestas recibidas', value: newProposals, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Mensajes no leídos', value: unreadMessages, icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Abogados favoritos', value: favoritesCount ?? 0, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Alert when proposals exist */}
      {newProposals > 0 && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-900">
              Tenés {newProposals} {newProposals === 1 ? 'propuesta' : 'propuestas'} de abogados
            </p>
            <p className="text-xs text-blue-700 mt-0.5">Revisalas y elegí al profesional que mejor se adapte a tu caso.</p>
          </div>
          <Link href="/dashboard/mis-casos" className="shrink-0 text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1">
            Ver <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent cases */}
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
                          <Eye className="h-3 w-3" /> {c.proposals_count}
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
              Todavía no publicaste ningún caso.
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

        {/* Quick links */}
        <div className="space-y-4">
          {[
            {
              href: '/dashboard/mis-casos',
              label: 'Ver mis propuestas',
              desc: 'Revisá las propuestas de abogados para tus casos',
              icon: TrendingUp,
              color: 'bg-purple-50 text-purple-600',
            },
            {
              href: '/dashboard/mensajes',
              label: 'Mensajes',
              desc: unreadMessages > 0 ? `Tenés ${unreadMessages} mensajes sin leer` : 'Sin mensajes nuevos',
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
              desc: 'Encontrá el profesional ideal para tu caso',
              icon: FileText,
              color: 'bg-blue-50 text-blue-600',
            },
          ].map(({ href, label, desc, icon: Icon, color }) => (
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

      {/* Upgrade CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 text-white text-center sm:text-left">
          <p className="font-bold text-base">Actualizá a Plan Profesional</p>
          <p className="text-blue-100 text-sm mt-1">Publicá casos ilimitados, chat prioritario y acceso a la IA de clasificación.</p>
        </div>
        <Link
          href="/precios"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm"
        >
          Ver planes <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
