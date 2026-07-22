'use server'

import { createHmac } from 'node:crypto'
import { headers } from 'next/headers'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Database, Json } from '@/lib/supabase/database.types'
import { getQuoteAdapter } from './adapter'
import { notifyNewQuote } from '@/features/notifications/dispatch'
import { getClientIp, rateLimit } from '@/shared/lib/rate-limit'
import { verifyTurnstile } from '@/shared/lib/turnstile'

type SubmitArgs = Database['public']['Functions']['submit_quote_request']['Args']

/**
 * Validación de la solicitud de cotización. Los datos personales son sensibles
 * (Ley 1581), por eso se validan en el servidor y el consentimiento es
 * obligatorio.
 */
const QuoteSchema = z.object({
  tenantSlug: z.string().min(1),
  segment: z.enum(['personas', 'empresas']),
  insuranceLineSlug: z.string().min(1),
  contactName: z.string().min(2, 'Ingresa tu nombre.'),
  contactDocument: z.string().optional().default(''),
  contactEmail: z.string().email('Correo inválido.').optional().or(z.literal('')),
  contactPhone: z.string().min(7, 'Ingresa un teléfono válido.'),
  riskPayload: z.record(z.string(), z.unknown()).default({}),
  consent: z.literal(true, { message: 'Debes autorizar el tratamiento de datos.' }),
})

export type QuoteFormState = {
  ok: boolean
  error?: string
  /** Solo un acuse; JAMÁS incluye prima, coberturas ni resultado del proveedor. */
  reference?: string
}

export async function submitQuoteAction(
  _prev: QuoteFormState,
  formData: FormData
): Promise<QuoteFormState> {
  const parsed = QuoteSchema.safeParse({
    tenantSlug: formData.get('tenantSlug'),
    segment: formData.get('segment'),
    insuranceLineSlug: formData.get('insuranceLineSlug'),
    contactName: formData.get('contactName'),
    contactDocument: formData.get('contactDocument') ?? '',
    contactEmail: formData.get('contactEmail') ?? '',
    contactPhone: formData.get('contactPhone'),
    riskPayload: safeJson(formData.get('riskPayload')),
    consent: formData.get('consent') === 'on' || formData.get('consent') === 'true',
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  }
  const d = parsed.data

  // Anti-abuso: rate limit por IP (5/min, 20/hora) + captcha (si está configurado).
  const h = await headers()
  const ip = getClientIp(h)
  const [okMin, okHour] = await Promise.all([
    rateLimit('quote_min', ip, 5, 60),
    rateLimit('quote_hour', ip, 20, 3600),
  ])
  if (!okMin || !okHour) {
    return { ok: false, error: 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.' }
  }

  const captchaToken = (formData.get('cf-turnstile-response') as string | null) ?? null
  if (!(await verifyTurnstile(captchaToken, ip))) {
    return { ok: false, error: 'No pudimos validar el captcha. Recarga la página e intenta de nuevo.' }
  }

  const supabase = await createClient()

  // Firma HMAC: solo nuestro servidor (con el secreto) puede autorizar la RPC.
  // Cierra el bypass de llamadas directas a /rest/v1/rpc con la anon key.
  const secret = process.env.QUOTE_SIGNING_SECRET
  if (!secret) {
    return { ok: false, error: 'El servicio de cotización no está configurado. Intenta más tarde.' }
  }
  const ts = Math.floor(Date.now() / 1000)
  const sig = createHmac('sha256', secret).update(`${ts}|${d.tenantSlug}`).digest('hex')

  // 1. Persistir la solicitud vía RPC firmada (anon no puede leer ni forjar la firma).
  const args: SubmitArgs = {
    p_tenant_slug: d.tenantSlug,
    p_segment: d.segment,
    p_insurance_line_slug: d.insuranceLineSlug,
    p_contact_name: d.contactName,
    p_contact_document: d.contactDocument || '',
    p_contact_email: d.contactEmail || '',
    p_contact_phone: d.contactPhone,
    p_risk_payload: d.riskPayload as Json,
    p_consent: true,
    p_ts: ts,
    p_sig: sig,
  }
  // Nota: supabase-js 2.110 tiene un bug de inferencia de genéricos que colapsa
  // el tipo Args a `never` cuando el RPC incluye un parámetro Json (issue
  // conocido). `args` ya está tipado como SubmitArgs; el cast `as never` sortea
  // la firma sin perder el tipo del resultado (data sigue siendo string|null).
  const { data: quoteId, error } = await supabase.rpc('submit_quote_request', args as never)

  if (error || !quoteId) {
    return { ok: false, error: 'No pudimos registrar tu solicitud. Intenta de nuevo.' }
  }

  // 2. Delegar al adaptador de proveedor (hoy: manual). El resultado es INTERNO
  //    y no se retorna al cliente. En Fase 2 aquí se enruta al agente asignado.
  try {
    const adapter = getQuoteAdapter()
    await adapter.dispatch({
      tenantSlug: d.tenantSlug,
      segment: d.segment,
      insuranceLineSlug: d.insuranceLineSlug,
      riskPayload: d.riskPayload,
    })
  } catch {
    // El adaptador no debe bloquear el acuse al cliente: la solicitud ya quedó
    // registrada y un agente la tomará. Se registra para observabilidad en F2.
  }

  // 3. Notificar al agente asignado (email/WhatsApp). No-op si no hay
  //    credenciales; nunca bloquea el acuse al cliente.
  await notifyNewQuote(String(quoteId))

  // 4. Acuse mínimo. Nunca exponemos el resultado de la cotización.
  return { ok: true, reference: String(quoteId).slice(0, 8).toUpperCase() }
}

function safeJson(v: FormDataEntryValue | null): Record<string, unknown> {
  if (typeof v !== 'string' || !v) return {}
  try {
    const parsed = JSON.parse(v)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}
