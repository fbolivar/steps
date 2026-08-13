-- ============================================================================
-- STEPS SEGUROS · Nueva línea de producto "Gestión patrimonial – BMI"
-- Migración 0012
--
-- Se ubica al final del catálogo de personas para no reordenar el resto.
-- Es la única línea cuyo nombre incluye a la aseguradora, tal como la pidió
-- el cliente; el resto del catálogo es agnóstico de compañía.
-- ============================================================================

insert into public.insurance_lines (tenant_id, slug, segment, name, short_description, sort_order)
select t.id, 'gestion-patrimonial', 'personas'::public.insurance_segment,
       'Gestión patrimonial – BMI',
       'Ahorro, protección y planeación del patrimonio familiar.',
       14
from public.tenants t
where t.slug = 'steps'
on conflict (tenant_id, slug) do update
  set name = excluded.name,
      short_description = excluded.short_description,
      sort_order = excluded.sort_order;
