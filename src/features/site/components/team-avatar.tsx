import { StepsIsotipo } from '@/shared/components/brand-marks'
import type { TeamMember } from '@/shared/constants/site'

/**
 * Avatar de una persona del equipo.
 *
 * Si hay foto, se usa. Si no —el caso hoy—, se dibuja un avatar de marca: las
 * iniciales en Bebas Neue sobre un fondo de la paleta, con la huella del
 * isotipo como marca de agua. Se evita a proposito recurrir a retratos de
 * banco de imagenes, que serian rostros de personas ajenas presentados como el
 * equipo de la agencia.
 *
 * Los fondos alternan entre los tres tonos de marca para que la fila no se vea
 * monotona, siempre con el mismo orden (depende del indice, no del azar, para
 * que no cambie entre servidor y cliente).
 */
const FONDOS = [
  'bg-brand-primary text-white',
  'bg-brand-accent text-white',
  'bg-steel text-brand-primary',
  'bg-brand-gradient text-white',
] as const

/** "Paula Moreno" → "PM". Toma la primera letra de los dos primeros nombres. */
function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('')
}

export function TeamAvatar({ member, index }: { member: TeamMember; index: number }) {
  if (member.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={`/img/${member.photo}`}
        alt={member.name}
        loading="lazy"
        className="aspect-square w-full object-cover"
      />
    )
  }

  return (
    <div
      className={`relative flex aspect-square w-full items-center justify-center overflow-hidden ${
        FONDOS[index % FONDOS.length]
      }`}
      aria-hidden="true"
    >
      {/* Huella de marca, muy tenue, como textura de fondo. */}
      <StepsIsotipo className="absolute -right-4 bottom-0 h-3/4 w-auto opacity-[0.08]" />
      <span className="font-display text-6xl leading-none tracking-display sm:text-7xl">
        {iniciales(member.name)}
      </span>
    </div>
  )
}
