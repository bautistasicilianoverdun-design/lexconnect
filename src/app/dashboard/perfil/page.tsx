import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/dashboard/profile-form'
import LawyerProfileForm, { type LawyerProfileData, type Category } from '@/components/dashboard/lawyer-profile-form'
import {
  FileText, MessageSquare, Clock, ChevronRight,
  Eye, Plus, MapPin,
} from 'lucide-react'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'Ahora'
  if (mins < 60) return `Hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  open: { label: 'Recibiendo propuestas', className: 'bg-green-100 text-green-700' },
  in_progress: { label: 'En proceso', className: 'bg-blue-100 text-blue-700' },
  closed: { label: 'Cerrado', className: 'bg-slate-100 text-slate-600' },
  archived: { label: 'Archivado', className: 'bg-slate-100 text-slate-500' },
}

const AVATAR_COLORS = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-500', 'bg-rose-600']
function avatarColor(id: string) {
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const [
    { data: profile },
    { data: cases, count: casesCount },
    { count: proposalsCount },
    { data: conversations },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, phone, bio, city, province_id, role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('legal_cases')
      .select('id, title, status, proposals_count, views_count, created_at, legal_categories!category_id(name), provinces!province_id(name)', { count: 'exact' })
      .eq('client_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('case_proposals')
      .select('legal_cases!inner(client_id)', { count: 'exact', head: true })
      .eq('legal_cases.client_id', user.id),
    supabase
      .from('conversations')
      .select(`
        id, last_message_at, client_unread, lawyer_unread,
        client:profiles!client_id(id, full_name),
        lawyer:profiles!lawyer_id(id, full_name),
        legal_cases(title)
      `)
      .or(`client_id.eq.${user.id},lawyer_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })
      .limit(10),
  ])

  if (!profile) redirect('/iniciar-sesion')

  const isClient = profile.role === 'client'
  const isLawyer = profile.role === 'lawyer' || profile.role === 'firm_admin'

  let lawyerProfileData: LawyerProfileData | null = null
  let categories: Category[] = []

  if (isLawyer) {
    const [{ data: lp }, { data: cats }] = await Promise.all([
      supabase
        .from('lawyer_profiles')
        .select('id, license_number, license_province_id, university, graduation_year, response_time_hours, accepts_new_clients, videocall_link, lawyer_specialties(category_id, is_primary, years_experience)')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('legal_categories')
        .select('id, name')
        .order('name'),
    ])

    if (lp) {
      const specialties = (Array.isArray(lp.lawyer_specialties) ? lp.lawyer_specialties : []) as Array<{
        category_id: string; is_primary: boolean; years_experience: number | null
      }>
      lawyerProfileData = {
        license_number: lp.license_number ?? null,
        license_province_id: lp.license_province_id ?? null,
        university: lp.university ?? null,
        graduation_year: lp.graduation_year ?? null,
        response_time_hours: lp.response_time_hours ?? null,
        accepts_new_clients: lp.accepts_new_clients ?? true,
        videocall_link: (lp as any).videocall_link ?? null,
        specialties,
      }
    }
    categories = (cats as Category[] | null) ?? []
  }

  // Resolve the "other person" in each conversation
  const convList = (conversations ?? []).map((row: any) => {
    const isMyClient = row.client?.id === user.id
    const other = isMyClient ? row.lawyer : row.client
    const unread = isMyClient ? (row.client_unread ?? 0) : (row.lawyer_unread ?? 0)
    return {
      id: row.id,
      otherName: other?.full_name ?? 'Usuario',
      otherId: other?.id ?? row.id,
      caseTitle: row.legal_cases?.title ?? null,
      lastMessageAt: row.last_message_at,
      unread,
    }
  })

  return (
    <div className="max-w-3xl space-y-8">
      {/* Profile form */}
      <ProfileForm
        profile={{
          ...profile,
          email: user.email ?? '',
          cases_count: casesCount ?? 0,
          proposals_count: proposalsCount ?? 0,
        }}
      />

      {/* Perfil profesional — solo abogados */}
      {isLawyer && (
        <LawyerProfileForm
          lawyerProfile={lawyerProfileData}
          categories={categories}
        />
      )}

      {/* Casos publicados — solo clientes */}
      {isClient && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Casos publicados</h2>
            <Link
              href="/casos/nuevo"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Nuevo caso
            </Link>
          </div>

          {!cases || cases.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <FileText className="h-10 w-10 mx-auto text-slate-200 mb-3" />
              <p className="text-sm font-medium text-slate-600 mb-1">Todavía no publicaste ningún caso</p>
              <p className="text-xs text-slate-400 mb-4">Publicá tu consulta legal y recibí propuestas de abogados.</p>
              <Link
                href="/casos/nuevo"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Plus className="h-4 w-4" /> Publicar mi primer caso
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {cases.map((c) => {
                const cat = (Array.isArray(c.legal_categories) ? c.legal_categories[0] : c.legal_categories) as { name: string } | null
                const prov = (Array.isArray(c.provinces) ? c.provinces[0] : c.provinces) as { name: string } | null
                const status = STATUS_STYLES[c.status] ?? STATUS_STYLES.open
                return (
                  <div key={c.id} className="flex items-start gap-4 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 shrink-0">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">{c.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                        {cat && <span className="text-xs text-slate-400">{cat.name}</span>}
                        {prov && (
                          <span className="flex items-center gap-0.5 text-xs text-slate-400">
                            <MapPin className="h-3 w-3" />{prov.name}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 mt-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {c.views_count} vistas
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {c.proposals_count} propuestas
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {timeAgo(c.created_at)}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/mis-casos`}
                      className="shrink-0 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Historial de conversaciones */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Historial de conversaciones</h2>
          <Link href="/dashboard/mensajes" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            Ver todas <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {convList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <MessageSquare className="h-10 w-10 mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-600 mb-1">Sin conversaciones todavía</p>
            <p className="text-xs text-slate-400">Tus chats con abogados aparecerán acá.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {convList.map((conv) => (
              <Link
                key={conv.id}
                href="/dashboard/mensajes"
                className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${avatarColor(conv.otherId)} text-white font-bold text-sm shrink-0`}>
                  {getInitials(conv.otherName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                      {conv.otherName}
                    </p>
                    {conv.lastMessageAt && (
                      <span className="text-xs text-slate-400 shrink-0">{timeAgo(conv.lastMessageAt)}</span>
                    )}
                  </div>
                  {conv.caseTitle && (
                    <p className="text-xs text-blue-500 mt-0.5 truncate">{conv.caseTitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {conv.unread > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                      {conv.unread}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
