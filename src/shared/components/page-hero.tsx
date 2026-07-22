import { Container, Eyebrow } from './layout-primitives'
import { ImagePlaceholder } from './image-placeholder'

/**
 * Hero consistente para páginas internas: foto de fondo + overlay teal +
 * pastilla + título. Mismo lenguaje visual que la home.
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
    <section className="relative overflow-hidden">
      <ImagePlaceholder rounded="rounded-none" showLabel={false} src={photoSrc} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-primary/90 to-brand-primary/70" />
      <Container className="relative py-20 text-white sm:py-24">
        {children}
        {eyebrow && <Eyebrow onDark>{eyebrow}</Eyebrow>}
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-5 max-w-2xl text-lg text-white/75">{subtitle}</p>}
      </Container>
    </section>
  )
}
