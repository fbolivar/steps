-- ============================================================================
-- STEPS SEGUROS · Nueva línea de producto "Salud internacional"
-- Migración 0011
--
-- Se ubica justo después de "Salud" en el catálogo de personas, así que las
-- líneas siguientes corren una posición. Los huecos que queden en la
-- numeración no importan: solo cuenta el orden relativo.
-- ============================================================================

-- 1. Hacer sitio: todo lo que iba en la posición 3 o más baja un puesto.
update public.insurance_lines
set sort_order = sort_order + 1
where tenant_id = (select id from public.tenants where slug = 'steps')
  and segment = 'personas'
  and sort_order >= 3;

-- 2. Insertar la línea. Idempotente: si ya existe, solo refresca nombre y orden.
insert into public.insurance_lines (tenant_id, slug, segment, name, short_description, sort_order)
select t.id, 'salud-internacional', 'personas'::public.insurance_segment,
       'Salud internacional',
       'Cobertura médica con alcance global para ti y tu familia.',
       3
from public.tenants t
where t.slug = 'steps'
on conflict (tenant_id, slug) do update
  set name = excluded.name,
      short_description = excluded.short_description,
      sort_order = excluded.sort_order;
