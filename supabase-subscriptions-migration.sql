-- Migración: Suscripciones MercadoPago
-- Ejecutar en Supabase SQL Editor

-- 1. Recrear tabla subscriptions con todas las columnas necesarias
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id uuid REFERENCES lawyer_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_type text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'pending',
  mp_subscription_id text,
  mp_payer_id text,
  mp_preference_id text,
  amount numeric(10,2),
  currency text DEFAULT 'ARS',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_lawyer_id ON subscriptions(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_mp_subscription_id ON subscriptions(mp_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sub_select_own ON subscriptions;
DROP POLICY IF EXISTS sub_insert_own ON subscriptions;
DROP POLICY IF EXISTS sub_update_service ON subscriptions;

CREATE POLICY sub_select_own ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY sub_insert_own ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_subscriptions_updated_at();

-- 2. Agregar columna plan_type a lawyer_profiles si no existe
ALTER TABLE lawyer_profiles
  ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;
