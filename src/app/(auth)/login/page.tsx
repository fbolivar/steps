import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Logo } from '@/shared/components/logo'
import { LoginForm } from '@/features/auth/components/login-form'
import { Triangle } from '@/shared/components/triangle'
import { getActiveTenant } from '@/shared/lib/tenant'
import { getPortalContext } from '@/features/auth/services/session'

export const metadata: Metadata = {
  title: 'Portal de agentes',
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  // Si ya hay sesión válida en el tenant, ir directo al portal.
  const ctx = await getPortalContext()
  if (ctx) redirect('/portal')

  const tenant = await getActiveTenant()

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-card sm:p-10">
        <Triangle corner="tr" size={64} color="accent" className="opacity-70" />
        <div className="mb-8">
          <Logo tenant={tenant} />
          <h1 className="mt-6 text-2xl font-bold text-navy-900">Portal de agentes</h1>
          <p className="mt-1 text-sm text-navy-900/60">Ingresa para gestionar tus cotizaciones.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
