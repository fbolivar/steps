import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Une clases de Tailwind resolviendo conflictos (patrón shadcn/ui). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Construye un enlace de WhatsApp con mensaje prellenado. */
export function whatsappLink(number: string | null | undefined, message: string): string | null {
  if (!number) return null
  const clean = number.replace(/[^\d]/g, '')
  if (!clean) return null
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}
