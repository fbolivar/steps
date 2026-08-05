import { Container, Eyebrow } from './layout-primitives'
import { ImagePlaceholder } from './image-placeholder'
import { BrandCorner, FootprintWatermark } from './brand-frame'

/**
 * Hero de paginas internas. Sigue las portadas del manual: foto + velo de azul
 * profundo, huellas en marca de agua y el marco en "L" con la reticula de
 * puntos en la esquina superior derecha.
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  photoSrc,
  children,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  photoSrc?: string
  children?: React.ReactNode
}) {
  return (
    <section className="relative overflow-hidden bg-brand-primary">
      <ImagePlaceholder rounded="rounded-none" showLabel={false} src={photoSrc} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-primary/92 to-brand-primary/60" />
      <FootprintWatermark />
      <BrandCorner onDark className="right-8 top-8" />
      <Container className="relative py-20 text-white sm:py-24">
        {children}
        {eyebrow && <Eyebrow onDark>{eyebrow}</Eyebrow>}
        <h1 className="mt-5 max-w-3xl text-5xl leading-[0.98] sm:text-6xl">{title}</h1>
        {subtitle && <p className="mt-5 max-w-2xl text-lg text-white/75">{subtitle}</p>}
      </Container>
    </section>
  )
}
