import type { Metadata } from 'next'
import { getActiveTenant } from '@/shared/lib/tenant'
import { getInsuranceLines } from '@/features/site/services/content'
import { QuoteForm } from '@/features/quotes/components/quote-form'
import { Container, Section } from '@/shared/components/layout-primitives'
import { PageHero } from '@/shared/components/page-hero'
import { PHOTO } from '@/shared/lib/photos'

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
      <PageHero
        eyebrow="Cotización"
        title="Solicita tu cotización"
        subtitle="Tres pasos y listo. Un asesor te contacta con la mejor alternativa. Sin cifras automáticas: atención humana de principio a fin."
        photoSrc={PHOTO.advisory}
      />

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
