'use client'

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  open:        { label: 'Abierto',    bg: '#EDF3EC', text: '#346538' },
  in_progress: { label: 'En proceso', bg: '#E1F3FE', text: '#1F6C9F' },
  closed:      { label: 'Cerrado',    bg: '#F1F5F9', text: '#64748b' },
  archived:    { label: 'Archivado',  bg: '#F1F5F9', text: '#94a3b8' },
}

const URGENCY_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  urgent: { label: 'Urgente', bg: '#FDEBEC', text: '#9F2F2D' },
  high:   { label: 'Alta',    bg: '#FEF3C7', text: '#92400E' },
  medium: { label: 'Media',   bg: '#E1F3FE', text: '#1F6C9F' },
  low:    { label: 'Baja',    bg: '#F1F5F9', text: '#64748b' },
}

type CaseRow = {
  id: string
  title: string
  status: string
  urgency: string
  created_at: string
  proposals_count: number
  views_count: number
  legal_categories: { name: string } | { name: string }[] | null
  profiles: { full_name: string } | { full_name: string }[] | null
}

export function AdminCasesTable({ cases }: { cases: CaseRow[] }) {
  if (cases.length === 0) {
    return (
      <div className="bg-white border border-[#EAEAEA] rounded-xl p-8 text-center">
        <p className="text-sm text-slate-400">No hay casos.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EAEAEA] bg-[#F9F9F8]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Titulo</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Urgencia</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Propuestas</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAEAEA]">
            {cases.map(c => {
              const statusStyle = STATUS_STYLES[c.status] ?? STATUS_STYLES.open
              const urgencyStyle = URGENCY_STYLES[c.urgency] ?? URGENCY_STYLES.low
              const clientData = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
              return (
                <tr key={c.id} className="hover:bg-[#F9F9F8] transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-900 max-w-[200px] truncate">{c.title}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{clientData?.full_name ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                      {statusStyle.label}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: urgencyStyle.bg, color: urgencyStyle.text }}>
                      {urgencyStyle.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{c.proposals_count}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">
                    {new Date(c.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
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
