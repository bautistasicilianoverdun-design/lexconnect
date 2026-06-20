import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/dashboard/profile-form'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/iniciar-sesion')

  const [{ data: profile }, { count: casesCount }, { count: proposalsCount }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, phone, bio, city, province_id, role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('legal_cases')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id),
    supabase
      .from('case_proposals')
      .select('legal_cases!inner(client_id)', { count: 'exact', head: true })
      .eq('legal_cases.client_id', user.id),
  ])

  if (!profile) redirect('/iniciar-sesion')

  return (
    <ProfileForm
      profile={{
        ...profile,
        email: user.email ?? '',
        cases_count: casesCount ?? 0,
        proposals_count: proposalsCount ?? 0,
      }}
    />
  )
}
