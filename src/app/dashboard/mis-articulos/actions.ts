'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    + '-' + Date.now().toString(36)
}

export async function createArticle(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const { data: lawyerProfile } = await supabase
    .from('lawyer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!lawyerProfile) return { error: 'Perfil de abogado no encontrado' }

  const title = formData.get('title') as string
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const categoryId = formData.get('category_id') as string
  const status = formData.get('status') as string

  if (!title?.trim()) return { error: 'El titulo es requerido' }
  if (!content?.trim()) return { error: 'El contenido es requerido' }

  const slug = generateSlug(title)

  const { error } = await supabase.from('articles').insert({
    lawyer_id: lawyerProfile.id,
    title: title.trim(),
    slug,
    excerpt: excerpt?.trim() || null,
    content: content.trim(),
    category_id: categoryId || null,
    status: status === 'published' ? 'published' : 'draft',
    published_at: status === 'published' ? new Date().toISOString() : null,
  })

  if (error) return { error: error.message }

  redirect('/dashboard/mis-articulos')
}

export async function updateArticle(articleId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const title = formData.get('title') as string
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const categoryId = formData.get('category_id') as string
  const status = formData.get('status') as string

  if (!title?.trim()) return { error: 'El titulo es requerido' }
  if (!content?.trim()) return { error: 'El contenido es requerido' }

  const { data: existing } = await supabase
    .from('articles')
    .select('status, published_at')
    .eq('id', articleId)
    .single()

  const isPublishing = status === 'published' && existing?.status !== 'published'

  const { error } = await supabase
    .from('articles')
    .update({
      title: title.trim(),
      excerpt: excerpt?.trim() || null,
      content: content.trim(),
      category_id: categoryId || null,
      status: status === 'published' ? 'published' : 'draft',
      published_at: isPublishing ? new Date().toISOString() : existing?.published_at ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', articleId)

  if (error) return { error: error.message }

  redirect('/dashboard/mis-articulos')
}

export async function publishArticle(articleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  await supabase
    .from('articles')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', articleId)

  redirect('/dashboard/mis-articulos')
}

export async function deleteArticle(articleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  await supabase.from('articles').delete().eq('id', articleId)

  redirect('/dashboard/mis-articulos')
}
