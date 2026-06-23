-- Ejecutar en el SQL Editor de Supabase
-- Limpia TODAS las tablas que referencian profiles(id) sin ON DELETE CASCADE
-- para que admin.deleteUser() no falle por constraint violations.
CREATE OR REPLACE FUNCTION public.delete_user_data()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE
  v_uid      UUID := auth.uid();
  v_conv_ids UUID[];
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  -- 1. Obtener conversaciones donde participa el usuario
  SELECT array_agg(id) INTO v_conv_ids
  FROM conversations WHERE client_id = v_uid OR lawyer_id = v_uid;

  -- 2. Video sessions en esas conversaciones
  IF v_conv_ids IS NOT NULL THEN
    DELETE FROM video_sessions WHERE conversation_id = ANY(v_conv_ids);
  END IF;

  -- 3. Mensajes en esas conversaciones + mensajes sueltos del usuario
  IF v_conv_ids IS NOT NULL THEN
    DELETE FROM messages WHERE conversation_id = ANY(v_conv_ids);
  END IF;
  DELETE FROM messages WHERE sender_id = v_uid;

  -- 4. Conversaciones
  IF v_conv_ids IS NOT NULL THEN
    DELETE FROM conversations WHERE id = ANY(v_conv_ids);
  END IF;

  -- 5. Documentos de casos subidos por el usuario
  DELETE FROM case_documents WHERE uploaded_by = v_uid;

  -- 6. Respuestas a reseñas
  DELETE FROM review_replies WHERE author_id = v_uid;

  -- 7. Reseñas
  DELETE FROM reviews WHERE reviewer_id = v_uid;

  -- 8. Artículos
  DELETE FROM articles WHERE author_id = v_uid;

  -- 9. Reportes hechos por el usuario
  DELETE FROM reports WHERE reporter_id = v_uid;

  -- 10. Nullificar referencias sin cascade (no borrar la fila, solo desvincular)
  UPDATE reports         SET reported_user_id = NULL WHERE reported_user_id = v_uid;
  UPDATE reports         SET resolved_by      = NULL WHERE resolved_by      = v_uid;
  UPDATE lawyer_profiles SET verified_by      = NULL WHERE verified_by      = v_uid;
  UPDATE audit_logs      SET user_id          = NULL WHERE user_id          = v_uid;

  -- Las demás tablas (legal_cases, notifications, client_favorites,
  -- lawyer_profiles, lawyer_specialties, etc.) se borran por CASCADE
  -- cuando el Admin API elimina auth.users → profiles.
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_data() TO authenticated;
