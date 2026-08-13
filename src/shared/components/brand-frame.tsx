import { cn } from '@/shared/lib/utils'

/**
 * Motivos graficos de apoyo de la marca.
 *
 * NOTA: el marco en "L" cobalt con la reticula de puntos (que en el manual
 * aparece en la esquina de cada lamina) se retiro del sitio: sobre las fotos
 * de los heroes ensuciaba la imagen. Si alguna vez se recupera, esta en el
 * historial de git.
 */

/**
 * Banda de huellas: repite el isotipo como marca de agua sobre fondos de
 * marca. Equivale a las portadas del manual (huella gigante en trazo).
 *
 * Toma el color del texto del contenedor (`currentColor`), asi que sirve tanto
 * sobre azul profundo como sobre fondos claros.
 */
export function FootprintWatermark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('texture-huellas pointer-events-none absolute inset-0 opacity-[0.07]', className)}
    />
  )
}
