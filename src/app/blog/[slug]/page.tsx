import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Clock, Eye, ChevronLeft, MapPin, CheckCircle2, Star } from 'lucide-react'

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article, error } = await supabase
    .from('articles')
    .select(`
      id, title, slug, excerpt, content, views_count, published_at, created_at,
      legal_categories!category_id(name),
      lawyer_profiles!lawyer_id(
        id, slug, rating_avg, rating_count, verification_status,
        profiles!user_id(full_name, city, bio)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !article) notFound()

  // Increment views
  await supabase
    .from('articles')
    .update({ views_count: (article.views_count ?? 0) + 1 })
    .eq('id', article.id)

  const cat = (Array.isArray(article.legal_categories)
    ? article.legal_categories[0]
    : article.legal_categories) as { name: string } | null

  const lawyer = (Array.isArray(article.lawyer_profiles)
    ? article.lawyer_profiles[0]
    : article.lawyer_profiles) as {
    id: string
    slug: string | null
    rating_avg: number
    rating_count: number
    verification_status: string
    profiles: { full_name: string; city: string | null; bio: string | null } | { full_name: string; city: string | null; bio: string | null }[] | null
  } | null

  const lawyerProfile = lawyer?.profiles
    ? (Array.isArray(lawyer.profiles) ? lawyer.profiles[0] : lawyer.profiles)
    : null

  const publishDate = article.published_at ?? article.created_at
  const formattedDate = new Date(publishDate).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Volver al blog
        </Link>

        {/* Article */}
        <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-8">
            {cat && (
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mb-4">
                {cat.name}
              </span>
            )}
            <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-4">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="text-lg text-slate-500 leading-relaxed mb-6 border-b border-slate-100 pb-6">
                {article.excerpt}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-8">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> {article.views_count + 1} lecturas
              </span>
            </div>

            {/* Content */}
            <div className="prose prose-slate max-w-none">
              {article.content.split('\n\n').map((paragraph: string, i: number) => (
                <p key={i} className="text-slate-700 leading-relaxed mb-4 text-base">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </article>

        {/* Author card */}
        {lawyer && lawyerProfile && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Sobre el autor</p>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg shrink-0">
                {lawyerProfile.full_name?.charAt(0)?.toUpperCase() ?? 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900">{lawyerProfile.full_name}</h3>
                  {lawyer.verification_status === 'verified' && (
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  )}
                  {lawyer.rating_avg > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-slate-500">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      {lawyer.rating_avg.toFixed(1)} ({lawyer.rating_count})
                    </span>
                  )}
                </div>
                {lawyerProfile.city && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3" /> {lawyerProfile.city}
                  </p>
                )}
                {lawyerProfile.bio && (
                  <p className="text-sm text-slate-600 line-clamp-3">{lawyerProfile.bio}</p>
                )}
                {lawyer.slug && (
                  <Link
                    href={`/abogados/${lawyer.slug}`}
                    className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Ver perfil completo
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* More articles CTA */}
        <div className="mt-6 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <BookOpen className="h-4 w-4" /> Ver mas articulos
          </Link>
        </div>
      </div>
    </div>
  )
}
