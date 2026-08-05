'use client'

import { useState } from 'react'

/**
 * Formulario de contacto simple (Fase 1). Sin backend de correo todavía:
 * compone un mailto al correo del tenant. En Fase 2 se reemplaza el onSubmit
 * por una Server Action que registre el lead y notifique al agente.
 */
export function ContactForm({ contactEmail }: { contactEmail: string | null }) {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const nombre = String(form.get('nombre') ?? '')
    const email = String(form.get('email') ?? '')
    const mensaje = String(form.get('mensaje') ?? '')
    const to = contactEmail ?? ''
    const subject = encodeURIComponent(`Contacto web · ${nombre}`)
    const body = encodeURIComponent(`Nombre: ${nombre}\nCorreo: ${email}\n\n${mensaje}`)
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`
    setSent(true)
  }

  // Campo segun el sistema de marca (ver `.field` en globals.css).
  const inputClass = 'field py-3'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-navy-900">
          Nombre
        </label>
        <input id="nombre" name="nombre" required className={inputClass} placeholder="Tu nombre" />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy-900">
          Correo
        </label>
        <input id="email" name="email" type="email" required className={inputClass} placeholder="tu@correo.com" />
      </div>
      <div>
        <label htmlFor="mensaje" className="mb-1.5 block text-sm font-medium text-navy-900">
          Mensaje
        </label>
        <textarea id="mensaje" name="mensaje" required rows={4} className={inputClass} placeholder="¿Cómo podemos ayudarte?" />
      </div>
      <button type="submit" className="btn-primary w-full">
        Enviar mensaje
      </button>
      {sent && (
        <p className="text-sm text-brand-primary">
          Se abrió tu cliente de correo. Si no, escríbenos a {contactEmail}.
        </p>
      )}
    </form>
  )
}
