'use client'

import { useActionState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { updateTenantAction, type AdminState } from '@/features/admin/services/actions'
import type { Tables } from '@/lib/supabase/database.types'

const input =
  'w-full rounded-xl border border-navy-900/15 bg-white px-3.5 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/40'

export function EditTenantForm({ tenant, canEditDomain }: { tenant: Tables<'tenants'>; canEditDomain: boolean }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(updateTenantAction, {})

  return (
    <form action={action} className="rounded-2xl border border-navy-900/10 bg-white p-6">
      <input type="hidden" name="tenant_id" value={tenant.id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Nombre comercial</span>
          <input name="nombre_comercial" defaultValue={tenant.nombre_comercial} required className={input} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">WhatsApp</span>
          <input name="whatsapp_number" defaultValue={tenant.whatsapp_number ?? ''} className={input} placeholder="573000000000" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Correo de contacto</span>
          <input name="contact_email" type="email" defaultValue={tenant.contact_email ?? ''} className={input} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Estado</span>
          <select name="is_active" defaultValue={String(tenant.is_active)} className={input}>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Subdominio {canEditDomain ? '' : '(solo super_admin)'}</span>
          <input name="subdomain" defaultValue={tenant.subdomain ?? ''} className={input} disabled={!canEditDomain} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Dominio custom {canEditDomain ? '' : '(solo super_admin)'}</span>
          <input name="custom_domain" defaultValue={tenant.custom_domain ?? ''} className={input} placeholder="cotiza.otra.co" disabled={!canEditDomain} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Color primario</span>
          <input name="color_primary" defaultValue={tenant.color_primary} className={input} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Color secundario</span>
          <input name="color_secondary" defaultValue={tenant.color_secondary} className={input} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Color acento</span>
          <input name="color_accent" defaultValue={tenant.color_accent} className={input} />
        </label>
      </div>

      {state.error && <p className="mt-4 text-sm text-red-600">{state.error}</p>}
      {state.ok && (
        <p className="mt-4 flex items-center gap-1 text-sm text-green-600">
          <Check className="h-4 w-4" /> Cambios guardados.
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary mt-5">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar cambios'}
      </button>
    </form>
  )
}
