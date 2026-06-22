'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, MapPin, CheckCircle2, Heart, MessageSquare, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Favorite = {
  created_at: string
  lawyer_profiles: {
    id: string
    rating_avg: number | null
    rating_count: number | null
    verification_status: string | null
    cases_handled: number | null
    response_time_hours: number | null
    lawyer_specialties: Array<{
      is_primary: boolean
      legal_categories: { name: string } | null
    }>
    profiles: {
      full_name: string
      city: string | null
      avatar_url: string | null
    } | null
  } | null
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

const AVATAR_COLORS = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-500', 'bg-rose-600']
function avatarColor(id: string) {
  let n = 0
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading]     = useState(true)
  const [userId, setUserId]       = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('client_favorites')
        .select(`
          created_at,
          lawyer_profiles(
            id, rating_avg, rating_count,
            verification_status, cases_handled, response_time_hours,
            lawyer_specialties(is_primary, legal_categories(name)),
            profiles(full_name, city, avatar_url)
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      setFavorites((data as unknown as Favorite[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function removeFavorite(lawyerProfileId: string) {
    setFavorites((f) => f.filter((x) => x.lawyer_profiles?.id !== lawyerProfileId))
    if (!userId) return
    const supabase = createClient()
    await supabase
      .from('client_favorites')
      .delete()
      .eq('client_id', userId)
      .eq('lawyer_id', lawyerProfileId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
        </svg>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Favoritos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Abogados que guardaste</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Heart className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="font-semibold text-slate-700">No tenés favoritos todavía</p>
          <p className="text-sm text-slate-400 mt-1 mb-6">Explorá abogados y guardá los que te interesen</p>
          <Link
            href="/abogados"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Explorar abogados
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Favoritos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{favorites.length} abogados guardados</p>
        </div>
        <Link href="/abogados" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          Explorar más
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((fav) => {
          const lp      = fav.lawyer_profiles
          const profile = lp?.profiles
          const name    = profile?.full_name ?? 'Abogado'
          const isVerified = lp?.verification_status === 'verified'
          const primarySpec = lp?.lawyer_specialties?.find(s => s.is_primary) ?? lp?.lawyer_specialties?.[0]
          const specialty = primarySpec?.legal_categories?.name ?? null

          return (
            <div key={lp?.id ?? fav.created_at} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${avatarColor(lp?.id ?? '')} text-white font-bold text-base shrink-0`}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt={name} className="h-12 w-12 rounded-full object-cover" />
                    : getInitials(name)
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-semibold text-slate-900 text-sm">{name}</p>
                    {isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{specialty ?? '—'}</p>
                  {(lp?.rating_avg ?? 0) > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-slate-900">{lp?.rating_avg?.toFixed(1)}</span>
                      <span className="text-xs text-slate-400">({lp?.rating_count})</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => lp?.id && removeFavorite(lp.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors shrink-0"
                  title="Quitar de favoritos"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>
              </div>

              <div className="flex flex-col gap-1.5 mb-4 flex-1">
                {profile?.city && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="h-3 w-3 shrink-0" /> {profile.city}
                  </div>
                )}
                {lp?.response_time_hours != null && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3 w-3 shrink-0" />
                    Responde en ~{lp.response_time_hours}h
                  </div>
                )}
                {(lp?.cases_handled ?? 0) > 0 && (
                  <div className="text-xs text-slate-400">{lp?.cases_handled} casos resueltos</div>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/abogados/${lp?.id ?? ''}`}
                  className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center transition-colors"
                >
                  Ver perfil
                </Link>
                <Link
                  href="/dashboard/mensajes"
                  className="h-9 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors flex items-center"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
