import { cn } from '@/shared/lib/utils'

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>{children}</div>
}

export function Section({
  className,
  children,
  variant = 'white',
  dark = false,
  id,
}: {
  className?: string
  children: React.ReactNode
  variant?: 'white' | 'mist' | 'dark'
  dark?: boolean
  id?: string
}) {
  const v = dark ? 'dark' : variant
  const bg =
    v === 'dark'
      ? 'bg-brand-primary text-white'
      : v === 'mist'
        ? 'bg-mist text-navy-900'
        : 'bg-white text-navy-900'
  return (
    <section id={id} className={cn('relative py-16 sm:py-24', bg, className)}>
      {children}
    </section>
  )
}

/** Etiqueta de sección en pastilla (estilo Dignity). onDark = borde/texto claros. */
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
        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide',
        onDark ? 'border border-white/25 bg-white/5 text-white' : 'border border-brand-primary/20 bg-brand-primary/[0.04] text-brand-primary',
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', onDark ? 'bg-brand-accent' : 'bg-brand-accent')} />
      {children}
    </span>
  )
}
