import type { Metadata } from 'next'
import { Container, Section, Eyebrow } from '@/shared/components/layout-primitives'
import { Triangle } from '@/shared/components/triangle'
import { PARTNERS } from '@/shared/constants/site'

export const metadata: Metadata = { title: 'Aliados' }

export default function AliadosPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-brand-primary py-20 text-white">
        <Triangle corner="tr" size={160} color="accent" className="opacity-30" />
        <Container>
          <Eyebrow onDark>Respaldo</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold sm:text-5xl">Nuestras aseguradoras aliadas</h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70">
            Representamos a más de 15 compañías líderes del mercado. Eso nos permite comparar y elegir la mejor
            alternativa para cada necesidad, sin atarte a una sola marca.
          </p>
        </Container>
      </section>

      <Section>
        <Container>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {PARTNERS.map((p) => (
              <div
                key={p}
                className="card-triangle flex min-h-[96px] items-center justify-center p-6 text-center"
              >
                <span className="font-semibold text-navy-900/70">{p}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-navy-900/50">
            Logotipos oficiales pendientes de recibir del cliente en formato vectorial (marca registrada de cada
            aseguradora).
          </p>
        </Container>
      </Section>
    </>
  )
}
