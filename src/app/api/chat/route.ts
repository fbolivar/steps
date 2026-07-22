import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { getActiveTenant } from '@/shared/lib/tenant'
import { getInsuranceLines } from '@/features/site/services/content'
import { buildSystemPrompt } from '@/features/chat/services/system-prompt'
import { getClientIp, rateLimit } from '@/shared/lib/rate-limit'

export const runtime = 'nodejs'

// El asistente es informativo/enrutador: respuestas cortas, sin razonamiento visible.
const MODEL = process.env.CHAT_MODEL ?? 'claude-opus-4-8'
const MAX_TOKENS = 1024
const MAX_MESSAGES = 24 // límite de historia por request

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(MAX_MESSAGES),
})

export async function POST(req: Request) {
  // Rate limit por IP para proteger el costo del modelo: 12/min y 80/hora.
  const ip = getClientIp(req.headers)
  const [okMinute, okHour] = await Promise.all([
    rateLimit('chat_min', ip, 12, 60),
    rateLimit('chat_hour', ip, 80, 3600),
  ])
  if (!okMinute || !okHour) {
    return Response.json(
      { reply: 'Has enviado muchos mensajes en poco tiempo. Espera un momento o escríbenos por WhatsApp.', escalate: true },
      { status: 429 }
    )
  }

  let parsed
  try {
    parsed = BodySchema.parse(await req.json())
  } catch {
    return Response.json({ error: 'Solicitud inválida.' }, { status: 400 })
  }

  const tenant = await getActiveTenant()

  // Degradación con elegancia: sin API key, no exponemos error; derivamos a canal humano.
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({
      reply:
        'Por ahora el chat automático no está disponible. Con gusto te atiende un asesor: ' +
        'usa el botón de WhatsApp o deja tu solicitud en "Cotizar" y te contactamos.',
      escalate: true,
    })
  }

  const lines = await getInsuranceLines(tenant.id)
  const system = buildSystemPrompt(tenant, lines)

  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      thinking: { type: 'disabled' },
      system,
      messages: parsed.messages,
    })

    const reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()

    return Response.json({
      reply: reply || 'Disculpa, no pude generar una respuesta. ¿Quieres que te contacte un asesor?',
    })
  } catch {
    return Response.json({
      reply:
        'Tuvimos un inconveniente para responder. Un asesor humano puede ayudarte: ' +
        'escríbenos por WhatsApp o deja tu solicitud en "Cotizar".',
      escalate: true,
    })
  }
}
