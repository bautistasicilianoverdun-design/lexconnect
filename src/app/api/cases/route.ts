import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { title, description, category, province, urgency, visibility } = await request.json()

  const [{ data: cat }, { data: prov }] = await Promise.all([
    supabase.from('legal_categories').select('id').eq('slug', category).single(),
    supabase.from('provinces').select('id').eq('name', province).single(),
  ])

  const { error } = await supabase.from('legal_cases').insert({
    client_id: user.id,
    title,
    description,
    category_id: cat?.id ?? null,
    province_id: prov?.id ?? null,
    urgency,
    visibility,
    status: 'open',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
