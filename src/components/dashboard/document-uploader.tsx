'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, Image, File, Loader2, Trash2, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { deleteDocument } from '@/app/dashboard/mis-casos/document-actions'

type Doc = {
  id: string
  file_name: string
  file_size: number
  file_type: string
  storage_path: string
  created_at: string
  uploaded_by: string | null
}

const ACCEPTED = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp'
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />
  if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />
  return <File className="h-4 w-4 text-slate-400" />
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  return new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

export function DocumentUploader({
  caseId,
  currentUserId,
  initialDocs,
}: {
  caseId: string
  currentUserId: string
  initialDocs: Doc[]
}) {
  const [docs, setDocs] = useState<Doc[]>(initialDocs)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)

    for (const file of Array.from(files)) {
      if (file.size > MAX_SIZE) {
        setError('El archivo ' + file.name + ' supera el limite de 10 MB')
        continue
      }

      setUploading(true)
      try {
        const ext = file.name.split('.').pop()
        const path = currentUserId + '/' + caseId + '/' + Date.now() + '.' + ext

        const { error: storageError } = await supabase.storage
          .from('case-documents')
          .upload(path, file)

        if (storageError) {
          setError('Error al subir: ' + storageError.message)
          continue
        }

        const { data, error: dbError } = await supabase
          .from('case_documents')
          .insert({
            case_id: caseId,
            uploaded_by: currentUserId,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            storage_path: path,
          })
          .select()
          .single()

        if (dbError) {
          setError('Error al registrar: ' + dbError.message)
          await supabase.storage.from('case-documents').remove([path])
          continue
        }

        if (data) setDocs((prev) => [...prev, data as Doc])
      } finally {
        setUploading(false)
      }
    }
  }

  async function handleDelete(doc: Doc) {
    if (!confirm('Eliminar ' + doc.file_name + '?')) return
    const result = await deleteDocument(doc.id, doc.storage_path)
    if (result?.error) {
      setError(result.error)
    } else {
      setDocs((prev) => prev.filter((d) => d.id !== doc.id))
    }
  }

  async function handleDownload(doc: Doc) {
    const { data } = await supabase.storage
      .from('case-documents')
      .createSignedUrl(doc.storage_path, 60)
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  return (
    <div className="space-y-3">
      {/* Upload zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
            <p className="text-sm text-slate-500">Subiendo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <Upload className="h-6 w-6 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-700">Arrastra archivos o hace clic</p>
              <p className="text-xs text-slate-400 mt-0.5">PDF, Word, Excel, imagenes. Max 10 MB por archivo.</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
          <X className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Listado de docs */}
      {docs.length > 0 && (
        <div className="space-y-1">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors group"
            >
              <FileIcon type={doc.file_type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{doc.file_name}</p>
                <p className="text-xs text-slate-400">{formatSize(doc.file_size)} &middot; {timeAgo(doc.created_at)}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                  title="Descargar"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
                {doc.uploaded_by === currentUserId && (
                  <button
                    onClick={() => handleDelete(doc)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {docs.length === 0 && !uploading && (
        <p className="text-xs text-slate-400 text-center">No hay documentos adjuntos todavia.</p>
      )}
    </div>
  )
}
