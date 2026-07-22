'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPortalContext } from '@/features/auth/services/session'
import { DEFAULT_LINES } from './default-lines'

const HEX = /^#([0-9a-fA-F]{6})$/
const SLUG = /^[a-z0-9-]{2,40}$/

const CreateSchema = z.object({
  nombre_comercial: z.string().min(2, 'Nombre comercial requerido.'),
  slug: z.string().regex(SLUG, 'Slug inválido (minúsculas, números, guiones).'),
  subdomain: z.string().regex(SLUG, 'Subdominio inválido.').optional().or(z.literal('')),
  razon_social: z.string().optional().or(z.literal('')),
  nit: z.string().optional().or(z.literal('')),
  contact_email: z.string().email('Correo inválido.').optional().or(z.literal('')),
  whatsapp_number: z.string().optional().or(z.literal('')),
  color_primary: z.string().regex(HEX, 'Color primario inválido.'),
  color_secondary: z.string().regex(HEX, 'Color secundario inválido.'),
  color_accent: z.string().regex(HEX, 'Color acento inválido.'),
  admin_email: z.string().email('Correo del admin inválido.').optional().or(z.literal('')),
})

export type AdminState = { ok?: boolean; error?: string; notice?: string }

export async function createTenantAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const ctx = await getPortalContext()
  if (!ctx || ctx.role !== 'super_admin') return { error: 'Solo super_admin puede crear tenants.' }

  const parsed = CreateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  const d = parsed.data

  const supabase = await createClient()

  // 1. Crear tenant (RLS: super_admin puede escribir tenants).
  const { data: created, error: tErr } = await supabase
    .from('tenants')
    .insert({
      slug: d.slug,
      nombre_comercial: d.nombre_comercial,
      subdomain: d.subdomain || d.slug,
      razon_social: d.razon_social || null,
      nit: d.nit || null,
      contact_email: d.contact_email || null,
      whatsapp_number: d.whatsapp_number || null,
      color_primary: d.color_primary,
      color_secondary: d.color_secondary,
      color_accent: d.color_accent,
      is_active: true,
    } as never)
    .select('id')
    .single()

  if (tErr || !created) {
    return { error: `No se pudo crear el tenant (¿slug/subdominio repetido?): ${tErr?.message ?? ''}` }
  }
  const tenantId = (created as unknown as { id: string }).id

  // 2. Sembrar catálogo de líneas por defecto.
  const rows = DEFAULT_LINES.map((l) => ({ ...l, tenant_id: tenantId, is_active: true }))
  await supabase.from('insurance_lines').insert(rows as never)

  // 3. Onboarding del admin del tenant (requiere service_role para crear el usuario).
  let notice: string | undefined
  if (d.admin_email) {
    const admin = createAdminClient()
    if (!admin) {
      notice =
        'Tenant creado. Para crear el usuario admin falta SUPABASE_SERVICE_ROLE_KEY; ' +
        'por ahora agrégalo cuando la clave esté configurada.'
    } else {
      // Invitación: el usuario recibe un correo y define su propia contraseña.
      const { data: userRes, error: uErr } = await admin.auth.admin.inviteUserByEmail(d.admin_email)
      if (uErr || !userRes?.user) {
        notice = `Tenant creado, pero no se pudo invitar al admin (¿SMTP configurado en Supabase?): ${uErr?.message ?? ''}`
      } else {
        const uid = userRes.user.id
        await admin.from('tenant_members').insert({ tenant_id: tenantId, user_id: uid, role: 'tenant_admin' } as never)
        await admin.from('agents').insert({ tenant_id: tenantId, user_id: uid, email: d.admin_email, display_name: d.admin_email } as never)
        notice = 'Tenant creado e invitación enviada al admin para que defina su contraseña.'
      }
    }
  }

  revalidatePath('/admin')
  return { ok: true, notice }
}

const UpdateSchema = z.object({
  tenant_id: z.string().uuid(),
  nombre_comercial: z.string().min(2),
  whatsapp_number: z.string().optional().or(z.literal('')),
  contact_email: z.string().email().optional().or(z.literal('')),
  custom_domain: z.string().optional().or(z.literal('')),
  subdomain: z.string().regex(SLUG).optional().or(z.literal('')),
  color_primary: z.string().regex(HEX),
  color_secondary: z.string().regex(HEX),
  color_accent: z.string().regex(HEX),
  is_active: z.enum(['true', 'false']),
})

export async function updateTenantAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const ctx = await getPortalContext()
  if (!ctx) return { error: 'No autorizado.' }

  const parsed = UpdateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  const d = parsed.data

  // tenant_admin solo puede editar SU tenant; super_admin cualquiera.
  if (ctx.role !== 'super_admin' && ctx.tenant.id !== d.tenant_id) {
    return { error: 'Solo puedes editar tu propio tenant.' }
  }

  // Se persiste vía RPC SECURITY DEFINER: RLS solo deja escribir tenants a
  // super_admin, así que un UPDATE directo del tenant_admin sería un no-op
  // silencioso. La RPC verifica el rol y restringe dominio/subdominio a
  // super_admin a nivel de columna (evita secuestro de rutas).
  const supabase = await createClient()
  const { error } = await supabase.rpc('update_tenant_branding', {
    p_tenant_id: d.tenant_id,
    p_nombre_comercial: d.nombre_comercial,
    p_whatsapp_number: d.whatsapp_number || '',
    p_contact_email: d.contact_email || '',
    p_color_primary: d.color_primary,
    p_color_secondary: d.color_secondary,
    p_color_accent: d.color_accent,
    p_is_active: d.is_active === 'true',
    p_subdomain: d.subdomain || '',
    p_custom_domain: d.custom_domain || '',
  } as never)

  if (error) return { error: `No se pudo actualizar: ${error.message}` }

  revalidatePath('/admin')
  revalidatePath(`/admin/${d.tenant_id}`)
  return { ok: true }
}
