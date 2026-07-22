import 'server-only'

/**
 * Adaptadores de notificación (Fase 3). Cada uno se auto-desactiva si no tiene
 * credenciales configuradas: el flujo nunca se rompe por falta de setup.
 *
 * SUPUESTO A VALIDAR (WhatsApp): la Cloud API de Meta requiere número de
 * WhatsApp Business verificado y, para notificar fuera de la ventana de 24h,
 * PLANTILLAS aprobadas por Meta. El envío de texto simple de abajo solo funciona
 * dentro de la ventana de sesión; para seguimiento en frío hay que registrar y
 * usar una plantilla aprobada. No se puede mezclar el número de STEPS con el de
 * un tenant de marca blanca (cada tenant su propia línea/plantilla).
 */

export type NotificationTarget = {
  agentName: string
  agentEmail: string | null
  agentWhatsApp: string | null
  tenantName: string
  contactName: string
  lineName: string
  reference: string
}

export type Notifier = {
  id: 'email' | 'whatsapp'
  enabled: boolean
  send(t: NotificationTarget): Promise<{ ok: boolean; detail?: string }>
}

/** Email vía Resend (REST). Requiere RESEND_API_KEY y NOTIFY_FROM_EMAIL. */
export const emailNotifier: Notifier = {
  id: 'email',
  get enabled() {
    return Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_FROM_EMAIL)
  },
  async send(t) {
    const key = process.env.RESEND_API_KEY
    const from = process.env.NOTIFY_FROM_EMAIL
    if (!key || !from || !t.agentEmail) return { ok: false, detail: 'email no configurado' }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: t.agentEmail,
        subject: `Nueva cotización · ${t.lineName} · ${t.reference}`,
        text:
          `Hola ${t.agentName},\n\n` +
          `Entró una nueva cotización en ${t.tenantName}.\n` +
          `Cliente: ${t.contactName}\nProducto: ${t.lineName}\nRadicado: ${t.reference}\n\n` +
          `Gestiónala en el portal de agentes.`,
      }),
    })
    return { ok: res.ok, detail: res.ok ? undefined : `resend ${res.status}` }
  },
}

/** WhatsApp vía Meta Cloud API (REST). Requiere WHATSAPP_TOKEN y WHATSAPP_PHONE_NUMBER_ID. */
export const whatsappNotifier: Notifier = {
  id: 'whatsapp',
  get enabled() {
    return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
  },
  async send(t) {
    const token = process.env.WHATSAPP_TOKEN
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
    if (!token || !phoneId || !t.agentWhatsApp) return { ok: false, detail: 'whatsapp no configurado' }

    const to = t.agentWhatsApp.replace(/[^\d]/g, '')
    // Texto simple (solo válido dentro de la ventana de 24h). Para seguimiento en
    // frío, reemplazar por { type: 'template', template: {...} } con una plantilla aprobada.
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: {
          body:
            `Nueva cotización en ${t.tenantName}\n` +
            `Cliente: ${t.contactName}\nProducto: ${t.lineName}\nRadicado: ${t.reference}`,
        },
      }),
    })
    return { ok: res.ok, detail: res.ok ? undefined : `whatsapp ${res.status}` }
  },
}

export const NOTIFIERS: Notifier[] = [emailNotifier, whatsappNotifier]
