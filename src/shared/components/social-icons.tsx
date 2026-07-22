/**
 * Íconos sociales (SVG inline, currentColor). lucide-react retiró los íconos de
 * marca en versiones recientes, así que los definimos aquí.
 */
type Props = { className?: string }

export function FacebookIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-8h2.6l.4-3h-3V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.8v8h2.7z" />
    </svg>
  )
}

export function InstagramIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function LinkedinIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4.98 3.5a2 2 0 100 4 2 2 0 000-4zM3.5 9h3v11h-3V9zm5 0h2.9v1.5h.04c.4-.76 1.4-1.56 2.86-1.56 3.06 0 3.6 2 3.6 4.6V20h-3v-4.9c0-1.17-.02-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.58V20h-3V9z" />
    </svg>
  )
}

export function SocialRow({ className, iconClass = 'h-4 w-4' }: { className?: string; iconClass?: string }) {
  return (
    <div className={className}>
      <FacebookIcon className={iconClass} />
      <InstagramIcon className={iconClass} />
      <LinkedinIcon className={iconClass} />
    </div>
  )
}
