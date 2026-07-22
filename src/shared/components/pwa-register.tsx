'use client'

import { useEffect } from 'react'

/** Registra el service worker (habilita instalación como app en móvil). */
export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])
  return null
}
