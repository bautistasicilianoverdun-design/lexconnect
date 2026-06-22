'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Scale, Eye, EyeOff, ArrowRight, Shield, Users, Briefcase, Building2, Check } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

type Role = 'client' | 'lawyer' | 'firm'

const ROLES = [
  {
    id: 'client' as Role,
    icon: Users,
    title: 'Soy cliente',
    description: 'Busco asesoramiento legal o quiero contratar un abogado',
  },
  {
    id: 'lawyer' as Role,
    icon: Briefcase,
    title: 'Soy abogado',
    description: 'Quiero ofrecer mis servicios profesionales',
  },
  {
    id: 'firm' as Role,
    icon: Building2,
    title: 'Tengo un estudio',
    description: 'Quiero crear la página institucional de mi estudio jurídico',
  },
]

function RegisterForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialRole = (searchParams.get('rol') === 'abogado' ? 'lawyer' : searchParams.get('rol') === 'estudio' ? 'firm' : 'client') as Role

  const [role, setRole] = useState<Role>(initialRole)
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const firstName = (form.elements.namedItem('first_name') as HTMLInputElement)?.value ?? ''
    const lastName = (form.elements.namedItem('last_name') as HTMLInputElement)?.value ?? ''

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
        data: { first_name: firstName, last_name: lastName, role },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Scale className="h-4 w-4 text-white" />
          </div>
          Lex<span className="text-blue-600">Connect</span>
        </Link>
        <Link href="/iniciar-sesion" className="text-sm text-slate-500 hover:text-slate-900">
          ¿Ya tenés cuenta? <span className="font-medium text-blue-600">Iniciar sesión</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Paso 1: elegir rol */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
                <p className="text-sm text-slate-500 mt-1">¿Cómo querés usar LexConnect?</p>
              </div>

              <div className="space-y-3">
                {ROLES.map(({ id, icon: Icon, title, description }) => (
                  <button
                    key={id}
                    onClick={() => setRole(id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      role === id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                      role === id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-slate-900">{title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{description}</div>
                    </div>
                    {role === id && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 shrink-0">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="mt-6 w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Continuar <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Paso 2: datos */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-1"
              >
                ← Volver
              </button>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Tus datos</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Creando cuenta como{' '}
                  <span className="font-medium text-blue-600">
                    {role === 'client' ? 'cliente' : role === 'lawyer' ? 'abogado' : 'estudio jurídico'}
                  </span>
                </p>
              </div>

              {success && (
                <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-4 text-sm text-green-700">
                  <p className="font-semibold mb-1">¡Cuenta creada con éxito!</p>
                  <p>Revisá tu email y hacé click en el link de confirmación. Te vamos a redirigir al dashboard automáticamente.</p>
                  <a href="/" className="mt-3 inline-block text-xs font-semibold text-green-800 underline">
                    Volver al inicio →
                  </a>
                </div>
              )}
              {error && (
                <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">Nombre</label>
                    <input
                      type="text"
                      name="first_name"
                      required
                      placeholder="Juan"
                      className="w-full h-11 rounded-lg border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">Apellido</label>
                    <input
                      type="text"
                      name="last_name"
                      required
                      placeholder="González"
                      className="w-full h-11 rounded-lg border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="tu@correo.com"
                    className="w-full h-11 rounded-lg border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                {role === 'lawyer' && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">Número de matrícula</label>
                    <input
                      type="text"
                      name="license_number"
                      required
                      placeholder="Ej: 12345"
                      className="w-full h-11 rounded-lg border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <p className="text-xs text-slate-400">Verificaremos tu matrícula antes de activar tu perfil</p>
                  </div>
                )}

                {role === 'firm' && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">Nombre del estudio</label>
                    <input
                      type="text"
                      name="firm_name"
                      required
                      placeholder="Ej: Estudio Jurídico González & Asociados"
                      className="w-full h-11 rounded-lg border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      minLength={8}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full h-11 rounded-lg border border-slate-200 px-4 pr-11 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed">
                    Acepto los{' '}
                    <Link href="/terminos" className="text-blue-600 hover:underline">Términos de uso</Link>
                    {' '}y la{' '}
                    <Link href="/privacidad" className="text-blue-600 hover:underline">Política de privacidad</Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      Crear cuenta <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Shield className="h-3.5 w-3.5" />
            Tus datos están protegidos y cifrados
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
