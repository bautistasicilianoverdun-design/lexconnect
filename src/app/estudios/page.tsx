import Link from 'next/link'
import {
  Search, MapPin, Star, CheckCircle2, Users, ArrowRight,
  Building2, SlidersHorizontal, Phone, Globe,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'

const MOCK_FIRMS = [
  {
    id: '1',
    slug: 'garcia-partners-caba',
    name: 'García & Partners',
    logo: 'G&P',
    description:
      'Estudio boutique con más de 20 años de trayectoria en derecho corporativo, M&A y litigios comerciales complejos. Clientes en Argentina, Uruguay y Chile.',
    specialties: ['Comercial', 'Societario', 'Laboral', 'Tributario'],
    province: 'Buenos Aires',
    city: 'CABA',
    lawyers: 8,
    rating: 4.9,
    reviews: 63,
    is_verified: true,
    phone: true,
    website: 'garciapartners.com.ar',
    founded: '2003',
  },
  {
    id: '2',
    slug: 'estudio-benitez-cordoba',
    name: 'Estudio Benítez & Asociados',
    logo: 'EB',
    description:
      'Líder en derecho laboral y previsional en Córdoba. Más de 1.500 casos resueltos favorablemente. Atención en toda la provincia.',
    specialties: ['Laboral', 'Previsional', 'Accidentes'],
    province: 'Córdoba',
    city: 'Córdoba Capital',
    lawyers: 5,
    rating: 4.8,
    reviews: 91,
    is_verified: true,
    phone: true,
    website: 'benitezabogados.com',
    founded: '2010',
  },
  {
    id: '3',
    slug: 'diaz-familia-rosario',
    name: 'Díaz Derecho de Familia',
    logo: 'DD',
    description:
      'Especialistas en derecho de familia, divorcios, adopciones, cuota alimentaria y violencia doméstica. Acompañamiento humano en momentos difíciles.',
    specialties: ['Familia', 'Sucesiones', 'Civil'],
    province: 'Santa Fe',
    city: 'Rosario',
    lawyers: 4,
    rating: 4.7,
    reviews: 47,
    is_verified: true,
    phone: false,
    website: '',
    founded: '2015',
  },
  {
    id: '4',
    slug: 'ltc-abogados-mendoza',
    name: 'LTC Abogados',
    logo: 'LTC',
    description:
      'Estudio integral con experiencia en derecho civil, penal y tributario. Presencia en Mendoza y San Juan. Consultas por videollamada disponibles.',
    specialties: ['Civil', 'Penal', 'Tributario', 'Comercial'],
    province: 'Mendoza',
    city: 'Mendoza Capital',
    lawyers: 6,
    rating: 4.6,
    reviews: 38,
    is_verified: true,
    phone: true,
    website: 'ltcabogados.com',
    founded: '2008',
  },
  {
    id: '5',
    slug: 'startup-legal-caba',
    name: 'StartupLegal AR',
    logo: 'SL',
    description:
      'El primer estudio jurídico especializado en startups y empresas de tecnología en Argentina. Contratos, propiedad intelectual, ESOP y rondas de inversión.',
    specialties: ['Tecnología', 'Societario', 'Propiedad Intelectual', 'Comercial'],
    province: 'Buenos Aires',
    city: 'CABA',
    lawyers: 3,
    rating: 5.0,
    reviews: 29,
    is_verified: true,
    phone: false,
    website: 'startuplegal.ar',
    founded: '2019',
  },
  {
    id: '6',
    slug: 'consumidor-defensa-ba',
    name: 'Defensa del Consumidor Legal',
    logo: 'DC',
    description:
      'Nos dedicamos exclusivamente a la defensa de consumidores frente a empresas, bancos y aseguradoras. Sin honorarios anticipados — solo cobramos si ganamos.',
    specialties: ['Consumidor', 'Civil', 'Bancario'],
    province: 'Buenos Aires',
    city: 'CABA',
    lawyers: 4,
    rating: 4.8,
    reviews: 112,
    is_verified: false,
    phone: true,
    website: '',
    founded: '2016',
  },
]

export default async function EstudiosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let isLawyer = false
  if (user) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    isLawyer = data?.role === 'lawyer' || data?.role === 'firm_admin'
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header user={null} />
      <main className="flex-1 bg-slate-50">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Estudios jurídicos verificados</h1>
            <p className="text-sm text-slate-500 mb-6">
              Encontrá el estudio ideal para tu caso en toda Argentina
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 h-11 rounded-lg border border-slate-200 bg-white px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o especialidad..."
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
          </div>
        </div>

        {/* Results */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-sm text-slate-500 mb-6">
            <span className="font-semibold text-slate-900">{MOCK_FIRMS.length}</span> estudios encontrados
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_FIRMS.map((firm) => (
              <div
                key={firm.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Logo + name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-sm shrink-0">
                    {firm.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-slate-900 text-sm leading-tight">{firm.name}</h2>
                      {firm.is_verified && (
                        <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium text-slate-900">{firm.rating}</span>
                      <span className="text-xs text-slate-400">({firm.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                      <MapPin className="h-3 w-3" />
                      {firm.city}, {firm.province}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4 flex-1">
                  {firm.description}
                </p>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {firm.specialties.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 pb-4 border-b border-slate-100">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {firm.lawyers} abogados
                  </span>
                  <span>Desde {firm.founded}</span>
                  {firm.website && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {firm.website}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/estudios/${firm.slug}`}
                    className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Ver estudio <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/mensajes/nuevo?estudio=${firm.id}`}
                    className="h-9 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-medium text-slate-600 transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Contactar
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* CTA para estudios */}
          {!isLawyer && (
            <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-center text-white">
              <Building2 className="h-10 w-10 mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-bold mb-2">¿Tenés un estudio jurídico?</h3>
              <p className="text-slate-300 text-sm mb-6 max-w-md mx-auto">
                Creá la página institucional de tu estudio, mostrá a tu equipo y empezá a recibir consultas hoy.
              </p>
              <Link
                href="/registro?rol=estudio"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Registrar mi estudio <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
