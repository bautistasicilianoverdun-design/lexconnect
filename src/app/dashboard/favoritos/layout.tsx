import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'lawyer' || profile?.role === 'firm_admin') redirect('/dashboard')

  return <>{children}</>
}
