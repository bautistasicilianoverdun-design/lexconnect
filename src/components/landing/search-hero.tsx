'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

const QUICK_SEARCHES_CLIENT = ['Divorcio', 'Laboral', 'Accidente de tránsito', 'Contrato', 'Herencia']
const QUICK_SEARCHES_LAWYER = [
  { name: 'Laboral',   slug: 'laboral' },
  { name: 'Civil',     slug: 'civil' },
  { name: 'Penal',     slug: 'penal' },
  { name: 'Familia',   slug: 'familia' },
  { name: 'Comercial', slug: 'comercial' },
]

export function SearchHero() {
  const [query, setQuery] = useState('')
  const [isLawyer, setIsLawyer] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.role === 'lawyer' || data?.role === 'firm_admin') setIsLawyer(true)
        })
    })
  }, [])

  function navigateText(q: string) {
    const term = q.trim()
    if (!term) return
    if (isLawyer) {
      router.push(`/casos?q=${encodeURIComponent(term)}`)
    } else {
      router.push(`/abogados?q=${encodeURIComponent(term)}`)
    }
  }

  function navigateCategory(slug: string) {
    router.push(`/casos?categoria=${slug}`)
  }

  const placeholder = isLawyer
    ? '¿Qué tipo de casos estás buscando?'
    : '¿Qué tipo de problema legal tenés?'

  const buttonText = isLawyer ? 'Buscar casos' : 'Buscar abogado'

  return (
    <div className="mt-10 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
        <div className="flex-1 flex items-center gap-3 px-4 py-2">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && navigateText(query)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-white placeholder:text-slate-400 outline-none text-sm"
          />
        </div>
        <button
          onClick={() => navigateText(query)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          {buttonText}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Quick links */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {isLawyer
          ? QUICK_SEARCHES_LAWYER.map(({ name, slug }) => (
              <button
                key={slug}
                onClick={() => navigateCategory(slug)}
                className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 text-xs text-slate-300 transition-colors"
              >
                {name}
              </button>
            ))
          : QUICK_SEARCHES_CLIENT.map((term) => (
              <button
                key={term}
                onClick={() => navigateText(term)}
                className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 text-xs text-slate-300 transition-colors"
              >
                {term}
              </button>
            ))
        }
      </div>
    </div>
  )
}
