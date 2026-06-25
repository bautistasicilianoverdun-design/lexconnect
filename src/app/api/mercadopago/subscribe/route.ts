import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMPClient, MP_PLANS, PlanKey, Preference } from '@/lib/mercadopago'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { plan } = await req.json() as { plan: PlanKey }
  const planData = MP_PLANS[plan]
  if (!planData) return NextResponse.json({ error: 'Plan invalido' }, { status: 400 })

  const { data: lp } = await supabase
    .from('lawyer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!lp) return NextResponse.json({ error: 'Perfil de abogado no encontrado' }, { status: 404 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  try {
    const client = getMPClient()
    const preference = new Preference(client)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lexconnect.vercel.app'

    const result = await preference.create({
      body: {
        items: [{
          id: `lexconnect-${plan}`,
          title: `LexConnect ${planData.label}`,
          description: planData.description,
          quantity: 1,
          unit_price: planData.amount,
          currency_id: 'ARS',
        }],
        payer: {
          email: user.email ?? '',
          name: profile?.full_name ?? '',
        },
        back_urls: {
          success: `${baseUrl}/suscripcion/exito?plan=${plan}`,
          pending: `${baseUrl}/suscripcion/pendiente?plan=${plan}`,
          failure: `${baseUrl}/suscripcion/fallo?plan=${plan}`,
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
        metadata: {
          user_id: user.id,
          lawyer_profile_id: lp.id,
          plan_type: plan,
        },
        statement_descriptor: 'LEXCONNECT',
      },
    })

    await supabase.from('subscriptions').upsert({
      user_id: user.id,
      lawyer_id: lp.id,
      plan_type: plan,
      status: 'pending',
      mp_preference_id: result.id,
      amount: planData.amount,
      currency: 'ARS',
    }, { onConflict: 'user_id' })

    return NextResponse.json({
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    })

  } catch (err) {
    console.error('[MP Subscribe]', err)
    return NextResponse.json({ error: 'Error al crear preferencia de pago' }, { status: 500 })
  }
}
