import OpenAI from 'openai'

const VALID_CATEGORIES = [
  'laboral', 'civil', 'penal', 'comercial', 'societario',
  'familia', 'inmobiliario', 'tributario', 'consumidor', 'transito',
] as const

const VALID_URGENCIES = ['low', 'medium', 'high', 'urgent'] as const

export type CaseClassification = {
  category_slug: typeof VALID_CATEGORIES[number]
  urgency: typeof VALID_URGENCIES[number]
  summary: string
}

export async function classifyCase(params: {
  title: string
  description: string
  urgency: string
}): Promise<CaseClassification | null> {
  if (!process.env.OPENAI_API_KEY) return null
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Sos un asistente legal especializado en el sistema jurídico argentino.
Tu tarea es analizar casos legales publicados en LexConnect (marketplace legal AR) y devolver un JSON con:
- category_slug: categoría legal más apropiada. Debe ser exactamente uno de: laboral, civil, penal, comercial, societario, familia, inmobiliario, tributario, consumidor, transito
- urgency: nivel de urgencia revisado. Exactamente uno de: low, medium, high, urgent
- summary: resumen profesional en 2-3 oraciones en español neutro, sin datos personales, orientado a que abogados entiendan rápidamente la situación y el tipo de asesoramiento que se necesita

Respondé SOLO con el JSON, sin texto adicional.`,
        },
        {
          role: 'user',
          content: `CASO:
Título: ${params.title}
Descripción: ${params.description}
Urgencia indicada por el cliente: ${params.urgency}`,
        },
      ],
    })

    const raw = response.choices[0]?.message?.content
    if (!raw) return null

    const parsed = JSON.parse(raw)

    const category_slug = VALID_CATEGORIES.includes(parsed.category_slug)
      ? parsed.category_slug
      : null
    const urgency = VALID_URGENCIES.includes(parsed.urgency)
      ? parsed.urgency
      : null
    const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : null

    if (!category_slug || !urgency || !summary) return null

    return { category_slug, urgency, summary }
  } catch (err) {
    console.error('AI classification error:', err)
    return null
  }
}
