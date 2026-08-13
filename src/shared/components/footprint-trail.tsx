import { StepsIsotipo } from './brand-marks'
import { cn } from '@/shared/lib/utils'

/**
 * Rastro de huellas que aparecen una tras otra, como alguien que camina.
 *
 * Es el concepto generador del manual puesto en movimiento: "cada paso deja
 * una huella, nosotros la protegemos". Usa el isotipo oficial, no un dibujo
 * nuevo.
 *
 * Capa puramente decorativa: va detras del contenido, no recibe clics y esta
 * oculta a lectores de pantalla, asi que no cambia el diseno ni la estructura
 * del hero.
 *
 * El camino va de abajo hacia el horizonte: los pasos se alejan, encogen y
 * pierden opacidad, lo que da sensacion de profundidad. Alternan izquierda y
 * derecha respecto al eje de avance, como una zancada real.
 */
const PASOS = 7

/** Posicion, tamano y retardo de cada paso a lo largo del camino. */
function paso(i: number) {
  const t = i / (PASOS - 1) // 0 = mas cerca, 1 = en el horizonte
  const lado = i % 2 === 0 ? -1 : 1 // zancada: alterna pie izquierdo y derecho

  return {
    left: `${58 + t * 34}%`,
    // El camino se queda en la franja baja (la playa): si sube al cielo deja
    // de leerse como una caminata.
    top: `${92 - t * 30}%`,
    // Se encoge con la distancia.
    height: `${42 - t * 20}px`,
    // Ligero vaiven lateral + inclinacion en el sentido de la marcha.
    transform: `translate(-50%, -50%) rotate(${34 + lado * 7}deg) translateX(${lado * 6}px)`,
    // Cada paso entra despues del anterior.
    animationDelay: `${i * 0.55}s`,
    // Los mas lejanos se ven menos.
    ['--tope' as string]: `${0.34 - t * 0.12}`,
  }
}

export function FootprintTrail({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {Array.from({ length: PASOS }, (_, i) => (
        <span key={i} className="huella-paso absolute text-white" style={paso(i)}>
          <StepsIsotipo className="h-full w-auto" />
        </span>
      ))}
    </span>
  )
}
