'use client'
import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function FavoriteButton({ lawyerProfileId }: { lawyerProfileId: string }) {
  const [saved, setSaved]       = useState(false)
  const [loading, setLoading]   = useState(true)
  const [userId, setUserId]     = useState<string | null>(null)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('client_favorites')
        .select('client_id')
        .eq('client_id', user.id)
        .eq('lawyer_id', lawyerProfileId)
        .maybeSingle()

      setSaved(!!data)
      setLoading(false)
    }
    check()
  }, [lawyerProfileId])

  async function toggle() {
    if (!userId) {
      window.location.href = '/iniciar-sesion'
      return
    }
    const supabase = createClient()
    if (saved) {
      setSaved(false)
      await supabase
        .from('client_favorites')
        .delete()
        .eq('client_id', userId)
        .eq('lawyer_id', lawyerProfileId)
    } else {
      setSaved(true)
      await supabase
        .from('client_favorites')
        .insert({ client_id: userId, lawyer_id: lawyerProfileId })
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
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
