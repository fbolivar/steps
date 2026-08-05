import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, ArrowRight, ExternalLink } from 'lucide-react'
import { getPortalContext } from '@/features/auth/services/session'
import { getAllTenants } from '@/features/admin/services/tenants'
import { CreateTenantForm } from '@/features/admin/components/create-tenant-form'

export default async function AdminPage() {
  const ctx = await getPortalContext()
  if (!ctx) redirect('/login')
  if (ctx.role !== 'super_admin') redirect('/portal')

  const tenants = await getAllTenants()

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Administración de marca blanca</h1>
          <p className="text-sm text-navy-600">Gestiona los tenants de la plataforma.</p>
        </div>
        <CreateTenantForm />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-steel bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-steel bg-mist text-xs uppercase tracking-wide text-navy-400">
            <tr>
              <th className="px-5 py-3 font-semibold">Tenant</th>
              <th className="px-5 py-3 font-semibold">Dominio / subdominio</th>
              <th className="px-5 py-3 font-semibold">Líneas</th>
              <th className="px-5 py-3 font-semibold">Agentes</th>
              <th className="px-5 py-3 font-semibold">Cotiz.</th>
              <th className="px-5 py-3 font-semibold">Estado</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-steel">
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-brand-primary/[0.02]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-6 w-6 rounded-md ring-1 ring-steel"
                      style={{ backgroundColor: t.color_primary }}
                      aria-hidden
                    />
                    <div>
                      <p className="font-medium text-navy-900">{t.nombre_comercial}</p>
                      <p className="text-xs text-navy-400">{t.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-navy-600">
                  {t.custom_domain ?? (t.subdomain ? `${t.subdomain}.·` : '—')}
                </td>
                <td className="px-5 py-3 text-navy-600">{t.lines}</td>
                <td className="px-5 py-3 text-navy-600">{t.agents}</td>
                <td className="px-5 py-3 text-navy-600">{t.quotes}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      t.is_active ? 'bg-green-100 text-green-700' : 'bg-steel text-navy-600'
                    }`}
                  >
                    {t.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/${t.id}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline"
                  >
                    Editar <ArrowRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 flex items-center gap-1 text-xs text-navy-400">
        <Building2 className="h-3.5 w-3.5" />
        La resolución de tenant ocurre por host (subdominio o dominio custom) en el proxy.
        <ExternalLink className="h-3 w-3" />
      </p>
    </div>
  )
}
