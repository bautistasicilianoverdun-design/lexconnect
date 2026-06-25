'use client'

import { useState } from 'react'

interface Props {
  planKey: string
  planLabel: string
}

export function PlanSubscribeButton({ planKey, planLabel }: Props) {
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
      // En produccion usar init_point, en sandbox usar sandbox_init_point
      const url = data.init_point ?? data.sandbox_init_point
      if (url) window.location.href = url
    } catch {
      setError('Error de conexion. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
        style={{ backgroundColor: '#111111' }}
      >
        {loading ? 'Redirigiendo...' : `Suscribirme al ${planLabel}`}
      </button>
      {error && <p className="text-xs text-red-600 max-w-[200px] text-right">{error}</p>}
    </div>
  )
}
