import { ImageIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

/**
 * Marcador de imagen. Sustituye a una foto real (que aporta el cliente) con un
 * degradado teal agradable. Cuando lleguen las fotos, reemplazar por <Image />.
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
  /** Foto temporal (Picsum). El degradado teal queda de fallback si falla. */
  src?: string
  alt?: string
}) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent',
        rounded,
        className
      )}
      aria-hidden={alt ? undefined : 'true'}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {/* patrón sutil (solo cuando no hay foto) */}
      {!src && (
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1.5px), radial-gradient(circle at 70% 60%, white 1px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />
      )}
      {showLabel && !src && (
        <div className="relative flex flex-col items-center gap-2 text-white/70">
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
      )}
    </div>
  )
}
