'use client'

import { useState } from 'react'
import { updateVerificationStatus } from '@/app/dashboard/admin/actions'
import { createClient } from '@/lib/supabase/client'

type Record_ = {
  id: string
  verification_status: string
  verification_notes: string | null
  bar_association: string | null
  matricula_tomo: string | null
  matricula_folio: string | null
  verification_submitted_at: string | null
  verification_documents: string[] | null
  profiles: { full_name: string }[] | { full_name: string } | null
}

const BAR_LABELS: Record<string, string> = {
  cpacf:  'CPACF (Capital Federal)',
  casi:   'CASI (San Isidro)',
  calp:   'CALP (La Plata)',
  camr:   'CAMR (Mar del Plata)',
  casm:   'CASM (San Martin)',
  cabb:   'CABB (Bahia Blanca)',
  calz:   'CALZ (Lomas de Zamora)',
  camor:  'CAMOR (Moron)',
  caqui:  'CAQui (Quilmes)',
  caaza:  'CAA (Azul)',
  cajun:  'CAJ (Junin)',
  caper:  'CAPER (Pergamino)',
  cazar:  'CAZAR (Zarate)',
  cadol:  'CADOL (Dolores)',
  canec:  'CANEC (Necochea)',
  caolav: 'CAOLAV (Olavarria)',
  catan:  'CATAN (Tandil)',
  cac:    'CAC (Cordoba Capital)',
  cacrio: 'CACRIO (Rio Cuarto)',
  cacvil: 'CACVIL (Villa Maria)',
  car:    'CAR (Rosario)',
  casf:   'CASF (Santa Fe Capital)',
  cam:    'CAM (Mendoza)',
  cat:    'CAT (Tucuman)',
  cas:    'CAS (Salta)',
  caj:    'CAJ (Jujuy)',
  caer:   'CAER (Parana)',
  caerg:  'CAERG (Gualeguaychu)',
  cacor:  'CACOR (Corrientes)',
  cami:   'CAMI (Posadas)',
  cach:   'CACH (Resistencia)',
  caf:    'CAF (Formosa)',
  case:   'CASE (Santiago del Estero)',
  calr:   'CALR (La Rioja)',
  cacat:  'CACAT (Catamarca)',
  casj:   'CASJ (San Juan)',
  casl:   'CASL (San Luis)',
  calpa:  'CALPA (Santa Rosa)',
  can:    'CAN (Neuquen)',
  carn:   'CARN (Viedma)',
  cachu:  'CACHU (Comodoro)',
  casc:   'CASC (Rio Gallegos)',
  catdf:  'CATDF (Ushuaia)',
  other:  'Otro colegio',
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    pending:  { label: 'Pendiente', bg: '#FBF3DB', text: '#956400' },
    verified: { label: 'Verificado', bg: '#EDF3EC', text: '#346538' },
    rejected: { label: 'Rechazado', bg: '#FDEBEC', text: '#9F2F2D' },
  }
  const s = map[status] ?? map.pending
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
      style={{ backgroundColor: s.bg, color: s.text }}>
      {s.label}
    </span>
  )
}

export function AdminVerificationTable({ records: initial }: { records: Record_[] }) {
  const [records, setRecords] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [filter, setFilter] = useState<string>('pending')

  async function handleUpdate(id: string, status: 'verified' | 'rejected' | 'pending', note: string) {
    setLoading(id + status)
    const result = await updateVerificationStatus(id, status, note)
    if (!result.error) {
      setRecords(prev => prev.map(r =>
        r.id === id ? { ...r, verification_status: status, verification_notes: note } : r
      ))
      setRejectingId(null)
      setRejectNote('')
    }
    setLoading(null)
  }

  const filtered = filter === 'all' ? records : records.filter(r => r.verification_status === filter)
  const pendingCount = records.filter(r => r.verification_status === 'pending').length

  if (records.length === 0) {
    return (
      <div className="bg-white border border-[#EAEAEA] rounded-xl p-12 text-center">
        <p className="text-sm text-slate-500">No hay solicitudes de verificacion.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'pending',  label: 'Pendientes' },
          { key: 'verified', label: 'Verificados' },
          { key: 'rejected', label: 'Rechazados' },
          { key: 'all',      label: 'Todos' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === f.key
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-[#EAEAEA] text-slate-500 hover:bg-slate-50'
            }`}
          >
            {f.label}
            {f.key === 'pending' && pendingCount > 0
              ? ` (${pendingCount})`
              : f.key !== 'pending'
              ? ` (${f.key === 'all' ? records.length : records.filter(r => r.verification_status === f.key).length})`
              : ''}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-400">No hay solicitudes en esta categoría.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAEAEA]">
            {filtered.map(r => {
              const profileData = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
              const name = profileData?.full_name ?? 'Sin nombre'
              const isExpanded = expanded === r.id
              const isRejecting = rejectingId === r.id
              const hasDocs = (r.verification_documents?.length ?? 0) > 0

              return (
                <div key={r.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <p className="font-semibold text-sm text-slate-900">{name}</p>
                        <StatusPill status={r.verification_status} />
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-500">
                        {r.bar_association && (
                          <span className="font-medium">{BAR_LABELS[r.bar_association] ?? r.bar_association}</span>
                        )}
                        {r.matricula_tomo && r.matricula_folio && (
                          <span>Tomo {r.matricula_tomo} · Folio {r.matricula_folio}</span>
                        )}
                        {r.verification_submitted_at && (
                          <span className="text-slate-400">
                            {new Date(r.verification_submitted_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {r.verification_notes && (
                        <p className="text-xs text-slate-400 mt-1.5 italic">{r.verification_notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      {hasDocs && (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : r.id)}
                          className="px-3 py-1.5 rounded-lg border border-[#EAEAEA] text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          {isExpanded ? 'Ocultar docs' : `Docs (${r.verification_documents!.length})`}
                        </button>
                      )}

                      {r.verification_status === 'pending' && !isRejecting && (
                        <>
                          <button
                            onClick={() => handleUpdate(r.id, 'verified', 'Verificado manualmente por el equipo de LexConnect.')}
                            disabled={!!loading}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition-colors"
                            style={{ backgroundColor: '#346538' }}
                          >
                            {loading === r.id + 'verified' ? '...' : 'Aprobar'}
                          </button>
                          <button
                            onClick={() => { setRejectingId(r.id); setRejectNote('') }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            style={{ backgroundColor: '#FDEBEC', color: '#9F2F2D' }}
                          >
                            Rechazar
                          </button>
                        </>
                      )}

                      {r.verification_status === 'verified' && (
                        <button
                          onClick={() => handleUpdate(r.id, 'rejected', 'Verificación revocada por el equipo de LexConnect.')}
                          disabled={!!loading}
                          className="px-3 py-1.5 rounded-lg border border-[#EAEAEA] text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                        >
                          Revocar
                        </button>
                      )}

                      {r.verification_status === 'rejected' && (
                        <button
                          onClick={() => handleUpdate(r.id, 'pending', 'Puesto en revisión nuevamente por el admin.')}
                          disabled={!!loading}
                          className="px-3 py-1.5 rounded-lg border border-[#EAEAEA] text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                        >
                          Reabrir
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reject with custom note */}
                  {isRejecting && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl space-y-3">
                      <p className="text-xs font-semibold text-red-700">Motivo del rechazo (se notificará al abogado)</p>
                      <textarea
                        value={rejectNote}
                        onChange={e => setRejectNote(e.target.value)}
                        rows={3}
                        placeholder="Ej: Los datos de tomo y folio no coinciden con el registro del colegio..."
                        className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none bg-white"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setRejectingId(null); setRejectNote('') }}
                          className="px-3 py-1.5 rounded-lg border border-[#EAEAEA] text-xs font-medium text-slate-500 hover:bg-white transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleUpdate(r.id, 'rejected', rejectNote.trim() || 'Rechazado por el equipo de LexConnect.')}
                          disabled={!!loading}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition-colors"
                          style={{ backgroundColor: '#9F2F2D' }}
                        >
                          {loading === r.id + 'rejected' ? '...' : 'Confirmar rechazo'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {isExpanded && hasDocs && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {r.verification_documents!.map((path, i) => (
                        <DocButton key={path} path={path} index={i + 1} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function DocButton({ path, index }: { path: string; index: number }) {
  const [loading, setLoading] = useState(false)

  async function open() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.storage.from('case-documents').createSignedUrl(path, 120)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    setLoading(false)
  }

  return (
    <button
      onClick={open}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#EAEAEA] rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
        <polyline points="13 2 13 9 20 9"/>
      </svg>
      {loading ? 'Abriendo...' : `Documento ${index}`}
    </button>
  )
}
