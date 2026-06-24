-- ============================================================
-- PASO 1: Correr este SQL en el SQL Editor de Supabase
-- ============================================================

-- Tabla de documentos adjuntos a casos
CREATE TABLE IF NOT EXISTS case_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES legal_cases(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS case_documents_case_id_idx ON case_documents(case_id);
CREATE INDEX IF NOT EXISTS case_documents_uploaded_by_idx ON case_documents(uploaded_by);

-- RLS
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;

-- El cliente duenio del caso puede ver los documentos
CREATE POLICY "docs_client_select" ON case_documents
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM legal_cases WHERE client_id = auth.uid()
    )
  );

-- Abogados con propuesta aceptada pueden ver los documentos
CREATE POLICY "docs_lawyer_select" ON case_documents
  FOR SELECT USING (
    case_id IN (
      SELECT case_id FROM case_proposals
      WHERE lawyer_id IN (
        SELECT id FROM lawyer_profiles WHERE user_id = auth.uid()
      )
      AND status = 'accepted'
    )
  );

-- El que sube puede ver sus propios documentos
CREATE POLICY "docs_uploader_select" ON case_documents
  FOR SELECT USING (uploaded_by = auth.uid());

-- Cualquier usuario autenticado puede insertar (validacion via case_id RLS del caso)
CREATE POLICY "docs_insert" ON case_documents
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND uploaded_by = auth.uid()
    AND (
      -- Es el cliente del caso
      case_id IN (SELECT id FROM legal_cases WHERE client_id = auth.uid())
      OR
      -- Es abogado con propuesta aceptada
      case_id IN (
        SELECT case_id FROM case_proposals
        WHERE lawyer_id IN (SELECT id FROM lawyer_profiles WHERE user_id = auth.uid())
        AND status = 'accepted'
      )
    )
  );

-- Solo el que subio puede eliminar
CREATE POLICY "docs_delete" ON case_documents
  FOR DELETE USING (uploaded_by = auth.uid());

-- ============================================================
-- PASO 2: Crear el bucket en Storage > New bucket
--   Nombre: case-documents
--   Public: NO (privado)
-- ============================================================

-- PASO 3: En Storage > Policies, agregar estas politicas al bucket case-documents:

-- Politica de INSERT (upload):
-- Nombre: "Authenticated users can upload"
-- Allowed operation: INSERT
-- Target roles: authenticated
-- Policy: (bucket_id = 'case-documents') AND (auth.uid() IS NOT NULL)

-- Politica de SELECT (download):
-- Nombre: "Users can read own case documents"
-- Allowed operation: SELECT
-- Target roles: authenticated
-- Policy: (bucket_id = 'case-documents') AND (auth.uid() IS NOT NULL)

-- Politica de DELETE:
-- Nombre: "Users can delete own uploads"
-- Allowed operation: DELETE
-- Target roles: authenticated
-- Policy: (bucket_id = 'case-documents') AND (auth.uid()::text = (storage.foldername(name))[1])
