import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MP_PLANS } from '@/lib/mercadopago'
import { PlanSubscribeButton } from '@/components/dashboard/plan-subscribe-button'

export const metadata = { title: 'Mi suscripcion — LexConnect' }

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  active:   { label: 'Activa',     bg: '#EDF3EC', text: '#346538' },
  pending:  { label: 'Pendiente',  bg: '#FBF3DB', text: '#956400' },
  past_due: { label: 'Vencida',    bg: '#FDEBEC', text: '#9F2F2D' },
  cancelled:{ label: 'Cancelada',  bg: '#F1F5F9', text: '#64748b' },
  free:     { label: 'Plan gratis',bg: '#F1F5F9', text: '#64748b' },
}

export default async function SuscripcionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'lawyer') redirect('/dashboard')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: lp } = await supabase
    .from('lawyer_profiles')
    .select('plan_type, plan_expires_at')
    .eq('user_id', user.id)
    .single()

  const currentPlan = lp?.plan_type ?? 'free'
  const subStatus = sub?.status ?? 'free'
  const statusStyle = STATUS_STYLES[subStatus] ?? STATUS_STYLES.free
  const planData = currentPlan !== 'free' ? MP_PLANS[currentPlan as keyof typeof MP_PLANS] : null

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi suscripcion</h1>
        <p className="text-sm text-slate-500 mt-1">Gestioná tu plan de LexConnect</p>
      </div>

      {/* Estado actual */}
      <div className="bg-white border border-[#EAEAEA] rounded-xl p-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Plan actual</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-slate-900">
              {planData ? `Plan ${planData.label}` : 'Plan gratuito'}
            </p>
            {planData && (
              <p className="text-sm text-slate-500 mt-0.5">
                ${Number(planData.amount).toLocaleString('es-AR')} / mes
              </p>
            )}
            {lp?.plan_expires_at && (
              <p className="text-xs text-slate-400 mt-1">
                Vence el {new Date(lp.plan_expires_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
            style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
          >
            {statusStyle.label}
          </span>
        </div>

        {currentPlan === 'free' && (
          <p className="text-sm text-slate-500 mt-4 pt-4 border-t border-[#EAEAEA]">
            Con el plan gratuito podés enviar hasta 3 propuestas por mes. Suscribite a un plan pago para desbloquear propuestas ilimitadas y mayor visibilidad.
          </p>
        )}
      </div>

      {/* Planes disponibles */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
          {currentPlan === 'free' ? 'Elegí tu plan' : 'Cambiar de plan'}
        </h2>
        <div className="space-y-3">
          {(Object.entries(MP_PLANS) as [string, typeof MP_PLANS[keyof typeof MP_PLANS]][]).map(([key, plan]) => {
            const isCurrent = key === currentPlan
            return (
              <div
                key={key}
                className="bg-white border rounded-xl p-5 transition-all"
                style={{ borderColor: isCurrent ? '#111111' : '#EAEAEA' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900">{plan.label}</p>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-900 text-white">
                          Actual
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-bold text-slate-900">
                      ${Number(plan.amount).toLocaleString('es-AR')}
                      <span className="text-sm font-normal text-slate-400"> / mes</span>
                    </p>
                    <ul className="mt-3 space-y-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#346538" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {!isCurrent && (
                    <PlanSubscribeButton planKey={key} planLabel={plan.label} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Los pagos se procesan de forma segura a traves de MercadoPago. Podes cancelar tu suscripcion en cualquier momento.
      </p>
    </div>
  )
}
