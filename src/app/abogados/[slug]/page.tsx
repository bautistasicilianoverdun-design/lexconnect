import {
  MapPin, Star, CheckCircle2, Clock, MessageSquare, Video,
  Briefcase, GraduationCap, Globe, Calendar,
  Shield, ArrowRight, Heart, Share2, Flag, BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

// Perfil mock para el MVP visual
const MOCK_LAWYER = {
  slug: 'rodrigo-saenz-laboral',
  full_name: 'Dr. Rodrigo Sáenz',
  avatar: 'RS',
  specialty: 'Derecho Laboral',
  specialties: [
    { name: 'Derecho Laboral', years: 10, primary: true },
    { name: 'Derecho Civil', years: 7, primary: false },
    { name: 'Accidentes de Tránsito', years: 5, primary: false },
  ],
  province: 'Córdoba',
  city: 'Córdoba Capital',
  bio: 'Especialista en conflictos laborales, despidos y accidentes de trabajo. Más de 10 años de experiencia litigando en el foro cordobés. Atención personalizada y estrategia clara desde el primer momento. Me especializo en defender los derechos de los trabajadores frente a grandes empresas y aseguradoras.',
  rating: 4.9,
  reviews_count: 127,
  cases_handled: 89,
  consultations: 312,
  response_time: '2',
  is_verified: true,
  verification_date: 'Verificado en enero 2024',
  plan: 'professional',
  license_number: 'CAB-12345',
  license_province: 'Córdoba',
  university: 'Universidad Nacional de Córdoba',
  graduation_year: 2012,
  languages: ['Español (nativo)', 'Inglés (avanzado)'],
  accepts_clients: true,
  website: 'www.saenzabogados.com',
  linkedin: 'linkedin.com/in/rodrigosaenz',
  experience: [
    { position: 'Abogado independiente', org: 'Estudio Sáenz & Asociados', from: '2018', to: 'Presente' },
    { position: 'Abogado asociado', org: 'García & Partners', from: '2014', to: '2018' },
    { position: 'Pasante', org: 'Ministerio de Trabajo – Córdoba', from: '2012', to: '2014' },
  ],
  education: [
    { degree: 'Especialización en Derecho del Trabajo', institution: 'UNC', year: '2015' },
    { degree: 'Abogacía', institution: 'Universidad Nacional de Córdoba', year: '2012' },
  ],
  reviews: [
    {
      id: '1',
      reviewer: 'Marcelo R.',
      avatar: 'MR',
      rating: 5,
      date: 'Hace 2 semanas',
      text: 'Excelente profesional. Me ayudó con mi despido injustificado y logró una indemnización superior a la que esperaba. Muy recomendable.',
      verified: true,
    },
    {
      id: '2',
      reviewer: 'Sandra P.',
      avatar: 'SP',
      rating: 5,
      date: 'Hace 1 mes',
      text: 'Muy claro en las explicaciones, me mantuvo informada en todo momento. Se nota su experiencia en el rubro laboral.',
      verified: true,
    },
    {
      id: '3',
      reviewer: 'Carlos M.',
      avatar: 'CM',
      rating: 4,
      date: 'Hace 2 meses',
      text: 'Buen abogado, resolvió mi caso de accidente laboral favorablemente. Alguna demora en responder mensajes pero el resultado fue muy bueno.',
      verified: false,
    },
  ],
}

export default function LawyerProfilePage({ params }: { params: { slug: string } }) {
  const lawyer = MOCK_LAWYER

  return (
    <div className="flex flex-col min-h-full">
      <Header user={null} />
      <main className="flex-1 bg-slate-50">
        {/* Hero */}
        <div className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-28 w-28 rounded-2xl bg-blue-100 text-blue-700 font-bold text-3xl flex items-center justify-center">
                  {lawyer.avatar}
                </div>
                {lawyer.is_verified && (
                  <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl font-bold text-slate-900">{lawyer.full_name}</h1>
                      {lawyer.is_verified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Verificado
                        </span>
                      )}
                      {lawyer.plan === 'premium' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 mt-1">{lawyer.specialty}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {lawyer.city}, {lawyer.province}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Responde en ~{lawyer.response_time}h
                      </span>
                      {lawyer.website && (
                        <a href={`https://${lawyer.website}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Globe className="h-3.5 w-3.5" />
                          {lawyer.website}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <button className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors" title="Guardar">
                      <Heart className="h-4 w-4 text-slate-500" />
                    </button>
                    <button className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors" title="Compartir">
                      <Share2 className="h-4 w-4 text-slate-500" />
                    </button>
                    <button className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors" title="Denunciar">
                      <Flag className="h-4 w-4 text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-5 flex flex-wrap gap-6">
                  <Stat
                    value={`${lawyer.rating} ★`}
                    label={`${lawyer.reviews_count} valoraciones`}
                    highlight
                  />
                  <Stat value={`${lawyer.cases_handled}`} label="casos atendidos" />
                  <Stat value={`${lawyer.consultations}`} label="consultas respondidas" />
                  <Stat value={`~${lawyer.response_time}h`} label="tiempo de respuesta" />
                </div>
              </div>
            </div>

            {/* CTA bar */}
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/mensajes/nuevo?abogado=${lawyer.slug}`}
                className="flex-1 sm:flex-none h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Enviar mensaje
              </Link>
              <button className="flex-1 sm:flex-none h-11 px-6 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
                <Video className="h-4 w-4" />
                Solicitar videollamada
              </button>
              <button className="flex-1 sm:flex-none h-11 px-6 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
                <Calendar className="h-4 w-4" />
                Ver disponibilidad
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Sobre mí */}
              <Section title="Sobre mí">
                <p className="text-slate-600 leading-relaxed">{lawyer.bio}</p>
              </Section>

              {/* Especialidades */}
              <Section title="Especialidades">
                <div className="space-y-3">
                  {lawyer.specialties.map((s) => (
                    <div key={s.name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 text-sm">{s.name}</span>
                        {s.primary && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700 font-medium">Principal</span>
                        )}
                      </div>
                      <span className="text-sm text-slate-400">{s.years} años de experiencia</span>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Experiencia */}
              <Section title="Experiencia profesional" icon={Briefcase}>
                <div className="space-y-5">
                  {lawyer.experience.map((exp, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-600 mt-1.5" />
                        {i < lawyer.experience.length - 1 && (
                          <div className="flex-1 w-px bg-slate-200 my-1.5" />
                        )}
                      </div>
                      <div className="pb-2">
                        <div className="font-semibold text-slate-900 text-sm">{exp.position}</div>
                        <div className="text-sm text-slate-500">{exp.org}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{exp.from} — {exp.to}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Educación */}
              <Section title="Educación" icon={GraduationCap}>
                <div className="space-y-4">
                  {lawyer.education.map((ed, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 shrink-0 mt-0.5">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-sm">{ed.degree}</div>
                        <div className="text-sm text-slate-500">{ed.institution} · {ed.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Valoraciones */}
              <Section title={`Valoraciones (${lawyer.reviews_count})`} icon={Star}>
                {/* Summary */}
                <div className="flex items-center gap-6 p-5 bg-slate-50 rounded-xl mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-slate-900">{lawyer.rating}</div>
                    <div className="flex gap-0.5 mt-1 justify-center">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`h-4 w-4 ${s <= Math.round(lawyer.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{lawyer.reviews_count} reseñas</div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const pct = star === 5 ? 68 : star === 4 ? 22 : star === 3 ? 7 : star === 2 ? 2 : 1
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-4">{star}</span>
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Reviews */}
                <div className="space-y-5">
                  {lawyer.reviews.map((review) => (
                    <div key={review.id} className="border-b border-slate-100 pb-5 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center">
                            {review.avatar}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                              {review.reviewer}
                              {review.verified && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                              )}
                            </div>
                            <div className="text-xs text-slate-400">{review.date}</div>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Right column — sidebar */}
            <div className="space-y-5">
              {/* Verification card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">Verificación</h3>
                </div>
                <div className="space-y-3">
                  <VerifyItem label="Identidad" ok />
                  <VerifyItem label={`Matrícula ${lawyer.license_number}`} ok />
                  <VerifyItem label="Correo electrónico" ok />
                  <VerifyItem label="Teléfono" ok />
                </div>
                <p className="text-xs text-slate-400 mt-4">{lawyer.verification_date}</p>
              </div>

              {/* Quick info */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <QuickInfoItem icon={<GraduationCap className="h-4 w-4" />} label="Universidad" value={lawyer.university ?? ''} />
                <QuickInfoItem icon={<Briefcase className="h-4 w-4" />} label="Años en ejercicio" value={`${new Date().getFullYear() - lawyer.graduation_year!} años`} />
                <QuickInfoItem icon={<Globe className="h-4 w-4" />} label="Idiomas" value={lawyer.languages.join(', ')} />
                <QuickInfoItem icon={<MapPin className="h-4 w-4" />} label="Matrícula" value={`${lawyer.license_province}`} />
              </div>

              {/* Contact sticky */}
              <div className="bg-white rounded-2xl border border-blue-100 p-5 sticky top-20">
                <h3 className="font-semibold text-slate-900 mb-4">Contactar al abogado</h3>
                {lawyer.accepts_clients ? (
                  <>
                    <p className="text-xs text-emerald-600 font-medium mb-4 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                      Acepta nuevos clientes
                    </p>
                    <div className="space-y-2.5">
                      <Link
                        href={`/mensajes/nuevo?abogado=${lawyer.slug}`}
                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Enviar mensaje
                      </Link>
                      <button className="w-full h-11 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
                        <Video className="h-4 w-4" />
                        Videollamada
                      </button>
                      <button className="w-full h-11 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
                        <BookOpen className="h-4 w-4" />
                        Ver casos disponibles
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-amber-600 font-medium">
                    Este abogado no acepta nuevos clientes en este momento.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon?: React.FC<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-slate-500" />}
        {title}
      </h2>
      {children}
    </div>
  )
}

function Stat({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div>
      <div className={`text-xl font-bold ${highlight ? 'text-amber-500' : 'text-slate-900'}`}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  )
}

function VerifyItem({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className={`h-4 w-4 ${ok ? 'text-blue-500' : 'text-slate-300'}`} />
      <span className="text-sm text-slate-600">{label}</span>
    </div>
  )
}

function QuickInfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-slate-400 mt-0.5">{icon}</span>
      <div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-sm text-slate-700 font-medium">{value}</div>
      </div>
    </div>
  )
}
