import { STATUS_LABEL, type QuoteStatus } from '@/features/quotes/constants'

/**
 * Estados del embudo. "nueva" y "perdida" usan la paleta de marca (cobalt y
 * gris azulado); los intermedios conservan colores funcionales de sistema
 * porque el usuario del portal necesita distinguirlos de un vistazo, y la
 * marca solo aporta azules.
 */
const STYLES: Record<QuoteStatus, string> = {
  nueva: 'bg-cobalt-100 text-cobalt-700',
  contactado: 'bg-amber-100 text-amber-700',
  en_negociacion: 'bg-purple-100 text-purple-700',
  emitida: 'bg-green-100 text-green-700',
  perdida: 'bg-steel text-navy-600',
}

export function StatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}
