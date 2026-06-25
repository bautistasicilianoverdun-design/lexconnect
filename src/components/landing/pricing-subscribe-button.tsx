'use client'

import { useState } from 'react'

interface Props {
  planKey: string
  planLabel: string
  isPopular?: boolean
}

export function PricingSubscribeButton({ planKey, planLabel, isPopular }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubscribe() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/mercadopago/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al iniciar el pago')
        return
      }
      const url = data.init_point ?? data.sandbox_init_point
      if (url) window.location.href = url
    } catch {
      setError('Error de conexion. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
        style={{ backgroundColor: isPopular ? '#111111' : '#111111', opacity: loading ? 0.6 : 1 }}
      >
        {loading ? 'Redirigiendo a MercadoPago...' : `Suscribirme — ${planLabel}`}
      </button>
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
    </div>
  )
}
