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
export function PartnerLogo({
  partner,
  className,
  imgClassName,
}: {
  partner: Partner
  className?: string
  imgClassName?: string
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
      className={cn('max-h-10 w-auto max-w-full object-contain', imgClassName)}
    />
  )
}
