'use client'

import { useState, useTransition, useMemo } from 'react'
import { Search, UserX, UserCheck, ChevronDown } from 'lucide-react'
import { setUserSuspended, setUserRole } from '@/app/dashboard/admin/actions'

type UserRow = {
  id: string
  full_name: string
  email: string
  role: string
  city: string | null
  suspended: boolean | null
  created_at: string
}

const ROLE_OPTS = [
  { value: 'client',     label: 'Cliente' },
  { value: 'lawyer',     label: 'Abogado' },
  { value: 'firm_admin', label: 'Estudio' },
  { value: 'admin',      label: 'Admin' },
]

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  client:     { bg: '#E1F3FE', text: '#1F6C9F' },
  lawyer:     { bg: '#EDF3EC', text: '#346538' },
  firm_admin: { bg: '#FBF3DB', text: '#956400' },
  admin:      { bg: '#FDEBEC', text: '#9F2F2D' },
}

const TAB_FILTERS = [
  { key: 'all',       label: 'Todos' },
  { key: 'client',    label: 'Clientes' },
  { key: 'lawyer',    label: 'Abogados' },
  { key: 'firm_admin',label: 'Estudios' },
  { key: 'admin',     label: 'Admins' },
  { key: 'suspended', label: 'Suspendidos' },
]

export function AdminUsersTable({ users: initialUsers }: { users: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [pending, startTransition] = useTransition()
  const [actionId, setActionId] = useState<string | null>(null)

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialUsers.length, suspended: 0 }
    for (const u of initialUsers) {
      counts[u.role] = (counts[u.role] ?? 0) + 1
      if (u.suspended) counts.suspended++
    }
    return counts
  }, [initialUsers])

  const filtered = useMemo(() => {
    let list = users
    if (tab === 'suspended') list = list.filter(u => u.suspended)
    else if (tab !== 'all') list = list.filter(u => u.role === tab)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(u =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q)
      )
    }
    return list
  }, [users, tab, query])

  async function handleSuspend(userId: string, suspend: boolean) {
    setActionId(userId)
    startTransition(async () => {
      const result = await setUserSuspended(userId, suspend)
      if (result.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, suspended: suspend } : u))
      }
      setActionId(null)
    })
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setActionId(userId)
    startTransition(async () => {
      const result = await setUserRole(userId, newRole)
      if (result.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      }
      setActionId(null)
    })
  }

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {TAB_FILTERS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              tab === t.key
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.label}
            {tabCounts[t.key] !== undefined && (
              <span className={`ml-1.5 ${tab === t.key ? 'text-slate-300' : 'text-slate-400'}`}>
                {tabCounts[t.key]}
              </span>
            )}
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
          placeholder="Buscar por nombre, email o ciudad..."
          className="flex-1 text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-400">No hay usuarios que coincidan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EAEAEA] bg-[#F9F9F8]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuario</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rol</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ciudad</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Registro</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {filtered.map(u => {
                  const roleStyle = ROLE_STYLES[u.role] ?? ROLE_STYLES.client
                  const isLoading = actionId === u.id && pending
                  return (
                    <tr key={u.id} className={`hover:bg-[#F9F9F8] transition-colors ${u.suspended ? 'opacity-60' : ''}`}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{u.full_name || '—'}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{u.email || '—'}</td>
                      <td className="px-5 py-3">
                        <div className="relative inline-flex items-center gap-1">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
                            style={{ backgroundColor: roleStyle.bg, color: roleStyle.text }}
                          >
                            {ROLE_OPTS.find(r => r.value === u.role)?.label ?? u.role}
                          </span>
                          <div className="relative">
                            <select
                              disabled={isLoading}
                              value={u.role}
                              onChange={e => handleRoleChange(u.id, e.target.value)}
                              className="absolute inset-0 opacity-0 cursor-pointer w-6"
                            >
                              {ROLE_OPTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                            <ChevronDown className="h-3 w-3 text-slate-400" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{u.city || '—'}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs">
                        {new Date(u.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3">
                        {u.suspended ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Suspendido</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Activo</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {u.suspended ? (
                          <button
                            disabled={isLoading}
                            onClick={() => handleSuspend(u.id, false)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            {isLoading ? 'Procesando...' : 'Activar'}
                          </button>
                        ) : (
                          <button
                            disabled={isLoading}
                            onClick={() => handleSuspend(u.id, true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <UserX className="h-3.5 w-3.5" />
                            {isLoading ? 'Procesando...' : 'Suspender'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-right">{filtered.length} usuario{filtered.length !== 1 ? 's' : ''}</p>
    </div>
  )
}
