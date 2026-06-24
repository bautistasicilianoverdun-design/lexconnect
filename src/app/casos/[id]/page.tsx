import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  MapPin, Clock, Eye, MessageSquare, AlertCircle,
  ChevronRight, FileText, Shield, ArrowLeft, Star,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'

const URGENCY_STYLES: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high:   'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low:    'bg-slate-100 text-slate-600',
}
const URGENCY_LABELS: Record<string, string> = {
  urgent: 'Urgente', high: 'Alta', medium: 'Media', low: 'Baja',
}
const STATUS_LABELS: Record<string, string> = {
  open:        'Recibiendo propuestas',
  in_progress: 'En proceso',
  closed:      'Cerrado',
  archived:    'Archivado',
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 2)  return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

const AVATAR_COLORS = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-500', 'bg-rose-600']
function avatarColor(id: string) {
  let n = 0
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

export default async function CasoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: caso } = await supabase
    .from('legal_cases')
    .select(`
      id, title, description, urgency, status, visibility,
      views_count, proposals_count, created_at,
      client_id, category_id, budget_min, budget_max,
      ai_summary, ai_urgency,
      legal_categories!category_id(name, slug),
      provinces(name)
    `)
    .eq('id', id)
    .maybeSingle()

  if (!caso) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  // User roles
  const isOwner  = user?.id === caso.client_id
  let isLawyer   = false
  if (user && !isOwner) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isLawyer = profile?.role === 'lawyer' || profile?.role === 'firm_admin'
  }

  const cat  = (Array.isArray(caso.legal_categories) ? caso.legal_categories[0] : caso.legal_categories) as { name: string; slug: string } | null
  const prov = (Array.isArray(caso.provinces) ? caso.provinces[0] : caso.provinces) as { name: string } | null

  // Lawyers matching the case category
  type Lawyer = { id: string; rating_avg: number | null; rating_count: number | null; verification_status: string | null; profiles: { full_name: string; city: string | null; avatar_url: string | null } | null }
  let relatedLawyers: Lawyer[] = []

  if (caso.category_id) {
    const { data: specialties } = await supabase
      .from('lawyer_specialties')
      .select('lawyer_id')
      .eq('category_id', caso.category_id)
      .limit(20)

    const ids = (specialties ?? []).map((s) => s.lawyer_id)

    if (ids.length > 0) {
      const { data: lps } = await supabase
        .from('lawyer_profiles')
        .select('id, rating_avg, rating_count, verification_status, profiles!user_id(full_name, city, avatar_url)')
        .in('id', ids)
        .neq('accepts_new_clients', false)
        .order('rating_avg', { ascending: false })
        .limit(3)
      relatedLawyers = (lps ?? []) as unknown as Lawyer[]
    }
  }

  // Fallback: top-rated lawyers if no specialty match
  if (relatedLawyers.length === 0) {
    const { data: lps } = await supabase
      .from('lawyer_profiles')
      .select('id, rating_avg, rating_count, verification_status, profiles!user_id(full_name, city, avatar_url)')
      .eq('accepts_new_clients', true)
      .order('rating_avg', { ascending: false })
      .limit(3)
    relatedLawyers = (lps ?? []) as unknown as Lawyer[]
  }

  const statusLabel = STATUS_LABELS[caso.status] ?? 'Activo'

  return (
    <div className="flex flex-col min-h-full">
      <Header user={null} />
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">

          <Link href="/casos" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Volver a casos
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 space-y-5">

              {/* Case header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${URGENCY_STYLES[caso.urgency] ?? ''}`}>
                    Urgencia {URGENCY_LABELS[caso.urgency] ?? caso.urgency}
                  </span>
                  {cat && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {cat.name}
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    caso.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {statusLabel}
                  </span>
                </div>

                <h1 className="text-xl font-bold text-slate-900 mb-4">{caso.title}</h1>

                <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-5">
                  {prov && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{prov.name}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(caso.created_at)}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{caso.views_count} vistas</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{caso.proposals_count} propuestas</span>
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <h2 className="text-sm font-semibold text-slate-900 mb-2">Descripción del caso</h2>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{caso.description}</p>
                </div>

                {(caso.budget_min || caso.budget_max) && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-900 mb-1">Presupuesto estimado</h2>
                    <p className="text-sm text-slate-600">
                      {caso.budget_min && caso.budget_max
                        ? `$${Number(caso.budget_min).toLocaleString('es-AR')} – $${Number(caso.budget_max).toLocaleString('es-AR')}`
                        : caso.budget_min
                        ? `Desde $${Number(caso.budget_min).toLocaleString('es-AR')}`
                        : `Hasta $${Number(caso.budget_max).toLocaleString('es-AR')}`}
                    </p>
                  </div>
                )}
              </div>

              {/* AI summary */}
              {caso.ai_summary && (
                <div className="flex items-start gap-3 bg-violet-50 border border-violet-100 rounded-xl p-4">
                  <svg className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-violet-700 mb-1">Análisis IA</p>
                    <p className="text-sm text-violet-900 leading-relaxed">{caso.ai_summary}</p>
                  </div>
                </div>
              )}

              {/* Privacy notice */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <Shield className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Datos protegidos</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Los datos de contacto del cliente están ocultos. Solo se revelan cuando el cliente acepta una propuesta.
                  </p>
                </div>
              </div>

              {/* CTA block */}
              {isOwner ? (
                <div className="bg-slate-900 rounded-2xl p-6 text-white">
                  <h3 className="font-bold mb-1">Este es tu caso</h3>
                  <p className="text-slate-300 text-sm mb-4">
                    Revisá las propuestas que recibiste y elegí al abogado que mejor se adapte a tu situación.
                  </p>
                  <Link
                    href={`/dashboard/mis-casos#${caso.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Ver propuestas recibidas <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : isLawyer ? (
                <div className="bg-slate-900 rounded-2xl p-6 text-white">
                  <h3 className="font-bold mb-1">¿Podés ayudar con este caso?</h3>
                  <p className="text-slate-300 text-sm mb-4">
                    Enviá tu propuesta desde el panel de abogados. Si el cliente la acepta, se revelan sus datos de contacto.
                  </p>
                  <Link
                    href="/dashboard/casos-disponibles"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Ir a casos disponibles <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="bg-slate-900 rounded-2xl p-6 text-white">
                  <h3 className="font-bold mb-1">¿Podés ayudar con este caso?</h3>
                  <p className="text-slate-300 text-sm mb-4">
                    Enviá tu propuesta al cliente. Si la acepta, se revelan sus datos de contacto.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/registro?rol=abogado"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      Crear perfil y proponer
                    </Link>
                    <Link
                      href="/iniciar-sesion"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-white/20 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      Ya tengo cuenta
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Resumen</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Categoría',   value: cat?.name ?? '—' },
                    { label: 'Provincia',   value: prov?.name ?? '—' },
                    { label: 'Urgencia',    value: URGENCY_LABELS[caso.urgency] ?? caso.urgency },
                    { label: 'Estado',      value: statusLabel },
                    { label: 'Propuestas',  value: `${caso.proposals_count} enviadas` },
                    { label: 'Publicado',   value: timeAgo(caso.created_at) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-medium text-slate-900 text-right ml-4">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alert for clients */}
              {!isOwner && !isLawyer && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-900">¿Es tu caso?</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Para ver las propuestas recibidas iniciá sesión en tu cuenta.
                    </p>
                    <Link href="/iniciar-sesion" className="text-xs text-amber-800 font-semibold underline mt-1 inline-block">
                      Iniciar sesión →
                    </Link>
                  </div>
                </div>
              )}

              {/* Related lawyers */}
              {relatedLawyers.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">
                    {cat ? `Abogados en ${cat.name}` : 'Abogados sugeridos'}
                  </h3>
                  <div className="space-y-3">
                    {relatedLawyers.map((lp) => {
                      const profile = (Array.isArray(lp.profiles) ? lp.profiles[0] : lp.profiles) as { full_name: string; city: string | null; avatar_url: string | null } | null
                      const name = profile?.full_name ?? 'Abogado'
                      const isVerified = lp.verification_status === 'verified'
                      return (
                        <div key={lp.id} className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${avatarColor(lp.id)} text-white font-bold text-sm`}>
                            {profile?.avatar_url
                              ? <img src={profile.avatar_url} alt={name} className="h-9 w-9 rounded-full object-cover" />
                              : getInitials(name)
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-medium text-slate-900 truncate">{name}</p>
                              {isVerified && <span className="shrink-0 h-3 w-3 rounded-full bg-blue-500 flex items-center justify-center"><span className="text-white text-[8px]">✓</span></span>}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              {(lp.rating_avg ?? 0) > 0 && (
                                <>
                                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                  <span>{lp.rating_avg?.toFixed(1)}</span>
                                  <span>·</span>
                                </>
                              )}
                              {profile?.city && <span>{profile.city}</span>}
                            </div>
                          </div>
                          <Link
                            href={`/abogados/${lp.id}`}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
                          >
                            Ver
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                  <Link
                    href="/abogados"
                    className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Ver todos los abogados <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              {/* Post case CTA */}
              {!isLawyer && !isOwner && (
                <div className="bg-blue-600 rounded-2xl p-5 text-center text-white">
                  <FileText className="h-8 w-8 mx-auto mb-3 opacity-80" />
                  <p className="font-bold text-sm mb-1">¿Tenés un caso similar?</p>
                  <p className="text-blue-100 text-xs mb-4">Publicalo gratis y recibí propuestas en horas.</p>
                  <Link
                    href="/casos/nuevo"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-blue-600 font-bold rounded-xl text-xs hover:bg-blue-50 transition-colors"
                  >
                    Publicar mi caso
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
