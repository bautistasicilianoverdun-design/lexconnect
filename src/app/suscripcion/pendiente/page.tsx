import Link from 'next/link'

export default function SuscripcionPendientePage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-6">
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-10 max-w-md w-full text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: '#FBF3DB' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#956400" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Pago en proceso</h1>
        <p className="text-slate-500 mb-8">
          Tu pago está siendo procesado. Una vez confirmado, tu cuenta será actualizada automáticamente. Recibirás una notificación cuando esté listo.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: '#111111' }}
        >
          Volver al dashboard
        </Link>
      </div>
    </div>
  )
}
