'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import {
  FileText, MapPin, Clock, ChevronRight, Plus, Search,
  AlertCircle, Eye, MessageSquare,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { slug: 'todos',       name: 'Todos' },
  { slug: 'laboral',     name: 'Laboral' },
  { slug: 'civil',       name: 'Civil' },
  { slug: 'penal',       name: 'Penal' },
  { slug: 'comercial',   name: 'Comercial' },
  { slug: 'familia',     name: 'Familia' },
  { slug: 'inmobiliario',name: 'Inmobiliario' },
  { slug: 'tributario',  name: 'Tributario' },
  { slug: 'consumidor',  name: 'Consumidor' },
  { slug: 'transito',    name: 'Tránsito' },
]

const URGENCY_STYLES: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high:   'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low:    'bg-slate-100 text-slate-600',
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
  category: string
  categorySlug: string
  province: string
}

const URGENCY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }

function CasosContent() {
  const searchParams = useSearchParams()
  const [cases, setCases]     = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery]     = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState(searchParams.get('categoria') ?? 'todos')
  const [sortBy, setSortBy]   = useState('recent')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoaded, setRoleLoaded] = useState(false)

  // Sync URL params when they change
  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
    setCategory(searchParams.get('categoria') ?? 'todos')
  }, [searchParams])

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        setUserRole(profile?.role ?? null)
      }
      setRoleLoaded(true)

      const { data } = await supabase
        .from('legal_cases')
        .select(`
          id, title, description, urgency, views_count, proposals_count, created_at,
          legal_categories!category_id(name, slug),
          provinces(name)
        `)
        .eq('status', 'open')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(100)

      setCases(
        (data ?? []).map((c) => {
          const cat  = (Array.isArray(c.legal_categories) ? c.legal_categories[0] : c.legal_categories) as { name: string; slug: string } | null
          const prov = (Array.isArray(c.provinces) ? c.provinces[0] : c.provinces) as { name: string } | null
          return {
            id: c.id,
            title: c.title,
            description: c.description,
            urgency: c.urgency,
            views_count: c.views_count,
            proposals_count: c.proposals_count,
            created_at: c.created_at,
            category: cat?.name ?? '',
            categorySlug: cat?.slug ?? '',
            province: prov?.name ?? '',
          }
        }),
      )
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let list = cases
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.province.toLowerCase().includes(q),
      )
    }
    if (category !== 'todos') {
      list = list.filter((c) => c.categorySlug === category)
    }
    switch (sortBy) {
      case 'urgent':    return [...list].sort((a, b) => (URGENCY_ORDER[a.urgency] ?? 4) - (URGENCY_ORDER[b.urgency] ?? 4))
      case 'proposals': return [...list].sort((a, b) => b.proposals_count - a.proposals_count)
      case 'views':     return [...list].sort((a, b) => b.views_count - a.views_count)
      default:          return list
    }
  }, [cases, query, category, sortBy])

  return (
    <div className="flex flex-col min-h-full">
      <Header user={null} />
      <main className="flex-1 bg-slate-50">

        <div className="bg-white border-b border-slate-200 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Casos legales publicados</h1>
                <p className="text-sm text-slate-500 mt-1">Personas buscando asesoramiento legal en Argentina</p>
              </div>
              {roleLoaded && userRole !== 'lawyer' && userRole !== 'firm_admin' && (
                <Link
                  href="/casos/nuevo"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Plus className="h-4 w-4" /> Publicar caso
                </Link>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 h-11 rounded-lg border border-slate-200 bg-white px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar casos por título, descripción o provincia..."
                  className="flex-1 text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map(({ slug, name }) => (
                <button
                  key={slug}
                  onClick={() => setCategory(slug)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    category === slug
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {roleLoaded && ((userRole === 'lawyer' || userRole === 'firm_admin') ? (
            <div className="mb-6 flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
              <AlertCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-800 font-medium">Estás viendo como abogado</p>
                <p className="text-xs text-green-700 mt-0.5">
                  Hacé clic en "Ver caso" o "Proponer" para ver el detalle y enviar tu propuesta.
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">¿Sos abogado?</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Para enviar propuestas necesitás{' '}
                  <Link href="/registro?rol=abogado" className="underline font-medium">crear tu perfil</Link>{' '}
                  o <Link href="/iniciar-sesion" className="underline font-medium">iniciar sesión</Link>.
                </p>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between mb-5">
            {loading ? (
              <p className="text-sm text-slate-400">Cargando casos...</p>
            ) : (
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">{filtered.length}</span> casos activos
              </p>
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none bg-white text-slate-600"
            >
              <option value="recent">Más recientes</option>
              <option value="urgent">Más urgentes</option>
              <option value="proposals">Más propuestas</option>
              <option value="views">Más vistos</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
              </svg>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <FileText className="h-10 w-10 mx-auto text-slate-200 mb-3" />
              <p className="font-semibold text-slate-700">
                {cases.length === 0 ? 'No encontramos casos' : 'No hay casos que coincidan con tu búsqueda'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {cases.length === 0 ? 'Todavía no hay casos registrados en la plataforma.' : 'Probá cambiando los filtros o la categoría'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${URGENCY_STYLES[c.urgency] ?? ''}`}>
                          {URGENCY_LABELS[c.urgency] ?? c.urgency}
                        </span>
                        {c.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            {c.category}
                          </span>
                        )}
                      </div>
                      <h2 className="font-bold text-slate-900 mb-2 text-lg leading-snug">{c.title}</h2>
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{c.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        {c.province && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.province}</span>}
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(c.created_at)}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{c.views_count} vistas</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{c.proposals_count} propuestas</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 sm:shrink-0">
                      <Link
                        href={`/casos/${c.id}`}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                      >
                        Ver caso <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={
                          userRole === 'lawyer' || userRole === 'firm_admin'
                            ? `/casos/${c.id}`
                            : '/registro?rol=abogado'
                        }
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors"
                      >
                        Proponer
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {roleLoaded && userRole !== 'lawyer' && userRole !== 'firm_admin' && (
            <div className="mt-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-center text-white">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-80" />
              <h3 className="font-bold text-lg mb-2">¿Tenés un caso legal?</h3>
              <p className="text-blue-100 text-sm mb-5">Publicalo gratis y recibí propuestas de abogados verificados en horas.</p>
              <Link
                href="/casos/nuevo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm"
              >
                <Plus className="h-4 w-4" /> Publicar mi caso gratis
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function CasosPage() {
  return (
    <Suspense>
      <CasosContent />
    </Suspense>
  )
}
