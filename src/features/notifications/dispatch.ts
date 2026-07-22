import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { NOTIFIERS, type NotificationTarget } from './adapters'

/**
 * Notifica al agente asignado que entró una nueva cotización.
 * No-op seguro si falta el service_role key o ningún notificador está
 * configurado. Nunca lanza: las notificaciones no deben romper el flujo de
 * cotización (la solicitud ya quedó registrada y en la bandeja del portal).
 */
export async function notifyNewQuote(quoteId: string): Promise<void> {
  const admin = createAdminClient()
  if (!admin) return // service_role no configurado → solo bandeja del portal

  const enabled = NOTIFIERS.filter((n) => n.enabled)
  if (enabled.length === 0) return

  try {
    const { data } = await admin
      .from('quote_requests')
      .select(
        'id, contact_name, tenant_id, assigned_agent_id, ' +
          'tenants(nombre_comercial), insurance_lines(name), ' +
          'agents(display_name, email, whatsapp_number)'
      )
      .eq('id', quoteId)
      .maybeSingle()

    // Tipado laxo: la relación anidada llega como objeto|null.
    const row = (data ?? null) as unknown as {
      id: string
      contact_name: string
      assigned_agent_id: string | null
      tenants: { nombre_comercial: string } | null
      insurance_lines: { name: string } | null
      agents: { display_name: string | null; email: string | null; whatsapp_number: string | null } | null
    } | null

    if (!row || !row.assigned_agent_id) return

    const target: NotificationTarget = {
      agentName: row.agents?.display_name ?? 'agente',
      agentEmail: row.agents?.email ?? null,
      agentWhatsApp: row.agents?.whatsapp_number ?? null,
      tenantName: row.tenants?.nombre_comercial ?? 'la agencia',
      contactName: row.contact_name,
      lineName: row.insurance_lines?.name ?? 'seguro',
      reference: row.id.slice(0, 8).toUpperCase(),
    }

    await Promise.allSettled(enabled.map((n) => n.send(target)))
  } catch {
    // Silencioso a propósito: la cotización ya está registrada y asignada.
  }
}
