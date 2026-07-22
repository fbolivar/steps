import type { NextConfig } from 'next'

/**
 * Cabeceras de seguridad aplicadas a todas las rutas. La Content-Security-Policy
 * (con nonce) se establece en src/proxy.ts porque es dinámica por request.
 */
const securityHeaders = [
  // Fuerza HTTPS (2 años, subdominios, preload). Ignorado en http local.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Evita MIME sniffing.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Anti-clickjacking (además de CSP frame-ancestors 'none').
  { key: 'X-Frame-Options', value: 'DENY' },
  // No filtrar la URL completa a terceros.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Desactiva APIs potentes que la app no usa.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=()',
  },
  // Aislamiento de ventana (mitiga ataques cross-origin / Spectre).
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // Desactiva el filtro XSS legacy (obsoleto; CSP lo reemplaza).
  { key: 'X-XSS-Protection', value: '0' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig: NextConfig = {
  // No revelar el framework.
  poweredByHeader: false,

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },

  // Activa el MCP server en /_next/mcp (Next.js 16+)
  experimental: {
    mcpServer: true,
  },
}

export default nextConfig
