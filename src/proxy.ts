import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/database.types'

type CookieToSet = { name: string; value: string; options?: CookieOptions }

/**
 * Proxy (antes "middleware", renombrado en Next 16). Hace dos cosas:
 *
 * 1. Resolución de tenant por HOST (dominio/subdominio), nunca por parámetro de
 *    URL — el host es la única fuente de verdad del tenant, evita fugas de datos
 *    entre tenants por errores de routing. Expone x-tenant-host / x-tenant-hint.
 *
 * 2. Refresca la sesión de Supabase (auth SSR) para que los Server Components y
 *    el portal de agentes tengan cookies de sesión válidas.
 */

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'stepsseguros.app'
const DEFAULT_TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? 'steps'
const IS_PROD = process.env.NODE_ENV === 'production'

/**
 * Content-Security-Policy. En producción usa nonce + strict-dynamic (defensa XSS
 * fuerte: solo corren scripts con el nonce y sus descendientes). En desarrollo
 * se relaja (unsafe-eval/inline) para no romper el HMR de Next.
 *
 * Orígenes permitidos: Supabase (auth/rest), Unsplash/https (imágenes),
 * Cloudflare Turnstile (captcha, script+iframe).
 */
function buildCsp(nonce: string): string {
  const scriptSrc = IS_PROD
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
    : `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
  return [
    `default-src 'self'`,
    scriptSrc,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com`,
    `frame-src 'self' https://challenges.cloudflare.com`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `media-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ')
}

function computeTenantHint(hostname: string): string {
  const host = hostname.split(':')[0]

  // Desarrollo local: <sub>.localhost => tenant <sub> (para probar multitenant
  // sin DNS). localhost pelado o IP => tenant por defecto.
  if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return DEFAULT_TENANT
  if (host.endsWith('.localhost')) {
    const sub = host.slice(0, -'.localhost'.length)
    return !sub || sub === 'www' ? DEFAULT_TENANT : sub
  }

  // Subdominio de la plataforma: <slug>.stepsseguros.app
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = host.slice(0, -1 * (ROOT_DOMAIN.length + 1))
    if (!sub || sub === 'www') return DEFAULT_TENANT
    return sub
  }

  // Dominio custom: match por host completo en la capa de datos.
  return 'custom'
}

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const hint = computeTenantHint(hostname)

  // Cabeceras de tenant sobre el request (las leen los Server Components).
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-host', hostname.split(':')[0])
  requestHeaders.set('x-tenant-hint', hint)

  // CSP: en prod, nonce por request para que Next lo aplique a sus scripts.
  const nonce = IS_PROD ? btoa(crypto.randomUUID()) : ''
  const csp = buildCsp(nonce)
  if (IS_PROD) {
    requestHeaders.set('x-nonce', nonce)
    requestHeaders.set('content-security-policy', csp)
  }

  let response = NextResponse.next({ request: { headers: requestHeaders } })

  // Refresh de sesión Supabase: sincroniza cookies de auth en request/response.
  // Resiliente: si faltan las env vars o la llamada falla, NO tumbamos el
  // middleware (el sitio degrada en vez de dar 500 en todas las rutas).
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: CookieToSet[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request: { headers: requestHeaders } })
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          },
        },
      })
      await supabase.auth.getUser()
    } catch {
      // No bloquear la request por un fallo de auth/configuración.
    }
  }

  // CSP en la respuesta final (cubre la respuesta recreada por setAll).
  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
