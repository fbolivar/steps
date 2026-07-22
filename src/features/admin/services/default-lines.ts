/**
 * Catálogo de líneas de producto por defecto para el onboarding de un nuevo
 * tenant. Un tenant nuevo arranca con este catálogo y luego su tenant_admin
 * lo ajusta (activar/desactivar/editar) sin desplegar código.
 */
export type SeedLine = {
  slug: string
  segment: 'personas' | 'empresas'
  name: string
  short_description: string
  sort_order: number
}

export const DEFAULT_LINES: SeedLine[] = [
  { slug: 'vida', segment: 'personas', name: 'Vida', short_description: 'Protección económica para tu familia ante lo inesperado.', sort_order: 1 },
  { slug: 'salud', segment: 'personas', name: 'Salud', short_description: 'Atención médica y hospitalaria cuando más importa.', sort_order: 2 },
  { slug: 'hogar', segment: 'personas', name: 'Hogar', short_description: 'Tu vivienda y tu contenido, protegidos.', sort_order: 3 },
  { slug: 'auto', segment: 'personas', name: 'Auto', short_description: 'Cobertura integral para tu vehículo.', sort_order: 4 },
  { slug: 'rc-personas', segment: 'personas', name: 'Responsabilidad Civil', short_description: 'Respaldo ante daños a terceros.', sort_order: 5 },
  { slug: 'viaje', segment: 'personas', name: 'Viaje', short_description: 'Asistencia y cobertura dentro y fuera del país.', sort_order: 6 },
  { slug: 'exequias', segment: 'personas', name: 'Exequias', short_description: 'Servicio exequial para toda la familia.', sort_order: 7 },
  { slug: 'mascotas', segment: 'personas', name: 'Mascotas', short_description: 'Salud y responsabilidad para tu mascota.', sort_order: 8 },
  { slug: 'vida-empresarial', segment: 'empresas', name: 'Vida empresarial', short_description: 'Vida grupo para colaboradores.', sort_order: 1 },
  { slug: 'salud-colectiva', segment: 'empresas', name: 'Salud colectiva', short_description: 'Planes de salud para tu equipo.', sort_order: 2 },
  { slug: 'ciberseguridad', segment: 'empresas', name: 'Ciberseguridad', short_description: 'Protección ante incidentes cibernéticos.', sort_order: 3 },
  { slug: 'rc-empresas', segment: 'empresas', name: 'Responsabilidad civil', short_description: 'RC empresarial ante terceros.', sort_order: 4 },
  { slug: 'propiedad', segment: 'empresas', name: 'Propiedad', short_description: 'Inmuebles, contenido y lucro cesante.', sort_order: 5 },
  { slug: 'transportes', segment: 'empresas', name: 'Transportes', short_description: 'Mercancía en tránsito nacional e internacional.', sort_order: 6 },
  { slug: 'cumplimiento-fianzas', segment: 'empresas', name: 'Cumplimiento y fianzas', short_description: 'Garantías y fianzas contractuales.', sort_order: 7 },
]
