import Link from 'next/link'
import { CheckCircle2, Clock, XCircle, MessageSquare, Eye, MapPin, ChevronRight } from 'lucide-react'

const PROPOSALS = [
  {
    id: 'p1',
    caseTitle: 'Despido sin causa después de 8 años de antigüedad',
    caseId: '1',
    category: 'Laboral',
    province: 'Córdoba',
    status: 'accepted',
    statusLabel: 'Aceptada',
    preview: 'Leí tu caso con atención. Con 8 años de antigüedad tenés derecho a...',
    sentAt: 'Hace 2 días',
    clientReplied: true,
  },
  {
    id: 'p2',
    caseTitle: 'Reclamo por alimentos — cuota desactualizada',
    caseId: '2',
    category: 'Familia',
    province: 'Buenos Aires',
    status: 'pending',
    statusLabel: 'Pendiente',
    preview: 'Hola, soy especialista en derecho de familia con 12 años de experiencia...',
    sentAt: 'Hace 4 horas',
    clientReplied: false,
  },
  {
    id: 'p3',
    caseTitle: 'Contrato de alquiler — propietario no devuelve el depósito',
    caseId: '4',
    category: 'Inmobiliario',
    province: 'Buenos Aires',
    status: 'pending',
    statusLabel: 'Pendiente',
    preview: 'Según la Ley de Alquileres el propietario tiene 30 días para...',
    sentAt: 'Hace 1 día',
    clientReplied: false,
  },
  {
    id: 'p4',
    caseTitle: 'Accidente de tránsito — seguro no quiere cubrir',
    caseId: '3',
    category: 'Tránsito',
    province: 'Santa Fe',
    status: 'rejected',
    statusLabel: 'No seleccionada',
    preview: 'Este tipo de casos los resuelvo a través de un reclamo extrajudicial...',
    sentAt: 'Hace 3 días',
    clientReplied: false,
  },
]

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  accepted: { label: 'Aceptada', className: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  pending: { label: 'Pendiente', className: 'bg-blue-100 text-blue-700', icon: Clock },
  rejected: { label: 'No seleccionada', className: 'bg-slate-100 text-slate-500', icon: XCircle },
}

export default function MisPropuestasPage() {
  const accepted = PROPOSALS.filter((p) => p.status === 'accepted').length
  const pending = PROPOSALS.filter((p) => p.status === 'pending').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis propuestas</h1>
        <p className="text-sm text-slate-500 mt-0.5">{PROPOSALS.length} propuestas enviadas</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Aceptadas', value: accepted, className: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pendientes', value: pending, className: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'No seleccionadas', value: PROPOSALS.length - accepted - pending, className: 'text-slate-500', bg: 'bg-slate-50' },
        ].map(({ label, value, className, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${className}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {PROPOSALS.map((p) => {
          const { className, icon: Icon } = STATUS_CONFIG[p.status]
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
                      <Icon className="h-3 w-3" />
                      {p.statusLabel}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{p.category}</span>
                    {p.clientReplied && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">
                        Cliente respondió
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{p.caseTitle}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{p.preview}</p>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.province}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Enviada {p.sentAt}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    href={`/casos/${p.caseId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> Ver caso
                  </Link>
                  {p.status === 'accepted' && (
                    <Link
                      href="/dashboard/mensajes"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-semibold text-white transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Mensajes
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Link
          href="/dashboard/casos-disponibles"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Ver más casos <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
