import { redirect } from 'next/navigation'
import { getPortalContext } from '@/features/auth/services/session'
import { getTenantById } from '@/features/admin/services/tenants'
import { getTenantAgents } from '@/features/admin/services/agents'
import { EditTenantForm } from '@/features/admin/components/edit-tenant-form'
import { AgentsManager } from '@/features/admin/components/agents-manager'

export default async function ConfiguracionPage() {
  const ctx = await getPortalContext()
  if (!ctx) redirect('/login')
  // Solo administración del tenant. agente/editor no configuran.
  if (ctx.role !== 'tenant_admin' && ctx.role !== 'super_admin') redirect('/portal')

  const [tenant, agents] = await Promise.all([getTenantById(ctx.tenant.id), getTenantAgents(ctx.tenant.id)])
  if (!tenant) redirect('/portal')

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Configuración de {tenant.nombre_comercial}</h1>
        <p className="text-sm text-navy-900/60">Marca, contacto y equipo de agentes de tu agencia.</p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-900/50">Marca y contacto</h2>
        {/* El dominio/subdominio solo lo edita super_admin desde /admin. */}
        <EditTenantForm tenant={tenant} canEditDomain={ctx.role === 'super_admin'} />
      </div>

      <AgentsManager agents={agents} />
    </div>
  )
}
