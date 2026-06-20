'use client'
import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search, SlidersHorizontal, MapPin, Star, CheckCircle2,
  ArrowRight, ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

// ─── Datos ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'todos', name: 'Todos' },
  { slug: 'laboral', name: 'Laboral' },
  { slug: 'civil', name: 'Civil' },
  { slug: 'penal', name: 'Penal' },
  { slug: 'comercial', name: 'Comercial' },
  { slug: 'familia', name: 'Familia' },
  { slug: 'inmobiliario', name: 'Inmobiliario' },
  { slug: 'tributario', name: 'Tributario' },
  { slug: 'consumidor', name: 'Consumidor' },
  { slug: 'transito', name: 'Tránsito' },
  { slug: 'societario', name: 'Societario' },
]

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza',
  'Tucumán', 'Salta', 'Misiones', 'Entre Ríos', 'Chaco',
  'Corrientes', 'Santiago del Estero', 'San Juan', 'Jujuy',
  'Río Negro', 'Neuquén', 'Formosa', 'Chubut', 'San Luis',
  'Catamarca', 'La Rioja', 'La Pampa', 'Santa Cruz', 'Tierra del Fuego',
]

const ALL_LAWYERS = [
  { id: '1', slug: 'rodrigo-saenz-laboral', full_name: 'Dr. Rodrigo Sáenz', avatar: 'RS', specialty: 'Derecho Laboral', tags: ['laboral', 'civil', 'transito'], province: 'Córdoba', city: 'Córdoba', rating: 4.9, reviews: 127, cases: 89, response_time: 2, verified: true, featured: false, plan: 'professional', bio: 'Especialista en conflictos laborales, despidos y accidentes de trabajo. Más de 10 años en el foro cordobés.', accepts: true },
  { id: '2', slug: 'maria-lorena-castro-familia', full_name: 'Dra. María Lorena Castro', avatar: 'MC', specialty: 'Derecho de Familia', tags: ['familia', 'civil', 'sucesiones'], province: 'Buenos Aires', city: 'CABA', rating: 4.8, reviews: 214, cases: 156, response_time: 4, verified: true, featured: true, plan: 'premium', bio: 'Divorcios, cuota alimentaria, adopciones y sucesiones. Atención personalizada para situaciones familiares complejas.', accepts: true },
  { id: '3', slug: 'pablo-herrera-penal', full_name: 'Dr. Pablo Herrera', avatar: 'PH', specialty: 'Derecho Penal', tags: ['penal'], province: 'Buenos Aires', city: 'Mar del Plata', rating: 4.7, reviews: 89, cases: 72, response_time: 6, verified: true, featured: false, plan: 'professional', bio: 'Defensa penal en todas las instancias. Ex fiscal de la Provincia de Buenos Aires.', accepts: true },
  { id: '4', slug: 'laura-benitez-comercial', full_name: 'Dra. Laura Benítez', avatar: 'LB', specialty: 'Derecho Comercial', tags: ['comercial', 'societario'], province: 'Santa Fe', city: 'Rosario', rating: 4.9, reviews: 63, cases: 48, response_time: 3, verified: true, featured: false, plan: 'premium', bio: 'Asesora legal de empresas y startups. Contratos, M&A y resolución de conflictos comerciales.', accepts: true },
  { id: '5', slug: 'carlos-mendez-inmobiliario', full_name: 'Dr. Carlos Méndez', avatar: 'CM', specialty: 'Derecho Inmobiliario', tags: ['inmobiliario', 'civil'], province: 'Mendoza', city: 'Mendoza', rating: 4.6, reviews: 45, cases: 38, response_time: 8, verified: true, featured: false, plan: 'free', bio: 'Compraventa de inmuebles, alquileres, PHorizontal y usucapión.', accepts: true },
  { id: '6', slug: 'ana-garcia-tributario', full_name: 'Dra. Ana García', avatar: 'AG', specialty: 'Derecho Tributario', tags: ['tributario', 'comercial'], province: 'Buenos Aires', city: 'CABA', rating: 4.8, reviews: 91, cases: 67, response_time: 5, verified: true, featured: false, plan: 'professional', bio: 'AFIP, Ingresos Brutos y planificación fiscal. Resolución de inspecciones.', accepts: false },
  { id: '7', slug: 'martin-flores-consumidor', full_name: 'Dr. Martín Flores', avatar: 'MF', specialty: 'Defensa del Consumidor', tags: ['consumidor', 'civil'], province: 'Córdoba', city: 'Villa Carlos Paz', rating: 4.5, reviews: 38, cases: 29, response_time: 12, verified: true, featured: false, plan: 'free', bio: 'Reclamos a empresas, bancos y aseguradoras. Honorarios solo si ganamos.', accepts: true },
  { id: '8', slug: 'sofia-rios-laboral', full_name: 'Dra. Sofía Ríos', avatar: 'SR', specialty: 'Derecho Laboral', tags: ['laboral', 'previsional'], province: 'Santa Fe', city: 'Santa Fe', rating: 4.7, reviews: 52, cases: 41, response_time: 7, verified: true, featured: false, plan: 'professional', bio: 'Especialista en accidentes laborales, ART y beneficios previsionales.', accepts: true },
  { id: '9', slug: 'diego-vargas-penal', full_name: 'Dr. Diego Vargas', avatar: 'DV', specialty: 'Derecho Penal', tags: ['penal', 'contravencional'], province: 'Buenos Aires', city: 'CABA', rating: 4.6, reviews: 71, cases: 58, response_time: 4, verified: false, featured: false, plan: 'free', bio: 'Defensa en fueros penal económico y ordinario. Atención 24/7 en casos urgentes.', accepts: true },
  { id: '10', slug: 'valeria-gomez-familia', full_name: 'Dra. Valeria Gómez', avatar: 'VG', specialty: 'Derecho de Familia', tags: ['familia', 'violencia-domestica'], province: 'Mendoza', city: 'Godoy Cruz', rating: 4.9, reviews: 33, cases: 27, response_time: 3, verified: true, featured: false, plan: 'professional', bio: 'Familia, violencia doméstica y género. Acompañamiento integral con perspectiva de derechos humanos.', accepts: true },
  { id: '11', slug: 'nicolas-pardo-civil', full_name: 'Dr. Nicolás Pardo', avatar: 'NP', specialty: 'Derecho Civil', tags: ['civil', 'daños', 'contratos'], province: 'Buenos Aires', city: 'La Plata', rating: 4.4, reviews: 29, cases: 22, response_time: 24, verified: true, featured: false, plan: 'free', bio: 'Daños y perjuicios, contratos y responsabilidad civil. Consultas en La Plata y CABA.', accepts: true },
  { id: '12', slug: 'claudia-torres-societario', full_name: 'Dra. Claudia Torres', avatar: 'CT', specialty: 'Derecho Societario', tags: ['societario', 'comercial', 'startup'], province: 'Buenos Aires', city: 'CABA', rating: 5.0, reviews: 18, cases: 14, response_time: 6, verified: true, featured: true, plan: 'premium', bio: 'Constitución de sociedades, gobierno corporativo y protección de inversores. Experta en ecosistema startup.', accepts: true },
]

const PER_PAGE = 6

type SortKey = 'rating' | 'response_time' | 'cases' | 'reviews'

// ─── Componente ───────────────────────────────────────────────────────────────

function LawyersContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState(searchParams.get('categoria') ?? 'todos')
  const [province, setProvince] = useState(searchParams.get('provincia') ?? '')
  const [sort, setSort] = useState<SortKey>('rating')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [onlyVerified, setOnlyVerified] = useState(false)
  const [onlyAccepting, setOnlyAccepting] = useState(false)

  // Sync URL → state cuando cambian los params externos (ej: click en categoría desde landing)
  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
    setCategory(searchParams.get('categoria') ?? 'todos')
    setPage(1)
  }, [searchParams])

  // Filtrar + ordenar
  const filtered = useMemo(() => {
    let list = [...ALL_LAWYERS]

    if (query.trim()) {
      const q = query.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      list = list.filter((l) => {
        const haystack = `${l.full_name} ${l.specialty} ${l.bio} ${l.tags.join(' ')} ${l.city} ${l.province}`
          .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        return haystack.includes(q)
      })
    }

    if (category !== 'todos') {
      list = list.filter((l) => l.tags.includes(category))
    }

    if (province) {
      list = list.filter((l) => l.province === province)
    }

    if (onlyVerified) {
      list = list.filter((l) => l.verified)
    }

    if (onlyAccepting) {
      list = list.filter((l) => l.accepts)
    }

    list.sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating
      if (sort === 'response_time') return a.response_time - b.response_time
      if (sort === 'cases') return b.cases - a.cases
      if (sort === 'reviews') return b.reviews - a.reviews
      return 0
    })

    // Premium y featured siempre primero dentro del orden
    list.sort((a, b) => {
      const scoreA = (a.plan === 'premium' ? 2 : a.plan === 'professional' ? 1 : 0) + (a.featured ? 1 : 0)
      const scoreB = (b.plan === 'premium' ? 2 : b.plan === 'professional' ? 1 : 0) + (b.featured ? 1 : 0)
      return scoreB - scoreA
    })

    return list
  }, [query, category, province, sort, onlyVerified, onlyAccepting])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPage(1)
  }

  function handleCategory(slug: string) {
    setCategory(slug)
    setPage(1)
  }

  function handleProvince(e: React.ChangeEvent<HTMLSelectElement>) {
    setProvince(e.target.value)
    setPage(1)
  }

  function clearFilters() {
    setQuery('')
    setCategory('todos')
    setProvince('')
    setOnlyVerified(false)
    setOnlyAccepting(false)
    setPage(1)
  }

  const hasActiveFilters = query || category !== 'todos' || province || onlyVerified || onlyAccepting

  return (
    <div className="flex flex-col min-h-full">
      <Header user={null} />
      <main className="flex-1 bg-slate-50">

        {/* ── Top bar ── */}
        <div className="bg-white border-b border-slate-200 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Abogados en Argentina</h1>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 h-11 rounded-lg border border-slate-200 bg-white px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                  placeholder="Buscar por nombre, especialidad o ciudad..."
                  className="flex-1 text-sm outline-none placeholder:text-slate-400"
                />
                {query && (
                  <button type="button" onClick={() => { setQuery(''); setPage(1) }}>
                    <X className="h-4 w-4 text-slate-400 hover:text-slate-700" />
                  </button>
                )}
              </div>

              {/* Province selector */}
              <select
                value={province}
                onChange={handleProvince}
                className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              >
                <option value="">Todas las provincias</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
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

            {/* Expanded filters */}
            {showFilters && (
              <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyVerified}
                    onChange={(e) => { setOnlyVerified(e.target.checked); setPage(1) }}
                    className="accent-blue-600"
                  />
                  Solo verificados
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyAccepting}
                    onChange={(e) => { setOnlyAccepting(e.target.checked); setPage(1) }}
                    className="accent-blue-600"
                  />
                  Acepta nuevos clientes
                </label>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" /> Limpiar filtros
                  </button>
                )}
              </div>
            )}

            {/* Category pills */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {CATEGORIES.map(({ slug, name }) => (
                <button
                  key={slug}
                  onClick={() => handleCategory(slug)}
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

        {/* ── Results ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">
              {filtered.length === 0
                ? 'Sin resultados para esa búsqueda'
                : <><span className="font-semibold text-slate-900">{filtered.length}</span> abogado{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</>
              }
            </p>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortKey); setPage(1) }}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none bg-white text-slate-600"
            >
              <option value="rating">Mejor valorados</option>
              <option value="response_time">Menor tiempo de respuesta</option>
              <option value="cases">Más casos</option>
              <option value="reviews">Más valoraciones</option>
            </select>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Search className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">No encontramos abogados</h3>
              <p className="text-sm text-slate-500 mb-5">
                Probá con otra especialidad, provincia o término de búsqueda.
              </p>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Ver todos los abogados
              </button>
            </div>
          )}

          {/* Grid */}
          {paginated.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map((lawyer) => (
                <LawyerCard key={lawyer.id} lawyer={lawyer} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-9 min-w-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
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

function LawyerCard({ lawyer }: { lawyer: typeof ALL_LAWYERS[number] }) {
  return (
    <div className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-all duration-300 ${
      lawyer.featured ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
    }`}>
      {lawyer.featured && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-white fill-white" />
          <span className="text-xs font-semibold text-white">PERFIL DESTACADO</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex gap-4">
          <div className="relative shrink-0">
            <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center">
              {lawyer.avatar}
            </div>
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
                <p className="text-xs text-slate-500">{lawyer.specialty}</p>
              </div>
              {lawyer.plan === 'premium' && (
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                  Premium
                </span>
              )}
            </div>

            <div className="mt-1.5 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-medium text-slate-900">{lawyer.rating}</span>
              <span className="text-xs text-slate-400">({lawyer.reviews})</span>
            </div>

            <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="h-3 w-3" />
              {lawyer.city}, {lawyer.province}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {lawyer.tags.slice(0, 3).map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 capitalize">{t}</span>
          ))}
        </div>

        <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">{lawyer.bio}</p>

        <div className="mt-3 flex gap-4 text-xs text-slate-400">
          <span>{lawyer.cases} casos</span>
          <span>~{lawyer.response_time}h respuesta</span>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/abogados/${lawyer.slug}`}
            className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            Ver perfil <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/mensajes/nuevo?abogado=${lawyer.id}`}
            className="h-9 px-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-600 transition-colors"
          >
            Contactar
          </Link>
        </div>

        {!lawyer.accepts && (
          <p className="mt-2 text-xs text-center text-amber-600 font-medium">
            No acepta nuevos clientes
          </p>
        )}
      </div>
    </div>
  )
}
