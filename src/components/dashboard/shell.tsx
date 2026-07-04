'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, FileText, MessageSquare, User,
  Search, Star, LogOut, Settings,
  Briefcase, BarChart2, BookOpen, Shield, CreditCard, CheckCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from '@/components/layout/notification-bell'

const CLIENT_NAV = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/mis-casos', label: 'Mis casos', icon: FileText },
  { href: '/dashboard/mensajes', label: 'Mensajes', icon: MessageSquare },
  { href: '/dashboard/favoritos', label: 'Favoritos', icon: Star },
  { href: '/dashboard/valoraciones', label: 'Valoraciones', icon: Star },
  { href: '/dashboard/perfil', label: 'Mi perfil', icon: User },
]

const LAWYER_NAV = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/onboarding', label: 'Completar perfil', icon: CheckCircle },
  { href: '/dashboard/casos-disponibles', label: 'Casos disponibles', icon: Search },
  { href: '/dashboard/mis-propuestas', label: 'Mis propuestas', icon: Briefcase },
  { href: '/dashboard/mis-articulos', label: 'Mis articulos', icon: BookOpen },
  { href: '/dashboard/mensajes', label: 'Mensajes', icon: MessageSquare },
  { href: '/dashboard/estadisticas', label: 'Estadísticas', icon: BarChart2 },
  { href: '/dashboard/valoraciones', label: 'Valoraciones', icon: Star },
  { href: '/dashboard/suscripcion', label: 'Suscripción', icon: CreditCard },
  { href: '/dashboard/verificacion', label: 'Verificación', icon: Shield },
  { href: '/dashboard/perfil', label: 'Mi perfil', icon: User },
]

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function NavItem({
  href, label, icon: Icon, badge, exact,
}: { href: string; label: string; icon: React.ElementType; badge?: number; exact?: boolean }) {
  const pathname = usePathname()
  const active = exact
    ? pathname === href
    : (pathname.startsWith(href) && href !== '/dashboard') || (href === '/dashboard' && pathname === '/dashboard')

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  )
}

export type ShellProfile = {
  full_name: string
  role: string
  avatar_url: string | null
}

export default function DashboardShell({
  profile,
  email,
  children,
}: {
  profile: ShellProfile
  email: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const isLawyer = profile.role === 'lawyer' || profile.role === 'firm_admin'
  const isAdmin = profile.role === 'admin'
  const nav = isAdmin
    ? [...CLIENT_NAV, { href: '/dashboard/admin', label: 'Administracion', icon: Shield }]
    : isLawyer ? LAWYER_NAV : CLIENT_NAV
  const avatar = getInitials(profile.full_name || email || 'U')
  const roleLabel = profile.role === 'lawyer' ? 'Abogado' : profile.role === 'firm_admin' ? 'Estudio' : profile.role === 'admin' ? 'Admin' : 'Cliente'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">LexConnect</span>
          </Link>
        </div>

        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
              {avatar}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{profile.full_name}</p>
              <p className="text-xs text-slate-400 truncate">{roleLabel}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4 space-y-1">
          <Link
            href="/dashboard/configuracion"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            Configuración
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            <LogOut className="h-4 w-4 text-slate-400" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">LexConnect</span>
          </Link>
          <div className="hidden lg:block">
            <p className="text-sm text-slate-400">
              Bienvenido/a, <span className="font-semibold text-slate-900">{profile.full_name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
              {avatar}
            </div>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex">
          {nav.slice(0, 4).map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center gap-0.5 py-2 text-slate-500 hover:text-blue-600 transition-colors">
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{label}</span>
            </Link>
          ))}
          <Link href="/dashboard/perfil" className="flex-1 flex flex-col items-center gap-0.5 py-2 text-slate-500 hover:text-blue-600 transition-colors">
            <User className="h-5 w-5" />
            <span className="text-[10px]">Perfil</span>
          </Link>
        </nav>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
