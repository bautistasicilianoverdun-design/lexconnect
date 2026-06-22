'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Scale, ChevronDown, Bell, MessageSquare, Search } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, getInitials } from '@/lib/utils'

type UserData = {
  full_name: string
  avatar_url?: string | null
  role: string
}

interface HeaderProps {
  user?: UserData | null
}

export function Header({ user: userProp }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [sessionUser, setSessionUser] = useState<UserData | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setSessionUser(null); return }
      const { data } = await supabase
        .from('profiles')
        .select('full_name, role, avatar_url')
        .eq('id', session.user.id)
        .single()
      if (data) setSessionUser(data)
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) { setSessionUser(null); return }
      supabase.from('profiles').select('full_name, role, avatar_url').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setSessionUser(data) })
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    setSessionUser(null)
    router.push('/')
    router.refresh()
  }

  const user = userProp ?? sessionUser

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <span>Lex<span className="text-primary">Connect</span></span>
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/abogados">Abogados</NavLink>
            <NavLink href="/estudios">Estudios</NavLink>
            <NavLink href="/casos">Casos</NavLink>
            <NavLink href="/como-funciona">Cómo funciona</NavLink>
            <NavLink href="/precios">Precios</NavLink>
            {user && <NavLink href="/dashboard">Mi perfil</NavLink>}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/buscar">
                    <Search className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/dashboard/mensajes">
                    <MessageSquare className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/notificaciones">
                    <Bell className="h-4 w-4" />
                  </Link>
                </Button>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.full_name} />}
                      <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-background shadow-lg py-1 z-50">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-sm font-medium">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {user.role === 'lawyer' ? 'Abogado' : user.role === 'client' ? 'Cliente' : 'Estudio'}
                        </p>
                      </div>
                      <UserMenuItem href="/dashboard">Mi Panel</UserMenuItem>
                      <UserMenuItem href="/dashboard/perfil">Mi Perfil</UserMenuItem>
                      {user.role === 'lawyer' && (
                        <UserMenuItem href="/dashboard/casos-disponibles">Casos disponibles</UserMenuItem>
                      )}
                      {user.role === 'client' && (
                        <UserMenuItem href="/dashboard/mis-casos">Mis Casos</UserMenuItem>
                      )}
                      <UserMenuItem href="/dashboard/configuracion">Configuración</UserMenuItem>
                      <div className="border-t border-border mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                  <Link href="/iniciar-sesion">Iniciar sesión</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/registro">Registrarse</Link>
                </Button>
              </>
            )}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          <MobileNavLink href="/abogados" onClick={() => setMobileOpen(false)}>Abogados</MobileNavLink>
          <MobileNavLink href="/estudios" onClick={() => setMobileOpen(false)}>Estudios</MobileNavLink>
          <MobileNavLink href="/casos" onClick={() => setMobileOpen(false)}>Casos</MobileNavLink>
          <MobileNavLink href="/como-funciona" onClick={() => setMobileOpen(false)}>Cómo funciona</MobileNavLink>
          <MobileNavLink href="/precios" onClick={() => setMobileOpen(false)}>Precios</MobileNavLink>
          {user && (
            <MobileNavLink href="/dashboard" onClick={() => setMobileOpen(false)}>Mi perfil</MobileNavLink>
          )}
          {!user && (
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/iniciar-sesion">Iniciar sesión</Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href="/registro">Registrarse</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/' && pathname.startsWith(href))
  return (
    <Link
      href={href}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'text-foreground bg-muted font-semibold'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/' && pathname.startsWith(href))
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
        active ? 'text-foreground bg-muted font-semibold' : 'text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </Link>
  )
}

function UserMenuItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block px-3 py-2 text-sm hover:bg-muted transition-colors">
      {children}
    </Link>
  )
}
