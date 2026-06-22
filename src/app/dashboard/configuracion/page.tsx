import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Settings, Bell, Lock, Trash2, Mail } from 'lucide-react'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500 mt-0.5">Gestioná las preferencias de tu cuenta</p>
      </div>

      {/* Email */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
            <Mail className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Correo electrónico</p>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          </div>
        </div>
        <div className="p-5">
          <p className="text-xs text-slate-400 mb-3">Para cambiar tu email necesitás verificar el nuevo desde tu bandeja de entrada.</p>
          <button className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700">
            Cambiar email
          </button>
        </div>
      </div>

      {/* Contraseña */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
            <Lock className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Contraseña</p>
            <p className="text-xs text-slate-400 mt-0.5">Última actualización desconocida</p>
          </div>
        </div>
        <div className="p-5">
          <button className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700">
            Cambiar contraseña
          </button>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
            <Bell className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
            <p className="text-xs text-slate-400 mt-0.5">Elegí qué alertas recibir por email</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { label: 'Nuevas propuestas', desc: 'Cuando un abogado responde tu caso' },
            { label: 'Mensajes nuevos', desc: 'Cuando recibís un mensaje en el chat' },
            { label: 'Actualizaciones del sistema', desc: 'Novedades y mejoras de LexConnect' },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-slate-900">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <div className="h-5 w-9 rounded-full bg-slate-200 peer-checked:bg-blue-600 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Zona peligrosa */}
      <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-red-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
            <Trash2 className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-700">Zona peligrosa</p>
            <p className="text-xs text-red-400 mt-0.5">Estas acciones no se pueden deshacer</p>
          </div>
        </div>
        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900">Eliminar cuenta</p>
            <p className="text-xs text-slate-400 mt-0.5">Se borrarán todos tus datos permanentemente.</p>
          </div>
          <button className="shrink-0 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors">
            Eliminar cuenta
          </button>
        </div>
      </div>
    </div>
  )
}
