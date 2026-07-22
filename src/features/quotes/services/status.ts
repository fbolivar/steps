'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getPortalContext, canManageQuotes } from '@/features/auth/services/session'
import { QUOTE_STATUSES } from '@/features/quotes/constants'

const UpdateSchema = z.object({
  quoteId: z.string().uuid(),
  status: z.enum(QUOTE_STATUSES as [string, ...string[]]),
})

export type StatusState = { ok?: boolean; error?: string }

/**
 * Cambia el estado de una cotización. Doble control:
 *  - autorización de aplicación (rol que gestiona cotizaciones), y
 *  - RLS en BD (quotes_agent_update) — aunque se saltara esta capa, la BD
 *    rechaza la escritura fuera del tenant/rol del usuario.
 */
export async function updateQuoteStatus(_prev: StatusState, formData: FormData): Promise<StatusState> {
  const ctx = await getPortalContext()
  if (!ctx || !canManageQuotes(ctx.role)) {
    return { error: 'No autorizado.' }
  }

  const parsed = UpdateSchema.safeParse({
    quoteId: formData.get('quoteId'),
    status: formData.get('status'),
  })
  if (!parsed.success) return { error: 'Datos inválidos.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('quote_requests')
    .update({ status: parsed.data.status } as never)
    .eq('id', parsed.data.quoteId)

  if (error) return { error: 'No se pudo actualizar el estado.' }

  revalidatePath('/portal')
  revalidatePath(`/portal/cotizaciones/${parsed.data.quoteId}`)
  return { ok: true }
}
