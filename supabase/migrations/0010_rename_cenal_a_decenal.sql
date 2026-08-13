-- ============================================================================
-- STEPS SEGUROS · Corregir el nombre de la línea "CENAL" → "Decenal"
-- Migración 0010
--
-- La migración 0002 la sembró como "CENAL" (erratum). Se corrige el nombre
-- visible y también el slug, para que la URL del producto no siga siendo
-- /seguros/empresas/cenal. No había cotizaciones asociadas.
-- ============================================================================

update public.insurance_lines
set slug = 'decenal',
    name = 'Decenal'
where slug = 'cenal'
  and tenant_id = (select id from public.tenants where slug = 'steps');
