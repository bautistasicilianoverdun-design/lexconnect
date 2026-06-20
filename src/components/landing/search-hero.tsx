'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight } from 'lucide-react'

const QUICK_SEARCHES = ['Divorcio', 'Laboral', 'Accidente de tránsito', 'Contrato', 'Herencia']

export function SearchHero() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function navigate(q: string) {
    const term = q.trim()
    if (!term) return
    router.push(`/abogados?q=${encodeURIComponent(term)}`)
  }

  return (
    <div className="mt-10 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
        <div className="flex-1 flex items-center gap-3 px-4 py-2">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && navigate(query)}
            placeholder="¿Qué tipo de problema legal tenés?"
            className="flex-1 bg-transparent text-white placeholder:text-slate-400 outline-none text-sm"
          />
        </div>
        <button
          onClick={() => navigate(query)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Buscar abogado
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Quick links */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {QUICK_SEARCHES.map((term) => (
          <button
            key={term}
            onClick={() => navigate(term)}
            className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 text-xs text-slate-300 transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  )
}
