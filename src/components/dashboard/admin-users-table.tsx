'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type UserRow = {
  id: string
  full_name: string
  role: string
  created_at: string
}

const ROLE_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  client:     { label: 'Cliente',    bg: '#E1F3FE', text: '#1F6C9F' },
  lawyer:     { label: 'Abogado',   bg: '#EDF3EC', text: '#346538' },
  firm_admin: { label: 'Estudio',   bg: '#FBF3DB', text: '#956400' },
  admin:      { label: 'Admin',     bg: '#FDEBEC', text: '#9F2F2D' },
}

export function AdminUsersTable({ users }: { users: UserRow[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  async function changeRole(userId: string, newRole: string) {
    setLoading(userId)
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    router.refresh()
    setLoading(null)
  }

  if (users.length === 0) {
    return (
      <div className="bg-white border border-[#EAEAEA] rounded-xl p-8 text-center">
        <p className="text-sm text-slate-400">No hay usuarios.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EAEAEA] bg-[#F9F9F8]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rol</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Registro</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAEAEA]">
            {users.map(u => {
              const roleStyle = ROLE_LABELS[u.role] ?? ROLE_LABELS.client
              return (
                <tr key={u.id} className="hover:bg-[#F9F9F8] transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-900">{u.full_name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
                      style={{ backgroundColor: roleStyle.bg, color: roleStyle.text }}>
                      {roleStyle.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">
                    {new Date(u.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3">
                    <select
                      disabled={!!loading}
                      defaultValue={u.role}
                      onChange={e => changeRole(u.id, e.target.value)}
                      className="text-xs border border-[#EAEAEA] rounded-lg px-2 py-1 text-slate-700 bg-white focus:outline-none disabled:opacity-50"
                    >
                      <option value="client">Cliente</option>
                      <option value="lawyer">Abogado</option>
                      <option value="firm_admin">Estudio</option>
                      <option value="admin">Admin</option>
                    </select>
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
