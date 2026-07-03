import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  FileText, Eye, MessageSquare, Clock, ChevronRight,
  Plus, Star, MapPin, CheckCircle2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { startConversation, acceptProposal, rejectProposal, closeCaseAction } from './actions'
import { CaseDocumentsSection } from '@/components/dashboard/case-documents-section'

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

const URGENCY_STYLES: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-slate-100 text-slate-600',
}
const URGENCY_LABELS: Record<string, string> = {
  urgent: 'Urgente', high: 'Alta', medium: 'Media', low: 'Baja',
}
const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  open: { label: 'Recibiendo propuestas', className: 'bg-green-100 text-green-700' },
  in_progress: { label: 'En proceso', className: 'bg-blue-100 text-blue-700' },
  closed: { label: 'Cerrado', className: 'bg-slate-100 text-slate-600' },
  archived: { label: 'Archivado', className: 'bg-slate-100 text-slate-500' },
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export default async function MisCasosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'lawyer' || profile?.role === 'firm_admin') redirect('/dashboard')

  const { data: cases } = await supabase
    .from('legal_cases')
    .select(`
      id, title, description, status, urgency,
      views_count, proposals_count, created_at,
      ai_summary,
      legal_categories!category_id(name),
      provinces!province_id(name),
      case_proposals(
        id, message, proposed_fee, fee_type, status, created_at,
        lawyer_profiles(
          id, rating_avg, rating_count, verification_status,
          profiles!user_id(full_name, city)
        )
      )
    `)
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis casos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {cases?.length ?? 0} {cases?.length === 1 ? 'caso publicado' : 'casos publicados'}
          </p>
        </div>
        <Link
          href="/casos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="h-4 w-4" /> Nuevo caso
        </Link>
      </div>

      {!cases || cases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-slate-200 mb-4" />
          <p className="font-semibold text-slate-700 mb-1">Todavía no publicaste ningún caso</p>
          <p className="text-sm text-slate-400 mb-6">Publicá tu consulta legal y recibí propuestas de abogados en horas.</p>
          <Link
            href="/casos/nuevo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <Plus className="h-4 w-4" /> Publicar mi primer caso
          </Link>
        </div>
      ) : (
        cases.map((c) => {
          const cat = (Array.isArray(c.legal_categories) ? c.legal_categories[0] : c.legal_categories) as { name: string } | null
          const prov = (Array.isArray(c.provinces) ? c.provinces[0] : c.provinces) as { name: string } | null
          const proposals = (c.case_proposals as any[]) ?? []
          const status = STATUS_STYLES[c.status] ?? STATUS_STYLES.open

          return (
            <div key={c.id} id={c.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden scroll-mt-24">
              {/* Case header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${URGENCY_STYLES[c.urgency] ?? ''}`}>
                    {URGENCY_LABELS[c.urgency] ?? c.urgency} urgencia
                  </span>
                  {cat && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {cat.name}
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">{c.title}</h2>
                {(c as any).ai_summary ? (
                  <div className="flex items-start gap-2 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2 mb-2">
                    <svg className="h-3.5 w-3.5 text-violet-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    <p className="text-xs text-violet-800 leading-relaxed">{(c as any).ai_summary}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 line-clamp-2 mb-0">{c.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                  {prov && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{prov.name}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(c.created_at)}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{c.views_count} vistas</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{c.proposals_count} propuestas</span>
                </div>
              </div>

              {/* Proposals */}
              {proposals.length > 0 ? (
                <div>
                  <p className="px-6 pt-5 pb-3 text-sm font-semibold text-slate-700">
                    Propuestas recibidas ({proposals.length})
                  </p>
                  <div className="divide-y divide-slate-100">
                    {proposals.map((p: any) => {
                      const lawyerProfile = p.lawyer_profiles
                      const lawyerUser = lawyerProfile?.profiles
                      const name: string = lawyerUser?.full_name ?? 'Abogado'
                      const city: string = lawyerUser?.city ?? ''
                      const rating: number = lawyerProfile?.rating_avg ?? 0
                      const ratingCount: number = lawyerProfile?.rating_count ?? 0
                      const verified: boolean = lawyerProfile?.verification_status === 'verified'

                      return (
                        <div key={p.id} className="px-6 py-4 flex items-start gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
                            {getInitials(name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-slate-900">{name}</span>
                              {verified && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />}
                              {rating > 0 && (
                                <span className="flex items-center gap-0.5 text-xs text-slate-500">
                                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                  {rating.toFixed(1)} ({ratingCount})
                                </span>
                              )}
                              <span className="text-xs text-slate-400 ml-auto">{timeAgo(p.created_at)}</span>
                            </div>
                            {city && <p className="text-xs text-slate-400 mb-2">{city}</p>}
                            <p className="text-sm text-slate-600 line-clamp-3">{p.message}</p>
                            {(p.proposed_fee || p.fee_type) && (
                              <div className="mt-2">
                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
                                  {p.proposed_fee
                                    ? `$${Number(p.proposed_fee).toLocaleString('es-AR')}`
                                    : p.fee_type === 'to_discuss' ? 'Honorarios a convenir'
                                    : p.fee_type === 'contingency' ? 'Sin anticipo — % del resultado'
                                    : p.fee_type}
                                </span>
                              </div>
                            )}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {p.status === 'accepted' ? (
                                <>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-100 text-xs font-semibold text-green-700">
                                    <CheckCircle2 className="h-3 w-3" /> Aceptado
                                  </span>
                                  <form action={startConversation.bind(null, c.id, lawyerProfile?.id ?? '')}>
                                    <button type="submit" className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors">
                                      Ir al chat
                                    </button>
                                  </form>
                                </>
                              ) : p.status === 'rejected' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-400">
                                  No seleccionado
                                </span>
                              ) : (
                                <>
                                  <form action={acceptProposal.bind(null, c.id, p.id, lawyerProfile?.id ?? '')}>
                                    <button type="submit" className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-xs font-semibold text-white transition-colors">
                                      Aceptar
                                    </button>
                                  </form>
                                  <form action={startConversation.bind(null, c.id, lawyerProfile?.id ?? '')}>
                                    <button type="submit" className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors">
                                      Preguntar
                                    </button>
                                  </form>
                                  <form action={rejectProposal.bind(null, p.id)}>
                                    <button type="submit" className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-500 transition-colors">
                                      Rechazar
                                    </button>
                                  </form>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <FileText className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">Todavía no recibiste propuestas para este caso.</p>
                  <p className="text-xs text-slate-400 mt-1">Los abogados suelen responder en las primeras 24 horas.</p>
                </div>
              )}

              <CaseDocumentsSection caseId={c.id} currentUserId={user.id} />

              <div className="px-6 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between">
                <Link href={`/casos/${c.id}`} className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                  Ver caso publico <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                {c.status === 'in_progress' && (
                  <form action={closeCaseAction.bind(null, c.id)}>
                    <button
                      type="submit"
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                      Cerrar caso
                    </button>
                  </form>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
