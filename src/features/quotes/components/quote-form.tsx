'use client'

import { useActionState, useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, ChevronRight, ChevronLeft, ShieldCheck, Loader2 } from 'lucide-react'
import { submitQuoteAction, type QuoteFormState } from '@/features/quotes/services/submit'
import { Turnstile } from '@/features/quotes/components/turnstile'

type LineOption = { slug: string; name: string; segment: 'personas' | 'empresas' }

const inputClass =
  'w-full rounded-xl border border-navy-900/15 bg-white px-4 py-3 text-sm text-navy-900 ' +
  'placeholder:text-navy-900/40 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/40'

const initialState: QuoteFormState = { ok: false }

export function QuoteForm({
  tenantSlug,
  lines,
  prefillLine,
  prefillSegment,
}: {
  tenantSlug: string
  lines: LineOption[]
  prefillLine?: string
  prefillSegment?: 'personas' | 'empresas'
}) {
  const [step, setStep] = useState(0)
  const [segment, setSegment] = useState<'personas' | 'empresas'>(prefillSegment ?? 'personas')
  const [lineSlug, setLineSlug] = useState(prefillLine ?? '')
  const [risk, setRisk] = useState({ descripcion: '', ciudad: '' })
  const [state, formAction, pending] = useActionState(submitQuoteAction, initialState)

  const segmentLines = useMemo(() => lines.filter((l) => l.segment === segment), [lines, segment])
  const selectedLine = lines.find((l) => l.slug === lineSlug)

  // Pantalla de confirmación: acuse SIN prima/coberturas/resultado.
  if (state.ok) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent/25 text-brand-primary">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-navy-900">¡Recibimos tu solicitud!</h2>
        <p className="mt-3 text-navy-900/70">
          Un asesor revisará tu caso y te contactará en las próximas horas con la mejor alternativa entre
          nuestras aseguradoras aliadas.
        </p>
        {state.reference && (
          <p className="mt-4 inline-block rounded-full bg-brand-primary/5 px-4 py-2 text-sm font-semibold text-brand-primary">
            Radicado: {state.reference}
          </p>
        )}
        <div className="mt-8">
          <Link href="/" className="btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const steps = ['Tipo de seguro', 'Sobre el riesgo', 'Tus datos']
  const canNext0 = Boolean(lineSlug)
  const canNext1 = risk.descripcion.trim().length > 2

  return (
    <div className="mx-auto max-w-2xl">
      {/* Stepper */}
      <ol className="mb-8 flex items-center justify-center gap-2 text-xs font-medium">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                i <= step ? 'bg-brand-primary text-white' : 'bg-navy-900/10 text-navy-900/50'
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={i <= step ? 'text-navy-900' : 'text-navy-900/40'}>{s}</span>
            {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-navy-900/15" />}
          </li>
        ))}
      </ol>

      <form action={formAction} className="card-triangle p-8">
        {/* Campos ocultos que viajan a la Server Action */}
        <input type="hidden" name="tenantSlug" value={tenantSlug} />
        <input type="hidden" name="segment" value={segment} />
        <input type="hidden" name="insuranceLineSlug" value={lineSlug} />
        <input type="hidden" name="riskPayload" value={JSON.stringify(risk)} />

        {/* PASO 1 */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <span className="mb-2 block text-sm font-medium text-navy-900">¿Para quién es el seguro?</span>
              <div className="grid grid-cols-2 gap-3">
                {(['personas', 'empresas'] as const).map((seg) => (
                  <button
                    type="button"
                    key={seg}
                    onClick={() => {
                      setSegment(seg)
                      setLineSlug('')
                    }}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition-colors ${
                      segment === seg
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                        : 'border-navy-900/15 text-navy-900/70 hover:border-brand-primary/40'
                    }`}
                  >
                    {seg}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="line" className="mb-2 block text-sm font-medium text-navy-900">
                Tipo de seguro
              </label>
              <select id="line" value={lineSlug} onChange={(e) => setLineSlug(e.target.value)} className={inputClass}>
                <option value="">Selecciona…</option>
                {segmentLines.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* PASO 2 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="desc" className="mb-2 block text-sm font-medium text-navy-900">
                Cuéntanos qué necesitas asegurar
              </label>
              <textarea
                id="desc"
                rows={4}
                className={inputClass}
                placeholder={
                  selectedLine ? `Ej. detalles para tu seguro de ${selectedLine.name}` : 'Describe el riesgo a asegurar'
                }
                value={risk.descripcion}
                onChange={(e) => setRisk((r) => ({ ...r, descripcion: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="ciudad" className="mb-2 block text-sm font-medium text-navy-900">
                Ciudad
              </label>
              <input
                id="ciudad"
                className={inputClass}
                placeholder="Bogotá"
                value={risk.ciudad}
                onChange={(e) => setRisk((r) => ({ ...r, ciudad: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* PASO 3 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="contactName" className="mb-1.5 block text-sm font-medium text-navy-900">
                Nombre completo
              </label>
              <input id="contactName" name="contactName" required className={inputClass} placeholder="Tu nombre" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contactDocument" className="mb-1.5 block text-sm font-medium text-navy-900">
                  Documento (opcional)
                </label>
                <input id="contactDocument" name="contactDocument" className={inputClass} placeholder="C.C." />
              </div>
              <div>
                <label htmlFor="contactPhone" className="mb-1.5 block text-sm font-medium text-navy-900">
                  Teléfono
                </label>
                <input id="contactPhone" name="contactPhone" required className={inputClass} placeholder="300 000 0000" />
              </div>
            </div>
            <div>
              <label htmlFor="contactEmail" className="mb-1.5 block text-sm font-medium text-navy-900">
                Correo (opcional)
              </label>
              <input id="contactEmail" name="contactEmail" type="email" className={inputClass} placeholder="tu@correo.com" />
            </div>

            <label className="flex items-start gap-3 rounded-xl bg-brand-primary/5 p-4 text-sm text-navy-900/70">
              <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-[color:rgb(var(--brand-primary))]" />
              <span>
                Autorizo el tratamiento de mis datos personales conforme a la{' '}
                <Link href="/legal/tratamiento-de-datos" className="font-semibold text-brand-primary underline" target="_blank">
                  Política de tratamiento de datos
                </Link>{' '}
                (Ley 1581 de 2012).
              </span>
            </label>

            <p className="flex items-center gap-2 text-xs text-navy-900/50">
              <ShieldCheck className="h-4 w-4 text-brand-accent" />
              Tu cotización la gestiona un asesor humano. No verás cifras automáticas en pantalla.
            </p>

            {/* Captcha (se muestra solo si NEXT_PUBLIC_TURNSTILE_SITE_KEY está configurada) */}
            <Turnstile />
          </div>
        )}

        {state.error && <p className="mt-4 text-sm text-red-600">{state.error}</p>}

        {/* Navegación */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={`btn-outline ${step === 0 ? 'invisible' : ''}`}
          >
            <ChevronLeft className="h-4 w-4" /> Atrás
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 0 && !canNext0) || (step === 1 && !canNext1)}
              className="btn-primary"
            >
              Continuar <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
                </>
              ) : (
                <>Enviar solicitud</>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
