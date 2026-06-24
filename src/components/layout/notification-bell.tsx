'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, MessageSquare, FileText, CheckCircle2, Star, Info, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types'

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  message:     { icon: MessageSquare, color: 'text-blue-600',   bg: 'bg-blue-50' },
  proposal:    { icon: FileText,      color: 'text-purple-600', bg: 'bg-purple-50' },
  case_update: { icon: CheckCircle2,  color: 'text-green-600',  bg: 'bg-green-50' },
  review:      { icon: Star,          color: 'text-amber-600',  bg: 'bg-amber-50' },
  system:      { icon: Info,          color: 'text-slate-600',  bg: 'bg-slate-50' },
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'Ahora'
  if (mins < 60) return `Hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days}d`
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const unread = notifications.filter((n) => !n.is_read).length

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cargar notificaciones + suscribirse a Realtime
  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setNotifications((data as Notification[]) ?? [])

      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new as Notification, ...prev])
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    if (!userId) return
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }, [userId])

  const markRead = useCallback(
    async (id: string, link: string | null) => {
      const supabase = createClient()
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
      setOpen(false)
      if (link) router.push(link)
    },
    [router]
  )

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="h-4 w-4 text-slate-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
          {/* Header del dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              Notificaciones {unread > 0 && <span className="text-blue-600">({unread})</span>}
            </h3>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <Check className="h-3 w-3" /> Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="h-8 w-8 mx-auto text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">Sin notificaciones</p>
              </div>
            ) : (
              notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system
                const Icon = config.icon
                return (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id, n.link)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                      !n.is_read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl ${config.bg} shrink-0 mt-0.5`}
                    >
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${
                          !n.is_read
                            ? 'font-semibold text-slate-900'
                            : 'font-medium text-slate-600'
                        }`}
                      >
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                    )}
                  </button>
                )
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2.5">
              <p className="text-[10px] text-slate-400 text-center">
                Mostrando las últimas {notifications.length} notificaciones
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
