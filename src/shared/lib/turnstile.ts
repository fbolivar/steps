import 'server-only'

/**
 * Verifica un token de Cloudflare Turnstile. Si no hay TURNSTILE_SECRET_KEY
 * configurada, el captcha se considera deshabilitado (dev) y retorna true.
 */
export async function verifyTurnstile(token: string | null, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // captcha deshabilitado (sin secret)
  if (!token) return false

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}

export const captchaEnabled = () => Boolean(process.env.TURNSTILE_SECRET_KEY)
