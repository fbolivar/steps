'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPortalContext } from '@/features/auth/services/session'

export type AgentActionState = { ok?: boolean; error?: string; notice?: string }

function canAdminTenant(role: string) {
  return role === 'super_admin' || role === 'tenant_admin'
}

/** Activa/desactiva la recepción de cotizaciones (round-robin) de un agente. */
export async function setAgentAccepting(agentId: string, accepting: boolean): Promise<AgentActionState> {
  const ctx = await getPortalContext()
  if (!ctx || !canAdminTenant(ctx.role)) return { error: 'No autorizado.' }
  if (!agentId) return { error: 'Agente inválido.' }

  const supabase = await createClient()
  // RLS (agents_admin_write) ya limita a admins del tenant; además filtramos por tenant activo.
  const { error } = await supabase
    .from('agents')
    .update({ is_accepting_leads: accepting } as never)
    .eq('id', agentId)
    .eq('tenant_id', ctx.tenant.id)

  if (error) return { error: 'No se pudo actualizar el agente.' }
  revalidatePath('/portal/configuracion')
  return { ok: true }
}

const AddSchema = z.object({
  email: z.string().email('Correo inválido.'),
  display_name: z.string().min(2, 'Nombre requerido.'),
  whatsapp_number: z.string().optional().or(z.literal('')),
})

/**
 * Agrega un agente al tenant. Crear el usuario de acceso requiere service_role
 * (createAdminClient); sin esa clave, se informa que falta configurarla.
 */
export async function addAgentAction(_prev: AgentActionState, formData: FormData): Promise<AgentActionState> {
  const ctx = await getPortalContext()
  if (!ctx || !canAdminTenant(ctx.role)) return { error: 'No autorizado.' }

  const parsed = AddSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  const d = parsed.data

  const admin = createAdminClient()
  if (!admin) {
    return {
      error:
        'Para crear el usuario del agente falta configurar SUPABASE_SERVICE_ROLE_KEY. ' +
        'Cárgala en el entorno y vuelve a intentarlo.',
    }
  }

  // Invitación por correo: el agente define su propia contraseña.
  const { data: userRes, error: uErr } = await admin.auth.admin.inviteUserByEmail(d.email)
  if (uErr || !userRes?.user) {
    return { error: `No se pudo invitar al agente (¿SMTP configurado?): ${uErr?.message ?? 'correo ya registrado'}` }
  }
  const uid = userRes.user.id

  await admin.from('tenant_members').insert({ tenant_id: ctx.tenant.id, user_id: uid, role: 'agente' } as never)
  await admin
    .from('agents')
    .insert({
      tenant_id: ctx.tenant.id,
      user_id: uid,
      display_name: d.display_name,
      email: d.email,
      whatsapp_number: d.whatsapp_number || null,
      is_accepting_leads: true,
    } as never)

  revalidatePath('/portal/configuracion')
  return { ok: true, notice: 'Agente invitado por correo para que defina su contraseña.' }
}
