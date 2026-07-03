'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { startConversation } from '@/app/abogados/[slug]/actions'

interface ContactButtonProps {
  lawyerUserId: string
  className?: string
  children?: React.ReactNode
}

export function ContactButton({ lawyerUserId, className, children }: ContactButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    setLoading(true)
    const { convId, error } = await startConversation(lawyerUserId)

    if (error === 'not_authenticated') {
      router.push('/iniciar-sesion')
      return
    }
    if (error === 'self_contact') {
      setLoading(false)
      return
    }
    if (convId) {
      router.push(`/dashboard/mensajes?conv=${convId}`)
      return
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <MessageSquare className="h-4 w-4 shrink-0" />
      )}
      {children ?? 'Enviar mensaje'}
    </button>
  )
}
