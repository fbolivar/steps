import 'server-only'
import { createClient } from '@/lib/supabase/server'

export type AgentRow = {
  id: string
  display_name: string | null
  email: string | null
  whatsapp_number: string | null
  is_accepting_leads: boolean
  active_leads_count: number
}

/** Agentes de un tenant. RLS (agents_read) limita a miembros del tenant. */
export async function getTenantAgents(tenantId: string): Promise<AgentRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('agents')
    .select('id, display_name, email, whatsapp_number, is_accepting_leads, active_leads_count')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true })
  return (data ?? []) as unknown as AgentRow[]
}
