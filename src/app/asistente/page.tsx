'use client'
import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, Scale, ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED_QUESTIONS = [
  '¿Qué hago si me despidieron sin causa?',
  '¿Cómo funciona la cuota alimentaria?',
  '¿Qué es el período de prueba laboral?',
  '¿Puedo reclamar por un accidente de tránsito?',
  '¿Cómo inicio un divorcio en Argentina?',
  '¿Cuánto tiempo tengo para reclamar una deuda?',
]

const INITIAL_MESSAGE: Message = {
  id: '0',
  role: 'assistant',
  content:
    'Hola, soy el Asistente Legal de LexConnect. Puedo orientarte sobre conceptos legales, plazos y tus derechos en Argentina.\n\n⚠️ Esta información es orientativa y no constituye asesoramiento jurídico. Para tu caso específico, te recomiendo consultar con un abogado verificado.',
  timestamp: new Date(),
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Simulated AI response for MVP
    await new Promise((r) => setTimeout(r, 1500))
    const reply = getSimulatedReply(text)
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: reply,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMsg])
    setLoading(false)
  }

  function getSimulatedReply(question: string): string {
    const q = question.toLowerCase()
    if (q.includes('despido') || q.includes('despedido')) {
      return 'Ante un despido sin causa en Argentina, tenés derecho a:\n\n• **Indemnización por antigüedad**: 1 sueldo por año trabajado (mín. 2 meses)\n• **Preaviso**: según la antigüedad (1 a 2 meses)\n• **Vacaciones proporcionales** y SAC proporcional\n\nEl plazo para reclamar es de **2 años** desde el despido (Ley 20.744).\n\n¿Querías que te recomiende un abogado laboralista?'
    }
    if (q.includes('cuota') || q.includes('alimento') || q.includes('alimentaria')) {
      return 'La cuota alimentaria en Argentina se fija judicialmente considerando:\n\n• Las necesidades del menor (educación, salud, vestimenta)\n• Los ingresos del progenitor obligado\n• El nivel de vida previo de la familia\n\nGeneralmente se fija entre el **20% y 30%** del ingreso neto del alimentante.\n\nPodés iniciar el reclamo en el Juzgado de Familia de tu jurisdicción. Te recomiendo un abogado especialista en derecho de familia.'
    }
    if (q.includes('divorcio')) {
      return 'En Argentina, el divorcio se rige por el Código Civil y Comercial (desde 2015). Podés divorciarte:\n\n• **Sin causa** y **sin plazos mínimos** de matrimonio\n• De forma unilateral o conjunta\n• Ante el Juzgado de Familia\n\nSi hay acuerdo en bienes y menores, el proceso puede ser más rápido. Te recomiendo contactar a un abogado de familia para que te guíe en la documentación.'
    }
    if (q.includes('accidente') || q.includes('tránsito') || q.includes('transito')) {
      return 'Ante un accidente de tránsito en Argentina tenés derecho a reclamar:\n\n• **Daño emergente** (reparación del vehículo, gastos médicos)\n• **Lucro cesante** (ingresos perdidos)\n• **Daño moral**\n• **Incapacidad** (si hubo lesiones)\n\nEl **plazo de prescripción** es de 3 años desde el accidente.\n\nEs importante que documentes todo: fotos, informe policial, facturas médicas y testigos.'
    }
    return 'Entiendo tu consulta. Para darte una orientación precisa sobre este tema, necesito más detalles sobre tu situación particular.\n\nLo que puedo decirte es que el sistema legal argentino ofrece protecciones para este tipo de situaciones. Te recomiendo:\n\n1. Documentar todo lo relacionado con tu caso\n2. Consultar con un abogado especializado lo antes posible\n3. No firmar ningún documento sin asesoramiento previo\n\n¿Querés que te recomiende un abogado especialista?'
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header user={null} />
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6 gap-4">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-slate-900">Asistente Legal LexConnect</h1>
            <p className="text-sm text-slate-500">Orientación legal inmediata · Argentina</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            En línea
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            La información brindada por este asistente es <strong>orientativa</strong> y no constituye asesoramiento jurídico.
            Para tu caso específico, consultá siempre con un{' '}
            <Link href="/abogados" className="underline font-medium">abogado verificado</Link>.
          </p>
        </div>

        {/* Chat */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-[400px] max-h-[500px]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                {msg.role === 'assistant' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 rounded-tl-sm'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/•/g, '•'),
                  }}
                />
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {messages.length === 1 && (
            <div className="px-5 pb-4">
              <p className="text-xs text-slate-400 mb-2">Preguntas frecuentes:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-full text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-200 p-4 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Escribí tu consulta legal..."
              className="flex-1 h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="h-11 w-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8 text-blue-600 shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">¿Necesitás asesoramiento real?</p>
              <p className="text-xs text-slate-500">Encontrá abogados verificados para tu caso</p>
            </div>
          </div>
          <Link
            href="/abogados"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Buscar abogado <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  )
}
