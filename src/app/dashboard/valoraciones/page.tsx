import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReviewForm } from '@/components/dashboard/review-form'
import { Star } from 'lucide-react'

export const metadata = { title: 'Valoraciones — LexConnect' }

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= value ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
        />
      ))}
    </div>
  )
}

function timeLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return 'Vencido'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `${days}d ${hours}h restantes`
  return `${hours}h restantes`
}

export default async function ValoracionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  // Lock expired reviews first
  await supabase.rpc('lock_expired_reviews')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const isLawyer = profile?.role === 'lawyer' || profile?.role === 'firm_admin'

  // Get my submitted reviews
  const { data: myReviews } = await supabase
    .from('reviews')
    .select('id, case_id, rating, comment, is_revealed, is_locked, reveal_deadline, created_at, reviewee_id')
    .eq('reviewer_id', user.id)
    .order('created_at', { ascending: false })

  // Get reviews received (revealed)
  const { data: receivedReviews } = await supabase
    .from('reviews')
    .select('id, case_id, rating, comment, rating_communication, rating_expertise, rating_value, rating_responsiveness, created_at, reviewer_id')
    .eq('reviewee_id', user.id)
    .eq('is_revealed', true)
    .order('created_at', { ascending: false })

  // Get closed cases pending review
  const reviewedCaseIds = (myReviews ?? []).map(r => r.case_id).filter(Boolean) as string[]

  let pendingCases: {
    id: string
    title: string
    client_id: string
    otherPartyId: string
    otherPartyName: string
    lawyerId: string | null
    revealDeadline: string | null
  }[] = []

  if (isLawyer) {
    const { data: proposals } = await supabase
      .from('case_proposals')
      .select(`
        case_id,
        lawyer_id,
        legal_cases!case_id(
          id, title, client_id, status,
          profiles!client_id(full_name)
        )
      `)
      .eq('status', 'accepted')

    pendingCases = (proposals ?? [])
      .map(p => {
        const c = Array.isArray(p.legal_cases) ? p.legal_cases[0] : p.legal_cases
        if (!c || c.status !== 'closed') return null
        if (reviewedCaseIds.includes(c.id)) return null
        const clientProfile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
        return {
          id: c.id,
          title: c.title,
          client_id: c.client_id,
          otherPartyId: c.client_id,
          otherPartyName: (clientProfile as { full_name: string } | null)?.full_name ?? 'el cliente',
          lawyerId: null,
          revealDeadline: null,
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
  } else {
    const { data: cases } = await supabase
      .from('legal_cases')
      .select(`
        id, title, client_id, status,
        case_proposals!case_id(
          status, lawyer_id,
          lawyer_profiles!lawyer_id(id, user_id, profiles!user_id(full_name))
        )
      `)
      .eq('client_id', user.id)
      .eq('status', 'closed')

    pendingCases = (cases ?? [])
      .filter(c => !reviewedCaseIds.includes(c.id))
      .map(c => {
        const proposals = Array.isArray(c.case_proposals) ? c.case_proposals : []
        const accepted = proposals.find((p: { status: string }) => p.status === 'accepted')
        if (!accepted) return null
        const lpData = Array.isArray(accepted.lawyer_profiles) ? accepted.lawyer_profiles[0] : accepted.lawyer_profiles
        const lpProfiles = lpData?.profiles
        const lpProfile = Array.isArray(lpProfiles) ? lpProfiles[0] : lpProfiles
        return {
          id: c.id,
          title: c.title,
          client_id: c.client_id,
          otherPartyId: lpData?.user_id ?? '',
          otherPartyName: (lpProfile as { full_name: string } | null)?.full_name ?? 'el abogado',
          lawyerId: lpData?.id ?? null,
          revealDeadline: null,
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null && x.otherPartyId !== '')
  }

  const avgRating = receivedReviews && receivedReviews.length > 0
    ? (receivedReviews.reduce((s, r) => s + r.rating, 0) / receivedReviews.length).toFixed(1)
    : null

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Valoraciones</h1>
        <p className="text-sm text-slate-500 mt-1">
          Las valoraciones se revelan cuando ambas partes califican, o automaticamente a los 7 dias.
        </p>
      </div>

      {/* Pendientes de calificar */}
      {pendingCases.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Pendientes de calificar
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
              {pendingCases.length}
            </span>
          </div>
          {pendingCases.map(c => (
            <ReviewForm
              key={c.id}
              caseId={c.id}
              caseTitle={c.title}
              revieweeId={c.otherPartyId}
              revieweeName={c.otherPartyName}
              reviewerRole={isLawyer ? 'lawyer' : 'client'}
              lawyerId={c.lawyerId}
            />
          ))}
        </section>
      )}

      {pendingCases.length === 0 && (myReviews ?? []).length === 0 && (
        <div className="bg-white border border-[#EAEAEA] rounded-xl p-10 text-center">
          <Star className="h-10 w-10 mx-auto text-slate-200 mb-3" />
          <p className="text-sm text-slate-400">No tenes valoraciones pendientes.</p>
          <p className="text-xs text-slate-300 mt-1">Las valoraciones aparecen cuando un caso es cerrado.</p>
        </div>
      )}

      {/* Mis valoraciones enviadas */}
      {(myReviews ?? []).length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Valoraciones enviadas</h2>
          <div className="space-y-3">
            {(myReviews ?? []).map(r => {
              const revealed = r.is_revealed || (r.reveal_deadline && new Date(r.reveal_deadline) < new Date())
              const locked = r.is_locked || (r.reveal_deadline && new Date(r.reveal_deadline) < new Date())
              return (
                <div key={r.id} className="bg-white border border-[#EAEAEA] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <StarDisplay value={r.rating} />
                      <p className="text-sm text-slate-700 mt-2 line-clamp-2">{r.comment}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {locked ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-slate-500">
                          Bloqueada
                        </span>
                      ) : revealed ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EDF3EC] text-[#346538]">
                          Revelada
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FBF3DB] text-[#956400]">
                          Esperando
                        </span>
                      )}
                      {!locked && r.reveal_deadline && (
                        <p className="text-[10px] text-slate-400 mt-1">{timeLeft(r.reveal_deadline)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Valoraciones recibidas */}
      {(receivedReviews ?? []).length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Valoraciones recibidas</h2>
            {avgRating && (
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-slate-900">{avgRating}</span>
                <span className="text-xs text-slate-400">({receivedReviews!.length})</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {(receivedReviews ?? []).map(r => (
              <div key={r.id} className="bg-white border border-[#EAEAEA] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 shrink-0">
                    ?
                  </div>
                  <div className="flex-1">
                    <StarDisplay value={r.rating} />
                    {r.comment && <p className="text-sm text-slate-700 mt-2">{r.comment}</p>}
                    <div className="flex flex-wrap gap-3 mt-3">
                      {r.rating_communication ? (
                        <div className="text-xs text-slate-400">Comunicacion <span className="font-semibold text-slate-700">{r.rating_communication}/5</span></div>
                      ) : null}
                      {r.rating_expertise ? (
                        <div className="text-xs text-slate-400">Conocimiento <span className="font-semibold text-slate-700">{r.rating_expertise}/5</span></div>
                      ) : null}
                      {r.rating_value ? (
                        <div className="text-xs text-slate-400">Precio/calidad <span className="font-semibold text-slate-700">{r.rating_value}/5</span></div>
                      ) : null}
                      {r.rating_responsiveness ? (
                        <div className="text-xs text-slate-400">Respuesta <span className="font-semibold text-slate-700">{r.rating_responsiveness}/5</span></div>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(r.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
