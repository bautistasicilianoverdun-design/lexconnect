import { redirect } from 'next/navigation'
import { TrendingUp, Star, Eye, CheckCircle2, Award, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const WEEKS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-2 h-16">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className={`w-full rounded-t-sm ${color}`} style={{ height: `${(val / max) * 48}px` }} />
          <span className="text-[9px] text-slate-400">{WEEKS[i]}</span>
        </div>
      ))}
    </div>
  )
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < n ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
      ))}
    </div>
  )
}

export default async function EstadisticasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const { data: lp } = await supabase
    .from('lawyer_profiles')
    .select('id, rating_avg, rating_count, cases_handled, consultations_answered')
    .eq('user_id', user.id)
    .single()

  const [
    { count: totalProposals },
    { count: acceptedProposals },
  ] = await Promise.all([
    supabase
      .from('case_proposals')
      .select('*', { count: 'exact', head: true })
      .eq('lawyer_id', lp?.id ?? ''),
    supabase
      .from('case_proposals')
      .select('*', { count: 'exact', head: true })
      .eq('lawyer_id', lp?.id ?? '')
      .eq('status', 'accepted'),
  ])

  const sent        = totalProposals ?? 0
  const accepted    = acceptedProposals ?? 0
  const rate        = sent > 0 ? Math.round((accepted / sent) * 100) : 0
  const rating      = lp?.rating_avg ?? 0
  const reviews     = lp?.rating_count ?? 0
  const casesHandled = lp?.cases_handled ?? 0
  const consultations = lp?.consultations_answered ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis estadísticas</h1>
        <p className="text-sm text-slate-500 mt-0.5">Resumen de tu actividad en LexConnect</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Propuestas enviadas',  value: String(sent),     delta: `${accepted} aceptadas`,     icon: TrendingUp,   color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'Tasa de aceptación',   value: `${rate}%`,       delta: `${accepted} de ${sent}`,    icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50' },
          { label: 'Consultas respondidas', value: String(consultations), delta: 'total acumulado',        icon: Eye,          color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Valoración promedio',  value: rating > 0 ? rating.toFixed(1) : '—', delta: `${reviews} reseñas`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, delta, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${bg} mb-3`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            <p className={`text-xs mt-1 font-medium ${color}`}>{delta}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900">Propuestas enviadas</h3>
              <p className="text-xs text-slate-400 mt-0.5">Último mes por semana</p>
            </div>
          </div>
          <MiniBarChart data={[0, 0, 0, sent]} color="bg-blue-500" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900">Visitas al perfil</h3>
              <p className="text-xs text-slate-400 mt-0.5">Total acumulado</p>
            </div>
          </div>
          <MiniBarChart data={[0, 0, 0, consultations]} color="bg-purple-500" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 shrink-0">
            <Award className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{casesHandled}</p>
            <p className="text-xs text-slate-400">Casos resueltos</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 shrink-0">
            <MessageSquare className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{rate}%</p>
            <p className="text-xs text-slate-400">Tasa de aceptación</p>
          </div>
        </div>
      </div>

      {reviews > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Valoraciones</h3>
            <div className="flex items-center gap-2">
              <Stars n={Math.round(rating)} />
              <span className="text-sm font-bold text-slate-900">{rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({reviews})</span>
            </div>
          </div>
          <div className="p-5 text-sm text-slate-400 text-center">
            Las reseñas de clientes aparecerán acá.
          </div>
        </div>
      )}

      {reviews === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <Star className="h-10 w-10 mx-auto text-slate-200 mb-3" />
          <p className="font-semibold text-slate-700">Todavía no tenés valoraciones</p>
          <p className="text-sm text-slate-400 mt-1">Las reseñas de tus clientes van a aparecer acá una vez que cierren un caso.</p>
        </div>
      )}
    </div>
  )
}
