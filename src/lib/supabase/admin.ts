import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Cliente Supabase con service_role (BYPASSA RLS). SOLO servidor.
 * Se usa para tareas de sistema seguras que necesitan datos que RLS oculta a
 * anon, como notificar al agente asignado tras una nueva cotización.
 *
 * Devuelve null si no hay SUPABASE_SERVICE_ROLE_KEY configurada: así las
 * notificaciones simplemente no se envían (no rompen el flujo) hasta que se
 * cargue la clave.
 */
export function createAdminClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
