import Link from 'next/link'
import {
  FileText, MessageSquare, CheckCircle2, Users, Search, Star,
  Shield, Lock, Sparkles, Video, ArrowRight, Scale, ChevronRight,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const CLIENT_STEPS = [
  {
    n: '01',
    icon: FileText,
    title: 'Publicá tu caso',
    body: 'Describí tu situación legal con el mayor detalle posible. Nuestra IA clasifica tu caso automáticamente, sugiere la categoría correcta y oculta cualquier dato sensible (DNI, teléfonos, emails) antes de publicar.',
    note: 'Gratis y sin compromisos.',
  },
  {
    n: '02',
    icon: MessageSquare,
    title: 'Recibís propuestas',
    body: 'Abogados verificados especializados en tu tipo de caso te envían propuestas con plan de trabajo, honorarios estimados y disponibilidad. Podés ver sus perfiles, valoraciones y experiencia antes de responder.',
    note: 'Las primeras respuestas llegan en menos de 4 horas.',
  },
  {
    n: '03',
    icon: Video,
    title: 'Hablás con el abogado',
    body: 'Chateá en tiempo real dentro de la plataforma. Si querés conocer al profesional antes de contratar, agendá una videollamada directa. Todo sin revelar tus datos de contacto hasta que vos lo decidas.',
    note: 'Chat gratuito, videollamada coordinada por la plataforma.',
  },
  {
    n: '04',
    icon: CheckCircle2,
    title: 'Contratás con seguridad',
    body: 'Elegís al abogado que más te convenció, acordás los honorarios y comenzás. Podés dejar una valoración al finalizar para ayudar a la comunidad.',
    note: 'Sin comisiones ocultas ni intermediarios.',
  },
]

const LAWYER_STEPS = [
  {
    n: '01',
    icon: Users,
    title: 'Creás tu perfil',
    body: 'Completá tu perfil con especialidades, experiencia profesional, formación académica y matrícula. Verificamos tu identidad y matrícula en hasta 24 horas hábiles.',
  },
  {
    n: '02',
    icon: Search,
    title: 'Explorás casos',
    body: 'Accedés al listado de casos publicados en toda Argentina. Filtrás por especialidad, provincia y nivel de urgencia. Ves la descripción del caso antes de enviar una propuesta.',
  },
  {
    n: '03',
    icon: MessageSquare,
    title: 'Enviás propuestas',
    body: 'Respondés los casos que te interesan con un mensaje personalizado, honorarios estimados y disponibilidad. Con plan gratuito podés enviar hasta 5 propuestas por mes.',
  },
  {
    n: '04',
    icon: Star,
    title: 'Hacés crecer tu práctica',
    body: 'Construís reputación con valoraciones verificadas. Con plan profesional o premium accedés a más visibilidad, estadísticas avanzadas y herramientas de gestión de clientes.',
  },
]

const TRUST_ITEMS = [
  {
    icon: Shield,
    title: 'Verificación de identidad',
    body: 'Verificamos DNI y datos de todos los abogados mediante proceso manual + validación de matrícula contra el colegio de abogados correspondiente.',
  },
  {
    icon: Lock,
    title: 'Datos sensibles protegidos',
    body: 'Nuestra IA detecta y oculta automáticamente DNI, teléfonos y correos en los casos publicados. Tus datos de contacto nunca se comparten sin tu consentimiento.',
  },
  {
    icon: Sparkles,
    title: 'Matching con IA',
    body: 'Analizamos tu caso con inteligencia artificial para recomendarte los abogados más adecuados según especialidad, ubicación, experiencia y valoraciones.',
  },
  {
    icon: CheckCircle2,
    title: 'Sistema de valoraciones',
    body: 'Solo pueden valorar clientes que realmente trabajaron con el profesional. Las reseñas falsas se detectan y eliminan automáticamente.',
  },
]

const FAQS = [
  {
    q: '¿Cuánto cuesta usar LexConnect como cliente?',
    a: 'Es completamente gratis para clientes. Publicar casos, contactar abogados, chatear y leer valoraciones no tiene ningún costo.',
  },
  {
    q: '¿Cómo sé que el abogado es de confianza?',
    a: 'Verificamos la identidad y matrícula de cada abogado antes de que pueda publicar su perfil. Los perfiles verificados muestran el badge azul con tilde. Además podés ver sus valoraciones de clientes reales.',
  },
  {
    q: '¿LexConnect brinda asesoramiento jurídico?',
    a: 'No. LexConnect es una plataforma que conecta personas con abogados. No somos un estudio jurídico ni damos asesoramiento legal. El asistente IA brinda orientación general informativa, no asesoramiento jurídico.',
  },
  {
    q: '¿Qué pasa si no estoy conforme con el abogado?',
    a: 'Podés calificar negativamente y dejar una reseña. Si detectás conducta inapropiada, podés reportarlo directamente desde la plataforma. Nuestro equipo revisa todos los reportes.',
  },
  {
    q: '¿En qué provincias funciona?',
    a: 'LexConnect funciona en toda Argentina. Podés buscar abogados en cualquier provincia o contratar asistencia remota (videollamada) desde cualquier lugar del país.',
  },
  {
    q: '¿Los honorarios los fija LexConnect?',
    a: 'No. Los honorarios los acuerdan el cliente y el abogado directamente. LexConnect no interviene en esa negociación ni cobra comisiones sobre honorarios.',
  },
]

export default function ComoFuncionaPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header user={null} />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20 text-center">
          <div className="mx-auto max-w-3xl px-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300 mb-6">
              <Scale className="h-3.5 w-3.5" />
              ¿Cómo funciona?
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Simple, seguro y transparente
            </h1>
            <p className="text-slate-300 text-lg">
              LexConnect conecta personas con abogados verificados en Argentina. Sin vueltas, sin letra chica.
            </p>
          </div>
        </section>

        {/* Para clientes */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-12">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Para clientes</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CLIENT_STEPS.map(({ n, icon: Icon, title, body, note }) => (
                <div key={n} className="relative">
                  <div className="text-5xl font-black text-slate-100 mb-4 leading-none">{n}</div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-3">{body}</p>
                  {note && <p className="text-xs font-medium text-blue-600">{note}</p>}
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link href="/registro?rol=cliente" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
                Publicar mi caso gratis <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Para abogados */}
        <section className="py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-12">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                <Scale className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Para abogados</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {LAWYER_STEPS.map(({ n, icon: Icon, title, body }) => (
                <div key={n}>
                  <div className="text-5xl font-black text-slate-100 mb-4 leading-none">{n}</div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex gap-3 flex-wrap">
              <Link href="/registro?rol=abogado" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors text-sm">
                Crear perfil gratis <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/precios" className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition-colors text-sm">
                Ver planes y precios
              </Link>
            </div>
          </div>
        </section>

        {/* Seguridad */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Seguridad en cada paso</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-sm">
                Diseñamos LexConnect pensando en la protección de clientes y profesionales.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TRUST_ITEMS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-slate-50 rounded-2xl p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-slate-50">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Preguntas frecuentes</h2>
            <div className="space-y-4">
              {FAQS.map(({ q, a }) => (
                <div key={q} className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-900 text-sm mb-2">{q}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-blue-600 text-center">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="text-3xl font-bold text-white mb-4">¿Listo para empezar?</h2>
            <p className="text-blue-100 mb-8">
              Registrate gratis y encontrá el abogado que necesitás hoy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registro?rol=cliente" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
                Soy cliente <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/registro?rol=abogado" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/40 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                Soy abogado
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
