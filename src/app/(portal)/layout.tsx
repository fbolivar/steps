import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Inbox, Building2, Settings } from 'lucide-react'
import { getPortalContext, canManageQuotes } from '@/features/auth/services/session'
import { logoutAction } from '@/features/auth/services/actions'
import { Logo } from '@/shared/components/logo'
import { Container } from '@/shared/components/layout-primitives'
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getPortalContext()
  if (!ctx) redirect('/login')
  if (!canManageQuotes(ctx.role)) {
    // editor_contenido u otros roles sin acceso a cotizaciones.
    redirect('/')
  }

  const roleLabel =
    ctx.role === 'super_admin'
      ? 'Super Admin'
      : ctx.role === 'tenant_admin'
        ? 'Administrador'
        : 'Agente'

  const navItems = [
    { href: '/portal', label: 'Cotizaciones', icon: Inbox, show: true },
    {
      href: '/portal/configuracion',
      label: 'Configuración',
      icon: Settings,
      show: ctx.role === 'tenant_admin' || ctx.role === 'super_admin',
    },
    { href: '/admin', label: 'Tenants', icon: Building2, show: ctx.role === 'super_admin' },
  ].filter((i) => i.show)

  const navItemClass =
    'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy-900/70 hover:bg-brand-primary/5 hover:text-brand-primary'

  return (
    <div className="min-h-screen bg-brand-primary/5">
      <header className="sticky top-0 z-40 border-b border-navy-900/10 bg-white">
        <Container className="flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-6">
            <Logo tenant={ctx.tenant} />
            <nav className="hidden items-center gap-1 sm:flex">
              {navItems.map((i) => (
                <Link key={i.href} href={i.href} className={navItemClass}>
                  <i.icon className="h-4 w-4" /> {i.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-[180px] truncate text-sm font-medium text-navy-900">{ctx.fullName ?? ctx.email}</p>
              <p className="truncate text-xs text-navy-900/50">
                {roleLabel} · {ctx.tenant.nombre_comercial}
              </p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-navy-900/15 px-3 py-2 text-sm font-medium text-navy-900/70 hover:bg-navy-900/5"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </div>
        </Container>

        {/* Nav móvil: fila desplazable */}
        <nav className="flex gap-1 overflow-x-auto border-t border-navy-900/5 px-3 py-2 sm:hidden">
          {navItems.map((i) => (
            <Link key={i.href} href={i.href} className={navItemClass}>
              <i.icon className="h-4 w-4" /> {i.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="py-6 sm:py-8">
        <Container>{children}</Container>
      </main>
    </div>
  )
}
