import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Plus, Eye, Clock, Edit, Globe, FileText } from 'lucide-react'
import { publishArticle } from './actions'
import { DeleteArticleButton } from './delete-button'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 30) return `Hace ${days} dias`
  return new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

export default async function MisArticulosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const { data: lawyerProfile } = await supabase
    .from('lawyer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!lawyerProfile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis articulos</h1>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-slate-200 mb-4" />
          <p className="font-semibold text-slate-700 mb-1">Perfil de abogado requerido</p>
          <p className="text-sm text-slate-400 mb-6">Completa tu perfil para publicar articulos.</p>
          <Link href="/dashboard/perfil" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors">
            Completar perfil
          </Link>
        </div>
      </div>
    )
  }

  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, status, views_count, excerpt, created_at, published_at, legal_categories!category_id(name)')
    .eq('lawyer_id', lawyerProfile.id)
    .order('created_at', { ascending: false })

  const published = articles?.filter((a) => a.status === 'published').length ?? 0
  const drafts = articles?.filter((a) => a.status === 'draft').length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis articulos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {published} publicado{published !== 1 ? 's' : ''} · {drafts} borrador{drafts !== 1 ? 'es' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/mis-articulos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="h-4 w-4" /> Nuevo articulo
        </Link>
      </div>

      {!articles || articles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-slate-200 mb-4" />
          <p className="font-semibold text-slate-700 mb-1">Todavia no escribiste articulos</p>
          <p className="text-sm text-slate-400 mb-6">Compartí tu conocimiento legal y atraé más clientes a tu perfil.</p>
          <Link
            href="/dashboard/mis-articulos/nuevo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            <Plus className="h-4 w-4" /> Escribir primer articulo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => {
            const cat = (Array.isArray(article.legal_categories)
              ? article.legal_categories[0]
              : article.legal_categories) as { name: string } | null
            const isPublished = article.status === 'published'

            return (
              <div key={article.id} className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isPublished ? <Globe className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                        {isPublished ? 'Publicado' : 'Borrador'}
                      </span>
                      {cat && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {cat.name}
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-slate-900 text-base mb-1 line-clamp-1">{article.title}</h2>
                    {article.excerpt && (
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">{article.excerpt}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(article.published_at ?? article.created_at)}</span>
                      {isPublished && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views_count} vistas</span>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Link
                      href={`/dashboard/mis-articulos/${article.id}/editar`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" /> Editar
                    </Link>
                    {isPublished ? (
                      <Link
                        href={`/blog/${article.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5" /> Ver
                      </Link>
                    ) : (
                      <form action={publishArticle.bind(null, article.id)}>
                        <button type="submit" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors">
                          <Globe className="h-3.5 w-3.5" /> Publicar
                        </button>
                      </form>
                    )}
                    <DeleteArticleButton articleId={article.id} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
