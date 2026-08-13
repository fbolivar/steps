'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { TECH_INBOX, sendToTechInbox, techMailEnabled } from '@/features/notifications/tech-inbox'
import { getClientIp, rateLimit } from '@/shared/lib/rate-limit'
import { verifyTurnstile } from '@/shared/lib/turnstile'

/**
 * Mensajes del formulario público de contacto. Se envían al buzón técnico.
 *
 * No se persisten en BD: no existe tabla de mensajes y el canal acordado es el
 * correo. Si en el futuro se quiere bandeja en el portal, este es el punto
 * donde insertar el registro.
 */
const ContactSchema = z.object({
  nombre: z.string().min(2, 'Ingresa tu nombre.').max(120),
  email: z.string().email('Ingresa un correo válido.').max(160),
  telefono: z.string().max(40).optional().default(''),
  mensaje: z.string().min(5, 'Cuéntanos un poco más.').max(3000),
  // Campo trampa: los bots lo rellenan, las personas no lo ven. Se acepta en el
  // esquema (si aqui fallara la validacion, el bot recibiria un error que
  // delata la trampa); el descarte ocurre despues, en silencio.
  website: z.string().max(200).optional().default(''),
})

export type ContactFormState = {
  ok: boolean
  error?: string
  /** Correo directo al que escribir si el envío automático no está disponible. */
  fallbackEmail?: string
}

export async function submitContactAction(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = ContactSchema.safeParse({
    nombre: formData.get('nombre'),
    email: formData.get('email'),
    telefono: formData.get('telefono') ?? '',
    mensaje: formData.get('mensaje'),
    website: formData.get('website') ?? '',
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  }
  const d = parsed.data

  // Honeypot relleno → se acusa recibo sin enviar nada (no delatamos la trampa).
  if (d.website) return { ok: true }

  // Anti-abuso: mismo criterio que el formulario de cotización.
  const ip = getClientIp(await headers())
  const [okMin, okHour] = await Promise.all([
    rateLimit('contact_min', ip, 3, 60),
    rateLimit('contact_hour', ip, 10, 3600),
  ])
  if (!okMin || !okHour) {
    return { ok: false, error: 'Demasiados mensajes seguidos. Intenta de nuevo en unos minutos.' }
  }

  // Captcha, igual que en el cotizador. Sin TURNSTILE_SECRET_KEY la verificación
  // deja pasar (gating para desarrollo): el formulario queda protegido solo por
  // el honeypot y el rate limit hasta que se carguen las claves en Vercel.
  const captchaToken = (formData.get('cf-turnstile-response') as string | null) ?? null
  if (!(await verifyTurnstile(captchaToken, ip))) {
    return { ok: false, error: 'No pudimos verificar que eres una persona. Recarga la página e inténtalo de nuevo.' }
  }

  if (!techMailEnabled()) {
    return {
      ok: false,
      error: 'El envío automático no está disponible en este momento.',
      fallbackEmail: TECH_INBOX,
    }
  }

  const sent = await sendToTechInbox(
    `Contacto web · ${d.nombre}`,
    [
      ['Nombre', d.nombre],
      ['Correo', d.email],
      ['Teléfono', d.telefono],
      ['Mensaje', `\n${d.mensaje}`],
    ],
    d.email
  )

  if (!sent.ok) {
    return {
      ok: false,
      error: 'No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos directamente.',
      fallbackEmail: TECH_INBOX,
    }
  }

  return { ok: true }
}
