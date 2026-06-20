import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/dashboard/shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/iniciar-sesion')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <DashboardShell
      profile={profile ?? { full_name: user.email ?? 'Usuario', role: 'client', avatar_url: null }}
      email={user.email ?? ''}
    >
      {children}
    </DashboardShell>
  )
}
