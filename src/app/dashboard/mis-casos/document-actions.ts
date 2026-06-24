'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function deleteDocument(documentId: string, storagePath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verificar que el usuario subio este documento
  const { data: doc } = await supabase
    .from('case_documents')
    .select('id, uploaded_by')
    .eq('id', documentId)
    .single()

  if (!doc || doc.uploaded_by !== user.id) {
    return { error: 'Sin permiso para eliminar este documento' }
  }

  // Eliminar del storage
  await supabase.storage.from('case-documents').remove([storagePath])

  // Eliminar registro de la DB
  const { error } = await supabase
    .from('case_documents')
    .delete()
    .eq('id', documentId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/mis-casos')
  return { success: true }
}
