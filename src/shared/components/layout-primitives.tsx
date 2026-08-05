import { cn } from '@/shared/lib/utils'

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>{children}</div>
}

/**
 * Seccion con los cuatro fondos de la paleta del manual:
 *   white    → blanco puro
 *   mist     → gris azulado diluido (superficie calma)
 *   steel    → gris azulado de marca
 *   dark     → azul profundo
 *   gradient → degradado cobalt → azul profundo (piezas destacadas)
 */
export function Section({
  className,
  children,
  variant = 'white',
  dark = false,
  id,
}: {
  className?: string
  children: React.ReactNode
  variant?: 'white' | 'mist' | 'steel' | 'dark' | 'gradient'
  dark?: boolean
  id?: string
}) {
  const v = dark ? 'dark' : variant
  const bg =
    v === 'dark'
      ? 'bg-brand-primary text-white'
      : v === 'gradient'
        ? 'brand-gradient'
        : v === 'steel'
          ? 'bg-steel text-navy-900'
          : v === 'mist'
            ? 'bg-mist text-navy-900'
            : 'bg-white text-navy-900'
  return (
    <section id={id} className={cn('relative py-16 sm:py-24', bg, className)}>
      {children}
    </section>
  )
}

/**
 * Etiqueta de seccion. Retoma el cuadrado de la reticula de puntos del manual
 * (nada de circulos: la marca es de modulos cuadrados y capsulas).
 */
export function Eyebrow({
  children,
  className,
  onDark = false,
}: {
  children: React.ReactNode
  className?: string
  onDark?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]',
        onDark
          ? 'border border-white/25 bg-white/10 text-white'
          : 'border border-brand-primary/15 bg-brand-accent/[0.06] text-brand-primary',
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5', onDark ? 'bg-brand-soft' : 'bg-brand-accent')} />
      {children}
    </span>
  )
}
