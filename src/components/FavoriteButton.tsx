'use client'

import { useState, useEffect, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { checkFavorite, toggleFavorite } from '@/app/abogados/[slug]/actions'

export default function FavoriteButton({ lawyerProfileId }: { lawyerProfileId: string }) {
  const [saved, setSaved]         = useState(false)
  const [loading, setLoading]     = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    checkFavorite(lawyerProfileId).then((result) => {
      setSaved(result)
      setLoading(false)
    })
  }, [lawyerProfileId])

  function toggle() {
    startTransition(async () => {
      const result = await toggleFavorite(lawyerProfileId, saved)
      if (result.error === 'not_authenticated') {
        window.location.href = '/iniciar-sesion'
        return
      }
      setSaved(result.saved)
    })
  }

  const isDisabled = loading || isPending

  return (
    <button
      onClick={toggle}
      disabled={isDisabled}
      title={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-colors disabled:opacity-40
        ${saved
          ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
          : 'border-slate-200 hover:bg-slate-50 text-slate-500'
        }`}
    >
      <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
    </button>
  )
}
