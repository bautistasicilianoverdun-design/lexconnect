'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, MapPin, CheckCircle2, Heart, MessageSquare, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Favorite = {
  id: string
  created_at: string
  lawyer_profiles: {
    id: string
    specialty: string | null
    rating_avg: number | null
    rating_count: number | null
    verification_status: string | null
    cases_count: number | null
    response_hours: number | null
    profiles: {
      full_name: string
      city: string | null
      avatar_url: string | null
    } | null
  } | null
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

const AVATAR_COLORS = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-500', 'bg-rose-600']
function avatarColor(id: string) {
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('client_favorites')
        .select(`
          id, created_at,
          lawyer_profiles(
            id, specialty, rating_avg, rating_count,
            verification_status, cases_count, response_hours,
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

  async function removeFavorite(favId: string) {
    setFavorites((f) => f.filter((x) => x.id !== favId))
    const supabase = createClient()
    await supabase.from('client_favorites').delete().eq('id', favId)
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
          const lp = fav.lawyer_profiles
          const profile = lp?.profiles
          const name = profile?.full_name ?? 'Abogado'
          const isVerified = lp?.verification_status === 'verified'

          return (
            <div key={fav.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${avatarColor(lp?.id ?? fav.id)} text-white font-bold text-base shrink-0`}>
                  {getInitials(name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-semibold text-slate-900 text-sm">{name}</p>
                    {isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{lp?.specialty ?? '—'}</p>
                  {(lp?.rating_avg ?? 0) > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-0.5 text-xs">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-slate-900">{lp?.rating_avg?.toFixed(1)}</span>
                        <span className="text-slate-400">({lp?.rating_count})</span>
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFavorite(fav.id)}
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
                {lp?.response_hours != null && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3 w-3 shrink-0" />
                    Responde en ~{lp.response_hours}h
                  </div>
                )}
                {(lp?.cases_count ?? 0) > 0 && (
                  <div className="text-xs text-slate-400">{lp?.cases_count} casos resueltos</div>
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
