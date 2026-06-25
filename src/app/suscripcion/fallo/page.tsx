import Link from 'next/link'

export default function SuscripcionFalloPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-6">
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-10 max-w-md w-full text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: '#FDEBEC' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9F2F2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Pago no procesado</h1>
        <p className="text-slate-500 mb-8">
          No pudimos procesar tu pago. Verificá los datos de tu tarjeta e intentalo nuevamente. Si el problema persiste, contactanos por soporte.
        </p>

        <div className="space-y-3">
          <Link
            href="/precios"
            className="inline-flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: '#111111' }}
          >
            Intentar nuevamente
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-full py-3 rounded-xl border border-[#EAEAEA] text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
