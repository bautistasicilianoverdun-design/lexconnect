import { redirect } from 'next/navigation'
import { TrendingUp, Star, CheckCircle2, Award, MessageSquare, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${cls} ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
      ))}
    </div>
  )
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'Hoy'
  if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`
  if (days < 30) return `Hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? 's' : ''}`
  return `Hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? 'es' : ''}`
}

function getInitials(name: string) {
  return name.split(' ').slice(0,2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

// ─── Bar chart (server-rendered SVG) ─────────────────────────────────────────

function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-3 h-20">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-medium text-slate-500">{val > 0 ? val : ''}</span>
          <div
            className={`w-full rounded-t-md ${color}`}
            style={{ height: val > 0 ? `${Math.max((val / max) * 52, 4)}px` : '2px', opacity: val > 0 ? 1 : 0.15 }}
          />
          <span className="text-[9px] text-slate-400 text-center leading-tight">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EstadisticasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const { data: lp } = await supabase
    .from('lawyer_profiles')
    .select('id, rating_avg, rating_count, cases_handled, consultations_answered')
    .eq('user_id', user.id)
    .single()

  if (!lp) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Mis estadísticas</h1>
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">Completá tu perfil de abogado para ver estadísticas.</p>
        </div>
      </div>
    )
  }

  // Build last 8 weeks window
  const now = new Date()
  const weeks: { label: string; from: Date; to: Date }[] = []
  for (let i = 7; i >= 0; i--) {
    const to = new Date(now)
    to.setDate(to.getDate() - i * 7)
    const from = new Date(to)
    from.setDate(from.getDate() - 7)
    const day = to.getDate()
    const month = to.toLocaleDateString('es-AR', { month: 'short' })
    weeks.push({ label: `${day} ${month}`, from, to })
  }

  const eightWeeksAgo = weeks[0].from.toISOString()

  const [
    { data: allProposals },
    { data: recentProposals },
    { data: reviews },
    { data: conversations },
  ] = await Promise.all([
    supabase.from('case_proposals').select('id, status, created_at').eq('lawyer_id', lp.id),
    supabase.from('case_proposals').select('id, status, created_at').eq('lawyer_id', lp.id).gte('created_at', eightWeeksAgo),
    supabase.from('reviews')
      .select('id, rating, comment, created_at, is_revealed, is_locked, rating_communication, rating_expertise, rating_value, rating_responsiveness, profiles!reviewer_id(full_name, avatar_url)')
      .eq('lawyer_id', lp.id)
      .eq('is_revealed', true)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('conversations').select('id', { count: 'exact', head: false }).eq('lawyer_id', user.id),
  ])

  const sent     = allProposals?.length ?? 0
  const accepted = allProposals?.filter(p => p.status === 'accepted').length ?? 0
  const pending  = allProposals?.filter(p => p.status === 'pending').length ?? 0
  const rate     = sent > 0 ? Math.round((accepted / sent) * 100) : 0
  const rating   = Number(lp.rating_avg ?? 0)
  const reviews_ = lp.rating_count ?? 0
  const totalConvs = conversations?.length ?? 0

  // Weekly proposal breakdown
  const weeklyData = weeks.map(w =>
    (recentProposals ?? []).filter(p => {
      const d = new Date(p.created_at)
      return d >= w.from && d < w.to
    }).length
  )
  const weekLabels = weeks.map(w => w.label)

  // Sub-rating averages from revealed reviews
  const revealedReviews = (reviews ?? []).filter(r => r.is_revealed || r.is_locked)
  const avg = (field: string) => {
    const vals = revealedReviews.map((r: any) => r[field]).filter((v: any) => v != null && v > 0)
    return vals.length > 0 ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0
  }
  const subRatings = [
    { label: 'Comunicación',      value: avg('rating_communication') },
    { label: 'Conocimiento',      value: avg('rating_expertise') },
    { label: 'Precio / calidad',  value: avg('rating_value') },
    { label: 'Tiempo de resp.',   value: avg('rating_responsiveness') },
  ].filter(s => s.value > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis estadísticas</h1>
        <p className="text-sm text-slate-500 mt-0.5">Resumen de tu actividad en LexConnect</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Propuestas enviadas',
            value: String(sent),
            sub: `${accepted} aceptadas · ${pending} en espera`,
            icon: TrendingUp,
            color: 'text-blue-600', bg: 'bg-blue-50',
          },
          {
            label: 'Tasa de aceptación',
            value: `${rate}%`,
            sub: `${accepted} de ${sent} propuestas`,
            icon: CheckCircle2,
            color: 'text-green-600', bg: 'bg-green-50',
          },
          {
            label: 'Conversaciones activas',
            value: String(totalConvs),
            sub: 'con clientes',
            icon: MessageSquare,
            color: 'text-purple-600', bg: 'bg-purple-50',
          },
          {
            label: 'Valoración promedio',
            value: rating > 0 ? rating.toFixed(1) : '—',
            sub: `${reviews_} ${reviews_ === 1 ? 'reseña' : 'reseñas'}`,
            icon: Star,
            color: 'text-amber-600', bg: 'bg-amber-50',
          },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${bg} mb-3`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            <p className={`text-xs mt-1 font-medium ${color}`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Proposal chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Propuestas enviadas</h3>
          <p className="text-xs text-slate-400 mb-5">Últimas 8 semanas</p>
          {weeklyData.every(v => v === 0) ? (
            <div className="h-20 flex items-center justify-center text-sm text-slate-400">
              No hay propuestas en las últimas 8 semanas
            </div>
          ) : (
            <BarChart data={weeklyData} labels={weekLabels} color="bg-blue-500" />
          )}
        </div>

        {/* Acceptance breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Estado de propuestas</h3>
          <p className="text-xs text-slate-400 mb-5">Todas las propuestas enviadas</p>
          {sent === 0 ? (
            <div className="h-20 flex items-center justify-center text-sm text-slate-400">
              Todavía no enviaste propuestas
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Aceptadas',        count: accepted,                           color: 'bg-green-500' },
                { label: 'En espera',         count: pending,                            color: 'bg-amber-400' },
                { label: 'No seleccionadas', count: sent - accepted - pending,           color: 'bg-slate-200' },
              ].map(({ label, count, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{label}</span>
                    <span className="font-semibold text-slate-900">{count} ({sent > 0 ? Math.round((count/sent)*100) : 0}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${sent > 0 ? (count/sent)*100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Extra stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 shrink-0">
            <Award className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{lp.cases_handled ?? 0}</p>
            <p className="text-xs text-slate-400">Casos resueltos acumulados</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 shrink-0">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{lp.consultations_answered ?? 0}</p>
            <p className="text-xs text-slate-400">Consultas respondidas</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {revealedReviews.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900">Valoraciones recibidas</h3>
              <p className="text-xs text-slate-400 mt-0.5">{revealedReviews.length} {revealedReviews.length === 1 ? 'reseña revelada' : 'reseñas reveladas'}</p>
            </div>
            {rating > 0 && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-3xl font-bold text-slate-900">{rating.toFixed(1)}</p>
                  <p className="text-xs text-slate-400">{reviews_} reseñas</p>
                </div>
                <Stars rating={rating} size="lg" />
              </div>
            )}
          </div>

          {/* Sub-rating breakdown */}
          {subRatings.length > 0 && (
            <div className="px-5 py-4 border-b border-slate-100 grid sm:grid-cols-2 gap-3">
              {subRatings.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 w-32 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(value/5)*100}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-6 text-right">{value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {revealedReviews.map((r: any) => {
              const rev = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
              return (
                <div key={r.id} className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs flex items-center justify-center overflow-hidden">
                        {rev?.avatar_url
                          ? <img src={rev.avatar_url} alt="" className="h-full w-full object-cover" />
                          : getInitials(rev?.full_name ?? 'C')
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{rev?.full_name ?? 'Cliente'}</p>
                        <p className="text-xs text-slate-400">{timeAgo(r.created_at)}</p>
                      </div>
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <Star className="h-10 w-10 mx-auto text-slate-200 mb-3" />
          <p className="font-semibold text-slate-700">Todavía no tenés valoraciones reveladas</p>
          <p className="text-sm text-slate-400 mt-1">Aparecerán acá cuando un cliente cierre un caso y ambos califiquen.</p>
        </div>
      )}
    </div>
  )
}
