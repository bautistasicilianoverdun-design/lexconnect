'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { FileText, Upload, Shield, Sparkles, ChevronRight, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { createClient } from '@/lib/supabase/client'
import { publishCase } from './actions'

const CATEGORIES = [
  { id: 'laboral', name: 'Derecho Laboral' },
  { id: 'civil', name: 'Derecho Civil' },
  { id: 'penal', name: 'Derecho Penal' },
  { id: 'comercial', name: 'Derecho Comercial' },
  { id: 'societario', name: 'Derecho Societario' },
  { id: 'familia', name: 'Derecho de Familia' },
  { id: 'inmobiliario', name: 'Derecho Inmobiliario' },
  { id: 'tributario', name: 'Derecho Tributario' },
  { id: 'consumidor', name: 'Defensa del Consumidor' },
  { id: 'transito', name: 'Accidentes de Tránsito' },
]

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut',
  'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
  'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
  'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
  'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]

const URGENCIES = [
  { id: 'low',    label: 'Baja',        desc: 'Puedo esperar semanas',       color: 'border-slate-200 hover:border-slate-400' },
  { id: 'medium', label: 'Media',       desc: 'Necesito respuesta en días',  color: 'border-blue-200 hover:border-blue-500' },
  { id: 'high',   label: 'Alta',        desc: 'Es urgente (< 48h)',          color: 'border-orange-200 hover:border-orange-500' },
  { id: 'urgent', label: 'Muy urgente', desc: 'Es una emergencia',           color: 'border-red-200 hover:border-red-500' },
]

type Status = 'idle' | 'loading' | 'success' | 'error'

function NewCasePageInner() {
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory]     = useState('')
  const [province, setProvince]     = useState('')
  const [urgency, setUrgency]       = useState('medium')
  const [visibility, setVisibility] = useState('public')
  const [status, setStatus]         = useState<Status>('idle')
  const [errorMsg, setErrorMsg]     = useState('')
  const [sensitiveWarning, setSensitiveWarning] = useState(false)

  // Abogado pre-seleccionado desde el perfil público
  const searchParams = useSearchParams()
  const preferredSlug = searchParams.get('abogado')
  const [preferredLawyer, setPreferredLawyer] = useState<{ name: string; slug: string } | null>(null)

  useEffect(() => {
    if (!preferredSlug) return
    const supabase = createClient()
    supabase
      .from('lawyer_profiles')
      .select('slug, profiles!user_id(full_name)')
      .eq('slug', preferredSlug)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
        setPreferredLawyer({ name: (profile as any)?.full_name ?? 'Abogado', slug: data.slug })
      })
  }, [preferredSlug])

  const SENSITIVE = /\b(\d{2}\.?\d{3}\.?\d{3}|\+?54\s?\d{10,11}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+)\b/

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setDescription(val)
    setSensitiveWarning(SENSITIVE.test(val))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    // — Validaciones —
    if (!title.trim())                          { setErrorMsg('El título es obligatorio.');                          return }
    if (!category)                              { setErrorMsg('Seleccioná una categoría legal.');                   return }
    if (!province)                              { setErrorMsg('Seleccioná una provincia.');                         return }
    if (description.trim().length < 100)        { setErrorMsg('La descripción debe tener al menos 100 caracteres.'); return }

    setStatus('loading')

    try {
      const result = await publishCase({ title, description, category, province, urgency, visibility, preferredLawyerSlug: preferredSlug ?? undefined })

      if (!result.success) {
        setErrorMsg(
          result.error === 'not_authenticated'
            ? 'Tenés que iniciar sesión para publicar un caso.'
            : result.error || 'No se pudo publicar el caso. Intentá de nuevo.'
        )
        setStatus('error')
        return
      }

      setStatus('success')
    } catch {
      setErrorMsg('Error de conexión. Verificá tu internet e intentá de nuevo.')
      setStatus('error')
    }
  }

  // ——— Pantalla de éxito ———
  if (status === 'success') {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header user={null} />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-md w-full text-center shadow-sm">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto mb-5">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">¡Caso publicado con éxito!</h2>
            <p className="text-sm text-slate-500 mb-8">
              Tu caso ya está visible para los abogados. Recibirás propuestas en las próximas horas.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { window.location.href = '/dashboard/mis-casos' }}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Ver mis casos
              </button>
              <button
                onClick={() => { window.location.href = '/casos/nuevo' }}
                className="w-full h-11 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl transition-colors text-sm"
              >
                Publicar otro caso
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ——— Formulario ———
  const isLoading = status === 'loading'

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header user={null} />
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-3xl px-4">
          {/* Breadcrumb */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Link href="/" className="hover:text-slate-900">Inicio</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/casos" className="hover:text-slate-900">Casos</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-slate-900">Publicar caso</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Publicar un caso legal</h1>
            <p className="text-slate-500 mt-1">
              Describí tu situación y recibirás propuestas de abogados especializados
            </p>
          </div>

          {/* Banner abogado pre-seleccionado */}
          {preferredLawyer && (
            <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shrink-0">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900">Caso dirigido a un abogado específico</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  <span className="font-medium">{preferredLawyer.name}</span> recibirá una notificación cuando publiques este caso.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreferredLawyer(null)}
                className="text-xs text-blue-500 hover:text-blue-700 shrink-0 underline"
              >
                Quitar
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del caso */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                Información del caso
              </h2>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Título del caso <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  placeholder="Ej: Despido sin causa después de 5 años de antigüedad"
                  className="w-full h-11 rounded-lg border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <p className="text-xs text-slate-400 text-right">{title.length}/120</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Categoría legal <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 rounded-lg border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  >
                    <option value="">Seleccionar...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Provincia <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full h-11 rounded-lg border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  >
                    <option value="">Seleccionar...</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-semibold text-slate-900">Descripción del caso</h2>

              {sensitiveWarning && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-700">Datos sensibles detectados</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Detectamos posibles datos personales (DNI, teléfono, email). Serán ocultados automáticamente antes de publicar.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Descripción detallada <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={handleDescriptionChange}
                  rows={6}
                  placeholder="Describí tu situación con el mayor detalle posible. No incluyas datos personales como DNI, teléfonos ni correos — los abogados no los necesitan para evaluar tu caso."
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
                <p className={`text-xs ${description.trim().length >= 100 ? 'text-green-600' : 'text-slate-400'}`}>
                  {description.length}/2000 · {description.trim().length >= 100 ? '✓ Longitud suficiente' : `Mínimo 100 caracteres (faltan ${100 - description.trim().length})`}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700">
                  Nuestra IA clasificará y resumirá tu caso automáticamente para facilitar el matching con abogados especialistas.
                </p>
              </div>
            </div>

            {/* Urgencia */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-semibold text-slate-900">Nivel de urgencia</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {URGENCIES.map(({ id, label, desc, color }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setUrgency(id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${color} ${
                      urgency === id ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                    }`}
                  >
                    <div className="font-semibold text-sm text-slate-900">{label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Visibilidad */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-slate-500" />
                Visibilidad del caso
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    visibility === 'public' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold text-sm text-slate-900">🌐 Público</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Visible para todos los abogados verificados. Más propuestas y mejor matching.
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    visibility === 'private' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold text-sm text-slate-900">🔒 Privado</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Solo visible para abogados que vos invites directamente.
                  </div>
                </button>
              </div>
            </div>

            {/* Documentos */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-semibold text-slate-900">Documentación (opcional)</h2>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">Arrastrá o hacé clic para adjuntar archivos</p>
                <p className="text-xs text-slate-400 mt-1">PDF, Word, imágenes · Máx. 10MB por archivo</p>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Los documentos son privados y solo los ven los abogados que vos autorices
              </p>
            </div>

            {/* Submit */}
            <div className="space-y-3">
              {errorMsg && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-700">{errorMsg}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Publicando...
                    </>
                  ) : (
                    'Publicar caso'
                  )}
                </button>
                <Link
                  href="/casos"
                  className="h-12 px-6 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl transition-colors flex items-center justify-center"
                >
                  Cancelar
                </Link>
              </div>
            </div>

            <p className="text-xs text-center text-slate-400">
              Al publicar aceptás nuestros{' '}
              <Link href="/terminos" className="underline">Términos de uso</Link>.
              Toda la información pasa por moderación automática antes de ser visible.
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}

export default function NewCasePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <NewCasePageInner />
    </Suspense>
  )
}
