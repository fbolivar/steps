import 'server-only'
import { createClient } from '@/lib/supabase/server'

/** Extrae la IP del cliente de las cabeceras (Vercel/proxy). */
export function getClientIp(h: Headers): string {
  const xff = h.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return h.get('x-real-ip') ?? 'unknown'
}

/**
 * Rate limit por ventana fija respaldado en BD (rate_limit_hit).
 * Devuelve true si la petición está permitida (dentro del límite).
 * Ante error de infraestructura, "fail-open" para no tumbar el flujo.
 */
export async function rateLimit(
  bucket: string,
  identifier: string,
  max: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('rate_limit_hit', {
      p_bucket: bucket,
      p_identifier: identifier,
      p_max: max,
      p_window_seconds: windowSeconds,
    } as never)
    if (error) return true
    return data !== false
  } catch {
    return true
  }
}
