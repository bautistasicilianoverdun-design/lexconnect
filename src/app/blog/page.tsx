import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Clock, Eye, User } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 30) return `Hace ${days} días`
  const months = Math.floor(days / 30)
  return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`
}

export default async function BlogPage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select(`
      id, title, slug, excerpt, views_count, published_at, created_at,
      legal_categories!category_id(name),
      lawyer_profiles!lawyer_id(
        slug,
        profiles!user_id(full_name, city)
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const { data: categories } = await supabase
    .from('legal_categories')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={null} />
      <main className="flex-1 bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Blog legal</h1>
              <p className="text-sm text-slate-500">Artículos de abogados especializados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Categories filter */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-600 text-white">
              Todos
            </span>
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:border-blue-300 cursor-pointer transition-colors"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {!articles || articles.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="h-12 w-12 mx-auto text-slate-200 mb-4" />
            <p className="font-semibold text-slate-700 mb-1">Todavía no hay artículos publicados</p>
            <p className="text-sm text-slate-400">Los abogados de LexConnect publicarán contenido pronto.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const cat = (Array.isArray(article.legal_categories)
                ? article.legal_categories[0]
                : article.legal_categories) as { name: string } | null
              const lawyer = (Array.isArray(article.lawyer_profiles)
                ? article.lawyer_profiles[0]
                : article.lawyer_profiles) as { slug: string | null; profiles: { full_name: string; city: string | null } | { full_name: string; city: string | null }[] | null } | null
              const lawyerProfile = lawyer?.profiles
                ? (Array.isArray(lawyer.profiles) ? lawyer.profiles[0] : lawyer.profiles) as { full_name: string; city: string | null }
                : null

              return (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="p-6">
                    {cat && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mb-3">
                        {cat.name}
                      </span>
                    )}
                    <h2 className="font-bold text-slate-900 text-base leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span className="font-medium text-slate-600 truncate max-w-[120px]">
                          {lawyerProfile?.full_name ?? 'Abogado'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(article.published_at ?? article.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
      </main>
      <Footer />
    </div>
  )
}
