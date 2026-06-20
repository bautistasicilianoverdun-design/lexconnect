import Link from 'next/link'
import {
  FileText, Eye, MessageSquare, Clock, ChevronRight,
  Plus, Star, MapPin, CheckCircle2,
} from 'lucide-react'

const MOCK_MY_CASES = [
  {
    id: '1',
    title: 'Despido sin causa después de 8 años de antigüedad',
    category: 'Laboral',
    province: 'Córdoba',
    urgency: 'high',
    status: 'active',
    proposals: 4,
    views: 87,
    created: '2026-06-18',
    description:
      'Trabajé 8 años en una empresa y me despidieron sin aviso ni causa. Me ofrecieron una liquidación pero no sé si está bien calculada.',
    newProposals: 2,
  },
  {
    id: '2',
    title: 'Reclamo por alimentos — cuota desactualizada',
    category: 'Familia',
    province: 'Buenos Aires',
    urgency: 'medium',
    status: 'in_progress',
    proposals: 6,
    views: 134,
    created: '2026-06-13',
    description: 'Tengo una cuota alimentaria fijada hace 3 años y nunca se actualizó.',
    newProposals: 0,
  },
]

const MOCK_PROPOSALS: Record<string, Array<{
  id: string; lawyerName: string; avatar: string; rating: number;
  reviews: number; specialty: string; preview: string; province: string;
  time: string; verified: boolean; price: string;
}>> = {
  '1': [
    {
      id: 'p1', lawyerName: 'Dr. Carlos Pérez', avatar: 'CP', rating: 4.9, reviews: 142,
      specialty: 'Derecho Laboral', preview: 'Leí tu caso con atención. Con 8 años de antigüedad tenés derecho a una indemnización equivalente a 1 mes por año trabajado más vacaciones proporcionales. La oferta que te hicieron parece por debajo de lo que corresponde. Podemos iniciar un reclamo formal.',
      province: 'Córdoba', time: 'Hace 3 horas', verified: true, price: 'Consulta gratuita',
    },
    {
      id: 'p2', lawyerName: 'Dra. Ana Martínez', avatar: 'AM', rating: 4.8, reviews: 98,
      specialty: 'Derecho Laboral', preview: 'Hola, soy especialista en derecho laboral con 12 años de experiencia. He manejado muchos casos similares al tuyo y puedo ayudarte a evaluar la liquidación ofrecida.',
      province: 'Córdoba', time: 'Hace 6 horas', verified: true, price: '$15.000 consulta',
    },
    {
      id: 'p3', lawyerName: 'Dr. Roberto Sánchez', avatar: 'RS', rating: 4.7, reviews: 67,
      specialty: 'Laboral y Civil', preview: 'Revisé los detalles que compartiste. Efectivamente hay inconsistencias en el cálculo. La base de cálculo correcta debe incluir el promedio de comisiones y horas extras.',
      province: 'Buenos Aires', time: 'Hace 1 día', verified: false, price: 'Honorarios a convenir',
    },
    {
      id: 'p4', lawyerName: 'Dra. Lucía Fernández', avatar: 'LF', rating: 4.9, reviews: 203,
      specialty: 'Derecho Laboral', preview: 'Con mucho gusto puedo asistirte. Tenés plazo de 2 años para reclamar, así que todavía estás a tiempo. Te recomiendo no firmar nada hasta consultar.',
      province: 'Córdoba', time: 'Hace 1 día', verified: true, price: 'Sin anticipo — porcentaje del resultado',
    },
  ],
  '2': [],
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
  active: { label: 'Recibiendo propuestas', className: 'bg-green-100 text-green-700' },
  in_progress: { label: 'En proceso', className: 'bg-blue-100 text-blue-700' },
  closed: { label: 'Cerrado', className: 'bg-slate-100 text-slate-600' },
}

export default function MisCasosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis casos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{MOCK_MY_CASES.length} casos publicados</p>
        </div>
        <Link
          href="/casos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="h-4 w-4" /> Nuevo caso
        </Link>
      </div>

      {MOCK_MY_CASES.map((c) => {
        const proposals = MOCK_PROPOSALS[c.id] ?? []
        return (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Case header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${URGENCY_STYLES[c.urgency]}`}>
                  {URGENCY_LABELS[c.urgency]} urgencia
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {c.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[c.status].className}`}>
                  {STATUS_STYLES[c.status].label}
                </span>
                {c.newProposals > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                    {c.newProposals} nuevas
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">{c.title}</h2>
              <p className="text-sm text-slate-500 line-clamp-2">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.province}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(c.created).toLocaleDateString('es-AR')}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{c.views} vistas</span>
                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{c.proposals} propuestas</span>
              </div>
            </div>

            {/* Proposals */}
            {proposals.length > 0 ? (
              <div>
                <p className="px-6 pt-5 pb-3 text-sm font-semibold text-slate-700">
                  Propuestas recibidas ({proposals.length})
                </p>
                <div className="divide-y divide-slate-100">
                  {proposals.map((p) => (
                    <div key={p.id} className="px-6 py-4 flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
                        {p.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-slate-900">{p.lawyerName}</span>
                          {p.verified && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />}
                          <span className="flex items-center gap-0.5 text-xs text-slate-500">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            {p.rating} ({p.reviews})
                          </span>
                          <span className="text-xs text-slate-400 ml-auto">{p.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{p.specialty} · {p.province}</p>
                        <p className="text-sm text-slate-600 line-clamp-3">{p.preview}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">{p.price}</span>
                          <Link
                            href={`/abogados/${p.lawyerName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                            className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            Ver perfil
                          </Link>
                          <Link
                            href={`/dashboard/mensajes/${p.id}`}
                            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
                          >
                            Responder
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <FileText className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">Todavía no recibiste propuestas para este caso.</p>
                <p className="text-xs text-slate-400 mt-1">Los abogados suelen responder en las primeras 24 horas.</p>
              </div>
            )}

            <div className="px-6 pb-5 pt-2 border-t border-slate-100 flex justify-end">
              <Link href={`/casos/${c.id}`} className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                Ver caso público <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
