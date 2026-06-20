'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Star, MapPin, CheckCircle2, Heart, MessageSquare, Eye, Clock } from 'lucide-react'

const INITIAL_FAVORITES = [
  {
    id: '1', slug: 'carlos-perez-laboral', name: 'Dr. Carlos Pérez', avatar: 'CP',
    specialty: 'Derecho Laboral', province: 'Córdoba', city: 'Córdoba Capital',
    rating: 4.9, reviews: 142, cases: 89, response_time: '< 1 hora',
    verified: true, plan: 'premium', accepts: true,
    savedAt: 'Hace 2 días',
  },
  {
    id: '2', slug: 'lucia-fernandez-laboral', name: 'Dra. Lucía Fernández', avatar: 'LF',
    specialty: 'Derecho Laboral', province: 'Buenos Aires', city: 'CABA',
    rating: 4.9, reviews: 203, cases: 134, response_time: '< 2 horas',
    verified: true, plan: 'premium', accepts: true,
    savedAt: 'Hace 5 días',
  },
  {
    id: '3', slug: 'ana-martinez-familia', name: 'Dra. Ana Martínez', avatar: 'AM',
    specialty: 'Derecho de Familia', province: 'Buenos Aires', city: 'CABA',
    rating: 4.8, reviews: 98, cases: 67, response_time: '< 3 horas',
    verified: true, plan: 'professional', accepts: true,
    savedAt: 'Hace 1 semana',
  },
]

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState(INITIAL_FAVORITES)

  function removeFavorite(id: string) {
    setFavorites((f) => f.filter((x) => x.id !== id))
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
          <Link href="/abogados" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
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
        {favorites.map((f) => (
          <div key={f.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:shadow-sm transition-shadow">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-base shrink-0">
                {f.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-semibold text-slate-900 text-sm">{f.name}</p>
                  {f.verified && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{f.specialty}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-0.5 text-xs">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-slate-900">{f.rating}</span>
                    <span className="text-slate-400">({f.reviews})</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeFavorite(f.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors shrink-0"
                title="Quitar de favoritos"
              >
                <Heart className="h-4 w-4 fill-current" />
              </button>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1.5 mb-4 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="h-3 w-3 shrink-0" /> {f.city}, {f.province}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="h-3 w-3 shrink-0" /> Responde {f.response_time}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Eye className="h-3 w-3 shrink-0" /> {f.cases} casos resueltos
              </div>
              {f.accepts && (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Acepta nuevos clientes
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link
                href={`/abogados/${f.slug}`}
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

            <p className="text-[10px] text-slate-400 text-center mt-2">Guardado {f.savedAt}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
