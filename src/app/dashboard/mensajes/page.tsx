'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, Search, Phone, Video, MoreVertical, CheckCheck, Check, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

type Profile = { id: string; full_name: string }

type Conversation = {
  id: string
  otherPerson: Profile
  caseTitle: string | null
  lastMessageAt: string | null
  unreadCount: number
  otherUnread: number
  isClient: boolean
}

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'Ahora'
  if (mins < 60) return `Hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  return new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

function formatMsgTime(date: string) {
  return new Date(date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

const AVATAR_COLORS = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-500', 'bg-rose-600']
function avatarColor(id: string) {
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

export default function MensajesPage() {
  const searchParams = useSearchParams()
  const convParam = searchParams.get('conv')
  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(convParam)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Load user + conversations on mount
  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoadingConvs(false); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('conversations')
        .select(`
          id, last_message_at, client_unread, lawyer_unread, is_archived,
          client:profiles!client_id(id, full_name),
          lawyer:profiles!lawyer_id(id, full_name),
          legal_cases(title)
        `)
        .or(`client_id.eq.${user.id},lawyer_id.eq.${user.id}`)
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false, nullsFirst: false })

      const convs: Conversation[] = (data ?? []).map((row: any) => {
        const isClient = row.client?.id === user.id
        const otherPerson: Profile = isClient ? row.lawyer : row.client
        return {
          id: row.id,
          otherPerson: otherPerson ?? { id: '', full_name: 'Usuario' },
          caseTitle: row.legal_cases?.title ?? null,
          lastMessageAt: row.last_message_at,
          unreadCount: isClient ? (row.client_unread ?? 0) : (row.lawyer_unread ?? 0),
          otherUnread: isClient ? (row.lawyer_unread ?? 0) : (row.client_unread ?? 0),
          isClient,
        }
      })

      // If a specific conv was requested and it's not in the list
      // (e.g. brand-new conversation with no messages), fetch it separately
      let finalConvs = convs
      if (convParam && !convs.find((c) => c.id === convParam)) {
        const { data: single } = await supabase
          .from('conversations')
          .select(`
            id, last_message_at, client_unread, lawyer_unread, is_archived,
            client:profiles!client_id(id, full_name),
            lawyer:profiles!lawyer_id(id, full_name),
            legal_cases(title)
          `)
          .eq('id', convParam)
          .single()

        if (single) {
          const isClient = (single as any).client?.id === user.id
          const otherPerson: Profile = isClient ? (single as any).lawyer : (single as any).client
          const newConv: Conversation = {
            id: single.id,
            otherPerson: otherPerson ?? { id: '', full_name: 'Usuario' },
            caseTitle: (single as any).legal_cases?.title ?? null,
            lastMessageAt: single.last_message_at,
            unreadCount: isClient ? (single.client_unread ?? 0) : (single.lawyer_unread ?? 0),
            otherUnread: isClient ? (single.lawyer_unread ?? 0) : (single.client_unread ?? 0),
            isClient,
          }
          finalConvs = [newConv, ...convs]
        }
      }

      setConversations(finalConvs)
      if (!convParam && finalConvs.length > 0) setActiveId(finalConvs[0].id)
      setLoadingConvs(false)
    }
    init()
  }, [])

  // Load messages + subscribe to Realtime when active conversation changes
  useEffect(() => {
    if (!activeId || !userId) return

    const supabase = createClient()

    // Unsubscribe from previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    setLoadingMsgs(true)
    setMessages([])

    // Load existing messages
    supabase
      .from('messages')
      .select('id, sender_id, content, created_at, is_read')
      .eq('conversation_id', activeId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        setMessages((data as Message[]) ?? [])
        setLoadingMsgs(false)
      })

    // Mark messages as read
    supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('conversation_id', activeId)
      .neq('sender_id', userId)
      .eq('is_read', false)
      .then(() => {
        // Reset unread counter for this conversation
        setConversations((prev) =>
          prev.map((c) => c.id === activeId ? { ...c, unreadCount: 0 } : c)
        )
      })

    // Subscribe to new messages via Realtime
    const channel = supabase
      .channel(`messages:${activeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => {
            // Avoid duplicates (optimistic update + realtime)
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
          // Update conversation list: last message time + unread
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== activeId) return c
              const isNewMine = newMsg.sender_id === userId
              return {
                ...c,
                lastMessageAt: newMsg.created_at,
                unreadCount: isNewMine ? c.unreadCount : 0, // we're looking at it
              }
            })
          )
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeId, userId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed || !activeId || !userId || sending) return
    setSending(true)
    setText('')

    const supabase = createClient()

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimistic: Message = {
      id: tempId,
      sender_id: userId,
      content: trimmed,
      created_at: new Date().toISOString(),
      is_read: false,
    }
    setMessages((prev) => [...prev, optimistic])

    const conv = conversations.find((c) => c.id === activeId)
    const unreadField = conv?.isClient ? 'lawyer_unread' : 'client_unread'

    // Insert message
    const { data: inserted, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeId,
        sender_id: userId,
        content: trimmed,
        type: 'text',
      })
      .select('id, sender_id, content, created_at, is_read')
      .single()

    if (error) {
      // Rollback optimistic update
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setText(trimmed)
    } else {
      // Replace temp with real
      setMessages((prev) => prev.map((m) => m.id === tempId ? (inserted as Message) : m))
      // Update conversation last_message_at and other person's unread
      const newOtherUnread = (conv?.otherUnread ?? 0) + 1
      await supabase
        .from('conversations')
        .update({
          last_message_at: inserted.created_at,
          [unreadField]: newOtherUnread,
        })
        .eq('id', activeId)
      setConversations((prev) =>
        prev.map((c) => c.id === activeId ? { ...c, otherUnread: newOtherUnread } : c)
      )

      // Notificar al destinatario
      const otherUserId = conv?.otherPerson.id
      if (otherUserId) {
        await supabase.from('notifications').insert({
          user_id: otherUserId,
          type: 'message',
          title: 'Nuevo mensaje',
          body: trimmed.length > 60 ? trimmed.slice(0, 60) + '…' : trimmed,
          link: `/dashboard/mensajes?conv=${activeId}`,
          is_read: false,
        })
      }
    }

    setSending(false)
  }, [text, activeId, userId, sending, conversations])

  const filteredConvs = conversations.filter((c) =>
    c.otherPerson.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.caseTitle ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const activeConv = conversations.find((c) => c.id === activeId)

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Conversation list */}
      <div className="w-72 shrink-0 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 mb-3">Mensajes</h2>
          <div className="flex items-center gap-2 h-9 rounded-lg border border-slate-200 px-3">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversación..."
              className="flex-1 text-xs outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex items-center justify-center h-32">
              <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
              </svg>
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="h-8 w-8 mx-auto text-slate-200 mb-2" />
              <p className="text-xs text-slate-400">
                {conversations.length === 0
                  ? 'No tenés conversaciones todavía.'
                  : 'Sin resultados.'}
              </p>
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const color = avatarColor(conv.otherPerson.id || conv.id)
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveId(conv.id)}
                  className={`w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 ${activeId === conv.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="relative shrink-0">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${color} text-white font-bold text-sm`}>
                      {getInitials(conv.otherPerson.full_name)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {conv.otherPerson.full_name}
                      </p>
                      {conv.lastMessageAt && (
                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                          {timeAgo(conv.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    {conv.caseTitle && (
                      <p className="text-[10px] text-blue-500 mb-0.5 truncate">{conv.caseTitle}</p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      {!activeConv ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-500">Seleccioná una conversación</p>
            <p className="text-xs text-slate-400 mt-1">
              {conversations.length === 0
                ? 'Las conversaciones aparecen cuando aceptás una propuesta.'
                : 'O elegí una del panel izquierdo.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${avatarColor(activeConv.otherPerson.id)} text-white font-bold text-sm shrink-0`}>
              {getInitials(activeConv.otherPerson.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">{activeConv.otherPerson.full_name}</p>
              {activeConv.caseTitle && (
                <p className="text-xs text-slate-400 truncate">Caso: {activeConv.caseTitle}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
                <Phone className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
                <Video className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {loadingMsgs ? (
              <div className="flex items-center justify-center h-32">
                <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                </svg>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <p className="text-sm text-slate-400">Todavía no hay mensajes.</p>
                  <p className="text-xs text-slate-400 mt-1">¡Sé el primero en escribir!</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === userId
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-3 ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-1 justify-end ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                        <span className="text-[10px]">{formatMsgTime(msg.created_at)}</span>
                        {isMe && (
                          msg.is_read
                            ? <CheckCheck className="h-3 w-3" />
                            : <Check className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-end gap-2">
              <div className="flex-1 min-h-[36px] max-h-32 rounded-xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all px-4 py-2">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Escribí un mensaje..."
                  className="w-full text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-none bg-transparent"
                  rows={1}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!text.trim() || sending}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Enter para enviar · Shift+Enter para nueva línea
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
