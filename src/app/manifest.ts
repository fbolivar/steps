import type { MetadataRoute } from 'next'

/**
 * Web App Manifest (PWA). Genera /manifest.webmanifest.
 * Nota marca blanca: por ahora es estático con la marca STEPS. Para manifest
 * por-tenant habría que servir uno por host (mejora futura).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'STEPS Seguros',
    short_name: 'STEPS',
    description: 'Seguros a tu medida para personas, familias y empresas.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0E3B37',
    theme_color: '#0E3B37',
    icons: [
      { src: '/pwa-icon/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
