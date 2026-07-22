import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getActiveTenant } from '@/shared/lib/tenant'
import { getInsuranceLines } from '@/features/site/services/content'
import { ProductLineCard } from '@/features/site/components/product-line-card'
import { WhatsAppButton } from '@/shared/components/whatsapp-button'
import { Container, Section } from '@/shared/components/layout-primitives'
import { PageHero } from '@/shared/components/page-hero'
import { PHOTO } from '@/shared/lib/photos'
import { SEGMENTS, type SegmentSlug } from '@/shared/constants/site'

function isSegment(v: string): v is SegmentSlug {
  return v === 'personas' || v === 'empresas'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string }>
}): Promise<Metadata> {
  const { segment } = await params
  if (!isSegment(segment)) return { title: 'Seguros' }
  return { title: SEGMENTS[segment].title }
}

export default async function SegmentPage({ params }: { params: Promise<{ segment: string }> }) {
  const { segment } = await params
  if (!isSegment(segment)) notFound()

  const meta = SEGMENTS[segment]
  const tenant = await getActiveTenant()
  const lines = await getInsuranceLines(tenant.id, segment)

  return (
    <>
      <PageHero
        eyebrow={segment === 'personas' ? 'Personas y familias' : 'Empresas y cooperativas'}
        title={meta.title}
        subtitle={meta.subtitle}
        photoSrc={segment === 'personas' ? PHOTO.personas : PHOTO.empresas}
      />

      <Section variant="mist">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lines.map((line) => (
              <ProductLineCard key={line.id} line={line} />
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 rounded-3xl bg-brand-primary p-8 text-white sm:flex-row sm:p-10">
            <p className="text-lg font-semibold">¿No encuentras lo que buscas? Tenemos más soluciones.</p>
            <div className="flex gap-3">
              <Link href="/cotizar" className="btn-accent">
                Cotizar <ArrowRight className="h-4 w-4" />
              </Link>
              <WhatsAppButton
                number={tenant.whatsapp_number}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
