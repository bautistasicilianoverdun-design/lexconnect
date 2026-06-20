-- ============================================================
-- LexConnect AR — Esquema completo PostgreSQL / Supabase
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('client', 'lawyer', 'firm_admin', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
CREATE TYPE plan_type AS ENUM ('free', 'professional', 'premium', 'firm');
CREATE TYPE case_status AS ENUM ('open', 'in_progress', 'closed', 'archived');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE case_visibility AS ENUM ('public', 'private');
CREATE TYPE message_type AS ENUM ('text', 'file', 'system');
CREATE TYPE notification_type AS ENUM ('message', 'proposal', 'case_update', 'review', 'system');
CREATE TYPE report_reason AS ENUM ('spam', 'fraud', 'inappropriate', 'false_info', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'reviewing', 'resolved', 'dismissed');

-- ============================================================
-- CATEGORÍAS LEGALES
-- ============================================================

CREATE TABLE legal_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES legal_categories(id),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO legal_categories (slug, name, description, icon, sort_order) VALUES
  ('laboral', 'Derecho Laboral', 'Relaciones de trabajo, despidos, accidentes laborales', 'briefcase', 1),
  ('civil', 'Derecho Civil', 'Contratos, daños y perjuicios, obligaciones', 'scale', 2),
  ('penal', 'Derecho Penal', 'Delitos, defensa penal, querellas', 'shield', 3),
  ('comercial', 'Derecho Comercial', 'Sociedades, contratos comerciales, quiebras', 'building', 4),
  ('societario', 'Derecho Societario', 'Constitución de sociedades, conflictos societarios', 'users', 5),
  ('familia', 'Derecho de Familia', 'Divorcios, adopciones, sucesiones, cuota alimentaria', 'heart', 6),
  ('inmobiliario', 'Derecho Inmobiliario', 'Compra-venta, alquileres, PHorizontal, usucapión', 'home', 7),
  ('tributario', 'Derecho Tributario', 'AFIP, impuestos, fiscalidad', 'calculator', 8),
  ('consumidor', 'Defensa del Consumidor', 'Reclamos a empresas, garantías, Ley 24.240', 'shopping-cart', 9),
  ('transito', 'Accidentes de Tránsito', 'Accidentes viales, seguros, lesiones', 'car', 10);

-- ============================================================
-- PROVINCIAS ARGENTINAS
-- ============================================================

CREATE TABLE provinces (
  id SMALLINT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

INSERT INTO provinces (id, name, slug) VALUES
  (1, 'Buenos Aires', 'buenos-aires'),
  (2, 'CABA', 'caba'),
  (3, 'Catamarca', 'catamarca'),
  (4, 'Chaco', 'chaco'),
  (5, 'Chubut', 'chubut'),
  (6, 'Córdoba', 'cordoba'),
  (7, 'Corrientes', 'corrientes'),
  (8, 'Entre Ríos', 'entre-rios'),
  (9, 'Formosa', 'formosa'),
  (10, 'Jujuy', 'jujuy'),
  (11, 'La Pampa', 'la-pampa'),
  (12, 'La Rioja', 'la-rioja'),
  (13, 'Mendoza', 'mendoza'),
  (14, 'Misiones', 'misiones'),
  (15, 'Neuquén', 'neuquen'),
  (16, 'Río Negro', 'rio-negro'),
  (17, 'Salta', 'salta'),
  (18, 'San Juan', 'san-juan'),
  (19, 'San Luis', 'san-luis'),
  (20, 'Santa Cruz', 'santa-cruz'),
  (21, 'Santa Fe', 'santa-fe'),
  (22, 'Santiago del Estero', 'santiago-del-estero'),
  (23, 'Tierra del Fuego', 'tierra-del-fuego'),
  (24, 'Tucumán', 'tucuman');

-- ============================================================
-- PERFILES DE USUARIO (extiende auth.users de Supabase)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client',
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  province_id SMALLINT REFERENCES provinces(id),
  city TEXT,
  website TEXT,
  linkedin_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PERFILES DE ABOGADOS
-- ============================================================

CREATE TABLE lawyer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Información profesional
  license_number TEXT NOT NULL,
  license_province_id SMALLINT REFERENCES provinces(id),
  university TEXT,
  graduation_year SMALLINT,

  -- Verificación
  verification_status verification_status DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  license_document_url TEXT,
  id_document_url TEXT,

  -- Plan
  plan plan_type DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  mp_customer_id TEXT,

  -- Visibilidad y búsqueda
  is_featured BOOLEAN DEFAULT FALSE,
  profile_completeness INT DEFAULT 0,
  slug TEXT UNIQUE,

  -- Estadísticas (desnormalizadas para performance)
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  response_time_hours DECIMAL(5,2),
  cases_handled INT DEFAULT 0,
  consultations_answered INT DEFAULT 0,

  -- Disponibilidad
  accepts_new_clients BOOLEAN DEFAULT TRUE,
  availability_note TEXT,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Especialidades del abogado (many-to-many)
CREATE TABLE lawyer_specialties (
  lawyer_id UUID REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES legal_categories(id) ON DELETE CASCADE,
  years_experience SMALLINT,
  is_primary BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (lawyer_id, category_id)
);

-- Experiencia laboral
CREATE TABLE lawyer_experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID NOT NULL REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  organization TEXT NOT NULL,
  start_year SMALLINT,
  end_year SMALLINT,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  sort_order INT DEFAULT 0
);

-- Educación adicional
CREATE TABLE lawyer_education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID NOT NULL REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  year SMALLINT,
  sort_order INT DEFAULT 0
);

-- Publicaciones / Artículos
CREATE TABLE lawyer_publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID NOT NULL REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  publication TEXT,
  url TEXT,
  published_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idiomas
CREATE TABLE lawyer_languages (
  lawyer_id UUID REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  level TEXT CHECK (level IN ('basic', 'intermediate', 'advanced', 'native')),
  PRIMARY KEY (lawyer_id, language)
);

-- ============================================================
-- ESTUDIOS JURÍDICOS
-- ============================================================

CREATE TABLE law_firms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  province_id SMALLINT REFERENCES provinces(id),
  city TEXT,

  -- Verificación
  verification_status verification_status DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  registration_number TEXT,

  -- Plan
  plan plan_type DEFAULT 'firm',
  plan_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,

  -- Estadísticas
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  lawyer_count INT DEFAULT 0,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Miembros del estudio
CREATE TABLE firm_members (
  firm_id UUID REFERENCES law_firms(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'partner', 'associate', 'staff')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (firm_id, lawyer_id)
);

-- Especialidades del estudio
CREATE TABLE firm_specialties (
  firm_id UUID REFERENCES law_firms(id) ON DELETE CASCADE,
  category_id UUID REFERENCES legal_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (firm_id, category_id)
);

-- ============================================================
-- CASOS LEGALES
-- ============================================================

CREATE TABLE legal_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES legal_categories(id),
  province_id SMALLINT REFERENCES provinces(id),

  urgency urgency_level DEFAULT 'medium',
  visibility case_visibility DEFAULT 'public',
  status case_status DEFAULT 'open',

  -- IA: clasificación automática
  ai_category_id UUID REFERENCES legal_categories(id),
  ai_urgency urgency_level,
  ai_summary TEXT,
  ai_recommended_type TEXT,

  -- Moderación
  is_moderated BOOLEAN DEFAULT FALSE,
  moderation_note TEXT,
  has_sensitive_data BOOLEAN DEFAULT FALSE,

  -- Presupuesto estimado
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),

  views_count INT DEFAULT 0,
  proposals_count INT DEFAULT 0,

  expires_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documentos adjuntos a casos
CREATE TABLE case_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES legal_cases(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT,
  file_type TEXT,
  is_sensitive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Propuestas de abogados a casos
CREATE TABLE case_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES legal_cases(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES lawyer_profiles(id) ON DELETE CASCADE,

  message TEXT NOT NULL,
  proposed_fee DECIMAL(12,2),
  fee_type TEXT CHECK (fee_type IN ('fixed', 'hourly', 'contingency', 'to_discuss')),
  estimated_duration TEXT,

  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (case_id, lawyer_id)
);

-- ============================================================
-- MENSAJERÍA EN TIEMPO REAL
-- ============================================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES legal_cases(id),
  client_id UUID NOT NULL REFERENCES profiles(id),
  lawyer_id UUID NOT NULL REFERENCES profiles(id),

  last_message_at TIMESTAMPTZ,
  client_unread INT DEFAULT 0,
  lawyer_unread INT DEFAULT 0,

  is_archived BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),

  content TEXT,
  type message_type DEFAULT 'text',
  file_url TEXT,
  file_name TEXT,

  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SISTEMA DE VALORACIONES
-- ============================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),

  -- Target: abogado o estudio
  lawyer_id UUID REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
  firm_id UUID REFERENCES law_firms(id) ON DELETE CASCADE,

  case_id UUID REFERENCES legal_cases(id),

  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,

  -- Sub-categorías de rating
  rating_communication SMALLINT CHECK (rating_communication BETWEEN 1 AND 5),
  rating_expertise SMALLINT CHECK (rating_expertise BETWEEN 1 AND 5),
  rating_value SMALLINT CHECK (rating_value BETWEEN 1 AND 5),
  rating_responsiveness SMALLINT CHECK (rating_responsiveness BETWEEN 1 AND 5),

  is_verified BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (
    (lawyer_id IS NOT NULL AND firm_id IS NULL) OR
    (lawyer_id IS NULL AND firm_id IS NOT NULL)
  )
);

-- Respuestas a valoraciones (del abogado)
CREATE TABLE review_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID UNIQUE NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FAVORITOS
-- ============================================================

CREATE TABLE client_favorites (
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (client_id, lawyer_id)
);

-- ============================================================
-- NOTIFICACIONES
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DENUNCIAS / REPORTES
-- ============================================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),

  -- Target
  reported_user_id UUID REFERENCES profiles(id),
  reported_case_id UUID REFERENCES legal_cases(id),
  reported_review_id UUID REFERENCES reviews(id),
  reported_message_id UUID REFERENCES messages(id),

  reason report_reason NOT NULL,
  description TEXT,

  status report_status DEFAULT 'pending',
  resolved_by UUID REFERENCES profiles(id),
  resolution_note TEXT,
  resolved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VIDEOLLAMADAS
-- ============================================================

CREATE TABLE video_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  initiated_by UUID NOT NULL REFERENCES profiles(id),

  platform TEXT CHECK (platform IN ('meet', 'zoom', 'internal')),
  meeting_url TEXT,

  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INT,

  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PLANES Y PAGOS
-- ============================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID NOT NULL REFERENCES lawyer_profiles(id) ON DELETE CASCADE,

  plan plan_type NOT NULL,
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired', 'trial')) DEFAULT 'active',

  -- Stripe / MP
  stripe_subscription_id TEXT,
  mp_subscription_id TEXT,
  payment_provider TEXT CHECK (payment_provider IN ('stripe', 'mercadopago')),

  amount DECIMAL(12,2),
  currency TEXT DEFAULT 'ARS',

  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BLOG / CONTENIDO
-- ============================================================

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id),
  firm_id UUID REFERENCES law_firms(id),

  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_url TEXT,

  category_id UUID REFERENCES legal_categories(id),
  tags TEXT[],

  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,

  views_count INT DEFAULT 0,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LOGS DE AUDITORÍA
-- ============================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_lawyer_profiles_verification ON lawyer_profiles(verification_status);
CREATE INDEX idx_lawyer_profiles_plan ON lawyer_profiles(plan);
CREATE INDEX idx_lawyer_profiles_province ON lawyer_profiles(user_id);
CREATE INDEX idx_lawyer_profiles_rating ON lawyer_profiles(rating_avg DESC);
CREATE INDEX idx_lawyer_profiles_featured ON lawyer_profiles(is_featured, rating_avg DESC);
CREATE INDEX idx_legal_cases_client ON legal_cases(client_id);
CREATE INDEX idx_legal_cases_category ON legal_cases(category_id);
CREATE INDEX idx_legal_cases_status ON legal_cases(status);
CREATE INDEX idx_legal_cases_province ON legal_cases(province_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_reviews_lawyer ON reviews(lawyer_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);

-- Full-text search en perfiles de abogados
CREATE INDEX idx_profiles_search ON profiles USING gin(to_tsvector('spanish', full_name || ' ' || COALESCE(bio, '')));

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Perfiles: visible para todos, editable solo por el dueño
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Abogados verificados: visibles para todos
CREATE POLICY "lawyer_profiles_select" ON lawyer_profiles FOR SELECT USING (TRUE);
CREATE POLICY "lawyer_profiles_update" ON lawyer_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Casos públicos visibles para todos, privados solo para el cliente y abogados propuestos
CREATE POLICY "cases_select_public" ON legal_cases FOR SELECT
  USING (visibility = 'public' OR client_id = auth.uid());
CREATE POLICY "cases_insert" ON legal_cases FOR INSERT
  WITH CHECK (client_id = auth.uid());
CREATE POLICY "cases_update" ON legal_cases FOR UPDATE
  USING (client_id = auth.uid());

-- Mensajes: solo participantes de la conversación
CREATE POLICY "messages_select" ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE client_id = auth.uid() OR lawyer_id = auth.uid()
    )
  );
CREATE POLICY "messages_insert" ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Notificaciones: solo el destinatario
CREATE POLICY "notifications_select" ON notifications FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Favoritos: solo el cliente
CREATE POLICY "favorites_all" ON client_favorites FOR ALL
  USING (client_id = auth.uid());

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================

-- Auto-crear perfil al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_role user_role;
  v_raw_role TEXT;
BEGIN
  -- Construir nombre completo desde first_name + last_name o full_name
  v_full_name := COALESCE(
    NULLIF(TRIM(
      COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' ||
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    ), ''),
    NEW.raw_user_meta_data->>'full_name',
    'Usuario'
  );

  -- Mapear 'firm' → 'firm_admin' para compatibilidad con el frontend
  v_raw_role := NEW.raw_user_meta_data->>'role';
  v_role := CASE v_raw_role
    WHEN 'firm' THEN 'firm_admin'::user_role
    WHEN 'lawyer' THEN 'lawyer'::user_role
    ELSE 'client'::user_role
  END;

  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, v_full_name, v_role);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER lawyer_profiles_updated_at BEFORE UPDATE ON lawyer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER legal_cases_updated_at BEFORE UPDATE ON legal_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Recalcular rating promedio del abogado tras nueva valoración
CREATE OR REPLACE FUNCTION update_lawyer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE lawyer_profiles
  SET
    rating_avg = (
      SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews
      WHERE lawyer_id = COALESCE(NEW.lawyer_id, OLD.lawyer_id) AND is_visible = TRUE
    ),
    rating_count = (
      SELECT COUNT(*) FROM reviews
      WHERE lawyer_id = COALESCE(NEW.lawyer_id, OLD.lawyer_id) AND is_visible = TRUE
    )
  WHERE id = COALESCE(NEW.lawyer_id, OLD.lawyer_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER reviews_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_lawyer_rating();

-- Incrementar contador de propuestas en caso
CREATE OR REPLACE FUNCTION update_case_proposals_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE legal_cases
  SET proposals_count = (
    SELECT COUNT(*) FROM case_proposals WHERE case_id = COALESCE(NEW.case_id, OLD.case_id)
  )
  WHERE id = COALESCE(NEW.case_id, OLD.case_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER proposals_count_trigger
  AFTER INSERT OR DELETE ON case_proposals
  FOR EACH ROW EXECUTE FUNCTION update_case_proposals_count();
