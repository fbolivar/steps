import type { Metadata } from 'next'
import { getActiveTenant } from '@/shared/lib/tenant'
import { getInsuranceLines } from '@/features/site/services/content'
import { QuoteForm } from '@/features/quotes/components/quote-form'
import { Container, Section, Eyebrow } from '@/shared/components/layout-primitives'
import { Triangle } from '@/shared/components/triangle'

export const metadata: Metadata = { title: 'Cotizar' }

export default async function CotizarPage({
  searchParams,
}: {
  searchParams: Promise<{ linea?: string; segmento?: string }>
}) {
  const { linea, segmento } = await searchParams
  const tenant = await getActiveTenant()
  const lines = await getInsuranceLines(tenant.id)

  const options = lines.map((l) => ({ slug: l.slug, name: l.name, segment: l.segment }))
  const prefillSegment = segmento === 'empresas' ? 'empresas' : segmento === 'personas' ? 'personas' : undefined

  return (
    <>
      <section className="relative overflow-hidden bg-brand-primary py-16 text-white">
        <Triangle corner="tr" size={140} color="accent" className="opacity-30" />
        <Container>
          <Eyebrow onDark>Cotización</Eyebrow>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold sm:text-5xl">Solicita tu cotización</h1>
          <p className="mt-4 max-w-xl text-white/70">
            Tres pasos y listo. Un asesor te contacta con la mejor alternativa. Sin cifras automáticas: atención
            humana de principio a fin.
          </p>
        </Container>
      </section>

      <Section>
        <Container>
          <QuoteForm
            tenantSlug={tenant.slug}
            lines={options}
            prefillLine={linea}
            prefillSegment={prefillSegment}
          />
        </Container>
      </Section>
    </>
  )
}
