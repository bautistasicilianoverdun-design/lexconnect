import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

// MercadoPago envia notificaciones a este endpoint
// Documentacion: https://www.mercadopago.com.ar/developers/es/docs/notifications/webhooks

/**
 * Valida la firma HMAC-SHA256 del webhook de MercadoPago.
 * Header x-signature formato: "ts=<timestamp>,v1=<hmac>"
 * Manifest a firmar: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
 * Docs: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks#bookmark_validar_origin_de_las_notificaciones
 */
function validateMPSignature(
  req: NextRequest,
  rawBody: string
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) {
    console.warn('[MP Webhook] MP_WEBHOOK_SECRET no configurado — validación omitida')
    return true
  }

  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id') ?? ''

  if (!xSignature) return false

  const parts: Record<string, string> = {}
  xSignature.split(',').forEach(part => {
    const [k, v] = part.split('=')
    if (k && v) parts[k.trim()] = v.trim()
  })

  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  let parsedBody: { data?: { id?: string } } = {}
  try { parsedBody = JSON.parse(rawBody) } catch { return false }

  const manifest = `id:${parsedBody?.data?.id ?? ''};request-id:${xRequestId};ts:${ts};`

  const expected = createHmac('sha256', secret).update(manifest).digest('hex')

  return v1 === expected
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await req.text()

    if (!validateMPSignature(req, rawBody)) {
      console.warn('[MP Webhook] Firma inválida — request rechazado')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const { type, data } = body

    // Solo procesamos pagos aprobados
    if (type !== 'payment') return NextResponse.json({ ok: true })

    const paymentId = data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    // Consultar el pago a MP para obtener el estado y metadata
    const mpToken = process.env.MP_ACCESS_TOKEN
    if (!mpToken) return NextResponse.json({ error: 'MP_ACCESS_TOKEN no configurado' }, { status: 500 })

    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpToken}` },
    })

    if (!paymentRes.ok) return NextResponse.json({ ok: true })

    const payment = await paymentRes.json()
    const { status, metadata, payer } = payment

    const userId = metadata?.user_id
    const lawyerProfileId = metadata?.lawyer_profile_id
    const planType = metadata?.plan_type

    if (!userId || !lawyerProfileId || !planType) return NextResponse.json({ ok: true })

    // Usamos service role para escribir desde el webhook (sin cookie de usuario)
    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    if (status === 'approved') {
      // Actualizar suscripcion a activa
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        lawyer_id: lawyerProfileId,
        plan_type: planType,
        status: 'active',
        mp_payer_id: payer?.id?.toString() ?? null,
        amount: payment.transaction_amount,
        currency: payment.currency_id ?? 'ARS',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      }, { onConflict: 'user_id' })

      // Actualizar plan en lawyer_profiles
      await supabase.from('lawyer_profiles').update({
        plan_type: planType,
        plan_expires_at: periodEnd.toISOString(),
      }).eq('id', lawyerProfileId)

    } else if (status === 'rejected' || status === 'cancelled') {
      await supabase.from('subscriptions').update({
        status: status === 'rejected' ? 'past_due' : 'cancelled',
      }).eq('user_id', userId)
    }

    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error('[MP Webhook]', err)
    return NextResponse.json({ ok: true }) // Siempre 200 para que MP no reintente
  }
}

// MP tambien envia GET para verificar el endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ ok: true })
}
