'use server'

import { createClient } from '@/lib/supabase/server'

type NotificationType = 'message' | 'proposal' | 'case_update' | 'review' | 'system'

export async function createNotification({
  userId,
  type,
  title,
  body,
  link,
}: {
  userId: string
  type: NotificationType
  title: string
  body?: string
  link?: string
}) {
  const supabase = await createClient()
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    body: body ?? null,
    link: link ?? null,
    is_read: false,
  })
}
