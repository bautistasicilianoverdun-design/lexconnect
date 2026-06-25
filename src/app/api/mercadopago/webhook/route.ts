import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// MercadoPago envia notificaciones a este endpoint
// Documentacion: https://www.mercadopago.com.ar/developers/es/docs/notifications/webhooks

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
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
