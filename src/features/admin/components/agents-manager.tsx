'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, UserPlus, Users } from 'lucide-react'
import { addAgentAction, setAgentAccepting, type AgentActionState } from '@/features/admin/services/agent-actions'
import type { AgentRow } from '@/features/admin/services/agents'

const input =
  'w-full rounded-xl border border-navy-900/15 bg-white px-3.5 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/40'

export function AgentsManager({ agents }: { agents: AgentRow[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [addState, addAction, adding] = useActionState<AgentActionState, FormData>(addAgentAction, {})
  const [showAdd, setShowAdd] = useState(false)

  function toggle(agent: AgentRow) {
    setPendingId(agent.id)
    startTransition(async () => {
      await setAgentAccepting(agent.id, !agent.is_accepting_leads)
      setPendingId(null)
      router.refresh()
    })
  }

  return (
    <section className="rounded-2xl border border-navy-900/10 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-900">
          <Users className="h-5 w-5 text-brand-primary" /> Agentes
        </h2>
        <button onClick={() => setShowAdd((v) => !v)} className="btn-outline px-4 py-2">
          <UserPlus className="h-4 w-4" /> Agregar
        </button>
      </div>

      <ul className="mt-4 divide-y divide-navy-900/5">
        {agents.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="font-medium text-navy-900">{a.display_name ?? a.email}</p>
              <p className="text-xs text-navy-900/50">
                {a.email} · {a.active_leads_count} lead(s) activos
              </p>
            </div>
            <button
              onClick={() => toggle(a)}
              disabled={isPending && pendingId === a.id}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                a.is_accepting_leads
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-navy-900/10 text-navy-900/60 hover:bg-navy-900/15'
              }`}
            >
              {isPending && pendingId === a.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <span className={`h-2 w-2 rounded-full ${a.is_accepting_leads ? 'bg-green-600' : 'bg-navy-900/40'}`} />
              )}
              {a.is_accepting_leads ? 'Recibe cotizaciones' : 'No recibe'}
            </button>
          </li>
        ))}
        {agents.length === 0 && <li className="py-4 text-sm text-navy-900/50">Aún no hay agentes en este tenant.</li>}
      </ul>

      {showAdd && (
        <form action={addAction} className="mt-4 grid gap-3 rounded-xl bg-brand-primary/5 p-4 sm:grid-cols-3">
          <input name="display_name" required placeholder="Nombre del agente" className={input} />
          <input name="email" type="email" required placeholder="correo@agencia.co" className={input} />
          <input name="whatsapp_number" placeholder="WhatsApp (opcional)" className={input} />
          <div className="sm:col-span-3">
            {addState.error && <p className="mb-2 text-sm text-red-600">{addState.error}</p>}
            {addState.ok && (
              <p className="mb-2 flex items-center gap-1 text-sm text-green-600">
                <Check className="h-4 w-4" /> {addState.notice}
              </p>
            )}
            <button type="submit" disabled={adding} className="btn-primary">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear agente'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
