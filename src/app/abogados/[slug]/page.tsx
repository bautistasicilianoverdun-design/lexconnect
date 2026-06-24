import {
  MapPin, Star, CheckCircle2, Clock, MessageSquare, Video,
  Briefcase, GraduationCap, Globe, Shield, Share2, BookOpen,
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'
import FavoriteButton from '@/components/FavoriteButton'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(w => /^[A-Za-záéíóúñÁÉÍÓÚÑ]/.test(w))
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1)  return 'Hoy'
  if (days < 7)  return `Hace ${days} día${days > 1 ? 's' : ''}`
  if (days < 30) return `Hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? 's' : ''}`
  if (days < 365) return `Hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? 'es' : ''}`
  return `Hace ${Math.floor(days / 365)} año${Math.floor(days / 365) > 1 ? 's' : ''}`
}

const IS_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LawyerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase  = await createClient()

  const { data: { user: currentUser } } = await supabase.auth.getUser()
  let isCurrentLawyer = false
  if (currentUser) {
    const { data: cp } = await supabase.from('profiles').select('role').eq('id', currentUser.id).maybeSingle()
    isCurrentLawyer = cp?.role === 'lawyer' || cp?.role === 'firm_admin'
  }

  // Buscar por slug o por id (UUID)
  const isUUID = IS_UUID.test(slug)
  const { data: lp } = await supabase
    .from('lawyer_profiles')
    .select(`
      id, slug, plan, is_featured,
      verification_status, verified_at,
      rating_avg, rating_count,
      cases_handled, consultations_answered,
      response_time_hours, accepts_new_clients,
      license_number, university, graduation_year,
      profiles!user_id(full_name, avatar_url, city, bio, website, linkedin_url,
        provinces(name)
      ),
      license_province:provinces!license_province_id(name),
      lawyer_specialties(is_primary, years_experience, legal_categories(slug, name)),
      lawyer_experience(position, organization, start_year, end_year, is_current, sort_order),
      lawyer_education(degree, institution, year, sort_order),
      lawyer_languages(language, level)
    `)
    .eq(isUUID ? 'id' : 'slug', slug)
    .maybeSingle()

  if (!lp) notFound()

  // Reviews reales
  const { data: reviewsRaw } = await supabase
    .from('reviews')
    .select('id, rating, comment, title, created_at, is_verified, profiles!reviewer_id(full_name, avatar_url)')
    .eq('lawyer_id', lp.id)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(10)

  // ── Normalizar datos ──
  const profile       = (Array.isArray(lp.profiles) ? lp.profiles[0] : lp.profiles) as any
  const provinceName  = profile?.provinces
    ? (Array.isArray(profile.provinces) ? profile.provinces[0] : profile.provinces)?.name ?? ''
    : ''
  const licProvince   = lp.license_province
    ? (Array.isArray(lp.license_province) ? lp.license_province[0] : lp.license_province as any)?.name ?? ''
    : ''

  const specialties: Array<{ name: string; slug: string; years: number | null; primary: boolean }> =
    (lp.lawyer_specialties ?? [])
      .filter((s: any) => s.legal_categories)
      .map((s: any) => ({
        name:    s.legal_categories.name as string,
        slug:    s.legal_categories.slug as string,
        years:   s.years_experience as number | null,
        primary: s.is_primary as boolean,
      }))
      .sort((a: any, b: any) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0))

  const experience = [...(lp.lawyer_experience ?? [])]
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  const education = [...(lp.lawyer_education ?? [])]
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  const languages: string[] = (lp.lawyer_languages ?? []).map((l: any) => {
    const levels: Record<string, string> = {
      native: 'nativo', advanced: 'avanzado',
      intermediate: 'intermedio', basic: 'básico',
    }
    return `${l.language}${l.level ? ` (${levels[l.level] ?? l.level})` : ''}`
  })

  const reviews = (reviewsRaw ?? []).map((r: any) => {
    const rev = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
    return {
      id:        r.id as string,
      rating:    r.rating as number,
      comment:   r.comment as string,
      title:     r.title as string | null,
      date:      timeAgo(r.created_at as string),
      verified:  r.is_verified as boolean,
      reviewer:  (rev?.full_name as string | undefined) ?? 'Cliente',
      avatar:    (rev?.avatar_url as string | undefined) ?? null,
    }
  })

  const fullName     = profile?.full_name ?? 'Abogado'
  const initials     = getInitials(fullName)
  const isVerified   = lp.verification_status === 'verified'
  const rating       = Number(lp.rating_avg ?? 0)
  const primarySpec  = specialties.find(s => s.primary) ?? specialties[0]
  const yearsActive  = lp.graduation_year ? new Date().getFullYear() - lp.graduation_year : null

  return (
    <div className="flex flex-col min-h-full">
      <Header user={null} />
      <main className="flex-1 bg-slate-50">

        {/* ── Hero ── */}
        <div className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-6">

              {/* Avatar */}
              <div className="relative shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={fullName}
                    className="h-28 w-28 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-2xl bg-blue-100 text-blue-700 font-bold text-3xl flex items-center justify-center">
                    {initials}
                  </div>
                )}
                {isVerified && (
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
                      <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verificado
                        </span>
                      )}
                      {lp.plan === 'premium' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 mt-1">{primarySpec?.name ?? 'Abogado'}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                      {(profile?.city || provinceName) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {[profile?.city, provinceName].filter(Boolean).join(', ')}
                        </span>
                      )}
                      {lp.response_time_hours != null && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Responde en ~{lp.response_time_hours}h
                        </span>
                      )}
                      {profile?.website && (
                        <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Globe className="h-3.5 w-3.5" />
                          {profile.website}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <FavoriteButton lawyerProfileId={lp.id} />
                    <button className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors" title="Compartir">
                      <Share2 className="h-4 w-4 text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-5 flex flex-wrap gap-6">
                  {rating > 0 && (
                    <Stat value={`${rating.toFixed(1)} ★`} label={`${lp.rating_count} valoraciones`} highlight />
                  )}
                  {(lp.cases_handled ?? 0) > 0 && (
                    <Stat value={String(lp.cases_handled)} label="casos atendidos" />
                  )}
                  {(lp.consultations_answered ?? 0) > 0 && (
                    <Stat value={String(lp.consultations_answered)} label="consultas respondidas" />
                  )}
                  {lp.response_time_hours != null && (
                    <Stat value={`~${lp.response_time_hours}h`} label="tiempo de respuesta" />
                  )}
                </div>
              </div>
            </div>

            {/* CTA bar */}
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/dashboard/mensajes`}
                className="flex-1 sm:flex-none h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Enviar mensaje
              </Link>
              <button className="flex-1 sm:flex-none h-11 px-6 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
                <Video className="h-4 w-4" />
                Solicitar videollamada
              </button>
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-8">

              {/* Sobre mí */}
              {profile?.bio && (
                <Section title="Sobre mí">
                  <p className="text-slate-600 leading-relaxed">{profile.bio}</p>
                </Section>
              )}

              {/* Especialidades */}
              {specialties.length > 0 && (
                <Section title="Especialidades">
                  <div className="space-y-3">
                    {specialties.map(s => (
                      <div key={s.slug} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 text-sm">{s.name}</span>
                          {s.primary && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700 font-medium">Principal</span>
                          )}
                        </div>
                        {s.years != null && (
                          <span className="text-sm text-slate-400">{s.years} años de experiencia</span>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Experiencia */}
              {experience.length > 0 && (
                <Section title="Experiencia profesional" icon={Briefcase}>
                  <div className="space-y-5">
                    {experience.map((exp: any, i: number) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-blue-600 mt-1.5" />
                          {i < experience.length - 1 && (
                            <div className="flex-1 w-px bg-slate-200 my-1.5" />
                          )}
                        </div>
                        <div className="pb-2">
                          <div className="font-semibold text-slate-900 text-sm">{exp.position}</div>
                          <div className="text-sm text-slate-500">{exp.organization}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {exp.start_year} — {exp.is_current ? 'Presente' : (exp.end_year ?? '')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Educación */}
              {education.length > 0 && (
                <Section title="Educación" icon={GraduationCap}>
                  <div className="space-y-4">
                    {education.map((ed: any, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 shrink-0 mt-0.5">
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">{ed.degree}</div>
                          <div className="text-sm text-slate-500">{ed.institution}{ed.year ? ` · ${ed.year}` : ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Valoraciones */}
              <Section title={`Valoraciones${lp.rating_count ? ` (${lp.rating_count})` : ''}`} icon={Star}>
                {rating > 0 ? (
                  <div className="flex items-center gap-6 p-5 bg-slate-50 rounded-xl mb-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-slate-900">{rating.toFixed(1)}</div>
                      <div className="flex gap-0.5 mt-1 justify-center">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`h-4 w-4 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{lp.rating_count} reseñas</div>
                    </div>
                  </div>
                ) : null}

                {reviews.length > 0 ? (
                  <div className="space-y-5">
                    {reviews.map(review => (
                      <div key={review.id} className="border-b border-slate-100 pb-5 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center overflow-hidden">
                              {review.avatar
                                ? <img src={review.avatar} alt={review.reviewer} className="h-full w-full object-cover" />
                                : getInitials(review.reviewer)
                              }
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                                {review.reviewer}
                                {review.verified && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />}
                              </div>
                              <div className="text-xs text-slate-400">{review.date}</div>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                        {review.title && <p className="text-sm font-medium text-slate-800 mb-1">{review.title}</p>}
                        <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-8 w-8 mx-auto text-slate-200 mb-2" />
                    <p className="text-sm text-slate-400">Todavía no hay valoraciones para este abogado.</p>
                  </div>
                )}
              </Section>
            </div>

            {/* Right column — sidebar */}
            <div className="space-y-5">

              {/* Verificación */}
              {isVerified && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">Verificación</h3>
                  </div>
                  <div className="space-y-3">
                    <VerifyItem label="Identidad" />
                    {lp.license_number && <VerifyItem label={`Matrícula ${lp.license_number}`} />}
                    <VerifyItem label="Correo electrónico" />
                  </div>
                  {lp.verified_at && (
                    <p className="text-xs text-slate-400 mt-4">
                      Verificado en {new Date(lp.verified_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )}

              {/* Info rápida */}
              {(lp.university || yearsActive || languages.length > 0 || licProvince) && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  {lp.university && (
                    <QuickInfoItem icon={<GraduationCap className="h-4 w-4" />} label="Universidad" value={lp.university} />
                  )}
                  {yearsActive && (
                    <QuickInfoItem icon={<Briefcase className="h-4 w-4" />} label="Años en ejercicio" value={`${yearsActive} años`} />
                  )}
                  {languages.length > 0 && (
                    <QuickInfoItem icon={<Globe className="h-4 w-4" />} label="Idiomas" value={languages.join(', ')} />
                  )}
                  {licProvince && (
                    <QuickInfoItem icon={<MapPin className="h-4 w-4" />} label="Provincia de matrícula" value={licProvince} />
                  )}
                </div>
              )}

              {/* Contacto */}
              <div className="bg-white rounded-2xl border border-blue-100 p-5 sticky top-20">
                <h3 className="font-semibold text-slate-900 mb-4">Contactar al abogado</h3>
                {lp.accepts_new_clients !== false ? (
                  <>
                    <p className="text-xs text-emerald-600 font-medium mb-4 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                      Acepta nuevos clientes
                    </p>
                    <div className="space-y-2.5">
                      <Link
                        href="/dashboard/mensajes"
                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Enviar mensaje
                      </Link>
                      {!isCurrentLawyer && (
                        <Link
                          href="/casos/nuevo"
                          className="w-full h-11 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                          <BookOpen className="h-4 w-4" />
                          Publicar mi caso
                        </Link>
                      )}
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

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Section({
  title, icon: Icon, children,
}: {
  title: string
  icon?: React.FC<{ className?: string }>
  children: React.ReactNode
}) {
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

function VerifyItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="h-4 w-4 text-blue-500" />
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
