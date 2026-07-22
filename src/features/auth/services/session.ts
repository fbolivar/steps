import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getActiveTenant, type Tenant } from '@/shared/lib/tenant'
import type { Enums } from '@/lib/supabase/database.types'

export type AppRole = Enums<'app_role'>

export type PortalContext = {
  userId: string
  email: string | null
  fullName: string | null
  tenant: Tenant
  role: AppRole
  /** id de la fila agents del usuario en este tenant, si es agente. */
  agentId: string | null
}

/**
 * Contexto del portal para el usuario autenticado en el tenant activo.
 * Devuelve null si no hay sesión o el usuario no pertenece al tenant.
 * super_admin obtiene acceso aunque no tenga membresía explícita en el tenant.
 */
export const getPortalContext = cache(async (): Promise<PortalContext | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const tenant = await getActiveTenant()

  // Membresía en el tenant activo (RLS: el usuario ve la suya).
  const { data: membershipRow } = await supabase
    .from('tenant_members')
    .select('role')
    .eq('tenant_id', tenant.id)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()
  const membership = membershipRow as { role: AppRole } | null

  // ¿Es super_admin en cualquier tenant? (acceso transversal)
  let role: AppRole | null = membership?.role ?? null
  if (!role) {
    const { data: superRow } = await supabase
      .from('tenant_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .eq('is_active', true)
      .maybeSingle()
    if (superRow) role = 'super_admin'
  }

  if (!role) return null

  const { data: agentRow } = await supabase
    .from('agents')
    .select('id')
    .eq('tenant_id', tenant.id)
    .eq('user_id', user.id)
    .maybeSingle()
  const agent = agentRow as { id: string } | null

  return {
    userId: user.id,
    email: user.email ?? null,
    fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
    tenant,
    role,
    agentId: agent?.id ?? null,
  }
})

/** Roles que pueden ver/gestionar cotizaciones (no editor_contenido). */
export function canManageQuotes(role: AppRole): boolean {
  return role === 'super_admin' || role === 'tenant_admin' || role === 'agente'
}
