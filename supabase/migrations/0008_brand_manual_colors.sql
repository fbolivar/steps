-- ============================================================================
-- STEPS SEGUROS · Paleta oficial del Manual de Identidad
-- Migración 0008
--
-- El manual define cuatro colores:
--   Azul profundo  #000831  (principal)
--   Cobalt blue    #2F5AA6  (complementario)
--   Gris azulado   #D3DDDD  (principal secundario)
--   Blanco puro    #FFFFFF  (complementario)
--
-- La app mapea: color_primary = azul profundo, color_secondary/accent = cobalt.
-- El gris azulado es un neutro de plataforma y vive en el CSS, no en la tabla.
-- ============================================================================

update public.tenants
set color_primary   = '#000831',
    color_secondary = '#2F5AA6',
    color_accent    = '#2F5AA6'
where slug = 'steps';

-- Nuevos tenants de marca blanca arrancan con la paleta STEPS por defecto.
alter table public.tenants
  alter column color_primary   set default '#000831',
  alter column color_secondary set default '#2F5AA6',
  alter column color_accent    set default '#2F5AA6';
