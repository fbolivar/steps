'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import { TESTIMONIALS } from '@/shared/constants/site'

const INTERVALO_MS = 7000

/**
 * Testimonios que se van alternando.
 *
 * El orden se baraja UNA vez al montar y luego avanza en secuencia: así cada
 * visita empieza por un testimonio distinto y, dentro de una misma visita, no
 * se repite ninguno hasta haberlos mostrado todos (si se eligiera al azar en
 * cada paso, saldría el mismo dos veces seguidas a menudo).
 *
 * El primer render es siempre el testimonio 0, igual en servidor y en cliente:
 * barajar durante el render rompería la hidratación de React. La mezcla ocurre
 * en el efecto, ya en el navegador.
 *
 * Accesibilidad: se detiene al pasar el cursor o al enfocar con teclado (WCAG
 * 2.2.2 pide poder pausar el contenido que se actualiza solo), no rota si el
 * sistema pide reducir movimiento, y los puntos permiten ir a uno concreto.
 */
export function TestimonialsRotator() {
  const [orden, setOrden] = useState<number[]>(() => TESTIMONIALS.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [pausado, setPausado] = useState(false)
  const animar = useRef(true)

  // Baraja al montar (Fisher-Yates) y respeta la preferencia de movimiento.
  useEffect(() => {
    const idx = TESTIMONIALS.map((_, i) => i)
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[idx[i], idx[j]] = [idx[j], idx[i]]
    }
    setOrden(idx)
    animar.current = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (pausado || !animar.current) return
    const t = setInterval(() => setPos((p) => (p + 1) % TESTIMONIALS.length), INTERVALO_MS)
    return () => clearInterval(t)
  }, [pausado])

  const actual = useMemo(() => TESTIMONIALS[orden[pos] ?? 0], [orden, pos])

  return (
    <div
      className="card-soft relative flex flex-col p-8"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div className="flex gap-1 text-brand-accent">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>

      {/* `key` fuerza el remontaje: cada testimonio entra con su propia
          animación de aparición. `aria-live` lo anuncia al cambiar. */}
      <div className="flex-1" aria-live="polite">
        <blockquote key={`${orden[pos]}-${pos}`} className="animate-fade-up">
          <p className="mt-4 min-h-[7rem] text-navy-700">“{actual.quote}”</p>
          <footer className="mt-6 flex items-center gap-3">
            <span className="h-10 w-10 shrink-0 rounded-full bg-brand-accent/20" />
            <div>
              <p className="text-sm font-semibold text-navy-900">{actual.author}</p>
              <p className="text-xs text-navy-400">{actual.role}</p>
            </div>
          </footer>
        </blockquote>
      </div>

      {/* Puntos: indican en cuál va y permiten saltar a uno concreto. */}
      <div className="mt-6 flex gap-1.5">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPos(i)}
            aria-label={`Ver testimonio ${i + 1} de ${TESTIMONIALS.length}`}
            aria-current={i === pos}
            className={
              i === pos
                ? 'h-1.5 w-6 rounded-full bg-brand-accent transition-all'
                : 'h-1.5 w-1.5 rounded-full bg-steel transition-all hover:bg-brand-accent/40'
            }
          />
        ))}
      </div>
    </div>
  )
}
