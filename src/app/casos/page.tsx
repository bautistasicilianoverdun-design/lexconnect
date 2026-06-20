import Link from 'next/link'
import {
  FileText, MapPin, Clock, ChevronRight, Plus, Search,
  AlertCircle, Filter, Eye, MessageSquare,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const CATEGORIES = [
  { slug: 'todos', name: 'Todos' },
  { slug: 'laboral', name: 'Laboral' },
  { slug: 'civil', name: 'Civil' },
  { slug: 'penal', name: 'Penal' },
  { slug: 'comercial', name: 'Comercial' },
  { slug: 'familia', name: 'Familia' },
  { slug: 'inmobiliario', name: 'Inmobiliario' },
  { slug: 'tributario', name: 'Tributario' },
  { slug: 'consumidor', name: 'Consumidor' },
  { slug: 'transito', name: 'Tránsito' },
]

const URGENCY_STYLES: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-slate-100 text-slate-600',
}

const URGENCY_LABELS: Record<string, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}

const MOCK_CASES = [
  {
    id: '1',
    title: 'Despido sin causa después de 8 años de antigüedad',
    category: 'Laboral',
    province: 'Córdoba',
    urgency: 'high',
    description:
      'Trabajé 8 años en una empresa y me despidieron sin aviso ni causa. Me ofrecieron una liquidación pero no sé si está bien calculada. Necesito saber si corresponde más y si tengo que firmar algo.',
    proposals: 4,
    views: 87,
    created: 'Hace 2 horas',
  },
  {
    id: '2',
    title: 'Reclamo por alimentos — cuota desactualizada',
    category: 'Familia',
    province: 'Buenos Aires',
    urgency: 'medium',
    description:
      'Tengo una cuota alimentaria fijada hace 3 años y nunca se actualizó. Mi ex trabaja en relación de dependencia. Quiero saber cómo actualizar el monto y si puedo pedir retroactivo.',
    proposals: 6,
    views: 134,
    created: 'Hace 5 horas',
  },
  {
    id: '3',
    title: 'Accidente de tránsito — seguro no quiere cubrir los gastos',
    category: 'Tránsito',
    province: 'Santa Fe',
    urgency: 'urgent',
    description:
      'Me chocaron por atrás en un semáforo. El otro conductor tenía el seguro vencido. Tuve gastos médicos y el auto está muy dañado. El seguro de mi vehículo dice que no cubre porque el otro no tenía seguro.',
    proposals: 3,
    views: 62,
    created: 'Hace 1 hora',
  },
  {
    id: '4',
    title: 'Contrato de alquiler — propietario no devuelve el depósito',
    category: 'Inmobiliario',
    province: 'Buenos Aires',
    urgency: 'medium',
    description:
      'Me mudé hace 45 días, entregué el departamento en perfectas condiciones pero el propietario no me devuelve el depósito. Dice que hay daños pero no los puede demostrar.',
    proposals: 5,
    views: 98,
    created: 'Hace 1 día',
  },
  {
    id: '5',
    title: 'Problema con garantía de electrodoméstico — empresa no responde',
    category: 'Consumidor',
    province: 'Mendoza',
    urgency: 'low',
    description:
      'Compré una heladera hace 6 meses, dejó de funcionar y la empresa de servicio técnico dice que no está cubierta por garantía sin dar explicación. Quiero hacer un reclamo formal.',
    proposals: 2,
    views: 41,
    created: 'Hace 2 días',
  },
  {
    id: '6',
    title: 'Constitución de SRL — dudas sobre el proceso',
    category: 'Comercial',
    province: 'CABA',
    urgency: 'low',
    description:
      'Quiero constituir una SRL con dos socios para una empresa de tecnología. No sé qué tipo societario conviene, cuáles son los costos y cuánto tarda el proceso en CABA.',
    proposals: 7,
    views: 156,
    created: 'Hace 3 días',
  },
]

export default function CasosPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header user={null} />
      <main className="flex-1 bg-slate-50">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Casos legales publicados</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Personas buscando asesoramiento legal en Argentina
                </p>
              </div>
              <Link
                href="/casos/nuevo"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Plus className="h-4 w-4" />
                Publicar caso
              </Link>
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 h-11 rounded-lg border border-slate-200 bg-white px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar casos por título o descripción..."
                  className="flex-1 text-sm outline-none placeholder:text-slate-400"
                />
              </div>
              <button className="flex items-center gap-2 h-11 px-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors text-sm text-slate-600 font-medium">
                <Filter className="h-4 w-4" />
                Filtros
              </button>
            </div>

            {/* Category pills */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map(({ slug, name }) => (
                <button
                  key={slug}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    slug === 'todos'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Aviso para abogados */}
          <div className="mb-6 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">¿Sos abogado?</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Para enviar propuestas a estos casos necesitás{' '}
                <Link href="/registro?rol=abogado" className="underline font-medium">crear tu perfil</Link>{' '}
                e iniciar sesión.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">{MOCK_CASES.length}</span> casos activos
            </p>
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none bg-white text-slate-600">
              <option>Más recientes</option>
              <option>Más urgentes</option>
              <option>Más propuestas</option>
              <option>Más vistos</option>
            </select>
          </div>

          <div className="space-y-4">
            {MOCK_CASES.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${URGENCY_STYLES[c.urgency]}`}>
                        {URGENCY_LABELS[c.urgency]}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {c.category}
                      </span>
                    </div>

                    <h2 className="font-bold text-slate-900 mb-2 text-lg leading-snug">{c.title}</h2>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{c.description}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {c.province}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {c.created}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {c.views} vistas
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {c.proposals} propuestas
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 sm:shrink-0">
                    <Link
                      href={`/casos/${c.id}`}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      Ver caso <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href="/registro?rol=abogado"
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors"
                    >
                      Proponer
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA para clientes */}
          <div className="mt-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-center text-white">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-80" />
            <h3 className="font-bold text-lg mb-2">¿Tenés un caso legal?</h3>
            <p className="text-blue-100 text-sm mb-5">
              Publicalo gratis y recibí propuestas de abogados verificados en horas.
            </p>
            <Link
              href="/casos/nuevo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              Publicar mi caso gratis
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
