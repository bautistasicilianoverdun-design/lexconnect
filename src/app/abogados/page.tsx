import { Search, SlidersHorizontal, MapPin, Star, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const CATEGORIES = [
  { slug: 'todos', name: 'Todas las especialidades' },
  { slug: 'laboral', name: 'Laboral' },
  { slug: 'civil', name: 'Civil' },
  { slug: 'penal', name: 'Penal' },
  { slug: 'comercial', name: 'Comercial' },
  { slug: 'familia', name: 'Familia' },
  { slug: 'inmobiliario', name: 'Inmobiliario' },
  { slug: 'tributario', name: 'Tributario' },
  { slug: 'consumidor', name: 'Consumidor' },
  { slug: 'transito', name: 'Tránsito' },
]

// Mock data para el MVP visual
const MOCK_LAWYERS = [
  {
    id: '1',
    slug: 'rodrigo-saenz-laboral',
    full_name: 'Dr. Rodrigo Sáenz',
    avatar: 'RS',
    specialty: 'Derecho Laboral',
    specialties: ['Laboral', 'Civil'],
    province: 'Córdoba',
    city: 'Córdoba',
    rating: 4.9,
    reviews: 127,
    cases: 89,
    response_time: '2',
    is_verified: true,
    is_featured: false,
    plan: 'professional',
    bio: 'Especialista en conflictos laborales, despidos y accidentes de trabajo. Más de 10 años de experiencia en el foro cordobés.',
    accepts_clients: true,
  },
  {
    id: '2',
    slug: 'maria-lorena-castro-familia',
    full_name: 'Dra. María Lorena Castro',
    avatar: 'MC',
    specialty: 'Derecho de Familia',
    specialties: ['Familia', 'Civil', 'Sucesiones'],
    province: 'Buenos Aires',
    city: 'CABA',
    rating: 4.8,
    reviews: 214,
    cases: 156,
    response_time: '4',
    is_verified: true,
    is_featured: true,
    plan: 'premium',
    bio: 'Divorcios, cuota alimentaria, adopciones y sucesiones. Atención personalizada y empática para situaciones familiares complejas.',
    accepts_clients: true,
  },
  {
    id: '3',
    slug: 'pablo-herrera-penal',
    full_name: 'Dr. Pablo Herrera',
    avatar: 'PH',
    specialty: 'Derecho Penal',
    specialties: ['Penal', 'Contravencional'],
    province: 'Buenos Aires',
    city: 'Mar del Plata',
    rating: 4.7,
    reviews: 89,
    cases: 72,
    response_time: '6',
    is_verified: true,
    is_featured: false,
    plan: 'professional',
    bio: 'Defensa penal en todas las instancias. Ex fiscal de la Provincia de Buenos Aires. Resultados comprobados.',
    accepts_clients: true,
  },
  {
    id: '4',
    slug: 'laura-benitez-comercial',
    full_name: 'Dra. Laura Benítez',
    avatar: 'LB',
    specialty: 'Derecho Comercial',
    specialties: ['Comercial', 'Societario', 'Startup'],
    province: 'Santa Fe',
    city: 'Rosario',
    rating: 4.9,
    reviews: 63,
    cases: 48,
    response_time: '3',
    is_verified: true,
    is_featured: false,
    plan: 'premium',
    bio: 'Asesora legal de empresas y startups. Contratos, M&A, compliance y resolución de conflictos comerciales.',
    accepts_clients: true,
  },
  {
    id: '5',
    slug: 'carlos-mendez-inmobiliario',
    full_name: 'Dr. Carlos Méndez',
    avatar: 'CM',
    specialty: 'Derecho Inmobiliario',
    specialties: ['Inmobiliario', 'Civil'],
    province: 'Mendoza',
    city: 'Mendoza',
    rating: 4.6,
    reviews: 45,
    cases: 38,
    response_time: '8',
    is_verified: true,
    is_featured: false,
    plan: 'free',
    bio: 'Compraventa de inmuebles, alquileres, PHorizontal y usucapión. Experto en el mercado inmobiliario mendocino.',
    accepts_clients: true,
  },
  {
    id: '6',
    slug: 'ana-garcia-tributario',
    full_name: 'Dra. Ana García',
    avatar: 'AG',
    specialty: 'Derecho Tributario',
    specialties: ['Tributario', 'AFIP', 'Comercial'],
    province: 'Buenos Aires',
    city: 'CABA',
    rating: 4.8,
    reviews: 91,
    cases: 67,
    response_time: '5',
    is_verified: true,
    is_featured: false,
    plan: 'professional',
    bio: 'Especialista en AFIP, Ingresos Brutos y planificación fiscal para personas y empresas. Resolución de inspecciones y recursos.',
    accepts_clients: false,
  },
]

export default function LawyersPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header user={null} />
      <main className="flex-1 bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">
              Abogados en Argentina
            </h1>

            {/* Search + filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 h-11 rounded-lg border border-slate-200 bg-white px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, especialidad..."
                  className="flex-1 text-sm outline-none placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-center gap-2 h-11 rounded-lg border border-slate-200 bg-white px-4 cursor-pointer hover:border-slate-300 transition-colors">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-500">Provincia</span>
              </div>
              <button className="flex items-center gap-2 h-11 px-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors text-sm text-slate-600 font-medium">
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </button>
            </div>

            {/* Category pills */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map(({ slug, name }) => (
                <button
                  key={slug}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    slug === 'todos'
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

        {/* Results */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">5.284</span> abogados encontrados
            </p>
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none bg-white text-slate-600">
              <option>Más valorados</option>
              <option>Más recientes</option>
              <option>Menor tiempo de respuesta</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_LAWYERS.map((lawyer) => (
              <div
                key={lawyer.id}
                className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-all duration-300 ${
                  lawyer.is_featured ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                }`}
              >
                {lawyer.is_featured && (
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-white fill-white" />
                    <span className="text-xs font-semibold text-white">PERFIL DESTACADO</span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center">
                        {lawyer.avatar}
                      </div>
                      {lawyer.is_verified && (
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white">
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/abogados/${lawyer.slug}`}
                            className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-sm line-clamp-1"
                          >
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

                      {/* Rating */}
                      <div className="mt-1.5 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-medium text-slate-900">{lawyer.rating}</span>
                        <span className="text-xs text-slate-400">({lawyer.reviews})</span>
                      </div>

                      {/* Meta */}
                      <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {lawyer.city}, {lawyer.province}
                      </div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {lawyer.specialties.map((s) => (
                      <span key={s} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Bio */}
                  <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {lawyer.bio}
                  </p>

                  {/* Stats */}
                  <div className="mt-3 flex gap-4 text-xs text-slate-500">
                    <span>{lawyer.cases} casos</span>
                    <span>~{lawyer.response_time}h respuesta</span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/abogados/${lawyer.slug}`}
                      className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      Ver perfil <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <button className="h-9 px-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-600 transition-colors">
                      Contactar
                    </button>
                  </div>

                  {!lawyer.accepts_clients && (
                    <p className="mt-2 text-xs text-center text-amber-600 font-medium">
                      No acepta nuevos clientes
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-10 flex justify-center gap-2">
            {[1, 2, 3, '...', 48].map((page, i) => (
              <button
                key={i}
                className={`h-9 min-w-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                  page === 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
