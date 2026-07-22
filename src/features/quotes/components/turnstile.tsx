'use client'

import { useEffect, useRef } from 'react'

/**
 * Widget de Cloudflare Turnstile. Se renderiza solo si hay site key configurada
 * (NEXT_PUBLIC_TURNSTILE_SITE_KEY). Cloudflare inyecta un input oculto
 * `cf-turnstile-response` dentro del form con el token, que viaja en el submit.
 */
export function Turnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!siteKey) return
    const id = 'cf-turnstile-script'
    if (!document.getElementById(id)) {
      const s = document.createElement('script')
      s.id = id
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      s.async = true
      s.defer = true
      document.head.appendChild(s)
    }
  }, [siteKey])

  if (!siteKey) return null
  return <div ref={ref} className="cf-turnstile mt-2" data-sitekey={siteKey} data-theme="light" />
}
