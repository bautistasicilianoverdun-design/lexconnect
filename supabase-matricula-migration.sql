-- Migración: Verificación de matrícula
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar columnas a lawyer_profiles
ALTER TABLE lawyer_profiles
  ADD COLUMN IF NOT EXISTS bar_association text,
  ADD COLUMN IF NOT EXISTS matricula_tomo text,
  ADD COLUMN IF NOT EXISTS matricula_folio text,
  ADD COLUMN IF NOT EXISTS verification_notes text,
  ADD COLUMN IF NOT EXISTS verification_documents text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS verification_submitted_at timestamptz;

-- Valores válidos para bar_association:
-- 'cpacf'  → Colegio Público de Abogados de la Capital Federal
-- 'casi'   → Colegio de Abogados de San Isidro (Prov. BsAs)
-- 'cac'    → Colegio de Abogados de Córdoba
-- 'other'  → Otra provincia (revisión manual)

-- 2. Índice para búsquedas admin por estado de verificación
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_verification_status
  ON lawyer_profiles(verification_status);

-- 3. RLS: los admins pueden ver todos los lawyer_profiles (ya existe)
-- El abogado puede ver/editar su propio perfil (ya existe)
-- No se necesitan nuevas policies — las columnas heredan las existentes

-- Fin de migración
