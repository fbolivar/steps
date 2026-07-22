import { cn } from '@/shared/lib/utils'

type Corner = 'tl' | 'tr' | 'bl' | 'br'

/**
 * Motivo de triángulo de la marca STEPS (presente en el brochure). Elemento
 * gráfico recurrente para esquinas de secciones y dividers.
 */
export function Triangle({
  corner = 'tr',
  className,
  size = 96,
  color = 'accent',
}: {
  corner?: Corner
  className?: string
  size?: number
  color?: 'accent' | 'primary' | 'secondary'
}) {
  // text-* define currentColor, que usan los borderColor de abajo.
  const colorClass =
    color === 'accent'
      ? 'text-brand-accent'
      : color === 'primary'
        ? 'text-brand-primary'
        : 'text-brand-secondary'

  // Coloca el triángulo relleno según la esquina.
  const styleByCorner: Record<Corner, React.CSSProperties> = {
    tl: { borderWidth: `${size}px ${size}px 0 0`, borderColor: 'currentColor transparent transparent transparent' },
    tr: { borderWidth: `0 ${size}px ${size}px 0`, borderColor: 'transparent currentColor transparent transparent' },
    bl: { borderWidth: `${size}px 0 0 ${size}px`, borderColor: 'transparent transparent transparent currentColor' },
    br: { borderWidth: `0 0 ${size}px ${size}px`, borderColor: 'transparent transparent currentColor transparent' },
  }
  const posByCorner: Record<Corner, string> = {
    tl: 'left-0 top-0',
    tr: 'right-0 top-0',
    bl: 'left-0 bottom-0',
    br: 'right-0 bottom-0',
  }

  return (
    <span
      aria-hidden="true"
      className={cn('pointer-events-none absolute h-0 w-0', posByCorner[corner], colorClass, className)}
      style={{ ...styleByCorner[corner], color: 'inherit' }}
    />
  )
}
