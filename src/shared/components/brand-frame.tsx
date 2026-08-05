import { cn } from '@/shared/lib/utils'

/**
 * Motivo grafico secundario del manual de identidad: el marco en "L" cobalt
 * acompanado de la reticula de puntos (2 columnas x 6 filas, degradando de
 * cobalt a azul profundo y a gris azulado).
 *
 * En el manual aparece en la esquina superior derecha de cada lamina. Aqui se
 * usa igual: como firma discreta en encabezados y secciones destacadas.
 */
export function BrandCorner({
  className,
  onDark = false,
}: {
  className?: string
  onDark?: boolean
}) {
  return (
    <span
      aria-hidden="true"
      className={cn('pointer-events-none absolute right-0 top-0 hidden select-none sm:block', className)}
    >
      <span className="relative block h-28 w-40">
        {/* Marco en "L": linea vertical + linea horizontal inferior. */}
        <span
          className={cn(
            'absolute bottom-0 left-0 top-0 w-[3px]',
            onDark ? 'bg-brand-soft/60' : 'bg-brand-accent'
          )}
        />
        <span
          className={cn(
            'absolute bottom-0 left-0 right-0 h-[3px]',
            onDark ? 'bg-brand-soft/60' : 'bg-brand-accent'
          )}
        />
        <DotGrid className="absolute right-4 top-2" onDark={onDark} />
      </span>
    </span>
  )
}

/** Reticula 2x6 del manual: 2 filas cobalt, 2 azul profundo, 2 gris azulado. */
export function DotGrid({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  const rows = onDark
    ? ['bg-white', 'bg-white/80', 'bg-brand-soft', 'bg-brand-soft/70', 'bg-brand-soft/40', 'bg-brand-soft/25']
    : ['bg-brand-accent', 'bg-brand-accent', 'bg-brand-primary', 'bg-brand-primary', 'bg-steel', 'bg-steel']

  return (
    <span aria-hidden="true" className={cn('grid grid-cols-2 gap-[3px]', className)}>
      {rows.flatMap((tone, row) => [
        <span key={`${row}-a`} className={cn('h-[5px] w-[5px]', tone)} />,
        <span key={`${row}-b`} className={cn('h-[5px] w-[5px]', tone)} />,
      ])}
    </span>
  )
}

/**
 * Banda de huellas: repite el isotipo como marca de agua sobre fondos de
 * marca. Equivale a las portadas del manual (huella gigante en trazo).
 */
export function FootprintWatermark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('texture-huellas pointer-events-none absolute inset-0 opacity-[0.07]', className)}
    />
  )
}
