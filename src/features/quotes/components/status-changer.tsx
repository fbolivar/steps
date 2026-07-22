'use client'

import { useActionState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { updateQuoteStatus, type StatusState } from '@/features/quotes/services/status'
import { QUOTE_STATUSES, STATUS_LABEL, type QuoteStatus } from '@/features/quotes/constants'

export function StatusChanger({ quoteId, current }: { quoteId: string; current: QuoteStatus }) {
  const [state, action, pending] = useActionState<StatusState, FormData>(updateQuoteStatus, {})

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="quoteId" value={quoteId} />
      <label htmlFor="status" className="block text-sm font-medium text-navy-900">
        Estado de la cotización
      </label>
      <div className="flex gap-2">
        <select
          id="status"
          name="status"
          defaultValue={current}
          className="flex-1 rounded-xl border border-navy-900/15 bg-white px-4 py-2.5 text-sm text-navy-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
        >
          {QUOTE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button type="submit" disabled={pending} className="btn-primary px-5 py-2.5">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
        </button>
      </div>
      {state.ok && (
        <p className="flex items-center gap-1 text-sm text-green-600">
          <Check className="h-4 w-4" /> Estado actualizado.
        </p>
      )}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  )
}
