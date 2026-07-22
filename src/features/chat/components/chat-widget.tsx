'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { whatsappLink } from '@/shared/lib/utils'

type Msg = { role: 'user' | 'assistant'; content: string }

const GREETING =
  'Hola 👋 Soy el asistente virtual de STEPS Seguros. Puedo orientarte sobre nuestros seguros y ayudarte a cotizar. ¿En qué te ayudo? (No doy cifras de prima; para eso te conecto con un asesor).'

export function ChatWidget({
  tenantName,
  whatsappNumber,
}: {
  tenantName: string
  whatsappNumber: string | null
}) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: GREETING }])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  const waHref = whatsappLink(whatsappNumber, 'Hola, vengo del chat del sitio y quiero hablar con un asesor.')

  async function send() {
    const text = input.trim()
    if (!text || pending) return
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setInput('')
    setPending(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Excluimos el saludo inicial (index 0): el historial enviado empieza en el user.
        body: JSON.stringify({ messages: next.slice(1) }),
      })
      const data = (await res.json()) as { reply?: string; error?: string }
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: data.reply ?? 'No pude responder. ¿Te conecto con un asesor?' },
      ])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Hubo un problema de conexión. Intenta de nuevo o escríbenos por WhatsApp.' },
      ])
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[32rem] w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-card">
          <header className="flex items-center gap-3 bg-brand-primary px-4 py-3 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Asistente {tenantName}</p>
              <p className="text-xs text-white/60">Asistente virtual · en línea</p>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-brand-primary/[0.03] p-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
                    m.role === 'user'
                      ? 'bg-brand-primary text-white'
                      : 'bg-white text-navy-900 shadow-sm ring-1 ring-navy-900/5'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {pending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-3.5 py-2 text-sm text-navy-900/50 shadow-sm ring-1 ring-navy-900/5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="border-t border-navy-900/5 bg-brand-accent/15 px-4 py-2 text-center text-xs font-semibold text-brand-primary hover:bg-brand-accent/25"
            >
              ¿Prefieres un asesor humano? Habla por WhatsApp
            </a>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              void send()
            }}
            className="flex items-center gap-2 border-t border-navy-900/10 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje…"
              className="flex-1 rounded-full border border-navy-900/15 px-4 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-white disabled:opacity-40"
              aria-label="Enviar"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
