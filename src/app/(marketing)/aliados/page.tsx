import type { Metadata } from 'next'
import { Container, Section } from '@/shared/components/layout-primitives'
import { PageHero } from '@/shared/components/page-hero'
import { PHOTO } from '@/shared/lib/photos'
import { PARTNERS } from '@/shared/constants/site'

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
                key={p}
                className="card-soft flex min-h-[96px] items-center justify-center p-6 text-center transition-colors hover:border-brand-accent/40"
              >
                <span className="font-semibold text-navy-600">{p}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-navy-400">
            Logotipos oficiales pendientes de recibir del cliente en formato vectorial (marca registrada de cada
            aseguradora).
          </p>
        </Container>
      </Section>
    </>
  )
}
