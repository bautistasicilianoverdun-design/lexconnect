'use client'

import { useState } from 'react'
import { submitReview } from '@/lib/reviews'
import { Star } from 'lucide-react'

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="transition-colors"
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              i <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function SubRating({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500 w-36">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className="transition-colors"
          >
            <Star
              className={`h-4 w-4 ${i <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export function ReviewForm({
  caseId,
  caseTitle,
  revieweeId,
  revieweeName,
  reviewerRole,
  lawyerId,
}: {
  caseId: string
  caseTitle: string
  revieweeId: string
  revieweeName: string
  reviewerRole: 'client' | 'lawyer'
  lawyerId?: string | null
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [comm, setComm] = useState(0)
  const [exp, setExp] = useState(0)
  const [val, setVal] = useState(0)
  const [resp, setResp] = useState(0)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isForLawyer = reviewerRole === 'client'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError('Selecciona al menos una estrella'); return }
    if (comment.trim().length < 10) { setError('El comentario debe tener al menos 10 caracteres'); return }

    setLoading(true)
    setError(null)

    const result = await submitReview({
      caseId,
      revieweeId,
      reviewerRole,
      lawyerId: lawyerId ?? null,
      rating,
      comment: comment.trim(),
      ratingCommunication: isForLawyer ? comm || undefined : undefined,
      ratingExpertise: isForLawyer ? exp || undefined : undefined,
      ratingValue: isForLawyer ? val || undefined : undefined,
      ratingResponsiveness: isForLawyer ? resp || undefined : undefined,
    })

    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="bg-white border border-[#EAEAEA] rounded-xl p-6 text-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 mx-auto">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#346538" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-900">Valoración enviada</p>
        <p className="text-xs text-slate-500">
          Tu valoración quedó registrada. Se revelará cuando {revieweeName} también califique, o automáticamente a los 7 días.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#EAEAEA] rounded-xl p-6 space-y-5">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Caso</p>
        <p className="text-sm font-medium text-slate-900 line-clamp-1">{caseTitle}</p>
      </div>

      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-0.5">
          {isForLawyer ? 'Abogado' : 'Cliente'}
        </p>
        <p className="text-sm font-semibold text-slate-900">{revieweeName}</p>
      </div>

      {/* Rating general */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
          Calificacion general
        </label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      {/* Sub-ratings — solo para abogados */}
      {isForLawyer && (
        <div className="space-y-2 p-4 bg-[#F9F9F8] rounded-lg">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Detalle</p>
          <SubRating label="Comunicacion" value={comm} onChange={setComm} />
          <SubRating label="Conocimiento legal" value={exp} onChange={setExp} />
          <SubRating label="Relacion precio/calidad" value={val} onChange={setVal} />
          <SubRating label="Tiempo de respuesta" value={resp} onChange={setResp} />
        </div>
      )}

      {/* Comentario */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
          Comentario
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder={isForLawyer
            ? 'Contanos tu experiencia con este abogado...'
            : 'Contanos tu experiencia trabajando con este cliente...'}
          className="w-full border border-[#EAEAEA] rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 resize-none"
        />
        <p className="text-xs text-slate-400 text-right">{comment.length}/500</p>
      </div>

      {error && (
        <p className="text-xs text-red-600 px-3 py-2 bg-red-50 rounded-lg">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all"
        style={{ backgroundColor: '#111111' }}
      >
        {loading ? 'Enviando...' : 'Enviar valoracion'}
      </button>

      <p className="text-xs text-slate-400 text-center">
        Tu valoracion se revela cuando la otra parte tambien califique, o despues de 7 dias. Una vez revelada no puede modificarse.
      </p>
    </form>
  )
}
