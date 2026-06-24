import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  MapPin, Star, CheckCircle2, Users, ArrowLeft,
  Globe, Phone, Building2, MessageSquare, ChevronRight, Calendar,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const MOCK_FIRMS: Record<string, {
  id: string; slug: string; name: string; logo: string;
  description: string; fullDescription: string; specialties: string[];
  province: string; city: string; address: string; lawyers: number;
  rating: number; reviews: number; is_verified: boolean;
  phone: boolean; website: string; founded: string;
  team: Array<{ name: string; role: string; avatar: string }>;
}> = {
  'garcia-partners-caba': {
    id: '1', slug: 'garcia-partners-caba', name: 'García & Partners', logo: 'G&P',
    description: 'Estudio boutique con más de 20 años de trayectoria en derecho corporativo, M&A y litigios comerciales complejos.',
    fullDescription: 'García & Partners es un estudio jurídico boutique fundado en 2003 con más de 20 años de trayectoria en derecho corporativo, fusiones y adquisiciones, y litigios comerciales complejos. Trabajamos con empresas nacionales e internacionales, fondos de inversión y empresarios que necesitan asesoramiento estratégico de primer nivel. Nuestra metodología combina el rigor técnico con la visión de negocio, lo que nos permite ofrecer soluciones legales que agregan valor real. Contamos con presencia en Argentina, Uruguay y Chile, y alianzas con estudios en Brasil y Estados Unidos.',
    specialties: ['Comercial', 'Societario', 'Laboral', 'Tributario'],
    province: 'Buenos Aires', city: 'CABA', address: 'Av. Corrientes 1234, Piso 8, CABA',
    lawyers: 8, rating: 4.9, reviews: 63, is_verified: true,
    phone: true, website: 'garciapartners.com.ar', founded: '2003',
    team: [
      { name: 'Dr. Martín García', role: 'Socio fundador · Corporativo', avatar: 'MG' },
      { name: 'Dra. Valeria Torres', role: 'Socia · M&A', avatar: 'VT' },
      { name: 'Dr. Sebastián Ruiz', role: 'Asociado senior · Litigios', avatar: 'SR' },
    ],
  },
  'estudio-benitez-cordoba': {
    id: '2', slug: 'estudio-benitez-cordoba', name: 'Estudio Benítez & Asociados', logo: 'EB',
    description: 'Líder en derecho laboral y previsional en Córdoba. Más de 1.500 casos resueltos favorablemente.',
    fullDescription: 'Estudio Benítez & Asociados es el estudio de referencia en derecho laboral y previsional en la provincia de Córdoba. Desde 2010 hemos representado a más de 3.000 trabajadores y resuelto favorablemente más de 1.500 casos. Nuestra especialización profunda en la materia nos permite obtener resultados superiores al promedio del mercado. Atendemos en toda la provincia con consultas presenciales en Córdoba Capital y virtuales para el interior.',
    specialties: ['Laboral', 'Previsional', 'Accidentes'],
    province: 'Córdoba', city: 'Córdoba Capital', address: 'San Martín 280, Piso 3, Córdoba Capital',
    lawyers: 5, rating: 4.8, reviews: 91, is_verified: true,
    phone: true, website: 'benitezabogados.com', founded: '2010',
    team: [
      { name: 'Dr. Pablo Benítez', role: 'Socio fundador · Laboral', avatar: 'PB' },
      { name: 'Dra. Carolina Vega', role: 'Socia · Previsional', avatar: 'CV' },
    ],
  },
  'diaz-familia-rosario': {
    id: '3', slug: 'diaz-familia-rosario', name: 'Díaz Derecho de Familia', logo: 'DD',
    description: 'Especialistas en derecho de familia, divorcios, adopciones, cuota alimentaria y violencia doméstica.',
    fullDescription: 'En Díaz Derecho de Familia entendemos que los conflictos familiares son momentos difíciles que requieren no solo expertise jurídico sino también acompañamiento humano. Desde 2015 trabajamos con familias de Rosario y la región en divorcios, adopciones, cuota alimentaria, violencia doméstica y sucesiones. Nuestro enfoque busca siempre la resolución más ágil y menos traumática posible para todas las partes, priorizando el bienestar de los niños cuando están involucrados.',
    specialties: ['Familia', 'Sucesiones', 'Civil'],
    province: 'Santa Fe', city: 'Rosario', address: 'Córdoba 1520, Rosario',
    lawyers: 4, rating: 4.7, reviews: 47, is_verified: true,
    phone: false, website: '', founded: '2015',
    team: [
      { name: 'Dra. Marcela Díaz', role: 'Fundadora · Familia', avatar: 'MD' },
      { name: 'Dr. Nicolás Peralta', role: 'Asociado · Sucesiones', avatar: 'NP' },
    ],
  },
  'ltc-abogados-mendoza': {
    id: '4', slug: 'ltc-abogados-mendoza', name: 'LTC Abogados', logo: 'LTC',
    description: 'Estudio integral con experiencia en derecho civil, penal y tributario en Mendoza y San Juan.',
    fullDescription: 'LTC Abogados es un estudio integral con presencia en Mendoza y San Juan que brinda asesoramiento en derecho civil, penal y tributario. Fundado en 2008, contamos con un equipo multidisciplinario que permite abordar casos complejos que involucran múltiples ramas del derecho. Ofrecemos consultas por videollamada para clientes de todo el país y tenemos convenios con estudios en Chile para asuntos transfronterizos.',
    specialties: ['Civil', 'Penal', 'Tributario', 'Comercial'],
    province: 'Mendoza', city: 'Mendoza Capital', address: 'San Martín 1050, Mendoza Capital',
    lawyers: 6, rating: 4.6, reviews: 38, is_verified: true,
    phone: true, website: 'ltcabogados.com', founded: '2008',
    team: [
      { name: 'Dr. Alberto Torres', role: 'Socio · Civil y Penal', avatar: 'AT' },
      { name: 'Dra. Florencia Cano', role: 'Socia · Tributario', avatar: 'FC' },
    ],
  },
  'startup-legal-caba': {
    id: '5', slug: 'startup-legal-caba', name: 'StartupLegal AR', logo: 'SL',
    description: 'El primer estudio jurídico especializado en startups y empresas de tecnología en Argentina.',
    fullDescription: 'StartupLegal AR es el primer estudio jurídico de Argentina especializado exclusivamente en startups y empresas de tecnología. Fundado en 2019, hemos acompañado a más de 200 startups desde su constitución hasta rondas Serie A. Nuestros servicios incluyen contratos de fundadores, ESOP y vesting, acuerdos de inversión, propiedad intelectual, contratos SaaS y cumplimiento de privacidad (GDPR/LPDP). Hablamos el idioma del ecosistema tech.',
    specialties: ['Tecnología', 'Societario', 'Propiedad Intelectual', 'Comercial'],
    province: 'Buenos Aires', city: 'CABA', address: 'Palermo Soho, CABA (solo con turno)',
    lawyers: 3, rating: 5.0, reviews: 29, is_verified: true,
    phone: false, website: 'startuplegal.ar', founded: '2019',
    team: [
      { name: 'Dra. Camila Herrera', role: 'Fundadora · Tech Law', avatar: 'CH' },
      { name: 'Dr. Ignacio Solano', role: 'Asociado · IP', avatar: 'IS' },
    ],
  },
  'consumidor-defensa-ba': {
    id: '6', slug: 'consumidor-defensa-ba', name: 'Defensa del Consumidor Legal', logo: 'DC',
    description: 'Nos dedicamos exclusivamente a la defensa de consumidores frente a empresas, bancos y aseguradoras.',
    fullDescription: 'Defensa del Consumidor Legal es el único estudio de Argentina dedicado al 100% a la defensa de consumidores. Desde 2016 hemos recuperado más de $50 millones en indemnizaciones para nuestros clientes. Trabajamos bajo el modelo de honorarios contingentes: solo cobramos si ganamos. Nos especializamos en reclamos contra bancos por cobros indebidos, aseguradoras que no pagan, empresas de telefonía, aerolíneas y comercios electrónicos. Operamos en todo el país de forma virtual.',
    specialties: ['Consumidor', 'Civil', 'Bancario'],
    province: 'Buenos Aires', city: 'CABA', address: 'Solo atención virtual',
    lawyers: 4, rating: 4.8, reviews: 112, is_verified: false,
    phone: true, website: '', founded: '2016',
    team: [
      { name: 'Dr. Federico Morales', role: 'Fundador · Consumidor', avatar: 'FM' },
      { name: 'Dra. Romina Aguirre', role: 'Asociada · Bancario', avatar: 'RA' },
    ],
  },
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < Math.round(n) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
      ))}
    </div>
  )
}

export default async function EstudioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const firm = MOCK_FIRMS[slug]
  if (!firm) notFound()

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
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">

          <Link href="/estudios" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Volver a estudios
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 space-y-5">
              {/* Header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-start gap-5 mb-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-sm shrink-0">
                    {firm.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h1 className="text-xl font-bold text-slate-900">{firm.name}</h1>
                      {firm.is_verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                          <CheckCircle2 className="h-3 w-3" /> Verificado
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Stars n={firm.rating} />
                      <span className="text-sm font-semibold text-slate-900">{firm.rating}</span>
                      <span className="text-sm text-slate-400">({firm.reviews} reseñas)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      {firm.city}, {firm.province}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {firm.specialties.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{s}</span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-900">{firm.lawyers}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Abogados</p>
                  </div>
                  <div className="text-center border-x border-slate-100">
                    <p className="text-xl font-bold text-slate-900">{firm.reviews}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Reseñas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-900">{new Date().getFullYear() - parseInt(firm.founded)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Años de trayectoria</p>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-3">Sobre el estudio</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{firm.fullDescription}</p>
              </div>

              {/* Team */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Equipo</h2>
                <div className="space-y-4">
                  {firm.team.map((member) => (
                    <div key={member.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Contact card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Información de contacto</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600">{firm.address}</span>
                  </div>
                  {firm.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-slate-600">Disponible al contactar</span>
                    </div>
                  )}
                  {firm.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-slate-600">{firm.website}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="text-slate-600">Fundado en {firm.founded}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="text-slate-600">{firm.lawyers} abogados</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <Link
                    href="/iniciar-sesion"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" /> Contactar estudio
                  </Link>
                  {!isLawyer && (
                    <Link
                      href="/casos/nuevo"
                      className="flex items-center justify-center gap-2 w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors"
                    >
                      Publicar mi caso
                    </Link>
                  )}
                </div>
              </div>

              {/* Rating breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900">{firm.rating}</p>
                    <Stars n={firm.rating} />
                    <p className="text-xs text-slate-400 mt-1">{firm.reviews} reseñas</p>
                  </div>
                </div>
                {[5, 4, 3, 2, 1].map((n) => {
                  const pct = n === 5 ? 80 : n === 4 ? 15 : n === 3 ? 3 : n === 2 ? 1 : 1
                  return (
                    <div key={n} className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-slate-500 w-3">{n}</span>
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                    </div>
                  )
                })}
              </div>

              {!isLawyer && (
                <div className="bg-slate-900 rounded-2xl p-5 text-center text-white">
                  <Building2 className="h-8 w-8 mx-auto mb-3 text-blue-400" />
                  <p className="font-bold text-sm mb-1">¿Tenés un estudio?</p>
                  <p className="text-slate-300 text-xs mb-4">Creá tu página institucional y empezá a recibir consultas.</p>
                  <Link
                    href="/registro?rol=estudio"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Registrar estudio <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
