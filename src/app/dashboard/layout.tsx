'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, MessageSquare, User,
  Search, Star, Bell, ChevronRight, LogOut, Settings,
  Briefcase, BarChart2, BookOpen,
} from 'lucide-react'

const CLIENT_NAV = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/mis-casos', label: 'Mis casos', icon: FileText },
  { href: '/dashboard/mensajes', label: 'Mensajes', icon: MessageSquare, badge: 3 },
  { href: '/dashboard/favoritos', label: 'Favoritos', icon: Star },
  { href: '/dashboard/perfil', label: 'Mi perfil', icon: User },
]

const LAWYER_NAV = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/casos-disponibles', label: 'Casos disponibles', icon: Search, badge: 6 },
  { href: '/dashboard/mis-propuestas', label: 'Mis propuestas', icon: Briefcase },
  { href: '/dashboard/mensajes', label: 'Mensajes', icon: MessageSquare, badge: 3 },
  { href: '/dashboard/estadisticas', label: 'Estadísticas', icon: BarChart2 },
  { href: '/dashboard/perfil', label: 'Mi perfil', icon: User },
]

// Mock: toggle with ?rol=abogado in the URL in a real app, here hardcoded to client for demo
// In production this comes from session/auth context
const MOCK_ROLE = 'cliente' // 'cliente' | 'abogado'
const MOCK_USER = {
  name: 'María González',
  email: 'maria.gonzalez@gmail.com',
  avatar: 'MG',
  plan: 'Gratuito',
}

function NavItem({
  href, label, icon: Icon, badge, exact,
}: { href: string; label: string; icon: React.ElementType; badge?: number; exact?: boolean }) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href) && href !== '/dashboard'
    || (href === '/dashboard' && pathname === '/dashboard')

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const nav = MOCK_ROLE === 'abogado' ? LAWYER_NAV : CLIENT_NAV

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">LexConnect</span>
          </Link>
        </div>

        {/* User card */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
              {MOCK_USER.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{MOCK_USER.name}</p>
              <p className="text-xs text-slate-400 truncate">Plan {MOCK_USER.plan}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-slate-100 p-4 space-y-1">
          <Link
            href="/dashboard/configuracion"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            Configuración
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            <LogOut className="h-4 w-4 text-slate-400" />
            Cerrar sesión
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile + desktop) */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile: logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">LexConnect</span>
          </Link>

          <div className="hidden lg:block">
            <p className="text-sm text-slate-400">Bienvenida, <span className="font-semibold text-slate-900">{MOCK_USER.name}</span></p>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
              <Bell className="h-4 w-4 text-slate-500" />
              <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">2</span>
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
              {MOCK_USER.avatar}
            </div>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex">
          {nav.slice(0, 4).map(({ href, label, icon: Icon, badge }) => (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center gap-0.5 py-2 text-slate-500 hover:text-blue-600 transition-colors relative">
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{label}</span>
              {badge ? (
                <span className="absolute top-1 right-1/4 h-4 w-4 flex items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                  {badge}
                </span>
              ) : null}
            </Link>
          ))}
          <Link href="/dashboard/perfil" className="flex-1 flex flex-col items-center gap-0.5 py-2 text-slate-500 hover:text-blue-600 transition-colors">
            <User className="h-5 w-5" />
            <span className="text-[10px]">Perfil</span>
          </Link>
        </nav>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
