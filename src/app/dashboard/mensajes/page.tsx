'use client'
import { useState } from 'react'
import { Send, Search, Paperclip, Phone, Video, MoreVertical, CheckCheck, Check } from 'lucide-react'

const CONVERSATIONS = [
  {
    id: 'm1',
    with: 'Dr. Carlos Pérez',
    avatar: 'CP',
    avatarBg: 'bg-blue-600',
    lastMessage: '¿Podemos coordinar una videollamada para esta semana?',
    time: 'Hace 1h',
    unread: 2,
    online: true,
    caseRef: 'Despido sin causa',
  },
  {
    id: 'm2',
    with: 'Dra. Ana Martínez',
    avatar: 'AM',
    avatarBg: 'bg-purple-600',
    lastMessage: 'Perfecto, envíame los documentos cuando puedas.',
    time: 'Ayer',
    unread: 0,
    online: false,
    caseRef: 'Despido sin causa',
  },
  {
    id: 'm3',
    with: 'Dr. Roberto Sánchez',
    avatar: 'RS',
    avatarBg: 'bg-green-600',
    lastMessage: 'Entendido. Voy a revisar el contrato que me mandaste.',
    time: 'Hace 3 días',
    unread: 0,
    online: true,
    caseRef: 'Cuota alimentaria',
  },
]

const MESSAGES: Record<string, Array<{
  id: string; from: 'me' | 'them'; text: string; time: string; read: boolean;
}>> = {
  m1: [
    { id: '1', from: 'them', text: 'Hola, leí tu caso con atención. Con 8 años de antigüedad tenés derecho a una indemnización considerable.', time: '10:23', read: true },
    { id: '2', from: 'them', text: 'La oferta que te hicieron parece por debajo de lo que corresponde legalmente. ¿Cuánto te ofrecieron exactamente?', time: '10:24', read: true },
    { id: '3', from: 'me', text: 'Hola Doctor, me ofrecieron $850.000. Trabajé desde marzo de 2018 hasta junio de 2026.', time: '10:45', read: true },
    { id: '4', from: 'me', text: 'También tengo pendientes 2 semanas de vacaciones que no tomé.', time: '10:46', read: true },
    { id: '5', from: 'them', text: 'Perfecto. Basándome en esos datos, la indemnización correcta debería rondar los $1.800.000 aproximadamente, dependiendo de tu último salario. Tenés derecho también a la integración del mes de despido y las vacaciones no gozadas.', time: '11:02', read: true },
    { id: '6', from: 'them', text: 'Te recomiendo no firmar NADA por ahora. ¿Podemos coordinar una videollamada para esta semana para que me compartas más detalles?', time: '11:03', read: false },
    { id: '7', from: 'them', text: '¿Podemos coordinar una videollamada para esta semana?', time: '11:04', read: false },
  ],
  m2: [
    { id: '1', from: 'them', text: 'Hola! Soy la Dra. Martínez, vi tu caso y me gustaría ayudarte.', time: 'Ayer 14:30', read: true },
    { id: '2', from: 'me', text: 'Hola Dra., muchas gracias por contactarse.', time: 'Ayer 15:10', read: true },
    { id: '3', from: 'them', text: 'Perfecto, envíame los documentos cuando puedas.', time: 'Ayer 15:12', read: true },
  ],
  m3: [
    { id: '1', from: 'them', text: 'Recibí tu caso sobre la cuota alimentaria. Es un tema que manejo con frecuencia.', time: 'Hace 3 días', read: true },
    { id: '2', from: 'me', text: 'Excelente, necesito actualizar la cuota porque no se ajustó en 3 años.', time: 'Hace 3 días', read: true },
    { id: '3', from: 'them', text: 'Entendido. Voy a revisar el contrato que me mandaste.', time: 'Hace 3 días', read: true },
  ],
}

export default function MensajesPage() {
  const [activeId, setActiveId] = useState('m1')
  const [text, setText] = useState('')
  const [messages, setMessages] = useState(MESSAGES)
  const [search, setSearch] = useState('')

  const active = CONVERSATIONS.find((c) => c.id === activeId)!
  const msgs = messages[activeId] ?? []

  const filtered = CONVERSATIONS.filter((c) =>
    c.with.toLowerCase().includes(search.toLowerCase()) ||
    c.caseRef.toLowerCase().includes(search.toLowerCase())
  )

  function sendMessage() {
    const trimmed = text.trim()
    if (!trimmed) return
    const newMsg = { id: Date.now().toString(), from: 'me' as const, text: trimmed, time: 'Ahora', read: false }
    setMessages((prev) => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), newMsg] }))
    setText('')
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Sidebar */}
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
          {filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={`w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 ${activeId === conv.id ? 'bg-blue-50' : ''}`}
            >
              <div className="relative shrink-0">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${conv.avatarBg} text-white font-bold text-sm`}>
                  {conv.avatar}
                </div>
                {conv.online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`text-sm truncate ${conv.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                    {conv.with}
                  </p>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-1">{conv.time}</span>
                </div>
                <p className="text-[10px] text-blue-500 mb-0.5 truncate">{conv.caseRef}</p>
                <p className={`text-xs truncate ${conv.unread ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unread > 0 && (
                <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {conv.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200">
          <div className="relative shrink-0">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${active.avatarBg} text-white font-bold text-sm`}>
              {active.avatar}
            </div>
            {active.online && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">{active.with}</p>
            <p className="text-xs text-slate-400">{active.online ? 'En línea' : 'Última vez hace 2 horas'} · Caso: {active.caseRef}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
              <Phone className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
              <Video className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {msgs.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-3 ${
                  msg.from === 'me'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={`flex items-center gap-1 mt-1 justify-end ${msg.from === 'me' ? 'text-blue-200' : 'text-slate-400'}`}>
                  <span className="text-[10px]">{msg.time}</span>
                  {msg.from === 'me' && (
                    msg.read
                      ? <CheckCheck className="h-3 w-3" />
                      : <Check className="h-3 w-3" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-end gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 shrink-0">
              <Paperclip className="h-4 w-4" />
            </button>
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
              disabled={!text.trim()}
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
    </div>
  )
}
