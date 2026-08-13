import type { Metadata } from 'next'
import { Container, Section } from '@/shared/components/layout-primitives'
import { PageHero } from '@/shared/components/page-hero'
import { PHOTO } from '@/shared/lib/photos'
import { PARTNERS } from '@/shared/constants/site'
import { PartnerLogo } from '@/features/site/components/partner-logo'

export const metadata: Metadata = { title: 'Aliados' }

export default function AliadosPage() {
  return (
    <>
      <PageHero
        eyebrow="Respaldo"
        title="Nuestras aseguradoras aliadas"
        subtitle="Representamos a más de 15 compañías líderes del mercado. Eso nos permite comparar y elegir la mejor alternativa para cada necesidad, sin atarte a una sola marca."
        photoSrc={PHOTO.aliados}
      />

      <Section>
        <Container>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {PARTNERS.map((p) => (
              <div
                key={p.logo}
                className="card-soft flex min-h-[136px] items-center justify-center p-5 text-center transition-colors hover:border-brand-accent/40"
              >
                <PartnerLogo partner={p} baseHeight={48} />
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  )
}
