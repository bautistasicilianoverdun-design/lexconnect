'use client'

const PLAN_LABELS: Record<string, string> = {
  professional: 'Profesional',
  premium: 'Premium',
  firm: 'Estudio',
  free: 'Gratuito',
}

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  active:    { label: 'Activa',     bg: '#EDF3EC', text: '#346538' },
  pending:   { label: 'Pendiente',  bg: '#FBF3DB', text: '#956400' },
  past_due:  { label: 'Vencida',   bg: '#FDEBEC', text: '#9F2F2D' },
  cancelled: { label: 'Cancelada', bg: '#F1F5F9', text: '#64748b' },
}

type SubRow = {
  id: string
  plan_type: string
  status: string
  amount: number | null
  current_period_end: string | null
  created_at: string
  profiles: { full_name: string } | { full_name: string }[] | null
}

export function AdminSubscriptionsTable({ subscriptions }: { subscriptions: SubRow[] }) {
  if (subscriptions.length === 0) {
    return (
      <div className="bg-white border border-[#EAEAEA] rounded-xl p-8 text-center">
        <p className="text-sm text-slate-400">No hay suscripciones todavia.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EAEAEA] bg-[#F9F9F8]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Abogado</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Monto</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vencimiento</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Alta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAEAEA]">
            {subscriptions.map(s => {
              const statusStyle = STATUS_STYLES[s.status] ?? STATUS_STYLES.pending
              const profileData = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles
              return (
                <tr key={s.id} className="hover:bg-[#F9F9F8] transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-900">{profileData?.full_name ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-700 text-xs font-medium">{PLAN_LABELS[s.plan_type] ?? s.plan_type}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                      {statusStyle.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-700 text-xs">
                    {s.amount ? `$${Number(s.amount).toLocaleString('es-AR')}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">
                    {s.current_period_end
                      ? new Date(s.current_period_end).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">
                    {new Date(s.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
