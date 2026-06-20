'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, MapPin, Clock, Eye, MessageSquare, Filter,
  CheckCircle2, ChevronRight, Send, SlidersHorizontal,
} from 'lucide-react'

const CATEGORIES = [
  { slug: 'todos', name: 'Todos' },
  { slug: 'laboral', name: 'Laboral' },
  { slug: 'civil', name: 'Civil' },
  { slug: 'penal', name: 'Penal' },
  { slug: 'familia', name: 'Familia' },
  { slug: 'inmobiliario', name: 'Inmobiliario' },
  { slug: 'tributario', name: 'Tributario' },
  { slug: 'consumidor', name: 'Consumidor' },
  { slug: 'transito', name: 'Tránsito' },
]

const URGENCY_STYLES: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-slate-100 text-slate-600',
}
const URGENCY_LABELS: Record<string, string> = {
  urgent: 'Urgente', high: 'Alta', medium: 'Media', low: 'Baja',
}

const ALL_CASES = [
  {
    id: '1', title: 'Despido sin causa después de 8 años de antigüedad',
    category: 'laboral', province: 'Córdoba', urgency: 'high',
    description: 'Trabajé 8 años en una empresa y me despidieron sin aviso ni causa. Me ofrecieron una liquidación pero no sé si está bien calculada.',
    proposals: 4, views: 87, created: 'Hace 2 horas', proposed: false,
  },
  {
    id: '2', title: 'Reclamo por alimentos — cuota desactualizada',
    category: 'familia', province: 'Buenos Aires', urgency: 'medium',
    description: 'Tengo una cuota alimentaria fijada hace 3 años y nunca se actualizó. Mi ex trabaja en relación de dependencia.',
    proposals: 6, views: 134, created: 'Hace 5 horas', proposed: true,
  },
  {
    id: '3', title: 'Accidente de tránsito — seguro no quiere cubrir los gastos',
    category: 'transito', province: 'Santa Fe', urgency: 'urgent',
    description: 'Me chocaron por atrás en un semáforo. El otro conductor tenía el seguro vencido.',
    proposals: 3, views: 62, created: 'Hace 1 hora', proposed: false,
  },
  {
    id: '4', title: 'Contrato de alquiler — propietario no devuelve el depósito',
    category: 'inmobiliario', province: 'Buenos Aires', urgency: 'medium',
    description: 'Me mudé hace 45 días, entregué el departamento en perfectas condiciones pero el propietario no me devuelve el depósito.',
    proposals: 5, views: 98, created: 'Hace 1 día', proposed: false,
  },
  {
    id: '5', title: 'Problema con garantía de electrodoméstico — empresa no responde',
    category: 'consumidor', province: 'Mendoza', urgency: 'low',
    description: 'Compré una heladera hace 6 meses, dejó de funcionar y la empresa no da respuesta sobre la garantía.',
    proposals: 2, views: 41, created: 'Hace 2 días', proposed: false,
  },
  {
    id: '6', title: 'Constitución de SRL — dudas sobre el proceso',
    category: 'civil', province: 'CABA', urgency: 'low',
    description: 'Quiero constituir una SRL con dos socios para una empresa de tecnología.',
    proposals: 7, views: 156, created: 'Hace 3 días', proposed: false,
  },
]

export default function CasosDisponiblesPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('todos')
  const [proposed, setProposed] = useState<Record<string, boolean>>({
    '2': true,
  })
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<string | null>(null)
  const [proposalText, setProposalText] = useState('')

  const filtered = useMemo(() => {
    let list = ALL_CASES
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.province.toLowerCase().includes(q)
      )
    }
    if (category !== 'todos') {
      list = list.filter((c) => c.category === category)
    }
    return list
  }, [query, category])

  function sendProposal(id: string) {
    if (!proposalText.trim()) return
    setSendingId(id)
    setTimeout(() => {
      setProposed((prev) => ({ ...prev, [id]: true }))
      setSendingId(null)
      setShowModal(null)
      setProposalText('')
    }, 800)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Casos disponibles</h1>
        <p className="text-sm text-slate-500 mt-0.5">Casos que coinciden con tus especialidades</p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-2 h-10 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar casos..."
            className="flex-1 text-sm outline-none placeholder:text-slate-400"
          />
        </div>
        <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-sm font-medium text-slate-600">
          <SlidersHorizontal className="h-4 w-4" /> Filtros
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(({ slug, name }) => (
          <button
            key={slug}
            onClick={() => setCategory(slug)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === slug
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500">
        <span className="font-semibold text-slate-900">{filtered.length}</span> casos encontrados
      </p>

      {/* Cases */}
      <div className="space-y-4">
        {filtered.map((c) => (
          <div key={c.id} className={`bg-white rounded-2xl border p-6 transition-all ${proposed[c.id] ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 hover:shadow-sm'}`}>
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${URGENCY_STYLES[c.urgency]}`}>
                    {URGENCY_LABELS[c.urgency]}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 capitalize">{c.category}</span>
                  {proposed[c.id] && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      <CheckCircle2 className="h-3 w-3" /> Propuesta enviada
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5">{c.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{c.description}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.province}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.created}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{c.views} vistas</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{c.proposals} propuestas</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <Link
                  href={`/casos/${c.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Ver caso <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                {!proposed[c.id] ? (
                  <button
                    onClick={() => setShowModal(c.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-semibold text-white transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" /> Proponer
                  </button>
                ) : (
                  <button disabled className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-100 rounded-xl text-xs font-semibold text-green-700 cursor-default">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Enviada
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Proposal modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="font-bold text-slate-900 mb-1">Enviar propuesta</h3>
            <p className="text-sm text-slate-500 mb-4">
              {ALL_CASES.find((c) => c.id === showModal)?.title}
            </p>
            <textarea
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              placeholder="Presentate, mencioná tu experiencia en casos similares y cómo podés ayudar a este cliente..."
              rows={6}
              className="w-full rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 resize-none transition-all"
            />
            <p className="text-xs text-slate-400 mt-1.5 mb-4">
              Sé concreto: ¿qué experiencia tenés en este tipo de caso? ¿Cuáles son tus honorarios?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowModal(null); setProposalText('') }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => sendProposal(showModal)}
                disabled={!proposalText.trim() || sendingId === showModal}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sendingId === showModal ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 00-12 12h4z" className="opacity-75" /></svg> Enviando...</>
                ) : (
                  <><Send className="h-4 w-4" /> Enviar propuesta</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
