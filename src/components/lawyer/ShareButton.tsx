'use client'

import { Share2, Check } from 'lucide-react'
import { useState } from 'react'

export function ShareButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: `Abogado/a ${name} — LexConnect AR`, url })
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
      title={copied ? 'Link copiado' : 'Compartir perfil'}
    >
      {copied
        ? <Check className="h-4 w-4 text-green-500" />
        : <Share2 className="h-4 w-4 text-slate-500" />
      }
    </button>
  )
}
