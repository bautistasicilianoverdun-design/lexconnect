'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface Props {
  lawyerProfileId: string | null
  userId: string
  lastName: string
  currentStatus: string
  currentNotes: string | null
  currentBarAssociation: string | null
  currentTomo: string | null
  currentFolio: string | null
  submittedAt: string | null
  existingDocuments: string[]
}

const BAR_ASSOCIATIONS = [
  { value: 'cpacf', label: 'CPACF — Capital Federal', auto: true },
  { value: 'casi',  label: 'CASI — San Isidro (Prov. Buenos Aires)', auto: false },
  { value: 'cac',   label: 'CAC — Cordoba', auto: false },
  { value: 'other', label: 'Otro colegio — revision manual', auto: false },
]

const DOCS_REQUIRED = [
  'Foto del DNI (frente y dorso)',
  'Certificado o carnet de matricula',
  'Foto de perfil profesional',
]

// ------------------------------------------------------------------
// Status display helpers
// ------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    pending:   { label: 'Sin verificar', bg: '#FBF3DB', text: '#956400' },
    verified:  { label: 'Verificado',    bg: '#EDF3EC', text: '#346538' },
    rejected:  { label: 'No aprobado',   bg: '#FDEBEC', text: '#9F2F2D' },
    suspended: { label: 'Suspendido',    bg: '#FDEBEC', text: '#9F2F2D' },
  }
  const s = map[status] ?? map.pending
  return (
    <span
      style={{ backgroundColor: s.bg, color: s.text }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
    >
      <span
        style={{ backgroundColor: s.text }}
        className="w-1.5 h-1.5 rounded-full inline-block"
      />
      {s.label}
    </span>
  )
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function VerificationForm({
  lawyerProfileId,
  userId,
  lastName,
  currentStatus,
  currentNotes,
  currentBarAssociation,
  currentTomo,
  currentFolio,
  submittedAt,
  existingDocuments,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const isVerified = currentStatus === 'verified'

  const [barAssociation, setBarAssociation] = useState(currentBarAssociation ?? '')
  const [tomo, setTomo] = useState(currentTomo ?? '')
  const [folio, setFolio] = useState(currentFolio ?? '')
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState(currentNotes)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null)
  const [uploadedPaths, setUploadedPaths] = useState<string[]>(existingDocuments)

  const selectedBar = BAR_ASSOCIATIONS.find(b => b.value === barAssociation)
  const isAutoVerify = selectedBar?.auto ?? false

  // --------------------------------------------------------------------
  // Upload documents to Supabase Storage
  // --------------------------------------------------------------------
  async function uploadDocuments(): Promise<string[]> {
    const paths: string[] = [...uploadedPaths]
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${userId}/verificacion/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from('case-documents')
        .upload(path, file, { upsert: false })
      if (!error) paths.push(path)
    }
    return paths
  }

  // --------------------------------------------------------------------
  // Submit verification
  // --------------------------------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!barAssociation || !tomo || !folio) {
      setFeedback({ type: 'error', msg: 'Completa todos los campos requeridos.' })
      return
    }

    setUploading(true)
    setFeedback(null)

    try {
      // 1. Upload docs first
      const allPaths = await uploadDocuments()
      setUploadedPaths(allPaths)

      // 2. Save paths to lawyer_profiles immediately
      if (lawyerProfileId) {
        await supabase
          .from('lawyer_profiles')
          .update({ verification_documents: allPaths })
          .eq('id', lawyerProfileId)
      }

      setUploading(false)
      setVerifying(true)

      // 3. Call verify-matricula API
      const res = await fetch('/api/verify-matricula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bar_association: barAssociation,
          tomo,
          folio,
          last_name: lastName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setFeedback({ type: 'error', msg: data.error ?? 'Error al verificar.' })
        return
      }

      const result = data.result
      if (result.status === 'verified') {
        setStatus('verified')
        setNotes(`Verificado automaticamente. Nombre encontrado: ${result.found_name}`)
        setFeedback({ type: 'success', msg: `Verificacion exitosa. Encontramos tu matricula a nombre de "${result.found_name}".` })
      } else if (result.status === 'not_found') {
        setStatus('rejected')
        setNotes(`No encontrado en directorio ${barAssociation.toUpperCase()} con Tomo ${tomo} Folio ${folio}.`)
        setFeedback({ type: 'error', msg: 'No encontramos esa matricula en el directorio oficial. Verifica los datos o contacta soporte.' })
      } else {
        setStatus('pending')
        setNotes('Tu solicitud fue enviada. Un administrador la revisara en 24-48 horas.')
        setFeedback({ type: 'info', msg: 'Solicitud enviada. La revisaremos manualmente en 24-48 horas habiles.' })
      }

      router.refresh()
    } catch {
      setFeedback({ type: 'error', msg: 'Error inesperado. Intenta nuevamente.' })
    } finally {
      setUploading(false)
      setVerifying(false)
    }
  }

  // --------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------
  return (
    <div className="space-y-6">

      {/* Current status card */}
      <div className="bg-white border border-[#EAEAEA] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Estado de verificacion</h2>
          <StatusBadge status={status} />
        </div>

        {status === 'verified' && (
          <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: '#EDF3EC' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#346538" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#346538' }}>Matricula verificada</p>
              {notes && <p className="text-xs mt-1" style={{ color: '#346538', opacity: 0.8 }}>{notes}</p>}
            </div>
          </div>
        )}

        {status === 'pending' && submittedAt && (
          <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: '#FBF3DB' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#956400" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#956400' }}>Revision en curso</p>
              <p className="text-xs mt-1" style={{ color: '#956400', opacity: 0.8 }}>
                {notes ?? 'Estamos revisando tu solicitud. Te notificaremos por email.'}
              </p>
            </div>
          </div>
        )}

        {status === 'rejected' && (
          <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: '#FDEBEC' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9F2F2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#9F2F2D' }}>Verificacion no aprobada</p>
              {notes && <p className="text-xs mt-1" style={{ color: '#9F2F2D', opacity: 0.8 }}>{notes}</p>}
            </div>
          </div>
        )}

        {status === 'pending' && !submittedAt && (
          <p className="text-sm text-slate-500">
            Tu cuenta aun no tiene verificacion de matricula. Completa el formulario para habilitarla.
          </p>
        )}
      </div>

      {/* Form — show always unless verified */}
      {!isVerified && (
        <form onSubmit={handleSubmit} className="bg-white border border-[#EAEAEA] rounded-xl p-6 space-y-6">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            {submittedAt ? 'Actualizar datos de matricula' : 'Enviar solicitud de verificacion'}
          </h2>

          {/* Jurisdiction */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Colegio de abogados
            </label>
            <select
              value={barAssociation}
              onChange={e => setBarAssociation(e.target.value)}
              required
              className="w-full border border-[#EAEAEA] rounded-lg px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"
            >
              <option value="" disabled>Selecciona tu colegio</option>
              {BAR_ASSOCIATIONS.map(b => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
            {selectedBar && (
              <p className="text-xs text-slate-400">
                {selectedBar.auto
                  ? 'Verificacion automatica contra directorio publico'
                  : 'Verificacion manual — un admin revisara tus documentos en 24-48 h'}
              </p>
            )}
          </div>

          {/* Tomo + Folio */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Tomo
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{1,3}"
                maxLength={3}
                placeholder="ej. 45"
                value={tomo}
                onChange={e => setTomo(e.target.value.replace(/\D/g, ''))}
                required
                className="w-full border border-[#EAEAEA] rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Folio
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{1,4}"
                maxLength={4}
                placeholder="ej. 1234"
                value={folio}
                onChange={e => setFolio(e.target.value.replace(/\D/g, ''))}
                required
                className="w-full border border-[#EAEAEA] rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"
              />
            </div>
          </div>

          {/* Document upload */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Documentos requeridos
              </label>
              <ul className="text-xs text-slate-500 space-y-0.5 mb-3">
                {DOCS_REQUIRED.map(d => (
                  <li key={d} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-400 inline-block" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <label className="block">
              <div
                className="border-2 border-dashed border-[#EAEAEA] rounded-xl p-6 text-center cursor-pointer hover:border-slate-400 transition-colors"
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault()
                  const dropped = Array.from(e.dataTransfer.files).filter(f =>
                    ['image/jpeg','image/png','image/webp','application/pdf'].includes(f.type)
                  )
                  setFiles(prev => [...prev, ...dropped])
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p className="text-sm text-slate-500">Solta archivos aca o <span className="text-slate-900 font-medium">hacé clic para seleccionar</span></p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, PDF — max 10 MB por archivo</p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                multiple
                className="sr-only"
                onChange={e => {
                  const selected = Array.from(e.target.files ?? [])
                  setFiles(prev => [...prev, ...selected])
                }}
              />
            </label>

            {/* File list */}
            {(files.length > 0 || uploadedPaths.length > 0) && (
              <div className="space-y-1.5">
                {uploadedPaths.map((p, i) => (
                  <div key={p} className="flex items-center gap-2 text-xs text-slate-600 bg-[#F9F9F8] border border-[#EAEAEA] rounded-lg px-3 py-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#346538" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Documento {i + 1} — ya subido
                  </div>
                ))}
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-600 bg-[#F9F9F8] border border-[#EAEAEA] rounded-lg px-3 py-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                      <polyline points="13 2 13 9 20 9"/>
                    </svg>
                    <span className="truncate max-w-xs">{f.name}</span>
                    <span className="ml-auto text-slate-400">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                    <button
                      type="button"
                      onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                      className="text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className="text-sm px-4 py-3 rounded-lg"
              style={{
                backgroundColor: feedback.type === 'success' ? '#EDF3EC' : feedback.type === 'error' ? '#FDEBEC' : '#E1F3FE',
                color: feedback.type === 'success' ? '#346538' : feedback.type === 'error' ? '#9F2F2D' : '#1F6C9F',
              }}
            >
              {feedback.msg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading || verifying}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: '#111111' }}
          >
            {uploading
              ? 'Subiendo documentos...'
              : verifying
              ? (isAutoVerify ? 'Verificando contra directorio...' : 'Enviando solicitud...')
              : (submittedAt ? 'Reenviar solicitud' : 'Enviar solicitud de verificacion')}
          </button>

          <p className="text-xs text-slate-400 text-center">
            Tus documentos son privados y solo los revisa el equipo de LexConnect.
          </p>
        </form>
      )}

      {/* Info box about the process */}
      <div className="bg-[#F9F9F8] border border-[#EAEAEA] rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Como funciona la verificacion</h3>
        <div className="space-y-2">
          {[
            { bar: 'CPACF (Capital Federal)', desc: 'Verificacion automatica al instante contra el directorio publico del colegio.' },
            { bar: 'CASI (Prov. Buenos Aires) y CAC (Cordoba)', desc: 'Revision manual por nuestro equipo en 24-48 horas habiles.' },
            { bar: 'Otros colegios', desc: 'Revision manual. Adjunta tu carnet y certificado de matricula vigente.' },
          ].map(item => (
            <div key={item.bar} className="flex gap-2.5 text-xs">
              <span className="shrink-0 font-medium text-slate-700 w-52">{item.bar}</span>
              <span className="text-slate-500">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
