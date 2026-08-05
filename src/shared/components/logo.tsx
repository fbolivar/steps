import Link from 'next/link'
import { cn } from '@/shared/lib/utils'
import { StepsIsotipo, StepsLockup, StepsWordmark } from './brand-marks'
import type { Tenant } from '@/shared/lib/tenant'

/**
 * Logotipo del tenant.
 *
 * Para STEPS SEGUROS se usa el vector OFICIAL del manual de identidad
 * (`brand-marks.tsx`), en sus versiones aprobadas:
 *   - `horizontal` (por defecto): huella + TEPS/SEGUROS. Cabeceras y barras.
 *   - `vertical`: huella encima del logotipo apilado. Piezas centradas (pie,
 *     portadas, pantallas de autenticacion).
 *   - `isotipo`: solo la huella. Espacios muy reducidos.
 *
 * Para otros tenants (marca blanca) se muestra su `logo_url` y, si no la
 * tienen, un wordmark tipografico neutro. Nunca se les aplica el vector STEPS.
 */
export function Logo({
  tenant,
  className,
  onDark = false,
  variant = 'horizontal',
}: {
  tenant: Pick<Tenant, 'nombre_comercial' | 'logo_url' | 'slug'>
  className?: string
  onDark?: boolean
  variant?: 'horizontal' | 'vertical' | 'isotipo'
}) {
  const color = onDark ? 'text-white' : 'text-brand-primary'

  return (
    <Link
      href="/"
      className={cn('inline-flex items-center', color, className)}
      aria-label={tenant.nombre_comercial}
    >
      <LogoMark tenant={tenant} variant={variant} onDark={onDark} />
    </Link>
  )
}

/** El mismo logotipo sin enlace (para pies de pagina, PDFs, correos). */
export function LogoMark({
  tenant,
  variant = 'horizontal',
  onDark = false,
}: {
  tenant: Pick<Tenant, 'nombre_comercial' | 'logo_url' | 'slug'>
  variant?: 'horizontal' | 'vertical' | 'isotipo'
  onDark?: boolean
}) {
  if (tenant.logo_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={tenant.logo_url} alt={tenant.nombre_comercial} className="h-10 w-auto" />
  }

  if (tenant.slug === 'steps') {
    if (variant === 'isotipo') {
      return <StepsIsotipo className="h-9 w-auto" title={tenant.nombre_comercial} />
    }
    if (variant === 'vertical') {
      return (
        <span className="inline-flex flex-col items-center gap-2">
          <StepsIsotipo className="h-11 w-auto" />
          <StepsWordmark className="h-8 w-auto" title={tenant.nombre_comercial} />
        </span>
      )
    }
    return <StepsLockup className="h-12 w-auto" title={tenant.nombre_comercial} />
  }

  return <FallbackWordmark name={tenant.nombre_comercial} onDark={onDark} />
}

/** Wordmark tipografico para tenants de marca blanca sin logo cargado. */
function FallbackWordmark({ name, onDark }: { name: string; onDark: boolean }) {
  const [first, ...rest] = name.split(' ')
  const sub = rest.join(' ')

  return (
    <span className="inline-flex flex-col leading-none">
      <span className="font-display text-3xl uppercase tracking-display">{first}</span>
      {sub && (
        <span
          className={cn(
            'text-[0.6rem] font-medium uppercase tracking-wordmark',
            onDark ? 'text-brand-soft' : 'text-brand-accent'
          )}
        >
          {sub}
        </span>
      )}
    </span>
  )
}
