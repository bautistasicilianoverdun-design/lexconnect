'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Upload, Shield, Sparkles, ChevronRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { createBrowserClient } from '@supabase/ssr'

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
  { id: 'low', label: 'Baja', desc: 'Puedo esperar semanas', color: 'border-slate-200 hover:border-slate-400' },
  { id: 'medium', label: 'Media', desc: 'Necesito respuesta en días', color: 'border-blue-200 hover:border-blue-500' },
  { id: 'high', label: 'Alta', desc: 'Es urgente (< 48h)', color: 'border-orange-200 hover:border-orange-500' },
  { id: 'urgent', label: 'Muy urgente', desc: 'Es una emergencia', color: 'border-red-200 hover:border-red-500' },
]

export default function NewCasePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [province, setProvince] = useState('')
  const [urgency, setUrgency] = useState('medium')
  const [visibility, setVisibility] = useState('public')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sensitiveWarning, setSensitiveWarning] = useState(false)

  const SENSITIVE_PATTERNS = /\b(\d{2}\.?\d{3}\.?\d{3}|\+?54\s?\d{10,11}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+)\b/

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setDescription(val)
    setSensitiveWarning(SENSITIVE_PATTERNS.test(val))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Tenés que iniciar sesión para publicar un caso.')
      setLoading(false)
      return
    }

    const [{ data: cat }, { data: prov }] = await Promise.all([
      supabase.from('legal_categories').select('id').eq('slug', category).single(),
      supabase.from('provinces').select('id').eq('name', province).single(),
    ])

    const { error: insertError } = await supabase.from('legal_cases').insert({
      client_id: user.id,
      title,
      description,
      category_id: cat?.id ?? null,
      province_id: prov?.id ?? null,
      urgency,
      visibility,
      status: 'open',
    })

    if (insertError) {
      setError('No se pudo publicar el caso. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push('/dashboard/mis-casos')
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header user={null} />
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-3xl px-4">
          {/* Header */}
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

          {error && (
            <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
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
                  required
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
                    required
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
                    required
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
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-700">Datos sensibles detectados</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      Detectamos posibles datos personales (DNI, teléfono, email). Estos serán ocultados automáticamente antes de publicar.
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
                  required
                  rows={6}
                  minLength={100}
                  placeholder="Describí tu situación con el mayor detalle posible. No incluyas datos personales como DNI, teléfonos ni correos — los abogados no los necesitan para evaluar tu caso."
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
                <p className="text-xs text-slate-400">{description.length}/2000 · Mínimo 100 caracteres</p>
              </div>

              {/* IA notice */}
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
                    visibility === 'public'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
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
                    visibility === 'private'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
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
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>Publicar caso</>
                )}
              </button>
              <Link
                href="/casos"
                className="h-12 px-6 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl transition-colors flex items-center justify-center"
              >
                Cancelar
              </Link>
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
