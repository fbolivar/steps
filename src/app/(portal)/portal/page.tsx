import Link from 'next/link'
import { ArrowRight, Inbox } from 'lucide-react'
import { getQuotes, getStatusCounts, QUOTE_STATUSES, STATUS_LABEL, type QuoteStatus } from '@/features/quotes/services/inbox'
import { StatusBadge } from '@/features/quotes/components/status-badge'

function formatDate(iso: string): string {
  // Formato es-CO estable en servidor.
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const { estado } = await searchParams
  const activeStatus = (QUOTE_STATUSES as string[]).includes(estado ?? '')
    ? (estado as QuoteStatus)
    : undefined

  const [quotes, counts] = await Promise.all([getQuotes(activeStatus), getStatusCounts()])
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Cotizaciones</h1>
          <p className="text-sm text-navy-900/60">Gestiona las solicitudes entrantes y su estado.</p>
        </div>
      </div>

      {/* Filtros por estado */}
      <div className="mb-5 flex flex-wrap gap-2">
        <Link
          href="/portal"
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            !activeStatus ? 'bg-brand-primary text-white' : 'bg-white text-navy-900/70 hover:bg-navy-900/5'
          }`}
        >
          Todas ({total})
        </Link>
        {QUOTE_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/portal?estado=${s}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              activeStatus === s ? 'bg-brand-primary text-white' : 'bg-white text-navy-900/70 hover:bg-navy-900/5'
            }`}
          >
            {STATUS_LABEL[s]} ({counts[s]})
          </Link>
        ))}
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-900/15 bg-white p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-navy-900/30" />
          <p className="mt-3 font-medium text-navy-900">No hay cotizaciones {activeStatus ? 'en este estado' : 'aún'}.</p>
          <p className="text-sm text-navy-900/50">Las nuevas solicitudes del sitio aparecerán aquí.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-navy-900/10 bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-navy-900/10 bg-navy-900/[0.02] text-xs uppercase tracking-wide text-navy-900/50">
              <tr>
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Producto</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Agente</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Fecha</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-brand-primary/[0.02]">
                  <td className="px-5 py-3">
                    <p className="font-medium text-navy-900">{q.contact_name}</p>
                    <p className="text-xs text-navy-900/50">{q.contact_phone}</p>
                  </td>
                  <td className="px-5 py-3 text-navy-900/70">
                    {q.insurance_lines?.name ?? '—'}
                    <span className="ml-1 text-xs capitalize text-navy-900/40">· {q.segment}</span>
                  </td>
                  <td className="hidden px-5 py-3 text-navy-900/60 sm:table-cell">
                    {q.agents?.display_name ?? 'Sin asignar'}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={q.status} />
                  </td>
                  <td className="hidden px-5 py-3 text-xs text-navy-900/50 md:table-cell">{formatDate(q.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/portal/cotizaciones/${q.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline"
                    >
                      Ver <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
