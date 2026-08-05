import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Montserrat } from 'next/font/google'
import './globals.css'
import { getActiveTenant, tenantBrandStyle } from '@/shared/lib/tenant'
import { PwaRegister } from '@/shared/components/pwa-register'

/**
 * Tipografia del manual de identidad:
 *   Titulares → BEBAS NEUE (la misma del logotipo: condensada, caja alta).
 *   Cuerpo    → MONTSERRAT (se usa Medium 500 como peso base de lectura).
 */
const display = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-display' })
const body = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' })

export const viewport: Viewport = {
  themeColor: '#000831',
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
    <html lang="es" className={`${display.variable} ${body.variable}`} style={tenantBrandStyle(tenant)}>
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  )
}
