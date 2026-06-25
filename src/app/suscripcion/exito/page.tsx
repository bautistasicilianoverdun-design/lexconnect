import Link from 'next/link'
import { MP_PLANS, PlanKey } from '@/lib/mercadopago'

export default async function SuscripcionExitoPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const { plan } = await searchParams
  const planData = plan ? MP_PLANS[plan as PlanKey] : null

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-6">
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-10 max-w-md w-full text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: '#EDF3EC' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#346538" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Pago exitoso</h1>
        {planData && (
          <p className="text-slate-500 mb-1">
            Suscripcion al plan <span className="font-semibold text-slate-900">{planData.label}</span> activada correctamente.
          </p>
        )}
        <p className="text-sm text-slate-400 mb-8">
          Tu cuenta fue actualizada. Ya podes disfrutar de todos los beneficios del plan.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: '#111111' }}
        >
          Ir al dashboard
        </Link>
      </div>
    </div>
  )
}
