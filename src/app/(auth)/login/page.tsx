import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Logo } from '@/shared/components/logo'
import { LoginForm } from '@/features/auth/components/login-form'
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-mist px-4">
      <span aria-hidden="true" className="texture-huellas absolute inset-0 text-brand-primary opacity-[0.05]" />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-steel bg-white p-8 shadow-card sm:p-10">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-brand-accent" />
        <div className="mb-8">
          <Logo tenant={tenant} variant="vertical" className="mx-auto flex w-fit" />
          <h1 className="mt-6 text-center text-3xl text-navy-900">Portal de agentes</h1>
          <p className="mt-1 text-center text-sm text-navy-600">Ingresa para gestionar tus cotizaciones.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
