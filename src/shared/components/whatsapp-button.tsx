import { MessageCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { whatsappLink } from '@/shared/lib/utils'

/**
 * CTA "Hablar por WhatsApp". Si el tenant no tiene número configurado, cae a
 * la página de contacto (nunca deja un enlace roto).
 */
export function WhatsAppButton({
  number,
  message = 'Hola, quiero información sobre sus seguros.',
  label = 'Hablar por WhatsApp',
  className,
  variant = 'accent',
}: {
  number: string | null | undefined
  message?: string
  label?: string
  className?: string
  variant?: 'accent' | 'primary' | 'outline'
}) {
  const href = whatsappLink(number, message) ?? '/contacto'
  const external = href.startsWith('http')
  const btnClass =
    variant === 'accent' ? 'btn-accent' : variant === 'primary' ? 'btn-primary' : 'btn-outline'

  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(btnClass, className)}
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  )
}
