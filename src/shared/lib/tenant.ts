import 'server-only'
import { cache } from 'react'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/database.types'

export type Tenant = Tables<'tenants'>

const DEFAULT_TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? 'steps'

/**
 * Resuelve el tenant activo a partir del HOST (cabeceras puestas por el
 * middleware). Orden de prioridad:
 *   1. dominio custom exacto  (tenants.custom_domain = host)
 *   2. subdominio de plataforma (tenants.subdomain = hint)
 *   3. tenant por defecto (slug = DEFAULT_TENANT)
 *
 * Memoizado por request con cache() para no consultar la BD varias veces.
 * La lectura pasa por RLS (política tenants_public_read) usando la anon key.
 */
export const getActiveTenant = cache(async (): Promise<Tenant> => {
  const h = await headers()
  const host = h.get('x-tenant-host') ?? ''
  const hint = h.get('x-tenant-hint') ?? DEFAULT_TENANT

  const supabase = await createClient()

  // 1. Dominio custom
  if (hint === 'custom' && host) {
    const { data } = await supabase
      .from('tenants')
      .select('*')
      .eq('custom_domain', host)
      .eq('is_active', true)
      .maybeSingle()
    if (data) return data
  }

  // 2. Subdominio de plataforma
  if (hint && hint !== 'custom' && hint !== DEFAULT_TENANT) {
    const { data } = await supabase
      .from('tenants')
      .select('*')
      .eq('subdomain', hint)
      .eq('is_active', true)
      .maybeSingle()
    if (data) return data
  }

  // 3. Tenant por defecto
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', DEFAULT_TENANT)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data) {
    throw new Error(
      `No se pudo resolver ningún tenant (host="${host}", hint="${hint}"). ` +
        `¿Falta el seed del tenant por defecto "${DEFAULT_TENANT}"?`
    )
  }
  return data
})

/** Canales RGB "r g b" para inyectar en variables CSS del tenant. */
export function hexToRgbChannels(hex: string): string {
  const m = hex.replace('#', '').match(/.{1,2}/g)
  if (!m || m.length < 3) return '26 31 78'
  const [r, g, b] = m.map((x) => parseInt(x, 16))
  return `${r} ${g} ${b}`
}

/** Estilo con las variables de marca del tenant, para el <html>. */
export function tenantBrandStyle(tenant: Tenant): React.CSSProperties {
  return {
    ['--brand-primary' as string]: hexToRgbChannels(tenant.color_primary),
    ['--brand-secondary' as string]: hexToRgbChannels(tenant.color_secondary),
    ['--brand-accent' as string]: hexToRgbChannels(tenant.color_accent),
  }
}
