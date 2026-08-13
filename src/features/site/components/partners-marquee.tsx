import { PARTNERS } from '@/shared/constants/site'
import { PartnerLogo } from './partner-logo'

/**
 * Carrusel continuo de aseguradoras aliadas.
 *
 * Es un marquee de CSS puro: la pista lleva la lista DOS veces y se desplaza
 * media pista, así el bucle no tiene costura ni salto. Sin JavaScript, sin
 * flechas ni puntos que estorben, y funciona igual en móvil.
 *
 * Detalles de comportamiento (ver `.marquee` en globals.css):
 *  - se detiene al pasar el cursor o al enfocar con teclado, para poder leer;
 *  - si el sistema pide reducir movimiento, no anima: queda una fila
 *    desplazable a mano;
 *  - la segunda copia va oculta a lectores de pantalla (`aria-hidden`).
 */
export function PartnersMarquee() {
  return (
    <div className="marquee" role="region" aria-label="Aseguradoras aliadas">
      <ul className="marquee__track">
        {PARTNERS.map((p) => (
          <li key={p.logo ?? p.name} className="marquee__item">
            <PartnerLogo partner={p} baseHeight={34} eager />
          </li>
        ))}
        {/* Copia para el bucle continuo: decorativa, no se anuncia. */}
        {PARTNERS.map((p) => (
          <li key={`dup-${p.logo ?? p.name}`} className="marquee__item" aria-hidden="true">
            <PartnerLogo partner={p} baseHeight={34} eager />
          </li>
        ))}
      </ul>
    </div>
  )
}
