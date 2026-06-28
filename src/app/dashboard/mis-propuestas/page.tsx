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

  // Fetch conversations for accepted proposals to get direct chat links
  const acceptedCaseIds = (proposals ?? [])
    .filter(p => p.status === 'accepted')
    .map(p => {
      const lc = Array.isArray(p.legal_cases) ? p.legal_cases[0] : p.legal_cases
      return (lc as any)?.id as string | undefined
    })
    .filter(Boolean) as string[]

  const { data: conversations } = acceptedCaseIds.length > 0
    ? await supabase
        .from('conversations')
        .select('id, case_id')
        .in('case_id', acceptedCaseIds)
        .eq('lawyer_id', user.id)
    : { data: [] }

  const convByCaseId: Record<string, string> = {}
  for (const conv of conversations ?? []) {
    if (conv.case_id) convByCaseId[conv.case_id] = conv.id
  }

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {total > 0 ? Math.round((accepted / total) * 100) : 0}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Tasa de aceptacion</p>
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
        <FilteredProposals proposals={proposals} convByCaseId={convByCaseId} />
      )}
    </div>
  )
}

// ─── Client component for filtering ──────────────────────────────────────────
import { ProposalList } from './proposal-list'

function FilteredProposals({
  proposals,
  convByCaseId,
}: {
  proposals: any[]
  convByCaseId: Record<string, string>
}) {
  // This is a server component — we pass everything to a client component
  return <ProposalList proposals={proposals} convByCaseId={convByCaseId} />
}

// Dummy to satisfy original structure — actual content moved to proposal-list

