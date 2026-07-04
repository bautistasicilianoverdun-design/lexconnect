import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MP_PLANS } from '@/lib/mercadopago'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PricingSubscribeButton } from '@/components/landing/pricing-subscribe-button'

export const metadata = { title: 'Precios — LexConnect' }

const FREE_FEATURES = [
  'Hasta 3 propuestas por mes',
  'Perfil público de abogado',
  'Mensajeria con clientes',
  'Acceso a casos disponibles',
  'Verificación de identidad',
]

const FAQ = [
  { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí. No hay contratos ni permanencia mínima. Seguirás teniendo acceso hasta el fin del período pagado.' },
  { q: '¿Qué medios de pago aceptan?', a: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, Amex) y todos los medios disponibles en MercadoPago.' },
  { q: '¿LexConnect cobra comisión por los casos?', a: 'No. Cobramos únicamente la suscripción mensual. Sin comisiones por honorarios ni por casos cerrados.' },
  { q: '¿Los precios incluyen IVA?', a: 'Los precios mostrados son finales. Profesionales pueden solicitar factura a soporte.' },
]

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isLawyer = false
  let currentPlan: string | null = null

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    isLawyer = profile?.role === 'lawyer'
    if (isLawyer) {
      const { data: lp } = await supabase.from('lawyer_profiles').select('plan_type').eq('user_id', user.id).single()
      currentPlan = lp?.plan_type ?? 'free'
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header user={null} />
      <main className="flex-1 bg-[#F7F6F3]">

        {/* Hero */}
        <div className="bg-white border-b border-[#EAEAEA] py-20 text-center">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Planes y precios</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-4" style={{ letterSpacing: '-0.02em' }}>
              El plan adecuado para cada abogado
            </h1>
            <p className="text-lg text-slate-500">
              Empezá gratis. Escalá cuando estés listo. Sin contratos ni permanencia mínima.
            </p>
          </div>
        </div>

        {/* Plans grid */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

            {/* Free */}
            <div className="bg-white border border-[#EAEAEA] rounded-xl p-6 flex flex-col">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Básico</p>
                <p className="text-3xl font-bold text-slate-900">$0</p>
                <p className="text-sm text-slate-400 mt-0.5">Para siempre</p>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              {!user ? (
                <Link href="/registro" className="block text-center py-2.5 rounded-lg border border-[#EAEAEA] text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  Empezar gratis
                </Link>
              ) : currentPlan === 'free' ? (
                <div className="py-2.5 rounded-lg bg-slate-100 text-center text-sm font-semibold text-slate-400">Plan actual</div>
              ) : (
                <div className="py-2.5 rounded-lg border border-[#EAEAEA] text-center text-sm text-slate-400">Plan base</div>
              )}
            </div>

            {/* Paid plans */}
            {(Object.entries(MP_PLANS) as [string, typeof MP_PLANS[keyof typeof MP_PLANS]][]).map(([key, plan], i) => {
              const isCurrent = key === currentPlan
              const isPopular = i === 1
              return (
                <div
                  key={key}
                  className="bg-white border rounded-xl p-6 flex flex-col relative"
                  style={{ borderColor: isPopular ? '#111111' : '#EAEAEA' }}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                        Más popular
                      </span>
                    </div>
                  )}
                  <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{plan.label}</p>
                    <p className="text-3xl font-bold text-slate-900">
                      ${Number(plan.amount).toLocaleString('es-AR')}
                    </p>
                    <p className="text-sm text-slate-400 mt-0.5">por mes · ARS</p>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#346538" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <div className="py-2.5 rounded-lg bg-slate-900 text-center text-sm font-semibold text-white">Plan actual</div>
                  ) : isLawyer ? (
                    <PricingSubscribeButton planKey={key} planLabel={plan.label} isPopular={isPopular} />
                  ) : (
                    <Link
                      href="/registro?rol=lawyer"
                      className="block text-center py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                      style={{ backgroundColor: '#111111' }}
                    >
                      Comenzar con {plan.label}
                    </Link>
                  )}
                </div>
              )
            })}
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-8 text-center">Preguntas frecuentes</h2>
            <div className="divide-y divide-[#EAEAEA]">
              {FAQ.map(item => (
                <div key={item.q} className="py-5">
                  <p className="font-semibold text-sm text-slate-900 mb-2">{item.q}</p>
                  <p className="text-sm text-slate-500">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
