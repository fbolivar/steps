import type { Metadata } from 'next'
import { getActiveTenant } from '@/shared/lib/tenant'
import { getInsuranceLines } from '@/features/site/services/content'
import { QuoteForm } from '@/features/quotes/components/quote-form'
import { Container, Section, Eyebrow } from '@/shared/components/layout-primitives'
import { BrandCorner, FootprintWatermark } from '@/shared/components/brand-frame'

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
      <section className="brand-gradient relative overflow-hidden py-16">
        <FootprintWatermark />
        <BrandCorner onDark className="right-8 top-8" />
        <Container className="relative">
          <Eyebrow onDark>Cotización</Eyebrow>
          <h1 className="mt-4 max-w-2xl text-5xl sm:text-6xl">Solicita tu cotización</h1>
          <p className="mt-4 max-w-xl text-white/75">
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
