import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, User, Phone, Mail, IdCard, MapPin, MessageCircle } from 'lucide-react'
import { getQuote } from '@/features/quotes/services/inbox'
import { StatusBadge } from '@/features/quotes/components/status-badge'
import { StatusChanger } from '@/features/quotes/components/status-changer'
import { whatsappLink } from '@/shared/lib/utils'

function fmt(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quote = await getQuote(id)
  if (!quote) notFound()

  const risk = (quote.risk_payload ?? {}) as Record<string, unknown>
  const waHref = whatsappLink(
    quote.contact_phone,
    `Hola ${quote.contact_name}, le escribo de STEPS Seguros por su solicitud de cotización.`
  )

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/portal" className="inline-flex items-center gap-1 text-sm text-navy-900/60 hover:text-brand-primary">
        <ChevronLeft className="h-4 w-4" /> Volver a la bandeja
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-navy-900">{quote.contact_name}</h1>
            <StatusBadge status={quote.status} />
          </div>
          <p className="mt-1 text-sm text-navy-900/50">
            Radicado {quote.id.slice(0, 8).toUpperCase()} · {fmt(quote.created_at)}
          </p>
        </div>
        {waHref && (
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-accent">
            <MessageCircle className="h-4 w-4" /> Contactar por WhatsApp
          </a>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Datos del cliente y del riesgo */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-navy-900/10 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-900/50">Datos del cliente</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field icon={User} label="Nombre" value={quote.contact_name} />
              <Field icon={Phone} label="Teléfono" value={quote.contact_phone ?? '—'} />
              <Field icon={Mail} label="Correo" value={quote.contact_email || '—'} />
              <Field icon={IdCard} label="Documento" value={quote.contact_document || '—'} />
            </dl>
          </section>

          <section className="rounded-2xl border border-navy-900/10 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-900/50">Sobre el riesgo</h2>
            <div className="mt-4 space-y-3">
              <Field
                icon={MapPin}
                label="Producto"
                value={`${quote.insurance_lines?.name ?? '—'} · ${quote.segment ?? ''}`}
              />
              {typeof risk.descripcion === 'string' && risk.descripcion && (
                <div>
                  <p className="text-xs font-medium text-navy-900/50">Descripción</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-navy-900/80">{risk.descripcion}</p>
                </div>
              )}
              {typeof risk.ciudad === 'string' && risk.ciudad && (
                <Field icon={MapPin} label="Ciudad" value={risk.ciudad} />
              )}
            </div>
          </section>
        </div>

        {/* Gestión */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-navy-900/10 bg-white p-6">
            <StatusChanger quoteId={quote.id} current={quote.status} />
          </section>

          <section className="rounded-2xl border border-navy-900/10 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-900/50">Gestión de cotización</h2>
            <p className="mt-3 text-sm text-navy-900/70">
              Proveedor: <span className="font-medium">{quote.provider ?? 'manual'}</span>
            </p>
            <p className="mt-2 rounded-lg bg-brand-primary/5 p-3 text-xs text-navy-900/60">
              Esta cotización se gestiona manualmente en Agentemotor (adaptador B). Registra aquí el avance con el
              estado. La integración automática depende de la respuesta de Agentemotor.
            </p>
            <p className="mt-3 text-xs text-navy-900/40">
              Asignada a: {quote.agents?.display_name ?? 'sin asignar'}
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-navy-900/40" />
      <div>
        <p className="text-xs font-medium text-navy-900/50">{label}</p>
        <p className="text-sm text-navy-900/85">{value}</p>
      </div>
    </div>
  )
}
