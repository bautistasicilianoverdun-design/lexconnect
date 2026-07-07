import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header user={null} />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center py-24">

          {/* 404 number */}
          <div
            className="text-[120px] font-bold leading-none select-none"
            style={{
              fontFamily: "'Playfair Display', 'Instrument Serif', Georgia, serif",
              color: '#EAEAEA',
              letterSpacing: '-0.04em',
            }}
          >
            404
          </div>

          {/* Message */}
          <h1
            className="text-2xl font-semibold mt-2 mb-3"
            style={{ color: '#111111', letterSpacing: '-0.02em' }}
          >
            Página no encontrada
          </h1>
          <p className="text-sm leading-relaxed mb-10" style={{ color: '#787774' }}>
            La página que buscás no existe o fue movida.
            <br />
            Podés volver al inicio o buscar un abogado.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white rounded-md transition-colors hover:opacity-80"
              style={{ background: '#111111' }}
            >
              Ir al inicio
            </Link>
            <Link
              href="/abogados"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-md transition-colors"
              style={{ border: '1px solid #EAEAEA', color: '#111111' }}
            >
              Buscar abogados
            </Link>
          </div>

          {/* Divider */}
          <div className="mt-12 pt-8" style={{ borderTop: '1px solid #EAEAEA' }}>
            <p className="text-xs" style={{ color: '#787774' }}>
              ¿Creés que esto es un error?{' '}
              <Link href="/casos/nuevo" className="underline underline-offset-2" style={{ color: '#111111' }}>
                Publicá tu caso
              </Link>{' '}
              o{' '}
              <Link href="/asistente" className="underline underline-offset-2" style={{ color: '#111111' }}>
                consultá al asistente IA
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
