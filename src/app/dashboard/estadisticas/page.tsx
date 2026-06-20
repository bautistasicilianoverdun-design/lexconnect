import {
  TrendingUp, Star, MessageSquare, Eye, CheckCircle2,
  Clock, Award, ArrowUpRight,
} from 'lucide-react'

const WEEKS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
const PROPOSALS_DATA = [3, 7, 5, 9]
const VIEWS_DATA = [120, 180, 150, 220]

const RECENT_REVIEWS = [
  {
    id: '1', client: 'M. G.', avatar: 'MG', rating: 5, date: 'Hace 3 días',
    text: 'Excelente atención. El Dr. resolvió mi caso laboral en tiempo récord y siempre estuvo disponible.',
  },
  {
    id: '2', client: 'R. P.', avatar: 'RP', rating: 5, date: 'Hace 1 semana',
    text: 'Muy profesional y honesto. Me explicó todo sin complicaciones. Lo recomiendo ampliamente.',
  },
  {
    id: '3', client: 'L. F.', avatar: 'LF', rating: 4, date: 'Hace 2 semanas',
    text: 'Buen trabajo. El resultado fue positivo aunque el proceso tardó un poco más de lo esperado.',
  },
]

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-2 h-16">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t-sm ${color}`}
            style={{ height: `${(val / max) * 48}px` }}
          />
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

export default function EstadisticasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis estadísticas</h1>
        <p className="text-sm text-slate-500 mt-0.5">Últimos 30 días</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Propuestas enviadas', value: '24', delta: '+4 esta semana', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Propuestas aceptadas', value: '7', delta: '29% tasa de éxito', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Visitas al perfil', value: '312', delta: '+18% vs mes anterior', icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Valoración promedio', value: '4.9', delta: '47 reseñas', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
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
        {/* Chart: proposals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900">Propuestas enviadas</h3>
              <p className="text-xs text-slate-400 mt-0.5">Último mes por semana</p>
            </div>
            <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
              <ArrowUpRight className="h-3.5 w-3.5" /> +28%
            </div>
          </div>
          <MiniBarChart data={PROPOSALS_DATA} color="bg-blue-500" />
        </div>

        {/* Chart: views */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900">Visitas al perfil</h3>
              <p className="text-xs text-slate-400 mt-0.5">Último mes por semana</p>
            </div>
            <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
              <ArrowUpRight className="h-3.5 w-3.5" /> +18%
            </div>
          </div>
          <MiniBarChart data={VIEWS_DATA} color="bg-purple-500" />
        </div>
      </div>

      {/* Response time & plan */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 shrink-0">
            <Clock className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">1.2h</p>
            <p className="text-xs text-slate-400">Tiempo promedio de respuesta</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 shrink-0">
            <Award className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">Top 10%</p>
            <p className="text-xs text-slate-400">En tu especialidad (Laboral)</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 shrink-0">
            <MessageSquare className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">94%</p>
            <p className="text-xs text-slate-400">Tasa de respuesta</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Últimas valoraciones</h3>
          <div className="flex items-center gap-2">
            <Stars n={5} />
            <span className="text-sm font-bold text-slate-900">4.9</span>
            <span className="text-xs text-slate-400">(47)</span>
          </div>
        </div>

        {/* Rating distribution */}
        <div className="px-5 py-4 border-b border-slate-100">
          {[5, 4, 3, 2, 1].map((n) => {
            const counts: Record<number, number> = { 5: 38, 4: 7, 3: 1, 2: 1, 1: 0 }
            const pct = Math.round((counts[n] / 47) * 100)
            return (
              <div key={n} className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-slate-500 w-3">{n}</span>
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-6 text-right">{pct}%</span>
              </div>
            )
          })}
        </div>

        <div className="divide-y divide-slate-100">
          {RECENT_REVIEWS.map((r) => (
            <div key={r.id} className="p-5 flex gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-600 font-bold text-sm shrink-0">
                {r.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-900">{r.client}</span>
                  <Stars n={r.rating} />
                  <span className="text-xs text-slate-400 ml-auto">{r.date}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
