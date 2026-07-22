/** Navegación principal del sitio informativo. */
export const NAV_LINKS = [
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/seguros/personas', label: 'Personas' },
  { href: '/seguros/empresas', label: 'Empresas' },
  { href: '/aliados', label: 'Aliados' },
  { href: '/contacto', label: 'Contacto' },
] as const

/** Aseguradoras y aliados que representa STEPS (sección 1 del brief). */
export const PARTNERS = [
  'Seguros Bolívar',
  'HDI',
  'Sura',
  'Zurich',
  'AXA Colpatria',
  'Liberty',
  'Chubb',
  'Positiva',
  'Seguros del Estado',
  'Seguros Mundial',
  'Aseguradora Solidaria',
  'Colmena',
  'Cesce',
  'SBS',
  'Continental Assist',
  'Assist Card',
  'Afiancol',
  'Cuídate',
] as const

/** Propuesta de valor / textos institucionales (reescritos, tono directo). */
export const COMPANY = {
  tagline: 'Tranquilidad y protección con soluciones de seguros a tu medida.',
  mision:
    'Brindar tranquilidad y protección a personas, familias y empresas a través ' +
    'de soluciones de seguros personalizadas, con asesoría transparente y ' +
    'acompañamiento en cada etapa.',
  vision:
    'Ser la agencia de seguros de referencia en Colombia por la calidad de su ' +
    'asesoría, la solidez de sus aliados y la confianza de quienes protege.',
  filosofia: [
    {
      title: 'Transparencia',
      body: 'Te explicamos con claridad qué cubre y qué no cubre cada póliza, sin letra menuda.',
    },
    {
      title: 'Compromiso',
      body: 'Acompañamos el proceso completo: desde la cotización hasta el momento del siniestro.',
    },
    {
      title: 'Servicio excepcional',
      body: 'Un asesor real, disponible por los canales que prefieras, no un formulario sin respuesta.',
    },
  ],
} as const

export const SEGMENTS = {
  personas: {
    slug: 'personas',
    title: 'Seguros para personas y familias',
    subtitle: 'Protege lo que más importa: tu vida, tu salud, tu hogar y tu tranquilidad.',
  },
  empresas: {
    slug: 'empresas',
    title: 'Seguros para empresas y cooperativas',
    subtitle: 'Gestión integral de riesgos para tu operación, tu equipo y tu patrimonio.',
  },
} as const

export type SegmentSlug = keyof typeof SEGMENTS

// --- Contenido placeholder (reemplazable por el cliente / CMS-lite) ---

export const ABOUT_BULLETS = [
  'Protección integral y a tu medida',
  'Planes personalizables por línea',
  'Atención de siniestros y soporte experto',
] as const

export const TRUST_STATS = [
  { value: '15+', label: 'Aseguradoras aliadas' },
  { value: '30+', label: 'Líneas de producto' },
  { value: '1 a 1', label: 'Asesoría personal' },
] as const

export const PROCESS_STEPS = [
  { title: 'Cotiza', body: 'Cuéntanos qué necesitas asegurar en un formulario simple.' },
  { title: 'Personaliza', body: 'Un asesor compara aseguradoras y arma tu mejor opción.' },
  { title: 'Protégete', body: 'Emitimos tu póliza y te acompañamos ante cualquier siniestro.' },
] as const

// Equipo — fotos y datos reales los aporta el cliente.
export const TEAM = [
  { name: 'Paula Moreno', role: 'Asesora líder' },
  { name: 'Asesor 2', role: 'Seguros de personas' },
  { name: 'Asesor 3', role: 'Seguros empresariales' },
  { name: 'Asesor 4', role: 'Siniestros y soporte' },
] as const

export const TESTIMONIAL = {
  quote:
    'No pude estar más tranquila con STEPS. Cuando tuve una emergencia, su equipo me acompañó en todo el proceso del reclamo: rápidos, profesionales y muy humanos.',
  author: 'Cliente satisfecha',
  role: 'Seguro de salud',
} as const

// Blog — entradas de ejemplo (reemplazables por CMS).
export const BLOG_POSTS = [
  { title: '10 consejos esenciales de seguros que deberías conocer', date: 'Mar 9, 2026', tag: 'Guías' },
  { title: 'Cómo elegir el plan de seguros correcto para tus necesidades', date: 'Mar 9, 2026', tag: 'Consejos' },
  { title: 'Los mitos más grandes sobre los seguros, desmentidos', date: 'Mar 9, 2026', tag: 'Educación' },
] as const
