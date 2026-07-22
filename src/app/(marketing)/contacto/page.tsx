import type { Metadata } from 'next'
import { Mail, MapPin, Building } from 'lucide-react'
import { getActiveTenant } from '@/shared/lib/tenant'
import { WhatsAppButton } from '@/shared/components/whatsapp-button'
import { Container, Section } from '@/shared/components/layout-primitives'
import { PageHero } from '@/shared/components/page-hero'
import { PHOTO } from '@/shared/lib/photos'
import { ContactForm } from '@/features/site/components/contact-form'

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
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/8 text-brand-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{it.label}</p>
                      {it.href ? (
                        <a href={it.href} className="text-navy-900/60 hover:text-brand-primary">
                          {it.value}
                        </a>
                      ) : (
                        <p className="text-navy-900/60">{it.value}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            <div className="pt-2">
              <WhatsAppButton number={tenant.whatsapp_number} />
            </div>
          </div>

          <div className="card-soft p-8">
            <h2 className="text-xl font-bold text-navy-900">Envíanos un mensaje</h2>
            <p className="mt-1 text-sm text-navy-900/55">Te responderemos lo antes posible.</p>
            <div className="mt-5">
              <ContactForm contactEmail={tenant.contact_email} />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
