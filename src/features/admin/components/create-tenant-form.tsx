'use client'

import { useActionState, useState } from 'react'
import { Loader2, Plus, Check } from 'lucide-react'
import { createTenantAction, type AdminState } from '@/features/admin/services/actions'

const input =
  'w-full rounded-xl border border-navy-900/15 bg-white px-3.5 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/40'

export function CreateTenantForm() {
  const [state, action, pending] = useActionState<AdminState, FormData>(createTenantAction, {})
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus className="h-4 w-4" /> Nuevo tenant
      </button>
    )
  }

  return (
    <form action={action} className="rounded-2xl border border-navy-900/10 bg-white p-6">
      <h3 className="text-lg font-semibold text-navy-900">Onboarding de nuevo tenant</h3>
      <p className="mt-1 text-sm text-navy-900/60">Se crea con el catálogo de líneas por defecto.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Nombre comercial</span>
          <input name="nombre_comercial" required className={input} placeholder="Otra Agencia Seguros" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Slug</span>
          <input name="slug" required className={input} placeholder="otra-agencia" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Subdominio</span>
          <input name="subdomain" className={input} placeholder="otraagencia" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">NIT</span>
          <input name="nit" className={input} placeholder="900.000.000-0" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Razón social</span>
          <input name="razon_social" className={input} placeholder="Otra Agencia Ltda" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Correo de contacto</span>
          <input name="contact_email" type="email" className={input} placeholder="info@otra.co" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">WhatsApp</span>
          <input name="whatsapp_number" className={input} placeholder="573000000000" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Correo del admin (opcional)</span>
          <input name="admin_email" type="email" className={input} placeholder="admin@otra.co" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Color primario</span>
          <input name="color_primary" defaultValue="#1A1F4E" className={input} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Color secundario</span>
          <input name="color_secondary" defaultValue="#2A3170" className={input} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-navy-900">Color acento</span>
          <input name="color_accent" defaultValue="#A8C5A8" className={input} />
        </label>
      </div>

      {state.error && <p className="mt-4 text-sm text-red-600">{state.error}</p>}
      {state.ok && (
        <p className="mt-4 flex items-center gap-1 text-sm text-green-600">
          <Check className="h-4 w-4" /> Tenant creado. {state.notice}
        </p>
      )}

      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear tenant'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-outline">
          Cerrar
        </button>
      </div>
    </form>
  )
}
