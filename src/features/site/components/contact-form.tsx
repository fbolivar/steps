'use client'

import { useActionState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { submitContactAction, type ContactFormState } from '@/features/site/services/contact'

/**
 * Formulario de contacto. Envía el mensaje al buzón técnico mediante una Server
 * Action (antes solo abría el cliente de correo del visitante, que dependía de
 * que tuviera uno configurado y no dejaba rastro).
 */
const initialState: ContactFormState = { ok: false }

export function ContactForm({ contactEmail }: { contactEmail: string | null }) {
  const [state, action, pending] = useActionState(submitContactAction, initialState)

  const inputClass = 'field py-3'

  if (state.ok) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent text-white shadow-cobalt">
          <Check className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-2xl text-navy-900">Mensaje enviado</h3>
        <p className="mt-2 text-sm text-navy-600">
          Gracias por escribirnos. Un asesor te responderá lo antes posible.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-navy-900">
          Nombre
        </label>
        <input id="nombre" name="nombre" required className={inputClass} placeholder="Tu nombre" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy-900">
            Correo
          </label>
          <input id="email" name="email" type="email" required className={inputClass} placeholder="tu@correo.com" />
        </div>
        <div>
          <label htmlFor="telefono" className="mb-1.5 block text-sm font-medium text-navy-900">
            Teléfono <span className="font-normal text-navy-400">(opcional)</span>
          </label>
          <input id="telefono" name="telefono" className={inputClass} placeholder="300 000 0000" />
        </div>
      </div>
      <div>
        <label htmlFor="mensaje" className="mb-1.5 block text-sm font-medium text-navy-900">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={4}
          className={inputClass}
          placeholder="¿Cómo podemos ayudarte?"
        />
      </div>

      {/* Trampa anti-bots: oculta para personas, invisible para lectores de pantalla. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {state.error && (
        <p className="text-sm text-red-600">
          {state.error}{' '}
          {state.fallbackEmail && (
            <a href={`mailto:${state.fallbackEmail}`} className="font-semibold underline">
              {state.fallbackEmail}
            </a>
          )}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
          </>
        ) : (
          'Enviar mensaje'
        )}
      </button>

      {contactEmail && (
        <p className="text-center text-xs text-navy-400">
          También puedes escribirnos a{' '}
          <a href={`mailto:${contactEmail}`} className="font-medium text-brand-accent hover:underline">
            {contactEmail}
          </a>
        </p>
      )}
    </form>
  )
}
