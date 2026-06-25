-- ============================================================
-- Sistema de valoraciones mutuas
-- Correr en Supabase SQL Editor
-- ============================================================

-- 1. Extender tabla reviews con campos para valoracion mutua
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS reviewer_role TEXT DEFAULT 'client' CHECK (reviewer_role IN ('client', 'lawyer')),
  ADD COLUMN IF NOT EXISTS reviewee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_revealed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS revealed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reveal_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;

-- 2. Indice para buscar por caso + reviewer
CREATE INDEX IF NOT EXISTS reviews_case_reviewer_idx ON reviews(case_id, reviewer_id);
CREATE INDEX IF NOT EXISTS reviews_reviewee_idx ON reviews(reviewee_id);

-- 3. RLS: reviewer puede ver su propia review (sin importar si esta revelada)
DROP POLICY IF EXISTS "reviews_select_own" ON reviews;
CREATE POLICY "reviews_select_own" ON reviews
  FOR SELECT USING (reviewer_id = auth.uid());

-- 4. RLS: reviewee puede ver la review solo si ya fue revelada
DROP POLICY IF EXISTS "reviews_select_revealed" ON reviews;
CREATE POLICY "reviews_select_revealed" ON reviews
  FOR SELECT USING (
    reviewee_id = auth.uid()
    AND (
      is_revealed = TRUE
      OR reveal_deadline < NOW()
    )
  );

-- 5. RLS: abogados verificados en perfiles publicos pueden ver sus reviews reveladas
DROP POLICY IF EXISTS "reviews_select_lawyer_public" ON reviews;
CREATE POLICY "reviews_select_lawyer_public" ON reviews
  FOR SELECT USING (
    lawyer_id IS NOT NULL
    AND is_revealed = TRUE
    AND is_visible = TRUE
  );

-- 6. RLS insert: solo el reviewer puede insertar, si no esta bloqueado
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT WITH CHECK (
    reviewer_id = auth.uid()
    AND is_locked = FALSE
  );

-- 7. RLS update: solo el reviewer puede editar, mientras no este bloqueado
DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (
    reviewer_id = auth.uid()
    AND is_locked = FALSE
    AND (reveal_deadline IS NULL OR reveal_deadline > NOW())
  );

-- 8. Funcion para revelar ambas reviews cuando las dos esten listas
CREATE OR REPLACE FUNCTION reveal_mutual_reviews(p_case_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_exists BOOLEAN;
  lawyer_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM reviews WHERE case_id = p_case_id AND reviewer_role = 'client'
  ) INTO client_exists;

  SELECT EXISTS(
    SELECT 1 FROM reviews WHERE case_id = p_case_id AND reviewer_role = 'lawyer'
  ) INTO lawyer_exists;

  IF client_exists AND lawyer_exists THEN
    UPDATE reviews
    SET is_revealed = TRUE,
        revealed_at = NOW(),
        is_locked = TRUE,
        is_visible = TRUE
    WHERE case_id = p_case_id
      AND is_revealed = FALSE;
  END IF;
END;
$$;

-- 9. Funcion para bloquear reviews vencidas (llamar periodicamente o en lectura)
CREATE OR REPLACE FUNCTION lock_expired_reviews()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE reviews
  SET is_revealed = TRUE,
      revealed_at = NOW(),
      is_locked = TRUE,
      is_visible = TRUE
  WHERE reveal_deadline IS NOT NULL
    AND reveal_deadline < NOW()
    AND is_locked = FALSE;
END;
$$;
