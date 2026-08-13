import type { Metadata } from 'next'
import { Mail, MapPin, Building } from 'lucide-react'
import { getActiveTenant } from '@/shared/lib/tenant'
import { WhatsAppButton } from '@/shared/components/whatsapp-button'
import { Container, Section } from '@/shared/components/layout-primitives'
import { PageHero } from '@/shared/components/page-hero'
import { PHOTO } from '@/shared/lib/photos'
import { ContactForm } from '@/features/site/components/contact-form'
import { CONTACT_AREAS } from '@/shared/constants/site'

export const metadata: Metadata = { title: 'Contacto' }

export default async function ContactoPage() {
  const tenant = await getActiveTenant()

  return (
    <>
      <PageHero
        eyebrow="Hablemos"
        title="Estamos para asesorarte"
        subtitle="Escríbenos por el canal que prefieras. Te responde un asesor real."
        photoSrc={PHOTO.contact}
      />

      <Section variant="mist">
        <Container className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-4">
            {[
              tenant.contact_email && {
                icon: Mail,
                label: 'Correo',
                value: tenant.contact_email,
                href: `mailto:${tenant.contact_email}`,
              },
              tenant.address && { icon: MapPin, label: 'Dirección', value: tenant.address },
              tenant.nit && {
                icon: Building,
                label: tenant.razon_social ?? tenant.nombre_comercial,
                value: `NIT ${tenant.nit}`,
              },
            ]
              .filter(Boolean)
              .map((item) => {
                const it = item as { icon: typeof Mail; label: string; value: string; href?: string }
                const Icon = it.icon
                return (
                  <div key={it.label} className="card-soft flex items-start gap-4 p-5">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-accent/10 text-brand-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{it.label}</p>
                      {it.href ? (
                        <a href={it.href} className="text-navy-600 hover:text-brand-primary">
                          {it.value}
                        </a>
                      ) : (
                        <p className="text-navy-600">{it.value}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            {/* Buzones por área: cada consulta va directo a quien corresponde. */}
            <div className="card-soft p-5">
              <h2 className="text-sm font-semibold text-navy-900">Escríbenos según tu necesidad</h2>
              <ul className="mt-4 divide-y divide-steel">
                {CONTACT_AREAS.map((c) => (
                  <li key={c.email} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900">
                      <span className="h-1.5 w-1.5 shrink-0 bg-brand-accent" />
                      {c.area}
                    </span>
                    <a
                      href={`mailto:${c.email}`}
                      className="text-sm text-navy-600 underline-offset-4 hover:text-brand-accent hover:underline"
                    >
                      {c.email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <WhatsAppButton number={tenant.whatsapp_number} />
            </div>
          </div>

          <div className="card-soft p-8">
            <h2 className="text-xl font-bold text-navy-900">Envíanos un mensaje</h2>
            <p className="mt-1 text-sm text-navy-600">Te responderemos lo antes posible.</p>
            <div className="mt-5">
              <ContactForm contactEmail={tenant.contact_email} />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
