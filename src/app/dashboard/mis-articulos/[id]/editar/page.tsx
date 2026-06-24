import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { updateArticle } from '../../actions'

export default async function EditarArticuloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const { data: article } = await supabase
    .from('articles')
    .select('id, title, excerpt, content, status, category_id')
    .eq('id', id)
    .single()

  if (!article) notFound()

  const { data: categories } = await supabase
    .from('legal_categories')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order')

  

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/mis-articulos" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar articulo</h1>
          <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{article.title}</p>
        </div>
      </div>

      <form action={updateArticle.bind(null, id)} className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Titulo <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              defaultValue={article.title}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder:text-slate-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Resumen</label>
            <textarea
              name="excerpt"
              rows={2}
              defaultValue={article.excerpt ?? ''}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder:text-slate-400 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Categoria</label>
            <select
              name="category_id"
              defaultValue={article.category_id ?? ''}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 text-sm bg-white"
            >
              <option value="">Sin categoria</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Contenido <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              rows={16}
              required
              defaultValue={article.content}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder:text-slate-400 text-sm resize-y font-mono"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Estado</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 cursor-pointer flex-1 transition-colors">
              <input
                type="radio"
                name="status"
                value="draft"
                defaultChecked={article.status === 'draft'}
                className="text-blue-600"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">Borrador</p>
                <p className="text-xs text-slate-400">Solo vos podes verlo</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-green-300 cursor-pointer flex-1 transition-colors">
              <input
                type="radio"
                name="status"
                value="published"
                defaultChecked={article.status === 'published'}
                className="text-green-600"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">Publicado</p>
                <p className="text-xs text-slate-400">Visible para todos en el blog</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Link
            href="/dashboard/mis-articulos"
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  )
}
