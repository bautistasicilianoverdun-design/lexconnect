'use client'

import { useState, useTransition } from 'react'
import { Bell, Lock, Trash2, Mail, AlertTriangle } from 'lucide-react'
import { deleteAccount } from './actions'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ConfiguracionPage() {
  const [userEmail, setUserEmail] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/iniciar-sesion')
      else setUserEmail(user.email ?? '')
    })
  }, [router])

  function handleDelete() {
    if (confirmText !== 'ELIMINAR') return
    setDeleteError('')
    startTransition(async () => {
      const result = await deleteAccount()
      if (!result.success) {
        setDeleteError(result.error ?? 'Error al eliminar la cuenta. Intentá de nuevo.')
      } else {
        // Limpiar sesión del cliente antes de redirigir al inicio
        try { await createClient().auth.signOut() } catch {}
        window.location.href = '/'
      }
    })
  }

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
            <p className="text-xs text-slate-400 mt-0.5">{userEmail}</p>
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
          <button
            onClick={() => { setShowDeleteModal(true); setConfirmText(''); setDeleteError('') }}
            className="shrink-0 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
          >
            Eliminar cuenta
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Eliminar cuenta</h3>
                <p className="text-xs text-slate-500">Esta acción es irreversible</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Se eliminarán permanentemente tu perfil, casos, propuestas, mensajes y todos tus datos.
              No podrás recuperar esta información.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Escribí <span className="font-mono text-red-600">ELIMINAR</span> para confirmar
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="ELIMINAR"
                className="w-full h-10 rounded-xl border border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none px-3 text-sm transition-all"
              />
            </div>

            {deleteError && (
              <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {deleteError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText !== 'ELIMINAR' || isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                  </svg>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Eliminar definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
