'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, MapPin, Clock, Eye, MessageSquare,
  CheckCircle2, ChevronRight, Send, SlidersHorizontal,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sendProposal } from './actions'

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

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
}

type Case = {
  id: string
  title: string
  description: string
  urgency: string
  views_count: number
  proposals_count: number
  created_at: string
  categorySlug: string
  categoryName: string
  provinceName: string
  alreadyProposed: boolean
}

export default function CasosDisponiblesPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [lawyerProfileId, setLawyerProfileId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('todos')
  const [proposed, setProposed] = useState<Record<string, boolean>>({})
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<string | null>(null)
  const [proposalText, setProposalText] = useState('')
  const [proposalError, setProposalError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      // Load public cases first — no auth required (RLS allows visibility='public' for everyone)
      const { data: rawCases, error: casesError } = await supabase
        .from('legal_cases')
        .select(`
          id, title, description, urgency, views_count, proposals_count, created_at,
          legal_categories!category_id(name, slug),
          provinces(name)
        `)
        .eq('status', 'open')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(50)

      if (casesError) {
        console.error('casos-disponibles query error:', casesError)
      }

      // Get lawyer profile (optional — only needed for "already proposed" markers)
      let lpId: string | null = null
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: lp } = await supabase
          .from('lawyer_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()
        lpId = lp?.id ?? null
        setLawyerProfileId(lpId)
      }

      // If lawyer, check which cases they already proposed to
      let proposedIds: Set<string> = new Set()
      if (lpId && rawCases && rawCases.length > 0) {
        const { data: existingProposals } = await supabase
          .from('case_proposals')
          .select('case_id')
          .eq('lawyer_id', lpId)
          .in('case_id', rawCases.map((c) => c.id))
        proposedIds = new Set(existingProposals?.map((p) => p.case_id) ?? [])
      }

      const mapped: Case[] = (rawCases ?? []).map((c) => {
        const cat = (Array.isArray(c.legal_categories) ? c.legal_categories[0] : c.legal_categories) as { name: string; slug: string } | null
        const prov = (Array.isArray(c.provinces) ? c.provinces[0] : c.provinces) as { name: string } | null
        return {
          id: c.id,
          title: c.title,
          description: c.description,
          urgency: c.urgency,
          views_count: c.views_count,
          proposals_count: c.proposals_count,
          created_at: c.created_at,
          categorySlug: cat?.slug ?? '',
          categoryName: cat?.name ?? '',
          provinceName: prov?.name ?? '',
          alreadyProposed: proposedIds.has(c.id),
        }
      })

      setCases(mapped)
      const initialProposed: Record<string, boolean> = {}
      mapped.forEach((c) => { if (c.alreadyProposed) initialProposed[c.id] = true })
      setProposed(initialProposed)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let list = cases
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.provinceName.toLowerCase().includes(q)
      )
    }
    if (category !== 'todos') {
      list = list.filter((c) => c.categorySlug === category)
    }
    return list
  }, [cases, query, category])

  async function handleSendProposal(caseId: string) {
    if (!proposalText.trim() || !lawyerProfileId) return
    setSendingId(caseId)
    setProposalError('')
    const { error } = await sendProposal({
      caseId,
      lawyerProfileId,
      message: proposalText.trim(),
    })
    if (error) {
      setProposalError('No se pudo enviar la propuesta. Intentá de nuevo.')
    } else {
      setProposed((prev) => ({ ...prev, [caseId]: true }))
      setShowModal(null)
      setProposalText('')
    }
    setSendingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
        </svg>
      </div>
    )
  }

  const modalCase = cases.find((c) => c.id === showModal)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Casos disponibles</h1>
        <p className="text-sm text-slate-500 mt-0.5">Casos publicados por clientes que buscan asesoramiento</p>
      </div>


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

      {filtered.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm text-slate-400">
          No hay casos disponibles en este momento.
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className={`bg-white rounded-2xl border p-6 transition-all ${
              proposed[c.id] ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${URGENCY_STYLES[c.urgency] ?? ''}`}>
                    {URGENCY_LABELS[c.urgency] ?? c.urgency}
                  </span>
                  {c.categoryName && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{c.categoryName}</span>
                  )}
                  {proposed[c.id] && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      <CheckCircle2 className="h-3 w-3" /> Propuesta enviada
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5">{c.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{c.description}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                  {c.provinceName && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.provinceName}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(c.created_at)}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{c.views_count} vistas</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{c.proposals_count} propuestas</span>
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
                    onClick={() => { setShowModal(c.id); setProposalError('') }}
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

      {showModal && modalCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="font-bold text-slate-900 mb-1">Enviar propuesta</h3>
            <p className="text-sm text-slate-500 mb-4">{modalCase.title}</p>
            {proposalError && (
              <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {proposalError}
              </p>
            )}
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
                onClick={() => { setShowModal(null); setProposalText(''); setProposalError('') }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSendProposal(showModal)}
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
