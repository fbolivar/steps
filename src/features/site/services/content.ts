import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/database.types'

export type InsuranceLine = Tables<'insurance_lines'>

/**
 * Líneas de producto activas de un tenant. Fuente única para el sitio: agregar
 * o quitar un producto es un cambio de datos, no un despliegue de código.
 * Lectura pública vía RLS (lines_public_read) con la anon key.
 */
export const getInsuranceLines = cache(
  async (tenantId: string, segment?: 'personas' | 'empresas'): Promise<InsuranceLine[]> => {
    const supabase = await createClient()
    let q = supabase
      .from('insurance_lines')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (segment) q = q.eq('segment', segment)

    const { data, error } = await q
    if (error) throw new Error(`No se pudieron cargar las líneas de producto: ${error.message}`)
    return data ?? []
  }
)

export const getInsuranceLine = cache(
  async (tenantId: string, slug: string): Promise<InsuranceLine | null> => {
    const supabase = await createClient()
    const { data } = await supabase
      .from('insurance_lines')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()
    return data
  }
)
