'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Record_ = {
  id: string
  verification_status: string
  verification_notes: string | null
  bar_association: string | null
  matricula_tomo: string | null
  matricula_folio: string | null
  verification_submitted_at: string | null
  verification_documents: string[] | null
  profiles: { full_name: string } | null
}

const BAR_LABELS: Record<string, string> = {
  cpacf: 'CPACF (Cte. Federal)',
  casi:  'CASI (San Isidro)',
  cac:   'CAC (Cordoba)',
  other: 'Otro',
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    pending:  { label: 'Pendiente', bg: '#FBF3DB', text: '#956400' },
    verified: { label: 'Verificado', bg: '#EDF3EC', text: '#346538' },
    rejected: { label: 'Rechazado', bg: '#FDEBEC', text: '#9F2F2D' },
  }
  const s = map[status] ?? map.pending
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  )
}

export function AdminVerificationTable({ records }: { records: Record_[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function updateStatus(id: string, status: string, note: string) {
    setLoading(id + status)
    const { error } = await supabase
      .from('lawyer_profiles')
      .update({ verification_status: status, verification_notes: note })
      .eq('id', id)
    if (!error) router.refresh()
    setLoading(null)
  }

  async function getSignedUrl(path: string) {
    const { data } = await supabase.storage
      .from('case-documents')
      .createSignedUrl(path, 120)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  if (records.length === 0) {
    return (
      <div className="bg-white border border-[#EAEAEA] rounded-xl p-12 text-center">
        <p className="text-sm text-slate-500">No hay solicitudes de verificacion.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#EAEAEA]">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
          Solicitudes de verificacion ({records.length})
        </h2>
      </div>

      <div className="divide-y divide-[#EAEAEA]">
        {records.map((r) => {
          const name = r.profiles?.full_name ?? 'Sin nombre'
          const isOpen = expanded === r.id
          const hasDocs = (r.verification_documents?.length ?? 0) > 0

          return (
            <div key={r.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-sm text-slate-900">{name}</p>
                    <StatusPill status={r.verification_status} />
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                    {r.bar_association && (
                      <span className="font-medium">{BAR_LABELS[r.bar_association] ?? r.bar_association}</span>
                    )}
                    {r.matricula_tomo && r.matricula_folio && (
                      <span>Tomo {r.matricula_tomo} Folio {r.matricula_folio}</span>
                    )}
                    {r.verification_submitted_at && (
                      <span className="text-slate-400">
                        Enviado {new Date(r.verification_submitted_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  {r.verification_notes && (
                    <p className="text-xs text-slate-400 mt-1.5 italic">{r.verification_notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {hasDocs && (
                    <button
                      onClick={() => setExpanded(isOpen ? null : r.id)}
                      className="px-3 py-1.5 rounded-lg border border-[#EAEAEA] text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      {isOpen ? 'Ocultar docs' : `Ver docs (${r.verification_documents!.length})`}
                    </button>
                  )}
                  {r.verification_status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(r.id, 'verified', 'Verificado manualmente por el equipo de LexConnect.')}
                        disabled={!!loading}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
                        style={{ backgroundColor: '#346538' }}
                      >
                        {loading === r.id + 'verified' ? '...' : 'Aprobar'}
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, 'rejected', 'Rechazado por el equipo de LexConnect.')}
                        disabled={!!loading}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        style={{ backgroundColor: '#FDEBEC', color: '#9F2F2D' }}
                      >
                        {loading === r.id + 'rejected' ? '...' : 'Rechazar'}
                      </button>
                    </>
                  )}
                  {r.verification_status === 'verified' && (
                    <button
                      onClick={() => updateStatus(r.id, 'rejected', 'Verificacion revocada por el equipo de LexConnect.')}
                      disabled={!!loading}
                      className="px-3 py-1.5 rounded-lg border border-[#EAEAEA] text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      Revocar
                    </button>
                  )}
                  {r.verification_status === 'rejected' && (
                    <button
                      onClick={() => updateStatus(r.id, 'pending', 'Puesto en revision nuevamente por el admin.')}
                      disabled={!!loading}
                      className="px-3 py-1.5 rounded-lg border border-[#EAEAEA] text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      Reabrir
                    </button>
                  )}
                </div>
              </div>

              {isOpen && hasDocs && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.verification_documents!.map((path, i) => (
                    <button
                      key={path}
                      onClick={() => getSignedUrl(path)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#EAEAEA] rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                        <polyline points="13 2 13 9 20 9"/>
                      </svg>
                      Documento {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
