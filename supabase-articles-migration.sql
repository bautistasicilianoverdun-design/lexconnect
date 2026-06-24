-- Tabla de artículos para abogados
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID REFERENCES lawyer_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES legal_categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  views_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS articles_lawyer_id_idx ON articles(lawyer_id);
CREATE INDEX IF NOT EXISTS articles_status_idx ON articles(status);
CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(slug);

-- RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Lectura pública de artículos publicados
CREATE POLICY "articles_public_read" ON articles
  FOR SELECT USING (status = 'published');

-- Abogados pueden ver todos sus propios artículos (incluyendo borradores)
CREATE POLICY "articles_lawyer_read_own" ON articles
  FOR SELECT USING (
    lawyer_id IN (
      SELECT id FROM lawyer_profiles WHERE user_id = auth.uid()
    )
  );

-- Abogados pueden insertar sus propios artículos
CREATE POLICY "articles_lawyer_insert" ON articles
  FOR INSERT WITH CHECK (
    lawyer_id IN (
      SELECT id FROM lawyer_profiles WHERE user_id = auth.uid()
    )
  );

-- Abogados pueden actualizar sus propios artículos
CREATE POLICY "articles_lawyer_update" ON articles
  FOR UPDATE USING (
    lawyer_id IN (
      SELECT id FROM lawyer_profiles WHERE user_id = auth.uid()
    )
  );

-- Abogados pueden eliminar sus propios artículos
CREATE POLICY "articles_lawyer_delete" ON articles
  FOR DELETE USING (
    lawyer_id IN (
      SELECT id FROM lawyer_profiles WHERE user_id = auth.uid()
    )
  );
