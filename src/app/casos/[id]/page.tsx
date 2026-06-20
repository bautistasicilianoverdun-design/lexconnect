import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  MapPin, Clock, Eye, MessageSquare, AlertCircle,
  ChevronRight, FileText, Shield, ArrowLeft, Send, Star,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const MOCK_CASES: Record<string, {
  id: string; title: string; category: string; province: string;
  urgency: string; description: string; proposals: number;
  views: number; created: string; visibility: string;
  additionalInfo: string;
}> = {
  '1': {
    id: '1',
    title: 'Despido sin causa después de 8 años de antigüedad',
    category: 'Laboral',
    province: 'Córdoba',
    urgency: 'high',
    description:
      'Trabajé 8 años en una empresa y me despidieron sin aviso ni causa. Me ofrecieron una liquidación pero no sé si está bien calculada. Necesito saber si corresponde más y si tengo que firmar algo antes de consultar con un profesional.',
    additionalInfo:
      'Tengo todos los recibos de sueldo desde el inicio. La empresa es una PyME con más de 50 empleados. El despido fue verbal y luego me mandaron un telegrama. Me dieron 15 días para firmar el acuerdo.',
    proposals: 4,
    views: 87,
    created: 'Hace 2 horas',
    visibility: 'public',
  },
  '2': {
    id: '2',
    title: 'Reclamo por alimentos — cuota desactualizada',
    category: 'Familia',
    province: 'Buenos Aires',
    urgency: 'medium',
    description:
      'Tengo una cuota alimentaria fijada hace 3 años y nunca se actualizó. Mi ex trabaja en relación de dependencia. Quiero saber cómo actualizar el monto y si puedo pedir retroactivo.',
    additionalInfo:
      'La cuota fue fijada judicialmente. Tengo dos hijos de 6 y 9 años. El padre está en blanco con buen sueldo según tengo entendido.',
    proposals: 6,
    views: 134,
    created: 'Hace 5 horas',
    visibility: 'public',
  },
  '3': {
    id: '3',
    title: 'Accidente de tránsito — seguro no quiere cubrir los gastos',
    category: 'Tránsito',
    province: 'Santa Fe',
    urgency: 'urgent',
    description:
      'Me chocaron por atrás en un semáforo. El otro conductor tenía el seguro vencido. Tuve gastos médicos y el auto está muy dañado. El seguro de mi vehículo dice que no cubre porque el otro no tenía seguro.',
    additionalInfo:
      'Tengo el acta policial y fotos del accidente. El médico me dio 10 días de reposo. Los daños del auto superan los $800.000.',
    proposals: 3,
    views: 62,
    created: 'Hace 1 hora',
    visibility: 'public',
  },
  '4': {
    id: '4',
    title: 'Contrato de alquiler — propietario no devuelve el depósito',
    category: 'Inmobiliario',
    province: 'Buenos Aires',
    urgency: 'medium',
    description:
      'Me mudé hace 45 días, entregué el departamento en perfectas condiciones pero el propietario no me devuelve el depósito. Dice que hay daños pero no los puede demostrar.',
    additionalInfo:
      'Tengo fotos del ingreso y del egreso del departamento. El contrato venció normalmente. El depósito equivale a un mes de alquiler.',
    proposals: 5,
    views: 98,
    created: 'Hace 1 día',
    visibility: 'public',
  },
  '5': {
    id: '5',
    title: 'Problema con garantía de electrodoméstico — empresa no responde',
    category: 'Consumidor',
    province: 'Mendoza',
    urgency: 'low',
    description:
      'Compré una heladera hace 6 meses, dejó de funcionar y la empresa de servicio técnico dice que no está cubierta por garantía sin dar explicación.',
    additionalInfo:
      'Tengo la factura de compra y los reclamos anteriores por escrito. Intenté resolver por vía administrativa sin éxito.',
    proposals: 2,
    views: 41,
    created: 'Hace 2 días',
    visibility: 'public',
  },
  '6': {
    id: '6',
    title: 'Constitución de SRL — dudas sobre el proceso',
    category: 'Comercial',
    province: 'CABA',
    urgency: 'low',
    description:
      'Quiero constituir una SRL con dos socios para una empresa de tecnología. No sé qué tipo societario conviene, cuáles son los costos y cuánto tarda el proceso en CABA.',
    additionalInfo:
      'Somos tres socios. Uno aporta capital, los otros dos trabajo. Queremos proteger los activos personales y tener una estructura formal para facturar.',
    proposals: 7,
    views: 156,
    created: 'Hace 3 días',
    visibility: 'public',
  },
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

const SIMILAR_LAWYERS = [
  { name: 'Dr. Carlos Pérez', avatar: 'CP', specialty: 'Derecho Laboral', rating: 4.9, reviews: 142, verified: true },
  { name: 'Dra. Lucía Fernández', avatar: 'LF', specialty: 'Derecho Laboral', rating: 4.9, reviews: 203, verified: true },
  { name: 'Dra. Ana Martínez', avatar: 'AM', specialty: 'Derecho Laboral', rating: 4.8, reviews: 98, verified: true },
]

export default async function CasoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const caso = MOCK_CASES[id]
  if (!caso) notFound()

  return (
    <div className="flex flex-col min-h-full">
      <Header user={null} />
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">

          {/* Back */}
          <Link href="/casos" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Volver a casos
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 space-y-5">
              {/* Header card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${URGENCY_STYLES[caso.urgency]}`}>
                    Urgencia {URGENCY_LABELS[caso.urgency]}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {caso.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Activo
                  </span>
                </div>

                <h1 className="text-xl font-bold text-slate-900 mb-4">{caso.title}</h1>

                <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-5">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{caso.province}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{caso.created}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{caso.views} vistas</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{caso.proposals} propuestas</span>
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <h2 className="text-sm font-semibold text-slate-900 mb-2">Descripción del caso</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{caso.description}</p>
                </div>

                {caso.additionalInfo && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-900 mb-2">Información adicional</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">{caso.additionalInfo}</p>
                  </div>
                )}
              </div>

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

              {/* CTA para abogados */}
              <div className="bg-slate-900 rounded-2xl p-6 text-white">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shrink-0">
                    <Send className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
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
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Stats */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Resumen</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Categoría', value: caso.category },
                    { label: 'Provincia', value: caso.province },
                    { label: 'Urgencia', value: URGENCY_LABELS[caso.urgency] },
                    { label: 'Estado', value: 'Recibiendo propuestas' },
                    { label: 'Propuestas', value: `${caso.proposals} enviadas` },
                    { label: 'Publicado', value: caso.created },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-medium text-slate-900 text-right ml-4">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alert for clients */}
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

              {/* Similar lawyers */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Abogados sugeridos</h3>
                <div className="space-y-3">
                  {SIMILAR_LAWYERS.map((l) => (
                    <div key={l.name} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
                        {l.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{l.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          {l.rating} · {l.specialty}
                        </div>
                      </div>
                      <Link
                        href={`/abogados`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
                      >
                        Ver
                      </Link>
                    </div>
                  ))}
                </div>
                <Link
                  href="/abogados"
                  className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Ver todos los abogados <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Post case CTA */}
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
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
