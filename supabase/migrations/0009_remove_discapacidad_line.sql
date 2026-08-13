-- ============================================================================
-- STEPS SEGUROS · Retirar la línea de producto "Discapacidad"
-- Migración 0009
--
-- La línea la sembró la migración 0002. Se elimina aquí en vez de editar aquel
-- seed para no reescribir una migración ya aplicada: al recrear la BD desde
-- cero, 0002 la inserta y esta la retira, con el mismo resultado final.
--
-- Al momento de aplicarla no existían cotizaciones asociadas. La FK de
-- quote_requests es `on delete set null`, así que aunque llegaran a existir,
-- ninguna solicitud se perdería (solo quedaría sin línea asociada).
-- ============================================================================

delete from public.insurance_lines
where slug = 'discapacidad'
  and tenant_id = (select id from public.tenants where slug = 'steps');
