import 'server-only'

/**
 * Buzón técnico: copia de TODO lo que entra por los formularios públicos
 * (contacto y cotización), independientemente de si hay un agente asignado.
 *
 * Destino por defecto: el correo técnico de STEPS. Se puede sobreescribir por
 * entorno (`NOTIFY_TECH_EMAIL`) sin tocar código — útil para pruebas y para
 * tenants de marca blanca que quieran su propio buzón.
 *
 * Requiere `RESEND_API_KEY` y `NOTIFY_FROM_EMAIL` (dominio verificado en
 * Resend). Si faltan, la función NO lanza: devuelve el motivo para que el
 * llamador decida (los formularios siguen funcionando, ver `contact.ts`).
 */

export const TECH_INBOX = process.env.NOTIFY_TECH_EMAIL ?? 'tecnico@stepseguros.com'

export type TechMailResult = { ok: boolean; reason?: 'sin-configurar' | 'error-envio' }

/** ¿Está configurado el envío de correo? */
export function techMailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_FROM_EMAIL)
}

/**
 * Envía un correo de texto plano al buzón técnico.
 *
 * @param subject  Asunto ya formateado.
 * @param fields   Pares etiqueta → valor que forman el cuerpo.
 * @param replyTo  Correo del interesado, para responderle directo desde el buzón.
 */
export async function sendToTechInbox(
  subject: string,
  fields: Array<[string, string | null | undefined]>,
  replyTo?: string | null
): Promise<TechMailResult> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.NOTIFY_FROM_EMAIL
  if (!key || !from) return { ok: false, reason: 'sin-configurar' }

  const body = fields
    .filter(([, value]) => value != null && String(value).trim() !== '')
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n')

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: TECH_INBOX,
        subject,
        text: body,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    })
    return res.ok ? { ok: true } : { ok: false, reason: 'error-envio' }
  } catch {
    return { ok: false, reason: 'error-envio' }
  }
}
