import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/database.types'
import { QUOTE_STATUSES, STATUS_LABEL, type QuoteStatus } from '@/features/quotes/constants'

export { QUOTE_STATUSES, STATUS_LABEL }
export type { QuoteStatus }

export type QuoteRow = Tables<'quote_requests'> & {
  insurance_lines: { name: string; slug: string } | null
  agents: { display_name: string | null } | null
}

/**
 * Cotizaciones del tenant activo. RLS garantiza que solo se devuelven las del
 * tenant del agente autenticado (política quotes_agent_read). No hace falta
 * filtrar por tenant_id aquí: RLS ya lo impone.
 */
export async function getQuotes(status?: QuoteStatus): Promise<QuoteRow[]> {
  const supabase = await createClient()
  let q = supabase
    .from('quote_requests')
    .select('*, insurance_lines(name, slug), agents(display_name)')
    .order('created_at', { ascending: false })

  if (status) q = q.eq('status', status)

  const { data, error } = await q
  if (error) throw new Error(`No se pudieron cargar las cotizaciones: ${error.message}`)
  return (data ?? []) as unknown as QuoteRow[]
}

export async function getQuote(id: string): Promise<QuoteRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('quote_requests')
    .select('*, insurance_lines(name, slug), agents(display_name)')
    .eq('id', id)
    .maybeSingle()
  return (data ?? null) as unknown as QuoteRow | null
}

export async function getStatusCounts(): Promise<Record<QuoteStatus, number>> {
  const supabase = await createClient()
  const { data } = await supabase.from('quote_requests').select('status')
  const counts = { nueva: 0, contactado: 0, en_negociacion: 0, emitida: 0, perdida: 0 } as Record<
    QuoteStatus,
    number
  >
  const rows = (data ?? []) as unknown as { status: QuoteStatus }[]
  for (const row of rows) counts[row.status]++
  return counts
}
