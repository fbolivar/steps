import Link from 'next/link'
import { MapPin, Mail, Phone, ArrowRight } from 'lucide-react'
import { Logo } from './logo'
import { Container } from './layout-primitives'
import { SocialRow } from './social-icons'
import { NAV_LINKS } from '@/shared/constants/site'
import type { Tenant } from '@/shared/lib/tenant'

const FOOTER_SERVICES = [
  { label: 'Vida', href: '/seguros/personas/vida' },
  { label: 'Salud', href: '/seguros/personas/salud' },
  { label: 'Auto', href: '/seguros/personas/auto' },
  { label: 'Hogar', href: '/seguros/personas/hogar' },
  { label: 'Empresas', href: '/seguros/empresas' },
]

export function Footer({ tenant }: { tenant: Tenant }) {
  const year = 2026

  return (
    <footer className="bg-brand-primary text-white/70">
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo tenant={tenant} onDark />
          <p className="mt-4 max-w-xs text-sm text-white/55">
            Tranquilidad y protección con soluciones de seguros a la medida de personas, familias y empresas.
          </p>
          <form className="mt-5 flex max-w-xs items-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
            <input
              type="email"
              placeholder="Tu correo"
              className="w-full bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
            <button
              type="button"
              aria-label="Suscribirse"
              className="m-1 flex h-8 w-9 shrink-0 items-center justify-center rounded-full bg-brand-accent text-white"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Navegación</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/60 hover:text-brand-accent">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/login" className="text-white/60 hover:text-brand-accent">
                Portal de agentes
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Seguros</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {FOOTER_SERVICES.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="text-white/60 hover:text-brand-accent">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Contacto</h4>
          <ul className="mt-4 space-y-3 text-sm text-white/60">
            {tenant.address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" /> {tenant.address}
              </li>
            )}
            {tenant.whatsapp_number && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-brand-accent" /> {tenant.whatsapp_number}
              </li>
            )}
            {tenant.contact_email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-brand-accent" />
                <a href={`mailto:${tenant.contact_email}`} className="hover:text-brand-accent">
                  {tenant.contact_email}
                </a>
              </li>
            )}
          </ul>
          <SocialRow className="mt-4 flex gap-3" iconClass="h-4 w-4" />
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/40 sm:flex-row">
          <span>
            © {year} {tenant.nombre_comercial}
            {tenant.nit ? ` · NIT ${tenant.nit}` : ''}. Todos los derechos reservados.
          </span>
          <div className="flex gap-4">
            <Link href="/legal/tratamiento-de-datos" className="hover:text-brand-accent">
              Tratamiento de datos
            </Link>
            <span>Vigilada Superintendencia Financiera de Colombia</span>
          </div>
        </Container>
      </div>
    </footer>
  )
}
