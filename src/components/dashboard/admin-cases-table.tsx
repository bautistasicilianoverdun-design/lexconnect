'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ExternalLink } from 'lucide-react'

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

export function AdminCasesTable({ cases: initial }: { cases: CaseRow[] }) {
  const [cases, setCases] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const supabase = createClient()

  async function updateCaseStatus(id: string, status: string) {
    setLoading(id + status)
    const { error } = await supabase.from('legal_cases').update({ status }).eq('id', id)
    if (!error) setCases(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    setLoading(null)
  }

  const filtered = filter === 'all' ? cases : cases.filter(c => c.status === filter)

  if (cases.length === 0) {
    return (
      <div className="bg-white border border-[#EAEAEA] rounded-xl p-8 text-center">
        <p className="text-sm text-slate-400">No hay casos.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'open', 'in_progress', 'closed', 'archived'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === f
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-[#EAEAEA] text-slate-500 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'Todos' : STATUS_STYLES[f]?.label ?? f}
            {f === 'all'
              ? ` (${cases.length})`
              : ` (${cases.filter(c => c.status === f).length})`
            }
          </button>
        ))}
      </div>

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
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {filtered.map(c => {
                const statusStyle = STATUS_STYLES[c.status] ?? STATUS_STYLES.open
                const urgencyStyle = URGENCY_STYLES[c.urgency] ?? URGENCY_STYLES.low
                const clientData = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
                return (
                  <tr key={c.id} className="hover:bg-[#F9F9F8] transition-colors">
                    <td className="px-5 py-3 max-w-[180px]">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 truncate">{c.title}</span>
                        <a
                          href={`/casos/${c.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-slate-300 hover:text-blue-500 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
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
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {c.status !== 'archived' && (
                          <button
                            onClick={() => updateCaseStatus(c.id, 'archived')}
                            disabled={loading === c.id + 'archived'}
                            className="px-2 py-1 rounded-lg text-xs font-medium border border-[#EAEAEA] text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                          >
                            {loading === c.id + 'archived' ? '...' : 'Archivar'}
                          </button>
                        )}
                        {c.status === 'archived' && (
                          <button
                            onClick={() => updateCaseStatus(c.id, 'open')}
                            disabled={loading === c.id + 'open'}
                            className="px-2 py-1 rounded-lg text-xs font-medium border border-[#EAEAEA] text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                          >
                            {loading === c.id + 'open' ? '...' : 'Reabrir'}
                          </button>
                        )}
                        {c.status === 'open' && (
                          <button
                            onClick={() => updateCaseStatus(c.id, 'closed')}
                            disabled={loading === c.id + 'closed'}
                            className="px-2 py-1 rounded-lg text-xs font-medium border border-[#EAEAEA] text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                          >
                            {loading === c.id + 'closed' ? '...' : 'Cerrar'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
