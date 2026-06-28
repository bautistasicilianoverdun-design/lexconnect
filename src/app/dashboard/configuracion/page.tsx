'use client'

import { useState, useTransition, useEffect } from 'react'
import { Bell, Lock, Trash2, Mail, AlertTriangle, Eye, Check, X } from 'lucide-react'
import { deleteAccount, changePassword, saveNotificationPrefs, savePrivacyPrefs } from './actions'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type NotifPrefs = {
  notify_proposals: boolean
  notify_messages: boolean
  notify_system: boolean
}

type PrivacyPrefs = {
  profile_public: boolean
}

export default function ConfiguracionPage() {
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Password change
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState(false)
  const [pwdPending, startPwdTransition] = useTransition()

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    notify_proposals: true,
    notify_messages: true,
    notify_system: true,
  })
  const [notifSaved, setNotifSaved] = useState(false)
  const [notifPending, startNotifTransition] = useTransition()

  // Privacy
  const [privacyPrefs, setPrivacyPrefs] = useState<PrivacyPrefs>({ profile_public: true })
  const [privacySaved, setPrivacySaved] = useState(false)
  const [privacyPending, startPrivacyTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/iniciar-sesion'); return }
      setUserEmail(user.email ?? '')
      supabase
        .from('profiles')
        .select('role, notify_proposals, notify_messages, notify_system, profile_public')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (!data) return
          setUserRole(data.role ?? '')
          setNotifPrefs({
            notify_proposals: data.notify_proposals ?? true,
            notify_messages: data.notify_messages ?? true,
            notify_system: data.notify_system ?? true,
          })
          setPrivacyPrefs({ profile_public: data.profile_public ?? true })
        })
    })
  }, [router])

  function handleDelete() {
    if (confirmText !== 'ELIMINAR') return
    setDeleteError('')
    startTransition(async () => {
      const result = await deleteAccount()
      if (!result.success) {
        setDeleteError(result.error ?? 'Error al eliminar la cuenta.')
      } else {
        try { await createClient().auth.signOut() } catch {}
        window.location.href = '/'
      }
    })
  }

  function handlePasswordChange() {
    setPwdError('')
    setPwdSuccess(false)
    if (!currentPwd || !newPwd || !confirmPwd) { setPwdError('Completá todos los campos'); return }
    if (newPwd.length < 8) { setPwdError('La nueva contraseña debe tener al menos 8 caracteres'); return }
    if (newPwd !== confirmPwd) { setPwdError('Las contraseñas no coinciden'); return }
    startPwdTransition(async () => {
      const result = await changePassword(currentPwd, newPwd)
      if (!result.success) {
        setPwdError(result.error ?? 'Error al cambiar contraseña')
      } else {
        setPwdSuccess(true)
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
        setTimeout(() => setPwdSuccess(false), 4000)
      }
    })
  }

  function handleNotifSave() {
    setNotifSaved(false)
    startNotifTransition(async () => {
      await saveNotificationPrefs(notifPrefs)
      setNotifSaved(true)
      setTimeout(() => setNotifSaved(false), 3000)
    })
  }

  function handlePrivacySave() {
    setPrivacySaved(false)
    startPrivacyTransition(async () => {
      await savePrivacyPrefs(privacyPrefs)
      setPrivacySaved(true)
      setTimeout(() => setPrivacySaved(false), 3000)
    })
  }

  const isLawyer = userRole === 'lawyer' || userRole === 'firm_admin'

  const notifItems = [
    { key: 'notify_proposals' as const, label: 'Nuevas propuestas', desc: 'Cuando un abogado responde tu caso' },
    { key: 'notify_messages' as const, label: 'Mensajes nuevos', desc: 'Cuando recibís un mensaje en el chat' },
    { key: 'notify_system' as const, label: 'Actualizaciones del sistema', desc: 'Novedades y mejoras de LexConnect' },
  ]

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
          <p className="text-xs text-slate-400">Para cambiar tu email contactá al soporte.</p>
        </div>
      </div>

      {/* Contraseña */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
            <Lock className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Cambiar contraseña</p>
            <p className="text-xs text-slate-400 mt-0.5">Usá una contraseña de al menos 8 caracteres</p>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Contraseña actual</label>
            <input
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-3 text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-3 text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Confirmá la nueva contraseña</label>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-3 text-sm transition-all"
            />
          </div>

          {pwdError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <X className="h-4 w-4 shrink-0" /> {pwdError}
            </div>
          )}
          {pwdSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
              <Check className="h-4 w-4 shrink-0" /> Contraseña actualizada correctamente
            </div>
          )}

          <button
            onClick={handlePasswordChange}
            disabled={pwdPending}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {pwdPending ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
              </svg>
            ) : null}
            Actualizar contraseña
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
          {notifItems.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-slate-900">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={notifPrefs[key]}
                  onChange={(e) => setNotifPrefs(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-slate-200 peer-checked:bg-blue-600 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 pt-2 flex items-center justify-between">
          {notifSaved && (
            <span className="text-xs text-green-600 flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" /> Guardado
            </span>
          )}
          {!notifSaved && <span />}
          <button
            onClick={handleNotifSave}
            disabled={notifPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {notifPending ? 'Guardando...' : 'Guardar preferencias'}
          </button>
        </div>
      </div>

      {/* Privacidad — solo abogados */}
      {isLawyer && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
              <Eye className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Privacidad</p>
              <p className="text-xs text-slate-400 mt-0.5">Controlá la visibilidad de tu perfil</p>
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Perfil público</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {privacyPrefs.profile_public
                    ? 'Tu perfil aparece en los resultados de búsqueda'
                    : 'Tu perfil está oculto para los clientes'}
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={privacyPrefs.profile_public}
                  onChange={(e) => setPrivacyPrefs({ profile_public: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-slate-200 peer-checked:bg-blue-600 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>
          </div>
          <div className="px-5 pb-5 flex items-center justify-between">
            {privacySaved && (
              <span className="text-xs text-green-600 flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" /> Guardado
              </span>
            )}
            {!privacySaved && <span />}
            <button
              onClick={handlePrivacySave}
              disabled={privacyPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {privacyPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

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

      {/* Modal eliminación */}
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
              <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{deleteError}</p>
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
                ) : <Trash2 className="h-4 w-4" />}
                Eliminar definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
