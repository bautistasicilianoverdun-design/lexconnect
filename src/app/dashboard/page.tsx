import Link from 'next/link'
import {
  FileText, MessageSquare, Star, Clock, ChevronRight,
  TrendingUp, CheckCircle2, AlertCircle, Plus, Eye,
} from 'lucide-react'

const RECENT_CASES = [
  {
    id: '1',
    title: 'Despido sin causa después de 8 años de antigüedad',
    category: 'Laboral',
    status: 'active',
    proposals: 4,
    created: 'Hace 2 días',
  },
  {
    id: '2',
    title: 'Cuota alimentaria desactualizada',
    category: 'Familia',
    status: 'in_progress',
    proposals: 6,
    created: 'Hace 5 días',
  },
]

const RECENT_PROPOSALS = [
  {
    id: 'p1',
    caseTitle: 'Despido sin causa después de 8 años de antigüedad',
    lawyerName: 'Dr. Carlos Pérez',
    lawyerAvatar: 'CP',
    lawyerRating: 4.9,
    preview: 'Leí tu caso con atención. Con 8 años de antigüedad tenés derecho a...',
    time: 'Hace 3 horas',
    isNew: true,
  },
  {
    id: 'p2',
    caseTitle: 'Despido sin causa después de 8 años de antigüedad',
    lawyerName: 'Dra. Ana Martínez',
    lawyerAvatar: 'AM',
    lawyerRating: 4.8,
    preview: 'Hola, soy especialista en derecho laboral con 12 años de experiencia...',
    time: 'Hace 6 horas',
    isNew: false,
  },
]

const RECENT_MESSAGES = [
  {
    id: 'm1',
    with: 'Dr. Carlos Pérez',
    avatar: 'CP',
    preview: '¿Podemos coordinar una videollamada para esta semana?',
    time: 'Hace 1 hora',
    unread: 2,
  },
  {
    id: 'm2',
    with: 'Dra. Ana Martínez',
    avatar: 'AM',
    preview: 'Perfecto, envíame los documentos cuando puedas.',
    time: 'Ayer',
    unread: 0,
  },
]

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  active: { label: 'Activo', className: 'bg-green-100 text-green-700' },
  in_progress: { label: 'En proceso', className: 'bg-blue-100 text-blue-700' },
  closed: { label: 'Cerrado', className: 'bg-slate-100 text-slate-600' },
}

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi panel</h1>
        <p className="text-sm text-slate-500 mt-0.5">Seguí el estado de tus casos y propuestas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Casos activos', value: '2', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Propuestas recibidas', value: '10', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Mensajes no leídos', value: '3', icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Abogados favoritos', value: '5', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
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

      {/* Alert: pending proposal */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-blue-900">Tenés 4 propuestas nuevas en tu caso laboral</p>
          <p className="text-xs text-blue-700 mt-0.5">Revisalas y elegí al abogado que mejor se adapte a tu situación.</p>
        </div>
        <Link
          href="/dashboard/mis-casos"
          className="shrink-0 text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
        >
          Ver <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent cases */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Mis casos</h2>
            <div className="flex gap-2">
              <Link href="/casos/nuevo" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                <Plus className="h-3.5 w-3.5" /> Nuevo
              </Link>
              <Link href="/dashboard/mis-casos" className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                Ver todos <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {RECENT_CASES.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/mis-casos/${c.id}`}
                className="flex items-start gap-3 p-5 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 shrink-0">
                  <FileText className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">{c.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[c.status].className}`}>
                      {STATUS_STYLES[c.status].label}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {c.proposals} propuestas
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {c.created}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-1" />
              </Link>
            ))}
          </div>
          <div className="p-5 pt-0">
            <Link
              href="/casos/nuevo"
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-colors mt-4"
            >
              <Plus className="h-4 w-4" /> Publicar nuevo caso
            </Link>
          </div>
        </div>

        {/* Recent proposals */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Últimas propuestas</h2>
            <Link href="/dashboard/mis-casos" className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
              Ver todas <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {RECENT_PROPOSALS.map((p) => (
              <Link key={p.id} href={`/dashboard/mis-casos/1`} className="flex items-start gap-3 p-5 hover:bg-slate-50 transition-colors group">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
                  {p.lawyerAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{p.lawyerName}</p>
                    {p.isNew && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">Nuevo</span>
                    )}
                    <span className="ml-auto text-xs text-slate-400">{p.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{p.preview}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Mensajes recientes</h2>
          <Link href="/dashboard/mensajes" className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
            Ver todos <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {RECENT_MESSAGES.map((m) => (
            <Link key={m.id} href={`/dashboard/mensajes/${m.id}`} className="flex items-center gap-3 p-5 hover:bg-slate-50 transition-colors group">
              <div className="relative shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-white font-bold text-sm">
                  {m.avatar}
                </div>
                {m.unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                    {m.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${m.unread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'} group-hover:text-blue-700 transition-colors`}>
                    {m.with}
                  </p>
                  <span className="text-xs text-slate-400 shrink-0 ml-2">{m.time}</span>
                </div>
                <p className={`text-xs mt-0.5 line-clamp-1 ${m.unread ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{m.preview}</p>
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
