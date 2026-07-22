'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, MapPin, Mail, Phone, ArrowRight } from 'lucide-react'
import { Logo } from './logo'
import { Container } from './layout-primitives'
import { SocialRow } from './social-icons'
import { NAV_LINKS } from '@/shared/constants/site'
import type { Tenant } from '@/shared/lib/tenant'

type HeaderTenant = Pick<
  Tenant,
  'nombre_comercial' | 'logo_url' | 'slug' | 'whatsapp_number' | 'contact_email' | 'address'
>

export function Header({ tenant }: { tenant: HeaderTenant }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50">
      {/* Barra superior de contacto */}
      <div className="hidden border-b border-white/10 bg-brand-primary text-white/80 lg:block">
        <Container className="flex h-10 items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            {tenant.address && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-brand-accent" /> {tenant.address}
              </span>
            )}
            {tenant.contact_email && (
              <a href={`mailto:${tenant.contact_email}`} className="inline-flex items-center gap-1.5 hover:text-white">
                <Mail className="h-3.5 w-3.5 text-brand-accent" /> {tenant.contact_email}
              </a>
            )}
            {tenant.whatsapp_number && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-brand-accent" /> {tenant.whatsapp_number}
              </span>
            )}
          </div>
          <SocialRow className="flex items-center gap-3" iconClass="h-3.5 w-3.5" />
        </Container>
      </div>

      {/* Nav principal */}
      <div className="border-b border-navy-900/5 bg-white/95 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Logo tenant={tenant} />

          <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-navy-900/80 transition-colors hover:text-brand-primary"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <Link href="/cotizar" className="btn-primary px-5 py-2.5">
              Cotizar <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </Container>
      </div>

      {open && (
        <div className="border-t border-navy-900/5 bg-white md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-navy-900/80 hover:bg-brand-primary/5"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/cotizar" className="btn-primary mt-3" onClick={() => setOpen(false)}>
              Cotizar ahora
            </Link>
          </Container>
        </div>
      )}
    </header>
  )
}
