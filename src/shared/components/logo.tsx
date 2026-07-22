import Link from 'next/link'
import { cn } from '@/shared/lib/utils'
import type { Tenant } from '@/shared/lib/tenant'

/**
 * Wordmark de marca. Para STEPS se renderiza el logotipo tipográfico
 * ("STEPS" condensado + "SEGUROS" con tracking amplio).
 *
 * NOTA (marca): cuando el cliente entregue el vector oficial (AI/SVG) del
 * logo, reemplazar este wordmark por <Image src={tenant.logo_url} />. No
 * redibujar el logo a mano.
 */
export function Logo({
  tenant,
  className,
  onDark = false,
}: {
  tenant: Pick<Tenant, 'nombre_comercial' | 'logo_url' | 'slug'>
  className?: string
  onDark?: boolean
}) {
  const [name, ...rest] = tenant.nombre_comercial.split(' ')
  const sub = rest.join(' ')

  return (
    <Link href="/" className={cn('inline-flex flex-col leading-none', className)} aria-label={tenant.nombre_comercial}>
      {tenant.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={tenant.logo_url} alt={tenant.nombre_comercial} className="h-9 w-auto" />
      ) : (
        <>
          <span
            className={cn(
              'font-heading text-2xl font-bold uppercase tracking-tight',
              onDark ? 'text-white' : 'text-brand-primary'
            )}
          >
            {name}
          </span>
          {sub && (
            <span
              className={cn(
                'text-[0.6rem] font-medium uppercase tracking-[0.42em]',
                onDark ? 'text-brand-accent' : 'text-brand-secondary'
              )}
            >
              {sub}
            </span>
          )}
        </>
      )}
    </Link>
  )
}
