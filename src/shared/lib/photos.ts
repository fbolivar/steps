/**
 * Fotos TEMPORALES temáticas de seguros, servidas LOCALMENTE desde /public/img
 * (descargadas de Unsplash). Al ser del mismo origen: cargan siempre (sin
 * throttling de terceros) y cumplen la CSP. El cliente las reemplaza por las
 * suyas dejando los mismos nombres de archivo en /public/img.
 */

// Claves de archivo disponibles en /public/img (<clave>.jpg).
const FILES = {
  family1: 'family1',
  family2: 'family2',
  family3: 'family3',
  handshake: 'handshake',
  advisor: 'advisor',
  businesswoman: 'businesswoman',
  elderly: 'elderly',
  car: 'car',
  health: 'health',
  house: 'house',
  team: 'team',
  office: 'office',
  p_man: 'p_man',
  p_woman: 'p_woman',
  p_man2: 'p_man2',
  p_woman2: 'p_woman2',
} as const

function img(key: keyof typeof FILES): string {
  return `/img/${FILES[key]}.jpg`
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Tema por línea de seguro (slug → archivo). Default: asesoría.
const LINE_THEME: Record<string, keyof typeof FILES> = {
  auto: 'car',
  'vehiculos-comerciales': 'car',
  salud: 'health',
  'salud-internacional': 'health',
  'salud-colectiva': 'health',
  hogar: 'house',
  propiedad: 'house',
  vida: 'family1',
  'vida-empresarial': 'family3',
  exequias: 'family2',
  'exequias-empresas': 'family2',
  educativo: 'family2',
  mascotas: 'family1',
  viaje: 'family3',
  'rc-personas': 'handshake',
  'rc-empresas': 'office',
  ciberseguridad: 'office',
  transportes: 'car',
}

const PORTRAITS: (keyof typeof FILES)[] = ['p_man', 'p_woman', 'p_man2', 'p_woman2']
const BLOG_IMGS: (keyof typeof FILES)[] = ['office', 'advisor', 'health']

/**
 * Devuelve una foto temática por clave. Enruta por:
 *  - slug de línea de seguro (auto, salud, …)
 *  - 'team-…'  → retrato
 *  - 'blog-…'  → imagen editorial
 *  - resto     → asesoría (default)
 * (los parámetros w/h se conservan por compatibilidad; el archivo es local.)
 */
export function photo(key: string, _w = 1200, _h = 800): string {
  if (LINE_THEME[key]) return img(LINE_THEME[key])
  if (key.startsWith('team-')) return img(PORTRAITS[hash(key) % PORTRAITS.length])
  if (key.startsWith('blog-')) return img(BLOG_IMGS[hash(key) % BLOG_IMGS.length])
  return img('advisor')
}

// Slots con nombre (heros, bandas, etc.).
export const PHOTO = {
  hero: img('family1'),
  about: img('family2'),
  advisory: img('advisor'),
  ctaBand: img('elderly'),
  finalCta: img('family3'),
  contact: img('office'),
  personas: img('family2'),
  empresas: img('team'),
  nosotros: img('handshake'),
  aliados: img('office'),
} as const
