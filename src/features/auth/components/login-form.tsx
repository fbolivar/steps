'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { loginAction, type LoginState } from '@/features/auth/services/actions'

// Campo segun el sistema de marca (ver `.field` en globals.css).
const inputClass = 'field py-3'

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {})

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy-900">
          Correo
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} placeholder="tu@correo.com" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-navy-900">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
          placeholder="••••••••"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Ingresando…
          </>
        ) : (
          'Ingresar'
        )}
      </button>
    </form>
  )
}
