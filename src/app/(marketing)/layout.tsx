import { Header } from '@/shared/components/header'
import { Footer } from '@/shared/components/footer'
import { ChatWidget } from '@/features/chat/components/chat-widget'
import { getActiveTenant } from '@/shared/lib/tenant'

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getActiveTenant()

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        tenant={{
          nombre_comercial: tenant.nombre_comercial,
          logo_url: tenant.logo_url,
          slug: tenant.slug,
          whatsapp_number: tenant.whatsapp_number,
          contact_email: tenant.contact_email,
          address: tenant.address,
        }}
      />
      <main className="flex-1">{children}</main>
      <Footer tenant={tenant} />
      <ChatWidget tenantName={tenant.nombre_comercial} whatsappNumber={tenant.whatsapp_number} />
    </div>
  )
}
