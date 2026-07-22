/**
 * Fotos TEMPORALES temáticas de seguros (Unsplash, royalty-free). Verificadas
 * (HTTP 200 image/jpeg). Son marcadores reales para ver el diseño con foto de
 * contexto; el cliente las reemplaza por sus imágenes.
 */

// IDs de Unsplash verificados, agrupados por tema.
const ID = {
  family1: '1511895426328-dc8714191300',
  family2: '1476234251651-f353703a034d',
  family3: '1609220136736-443140cffec6',
  handshake: '1521791136064-7986c2920216',
  advisor: '1600880292203-757bb62b4baf',
  businesswoman: '1573496359142-b8d87734a5a2',
  elderly: '1447069387593-a5de0862481e',
  car: '1503376780353-7e6692767b70',
  health: '1576091160399-112ba8d25d1d',
  house: '1560518883-ce09059eeffa',
  team: '1522071820081-009f0129c71c',
  office: '1556761175-b413da4baf72',
  p_man: '1500648767791-00dcc994a43e',
  p_woman: '1494790108377-be9c29b29330',
  p_man2: '1507003211169-0a1dd7228f2d',
  p_woman2: '1438761681033-6461ffad8d80',
} as const

function unsplash(id: string, w: number, h: number): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=70`
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Tema por línea de seguro (slug → id). Default: asesoría.
const LINE_THEME: Record<string, string> = {
  auto: ID.car,
  'vehiculos-comerciales': ID.car,
  salud: ID.health,
  'salud-colectiva': ID.health,
  hogar: ID.house,
  propiedad: ID.house,
  vida: ID.family1,
  'vida-empresarial': ID.family3,
  exequias: ID.family2,
  'exequias-empresas': ID.family2,
  educativo: ID.family2,
  mascotas: ID.family1,
  viaje: ID.family3,
  'rc-personas': ID.handshake,
  'rc-empresas': ID.office,
  ciberseguridad: ID.office,
  transportes: ID.car,
}

const PORTRAITS = [ID.p_man, ID.p_woman, ID.p_man2, ID.p_woman2]
const BLOG_IMGS = [ID.office, ID.advisor, ID.health]

/**
 * Devuelve una foto temática por clave. Enruta por:
 *  - slug de línea de seguro (auto, salud, …)
 *  - 'team-…'  → retrato
 *  - 'blog-…'  → imagen editorial
 *  - resto     → asesoría (default)
 */
export function photo(key: string, w = 1200, h = 800): string {
  if (LINE_THEME[key]) return unsplash(LINE_THEME[key], w, h)
  if (key.startsWith('team-')) return unsplash(PORTRAITS[hash(key) % PORTRAITS.length], w, h)
  if (key.startsWith('blog-')) return unsplash(BLOG_IMGS[hash(key) % BLOG_IMGS.length], w, h)
  return unsplash(ID.advisor, w, h)
}

// Slots con nombre (heros, bandas, etc.).
export const PHOTO = {
  hero: unsplash(ID.family1, 1600, 900),
  about: unsplash(ID.family2, 900, 700),
  advisory: unsplash(ID.advisor, 900, 700),
  ctaBand: unsplash(ID.elderly, 1600, 700),
  finalCta: unsplash(ID.family3, 900, 700),
  contact: unsplash(ID.office, 1600, 700),
  personas: unsplash(ID.family2, 1600, 700),
  empresas: unsplash(ID.team, 1600, 700),
  nosotros: unsplash(ID.handshake, 1600, 700),
  aliados: unsplash(ID.office, 1600, 700),
} as const
