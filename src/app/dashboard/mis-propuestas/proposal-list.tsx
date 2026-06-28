'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Clock, CheckCircle2, XCircle, ChevronRight, MessageSquare, FileText,
} from 'lucide-react'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} ${days === 1 ? 'dia' : 'dias'}`
}

const PROPOSAL_STATUS: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending:   { label: 'En espera',       className: 'bg-amber-100 text-amber-700',  icon: <Clock className="h-3 w-3" /> },
  accepted:  { label: 'Aceptado',        className: 'bg-green-100 text-green-700',  icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected:  { label: 'No seleccionado', className: 'bg-slate-100 text-slate-500',  icon: <XCircle className="h-3 w-3" /> },
  withdrawn: { label: 'Retirado',        className: 'bg-slate-100 text-slate-500',  icon: <XCircle className="h-3 w-3" /> },
}

const URGENCY_LABELS: Record<string, string> = {
  urgent: 'Urgente', high: 'Alta', medium: 'Media', low: 'Baja',
}
const URGENCY_STYLES: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high:   'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low:    'bg-slate-100 text-slate-600',
}

const FILTERS = [
  { key: 'all',      label: 'Todas' },
  { key: 'pending',  label: 'En espera' },
  { key: 'accepted', label: 'Aceptadas' },
  { key: 'rejected', label: 'No seleccionadas' },
]

export function ProposalList({
  proposals,
  convByCaseId,
}: {
  proposals: any[]
  convByCaseId: Record<string, string>
}) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? proposals : proposals.filter(p => p.status === filter)

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => {
          const count = f.key === 'all' ? proposals.length : proposals.filter(p => p.status === f.key).length
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filter === f.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f.label} ({count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <FileText className="h-8 w-8 mx-auto text-slate-200 mb-2" />
          <p className="text-sm text-slate-400">No hay propuestas en esta categoría.</p>
        </div>
      ) : (
        filtered.map((p: any) => {
          const legalCase = (Array.isArray(p.legal_cases) ? p.legal_cases[0] : p.legal_cases) as any | null
          if (!legalCase) return null

          const cat = (Array.isArray(legalCase.legal_categories) ? legalCase.legal_categories[0] : legalCase.legal_categories) as { name: string } | null
          const prov = (Array.isArray(legalCase.provinces) ? legalCase.provinces[0] : legalCase.provinces) as { name: string } | null
          const clientProfile = (Array.isArray(legalCase.profiles) ? legalCase.profiles[0] : legalCase.profiles) as { full_name: string } | null
          const statusInfo = PROPOSAL_STATUS[p.status] ?? PROPOSAL_STATUS.pending
          const convId = convByCaseId[legalCase.id] ?? null

          return (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* Case info */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {legalCase.urgency && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${URGENCY_STYLES[legalCase.urgency] ?? ''}`}>
                      {URGENCY_LABELS[legalCase.urgency] ?? legalCase.urgency}
                    </span>
                  )}
                  {cat && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {cat.name}
                    </span>
                  )}
                  {prov && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                      {prov.name}
                    </span>
                  )}
                  {legalCase.status === 'closed' && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-400">
                      Caso cerrado
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-slate-900 mb-1">{legalCase.title}</h2>
                <p className="text-sm text-slate-500 line-clamp-2">{legalCase.description}</p>
                {clientProfile && (
                  <p className="text-xs text-slate-400 mt-2">Cliente: {clientProfile.full_name}</p>
                )}
              </div>

              {/* Proposal details */}
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                    <span className="text-xs text-slate-400">{timeAgo(p.created_at)}</span>
                  </div>
                  {(p.proposed_fee || p.fee_type) && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
                      {p.proposed_fee
                        ? `$${Number(p.proposed_fee).toLocaleString('es-AR')}`
                        : p.fee_type === 'to_discuss' ? 'Honorarios a convenir'
                        : p.fee_type === 'contingency' ? 'Sin anticipo - % del resultado'
                        : p.fee_type}
                    </span>
                  )}
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-1.5">Tu propuesta</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{p.message}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {p.status === 'accepted' && (
                    <Link
                      href={convId ? `/dashboard/mensajes?conv=${convId}` : '/dashboard/mensajes'}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Ir al chat
                    </Link>
                  )}
                  <Link
                    href={`/casos/${legalCase.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                  >
                    Ver caso <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
