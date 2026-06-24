import { createClient } from '@/lib/supabase/server'
import { DocumentUploader } from '@/components/dashboard/document-uploader'
import { Paperclip } from 'lucide-react'

export async function CaseDocumentsSection({
  caseId,
  currentUserId,
}: {
  caseId: string
  currentUserId: string
}) {
  const supabase = await createClient()

  const { data: docs } = await supabase
    .from('case_documents')
    .select('id, file_name, file_size, file_type, storage_path, created_at, uploaded_by')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })

  return (
    <div className="px-6 pb-6 pt-4 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-3">
        <Paperclip className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">
          Documentos adjuntos
          {docs && docs.length > 0 && (
            <span className="ml-1.5 text-xs font-normal text-slate-400">({docs.length})</span>
          )}
        </h3>
      </div>
      <DocumentUploader
        caseId={caseId}
        currentUserId={currentUserId}
        initialDocs={docs ?? []}
      />
    </div>
  )
}
