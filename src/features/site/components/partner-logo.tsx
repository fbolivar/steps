'use client'

import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import type { Partner } from '@/shared/constants/site'

/**
 * Logotipo de una aseguradora aliada.
 *
 * Muestra `/logos/<logo>`. Si la aseguradora no tiene archivo declarado —o si
 * la carga falla— cae al nombre en texto, de modo que el listado siempre se ve
 * completo mientras llegan los logotipos que faltan.
 *
 * Los logotipos son marcas registradas de cada aseguradora: se muestran para
 * identificar a los aliados con los que STEPS opera.
 */

/**
 * Altura relativa segun la proporcion (ancho/alto) del archivo.
 *
 * Fijar la misma altura para todos hace que los logos compactos (HDI, Cesce)
 * se vean diminutos al lado de los muy alargados (Mapfre, Previsora), porque
 * lo que el ojo compara es la SUPERFICIE, no el alto. Estos factores igualan
 * el area aproximada: cuanto mas alargado el logo, menos alto se le da.
 */
function heightFactor(ratio: number | undefined): number {
  if (!ratio) return 1
  if (ratio < 1.8) return 1.65
  if (ratio < 2.6) return 1.32
  if (ratio < 3.5) return 1.1
  if (ratio < 4.8) return 0.94
  return 0.8
}

export function PartnerLogo({
  partner,
  className,
  /** Altura de referencia en px; cada logo se ajusta alrededor de ella. */
  baseHeight = 48,
}: {
  partner: Partner
  className?: string
  baseHeight?: number
}) {
  const [failed, setFailed] = useState(false)

  if (!partner.logo || failed) {
    return <span className={cn('font-semibold text-navy-600', className)}>{partner.name}</span>
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/logos/${partner.logo}`}
      alt={partner.name}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ height: Math.round(baseHeight * heightFactor(partner.ratio)) }}
      className={cn('w-auto max-w-full object-contain', className)}
    />
  )
}
