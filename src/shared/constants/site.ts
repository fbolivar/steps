/** Navegación principal del sitio informativo. */
export const NAV_LINKS = [
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/seguros/personas', label: 'Personas' },
  { href: '/seguros/empresas', label: 'Empresas' },
  { href: '/aliados', label: 'Aliados' },
  { href: '/contacto', label: 'Contacto' },
] as const

/** Aseguradoras y aliados que representa STEPS (sección 1 del brief). */
/**
 * Aseguradoras aliadas.
 *
 * `logo` es el archivo dentro de `/public/logos` CON extensión. Si se omite —o
 * si el archivo no carga— la tarjeta muestra el nombre en texto, así el
 * listado nunca se ve roto. Publicar un logotipo es dejar el archivo y
 * apuntarlo aquí. Ver `public/logos/README.md`.
 */
export type Partner = {
  name: string
  logo?: string
  /**
   * Proporcion ancho/alto del archivo. La usa <PartnerLogo/> para igualar el
   * area visual entre logos compactos y alargados. Se mide con:
   *   node -e "..." | o revisa public/logos/README.md
   */
  ratio?: number
}

export const PARTNERS: readonly Partner[] = [
  { name: 'Seguros Bolívar', logo: 'seguros-bolivar.png', ratio: 3.42 },
  { name: 'HDI', logo: 'hdi.svg', ratio: 1.47 },
  { name: 'Sura', logo: 'sura.svg', ratio: 2.9 },
  { name: 'Zurich', logo: 'zurich.svg', ratio: 4.12 },
  { name: 'AXA Colpatria', logo: 'axa-colpatria.png', ratio: 1.98 },
  { name: 'Liberty', logo: 'liberty.png', ratio: 2.0 },
  { name: 'Seguros del Estado', logo: 'seguros-del-estado.png', ratio: 3.63 },
  { name: 'Seguros Mundial', logo: 'seguros-mundial.png', ratio: 4.39 },
  { name: 'Aseguradora Solidaria', logo: 'aseguradora-solidaria.svg', ratio: 3.2 },
  { name: 'Cesce', logo: 'cesce.svg', ratio: 2.63 },
  { name: 'SBS', logo: 'sbs.png', ratio: 2.91 },
  { name: 'Afiancol', logo: 'afiancol.png', ratio: 2.98 },
  { name: 'Equidad', logo: 'equidad.png', ratio: 2.79 },
  { name: 'Mapfre', logo: 'mapfre.png', ratio: 6.62 },
  { name: 'Confianza', logo: 'confianza.png', ratio: 3.21 },
  { name: 'Previsora', logo: 'previsora.png', ratio: 5.94 },
  { name: 'Seguros GranColombia', logo: 'grancolombia.png', ratio: 4.74 },
  { name: 'Colmédica', logo: 'colmedica.png', ratio: 5.48 },
  { name: 'Qualitas Assistance', logo: 'qualitas-assistance.png', ratio: 2.39 },
  { name: 'BMI', logo: 'bmi.png', ratio: 2.52 },
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

/**
 * Testimonios. OJO: son textos GENÉRICOS de ejemplo, no citas reales de
 * clientes. Sirven para que la sección no quede vacía mientras se recogen
 * testimonios verdaderos; conviene reemplazarlos antes de una campaña.
 * Por eso los autores son perfiles ("Cliente · Seguro de auto"), no personas
 * con nombre y apellido.
 */
export type Testimonial = { quote: string; author: string; role: string }

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      'Cuando tuve la emergencia, su equipo me acompañó en todo el proceso del reclamo: rápidos, claros y muy humanos.',
    author: 'Cliente',
    role: 'Seguro de salud',
  },
  {
    quote:
      'Me explicaron qué cubría y qué no cubría la póliza antes de firmar. Es la primera vez que entiendo lo que estoy contratando.',
    author: 'Cliente',
    role: 'Seguro de vida',
  },
  {
    quote:
      'Compararon varias aseguradoras y me mostraron las diferencias sin presionarme. Terminé pagando menos por mejor cobertura.',
    author: 'Cliente',
    role: 'Seguro de auto',
  },
  {
    quote:
      'Tuve un siniestro en el apartamento un domingo y aun así me respondieron. Saber que hay alguien al otro lado cambia todo.',
    author: 'Cliente',
    role: 'Seguro de hogar',
  },
  {
    quote:
      'Nos armaron el programa de seguros de la empresa por líneas y con un solo interlocutor. Nos ahorró muchísimo tiempo de gestión.',
    author: 'Cliente empresarial',
    role: 'Seguros corporativos',
  },
  {
    quote:
      'Renovar dejó de ser un dolor de cabeza: me avisan con tiempo y me llega la comparación lista para decidir.',
    author: 'Cliente',
    role: 'Renovación de póliza',
  },
  {
    quote:
      'Buscábamos cubrir a nuestra base social y nos propusieron una solución hecha a la medida de la cooperativa.',
    author: 'Cliente institucional',
    role: 'Cooperativas',
  },
] as const

// Blog — entradas de ejemplo (reemplazables por CMS).
export const BLOG_POSTS = [
  { title: '10 consejos esenciales de seguros que deberías conocer', date: 'Mar 9, 2026', tag: 'Guías' },
  { title: 'Cómo elegir el plan de seguros correcto para tus necesidades', date: 'Mar 9, 2026', tag: 'Consejos' },
  { title: 'Los mitos más grandes sobre los seguros, desmentidos', date: 'Mar 9, 2026', tag: 'Educación' },
] as const
