import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Check, ChevronLeft } from 'lucide-react'
import { getActiveTenant } from '@/shared/lib/tenant'
import { getInsuranceLine } from '@/features/site/services/content'
import { WhatsAppButton } from '@/shared/components/whatsapp-button'
import { Container, Section } from '@/shared/components/layout-primitives'
import { PageHero } from '@/shared/components/page-hero'
import { photo } from '@/shared/lib/photos'
import { SEGMENTS, type SegmentSlug } from '@/shared/constants/site'

function isSegment(v: string): v is SegmentSlug {
  return v === 'personas' || v === 'empresas'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string; slug: string }>
}): Promise<Metadata> {
  const { segment, slug } = await params
  if (!isSegment(segment)) return {}
  const tenant = await getActiveTenant()
  const line = await getInsuranceLine(tenant.id, slug)
  return line ? { title: line.name, description: line.short_description ?? undefined } : {}
}

const BENEFITS: Record<SegmentSlug, string[]> = {
  personas: [
    'Comparamos entre más de 15 aseguradoras por ti',
    'Un asesor real que te explica coberturas y exclusiones',
    'Acompañamiento en el proceso de reclamación',
    'Renovación y ajustes sin trámites engorrosos',
  ],
  empresas: [
    'Análisis de riesgos de tu operación',
    'Programas a la medida de tu sector',
    'Gestión centralizada de todas tus pólizas',
    'Soporte en siniestros con respaldo técnico',
  ],
}

export default async function LineDetailPage({
  params,
}: {
  params: Promise<{ segment: string; slug: string }>
}) {
  const { segment, slug } = await params
  if (!isSegment(segment)) notFound()

  const tenant = await getActiveTenant()
  const line = await getInsuranceLine(tenant.id, slug)
  if (!line || line.segment !== segment) notFound()

  const cotizarHref = `/cotizar?linea=${line.slug}&segmento=${segment}`

  return (
    <>
      <PageHero eyebrow={`Seguro de ${SEGMENTS[segment].slug}`} title={line.name} subtitle={line.short_description ?? undefined} photoSrc={photo(line.slug, 1600, 700)}>
        <Link
          href={`/seguros/${segment}`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-white/60 hover:text-brand-accent"
        >
          <ChevronLeft className="h-4 w-4" />
          {SEGMENTS[segment].title}
        </Link>
      </PageHero>

      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">¿Qué incluye trabajar con nosotros?</h2>
            <ul className="mt-6 space-y-4">
              {BENEFITS[segment].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-accent/20 text-brand-primary">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-navy-900/80">{b}</span>
                </li>
              ))}
            </ul>
            {line.body_mdx && (
              <div className="prose mt-8 max-w-none text-navy-900/80">
                <p>{line.body_mdx}</p>
              </div>
            )}
          </div>

          <aside className="card-soft h-fit p-8">
            <h3 className="text-lg font-semibold text-navy-900">Cotiza {line.name}</h3>
            <p className="mt-2 text-sm text-navy-900/60">
              Déjanos tus datos y un asesor te contacta con la mejor alternativa. La cotización la gestiona siempre una
              persona, no un formulario automático.
            </p>
            <Link href={cotizarHref} className="btn-primary mt-6 w-full">
              Solicitar cotización <ArrowRight className="h-4 w-4" />
            </Link>
            <WhatsAppButton
              number={tenant.whatsapp_number}
              message={`Hola, quiero cotizar el seguro de ${line.name}.`}
              variant="outline"
              className="mt-3 w-full"
            />
          </aside>
        </Container>
      </Section>
    </>
  )
}
