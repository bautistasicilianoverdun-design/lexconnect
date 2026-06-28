-- Configuración de notificaciones y privacidad
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notify_proposals BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_messages BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_system BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS profile_public BOOLEAN DEFAULT true;
