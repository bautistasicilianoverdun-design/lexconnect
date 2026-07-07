'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search } from 'lucide-react'

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

export function AdminSubscriptionsTable({ subscriptions: initial }: { subscriptions: SubRow[] }) {
  const [subs, setSubs] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [changingPlan, setChangingPlan] = useState<string | null>(null)
  const supabase = createClient()

  async function updateStatus(id: string, status: string) {
    setLoading(id + status)
    const { error } = await supabase.from('subscriptions').update({ status }).eq('id', id)
    if (!error) setSubs(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    setLoading(null)
  }

  async function changePlan(id: string, plan_type: string) {
    setLoading(id + 'plan')
    const { error } = await supabase.from('subscriptions').update({ plan_type }).eq('id', id)
    if (!error) setSubs(prev => prev.map(s => s.id === id ? { ...s, plan_type } : s))
    setLoading(null)
    setChangingPlan(null)
  }

  const filtered = (() => {
    let list = filter === 'all' ? subs : subs.filter(s => s.status === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(s => {
        const profileData = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles
        return profileData?.full_name?.toLowerCase().includes(q)
      })
    }
    return list
  })()

  if (subs.length === 0) {
    return (
      <div className="bg-white border border-[#EAEAEA] rounded-xl p-8 text-center">
        <p className="text-sm text-slate-400">No hay suscripciones todavia.</p>
      </div>
    )
  }

  const totalRevenue = subs.filter(s => s.status === 'active').reduce((acc, s) => acc + (s.amount ?? 0), 0)

  return (
    <div className="space-y-3">
      {/* Revenue summary */}
      {totalRevenue > 0 && (
        <div className="bg-white border border-[#EAEAEA] rounded-xl px-5 py-3 flex items-center gap-6">
          <div>
            <p className="text-xs text-slate-400">Ingresos activos (MRR)</p>
            <p className="text-lg font-bold text-slate-900">${totalRevenue.toLocaleString('es-AR')}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Suscripciones activas</p>
            <p className="text-lg font-bold text-slate-900">{subs.filter(s => s.status === 'active').length}</p>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'pending', 'past_due', 'cancelled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === f
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-[#EAEAEA] text-slate-500 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'Todas' : STATUS_STYLES[f]?.label ?? f}
            {f === 'all'
              ? ` (${subs.length})`
              : ` (${subs.filter(s => s.status === f).length})`
            }
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 h-9 rounded-lg border border-slate-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre del abogado..."
          className="flex-1 text-sm outline-none placeholder:text-slate-400"
        />
      </div>

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
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {filtered.map(s => {
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
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5 flex-wrap items-center">
                        {s.status === 'active' && (
                          <button
                            onClick={() => updateStatus(s.id, 'cancelled')}
                            disabled={loading === s.id + 'cancelled'}
                            className="px-2 py-1 rounded-lg text-xs font-medium border border-[#EAEAEA] text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                          >
                            {loading === s.id + 'cancelled' ? '...' : 'Cancelar'}
                          </button>
                        )}
                        {(s.status === 'cancelled' || s.status === 'past_due') && (
                          <button
                            onClick={() => updateStatus(s.id, 'active')}
                            disabled={loading === s.id + 'active'}
                            className="px-2 py-1 rounded-lg text-xs font-medium border border-[#EAEAEA] text-green-600 hover:bg-green-50 disabled:opacity-40 transition-colors"
                          >
                            {loading === s.id + 'active' ? '...' : 'Activar'}
                          </button>
                        )}
                        {s.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(s.id, 'active')}
                            disabled={loading === s.id + 'active'}
                            className="px-2 py-1 rounded-lg text-xs font-medium border border-[#EAEAEA] text-green-600 hover:bg-green-50 disabled:opacity-40 transition-colors"
                          >
                            {loading === s.id + 'active' ? '...' : 'Aprobar'}
                          </button>
                        )}
                        {changingPlan === s.id ? (
                          <div className="flex items-center gap-1">
                            <select
                              defaultValue={s.plan_type}
                              onChange={e => changePlan(s.id, e.target.value)}
                              disabled={loading === s.id + 'plan'}
                              className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                            >
                              {Object.entries(PLAN_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                              ))}
                            </select>
                            <button onClick={() => setChangingPlan(null)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setChangingPlan(s.id)}
                            className="px-2 py-1 rounded-lg text-xs font-medium border border-[#EAEAEA] text-slate-500 hover:bg-slate-50 transition-colors"
                          >
                            Plan
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
