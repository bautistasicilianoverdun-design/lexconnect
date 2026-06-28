import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  CheckCircle2, User, Briefcase, Shield, Video, ChevronRight, Star,
} from 'lucide-react'

type Step = {
  id: string
  title: string
  description: string
  cta: string
  href: string
  icon: React.FC<{ className?: string }>
  done: boolean
  optional?: boolean
  pending?: boolean
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, bio, city')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'lawyer' && profile?.role !== 'firm_admin') {
    redirect('/dashboard')
  }

  const { data: lp } = await supabase
    .from('lawyer_profiles')
    .select('id, license_number, verification_status, videocall_link')
    .eq('user_id', user.id)
    .maybeSingle()

  const { count: specialtiesCount } = await supabase
    .from('lawyer_specialties')
    .select('*', { count: 'exact', head: true })
    .eq('lawyer_id', lp?.id ?? '')

  const steps: Step[] = [
    {
      id: 'perfil',
      title: 'Completá tu perfil básico',
      description: 'Agregá tu ciudad, una bio profesional y tu foto de perfil. Es lo primero que ven los clientes.',
      cta: 'Editar perfil',
      href: '/dashboard/perfil',
      icon: User,
      done: !!(profile?.bio && profile?.city),
    },
    {
      id: 'especialidades',
      title: 'Agregá tus especialidades',
      description: 'Indicá en qué áreas del derecho trabajás. Esto te permite aparecer en las búsquedas relevantes.',
      cta: 'Agregar especialidades',
      href: '/dashboard/perfil',
      icon: Briefcase,
      done: (specialtiesCount ?? 0) > 0,
    },
    {
      id: 'matricula',
      title: 'Verificá tu matrícula',
      description: 'La verificación te da el sello azul en tu perfil y genera más confianza en los clientes.',
      cta: 'Verificar matrícula',
      href: '/dashboard/verificacion',
      icon: Shield,
      done: lp?.verification_status === 'verified',
      pending: lp?.verification_status === 'pending',
    },
    {
      id: 'videollamada',
      title: 'Configurá tu link de videollamada',
      description: 'Agregá tu link de Zoom, Google Meet o Calendly para que los clientes puedan agendarte fácilmente.',
      cta: 'Agregar link',
      href: '/dashboard/perfil',
      icon: Video,
      done: !!(lp?.videocall_link),
      optional: true,
    },
  ]

  const completedSteps = steps.filter(s => s.done).length
  const totalRequired = steps.filter(s => !s.optional).length
  const requiredDone = steps.filter(s => !s.optional && s.done).length
  const allRequiredDone = requiredDone === totalRequired
  const progressPct = Math.round((completedSteps / steps.length) * 100)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Bienvenido, {profile?.full_name?.split(' ')[0] ?? 'abogado'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Completá estos pasos para empezar a recibir clientes en LexConnect.
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">
            {completedSteps} de {steps.length} pasos completados
          </p>
          <p className="text-sm font-bold text-blue-600">{progressPct}%</p>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {allRequiredDone && (
          <p className="mt-3 text-xs text-green-600 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Perfil completo. Ya apareces en los resultados de busqueda.
          </p>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <div
              key={step.id}
              className={`bg-white rounded-2xl border p-5 transition-all ${
                step.done ? 'border-green-200 bg-green-50/30' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  step.done ? 'bg-green-100' : step.pending ? 'bg-amber-100' : 'bg-slate-100'
                }`}>
                  {step.done
                    ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                    : <Icon className={`h-5 w-5 ${step.pending ? 'text-amber-600' : 'text-slate-500'}`} />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className={`font-semibold text-sm ${step.done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {step.title}
                    </p>
                    {step.optional && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-400 font-medium uppercase tracking-wide">Opcional</span>
                    )}
                    {step.pending && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">En revision</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                </div>

                {!step.done && !step.pending && (
                  <Link
                    href={step.href}
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    {step.cta} <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-2xl border border-blue-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-semibold text-blue-900">Tips para destacarte</p>
        </div>
        <ul className="space-y-2 text-xs text-blue-800 leading-relaxed">
          <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">•</span> Respondé las propuestas en menos de 2 horas para aparecer primero.</li>
          <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">•</span> Usá una foto profesional — aumenta la tasa de contacto significativamente.</li>
          <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">•</span> Escribi una bio que explique qué tipos de casos resolvés y tu experiencia.</li>
          <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">•</span> Publicá articulos en tu blog para posicionarte como experto en tu area.</li>
        </ul>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-400">Podés completar esto cuando quieras desde tu perfil.</p>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          Ir al dashboard <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
