import Link from "next/link";
import { SearchHero } from "@/components/landing/search-hero";
import {
  Scale,
  Shield,
  Star,
  CheckCircle2,
  ArrowRight,
  Users,
  MessageSquare,
  Video,
  Sparkles,
  FileText,
  Lock,
  ChevronRight,
  Briefcase,
  Home,
  Car,
  Heart,
  ShoppingCart,
  Building,
  Calculator,
  Search,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";

const LEGAL_CATEGORIES = [
  { icon: Briefcase, name: "Laboral", slug: "laboral", color: "bg-blue-50 text-blue-600" },
  { icon: Scale, name: "Civil", slug: "civil", color: "bg-purple-50 text-purple-600" },
  { icon: Shield, name: "Penal", slug: "penal", color: "bg-red-50 text-red-600" },
  { icon: Building, name: "Comercial", slug: "comercial", color: "bg-orange-50 text-orange-600" },
  { icon: Users, name: "Familia", slug: "familia", color: "bg-pink-50 text-pink-600" },
  { icon: Home, name: "Inmobiliario", slug: "inmobiliario", color: "bg-green-50 text-green-600" },
  { icon: Calculator, name: "Tributario", slug: "tributario", color: "bg-yellow-50 text-yellow-600" },
  { icon: ShoppingCart, name: "Consumidor", slug: "consumidor", color: "bg-teal-50 text-teal-600" },
  { icon: Car, name: "Tránsito", slug: "transito", color: "bg-slate-50 text-slate-600" },
  { icon: Heart, name: "Societario", slug: "societario", color: "bg-indigo-50 text-indigo-600" },
];

const STATS = [
  { value: "+5.000", label: "Abogados verificados" },
  { value: "+12.000", label: "Clientes atendidos" },
  { value: "4.8★", label: "Calificación promedio" },
  { value: "98%", label: "Casos resueltos" },
];

const HOW_IT_WORKS_CLIENT = [
  {
    step: "01",
    title: "Publicá tu caso",
    description:
      "Describí tu situación legal de forma segura. Nuestra IA clasifica automáticamente tu caso y oculta datos sensibles.",
    icon: FileText,
  },
  {
    step: "02",
    title: "Recibí propuestas",
    description:
      "Abogados especializados te envían propuestas con presupuesto y plan de trabajo en menos de 24 horas.",
    icon: MessageSquare,
  },
  {
    step: "03",
    title: "Elegí y contratá",
    description:
      "Revisá perfiles, valoraciones y experiencia. Chateá, agenda una videollamada y contratá con total seguridad.",
    icon: CheckCircle2,
  },
];

const HOW_IT_WORKS_LAWYER = [
  {
    step: "01",
    title: "Creá tu perfil",
    description:
      "Completá tu perfil profesional con especialidades, experiencia y matrícula. Verificamos tu identidad en 24 horas.",
    icon: Users,
  },
  {
    step: "02",
    title: "Recibí consultas",
    description:
      "Accedé a casos publicados por clientes de toda Argentina. Filtrá por especialidad, provincia y urgencia.",
    icon: Search,
  },
  {
    step: "03",
    title: "Hacé crecer tu práctica",
    description:
      "Gestioná clientes, videollamadas y pagos desde un solo lugar. Con plan premium, maximizá tu visibilidad.",
    icon: Star,
  },
];

const TRUST_FEATURES = [
  {
    icon: Shield,
    title: "Verificación de identidad",
    description: "Verificamos DNI, matrícula y datos de todos los profesionales antes de aprobar su perfil.",
  },
  {
    icon: Lock,
    title: "Datos sensibles protegidos",
    description: "Nuestra IA detecta y oculta automáticamente DNI, teléfonos y correos en los casos publicados.",
  },
  {
    icon: Sparkles,
    title: "IA de matching inteligente",
    description: "Recomendamos el abogado ideal según tu caso, ubicación, especialidad y valoraciones.",
  },
  {
    icon: MessageSquare,
    title: "Chat y videollamadas seguras",
    description: "Comunicación directa y cifrada. Sin revelar datos de contacto hasta que vos decidas.",
  },
];

const TESTIMONIALS = [
  {
    name: "María González",
    role: "Cliente",
    province: "Buenos Aires",
    avatar: "MG",
    rating: 5,
    text: "Encontré un abogado laboralista excelente en menos de un día. El proceso fue muy claro y me sentí segura en todo momento.",
  },
  {
    name: "Dr. Rodrigo Sáenz",
    role: "Abogado — Derecho Civil",
    province: "Córdoba",
    avatar: "RS",
    rating: 5,
    text: "Desde que uso LexConnect duplicé mis clientes. La plataforma es muy profesional y los clientes llegan con información clara.",
  },
  {
    name: "Laura Fernández",
    role: "Cliente",
    province: "Santa Fe",
    avatar: "LF",
    rating: 5,
    text: "Increíble que exista algo así en Argentina. Pude resolver mi divorcio con un abogado verificado sin moverme de casa.",
  },
];

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let isLawyer = false
  if (user) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    isLawyer = data?.role === 'lawyer' || data?.role === 'firm_admin'
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header user={null} />
      <main className="flex-1">
        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-24 sm:py-32">
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/20 rounded-full blur-[100px]" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300 mb-8">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Abogados verificados · Argentina
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Tu problema legal,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                el abogado correcto
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Conectamos personas con abogados y estudios jurídicos verificados en toda
              Argentina. Seguro, transparente y sin vueltas.
            </p>

            <SearchHero />

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-bold text-white">{value}</div>
                  <div className="text-sm text-slate-400 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CATEGORÍAS ─── */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900">
                Especialidades legales
              </h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                {isLawyer ? 'Encontrá un caso para tu perfil' : 'Encontrá el especialista exacto para tu tipo de caso'}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {LEGAL_CATEGORIES.map(({ icon: Icon, name, slug, color }) => (
                <Link
                  key={slug}
                  href={isLawyer ? `/casos?categoria=${slug}` : `/abogados?categoria=${slug}`}
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 bg-white text-center"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} transition-transform group-hover:scale-110`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                    {name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CONFIANZA / TRUST ─── */}
        <section className="py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm mb-3">
                <Shield className="h-4 w-4" />
                Plataforma segura
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                Tu seguridad, nuestra prioridad
              </h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                Construimos LexConnect pensando en la protección de todas las partes
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TRUST_FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CÓMO FUNCIONA ─── */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900">¿Cómo funciona?</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Para clientes */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Users className="h-4 w-4" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Para clientes</h3>
                </div>
                <div className="space-y-8">
                  {HOW_IT_WORKS_CLIENT.map(({ step, title, description, icon: Icon }) => (
                    <div key={step} className="flex gap-5">
                      <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-sm">
                        {step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/registro?rol=cliente"
                  className="mt-8 inline-flex items-center gap-2 text-blue-600 font-medium text-sm hover:underline"
                >
                  Publicar mi primer caso <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Para abogados */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
                    <Scale className="h-4 w-4" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Para abogados</h3>
                </div>
                <div className="space-y-8">
                  {HOW_IT_WORKS_LAWYER.map(({ step, title, description, icon: Icon }) => (
                    <div key={step} className="flex gap-5">
                      <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
                        {step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/registro?rol=abogado"
                  className="mt-8 inline-flex items-center gap-2 text-slate-700 font-medium text-sm hover:underline"
                >
                  Crear mi perfil profesional <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIOS ─── */}
        <section className="py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900">Lo que dicen nuestros usuarios</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {TESTIMONIALS.map(({ name, role, province, avatar, rating, text }) => (
                <div
                  key={name}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                >
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">"{text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                      {avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{name}</div>
                      <div className="text-xs text-slate-500">{role} · {province}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── ABOGADO CTA ─── */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-blue-950 px-8 py-16 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-[60px]" />
              <div className="relative">
                <Scale className="h-12 w-12 text-blue-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">
                  ¿Sos abogado o tenés un estudio jurídico?
                </h2>
                <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                  Unite a miles de profesionales que ya usan LexConnect para hacer crecer su práctica.
                  Perfil gratuito. Sin comisiones ocultas.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!isLawyer && (
                    <Link
                      href="/registro?rol=abogado"
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      Crear perfil gratis
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  <Link
                    href="/precios"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/20 hover:bg-white/10 text-white rounded-xl transition-colors"
                  >
                    Ver planes y precios
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── IA ASSISTANT TEASER ─── */}
        {!isLawyer && <section className="py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm mb-4">
                  <Sparkles className="h-4 w-4" />
                  Asistente Legal con IA
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Orientación legal inmediata, 24/7
                </h2>
                <p className="text-slate-500 leading-relaxed mb-6">
                  Nuestro asistente con inteligencia artificial te orienta sobre tu situación legal,
                  te explica conceptos y te recomienda el tipo de profesional que necesitás.
                </p>
                <p className="text-xs text-slate-400 border border-slate-200 rounded-lg px-4 py-2 inline-block">
                  Esta orientación es informativa y no constituye asesoramiento jurídico.
                </p>
                <div className="mt-8">
                  <Link
                    href="/asistente"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    <Sparkles className="h-4 w-4" />
                    Consultar al asistente
                  </Link>
                </div>
              </div>

              {/* Chat mockup */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                <div className="bg-slate-900 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs text-slate-400">Asistente Legal LexConnect</span>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <ChatBubble role="user" text="Me despidieron sin causa justificada. ¿Qué derechos tengo?" />
                  <ChatBubble
                    role="assistant"
                    text="En Argentina, ante un despido sin causa, tenés derecho a: indemnización por antigüedad (1 mes de sueldo por año), indemnización sustitutiva de preaviso y vacaciones proporcionales. La Ley 20.744 (LCT) regula estos derechos."
                  />
                  <ChatBubble role="user" text="¿Tengo plazo para reclamar?" />
                  <ChatBubble
                    role="assistant"
                    text="Sí, el plazo de prescripción es de 2 años desde el despido. Te recomiendo contactar a un abogado laboralista cuanto antes para evaluar tu caso en detalle."
                  />
                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      placeholder="Escribí tu consulta..."
                      className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
                      readOnly
                    />
                    <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium">
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>}

        {/* ─── COMUNICACIÓN ─── */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Comunicación directa y segura
            </h2>
            <p className="text-slate-500 mb-12 max-w-lg mx-auto">
              Chateá, agendá videollamadas y compartí documentos sin revelar tus datos de contacto.
            </p>
            <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { icon: MessageSquare, title: "Chat en tiempo real", desc: "Mensajería cifrada directamente en la plataforma" },
                { icon: Video, title: "Videollamadas", desc: "Sesiones virtuales integradas con Google Meet y Zoom" },
                { icon: FileText, title: "Documentos seguros", desc: "Compartí archivos con control total de quién puede verlos" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="py-20 bg-blue-600">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Empezá hoy, es gratis
            </h2>
            <p className="text-blue-100 mb-10 text-lg">
              Registrate como cliente o profesional y comenzá a resolver tus necesidades legales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/registro?rol=cliente"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors"
              >
                Soy cliente
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/registro?rol=abogado"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/40 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
              >
                Soy abogado
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ChatBubble({
  role,
  text,
}: {
  role: "user" | "assistant";
  text: string;
}) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      {role === "assistant" && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shrink-0 mr-2 mt-0.5">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          role === "user"
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-slate-50 text-slate-700 border border-slate-200 rounded-tl-sm"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
