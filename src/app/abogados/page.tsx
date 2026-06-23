'use client'
import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Search, SlidersHorizontal, MapPin, Star, CheckCircle2,
  ArrowRight, ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/client'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Lawyer = {
  id: string
  slug: string
  full_name: string
  avatar_url: string | null
  city: string
  province: string
  bio: string
  plan: string
  is_featured: boolean
  verified: boolean
  accepts: boolean
  rating: number
  reviews: number
  cases: number
  response_time: number
  specialties: string[]          // slugs para filtrar
  specialty_names: string[]      // nombres para mostrar
  primary_specialty: string      // nombre de la especialidad principal
}

// ─── Filtros estáticos ────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'todos',        name: 'Todos' },
  { slug: 'laboral',      name: 'Laboral' },
  { slug: 'civil',        name: 'Civil' },
  { slug: 'penal',        name: 'Penal' },
  { slug: 'comercial',    name: 'Comercial' },
  { slug: 'familia',      name: 'Familia' },
  { slug: 'inmobiliario', name: 'Inmobiliario' },
  { slug: 'tributario',   name: 'Tributario' },
  { slug: 'consumidor',   name: 'Consumidor' },
  { slug: 'transito',     name: 'Tránsito' },
  { slug: 'societario',   name: 'Societario' },
]

const PROVINCES = [
  'Buenos Aires','CABA','Catamarca','Chaco','Chubut','Córdoba','Corrientes',
  'Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones',
  'Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz',
  'Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán',
]

const PER_PAGE = 6
type SortKey = 'rating' | 'response_time' | 'cases' | 'reviews'

function getInitials(name: string) {
  return name.split(' ').filter(w => /^[A-Za-záéíóúñÁÉÍÓÚÑ]/.test(w)).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

const AVATAR_COLORS = [
  'bg-blue-600','bg-violet-600','bg-emerald-600',
  'bg-rose-600','bg-amber-600','bg-cyan-600',
]
function avatarColor(id: string) {
  let n = 0
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

// ─── Componente principal ─────────────────────────────────────────────────────

function LawyersContent() {
  const searchParams = useSearchParams()

  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [dbLoading, setDbLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)
  const [roleLoaded, setRoleLoaded] = useState(false)

  const [query, setQuery]               = useState(searchParams.get('q') ?? '')
  const [category, setCategory]         = useState(searchParams.get('categoria') ?? 'todos')
  const [province, setProvince]         = useState(searchParams.get('provincia') ?? '')
  const [sort, setSort]                 = useState<SortKey>('rating')
  const [page, setPage]                 = useState(1)
  const [showFilters, setShowFilters]   = useState(false)
  const [onlyVerified, setOnlyVerified] = useState(false)
  const [onlyAccepting, setOnlyAccepting] = useState(false)

  // ── Detectar rol ──
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setRoleLoaded(true); return }
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.role === 'lawyer' || data?.role === 'firm_admin') setIsPro(true)
          setRoleLoaded(true)
        })
    })
  }, [])

  // ── Cargar abogados desde Supabase ──
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('lawyer_profiles')
        .select(`
          id, slug, plan, is_featured, rating_avg, rating_count,
          cases_handled, response_time_hours, accepts_new_clients,
          verification_status,
          profiles(full_name, avatar_url, city, bio, provinces(name)),
          lawyer_specialties(is_primary, legal_categories(slug, name))
        `)
        .order('is_featured', { ascending: false })
        .order('rating_avg', { ascending: false })

      if (error || !data) { setDbLoading(false); return }

      const mapped: Lawyer[] = data.map((lp: any) => {
        const profile = Array.isArray(lp.profiles) ? lp.profiles[0] : lp.profiles
        const province = profile?.provinces
          ? (Array.isArray(profile.provinces) ? profile.provinces[0] : profile.provinces)?.name ?? ''
          : ''
        const specialties: Array<{ slug: string; name: string; is_primary: boolean }> =
          (lp.lawyer_specialties ?? [])
            .filter((s: any) => s.legal_categories)
            .map((s: any) => ({
              slug: s.legal_categories.slug as string,
              name: s.legal_categories.name as string,
              is_primary: s.is_primary as boolean,
            }))

        const primary = specialties.find(s => s.is_primary) ?? specialties[0]

        return {
          id:               lp.id,
          slug:             lp.slug ?? lp.id,
          full_name:        profile?.full_name ?? 'Abogado',
          avatar_url:       profile?.avatar_url ?? null,
          city:             profile?.city ?? '',
          province,
          bio:              profile?.bio ?? '',
          plan:             lp.plan ?? 'free',
          is_featured:      lp.is_featured ?? false,
          verified:         lp.verification_status === 'verified',
          accepts:          lp.accepts_new_clients ?? true,
          rating:           Number(lp.rating_avg ?? 0),
          reviews:          lp.rating_count ?? 0,
          cases:            lp.cases_handled ?? 0,
          response_time:    lp.response_time_hours ?? 0,
          specialties:      specialties.map(s => s.slug),
          specialty_names:  specialties.map(s => s.name),
          primary_specialty: primary?.name ?? '',
        }
      })

      setLawyers(mapped)
      setDbLoading(false)
    }
    load()
  }, [])

  // Sync URL params
  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
    setCategory(searchParams.get('categoria') ?? 'todos')
    setPage(1)
  }, [searchParams])

  // ── Filtrar + ordenar ──
  const filtered = useMemo(() => {
    let list = [...lawyers]

    if (query.trim()) {
      const q = query.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      list = list.filter(l => {
        const hay = `${l.full_name} ${l.primary_specialty} ${l.bio} ${l.specialties.join(' ')} ${l.city} ${l.province}`
          .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        return hay.includes(q)
      })
    }

    if (category !== 'todos') {
      list = list.filter(l => l.specialties.includes(category))
    }

    if (province) {
      list = list.filter(l => l.province === province)
    }

    if (onlyVerified)  list = list.filter(l => l.verified)
    if (onlyAccepting) list = list.filter(l => l.accepts)

    list.sort((a, b) => {
      // Plan/featured es siempre prioritario
      const score = (l: Lawyer) =>
        (l.plan === 'premium' ? 2 : l.plan === 'professional' ? 1 : 0) + (l.is_featured ? 1 : 0)
      const planDiff = score(b) - score(a)
      if (planDiff !== 0) return planDiff
      // Dentro del mismo nivel, ordenar por preferencia del usuario
      if (sort === 'rating')        return b.rating - a.rating
      if (sort === 'response_time') return (a.response_time || 999) - (b.response_time || 999)
      if (sort === 'cases')         return b.cases - a.cases
      if (sort === 'reviews')       return b.reviews - a.reviews
      return 0
    })

    return list
  }, [lawyers, query, category, province, sort, onlyVerified, onlyAccepting])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const hasActiveFilters = query || category !== 'todos' || province || onlyVerified || onlyAccepting

  function clearFilters() {
    setQuery(''); setCategory('todos'); setProvince('')
    setOnlyVerified(false); setOnlyAccepting(false); setPage(1)
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header user={null} />
      <main className="flex-1 bg-slate-50">

        {/* ── Top bar ── */}
        <div className="bg-white border-b border-slate-200 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">
              {!roleLoaded ? '' : isPro ? 'Casos en Argentina' : 'Abogados en Argentina'}
            </h1>

            <form onSubmit={e => { e.preventDefault(); setPage(1) }} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 h-11 rounded-lg border border-slate-200 bg-white px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setPage(1) }}
                  placeholder={!roleLoaded ? '' : isPro ? 'Buscar por especialidad...' : 'Buscar por nombre, especialidad o ciudad...'}
                  className="flex-1 text-sm outline-none placeholder:text-slate-400"
                />
                {query && (
                  <button type="button" onClick={() => { setQuery(''); setPage(1) }}>
                    <X className="h-4 w-4 text-slate-400 hover:text-slate-700" />
                  </button>
                )}
              </div>

              <select
                value={province}
                onChange={e => { setProvince(e.target.value); setPage(1) }}
                className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">Todas las provincias</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 h-11 px-4 rounded-lg border transition-colors text-sm font-medium ${showFilters ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    {[query, category !== 'todos', province, onlyVerified, onlyAccepting].filter(Boolean).length}
                  </span>
                )}
              </button>
            </form>

            {showFilters && (
              <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={onlyVerified} onChange={e => { setOnlyVerified(e.target.checked); setPage(1) }} className="accent-blue-600" />
                  Solo verificados
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={onlyAccepting} onChange={e => { setOnlyAccepting(e.target.checked); setPage(1) }} className="accent-blue-600" />
                  Acepta nuevos clientes
                </label>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                    <X className="h-3.5 w-3.5" /> Limpiar filtros
                  </button>
                )}
              </div>
            )}

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {CATEGORIES.map(({ slug, name }) => (
                <button
                  key={slug}
                  onClick={() => { setCategory(slug); setPage(1) }}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${category === slug ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

          {dbLoading ? (
            <div className="flex items-center justify-center py-24">
              <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
              </svg>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-500">
                  {filtered.length === 0
                    ? 'Sin resultados para esa búsqueda'
                    : <><span className="font-semibold text-slate-900">{filtered.length}</span> abogado{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</>
                  }
                </p>
                {roleLoaded && !isPro && (
                  <select
                    value={sort}
                    onChange={e => { setSort(e.target.value as SortKey); setPage(1) }}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none bg-white text-slate-600"
                  >
                    <option value="rating">Mejor valorados</option>
                    <option value="response_time">Menor tiempo de respuesta</option>
                    <option value="cases">Más casos</option>
                    <option value="reviews">Más valoraciones</option>
                  </select>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <Search className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">No encontramos abogados</h3>
                  <p className="text-sm text-slate-500 mb-5">
                    {lawyers.length === 0
                      ? 'Todavía no hay abogados registrados en la plataforma.'
                      : 'Probá con otra especialidad, provincia o término de búsqueda.'}
                  </p>
                  {lawyers.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      Ver todos los abogados
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {paginated.map(lawyer => <LawyerCard key={lawyer.id} lawyer={lawyer} />)}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-10 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-9 min-w-9 px-3 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function LawyersPage() {
  return (
    <Suspense>
      <LawyersContent />
    </Suspense>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function LawyerCard({ lawyer }: { lawyer: Lawyer }) {
  const initials = getInitials(lawyer.full_name)
  const color    = avatarColor(lawyer.id)

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-all duration-300 ${lawyer.is_featured ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'}`}>
      {lawyer.is_featured && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-white fill-white" />
          <span className="text-xs font-semibold text-white">PERFIL DESTACADO</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex gap-4">
          <div className="relative shrink-0">
            {lawyer.avatar_url ? (
              <img src={lawyer.avatar_url} alt={lawyer.full_name} className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className={`h-16 w-16 rounded-full ${color} text-white font-bold text-lg flex items-center justify-center`}>
                {initials}
              </div>
            )}
            {lawyer.verified && (
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link href={`/abogados/${lawyer.slug}`} className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-sm line-clamp-1">
                  {lawyer.full_name}
                </Link>
                <p className="text-xs text-slate-500">{lawyer.primary_specialty || 'Abogado'}</p>
              </div>
              {lawyer.plan === 'premium' && (
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                  Premium
                </span>
              )}
            </div>

            {lawyer.rating > 0 ? (
              <div className="mt-1.5 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-medium text-slate-900">{lawyer.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-400">({lawyer.reviews})</span>
              </div>
            ) : (
              <p className="mt-1.5 text-xs text-slate-400">Sin valoraciones aún</p>
            )}

            {(lawyer.city || lawyer.province) && (
              <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="h-3 w-3" />
                {[lawyer.city, lawyer.province].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>

        {lawyer.specialty_names.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {lawyer.specialty_names.slice(0, 3).map(n => (
              <span key={n} className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{n}</span>
            ))}
          </div>
        )}

        {lawyer.bio && (
          <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">{lawyer.bio}</p>
        )}

        <div className="mt-3 flex gap-4 text-xs text-slate-400">
          {lawyer.cases > 0      && <span>{lawyer.cases} casos</span>}
          {lawyer.response_time > 0 && <span>~{lawyer.response_time}h respuesta</span>}
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/abogados/${lawyer.slug}`}
            className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            Ver perfil <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/dashboard/mensajes`}
            className="h-9 px-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-600 transition-colors flex items-center"
          >
            Contactar
          </Link>
        </div>

        {!lawyer.accepts && (
          <p className="mt-2 text-xs text-center text-amber-600 font-medium">No acepta nuevos clientes</p>
        )}
      </div>
    </div>
  )
}
