import { Check, Star, Zap, Building, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'

const PLANS = [
  {
    id: 'free',
    name: 'Básico',
    price: 'Gratis',
    period: '',
    description: 'Para comenzar a construir tu presencia en LexConnect',
    icon: null,
    color: 'border-slate-200',
    badge: null,
    features: [
      'Perfil profesional público',
      'Especialidades y experiencia',
      'Verificación de identidad',
      'Recibir mensajes de clientes',
      'Hasta 5 propuestas por mes',
      'Acceso a casos públicos',
    ],
    missing: [
      'Aparición prioritaria en búsquedas',
      'Estadísticas avanzadas',
      'Badge de profesional verificado',
      'Chat prioritario',
    ],
    cta: 'Empezar gratis',
    ctaStyle: 'border border-slate-200 hover:bg-slate-50 text-slate-700',
  },
  {
    id: 'professional',
    name: 'Profesional',
    price: '$8.500',
    period: '/mes',
    description: 'Mayor visibilidad y herramientas para crecer',
    icon: Zap,
    color: 'border-blue-500',
    badge: 'Más popular',
    features: [
      'Todo lo del plan Básico',
      'Aparición prioritaria en búsquedas',
      'Badge "Profesional Verificado"',
      'Propuestas ilimitadas',
      'Estadísticas de perfil',
      'Soporte prioritario',
      'Acceso a casos privados',
      'Videollamadas integradas',
    ],
    missing: [
      'Posición #1 en resultados',
      'Panel de administración avanzado',
    ],
    cta: 'Comenzar prueba 14 días gratis',
    ctaStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
    highlighted: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$19.900',
    period: '/mes',
    description: 'Máxima visibilidad y herramientas avanzadas',
    icon: Star,
    color: 'border-amber-400',
    badge: 'Premium',
    features: [
      'Todo lo del plan Profesional',
      'Posición #1 en resultados de búsqueda',
      'Badge dorado "Premium"',
      'Publicaciones destacadas ilimitadas',
      'Análisis y reportes avanzados',
      'Dashboard de gestión de casos',
      'Integración con calendario',
      'API de videollamadas personalizada',
      'Soporte 24/7 dedicado',
    ],
    missing: [],
    cta: 'Comenzar prueba 14 días gratis',
    ctaStyle: 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white',
  },
]

const FIRM_PLAN = {
  features: [
    'Página institucional del estudio',
    'Perfiles de todos los abogados miembros',
    'Panel de administración centralizado',
    'Estadísticas del estudio',
    'Posición premium en búsquedas',
    'Publicaciones de contenido legal',
    'Soporte dedicado',
    'Acceso a API (próximamente)',
  ],
}

const FAQ = [
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí, podés cancelar tu suscripción en cualquier momento desde tu panel de configuración. No hay permanencia mínima.',
  },
  {
    q: '¿Cómo funciona la prueba gratuita?',
    a: 'Tenés 14 días para probar el plan Profesional o Premium sin cargo. No necesitás tarjeta de crédito para comenzar.',
  },
  {
    q: '¿Qué medios de pago aceptan?',
    a: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, Amex), transferencia bancaria y Mercado Pago.',
  },
  {
    q: '¿LexConnect cobra comisión por los casos que consigo?',
    a: 'No. LexConnect cobra únicamente la suscripción mensual. No cobramos comisiones por honorarios ni por casos cerrados.',
  },
  {
    q: '¿Los precios incluyen IVA?',
    a: 'Los precios mostrados son finales e incluyen IVA para consumidores finales. Profesionales pueden solicitar factura.',
  },
]

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (data?.role === 'client') redirect('/')
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header user={null} />
      <main className="flex-1 bg-slate-50">
        {/* Hero */}
        <div className="bg-white border-b border-slate-200 py-16 text-center">
          <div className="mx-auto max-w-3xl px-4">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Planes para profesionales del derecho
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Sin comisiones. Sin sorpresas. Elegí el plan que mejor se adapte al crecimiento de tu práctica.
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => {
              const Icon = plan.icon
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl border-2 p-7 flex flex-col ${plan.color} ${
                    plan.highlighted ? 'shadow-xl shadow-blue-100' : 'shadow-sm'
                  }`}
                >
                  {plan.badge && (
                    <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white ${
                      plan.badge === 'Premium' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-blue-600'
                    }`}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="mb-6">
                    {Icon && (
                      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${
                        plan.id === 'premium' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    )}
                    <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                      {plan.period && <span className="text-slate-400 text-sm">{plan.period}</span>}
                    </div>
                    <p className="text-sm text-slate-500 mt-2">{plan.description}</p>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-slate-700">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/registro?rol=abogado&plan=${plan.id}`}
                    className={`w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Firm plan */}
          <div className="mt-10 max-w-5xl mx-auto bg-slate-900 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-3">
                  <Building className="h-6 w-6 text-blue-400" />
                  <h2 className="text-xl font-bold">Plan Estudios Jurídicos</h2>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Para estudios que quieren una presencia profesional y gestionar a todo su equipo en una sola plataforma.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {FIRM_PLAN.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span className="text-xs text-slate-300">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="shrink-0 text-center">
                <div className="text-4xl font-bold mb-1">$39.900</div>
                <div className="text-slate-400 text-sm">/mes · hasta 10 miembros</div>
                <Link
                  href="/contacto?tipo=estudio"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  Hablar con ventas <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-20">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900 text-sm mb-2">{q}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
