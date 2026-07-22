import type { Metadata } from 'next'
import Link from 'next/link'
import { Target, Eye, Heart, ArrowRight, Check } from 'lucide-react'
import { Container, Section, Eyebrow } from '@/shared/components/layout-primitives'
import { PageHero } from '@/shared/components/page-hero'
import { ImagePlaceholder } from '@/shared/components/image-placeholder'
import { WhatsAppButton } from '@/shared/components/whatsapp-button'
import { COMPANY, ABOUT_BULLETS } from '@/shared/constants/site'
import { PHOTO } from '@/shared/lib/photos'
import { getActiveTenant } from '@/shared/lib/tenant'

export const metadata: Metadata = { title: 'Nosotros' }

export default async function NosotrosPage() {
  const tenant = await getActiveTenant()

  return (
    <>
      <PageHero
        eyebrow="Quiénes somos"
        title={`Somos ${tenant.nombre_comercial}: personas que protegen personas.`}
        subtitle={COMPANY.tagline}
        photoSrc={PHOTO.nosotros}
      />

      {/* Intro con foto + bullets */}
      <Section>
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <ImagePlaceholder src={PHOTO.about} className="aspect-[4/3] w-full" />
          <div>
            <Eyebrow>Nuestra esencia</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold text-navy-900 sm:text-4xl">
              Asesoría transparente, del primer día al siniestro.
            </h2>
            <p className="mt-4 text-navy-900/65">{COMPANY.mision}</p>
            <ul className="mt-6 space-y-3">
              {ABOUT_BULLETS.map((b) => (
                <li key={b} className="flex items-center gap-3 text-navy-900/80">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent/15 text-brand-accent">
                    <Check className="h-4 w-4" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/cotizar" className="btn-primary">
                Cotizar ahora <ArrowRight className="h-4 w-4" />
              </Link>
              <WhatsAppButton number={tenant.whatsapp_number} variant="outline" />
            </div>
          </div>
        </Container>
      </Section>

      {/* Misión / Visión */}
      <Section variant="mist">
        <Container className="grid gap-6 md:grid-cols-2">
          <div className="card-soft p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/8 text-brand-primary">
              <Target className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-2xl font-bold text-navy-900">Misión</h2>
            <p className="mt-3 text-navy-900/65">{COMPANY.mision}</p>
          </div>
          <div className="card-soft p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/8 text-brand-primary">
              <Eye className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-2xl font-bold text-navy-900">Visión</h2>
            <p className="mt-3 text-navy-900/65">{COMPANY.vision}</p>
          </div>
        </Container>
      </Section>

      {/* Filosofía */}
      <Section>
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Filosofía</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold text-navy-900 sm:text-4xl">
              Transparencia y compromiso en cada póliza
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {COMPANY.filosofia.map((f) => (
              <div key={f.title} className="card-soft p-6">
                <Heart className="h-7 w-7 text-brand-accent" />
                <h3 className="mt-4 text-lg font-semibold text-navy-900">{f.title}</h3>
                <p className="mt-2 text-sm text-navy-900/60">{f.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  )
}
