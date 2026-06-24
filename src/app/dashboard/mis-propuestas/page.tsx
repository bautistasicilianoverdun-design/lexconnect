import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, XCircle, MessageSquare, Eye, MapPin, ChevronRight, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'Ahora'
  if (mins < 60) return `Hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  accepted: { label: 'Aceptada', className: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  pending:  { label: 'Pendiente', className: 'bg-blue-100 text-blue-700',  icon: Clock },
  rejected: { label: 'No seleccionada', className: 'bg-slate-100 text-slate-500', icon: XCircle },
}

export default async function MisPropuestasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const { data: lp } = await supabase
    .from('lawyer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const proposals = lp ? (await supabase
    .from('case_proposals')
    .select(`
      id, message, status, created_at,
      legal_cases!case_id(
        id, title, status,
        legal_categories!category_id(name),
        provinces!province_id(name)
      )
    `)
    .eq('lawyer_id', lp.id)
    .order('created_at', { ascending: false })).data ?? [] : []

  const accepted = proposals.filter((p) => p.status === 'accepted').length
  const pending  = proposals.filter((p) => p.status === 'pending').length
  const rejected = proposals.length - accepted - pending

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis propuestas</h1>
        <p className="text-sm text-slate-500 mt-0.5">{proposals.length} propuestas enviadas</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Aceptadas',        value: accepted, className: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pendientes',       value: pending,  className: 'text-blue-600',  bg: 'bg-blue-50' },
          { label: 'No seleccionadas', value: rejected, className: 'text-slate-500', bg: 'bg-slate-50' },
        ].map(({ label, value, className, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${className}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Send className="h-10 w-10 mx-auto text-slate-200 mb-3" />
          <p className="font-semibold text-slate-700">Todavía no enviaste ninguna propuesta</p>
          <p className="text-sm text-slate-400 mt-1 mb-6">Explorá los casos disponibles y presentate a los que coincidan con tu especialidad.</p>
          <Link
            href="/dashboard/casos-disponibles"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Ver casos disponibles <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => {
            const config = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.pending
            const Icon = config.icon
            const lcase = (Array.isArray(p.legal_cases) ? p.legal_cases[0] : p.legal_cases) as {
              id: string; title: string; status: string;
              legal_categories: { name: string } | { name: string }[] | null
              provinces: { name: string } | { name: string }[] | null
            } | null
            const cat  = (Array.isArray(lcase?.legal_categories) ? lcase?.legal_categories[0] : lcase?.legal_categories) as { name: string } | null
            const prov = (Array.isArray(lcase?.provinces) ? lcase?.provinces[0] : lcase?.provinces) as { name: string } | null

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </span>
                      {cat && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{cat.name}</span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">
                      {lcase?.title ?? 'Caso eliminado'}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{p.message}</p>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                      {prov && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{prov.name}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Enviada {timeAgo(p.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {lcase && (
                      <Link
                        href={`/casos/${lcase.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> Ver caso
                      </Link>
                    )}
                    {p.status === 'accepted' && (
                      <Link
                        href="/dashboard/mensajes"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-semibold text-white transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Mensajes
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex justify-end">
        <Link
          href="/dashboard/casos-disponibles"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Ver más casos <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
