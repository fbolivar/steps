import type { Enums } from '@/lib/supabase/database.types'

// Constantes/tipos compartidos por server y client (sin 'server-only').
export type QuoteStatus = Enums<'quote_status'>

export const QUOTE_STATUSES: QuoteStatus[] = ['nueva', 'contactado', 'en_negociacion', 'emitida', 'perdida']

export const STATUS_LABEL: Record<QuoteStatus, string> = {
  nueva: 'Nueva',
  contactado: 'Contactado',
  en_negociacion: 'En negociación',
  emitida: 'Emitida',
  perdida: 'Perdida',
}
