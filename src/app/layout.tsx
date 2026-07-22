import type { Metadata, Viewport } from 'next'
import { Poppins, Inter } from 'next/font/google'
import './globals.css'
import { getActiveTenant, tenantBrandStyle } from '@/shared/lib/tenant'
import { PwaRegister } from '@/shared/components/pwa-register'

// Titulares: sans geométrica bold (estilo insurance business). Cuerpo: sans neutra.
const heading = Poppins({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-heading' })
const body = Inter({ subsets: ['latin'], variable: '--font-body' })

export const viewport: Viewport = {
  themeColor: '#0E3B37',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getActiveTenant()
  return {
    title: {
      default: `${tenant.nombre_comercial} · Seguros a tu medida`,
      template: `%s · ${tenant.nombre_comercial}`,
    },
    description:
      'Agencia de seguros en Colombia. Soluciones para personas, familias, empresas y ' +
      'cooperativas, con asesoría transparente y más de 15 aseguradoras aliadas.',
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    manifest: '/manifest.webmanifest',
    applicationName: tenant.nombre_comercial,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: tenant.nombre_comercial,
    },
    icons: {
      icon: [
        { url: '/pwa-icon/192', sizes: '192x192', type: 'image/png' },
        { url: '/pwa-icon/512', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/pwa-icon/192', sizes: '192x192', type: 'image/png' }],
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getActiveTenant()

  return (
    <html lang="es" className={`${heading.variable} ${body.variable}`} style={tenantBrandStyle(tenant)}>
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  )
}
