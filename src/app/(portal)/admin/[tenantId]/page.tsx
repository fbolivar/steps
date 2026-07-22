import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getPortalContext } from '@/features/auth/services/session'
import { getTenantById } from '@/features/admin/services/tenants'
import { EditTenantForm } from '@/features/admin/components/edit-tenant-form'

export default async function EditTenantPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params
  const ctx = await getPortalContext()
  if (!ctx) redirect('/login')
  if (ctx.role !== 'super_admin') redirect('/portal')

  const tenant = await getTenantById(tenantId)
  if (!tenant) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-navy-900/60 hover:text-brand-primary">
        <ChevronLeft className="h-4 w-4" /> Volver a tenants
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-navy-900">{tenant.nombre_comercial}</h1>
      <p className="mb-6 text-sm text-navy-900/50">
        Slug: {tenant.slug} · Branding y configuración de marca blanca.
      </p>
      <EditTenantForm tenant={tenant} canEditDomain={ctx.role === 'super_admin'} />
    </div>
  )
}
