import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  FileText, Clock, CheckCircle2, XCircle, ChevronRight,
  MessageSquare, Briefcase, AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} ${days === 1 ? 'dia' : 'dias'}`
}

const PROPOSAL_STATUS: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending: {
    label: 'En espera',
    className: 'bg-amber-100 text-amber-700',
    icon: <Clock className="h-3 w-3" />,
  },
  accepted: {
    label: 'Aceptado',
    className: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  rejected: {
    label: 'No seleccionado',
    className: 'bg-slate-100 text-slate-500',
    icon: <XCircle className="h-3 w-3" />,
  },
  withdrawn: {
    label: 'Retirado',
    className: 'bg-slate-100 text-slate-500',
    icon: <XCircle className="h-3 w-3" />,
  },
}

const URGENCY_LABELS: Record<string, string> = {
  urgent: 'Urgente', high: 'Alta', medium: 'Media', low: 'Baja',
}
const URGENCY_STYLES: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-slate-100 text-slate-600',
}

export default async function MisPropuestasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  // Get lawyer profile
  const { data: lawyerProfile } = await supabase
    .from('lawyer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!lawyerProfile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis propuestas</h1>
          <p className="text-sm text-slate-500 mt-0.5">Propuestas que enviaste a casos de clientes</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-slate-200 mb-4" />
          <p className="font-semibold text-slate-700 mb-1">Tu perfil de abogado no esta completo</p>
          <p className="text-sm text-slate-400 mb-6">Completa tu perfil para poder enviar propuestas a casos.</p>
          <Link
            href="/dashboard/perfil"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Completar perfil
          </Link>
        </div>
      </div>
    )
  }

  const { data: proposals } = await supabase
    .from('case_proposals')
    .select(`
      id, message, proposed_fee, fee_type, status, created_at,
      legal_cases!case_id(
        id, title, description, urgency, status,
        legal_categories!category_id(name),
        provinces!province_id(name),
        profiles!client_id(full_name)
      )
    `)
    .eq('lawyer_id', lawyerProfile.id)
    .order('created_at', { ascending: false })

  const total = proposals?.length ?? 0
  const accepted = proposals?.filter((p) => p.status === 'accepted').length ?? 0
  const pending = proposals?.filter((p) => p.status === 'pending').length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis propuestas</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {total} {total === 1 ? 'propuesta enviada' : 'propuestas enviadas'}
        </p>
      </div>

      {/* Stats */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
            <p className="text-3xl font-bold text-slate-900">{total}</p>
            <p className="text-xs text-slate-500 mt-1">Total enviadas</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
            <p className="text-3xl font-bold text-amber-600">{pending}</p>
            <p className="text-xs text-slate-500 mt-1">En espera</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
            <p className="text-3xl font-bold text-green-600">{accepted}</p>
            <p className="text-xs text-slate-500 mt-1">Aceptadas</p>
          </div>
        </div>
      )}

      {!proposals || proposals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-slate-200 mb-4" />
          <p className="font-semibold text-slate-700 mb-1">Todavia no enviaste propuestas</p>
          <p className="text-sm text-slate-400 mb-6">Explorá los casos disponibles y enviá tu primera propuesta.</p>
          <Link
            href="/dashboard/casos-disponibles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <FileText className="h-4 w-4" /> Ver casos disponibles
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => {
            const legalCase = (Array.isArray(p.legal_cases) ? p.legal_cases[0] : p.legal_cases) as {
              id: string
              title: string
              description: string
              urgency: string
              status: string
              legal_categories: { name: string } | { name: string }[] | null
              provinces: { name: string } | { name: string }[] | null
              profiles: { full_name: string } | { full_name: string }[] | null
            } | null

            if (!legalCase) return null

            const cat = (Array.isArray(legalCase.legal_categories) ? legalCase.legal_categories[0] : legalCase.legal_categories) as { name: string } | null
            const prov = (Array.isArray(legalCase.provinces) ? legalCase.provinces[0] : legalCase.provinces) as { name: string } | null
            const clientProfile = (Array.isArray(legalCase.profiles) ? legalCase.profiles[0] : legalCase.profiles) as { full_name: string } | null
            const statusInfo = PROPOSAL_STATUS[p.status] ?? PROPOSAL_STATUS.pending

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* Case info */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {legalCase.urgency && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${URGENCY_STYLES[legalCase.urgency] ?? ''}`}>
                        {URGENCY_LABELS[legalCase.urgency] ?? legalCase.urgency}
                      </span>
                    )}
                    {cat && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {cat.name}
                      </span>
                    )}
                    {prov && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                        {prov.name}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mb-1">{legalCase.title}</h2>
                  <p className="text-sm text-slate-500 line-clamp-2">{legalCase.description}</p>
                  {clientProfile && (
                    <p className="text-xs text-slate-400 mt-2">Cliente: {clientProfile.full_name}</p>
                  )}
                </div>

                {/* Proposal details */}
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-slate-400">{timeAgo(p.created_at)}</span>
                    </div>
                    {(p.proposed_fee || p.fee_type) && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
                        {p.proposed_fee
                          ? `$${Number(p.proposed_fee).toLocaleString('es-AR')}`
                          : p.fee_type === 'to_discuss' ? 'Honorarios a convenir'
                          : p.fee_type === 'contingency' ? 'Sin anticipo - % del resultado'
                          : p.fee_type}
                      </span>
                    )}
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 mb-1.5">Tu propuesta</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{p.message}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.status === 'accepted' && (
                      <Link
                        href="/dashboard/mensajes"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Ir al chat
                      </Link>
                    )}
                    <Link
                      href={`/casos/${legalCase.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                    >
                      Ver caso <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
