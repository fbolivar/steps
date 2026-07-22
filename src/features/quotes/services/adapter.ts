import 'server-only'

/**
 * QuoteProviderAdapter — capa desacoplada de proveedor de cotización.
 *
 * SUPUESTO A VALIDAR (Agentemotor): agentemotor.com es un SaaS usuario/clave
 * sin documentación pública de API. No asumimos que exista una API. Por eso el
 * sitio captura la solicitud en NUESTRA base de datos y delega el cálculo/gestión
 * a un adaptador intercambiable:
 *
 *   A (ideal)    → AgentemotorApiAdapter: API/webhook de partners, SI existe.
 *   B (fallback) → ManualAdapter: el agente interno replica la cotización en
 *                  Agentemotor manualmente. Es el MÍNIMO VIABLE de hoy.
 *   C (RPA)      → BrowserAutomationAdapter: automatización de UI. Frágil y de
 *                  mayor riesgo legal/ToS. NO IMPLEMENTAR sin autorización
 *                  explícita del cliente y verificación de los términos de
 *                  servicio de Agentemotor.
 *
 * El resto del sistema (formulario, portal, notificaciones) depende SOLO de
 * esta interfaz, nunca de un proveedor concreto.
 */

export type QuoteInput = {
  tenantSlug: string
  segment: 'personas' | 'empresas'
  insuranceLineSlug: string
  riskPayload: Record<string, unknown>
}

export type QuoteDispatchResult = {
  provider: 'manual' | 'agentemotor_api' | 'rpa'
  /** true si el proveedor produjo un resultado automático (no expuesto al cliente). */
  automated: boolean
  providerReference: string | null
  /** Resultado crudo del proveedor. NUNCA se envía al cliente final. */
  rawResult: unknown | null
  /** Mensaje interno para el agente. */
  note: string
}

export interface QuoteProviderAdapter {
  readonly id: QuoteDispatchResult['provider']
  dispatch(input: QuoteInput): Promise<QuoteDispatchResult>
}

/** Adaptador B — fallback manual. Mínimo viable actual. */
export class ManualAdapter implements QuoteProviderAdapter {
  readonly id = 'manual' as const
  async dispatch(_input: QuoteInput): Promise<QuoteDispatchResult> {
    return {
      provider: 'manual',
      automated: false,
      providerReference: null,
      rawResult: null,
      note: 'Cotización pendiente de gestión manual por el agente en Agentemotor.',
    }
  }
}

/** Adaptador A — API/webhook de Agentemotor (SUPUESTO A VALIDAR: no confirmado). */
export class AgentemotorApiAdapter implements QuoteProviderAdapter {
  readonly id = 'agentemotor_api' as const
  async dispatch(_input: QuoteInput): Promise<QuoteDispatchResult> {
    // SUPUESTO A VALIDAR: requiere que Agentemotor exponga API/webhook para
    // partners con credenciales por sub-agente. Hasta confirmarlo, no se usa.
    throw new Error('AgentemotorApiAdapter no disponible: API de Agentemotor sin confirmar.')
  }
}

/**
 * Selecciona el adaptador activo. Hoy siempre ManualAdapter (B). Cuando se
 * confirme la API de Agentemotor, este selector decide A vs B por configuración
 * del tenant (tenants.uses_shared_quote_engine y credenciales por tenant).
 */
export function getQuoteAdapter(): QuoteProviderAdapter {
  const provider = process.env.QUOTE_PROVIDER ?? 'manual'
  switch (provider) {
    case 'agentemotor_api':
      return new AgentemotorApiAdapter()
    // 'rpa' deshabilitado a propósito: requiere autorización explícita.
    case 'manual':
    default:
      return new ManualAdapter()
  }
}
