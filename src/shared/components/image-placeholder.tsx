import { ImageIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

/**
 * Marcador de imagen. Sustituye a una foto real (que aporta el cliente) con el
 * degradado de marca (cobalt → azul profundo). Cuando lleguen las fotos
 * definitivas, reemplazar por <Image />.
 */
export function ImagePlaceholder({
  className,
  label = 'Foto',
  rounded = 'rounded-2xl',
  showLabel = true,
  src,
  alt = '',
}: {
  className?: string
  label?: string
  rounded?: string
  showLabel?: boolean
  /** Foto real. El degradado de marca queda de fallback si falla. */
  src?: string
  alt?: string
}) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-brand-gradient',
        rounded,
        className
      )}
      aria-hidden={alt ? undefined : 'true'}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {/* Huellas de marca (solo cuando no hay foto) */}
      {!src && <div className="texture-huellas absolute inset-0 text-white opacity-[0.14]" />}
      {showLabel && !src && (
        <div className="relative flex flex-col items-center gap-2 text-white/70">
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
      )}
    </div>
  )
}
