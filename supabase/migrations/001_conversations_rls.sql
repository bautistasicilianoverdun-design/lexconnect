-- RLS policies for conversations table
-- Run this in the Supabase SQL Editor if conversations are not loading

CREATE POLICY "conversations_select" ON conversations FOR SELECT
  USING (client_id = auth.uid() OR lawyer_id = auth.uid());

CREATE POLICY "conversations_insert" ON conversations FOR INSERT
  WITH CHECK (client_id = auth.uid() OR lawyer_id = auth.uid());

CREATE POLICY "conversations_update" ON conversations FOR UPDATE
  USING (client_id = auth.uid() OR lawyer_id = auth.uid());
