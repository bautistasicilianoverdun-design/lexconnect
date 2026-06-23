-- Ejecutar en el SQL Editor de Supabase
-- Esta función borra los datos de la app. El usuario de auth lo borra el Admin API desde el servidor.
CREATE OR REPLACE FUNCTION public.delete_user_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_conv_ids UUID[];
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Mensajes y conversaciones
  SELECT array_agg(id) INTO v_conv_ids
  FROM conversations
  WHERE client_id = v_uid OR lawyer_id = v_uid;

  IF v_conv_ids IS NOT NULL THEN
    DELETE FROM messages WHERE conversation_id = ANY(v_conv_ids);
    DELETE FROM conversations WHERE id = ANY(v_conv_ids);
  END IF;

  -- 2. Reviews y reportes
  DELETE FROM reviews WHERE reviewer_id = v_uid;
  DELETE FROM reports WHERE reporter_id = v_uid;

  -- profiles se borra automáticamente por CASCADE cuando el Admin API elimina auth.users
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_data() TO authenticated;
