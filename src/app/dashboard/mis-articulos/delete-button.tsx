'use client'

import { deleteArticle } from './actions'

export function DeleteArticleButton({ articleId }: { articleId: string }) {
  async function handleDelete() {
    if (!confirm('Eliminar este articulo?')) return
    await deleteArticle(articleId)
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-500 text-xs font-medium rounded-lg transition-colors"
    >
      Eliminar
    </button>
  )
}
