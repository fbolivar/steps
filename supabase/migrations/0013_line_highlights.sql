-- ============================================================================
-- STEPS SEGUROS · "Resumen del ramo" por línea de producto
-- Migración 0013
--
-- Hasta ahora la página de cada producto solo mostraba los beneficios de la
-- agencia, iguales para todo el segmento: nada decía qué cubre ESE ramo.
-- `highlights` guarda esos puntos en un arreglo (no en texto corrido) para
-- poder listarlos.
-- ============================================================================

alter table public.insurance_lines
  add column if not exists highlights text[] not null default '{}';

comment on column public.insurance_lines.highlights is
  'Resumen del ramo: qué cubre o para qué sirve esta línea, en frases cortas.';

-- Primer ramo con resumen: Gestión patrimonial – BMI (texto del cliente).
update public.insurance_lines
set highlights = array[
  'Protección financiera para tu familia',
  'Planificación para la educación y el futuro',
  'Seguridad financiera para tu jubilación',
  'Estrategia de inversión en el mercado bursátil',
  'Planes corporativos y optimización tributaria'
]
where slug = 'gestion-patrimonial'
  and tenant_id = (select id from public.tenants where slug = 'steps');
