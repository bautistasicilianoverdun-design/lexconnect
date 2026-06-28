import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateCaseSchema = z.object({
  title: z
    .string({ required_error: 'El título es requerido' })
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres')
    .trim(),
  description: z
    .string({ required_error: 'La descripción es requerida' })
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .trim(),
  category: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  visibility: z.enum(['public', 'private']).default('public'),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Parsear body con manejo de errores explícito
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  // Validar con Zod
  const parsed = CreateCaseSchema.safeParse(rawBody)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Datos inválidos'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { title, description, category, province, urgency, visibility } = parsed.data

  const [{ data: cat }, { data: prov }] = await Promise.all([
    supabase.from('legal_categories').select('id').eq('slug', category ?? '').maybeSingle(),
    supabase.from('provinces').select('id').eq('name', province ?? '').maybeSingle(),
  ])

  if (category && !cat) return NextResponse.json({ error: 'Categoría no válida' }, { status: 400 })
  if (province && !prov) return NextResponse.json({ error: 'Provincia no válida' }, { status: 400 })

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
