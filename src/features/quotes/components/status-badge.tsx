import { STATUS_LABEL, type QuoteStatus } from '@/features/quotes/constants'

const STYLES: Record<QuoteStatus, string> = {
  nueva: 'bg-blue-100 text-blue-700',
  contactado: 'bg-amber-100 text-amber-700',
  en_negociacion: 'bg-purple-100 text-purple-700',
  emitida: 'bg-green-100 text-green-700',
  perdida: 'bg-navy-900/10 text-navy-900/60',
}

export function StatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}
