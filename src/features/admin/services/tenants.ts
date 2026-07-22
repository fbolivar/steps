import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/database.types'

export type TenantRow = Tables<'tenants'>
export type TenantWithStats = TenantRow & { lines: number; agents: number; quotes: number }

/**
 * Lista todos los tenants con métricas básicas. RLS: solo super_admin ve todos
 * los tenants inactivos/ajenos (la política tenants_public_read también expone
 * los activos, pero el conteo cross-tenant de agentes/cotizaciones solo lo
 * resuelve super_admin vía has_tenant_access).
 */
export async function getAllTenants(): Promise<TenantWithStats[]> {
  const supabase = await createClient()
  const { data: tenants } = await supabase.from('tenants').select('*').order('created_at', { ascending: true })
  const list = (tenants ?? []) as unknown as TenantRow[]

  const withStats = await Promise.all(
    list.map(async (t) => {
      const [{ count: lines }, { count: agents }, { count: quotes }] = await Promise.all([
        supabase.from('insurance_lines').select('id', { count: 'exact', head: true }).eq('tenant_id', t.id),
        supabase.from('agents').select('id', { count: 'exact', head: true }).eq('tenant_id', t.id),
        supabase.from('quote_requests').select('id', { count: 'exact', head: true }).eq('tenant_id', t.id),
      ])
      return { ...t, lines: lines ?? 0, agents: agents ?? 0, quotes: quotes ?? 0 }
    })
  )
  return withStats
}

export async function getTenantById(id: string): Promise<TenantRow | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('tenants').select('*').eq('id', id).maybeSingle()
  return (data ?? null) as unknown as TenantRow | null
}
